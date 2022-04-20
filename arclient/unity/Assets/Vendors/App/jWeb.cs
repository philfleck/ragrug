//Philipp Fleck 2020
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

using PowerUI;
using System;

//using Vizario;
//using Vizario.Tools;
//using Vizario.Utils;

namespace Vizario
{
    namespace VApp
    {
        using CSCallback = System.Func<string, string, string>;
        using JSCallback = System.Func<Jint.Native.JsValue, Jint.Native.JsValue[], Jint.Native.JsValue>;
        public class jWeb : BaseManager<jWeb>
        {
            private Dictionary<string, string> dataStore = new Dictionary<string, string>();

            WebTools2 web_tools = null;

            void Start()
            {
                web_tools = gameObject.AddComponent<WebTools2>();
            }

            private void ResponeNotification(WebTools2.OutputData o, JSCallback responseCallback)
            {
               
                try
                {
                    responseCallback?.Invoke(
                            new Jint.Native.JsValue("WebCallback"),
                            new Jint.Native.JsValue[] { o.error, o.result });
                }
                catch (Exception err)
                {
                    Debug.LogError("ResponeNotification ERROR => " + err);
                    Debug.Log("ResponeNotification o=" + o);
                    Debug.Log("ResponeNotification o=" + o.response_code + ", " + o.error + ", " + o.result);
                    Debug.Log("ResponeNotification responseCallback:" + responseCallback.Method.Name.ToString() + ", body:" + responseCallback.Method.GetMethodBody().ToString());
                }
            }

            public void SendRequestImpl(string method, string url, Dictionary<string, string> headers, string data, JSCallback responseCallback)
            {
                foreach (KeyValuePair<string, string> entry in headers)
                {
                    //Debug.Log("Headers: " + entry.Key + ":" + entry.Value);
                }

                var fMethod = method.Trim().ToUpper();
                WebTools2.Callback cbResponse = ResponeNotification;
                if (fMethod == "GET")
                {
                    web_tools.GET(url, headers, cbResponse, responseCallback);
                }
                else if (fMethod == "POST")
                {
                    //Debug.Log("Setting up post request to " + url);
                    web_tools.POST(url, headers, data, cbResponse, responseCallback);
                }
                else
                {
                    return;
                }
            }

            private string GetCookieFromOAuthResponse(List<string> cookieLines)
            {
                string oauth2_cookie = "";
                foreach (string s in cookieLines)
                {
                    string name_val = "_oauth2_proxy";

                    if (s.Contains(name_val))
                    {
                        string[] delims = { "\t" };
                        string[] l_split = s.Split(delims, 0);

                        string val = "";
                        for (int i = 0; i < l_split.Length; i++)
                        {
                            if (l_split[i] == name_val)
                            {
                                if ((i + 1) < l_split.Length)
                                {
                                    val = l_split[i + 1];
                                    break;
                                }
                            }
                        }

                        if (val.Length > 0)
                        {
                            oauth2_cookie = name_val + "=" + val;
                            return oauth2_cookie;
                        }
                    }
                }
                return oauth2_cookie;
            }

            public void WriteToStoreImpl(string key, string value)
            {
                //Debug.Log("jWeb WriteToStoreImpl " + key + " -- " + value);
                try
                {
                    if (key != null && key.Length > 0)
                    {
                        if (dataStore == null)
                        {
                            dataStore = new Dictionary<string, string>();
                        }

                        if (dataStore.ContainsKey(key))
                        {
                            dataStore[key] = value;
                        }
                        else
                        {
                            dataStore.Add(key, value);
                        }
                    }
                }
                catch (Exception)
                {
                    Debug.LogError("Writing to store FAILED!");
                }
            }

            public string ReadFromStoreImpl(string key)
            {
                try
                {
                    string ret = "";
                    if (dataStore != null && key != null && key.Length > 0)
                    {
                        dataStore.TryGetValue(key, out ret);
                    }
                    return ret;
                }
                catch (Exception)
                {
                    Debug.LogError("Reading from Store FAILED!");
                }
                return null;
            }

            public Coroutine SetIntervalImpl(int msStartDelay, int msInterval, JSCallback fct)
            {
                var cr = SetIntervalRunner(msStartDelay, msInterval, fct);
                return StartCoroutine(cr);
            }

            private IEnumerator SetIntervalRunner(int msStartDelay, int msInterval, JSCallback fct)
            {
                float startDelay = (float)msStartDelay / 1000f;
                float intervalDelay = (float)msInterval / 1000f;
                yield return new WaitForSeconds(startDelay);
                while (true)
                {
                    fct.Invoke(new Jint.Native.JsValue("WebIntervall"),
                            new Jint.Native.JsValue[] { });
                    yield return new WaitForSeconds(intervalDelay);
                }
            }

            public Coroutine SetTimeoutImpl(int msStartDelay, JSCallback fct)
            {
                var cr = SetTimeoutRunner(msStartDelay, fct);
                return StartCoroutine(cr);
            }

            private IEnumerator SetTimeoutRunner(int msStartDelay, JSCallback fct)
            {
                float startDelay = (float)msStartDelay / 1000f;
                yield return new WaitForSeconds(startDelay);

                try
                {
                    fct.Invoke(new Jint.Native.JsValue("WebIntervall"),
                            new Jint.Native.JsValue[] { });
                }
                catch (Exception e)
                {

                }
                yield return null;
            }

            public void UploadFileImpl(string method, string url, Dictionary<string, string> headers, string filepath, string data, JSCallback responseCallback)
            {
                WebTools2.Callback cbResponse = ResponeNotification;
                web_tools.UploadFile(method, url, headers, filepath, data, cbResponse, responseCallback);
            }

            public void DownloadFileImpl(string method, string url, Dictionary<string, string> headers, string filepath,
                bool append, JSCallback responseCallback)
            {
                WebTools2.Callback cbResponse = ResponeNotification;
                web_tools.DownloadFile(method, url, headers, filepath, append, cbResponse, responseCallback);
            }

            /// STATIC EXPORTS
            public static Coroutine SetTimeout(int msStartDelay, JSCallback fct)
            {
                return GetRTInstance().SetTimeoutImpl(msStartDelay, fct);
            }

            public static void StopTimeout(Coroutine c)
            {
                GetRTInstance().StopCoroutine(c);
            }

            public static Coroutine SetInterval(int msStartDelay, int msInterval, JSCallback fct)
            {
                return GetRTInstance().SetIntervalImpl(msStartDelay, msInterval, fct);
            }

            public static void StopInterval(Coroutine c)
            {
                GetRTInstance().StopCoroutine(c);
            }

            public static void SendRequest(string method, string url, string[] headers, string data, JSCallback responseCallback)
            {
                //Dictionary<string, string>
                Dictionary<string, string> hMap = new Dictionary<string, string>();
                for (int i = 0; i < headers.Length; i += 2)
                {
                    hMap.Add(headers[i], headers[i + 1]);
                }
                Debug.Log("jWeb SendRequest called with url=" + url);
                GetRTInstance().SendRequestImpl(method, url, hMap, data, responseCallback);
            }

            public static string ReadFromStore(string key)
            {
                //Debug.Log("jWeb ReadFromStore " + key);
                return GetRTInstance().ReadFromStoreImpl(key);
            }

            public static void WriteToStore(string key, string value)
            {

                //Debug.Log("jWeb WriteToStore " + key + " -- " + value.Substring(0, value.Length > 10 ? 10 : value.Length-1));
                GetRTInstance().WriteToStoreImpl(key, value);
            }

            public static void UploadFile(string method, string url, string[] headers, string filepath, string data,
                JSCallback responseCallback)
            {
                Dictionary<string, string> hMap = new Dictionary<string, string>();
                for (int i = 0; i < headers.Length; i += 2)
                {
                    hMap.Add(headers[i], headers[i + 1]);
                }
                Debug.Log("jWeb UploadFile called with url=" + url);
                GetRTInstance().UploadFileImpl(method, url, hMap, filepath, data, responseCallback);
            }

            public static void DownloadFile(string method, string url, string[] headers, string filepath,
                bool append, JSCallback responseCallback)
            {
                Dictionary<string, string> hMap = new Dictionary<string, string>();
                for (int i = 0; i < headers.Length; i += 2)
                {
                    hMap.Add(headers[i], headers[i + 1]);
                }
                Debug.Log("jWeb UploadFile called with url=" + url);
                GetRTInstance().DownloadFileImpl(method, url, hMap, filepath, append, responseCallback);
            }
        }
    }
}
