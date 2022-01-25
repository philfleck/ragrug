//Philipp Fleck 2020
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.WSA;
using UnityEngine.XR.WSA.Sharing;

namespace RR
{
    using JSCallback = System.Func<Jint.Native.JsValue, Jint.Native.JsValue[], Jint.Native.JsValue>;
    public class WAManager : BaseManager<WAManager>
    {
        Dictionary<string, AnchorCont> anchorMap = new Dictionary<string, AnchorCont>();

        [Serializable]
        public class AnchorCont
        {
            public string anchorName;
            public JSCallback jsCbFct;
            public byte[] anchorData;
            public string anchorDataB64;
        }

        public static void ImportWorldAnchor(string goName, string b64Data, bool acc)
        {

            Debug.LogError("AB ImportWorldAnchor goName=" + goName + ", acc=" + acc);
            byte[] bytes = null;
            if (acc)
            {
                bytes = System.Convert.FromBase64String(b64Data);
            }
            GetRTInstance().ImportRootGameObject(goName, bytes, acc);
            //GetMainEventDispatcher().PushEvent(() =>
            //{
            //    ((AppManager)GetAppManager()).ImportRootGameObject(goName, bytes, acc);
            //});

        }

        public static void GetB64WorldAnchorFromGo(string goName, JSCallback callbackFunction)
        {
            Debug.LogError("GetB64WorldAnchorFromGo [" + goName + "]");
            var go = GameObject.Find(goName);
            if (go != null)
            {
                var wa = go.GetComponent<WorldAnchor>();
                GetRTInstance().ExportAnchor(wa, goName, callbackFunction);
            }
            else
            {
                Debug.LogError("GetB64WorldAnchorFromGo [" + goName + "] NOT FOUND!");
            }
        }

        public static void AddWorldAnchorToGo(string goName)
        {
            Debug.LogError("AddWorldAnchorToGo for [" + goName + "]");
            var go = GameObject.Find(goName);
            if (go == null)
            {
                go = new GameObject(goName);
            }

            var c = (GameObject)UnityEngine.GameObject.Instantiate(Resources.Load("Prefabs/xyz"));
            c.transform.parent = go.transform;

#if !UNITY_EDITOR
            if (go != null)
            {
                var wa = go.AddComponent<WorldAnchor>();
            }
            else
            {
                Debug.LogError("AddWorldAnchorToGo [" + goName + "] NOT FOUND!");
            }
#endif
        }

        public void ExportAnchor(WorldAnchor wa, string anchorName, JSCallback callbackFunction)
        {
            Debug.LogError(GetType() + "::ExportAnchor exporting anchor");
            var cak = RR.Statics.CURRENT_ANCHOR;
            if (!anchorMap.ContainsKey(cak))
            {
                anchorMap.Add(cak, null);
            }
            var ac = new AnchorCont();
            ac.anchorName = anchorName;
            ac.jsCbFct = callbackFunction;
            ac.anchorData = null;
            ac.anchorDataB64 = "";
            anchorMap[cak] = ac;

            WorldAnchorTransferBatch transferBatch = new WorldAnchorTransferBatch();
            transferBatch.AddWorldAnchor(anchorName, wa);
            WorldAnchorTransferBatch.ExportAsync(transferBatch, OnExportDataAvailable, OnExportComplete);
        }

        private void OnExportComplete(SerializationCompletionReason completionReason)
        {
            Debug.LogError(GetType() + "::OnExportComplete completionReason=" + completionReason);
            if (completionReason != SerializationCompletionReason.Succeeded)
            {
                //SendExportFailedToClient();

            }
            else
            {
                var cak = RR.Statics.CURRENT_ANCHOR;
                var ac = anchorMap[cak];
                anchorMap[cak] = null;
                var waName = ac.anchorName;
                anchorMap[waName] = ac;
                string[] args = { "" };

                Debug.LogError(GetType() + "::OnExportComplete before calling: " + ac.jsCbFct + "|" + args[0].Length);

                if (ac.jsCbFct != null)
                {
                    ac.jsCbFct.Invoke(
                                new Jint.Native.JsValue("OnExportComplete"),
                                new Jint.Native.JsValue[] { "", ac.anchorName });
                }
            }
        }

        private void OnExportDataAvailable(byte[] data)
        {
            //Debug.LogError(GetType() + "::OnExportDataAvailable #data=" + data.Length);
            var cak = RR.Statics.CURRENT_ANCHOR;
            var ac = anchorMap[cak];

            try
            {
                var waName = ac.anchorName;
                anchorMap[waName] = ac;
                var compressedData = RR.Algo.Compress(data);
                var b64 = System.Convert.ToBase64String(compressedData);
                string[] args = { b64 };

                if (ac.jsCbFct != null)
                {
                    ac.jsCbFct.Invoke(
                                new Jint.Native.JsValue("OnExportDataAvailable"),
                                new Jint.Native.JsValue[] { b64, ac.anchorName });
                }
            }
            catch (Exception err)
            {
                Debug.LogError(GetType() + "::OnExportDataAvailable ERROR " + err);
            }
        }

        string xxxName = "";
        List<byte> xxxBytes = new List<byte>();
        public void ImportRootGameObject(string goName, byte[] importedData, bool acc)
        {


            Debug.LogError(GetType() + "::ImportRootGameObject byte2append=" + ", acc=" + acc);
#if !UNITY_EDITOR
            xxxName = goName;
            if (acc)
            {
                var bytes = RR.Algo.Decompress(importedData);
                importedData = null;
                foreach (var b in bytes)
                {
                    xxxBytes.Add(b);
                }
                //importedData = null;
            }
            else
            {
                Debug.LogError(GetType() + "::ImportRootGameObject startImporting of #" + xxxBytes.Count);
                WorldAnchorTransferBatch.ImportAsync(xxxBytes.ToArray(), OnImportComplete);
            }
#endif
            GC.Collect();
        }

        private void OnImportComplete(SerializationCompletionReason completionReason, WorldAnchorTransferBatch deserializedTransferBatch)
        {
            Debug.LogError(GetType() + "::OnImportComplete completionReason=" + completionReason);
            try
            {
                xxxBytes.Clear();
                xxxBytes = null;
                if (completionReason != SerializationCompletionReason.Succeeded)
                {

                }

                if (completionReason == SerializationCompletionReason.Succeeded)
                {
                    //this.gameRootAnchor = deserializedTransferBatch.LockObject("gameRoot", this.rootGameObject);
                    if (xxxName.Length > 0)
                    {
                        var go = GameObject.Find(xxxName);
                        if (go == null)
                        {
                            go = new GameObject(xxxName);
                        }

                        var c = (GameObject)Instantiate(Resources.Load("Prefabs/xyz"));
                        c.transform.parent = go.transform;

                        var anchor = deserializedTransferBatch.LockObject(xxxName, go);
                        //go.AddComponent<WorldAnchor>();
                    }
                }
            }
            catch (Exception err)
            {
                Debug.LogError(GetType() + "::OnImportComplete ERROR => " + err);
            }
        }
    }
}