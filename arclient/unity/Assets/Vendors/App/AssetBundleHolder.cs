//Philipp Fleck 2020
using System;
using System.IO;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using RR;

//TODO MOVE TO CORE
namespace Vizario
{
    public class AssetBundleHolder : BaseManager<AssetBundleHolder>
    {
        private class ABEntry
        {
            public AssetBundle ab = null;
            public string name = "";
            public string path = "";
            
            public ABEntry(string mName, string mPath)
            {
                var newPath = Path.Combine(Application.persistentDataPath, mPath);
                this.name = mName;
                this.path = newPath;
            }
        }

        Dictionary<string, ABEntry> bundles = new Dictionary<string, ABEntry>();

        private AssetBundle LoadAB(string mName, byte[] bytes = null)
        {
            try
            {
                Debug.Log(GetType() + "::LoadAB from " + mName);
                ABEntry abe = null;
                if (bundles.TryGetValue(mName, out abe))
                {
                    Debug.Log("LoadAB loaded mName=" + mName + "|" + abe.name + "|" + abe.path);
                    if (abe.ab == null)
                    {
                        //Debug.Log("LoadAB loading mName=" + mName + "|" + abe.name + "|" + abe.path);
                        if (bytes == null)
                        {
                            abe.ab = AssetBundle.LoadFromFile(abe.path);
                        } else
                        {
                            abe.ab = AssetBundle.LoadFromMemory(bytes);
                        }
                    }
                    return abe.ab;
                }
            }
            catch (Exception e)
            {
                Debug.LogError(GetType() + "::LoadAB ERROR => " + e.Message);
            }
            return null;
        }

        public void AddAsssetBundle(string mName, string mPath)
        {
            Debug.Log(GetType() + "::AddAsssetBundle " + mName + "|" + mPath);
            try
            {
                //foreach (var e in bundles)
                //{
                //    Debug.Log("AddAsssetBundle bundles=" + e.Key + "|" + e.Value);
                //}

                ABEntry abe = null;
                if (bundles.TryGetValue(mName, out abe) == false)
                {
                    abe = new ABEntry(mName, mPath);
                    bundles.Add(mName, abe);
                }
                else
                {
                    Debug.Log(GetType() + "::AddAsssetBundle already exists! " + mName + "|" + mPath);
                }
            }
            catch (Exception e)
            {
                Debug.Log(GetType() + "::AddAsssetBundle ERROR => " + mName + "|" + e.Message);
            }
        }

        public AssetBundle GetAssetBundle(string name)
        {
            return LoadAB(name);
        }

        public T Instatiate<T>(string assetbundleName, string instanceName) where T : UnityEngine.Object
        {
            Debug.Log(GetType() + "::Instatiate -> " + typeof(T) + "|" + assetbundleName + "|" + instanceName);
            try
            {
                var ab = GetAssetBundle(assetbundleName);
                if (ab != null)
                {
                    //foreach (var str in ab.GetAllAssetNames())
                    //{
                    //    Debug.Log("Instatiate => " + str);
                    //}
                    var pi = ab.LoadAsset<T>(instanceName);
                    var i = Instantiate(pi);
                    //TODO do some sort of savekeeping
                    return i;
                } else
                {
                    Debug.Log(GetType() + "::Instatiate ERROR => AssetBundle NOT FOUND!");
                }
            }
            catch (Exception e)
            {
                Debug.Log(GetType() + "::Instatiate ERROR => " + e.Message);
            }
            return null;
        }

        public static GameObject InstantiateGameObject(string assetName, string modelName)
        {
            Debug.Log(GetRTInstance().GetType() + "::InstantiateGameObject => " + assetName + ", " + modelName);
            var inst = GetRTInstance().Instatiate<GameObject>(assetName, modelName);
            return inst;
        }

        static public void ImportFromStore(string assetName)
        {
            Debug.Log(GetRTInstance().GetType() + "::ImportFromStore => " + assetName);
            var assetB64 = VApp.jWeb.ReadFromStore(assetName);
            if(assetB64 != "")
            {
                Debug.Log("ImportFromStore => loaded b64 from store" + assetB64.Length);
                var bytes = System.Convert.FromBase64String(assetB64);

                Debug.Log(GetRTInstance().GetType() + "::ImportFromStore => loaded bytes");

                GetRTInstance().AddAsssetBundle(assetName, "");

                //TODO make that async with callback
                GetRTInstance().LoadAB(assetName, bytes);
            }
        }

        public bool HasAssetImple(string assetName)
        {
            return bundles.ContainsKey(assetName);
        }

        public static bool HasAsset(string assetName)
        {
            return GetRTInstance().HasAssetImple(assetName);
        }

        public static void ImportFromFile(string assetFile, string assetName)
        {
            Debug.Log(GetRTInstance().GetType() + "::ImportFromFile => " + assetFile);
            var bytes = Algo.ReadBytes(assetFile, false);
            Debug.Log(GetRTInstance().GetType() + "::ImportFromFile #bytes=" + bytes.Length);

            GetRTInstance().AddAsssetBundle(assetName, Path.Combine(Application.persistentDataPath,assetFile));
            GetRTInstance().LoadAB(assetName, bytes);
            Debug.Log(GetRTInstance().GetType() + "::ImportFromFile => " + assetFile + " ... Done!");
        }
    }
}