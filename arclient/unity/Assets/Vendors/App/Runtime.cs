//Philipp Fleck 2020
using Loonim;
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Security.Policy;
using UnityEngine;

//for testing
using System.Linq;

#if WINDOWS_UWP || true
using UnityEngine.XR.WSA;
#endif

namespace RR
{
    //TODO find a good way to do the typedef
    //delegate JSC  System.Func<Jint.Native.JsValue, Jint.Native.JsValue[], Jint.Native.JsValue>;
    using JSCallback = System.Func<Jint.Native.JsValue, Jint.Native.JsValue[], Jint.Native.JsValue>;
    //public delegate void JSCallback(Jint.Native.JsValue arg1, Jint.Native.JsValue[] argv);
    //public abstract class JSC : System.Func<Jint.Native.JsValue, Jint.Native.JsValue[], Jint.Native.JsValue>
    //{
    //}

    public static class Statics
    {
        public const string MAIN_PANEL_KEY = "Main";
        public const string CURRENT_ANCHOR = "CurrentAnchor";
        public const string UI_GO_NAME = "UI";



#if UNITY_EDITOR
        public const string RR_DEVICE = "EDITOR";
#elif UNITY_WSA
        public const string RR_DEVICE = "WSA";
#elif UNITY_ANDROID
        public const string RR_DEVICE = "ANDROID";
#elif UNITY_IOS || UNITY_IPHONE
        public const string RR_DEVICE = "IOS";
#else
        public const string RR_DEVICE = "NOTSET";
#endif 
    }

    public class Runtime : BaseManager<Runtime>
    {

        public JSCallback modelTracked = null;
        public Json.JSObject cfg = null;

        [Serializable]
        public class TestData
        {
            public int val1;
            public string val2;
            public float val3;
            public TestData(int a, string b, float c)
            {
                val1 = a;
                val2 = b;
                val3 = c;
            }
        }
        public static IList<TestData> testList = new List<TestData>();

        private void Awake()
        {
            GetStringFromCfg("test");

            gameObject.AddComponent<WAManager>();
            gameObject.AddComponent<Vizario.MQTTManager>();
            gameObject.AddComponent<HtmlUIManager>();
            gameObject.AddComponent<Vizario.ObjectKeeper>();
            gameObject.AddComponent<Vizario.VApp.jWeb>();
            gameObject.AddComponent<Vizario.AnchorManager>();

            gameObject.AddComponent<IATK.Replicator>();

            var world = new GameObject("world");
            var c = (GameObject)UnityEngine.GameObject.Instantiate(Resources.Load("Prefabs/xyz"));
            c.transform.parent = world.transform;

            var alignments = new GameObject("alignments");
            alignments.transform.parent = world.transform;
        }

        public List<GameObject> visPrefabs = new List<GameObject>();
        private GameObject configCanvas = null;

        private AudioSource audioSource = null;
        public AudioClip clickSoundClip;
        public AudioClip notificationSoundClick;

        // Start is called before the first frame update
        void Start()
        {
            Application.targetFrameRate = 30;

            //var configstr = Algo.ReadFile2Str("config.json");
            //cfg = Json.JSON.Parse(configstr);

            if (audioSource == null)
            {
                audioSource = gameObject.AddComponent<AudioSource>();
            }


            testV();

            //var mqttHost = "192.168.1.115";
            //int mqttPort = 1883;
            //Vizario.MQTTManager.SetHost(mqttHost, mqttPort);
            //Vizario.MQTTManager.StartClient();
            InitUi();

            //HtmlUIManager.GetRTInstance().CreateNotification(30, new Vector3(0, 0, 1f), 
            //    null, "test notification");

            //Debug.Log("BSSID=" + Algo.GetBSSID());

            DoLateTest();

            testList.Add(new TestData(1, "A some test", 1.2f));
            testList.Add(new TestData(2, "B some test", 1.3f));
            testList.Add(new TestData(3, "C some test", 1.4f));
            testList.Add(new TestData(4, "D some test", 1.5f));
            testList.Add(new TestData(5, "E some test", 1.6f));
            Debug.Log("LINQ C# ar[0].val1 => " + testList[0].val1);

            var t1 = from s in testList
                     where s.val2.Contains("C") || s.val2.Contains("D")
                     select s;

            Debug.Log("LINQ C# Q1 => #results=" + t1.Count<TestData>());
            foreach (var c in t1)
            {
                Debug.Log("LINQ C# Q1 => (" + c.val1 + ", " + c.val2 + ", " + c.val3 + ")");
            }

            var t2 = testList.Where(n => n.val1 > 3);
            Debug.Log("LINQ C# Q2 => #results=" + t2.Count<TestData>());
            foreach (var c in t2)
            {
                Debug.Log("LINQ C# Q2 => (" + c.val1 + ", " + c.val2 + ", " + c.val3 + ")");
            }

            //RunLinqJsTest((TestData d) => { return d.val1 > 0; });

            //var _Products = myEntities.ExecuteStoreQuery<Product>(@"SELECT * FROM Products WHERE [Name] In ('Item1', 'Item2')");
            //string query = "SELECT* FROM testList WHERE[Name] In('Item1', 'Item2')";
        }


        public static void RunLinqJsTest(JSCallback jscb)
        //public static void RunLinqJsTest(Func<TestData, bool> jscb)
        {
            Debug.Log("LINQ C# RunLinqJsTest ====");
            var t2 = testList.Where((TestData d) => {
                return jscb.Invoke(
                    new Jint.Native.JsValue("RunLinqJsTest"),
                    new Jint.Native.JsValue[] { JsonUtility.ToJson(d) }).AsBoolean();                
            });
            Debug.Log("LINQ C# Q2 RM WHERE => #results=" + t2.Count<TestData>());
            foreach (var c in t2)
            {
                Debug.Log("LINQ C# Q2 RM WHERE => (" + c.val1 + ", " + c.val2 + ", " + c.val3 + ")");
            }
        }

        public static void RunLinqJsTest2(System.Func<TestData, TestData, TestData> jscb)
        {
            Debug.Log("LINQ C# RunLinqJsTest2 ====");
            var t2 = testList.Aggregate(jscb);
            Debug.Log("LINQ C# Q2 RM Aggregate => (" + t2.val1 + ", " + t2.val2 + ", " + t2.val3 + ")");
        }

        public static IList<TestData> RunLinqFilter(IList<TestData> list, System.Func<TestData, bool> jscb)
        {
            Debug.Log("LINQ C# RunLinqFilter ====");
            var t2 = list.Where(jscb);
            Debug.Log("LINQ C# LF RM WHERE => #results=" + t2.Count<TestData>());
            foreach (var c in t2)
            {
                Debug.Log("LINQ C# LF RM WHERE => (" + c.val1 + ", " + c.val2 + ", " + c.val3 + ")");
            }
            //return (IList<TestData>)t2;
            return t2.ToList<TestData>();
        }

        public static string GetUrlPrefix()
        {
            var ntName = Algo.GetNetworkName();
            Debug.Log("Networkname => " + ntName);
            Algo.GetBSSID();
            Debug.Log("Networkname => after calling bssid!");
            //var urlPrefix = "http://172.23.48.1:8080";
            var urlPrefix = "http://localhost:8080";
            //var urlPrefix = "http://192.168.0.53/HtmlUi";
            //urlPrefix = "http://192.168.1.115:8080";
            //var urlPrefix = "http://10.0.0.2:8080";
            //urlPrefix = "http://192.168.1.115:8080";

            if (ntName == "dd-wrt")
            {
                urlPrefix = "http://192.168.2.124/HtmlUI";
            }

            if (ntName == "NETGEAR81-5G" || ntName == "NETGEAR81")
            {
                urlPrefix = "http://10.0.0.2:8080";
            }

            if (ntName == "zrga2" || ntName == "zrga2-5g")
            {
                urlPrefix = "http://192.168.1.115:8080";
            }

            string uiUrl = GetStringFromCfg("uiurl");
            if (uiUrl != null)
            {
                urlPrefix = uiUrl;
                Debug.Log("GetUrlPrefix from cfg => " + urlPrefix);
            }

            return urlPrefix;
        }

        public static string GetStringFromCfg(string key)
        {
            Debug.Log("GetStringFromCfg key=>" + key + ", cfg=>" + GetRTInstance().cfg);
            string ret = "";
            try
            {

                if (GetRTInstance().cfg == null)
                {
                    var configstr = Algo.ReadFile2Str("config.json");
                    GetRTInstance().cfg = Json.JSON.Parse(configstr);
                }

                if (GetRTInstance().cfg != null)
                {
                    ret = GetRTInstance().cfg[key].ToString();
                    Debug.Log("GetStringFromCfg found=>" + key + " => " + ret + ", (" + ret.GetType() + ")");
                }
            }
            catch (Exception err)
            {
                Debug.Log("GetStringFromCfg ERROR =>" + key + " => " + err);
            }
            return ret;
        }

        public void LoadConfigFromInputField(UnityEngine.UI.InputField inputField)
        {
            if(inputField != null)
            {
                //var uri = inputField.textComponent.text;
                var uri = inputField.text;
                if (uri.Length > 0)
                {
                    LoadConfigFromUrl(uri);
                }
            }
        }

        public Jint.Native.JsValue ConfigDownloadResponse(Jint.Native.JsValue a, Jint.Native.JsValue[] b)
        {
            return null;
        }
        public void LoadConfigFromUrl(string uri)
        {
            //System.Func<Jint.Native.JsValue, Jint.Native.JsValue[], Jint.Native.JsValue>
            Debug.Log("Trying to load config.json from: " + uri);
            string[] headers = { "content-type", "application/x-www-form-urlencoded" };
            //Vizario.VApp.jWeb.DownloadFile("GET", uri, headers, "config.json", false, ConfigDownloadResponse);
            Vizario.VApp.jWeb.DownloadFile("GET", uri, headers, "config.json", false, null);
            StartCoroutine(AfterConfigDownloadInit());
        }

        IEnumerator AfterConfigDownloadInit()
        {
            yield return new WaitForSeconds(1);
            InitUi();
        }

        public void InitUi()
        {
            var urlPrefix = GetUrlPrefix();

            if(urlPrefix == "")
            {
                Debug.Log("InitUi could NOT LOAD config.json!");
                return;
            }

            if (configCanvas == null)
            {
                configCanvas = GameObject.Find("ConfigCanvas");
            }

            configCanvas.SetActive(false);

            Debug.Log("InitUi urlPrefix=" + urlPrefix);
            var g = Vizario.ObjectKeeper.GetRTInstance().CreateOrGet(Statics.UI_GO_NAME);
            //var mp = HtmlUIManager.GetRTInstance().SpawnMainPanel(g, "http://10.0.0.2:8080/main.html", true);
            var mp = HtmlUIManager.GetRTInstance().SpawnMainPanel(g, urlPrefix + "/main.html", true);
            //mp.gameObject.AddComponent<Microsoft.MixedReality.Toolkit.Utilities.Solvers.RadialView>();
            //mp.gameObject.AddComponent<Microsoft.MixedReality.Toolkit.UI.Billboard>();

            /*
            bool faceCam = true;
            var gw = Vizario.ObjectKeeper.GetRTInstance().CreateOrGet("world");
            HtmlUIManager.GetRTInstance().CreateExternalPanel(gw, Vector3.one, Vector3.zero, Vector3.one,
                "mqtttestpanel", 500, 500, urlPrefix + "/test.html", true, faceCam, true, false,
                Vector2.zero, 1000, true);
                */
        }

        static public void StandHereUi()
        {
            GameObject.Find(Statics.MAIN_PANEL_KEY)
                .GetComponent<Microsoft.MixedReality.Toolkit.Utilities.Solvers.RadialView>()
                .enabled = false;
        }

        static public void FollowMeUi()
        {
            GameObject.Find(Statics.MAIN_PANEL_KEY)
                .GetComponent<Microsoft.MixedReality.Toolkit.Utilities.Solvers.RadialView>()
                .enabled = true;
        }

        static public GameObject CopyGo(GameObject src)
        {
            try
            {
                if (src != null)
                {
                    return GameObject.Instantiate(src);
                }
            }
            catch (Exception e)
            {
                Debug.Log("CopyGo ERROR => " + e);
            }
            return null;
        }

        static public GameObject CopyGoByName(string goName)
        {
            var go = GameObject.Find(goName);
            return CopyGo(go);
        }

        public static bool SetEventCallback(GameObject go, JSCallback cb)
        {
            Debug.Log("SetEventCallback ... ");
            if (go != null)
            {
                Debug.Log("SetEventCallback ... go.name=" + go.name);
                var c = go.GetComponent<JSSlider>();
                if (c != null)
                {
                    c.SetCallback(cb);
                    return true;
                }
            }
            return false;
        }

        public static void RegisterModelTrackedNotification(JSCallback fcb)
        {
            GetRTInstance().modelTracked = fcb;
        }

        public void DetectedObjectTracked(GameObject trackedObject)
        {
            Debug.Log("Found: " + trackedObject.name);
            modelTracked?.Invoke(
                           new Jint.Native.JsValue("ModelTracked"),
                           new Jint.Native.JsValue[] { true, trackedObject.name });
        }

        public void DetectedObjectTrackingLost(GameObject trackedObject)
        {
            Debug.Log("Lost: " + trackedObject.name);
            modelTracked?.Invoke(
                           new Jint.Native.JsValue("ModelTracked"),
                           new Jint.Native.JsValue[] { false, trackedObject.name });
        }

        public static GameObject CreateBezier(string bezName, string mTargetName, string mParentName)
        {
            return CreateLineTooltip(bezName, mTargetName, mParentName, true);
        }

        public static GameObject CreateLine(string bezName, string mTargetName, string mParentName, string text)
        {
            var go = CreateLineTooltip(bezName, mTargetName, mParentName, false);
            var tt = go.GetComponent<Microsoft.MixedReality.Toolkit.UI.ToolTip>();
            if (tt)
            {
                tt.ToolTipText = text;
            }
            return go;
        }

        public static GameObject CreateLineTooltip(string bezName, string mTargetName, string mParentName, bool isBezier)
        {
            GameObject bGo = null;
            var targetGo = GameObject.Find(mTargetName);
            if (targetGo != null)
            {
                if (isBezier)
                {
                    bGo = GetVisPrefabInstance("MyBezier", bezName);
                }
                else
                {
                    bGo = GetVisPrefabInstance("MySimpleLine", bezName);
                }

                var tt = bGo.GetComponent<Microsoft.MixedReality.Toolkit.UI.ToolTip>();
                tt.ToolTipText = "T";

                var ttc = bGo.GetComponent<Microsoft.MixedReality.Toolkit.UI.ToolTipConnector>();
                ttc.Target = targetGo;

                var parentGo = GameObject.Find(mParentName);
                if (parentGo != null)
                {
                    bGo.transform.parent = parentGo.transform;
                    bGo.transform.localPosition = Vector3.zero;
                    bGo.transform.localRotation = Quaternion.identity;
                    bGo.transform.localScale = Vector3.one;

                    foreach (var ct in bGo.GetComponentsInChildren<Transform>())
                    {
                        ct.localPosition = Vector3.zero;
                        ct.localRotation = Quaternion.identity;
                        ct.localScale = Vector3.one;
                    }
                }
            }
            return bGo;
        }



        /// 
        /// Vuforia Stuff
        /// 

        //testing?
        public void testV()
        {
            //test bezier
            /*
            var m = gameObject.GetComponent<u2vis.MultiDimDataPresenter>();
            m.AxisPresenters[0].LabelOrientation = u2vis.LabelOrientation.Orthogonal; // 2
            var a = gameObject.GetComponentsInChildren<u2vis.GenericAxisView>();
            a[1].AxisPresenter.LabelOrientation = u2vis.LabelOrientation.Orthogonal;
            a[1].AxisPresenter.IsCategorical = true;
            a[1].AxisPresenter.TickIntervall = 2;

            a[1].AxisPresenter.GenerateFromDiscreteRange(2000, 2020);

            a[0].AxisPresenter.Caption = "test";
            */

            return;
            Debug.Log("VUFU persPath=" + Application.persistentDataPath);
            Debug.Log("VUFU streamPath=" + Application.streamingAssetsPath);

            //Vuforia.VuforiaARController.Instance.RegisterVuforiaStartedCallback(OnVuforiaStarted);
            //Vuforia.VuforiaARController.Instance.RegisterVuforiaStartedCallback(OnVufoStartCB);

            var xmlPath = Path.Combine(Application.persistentDataPath, "rockpro64_clean_centered_scaled.xml");
            Debug.Log("VUFU xmlPath=" + xmlPath);
            //LoadAndActivateDataset(xmlPath);
            StartCoroutine(LateInitVufo("", xmlPath));
        }

        public static void StartDeviceTracking(string tragetGo, string xmlDataFile)
        {
            Debug.Log("VUFU StartDeviceTracking persPath=" + Application.persistentDataPath);
            Debug.Log("VUFU StartDeviceTracking streamPath=" + Application.streamingAssetsPath);
            Debug.Log("VUFU StartDeviceTracking xmlDataFile=" + xmlDataFile);

            if (xmlDataFile.Length > 0)
            {
                var xmlPath = Path.Combine(Application.persistentDataPath, xmlDataFile);
                Debug.Log("VUFU xmlPath=" + xmlPath);
                Runtime.GetRTInstance().StartCoroutine(Runtime.GetRTInstance().LateInitVufo(tragetGo, xmlPath));
            }
        }

        public static void StartImgTracking(JSCallback targetFoundCb, JSCallback targetLostCb, string xmlDataFile)
        {
            Debug.Log("VUFO StartImgTracking persPath=" + Application.persistentDataPath);
            Debug.Log("VUFO StartImgTracking streamPath=" + Application.streamingAssetsPath);
            Debug.Log("VUFO StartImgTracking xmlDataFile=" + xmlDataFile);

            if (xmlDataFile.Length > 0)
            {
                var xmlPath = Path.Combine(Application.persistentDataPath, xmlDataFile);
                Debug.Log("VUFO xmlPath=" + xmlPath);
                Runtime.GetRTInstance().StartCoroutine(
                    Runtime.GetRTInstance().LateInitVufoImgTracking(targetFoundCb, targetLostCb, xmlPath));
            }
        }

        public IEnumerator LateInitVufoImgTracking(JSCallback targetFoundCb,
            JSCallback targetLostCb, string loadThisDataset)
        {
            Vuforia.VuforiaRuntime.Instance.InitVuforia();
            yield return new WaitForSeconds(.3f);

            var vb = Camera.main.GetComponent<Vuforia.VuforiaBehaviour>();
            vb.enabled = true;

            int targetFps = Vuforia.VuforiaRenderer.Instance.GetRecommendedFps(Vuforia.VuforiaRenderer.FpsHint.NO_VIDEOBACKGROUND);
            Debug.Log("LateInitVufoImgTracking Setting fps " + Application.targetFrameRate + " vs " + targetFps);
            if (Application.targetFrameRate != targetFps)
            {
                Debug.Log("LateInitVufoImgTracking Setting frame rate to " + targetFps + "fps");
                Application.targetFrameRate = targetFps;
            }
            Application.targetFrameRate = 30;

            yield return new WaitForSeconds(2f);
            LoadAndActivateImgDataset(targetFoundCb, targetLostCb, loadThisDataset);
        }

        static bool sinlgeRunImg = false;
        public static void LoadAndActivateImgDataset(JSCallback targetFoundCb,
            JSCallback targetLostCb, string loadThisDataset)
        {
            if (sinlgeRunImg)
            {
                return;
            }
            sinlgeRunImg = true;

            Debug.Log("VUFO IMG LAD 0 loadThisDataset => " + loadThisDataset);
            Vuforia.TrackerManager trackerManager = (Vuforia.TrackerManager)Vuforia.TrackerManager.Instance;

            if (trackerManager == null)
            {
                Debug.Log("VUFO IMG LAD 0 ERROR => trackerManager is null!");
            }

            Debug.Log("VUFO LAD 1");

            Vuforia.ObjectTracker objectTracker = Vuforia.TrackerManager.Instance.GetTracker<Vuforia.ObjectTracker>();

            if (objectTracker == null)
            {
                Debug.Log("VUFO LAD 1 ERROR => objectTracker is null!");
                objectTracker = Vuforia.TrackerManager.Instance.InitTracker<Vuforia.ObjectTracker>();
                if (objectTracker == null)
                {
                    Debug.Log("VUFO LAD 1b ERROR => objectTracker is null! InitTracker failed!");
                    return;
                }
            }

            //Vuforia.ModelTargetBehaviour a;
            //a.

            Debug.Log("VUFO LAD 2 objectTracker=>" + objectTracker);
            //Stop the tracker.
            objectTracker.Stop();

            Debug.Log("VUFO LAD 3");

            //Create a new dataset object.
            Vuforia.DataSet dataset = objectTracker.CreateDataSet();


            Debug.Log("VUFO LAD 4");

            //Load and activate the dataset if it exists.
            var dsE = Vuforia.DataSet.Exists(loadThisDataset);
            Debug.Log("VUFO LAD 4a " + loadThisDataset + " => " + dsE);

            if (dsE)
            {
                Debug.Log("VUFO LAD 5");
                var ret = dataset.Load(loadThisDataset);
                Debug.Log("VUFO LAD 5 ret=" + ret);
            }
            else
            {
                Debug.Log("VUFO LAD 5b");
                var ret = dataset.Load(loadThisDataset, Vuforia.VuforiaUnity.StorageType.STORAGE_ABSOLUTE);
                Debug.Log("VUFO LAD 5b ret=" + ret);
            }

            var adsRet = objectTracker.ActivateDataSet(dataset);
            Debug.Log("VUFO 5c adsRet = " + adsRet);


            var targetFinders = objectTracker.GetTargetFinders();
            foreach (var tf in targetFinders)
            {
                Debug.Log("VUFO 5d tf...");
                var objTargets = tf.GetObjectTargets();
                foreach (var ot in objTargets)
                {
                    Debug.Log("VUFO 5e => " + ot.Name + " -- " + ot.ID);
                }
            }

            Debug.Log("VUFO LAD 6");
            //Start the object tracker.
            bool trackerStart = objectTracker.Start();
            Debug.Log("VUFO LAD 6b => " + trackerStart);


            Debug.Log("VUFO LAD 7");


            // Accessing dynamicalyy created trackables and re-assinging them

            int counter = 0;
            IEnumerable<Vuforia.TrackableBehaviour> tbs =
                Vuforia.TrackerManager.Instance.GetStateManager().GetTrackableBehaviours();

            foreach (Vuforia.TrackableBehaviour tb in tbs)
            {
                // This will filter by trackables that haven't been defined previously in the scene.
                if (tb.name == "New Game Object")
                {
                    // Change generic name to include trackable name
                    tb.gameObject.name = "VIT-" + ++counter + "-" + tb.TrackableName;

                    var dteh = tb.gameObject.AddComponent<DefaultTrackableEventHandler>();
                    var dtob = tb.gameObject.AddComponent<Vuforia.TurnOffBehaviour>();
                    //dteh.StatusFilter = DefaultTrackableEventHandler.TrackingStatusFilter.Tracked;
                    dteh.StatusFilter = DefaultTrackableEventHandler.TrackingStatusFilter.Tracked_ExtendedTracked;

                    if (dteh != null)
                    {
                        dteh.OnTargetFound = new UnityEngine.Events.UnityEvent();
                        dteh.OnTargetLost = new UnityEngine.Events.UnityEvent();

                        dteh.OnTargetFound.AddListener(() =>
                        {
                            if (targetFoundCb != null)
                            {
                                targetFoundCb?.Invoke(
                                    new Jint.Native.JsValue("ImageTracked"),
                                    new Jint.Native.JsValue[] { tb.TrackableName, tb.gameObject.name });
                            }
                        });

                        dteh.OnTargetLost.AddListener(() =>
                        {
                            if (targetLostCb != null)
                            {
                                targetLostCb?.Invoke(
                                    new Jint.Native.JsValue("ImageTracked"),
                                    new Jint.Native.JsValue[] { tb.TrackableName, tb.gameObject.name });
                            }
                        });
                    }
                    else
                    {
                        Debug.Log("VUFO dteh is NULL");
                    }
                }
            }

        }


        public IEnumerator LateInitVufo(string targetGo, string loadThisDataset)
        {
            Vuforia.VuforiaRuntime.Instance.InitVuforia();

            yield return new WaitForSeconds(.3f);

            var vb = Camera.main.GetComponent<Vuforia.VuforiaBehaviour>();
            vb.enabled = true;

            yield return new WaitForSeconds(2f);

            int targetFps = Vuforia.VuforiaRenderer.Instance.GetRecommendedFps(Vuforia.VuforiaRenderer.FpsHint.NO_VIDEOBACKGROUND);
            Debug.Log("LateInitVufo Setting fps " + Application.targetFrameRate + " vs " + targetFps);
            if (Application.targetFrameRate != targetFps)
            {
                Debug.Log("LateInitVufo Setting frame rate to " + targetFps + "fps");
                Application.targetFrameRate = targetFps;
            }

            LoadAndActivateDataset(targetGo, loadThisDataset);
        }



        static bool sinlgeRun = false;
        public static void LoadAndActivateDataset(string targetGo, string loadThisDataset)
        {
            if (sinlgeRun)
            {
                return;
            }
            sinlgeRun = true;
            //TODO Stop Trackers
            //TODO reset on start
            Debug.Log("VUFO LAD 0 loadThisDataset => " + loadThisDataset);
            Vuforia.TrackerManager trackerManager = (Vuforia.TrackerManager)Vuforia.TrackerManager.Instance;


            if (trackerManager == null)
            {
                Debug.Log("VUFO LAD 0 ERROR => trackerManager is null!");
            }

            Debug.Log("VUFO LAD 1");
            Vuforia.ObjectTracker objectTracker = Vuforia.TrackerManager.Instance.GetTracker<Vuforia.ObjectTracker>();

            if (objectTracker == null)
            {
                Debug.Log("VUFO LAD 1 ERROR => objectTracker is null!");
                objectTracker = Vuforia.TrackerManager.Instance.InitTracker<Vuforia.ObjectTracker>();
                if (objectTracker == null)
                {
                    Debug.Log("VUFO LAD 1b ERROR => objectTracker is null! InitTracker failed!");
                    return;
                }
            }

            //Vuforia.ModelTargetBehaviour a;
            //a.

            Debug.Log("VUFO LAD 2 objectTracker=>" + objectTracker);
            //Stop the tracker.
            objectTracker.Stop();

            Debug.Log("VUFO LAD 3");

            //Create a new dataset object.
            Vuforia.DataSet dataset = objectTracker.CreateDataSet();


            Debug.Log("VUFO LAD 4");

            //Load and activate the dataset if it exists.
            var dsE = Vuforia.DataSet.Exists(loadThisDataset);
            Debug.Log("VUFO LAD 4a " + loadThisDataset + " => " + dsE);

            if (dsE)
            {
                Debug.Log("VUFO LAD 5");
                var ret = dataset.Load(loadThisDataset);
                Debug.Log("VUFO LAD 5 ret=" + ret);
            }
            else
            {
                Debug.Log("VUFO LAD 5b");
                var ret = dataset.Load(loadThisDataset, Vuforia.VuforiaUnity.StorageType.STORAGE_ABSOLUTE);
                Debug.Log("VUFO LAD 5b ret=" + ret);
            }

            var adsRet = objectTracker.ActivateDataSet(dataset);
            Debug.Log("VUFO 5c adsRet = " + adsRet);


            var targetFinders = objectTracker.GetTargetFinders();
            foreach (var tf in targetFinders)
            {
                Debug.Log("VUFO 5d tf...");
                var objTargets = tf.GetObjectTargets();
                foreach (var ot in objTargets)
                {
                    Debug.Log("VUFO 5e => " + ot.Name + " -- " + ot.ID);
                }
            }

            Debug.Log("VUFO LAD 6");
            //Start the object tracker.
            bool trackerStart = objectTracker.Start();
            Debug.Log("VUFO LAD 6b => " + trackerStart);


            Debug.Log("VUFO LAD 7");


            // Accessing dynamicalyy created trackables and re-assinging them

            int counter = 0;
            IEnumerable<Vuforia.TrackableBehaviour> tbs =
                Vuforia.TrackerManager.Instance.GetStateManager().GetTrackableBehaviours();

            foreach (Vuforia.TrackableBehaviour tb in tbs)
            {
                // This will filter by trackables that haven't been defined previously in the scene.
                if (tb.name == "New Game Object")
                {
                    // Change generic name to include trackable name
                    tb.gameObject.name = "VIT-" + ++counter + "-" + tb.TrackableName;
                    // Add additional script components for trackable
                    var dteh = tb.gameObject.AddComponent<DefaultTrackableEventHandler>();
                    var dtob = tb.gameObject.AddComponent<Vuforia.TurnOffBehaviour>();
                    // This section will add an augmentation based off the GameObject defined on the script.
                    // Replace this with whatever you prefer to augment

                    if (dteh != null)
                    {
                        dteh.OnTargetFound = new UnityEngine.Events.UnityEvent();
                        dteh.OnTargetLost = new UnityEngine.Events.UnityEvent();

                        dteh.OnTargetFound.AddListener(() =>
                        {
                            Debug.Log("VUFO OnTargetFound  => " + tb.TrackableName + ", looking for => " + targetGo);
                            var tGo = GameObject.Find(targetGo);
                            if (tGo != null)
                            {
                                //tGo.GetComponent<RotateObject>()?.Pause();
                                tGo.transform.parent = tb.transform;
                                tGo.transform.localPosition = Vector3.zero;
                                tGo.transform.localRotation = Quaternion.identity;
                                tGo.transform.localScale = Vector3.one;
                            }
                        });

                        dteh.OnTargetLost.AddListener(() =>
                        {
                            Debug.Log("VUFO OnTargetLost  => " + tb.TrackableName + ", looking for => " + targetGo);
                            var tGo = GameObject.Find(targetGo);
                            if (tGo != null)
                            {
                                //tGo.GetComponent<RotateObject>()?.Pause();
                            }
                        });
                    }
                    else
                    {
                        Debug.Log("VUFO dteh is NULL");
                    }
                }
            }
        }

        public GameObject GetVisPrefabImple(string name)
        {
            if (visPrefabs != null)
            {
                foreach (var p in visPrefabs)
                {
                    if (p.name == name)
                    {
                        return p;
                    }
                }
            }
            return null;
        }

        public List<string> GetVisPrefabNamesImple()
        {
            List<string> pnames = new List<string>();
            if (visPrefabs != null)
            {
                foreach (var p in visPrefabs)
                {
                    pnames.Add(p.name);
                }
            }
            return (pnames.Count > 0) ? pnames : null;
        }

        public static GameObject GetVisPrefab(string name)
        {
            return GetRTInstance().GetVisPrefabImple(name);
        }

        public GameObject GetVisPrefabInstanceImple(string visName, string targetGoName)
        {
            GameObject go = null;
            var p = GetVisPrefab(visName);
            if (p != null)
            {
                go = GameObject.Instantiate(p);
                go.name = targetGoName;
                /*var tdp = go.GetComponent<u2vis.TestDataProvider>();
                if (tdp != null)
                {
                    tdp.enabled = false;
                    Destroy(tdp);
                }*/
            }
            return go;
        }

        public static GameObject GetVisPrefabInstance(string visName, string targetGoName)
        {
            return GetRTInstance().GetVisPrefabInstanceImple(visName, targetGoName);
        }

        public static void TriggerReInitChart(string goName)
        {
            Debug.Log("TriggerReInitChart => " + goName);
            var go = GameObject.Find(goName);
            if (go != null)
            {
                var bvv = go.GetComponent<u2vis.BaseVisualizationView>();
                var gdp = go.GetComponent<u2vis.GenericDataPresenter>();

                if (bvv != null)
                {
                    Debug.Log("TriggerReInitChart => bvv=" + bvv.GetType());
                    bvv.RebindPresenter();
                    bvv.Rebuild();
                    bvv.RebindPresenter();
                    bvv.Rebuild();
                }
                Debug.Log("TriggerReInitChart => updated, starting specifics ...");
                go.GetComponent<u2vis.BarChart2D>()?.RebindPresenter();
                go.GetComponent<u2vis.BarChart2D>()?.Rebuild();
            }
            else
            {
                Debug.Log("TriggerReInitChart => " + goName + " NOT FOUND!");
            }
        }

        public static string[] GetVisPrefabNames()
        {
            return GetRTInstance().GetVisPrefabNamesImple().ToArray();
        }

        public static Microsoft.MixedReality.Toolkit.UI.Billboard GetOrAddBillboard(GameObject go)
        {
            if (go != null)
            {
                var bb = AddOrGetComponent<Microsoft.MixedReality.Toolkit.UI.Billboard>(go, true);
                return bb;
            }
            return null;
        }

        public static Microsoft.MixedReality.Toolkit.UI.ButtonConfigHelper GetMRTKButtonHelper(GameObject go)
        {
            if (go != null)
            {
                return go.GetComponent<Microsoft.MixedReality.Toolkit.UI.ButtonConfigHelper>();
            }
            return null;
        }

        public static Microsoft.MixedReality.Toolkit.Experimental.UI.BoundsControl.BoundsControl ToggleBounds(string goName)
        {
            var go = GameObject.Find(goName);
            if (go != null)
            {
                var bc = ToogleComponent<Microsoft.MixedReality.Toolkit.Experimental.UI.BoundsControl.BoundsControl>(go);
                return bc;
            }
            return null;
        }

        public static Microsoft.MixedReality.Toolkit.Utilities.Solvers.TapToPlace ToggleTapToPlace(string goName)
        {
            var go = GameObject.Find(goName);
            if (go != null)
            {
                var c = ToogleComponent<Microsoft.MixedReality.Toolkit.Utilities.Solvers.TapToPlace>(go);
                return c;
            }
            return null;
        }

        public static Microsoft.MixedReality.Toolkit.UI.ObjectManipulator ToggleObjManipulation(string goName)
        {
            var go = GameObject.Find(goName);
            if (go != null)
            {
                var c = ToogleComponent<Microsoft.MixedReality.Toolkit.UI.ObjectManipulator>(go);
                return c;
            }
            return null;
        }

        public static Microsoft.MixedReality.Toolkit.Utilities.GridObjectCollection GetGridObjectCollection(GameObject go)
        {
            if (go != null)
            {
                var c = go.GetComponent<Microsoft.MixedReality.Toolkit.Utilities.GridObjectCollection>();
                return c;
            }
            return null;
        }

        public static BoxCollider AddBoxCollider(GameObject go)
        {
            if (go != null)
            {
                var bc = go.AddComponent<BoxCollider>();
                return bc;
            }
            return null;
        }

        public static T ToogleComponent<T>(GameObject go) where T : MonoBehaviour
        {
            if (go != null)
            {
                var bc = AddOrGetComponent<T>(go, false);
                if (bc != null)
                {
                    bc.enabled = !bc.enabled;
                }
                return bc;
            }
            return null;
        }



        public static T AddOrGetComponent<T>(GameObject go, bool initialActive) where T : MonoBehaviour
        {
            if (go != null)
            {
                T c = go.GetComponent<T>();
                if (c == null)
                {
                    c = go.AddComponent<T>();
                    c.enabled = initialActive;
                }
                return c;
            }
            return null;
        }

        public static void DestroyGO(GameObject go)
        {
            try
            {
                if (go != null)
                {
                    var cmps = go.GetComponentsInChildren<Component>();
                    foreach (var c in cmps)
                    {
                        if (c != null && !(c is Transform))
                        {
                            //Destroy(c);
                            //Resources.UnloadAsset(c);
                            DestroyImmediate(c, true);
                        }
                    }
                    //Destroy(go);
                    //Resources.UnloadAsset(go);
                    DestroyImmediate(go, true);

                }
            }
            catch (Exception err)
            {
                Debug.LogError("DestroyGO ERROR => " + err);
            }
            //Resources.UnloadUnusedAssets();
            //GC.Collect();
        }

        public static bool IsNull(UnityEngine.Object obj)
        {
            try
            {
                return obj == null;
            }
            catch (MissingReferenceException)
            {
                return true;
            }
            catch (Exception err)
            {
                Debug.LogError("IsNull ERROR => " + err);
            }

            return true;
        }

        void VufoOnTargetFound()
        {

        }



        private void OnVuforiaStarted()
        {
            Debug.Log("OnVuforiaStarted ...");
            // Query Vuforia for recommended frame rate and set it in Unity
            int targetFps = Vuforia.VuforiaRenderer.Instance.GetRecommendedFps(Vuforia.VuforiaRenderer.FpsHint.NO_VIDEOBACKGROUND);

            // By default, we use Application.targetFrameRate to set the recommended frame rate.
            // If developers use vsync in their quality settings, they should also set their
            // QualitySettings.vSyncCount according to the value returned above.
            // e.g: If targetFPS > 50 --> vSyncCount = 1; else vSyncCount = 2;
            if (Application.targetFrameRate != targetFps)
            {
                Debug.Log("OnVuforiaStarted Setting frame rate to " + targetFps + "fps");
                Application.targetFrameRate = targetFps;
            }
        }

        /*
        void OnVuforiaStarted()
        {
            Debug.Log("VUFO OnVuforiaStarted ...!");
            int counter = 0;
            // Loop through all activated trackables
            IEnumerable<Vuforia.TrackableBehaviour> tbs =
                Vuforia.TrackerManager.Instance.GetStateManager().GetTrackableBehaviours();

            if (tbs != null)
            {

            }
            else
            {
                Debug.Log("VUFO OnVuforiaStarted ... tbs is NULL");
            }
        }*/


        public static List<Func<string, string, string>> streamParserCbs = new List<Func<string, string, string>>();

        public static Func<string, string, string> GetParserFunc(int id)
        {
            return streamParserCbs[id];
        }

        public static void SetMqttParserFuncFromList(int id, string topic)
        {
            Debug.Log("SetMqttParserFuncFromList => id="+id + ", topic=" + topic);
            Vizario.MQTTManager.RegisterCallbackTopicCs(streamParserCbs[id], topic);
        }

        public static void SetReplicatorCallbacks(IATK.Replicator repl,
            JSCallback publish, JSCallback publishDatasource,
            JSCallback getStreamData, JSCallback newVisSpawnNotification)
        {
            if (repl != null)
            {
                repl.Publish = (string id, string payload) =>
                {
                    publish?.Invoke(new Jint.Native.JsValue("Replicator"),
                           new Jint.Native.JsValue[] { id, payload });
                    return id;
                };

                repl.PublishDatasource = (string id, string payload) =>
                {
                    publishDatasource?.Invoke(new Jint.Native.JsValue("Replicator"),
                           new Jint.Native.JsValue[] { id, payload });
                    return id;
                };

                repl.GetStreamData = (string uri, Func<string, string, string> OnNewData) =>
                {
                    streamParserCbs.Add(OnNewData);
                    var id = streamParserCbs.Count - 1;

                    getStreamData?.Invoke(
                        new Jint.Native.JsValue("repl.GetStreamData"),
                        new Jint.Native.JsValue[] { uri, /*JsonUtility.ToJson(OnNewData)*/ id });
                    return uri;
                };

                repl.NewVisSpawnNotification = (string id) =>
                {
                    newVisSpawnNotification?.Invoke(new Jint.Native.JsValue("Replicator"),
                           new Jint.Native.JsValue[] { id });
                    return id;
                };
            }
        }

        public static void PlayClickSound()
        {
            var rt = GetRTInstance();
            if (rt != null && rt.audioSource != null && rt.clickSoundClip != null)
            {
                rt.audioSource.PlayOneShot(rt.clickSoundClip);
            }
        }

        public static void PlayNotificationSound()
        {
            var rt = GetRTInstance();
            if (rt != null && rt.audioSource != null && rt.notificationSoundClick != null)
            {
                rt.audioSource.PlayOneShot(rt.notificationSoundClick);
            }
        }

        public static void PrepareInteractionGo(GameObject go, JSCallback enterCB, JSCallback exitCB, string data)
        {
            try
            {
                if (go != null)
                {
                    Debug.LogError("PrepareInteractionGo go ... adding rigid body");
                    var rb = go.GetComponent<Rigidbody>();
                    if (rb == null)
                    {
                        rb = go.AddComponent<Rigidbody>();
                    }
                    rb.isKinematic = true;

                    Debug.LogError("PrepareInteractionGo go ... adding box collider");
                    var col = go.GetComponent<BoxCollider>();
                    if (col == null)
                    {
                        col = go.AddComponent<BoxCollider>();
                    }
                    col.isTrigger = true;
                    //col.size = new Vector3(1, 1, 1);

                    Debug.LogError("PrepareInteractionGo go ... adding VZTrigger");

                    var myt = go.AddComponent<VZTrigger>();
                    myt.enterC = enterCB;
                    myt.exitC = exitCB;
                    myt.data = data;
                }
                else
                {
                    Debug.LogError("PrepareInteractionGo go is NULL! aborting...");
                }
            }
            catch (Exception err)
            {
                Debug.LogError("PrepareInteractionGo ERROR => " + err);
            }
        }


        public void DoLateTest()
        {
            //StartCoroutine(LateStartTest());
        }

        /*
        IEnumerator LateStartTest()
        {
            yield return new WaitForSeconds(5);
            //StartUnityStream();
        }

        public NatSuite.Recorders.Inputs.CameraInputBufferShare cameraInputBS;
        public NatSuite.Recorders.Clocks.RealtimeClock clockBS;
        public static void StartUnityStream()
        {
            //Camera[] cams = {Camera.}
            GetRTInstance().clockBS = new NatSuite.Recorders.Clocks.RealtimeClock();
            GetRTInstance().cameraInputBS = new NatSuite.Recorders.Inputs.CameraInputBufferShare(null, Screen.width, Screen.height, GetRTInstance().clockBS, Camera.main);
        }*/
    }
}
