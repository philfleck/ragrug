//Philipp Fleck 2020
#define USE_COROUTINE

using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Vizario
{
    public class ObjectKeeper : BaseManager<ObjectKeeper>
    {
        Dictionary<string, GameObject> objDb = new Dictionary<string, GameObject>();

        public GameObject CreateOrGet(string mName)
        {
            Debug.Log("CreateOrGet for => " + mName);

            bool f = false;
            GameObject g = null;
            try
            {
                if (f = objDb.TryGetValue(mName, out g))
                {
                    Debug.Log("CreateOrGet f = objDb.TryGetValue(" + mName + ", out g) => FOUND (" + f +") g=" + g);
                    if (g != null)
                    {
                        Debug.Log("CreateOrGet returning g " + g);
                        return g;
                    }
                }

                Debug.Log("CreateOrGet initing new GameObject");

                g = GameObject.Find(mName);
                if (g == null)
                {
                    g = new GameObject(mName);
                }
                if (!f)
                {
                    Debug.Log("CreateOrGet adding g(" + g + ") to db=" + objDb.Count );
                    objDb.Add(mName, g);
                }
                else
                {
                    Debug.Log("CreateOrGet updating g(" + g + ") for key ("+mName+") where db=" + objDb.Count);
                    objDb[mName] = g;
                }
            } catch(Exception e)
            {
                Debug.LogError("CreateOrGet ERROR => " + e);
            }
            return g;
        }


        public void Kill(string mName)
        {
            Debug.LogError(GetType() + "::Kill " + mName);
            GameObject g;
            if (objDb.TryGetValue(mName, out g))
            {
                if (g != null)
                {
                    Destroy(g);
                    g = null;
                }
                objDb.Remove(mName);
            }
            else
            {
                g = GameObject.Find(name);
                if (g != null)
                {
                    Destroy(g);
                }
            }
        }

        public void AddGoRefByName(string mName)
        {
            Debug.LogError(GetType() + "::AddGoRefByName called with " + mName);
            try
            {
                GameObject g;
                if (objDb.TryGetValue(mName, out g))
                {
                    if (g == null)
                    {
                        g = GameObject.Find(mName);
                        Debug.LogError(GetType() + "::AddGoRefByName found, but g was null, afterward g=" + g);
                    }

                }
                else
                {
                    g = GameObject.Find(mName);
                    if (g != null)
                    {
                        Debug.LogError(GetType() + "::AddGoRefByName not found, adding g=" + g.name);
                        objDb.Add(mName, g);
                    }
                    else
                    {
                        Debug.LogError(GetType() + "::AddGoRefByName not found, G GameObject.Find failed!");
                    }
                }
            }
            catch (System.Exception e)
            {
                Debug.LogError(GetType() + "::AddGoRefByName ERROR => " + e.Message);
            }
        }

        private void MakeActiveGo(GameObject mGo, bool mActive)
        {
#if false
            var r = mGo.GetComponent<Renderer>();
            if (r != null)
            {
                r.enabled = false;
            }
            else
            {
                mGo.SetActive(mActive);
            }
#else
            mGo.SetActive(mActive);
#endif
        }

        public void MakeActive(string mName, bool mActive, float mDelaySec)
        {
#if USE_COROUTINE
            /*MainEventDispatcher.Instance.PushEvent(() =>
            {
                StartCoroutine(MakeActiveLater(mName, mActive, mDelaySec));
            });*/
            StartCoroutine(MakeActiveLater(mName, mActive, mDelaySec));
#else
            MainEventDispatcher.Instance.PushEvent(() =>
            {
                MakeActiveLater(mName, mActive, mDelaySec);
            });
#endif
        }

#if USE_COROUTINE
        private IEnumerator MakeActiveLater(string mName, bool mActive, float delaySec)
        {
            yield return new WaitForSeconds(delaySec);
#else
        private void MakeActiveLater(string mName, bool mActive, float mDelaySec)
        {
#endif
            try
            {
                Debug.LogError(GetType() + "::MakeActiveLater " + mName + "|" + mActive);
                GameObject g;
                if (objDb.TryGetValue(mName, out g))
                {
                    if (g != null)
                    {
                        MakeActiveGo(g, mActive);
                    }
                    else
                    {
                        g = GameObject.Find(mName);
                        if (g != null)
                        {
                            Debug.LogError("MakeActive GO found adding to list");
                            MakeActiveGo(g, mActive);
                        }
                        else
                        {
                            Debug.LogError("MakeActive GO not found");
                        }
                    }
                }
                else
                {
                    Debug.LogError("MakeActive not in list, trying to find");
                    g = GameObject.Find(mName);
                    if (g != null)
                    {
                        Debug.LogError("MakeActive GO found adding to list");
                        objDb.Add(mName, g);
                        MakeActiveGo(g, mActive);
                    }
                    else
                    {
                        Debug.LogError("MakeActive GO not found");
                    }
                }
            }
            catch (System.Exception e)
            {
                Debug.LogError(GetType() + "::MakeActive ERROR => " + e.Message);
            }

        }

    }
}
