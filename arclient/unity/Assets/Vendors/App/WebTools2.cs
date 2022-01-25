//Philipp Fleck 2020
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

using System.Runtime.InteropServices;
//using UnityEngine.Experimental.Networking;

using System.IO;
using System.Text;
using System.Collections.Concurrent;

//using Vizario;
//using Vizario.Utils;

namespace Vizario
{
    namespace VApp
    {
        using JSCallback = System.Func<Jint.Native.JsValue, Jint.Native.JsValue[], Jint.Native.JsValue>;
        public class WebTools2 : BaseManager<WebTools2>//: Singleton<WebTools2>
        {
            //[DllImport("libcurl")]
            //[DllImport("libcurlwrapper")]
            //public static extern int mainwrapped(StringBuilder argv);

            public class UploadElem
            {
                public UnityWebRequest www;
                public Callback ResultCallbackFunc;
                public JSCallback responseCallback;
                public UploadElem(UnityWebRequest www, Callback ResultCallbackFunc, JSCallback responseCallback)
                {
                    this.www = www;
                    this.ResultCallbackFunc = ResultCallbackFunc;
                    this.responseCallback = responseCallback;
                }
            }
            //ConcurrentQueue<UploadElem> uploadElems = new ConcurrentQueue<UploadElem>();
            Queue<UploadElem> uploadElems = new Queue<UploadElem>();


            public struct OutputData
            {
                public string result;
                public bool error;
                public long response_code;
            }

            public delegate void Callback(OutputData a, JSCallback responseCallback);
            public bool debug = false;

            private string persistent_path;
            private string streaming_assets_path;

            private string curl_cert = "cacert.pem"; //TODO move to some sort of settings
            private string curl_cert_fn;

            void Awake()
            {
                persistent_path = Application.persistentDataPath;
                streaming_assets_path = Application.streamingAssetsPath;
                curl_cert_fn = Path.Combine(streaming_assets_path, curl_cert);

                StartCoroutine(doUpload());
            }

            void Start()
            {
                Log("Created!");
            }

            void Update()
            {
            }

            #region interface
            public void GET(string url, Dictionary<string, string> headers, Callback ResultCallbackFunc, JSCallback responseCallback)
            {
                if (debug)
                {
                    Log("GET requesting => " + url);
                }
                UnityWebRequest w = UnityWebRequest.Get(url);
                foreach (KeyValuePair<string, string> entry in headers)
                {
                    w.SetRequestHeader(entry.Key, entry.Value);
                }
                StartCoroutine(Upload(w, ResultCallbackFunc, responseCallback));
            }

            public void SetCurlCertFn(string path)
            {
                curl_cert_fn = path;
            }

            public string GetCurlCertFn()
            {
                return curl_cert_fn;
            }

            public void POST(string url, Dictionary<string, string> headers, string data, Callback ResultCallbackFunc, JSCallback responseCallback)
            {
                if (debug)
                {
                    Log("POST sending => " + url);
                }

                WWWForm d_form = new WWWForm();
                d_form.AddField("data", data);


                Dictionary<string, string> d_data = new Dictionary<string, string>();
                d_data.Add("data", data);
                //UnityWebRequest w = UnityWebRequest.Post(url, d_data);
                //UnityWebRequest w = UnityWebRequest.Post(url,data);
                //UnityWebRequest w = UnityWebRequest.Post(url,d_form);
                UnityWebRequest w = UnityWebRequest.Put(url, data);
                w.method = UnityWebRequest.kHttpVerbPOST;

                foreach (KeyValuePair<string, string> entry in headers)
                {
                    w.SetRequestHeader(entry.Key, entry.Value);
                }

                StartCoroutine(Upload(w, ResultCallbackFunc, responseCallback));
            }

            public void GETWithData(string url, Dictionary<string, string> headers, string data, Callback ResultCallbackFunc, JSCallback responseCallback)
            {
                if (debug)
                {
                    Log("GETWithData sending => " + url + "|data=" + data);
                }

                WWWForm d_form = new WWWForm();
                d_form.AddField("data", data);


                Dictionary<string, string> d_data = new Dictionary<string, string>();
                d_data.Add("data", data);
                //UnityWebRequest w = UnityWebRequest.Post(url, d_data);
                //UnityWebRequest w = UnityWebRequest.Post(url,data);
                //UnityWebRequest w = UnityWebRequest.Post(url,d_form);
                UnityWebRequest w = UnityWebRequest.Put(url, data);
                w.method = UnityWebRequest.kHttpVerbGET;

                foreach (KeyValuePair<string, string> entry in headers)
                {
                    w.SetRequestHeader(entry.Key, entry.Value);
                }

                StartCoroutine(Upload(w, ResultCallbackFunc, responseCallback));
            }
            #endregion


            private void Log(string msg)
            {
                //Debug.Log (this.name + "|" + this.GetType().ToString() + "|" + msg);
            }

            private IEnumerator doUpload()
            {
                while (true)
                {
                    if (uploadElems.Count > 0)
                    {
                        yield return new WaitForSeconds(1f);
                        var ue = uploadElems.Dequeue();
                        var www = ue.www;
                        var ResultCallbackFunc = ue.ResultCallbackFunc;
                        var responseCallback = ue.responseCallback;

                        var s = www.SendWebRequest();
                        yield return s;
                        //yield return www.Send(); //www.SendWebRequest(); BREAKS IT!!!!!!!!
                        OutputData o = new OutputData();
                        if (www.isNetworkError)
                        {
                            Debug.LogError("Upload networkerror => " + www.isNetworkError + ", " + www.error);
                            o.result = www.error;
                            o.error = true;
                            if (debug)
                            {
                                Log(www.error);
                            }
                        }
                        else
                        {
                            o.result = www.downloadHandler.text;
                            o.error = false;
                            if (debug)
                            {
                                foreach (KeyValuePair<string, string> post_arg in www.GetResponseHeaders())
                                {
                                    Log(post_arg.Key + " -- " + post_arg.Value);
                                }
                                Log("\nmethod:" + www.method);
                                Log("\nresponse_code:" + www.responseCode);
                                Log("\nForm upload complete!");
                                Log("\ndownloadHandler: " + www.downloadHandler.text);
                                Log("Form upload complete!");
                            }
                        }
                        o.response_code = www.responseCode;
                        ResultCallbackFunc(o, responseCallback);
                        yield return new WaitForSeconds(0.1f);

                    }
                    else
                    {
                        yield return new WaitForSeconds(2);
                    }
                }
            }

            public void DownloadFile(string method, string url, Dictionary<string, string> headers, string filepath,
                bool append, Callback ResultCallbackFunc, JSCallback responseCallback)
            {
                StartCoroutine(DoDownloadFile(method, url, headers, filepath, append, ResultCallbackFunc, responseCallback));
            }

            private IEnumerator DoDownloadFile(string method, string url, Dictionary<string, string> headers, string filepath,
                bool append, Callback ResultCallbackFunc, JSCallback responseCallback)
            {
                Debug.Log("WebTools2::DoDownloadFile => fn:" + filepath);
                var m = UnityWebRequest.kHttpVerbGET;
                if (method.Trim().ToUpper() == "POST")
                {
                    m = UnityWebRequest.kHttpVerbPOST;
                }
                else if (method.Trim().ToUpper() == "PUT")
                {
                    m = UnityWebRequest.kHttpVerbPUT;
                }
                else if (method.Trim().ToUpper() == "GET")
                {
                    m = UnityWebRequest.kHttpVerbGET;
                }

                var fPath = Path.Combine(Application.persistentDataPath, filepath);
                /*var ud = new DownloadHandlerFile(fPath, append);*/
                var ud = new DownloadHandlerFile(fPath);

                using (var uwr = new UnityWebRequest(url, m, ud, null))
                {
#if UNITY_ANDROID
                    uwr.certificateHandler = new ForceAcceptAll();
#endif
                    foreach (KeyValuePair<string, string> entry in headers)
                    {
                        uwr.SetRequestHeader(entry.Key, entry.Value);
                    }

                    yield return uwr.SendWebRequest();
                    Debug.Log("uwr.SendWebRequest done => errorH=" + uwr.isHttpError
                        + ", errorN=" + uwr.isNetworkError + "rCode=" + uwr.responseCode);
                    OutputData o = new OutputData();
                    o.error = uwr.isNetworkError | uwr.isHttpError;
                    o.response_code = uwr.responseCode;
                    o.result = uwr.error;
                    ResultCallbackFunc(o, responseCallback);

                    if (uwr.isNetworkError || uwr.isHttpError)
                    {
                        Debug.LogError(uwr.error);
                    }
                    else
                    {
                    }
                }
            }

            public void UploadFile(string method, string url, Dictionary<string, string> headers, string filepath, string data,
                Callback ResultCallbackFunc, JSCallback responseCallback)
            {
                StartCoroutine(DoUploadFile(method, headers, filepath, url, ResultCallbackFunc, responseCallback));
            }

            private IEnumerator DoUploadFile(string method, Dictionary<string, string> headers, string filepath, string url,
                Callback ResultCallbackFunc, JSCallback responseCallback)
            {
                Debug.LogError("DoUploadFile => fn:" + filepath);
                var m = UnityWebRequest.kHttpVerbPUT;
                if (method.Trim().ToUpper() == "POST")
                {
                    m = UnityWebRequest.kHttpVerbPOST;
                }

                //var method = UnityWebRequest.kHttpVerbPOST;

                var fPath = filepath;
                Debug.LogError("DoUploadFile => fPath:" + fPath);
                var fbytes = RR.Algo.ReadBytes(fPath, false);
                var uh = new UploadHandlerRaw(fbytes);


                using (var uwr = new UnityWebRequest(url, m, null, uh))
                {
#if UNITY_ANDROID
                    uwr.certificateHandler = new ForceAcceptAll();
#endif
                    foreach (KeyValuePair<string, string> entry in headers)
                    {
                        uwr.SetRequestHeader(entry.Key, entry.Value);
                    }

                    yield return uwr.SendWebRequest();
                    Debug.Log("uwr.SendWebRequest done => errorH=" + uwr.isHttpError
                        + ", errorN=" + uwr.isNetworkError + "rCode=" + uwr.responseCode);
                    OutputData o = new OutputData();
                    o.error = uwr.isNetworkError | uwr.isHttpError;
                    o.response_code = uwr.responseCode;
                    o.result = uwr.error;
                    ResultCallbackFunc(o, responseCallback);

                    if (uwr.isNetworkError || uwr.isHttpError)
                    {
                        Debug.LogError(uwr.error);
                    }
                    else
                    {
                        // file data successfully sent
                    }
                }
            }

            //TODO pass array of strings
            private IEnumerator Upload(UnityWebRequest www, Callback ResultCallbackFunc, JSCallback responseCallback)
            {
                uploadElems.Enqueue(new UploadElem(www, ResultCallbackFunc, responseCallback));
                yield return null;

                /*
                var s = www.SendWebRequest();
                yield return s;
                //yield return www.Send(); //www.SendWebRequest(); BREAKS IT!!!!!!!!
                OutputData o = new OutputData();
                if (www.isNetworkError)
                {
                    Debug.LogError("Upload networkerror => " + www.isNetworkError + ", " + www.error);
                    o.result = www.error;
                    o.error = true;
                    if (debug)
                    {
                        Log(www.error);
                    }
                }
                else
                {
                    o.result = www.downloadHandler.text;
                    o.error = false;
                    if (debug)
                    {
                        foreach (KeyValuePair<string, string> post_arg in www.GetResponseHeaders())
                        {
                            Log(post_arg.Key + " -- " + post_arg.Value);
                        }
                        Log("\nmethod:" + www.method);
                        Log("\nresponse_code:" + www.responseCode);
                        Log("\nForm upload complete!");
                        Log("\ndownloadHandler: " + www.downloadHandler.text);
                        Log("Form upload complete!");
                    }
                }
                o.response_code = www.responseCode;
                ResultCallbackFunc(o, responseCallback);
                */
            }
        }
    }
}
