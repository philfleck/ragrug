using System.Collections;
using System.Collections.Generic;
using Loonim;
using UnityEngine;
using Vizario;

namespace JSONDataProcessing
{
    public class JSONObjectData : BaseManager<JSONObjectData>
    {
        public ObjectData root;
        public List<ObjectData> elements = new List<ObjectData>();

        public class ObjectData
        {
            public string name;
            public string parent_name;
            public Vector3 position;
            public Quaternion rotation;
            public Vector3 scale;
            public string file;
        }

        public static void InitRoot(string name, string parent_name, float[] position, float[] rotation,
            float[] scale, string file)
        {
            Debug.Log("JSONObjectData: Initializing Root Element...");
            ObjectData od = new ObjectData();

            od.name = name;
            od.parent_name = parent_name;
            od.position = new Vector3(position[0], position[1], position[2]);
            od.rotation = Quaternion.Euler(rotation[0], rotation[1], rotation[2]);
            od.scale = new Vector3(scale[0], scale[1], scale[2]);
            od.file = file;
            JSONObjectData.GetRTInstance().root = od;
        }

        public static void AddElement(string name, string parent_name, float[] position, float[] rotation,
            float[] scale, string file)
        {
            Debug.Log("JSONObjectData: Adding element " + JSONObjectData.GetRTInstance().elements.Count + " to list...");
            ObjectData od = new ObjectData();
            od.name = name;
            od.parent_name = parent_name;
            od.position = new Vector3(position[0], position[1], position[2]);
            od.rotation = Quaternion.Euler(rotation[0], rotation[1], rotation[2]);
            od.scale = new Vector3(scale[0], scale[1], scale[2]);
            od.file = file;
            JSONObjectData.GetRTInstance().elements.Add(od);
        }

    }
}