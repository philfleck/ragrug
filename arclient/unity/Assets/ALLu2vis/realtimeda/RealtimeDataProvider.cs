using System.Collections;
using System.Collections.Generic;
using UnityEngine;

using u2vis;
using System;

namespace RRu2v
{
    public class RealtimeDataProvider : AbstractDataProvider
    {
        private DataSet _data = null;

        public override DataSet Data => _data;

        public RealtimeDataProvider()
        {
            _data = CreateTestData();
        }

        public DataSet CreateTestData()
        {
            DataSet data = new DataSet();
            return data;
        }

        public void Initialize()
        {
            _data = CreateTestData();
        }

        public void AddToData(int id, object value)
        {
            Data[id].Add(value);
        }

        public void AddToDataInt(int id, int value)
        {
            //Data[id].Add(value);
            AddToData(id, value);
        }

        public void AddToDataFloat(int id, float value)
        {
            //Data[id].Add(value);
            AddToData(id, value);
        }

        public void AddToDataString(int id, string value)
        {
            //Data[id].Add(value);
            AddToData(id, value);
        }

        public void SetValueFloat(int id, int pos, float value)
        {
            //Data[id].Set(pos, value);
            SetDataWrap(id, pos, value);
        }

        public void SetValueFloatNonCylcing(int id, int pos, float value)
        {
            Data[id].Set(pos, value);
        }

        public void SetValueInt(int id, int pos, int value)
        {
            //Data[id].Set(pos, value);
            SetDataWrap(id, pos, value);
        }

        public void SetValueString(int id, int pos, string value)
        {
            //Data[id].Set(pos, value);
            SetDataWrap(id, pos, value);
        }

        public void SetDataWrap(int id, int pos, object value)
        {
            var N = Data[id].Count;
            for (int i = 0; i < N-1; i++)
            {
                var next = Data[id].GetObjValue(i + 1);
                Data[id].Set(i, next);
            }
            Data[id].Set(N-1, value);
        }
    }
}
