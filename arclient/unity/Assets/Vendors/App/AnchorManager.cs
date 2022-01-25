//Philipp Fleck 2020
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

#if WINDOWS_UWP || true
using UnityEngine.XR.WSA;
using UnityEngine.XR.WSA.Sharing;
#endif

namespace Vizario
{
    using JSCallback = System.Func<Jint.Native.JsValue, Jint.Native.JsValue[], Jint.Native.JsValue>;

    public class AnchorManager : BaseManager<AnchorManager>
    {
        [Serializable]
        public class AnchorCont
        {
            public string anchorName;
            public JSCallback jsCbFct;
            public byte[] anchorData;
            public string anchorDataB64;
        }

        Queue<string> tempNames = new Queue<string>();
        Dictionary<string, List<byte>> tempBytes = new Dictionary<string, List<byte>>();
        Dictionary<string, AnchorCont> anchorMap = new Dictionary<string, AnchorCont>();


#if WINDOWS_UWP || true
        public void ExportAnchorImple(WorldAnchor wa, string anchorName, JSCallback jsCallbackFct)
        {
            Debug.LogError(GetType() + "::ExportAnchorImple called with " + wa + ", " + anchorName + ", " + jsCallbackFct);
            try
            {
                Debug.LogError(GetType() + "::ExportAnchorImple exporting anchor");
                var cak = RR.Statics.CURRENT_ANCHOR;
                if (!anchorMap.ContainsKey(cak))
                {
                    anchorMap.Add(cak, null);
                }
                var ac = new AnchorCont();
                ac.anchorName = anchorName;
                ac.jsCbFct = jsCallbackFct;
                ac.anchorData = null;
                ac.anchorDataB64 = "";
                anchorMap[cak] = ac;

                Debug.LogError(GetType() + "::ExportAnchorImple starting batch transfer");

                RR.HtmlUIManager.GetRTInstance().CreateNotification(5, new Vector3(0, 0, 1f),
                null, GetType() + "::ExportAnchorImple starting batch transfer");

                WorldAnchorTransferBatch transferBatch = new WorldAnchorTransferBatch();
                var addWaRet = transferBatch.AddWorldAnchor(anchorName, wa);

                RR.HtmlUIManager.GetRTInstance().CreateNotification(5, new Vector3(0, 0, 1f),
                null, GetType() + "::ExportAnchorImple transferBatch.AddWorldAnchor(" + anchorName + "," + wa + ") => " + addWaRet);
                Debug.Log(GetType() + "::ExportAnchorImple transferBatch.AddWorldAnchor(" + anchorName + "," + wa + ") => " + addWaRet);
                
                WorldAnchorTransferBatch.ExportAsync(transferBatch, OnExportDataAvailable, OnExportComplete);
            }
            catch (Exception err)
            {
                Debug.LogError(GetType() + "::ExportAnchorImple ERROR => " + err);
            }
        }
#endif

#if WINDOWS_UWP || true
        private void OnExportDataAvailable(byte[] data)
        {
            RR.HtmlUIManager.GetRTInstance().CreateNotification(5, new Vector3(0, 0, 1f),
            null, GetType() + "::OnExportDataAvailable");
            var cak = RR.Statics.CURRENT_ANCHOR;
            var ac = anchorMap[cak];
            try
            {
                var waName = ac.anchorName;
                anchorMap[waName] = ac;
                var compressedData = RR.Algo.Compress(data);
                var b64 = System.Convert.ToBase64String(compressedData);
                ac.jsCbFct.Invoke(
                    new Jint.Native.JsValue("AnchorManager"),
                    new Jint.Native.JsValue[] { waName, b64 });
            }
            catch (Exception err)
            {
                Debug.LogError(GetType() + "::OnExportDataAvailable ERROR " + err);
                RR.HtmlUIManager.GetRTInstance().CreateNotification(5, new Vector3(0, 0, 1f),
                null, GetType() + "::OnExportDataAvailable ERROR " + err);
            }
        }
#endif

#if WINDOWS_UWP || true
        private void OnExportComplete(SerializationCompletionReason completionReason)
        {
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
                ac.jsCbFct.Invoke(
                    new Jint.Native.JsValue("AnchorManager"),
                    new Jint.Native.JsValue[] { waName, "" });
                Debug.LogError(GetType() + "::OnExportComplete before calling: " + ac.jsCbFct + "|" + args[0].Length);
            }
        }
#endif

#if WINDOWS_UWP || true

        public void ImportRootGameObject(string goName, byte[] importedData, bool acc)
        {
            try
            {
                if (importedData != null)
                {
                    Debug.LogError(GetType() + "::ImportRootGameObject byte2append=" + importedData.Length + ", acc=" + acc);
                } else
                {
                    Debug.LogError(GetType() + "::ImportRootGameObject importedData=null, " + acc);
                }
                if (!tempBytes.ContainsKey(goName))
                {
                    tempBytes.Add(goName, new List<byte>());
                }
                if (acc)
                {
                    Debug.LogError(GetType() + "::ImportRootGameObject adding bytes!");
                    if (importedData != null)
                    {
                        var bytes = RR.Algo.Decompress(importedData);
                        importedData = null;
                        foreach (var b in bytes)
                        {
                            tempBytes[goName].Add(b);
                        }
                    }
                    //importedData = null;
                }
                else
                {
                    tempNames.Enqueue(goName);
                    Debug.LogError(GetType() + "::ImportRootGameObject startImporting of #" + tempBytes[goName].Count);
                    WorldAnchorTransferBatch.ImportAsync(tempBytes[goName].ToArray(), OnImportComplete);
                }
                GC.Collect();
            } catch(Exception err)
            {
                Debug.LogError(GetType() + "::ImportRootGameObject ERROR => " + err);
            }
        }
#endif
#if WINDOWS_UWP || true
        private void OnImportComplete(SerializationCompletionReason completionReason, WorldAnchorTransferBatch deserializedTransferBatch)
        {
            Debug.LogError(GetType() + "::OnImportComplete completionReason=" + completionReason);
            try
            {
                var lastName = tempNames.Dequeue();
                tempBytes[lastName].Clear();
                tempBytes.Remove(lastName);
                if (completionReason != SerializationCompletionReason.Succeeded)
                {

                }

                if (completionReason == SerializationCompletionReason.Succeeded)
                {
                    //this.gameRootAnchor = deserializedTransferBatch.LockObject("gameRoot", this.rootGameObject);
                    if (lastName.Length > 0)
                    {
                        var go = GameObject.Find(lastName);
                        if (go == null)
                        {
                            go = new GameObject(lastName);
                        }

                        var c = (GameObject)Instantiate(Resources.Load("Prefabs/xyz"));
                        c.transform.parent = go.transform;

                        var anchor = deserializedTransferBatch.LockObject(lastName, go);
                        //go.AddComponent<WorldAnchor>();
                    }
                }
            }
            catch (Exception err)
            {
                Debug.LogError(GetType() + "::OnImportComplete ERROR => " + err);
            }
        }
#endif

        /// STATICS
        /// 
        public static void ExportAnchor(WorldAnchor wa, string anchorName, JSCallback jsCallbackFct)
        {
            Debug.Log("ExportAnchor called " + wa + ", " + anchorName + ", " + jsCallbackFct);
            if (wa != null)
            {
                Debug.Log("ExportAnchor before calling ExportAnchorImple");
                GetRTInstance().ExportAnchorImple(wa, anchorName, jsCallbackFct);
            }
            else
            {
                Debug.Log("ExportAnchor wa is null!");
            }
        }

        public static void ImportWorldAnchor(string goName, string b64Data, bool acc)
        {
#if WINDOWS_UWP || true
            Debug.Log("AB ImportWorldAnchor goName=" + goName + ", acc=" + acc);
            byte[] bytes = null;
            if (acc)
            {
                bytes = System.Convert.FromBase64String(b64Data);
                Debug.Log("AB ImportWorldAnchor #bytes=to-costly");// + bytes.Length);
            }
            GetRTInstance().ImportRootGameObject(goName, bytes, acc);
#endif
        }

        public static void ImportWorldAnchorFromKeyStore(string goName, string key, bool acc)
        {
            var b64Data = "";
            if (key.Length > 0) {

                b64Data = Vizario.VApp.jWeb.ReadFromStore(key);
                Debug.Log("ImportWorldAnchorFromKeyStore Found and Parsed Data " + key);// + ", #b64Data=" + b64Data.Length);
                /*
                var json = Vizario.VApp.jWeb.ReadFromStore(key);
                if (json.Length > 0)
                {
                    var data = Json.JSON.Parse(json);
                    b64Data = data["data"].ToString();
                    Debug.Log("ImportWorldAnchorFromKeyStore Found and Parsed Data " + key + ", #data=" + b64Data.Length );
                }
                */
            }
            //ImportWorldAnchor(goName, b64Data, acc);
            GetRTInstance().StartCoroutine(GetRTInstance().doRunImportWA(goName, b64Data, acc));
        }

        public IEnumerator doRunImportWA(string goName, string b64Data, bool acc)
        {
            ImportWorldAnchor(goName, b64Data, acc);
            yield return null;
        }



        public static void GetB64WorldAnchorFromGo(string goName, JSCallback callbackFct)
        {
            RR.HtmlUIManager.GetRTInstance().CreateNotification(5, new Vector3(0, 0, 1f),
                null, "GetB64WorldAnchorFromGo [" + goName + "] ... ");
            try
            {
#if WINDOWS_UWP || true
                Debug.Log("GetB64WorldAnchorFromGo [" + goName + "]");
                var go = Vizario.ObjectKeeper.GetRTInstance().CreateOrGet(goName);

                Debug.Log("GetB64WorldAnchorFromGo [" + goName + "] got go (" + go + ")");
                if (go != null)
                {
                    Debug.Log("GetB64WorldAnchorFromGo [" + goName + "] trying to get wa");

                    var wa = go.GetComponent<WorldAnchor>();
                    Debug.Log("GetB64WorldAnchorFromGo [" + goName + "] wa is " + wa);

                    ExportAnchor(wa, goName, callbackFct);
                    Debug.Log("GetB64WorldAnchorFromGo [" + goName + "] after ExportAnchor");
                }
                else
                {
                    Debug.Log("GetB64WorldAnchorFromGo [" + goName + "] GameObject NOT FOUND!");
                }
#endif
            }
            catch (Exception err)
            {
                Debug.Log("GetB64WorldAnchorFromGo [" + goName + "] ERROR => " + err);
                RR.HtmlUIManager.GetRTInstance().CreateNotification(5, new Vector3(0, 0, 1f),
                null, "GetB64WorldAnchorFromGo [" + goName + "] ERROR => " + err);
            }
        }

        public static void AddWorldAnchorToGo(string goName)
        {
            try
            {
                RR.HtmlUIManager.GetRTInstance().CreateNotification(5, new Vector3(0, 0, 1f),
                null, "AddWorldAnchorToGo for [" + goName + "]");

                Debug.Log("AddWorldAnchorToGo for [" + goName + "]");
                var go = Vizario.ObjectKeeper.GetRTInstance().CreateOrGet(goName);

                Debug.Log("AddWorldAnchorToGo for [" + goName + "] got go(" + go + ")");

                var c = (GameObject)UnityEngine.GameObject.Instantiate(Resources.Load("Prefabs/xyz"));
                Debug.Log("AddWorldAnchorToGo for [" + goName + "] instantiated prefab c(" + c + ")");

                if (c != null)
                {
                    c.transform.parent = go.transform;
                }

                Debug.Log("AddWorldAnchorToGo for [" + goName + "] setting up debug origin done!");

#if WINDOWS_UWP || true
                if (go != null)
                {
                    var wa = go.AddComponent<WorldAnchor>();
                    Debug.Log("AddWorldAnchorToGo [" + goName + "] adding WorldAnchor!");
                    if (wa != null)
                    {
                        Debug.Log("AddWorldAnchorToGo [" + goName + "] wa set");
                    }
                    else
                    {
                        Debug.Log("AddWorldAnchorToGo [" + goName + "] wa is null! (This should not happen!)");
                    }
                }
                else
                {
                    Debug.Log("AddWorldAnchorToGo [" + goName + "] NOT FOUND!");
                }
#endif
            }
            catch (Exception err)
            {
                Debug.LogError("AddWorldAnchorToGo for [" + goName + "] ERROR => " + err);
                RR.HtmlUIManager.GetRTInstance().CreateNotification(5, new Vector3(0, 0, 1f),
                null, "AddWorldAnchorToGo for [" + goName + "] ERROR => " + err);
            }
        }

    }
}
