//RealTimeDataSource based on cycle and reuse
//Philipp Fleck, ICG @ TuGraz, philipp.fleck@icg.tugraz.at
//20210430, initial working version

using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace IATK
{
    public class RealtimeDataSource : DataSource
    {
        /* 
        The max amount of data that can be displayed at a single time,
        will loop back around (replacing older data) when it goes over this limit
        */ 
        private int dimensionSizeLimit = 100;
        private List<int> dimensionPointers = new List<int>();

        private bool isQuitting;

        private List<DimensionData> dimensionData = new List<DimensionData>();
        
        private Dictionary<string, Dictionary<int, string>> textualDimensionsList = new Dictionary<string, Dictionary<int, string>>();
        private Dictionary<string, Dictionary<string, int>> textualDimensionsListReverse = new Dictionary<string, Dictionary<string, int>>();
        private Dictionary<string, string[]> textualDimensions = new Dictionary<string, string[]>();

        private float[] GetDefaultArray()
        {
            var dataArray = new float[dimensionSizeLimit];
            for (int i = 0; i < dimensionSizeLimit; i++)
            {
                dataArray[i] = 0;
            }
            return dataArray;
        }

        public bool shiftdata = false;

        /// <summary>
        /// Creates a dimension that can later have data set to it
        /// </summary>
        /// <param name="dimensionName">Sets the dimension name, used to identify the dimension (Must be unique).</param>
        /// <param name="numberOfCategories">The data type of categories (unique values) in the data</param>
        /// <param name="type">The data type of the dimension</param>
        /// <returns>True if successfully added, false otherwise</returns>
        public bool AddDimension(string dimensionName, float numberOfCategories, DataType type = DataType.String)
        {
            return AddDimension(dimensionName, 0, numberOfCategories - 1f, type);
        }

        public bool AddStringDimension(string dimensionName)
        {
            return AddDimension(dimensionName, 0, dimensionSizeLimit, DataType.String);
        }

        public bool SetDimensionMinMax(string dimensionName, float min, float max)
        {
            if (textualDimensions.ContainsKey(dimensionName))
            {
                var dd = this[dimensionName];
                var meta = dd.MetaData;
                meta.minValue = min;
                meta.maxValue = max;
                dd.setMetadata(meta);
                return true;
            }
            return false;
        }

        public bool SetDimensionSizeLimit(int newLimit)
        {
            if(dimensionPointers.Count > 0) // Do not allow resize if data is already present
            {
                return false;
			}

            dimensionSizeLimit = newLimit;
            return true;
		}

        public void setShiftData(bool newValue)
        {
            shiftdata = newValue;
		}

        public bool getShiftData()
        {
            return shiftdata;
		}

        /// <summary>
        /// Creates a dimension that can later have data set to it
        /// </summary>
        /// <param name="dimensionName">Sets the dimension name, used to identify the dimension (Must be unique).</param>
        /// <param name="minVal">The minimum value the dimension can hold</param>
        /// <param name="maxVal">The maximum value the dimension can hold</param>
        /// <param name="type">The data type of the dimension</param>
        /// <returns>True if successfully added, false otherwise</returns>f
        public bool AddDimension(string dimensionName, float minVal, float maxVal, DataType type = DataType.Float)
        {
            // Don't add the dimension if it already exists
            if (textualDimensions.ContainsKey(dimensionName)) return false;

            var metaData = new DimensionData.Metadata();
            metaData.minValue = minVal;
            metaData.maxValue = maxVal;
            metaData.type = type;

            int index = dimensionData.Count;

            var textDim = new string[dimensionSizeLimit];
            for(int i = 0; i < dimensionSizeLimit; i++)
            {
                textDim[i] = "";
            }
            textualDimensions.Add(dimensionName, textDim);

            var dd = new DimensionData(dimensionName, index, metaData);
            dd.setData(GetDefaultArray(), null);
            
            dimensionData.Add(dd);
            dimensionPointers.Add(0);

            //Debug.Log("RTDS AddDimension => " + dd.Identifier + ", " + dd.Index);
            return true;
        }

        /// <summary>
        /// Sets a data value by index
        /// </summary>
        /// <param name="index">Index of dimension</param>
        /// <param name="val">Value to set the dimension</param>
        /// <returns>True if successfully set, false otherwise</returns>
        public bool SetData(int index, float val)
        {
            return SetData(this[index].Identifier, val);
        }


        /// <summary>
        /// This is important otherwise the overloading can NOT be resolved from outside (eg JS)
        /// </summary>
        /// <param name="dimensionName"></param>
        /// <param name="val"></param>
        /// <returns></returns>
        public bool SetDataStrVal(string dimensionName, float val)
        {
            //Debug.Log("RTDS SetDataStrVal => " + dimensionName + ", " + val);
            return SetData(dimensionName, val);
        }


        public bool SetDataStrStrById(string dimensionName, string val, int id)
        {
            bool dbg_on = false;
            if(dimensionName == "year")
            {
                dbg_on = true;
                Debug.Log("SetDataStrStrById => " + dimensionName + ", " + val + ", " + id);
            }

            try
            {
                if(!textualDimensions.ContainsKey(dimensionName))
                {
                    return false;
                }
                textualDimensions[dimensionName][id] = val;
                float idx = (float)id;
                //return SetDataStrValById(dimensionName, idx, id);

                if (dbg_on)
                {
                    Debug.Log("SetDataStrStrById idx => " + idx);
                }

                try
                {
                    float val2 = idx;
                    var dd = this[dimensionName];

                    
                    //this is needed since we do not know the data
                    //auto scale start
                    bool dirty = false;
                    var minV = dd.MetaData.minValue;
                    var maxV = dd.MetaData.maxValue;


                    if (dbg_on)
                    {
                        Debug.Log("SetDataStrStrById val2 => " + val2 + ", minV => " + minV + ", maxV => " + maxV);
                    }


                    if (dd.MetaData.minValue > val2)
                    {
                        minV = (float)Math.Floor(val2);
                        dirty = true;
                    }

                    if (dd.MetaData.maxValue < val2)
                    {
                        maxV = (float)Math.Ceiling(val2);
                        dirty = true;
                    }

                    

                    if (dbg_on)
                    {
                        Debug.Log("SetDataStrStrById val2 => " + val2 + ", minV => " + minV + ", maxV => " + maxV);
                        Debug.Log("SetDataStrStrById dirty => " + dirty);
                    }

                    if (dirty)
                    {
                        var metaData = new DimensionData.Metadata();
                        metaData.minValue = minV;
                        metaData.maxValue = maxV;
                        metaData.type = dd.MetaData.type;
                        dd.setMetadata(metaData);
                    }
                    //autoscale stop

                    //this is going to cut off values and not doind auto normalization for unknown data
                    if (dd != null && dd.MetaData.minValue <= val2 && dd.MetaData.maxValue >= val2 && dd.Data.Length > 0)
                    {
                        //SetDimensionData(dd, normaliseValue(val, dd.MetaData.minValue, dd.MetaData.maxValue, 0f, 1f));

                        var nv = normaliseValue(val2, dd.MetaData.minValue, dd.MetaData.maxValue, 0f, 1f);
                        dd.Data[id] = nv;
                        //dd.Data[id] = val2;


                        if (dbg_on)
                        {
                            Debug.Log("SetDataStrStrById nv => " + nv);
                        }

                        return true;
                    }
                }
                catch (Exception e)
                {
                    Debug.Log("SetDataStrValById ERROR => " + e);
                }

                return false;

            }
            catch (Exception e)
            {
                Debug.Log("SetDataStrStrById ERROR => " + e);
            }
            return false;
        }

        public bool SetDataStrValById(string dimensionName, float val, int id)
        {
            //Debug.Log("RTDS SetData => " + dimensionName + ", " + val);
            try
            {
                var dd = this[dimensionName];

                //this is needed since we do not know the data
                //auto scale start
                bool dirty = false;
                var minV = dd.MetaData.minValue;
                var maxV = dd.MetaData.minValue;
                if (dd.MetaData.minValue > val)
                {
                    minV = (float)Math.Floor(val);
                    dirty = true;
                }

                if (dd.MetaData.maxValue < val)
                {
                    maxV = (float)Math.Ceiling(val);
                    dirty = true;
                }

                if (dirty)
                {
                    //Debug.Log("SetData updating min max => " + minV + ", " + maxV);
                    var metaData = new DimensionData.Metadata();
                    metaData.minValue = minV;
                    metaData.maxValue = maxV;
                    //metaData.type = DataType.Float; //maybe make that adjustable
                    metaData.type = dd.MetaData.type;
                    dd.setMetadata(metaData);
                }
                //autoscale stop

                //this is going to cut off values and not doind auto normalization for unknown data
                if (dd != null && dd.MetaData.minValue <= val && dd.MetaData.maxValue >= val && dd.Data.Length > 0)
                {
                    //SetDimensionData(dd, normaliseValue(val, dd.MetaData.minValue, dd.MetaData.maxValue, 0f, 1f));

                    var nv = normaliseValue(val, dd.MetaData.minValue, dd.MetaData.maxValue, 0f, 1f);
                    if (dd.Data.Length > id)
                    {
                        dd.Data[id] = nv;
                    } else
                    {
                        dd.Data.Append<float>(id);
                    }

                    return true;
                }
            }
            catch (Exception e)
            {
                Debug.Log("SetDataStrValById ERROR => " + e);
            }

            return false;
        }

        /// <summary>
        /// This is important otherwise the overloading can NOT be resolved from outside (eg JS)
        /// </summary>
        /// <param name="dimensionName"></param>
        /// <param name="val"></param>
        /// <returns></returns>
        public bool SetDataStrStr(string dimensionName, string val)
        {
            return SetData(dimensionName, val);
        }

        /// <summary>
        /// Sets a data value by dimension name (identifier)
        /// </summary>
        /// <param name="index">Name of dimension</param>
        /// <param name="val">Value to set the dimension</param>
        /// <returns>True if successfully set, false otherwise</returns>
        public bool SetData(string dimensionName, float val)
        {
            //Debug.Log("RTDS SetData => " + dimensionName + ", " + val);
            try
            {
                var dd = this[dimensionName];

                //this is needed since we do not know the data
                //auto scale start
                bool dirty = false;
                var minV = dd.MetaData.minValue;
                var maxV = dd.MetaData.minValue;
                if (dd.MetaData.minValue > val)
                {
                    minV = (float)Math.Floor(val);
                    dirty = true;
                }

                if (dd.MetaData.maxValue < val)
                {
                    maxV = (float)Math.Ceiling(val);
                    dirty = true;
                }

                if (dirty)
                {
                    //Debug.Log("SetData updating min max => " + minV + ", " + maxV);
                    var metaData = new DimensionData.Metadata();
                    metaData.minValue = minV;
                    metaData.maxValue = maxV;
                    //metaData.type = DataType.Float; //maybe make that adjustable
                    metaData.type = dd.MetaData.type;
                    dd.setMetadata(metaData);
                }
                //autoscale stop

                //this is going to cut off values and not doind auto normalization for unknown data
                if (dd != null && dd.MetaData.minValue <= val && dd.MetaData.maxValue >= val && dd.Data.Length > 0)
                {
                    SetDimensionData(dd, normaliseValue(val, dd.MetaData.minValue, dd.MetaData.maxValue, 0f, 1f));
                    return true;
                }
            }
            catch (Exception e)
            {
                Debug.Log("SetData ERROR => " + e);
            }

            return false;
        }

        /// <summary>
        /// Sets a data value by index
        /// </summary>
        /// <param name="index">Index of dimension</param>
        /// <param name="val">Value to set the dimension</param>
        /// <returns>True if successfully set, false otherwise</returns>
        public bool SetData(int index, string val)
        {
            return SetData(this[index].Identifier, val);
        }

        /// <summary>
        /// Sets a data value by dimension name (identifier)
        /// </summary>
        /// <param name="index">Name of dimension</param>
        /// <param name="val">Value to set the dimension</param>
        /// <returns>True if successfully set, false otherwise</returns>
        public bool SetData(string dimensionName, string val)
        {
            try
            {
                var textDim = textualDimensions[dimensionName];
                int ptr = dimensionPointers[this[dimensionName].Index];

                if(!shiftdata)
                {
                    textDim[ptr] = val;
                }
                else
                {
                    ptr = dimensionSizeLimit - 1;
                    for (var i = 1; i < dimensionSizeLimit; i++)
                    {
                        textDim[i - 1] = textDim[i];
                    }
                    textDim[ptr] = val;
                }

                return SetData(dimensionName, ptr);
            }
            catch (Exception e)
            {
                Debug.Log("SetData ERROR => " + e);
            }

            return false;
        }

        /// <summary>
        /// Sets a data value to a dimension
        /// </summary>
        /// <param name="dd">The data dimension to put the data in</param>
        /// <param name="val">The data that is to be set</param>
        private void SetDimensionData(DimensionData dd, float val)
        {
            if (!shiftdata)
            {
                // Each dimension has its own pointer that loops around between 0 and dimensionSizeLimit
                int ptr = dimensionPointers[dd.Index];
                dd.Data[ptr] = val;
                ptr++;
                if (ptr >= dimensionSizeLimit) ptr = 0;
                dimensionPointers[dd.Index] = ptr;
            } else
            {
                int ptr = dimensionSizeLimit - 1;   
                for(var i = 1; i < dimensionSizeLimit; i++)
                {
                    dd.Data[i - 1] = dd.Data[i];
                }
                dd.Data[ptr] = val;
                dimensionPointers[dd.Index] = ptr;
            }
        }

        // TODO: integrate properly -- only proof of concept
        public void OverrideData(string dimensionName, float[] values)
        {
            var dd = this[dimensionName];
            dd.setData(values, null);
            //dd.Data[index] = normaliseValue(val, dd.MetaData.minValue, dd.MetaData.maxValue, 0f, 1f);
        }

        public void ResizeData(string dimensionName, int count)
        {
            var dd = this[dimensionName];
            //dimensionSizeLimit = count;
            dd.setData(dd.Data.SubArray(0, count), null);
        }

        /// <summary>
        /// Gets the dimension data at the specified index.
        /// </summary>
        /// <param name="index">Index of dimension</param>
        public override DimensionData this[int index]
        {
            get { return dimensionData[index]; }
        }

        /// <summary>
        /// Gets the dimension data with the specified identifier.
        /// </summary>
        /// <param name="identifier">Identifier.</param>
        public override DimensionData this[string identifier]
        {
            get
            {
                foreach (DimensionData d in dimensionData)
                {
                    if (d.Identifier == identifier)
                    {
                        return d;
                    }
                }
                return null;
            }
        }

        /// <summary>
        /// Gets the dimension data at the specified index. Named function to be called from JS.
        /// </summary>
        /// <param name="index">Index of dimension</param>
        public DimensionData GetDataByIndex(int index)
        {
            return this[index];
		}

        /// <summary>
        /// Gets the dimension data with the specified identifier. Named function to be called from JS.
        /// </summary>
        /// <param name="identifier">Identifier.</param>
        public DimensionData GetDataByIdentifier(string identifier)
        {
            return this[identifier];
		}

        /// <summary>
        /// Will always return true since the data is filled at runtime.
        /// </summary>
        /// <value></value>
        public override bool IsLoaded
        {
            get { return true; }
        }

        /// <summary>
        /// Gets the count of the dimensions to use on the indexer.
        /// </summary>
        /// <value>The count of dimensions</value>
        public override int DimensionCount
        {
            get { return dimensionData.Count; }
        }

        /// <summary>
        /// Gets the data count.
        /// </summary>
        /// <value>The data count.</value>
        public override int DataCount
        {
            get { return dimensionSizeLimit; }
        }

        public override int getNumberOfCategories(int identifier)
        {
            return dimensionSizeLimit;
        }

        public override int getNumberOfCategories(string identifier)
        {
            return dimensionSizeLimit;
        }

        /// <summary>
        /// Returns the orginal value from the data dimension range. Used to dispaly axis labels.
        /// </summary>
        /// <param name="normalisedValue"></param>
        /// <param name="identifier"></param>
        /// <returns>An object depending on the datatype of the value (e.g. Float, String...)</returns>
        public override object getOriginalValue(float normalisedValue, string identifier)
        {
            DimensionData.Metadata meta = this[identifier].MetaData;
            float normValue = normaliseValue(normalisedValue, 0f, 1f, meta.minValue, meta.maxValue);

            if (meta.type == DataType.String)
            {
                normValue = normaliseValue(normalisedValue, 0f, /*dimensionSizeLimit*/meta.maxValue, meta.minValue, meta.maxValue);

                if(identifier == "year")
                {
                    Debug.Log("SetDataStrStrByIdx getOriginalValue normalisedValue => " + normalisedValue + ", normValue=" + normValue);
                }

                //TODO check that here further
                normValue *= (meta.maxValue-1);

                if (textualDimensions.ContainsKey(identifier))
                {
                    return textualDimensions[identifier][(int)normValue];
                }

                if (identifier == "year")
                {
                    Debug.Log("SetDataStrStrByIdx getOriginalValue strVal => " + "NOT SET");
                }

                return "NOT SET";
            }

            return normValue;
        }

        /// <summary>
        /// Returns the orginal value from the data dimension range. Used to display "Dimension Filter" values in the Unity editor.
        /// </summary>
        /// <param name="normalisedValue"></param>
        /// <param name="identifier"></param>
        /// <returns>An object depending on the datatype of the value (e.g. Float, String...)</returns>
        public override object getOriginalValue(float normalisedValue, int identifier)
        {
            DimensionData.Metadata meta = this[identifier].MetaData;
            float normValue = normaliseValue(normalisedValue, 0f, 1f, meta.minValue, meta.maxValue);

            if (meta.type == DataType.String)
            {
                if(textualDimensions.ContainsKey(this[identifier].Identifier))
                {
                    return textualDimensions[this[identifier].Identifier][(int)normValue];
                }
            }

            return normValue;
        }

        float normaliseValue(float value, float i0, float i1, float j0, float j1)
        {
            float L = (j0 - j1) / (i0 - i1);
            return (j0 - (L * i0) + (L * value));
        }

        public override object getOriginalValuePrecise(float normalisedValue, int identifier)
        {
            throw new System.NotImplementedException();
        }

        public override object getOriginalValuePrecise(float normalisedValue, string identifier)
        {
            throw new System.NotImplementedException();
        }

        /// <summary>
        /// Does nothing. Do not need to load data at launch as the data will be loaded in at runtime.
        /// </summary>
        public override void load() { }

        public override void loadHeader()
        {
            throw new System.NotImplementedException();
        }

        /// <summary>
        /// Awake this instance.
        /// </summary>
        void Awake()
        {
            DataSourceManager.register(this);

            if (!IsLoaded)
                load();
        }

        /// <summary>
        /// Raises the destroy event.
        /// </summary>
        void OnDestroy()
        {
            if (!isQuitting)
            {
                DataSourceManager.unregister(this);
            }
        }

        /// <summary>
        /// Raises the application quit event.
        /// </summary>
        void OnApplicationQuit()
        {
            isQuitting = true;
        }
    }
}
