//#define V1 //just Hololens
#define V2 //holo+ios ifdef

#if V2
using System;
using System.IO;
using System.Collections.Generic;
using System.Globalization;
#if UNITY_IOS
using System.Threading.Tasks;
using System.Collections;
#endif

using UnityEngine;
#if UNITY_IOS
using UnityEngine.XR.ARFoundation;
#endif

#if UNITY_WSA
using Microsoft.MixedReality.SceneUnderstanding;
using Microsoft.MixedReality.SceneUnderstanding.Samples.Unity;
using SceneUnderstanding = global::Microsoft.MixedReality.SceneUnderstanding;
#endif

using JSCallback = System.Func<Jint.Native.JsValue, Jint.Native.JsValue[], Jint.Native.JsValue>;

namespace Vizario.RegistrationLib
{
//#if UNITY_IOS
//    [RequireComponent(typeof(ARPlaneManager))]
//    [RequireComponent(typeof(ARSession))]
//#endif
    public class PlaneDetectionController : MonoBehaviour {

        //====================================================================================================

        public JSCallback extLogCallback = null;
        private void LogConsole(string msg) {
#if UNITY_WSA
            if (m_ARPlaneManager != null) {
                m_ARPlaneManager.LogConsole(msg);
            }
#endif
            extLogCallback?.Invoke(
                new Jint.Native.JsValue("PDCLOG"),
                new Jint.Native.JsValue[] { msg });
        }

        //====================================================================================================

        /// <summary>
        /// Write Database File for Matlab conversion.
        /// </summary>
        private void WriteDatabaseFile(out string filename) {
#if UNITY_WSA
            // assemble file name based on current date/time
            CultureInfo invC = CultureInfo.InvariantCulture;
            TimeZoneInfo cestZone = TimeZoneInfo.FindSystemTimeZoneById("Central Europe Standard Time");
            DateTime cestTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, cestZone);
            
            string fntrunk = cestTime.ToString(fmt, invC);
            filename = cad_model_file_prefix + fntrunk + cad_model_file_suffix;

            // retrieve, save and export to OBJ
            PlaneCollection planecollection = GetActualPlaneCollection(m_ARPlaneManager);
            PlaneCollection.SavePlaneCollectionToFile(planecollection, filename);
#elif UNITY_IOS
            // assemble file name based on current date/time
            string fntrunk = DateTime.Now.ToString(fmt, DateTimeFormatInfo.InvariantInfo);
            filename = cad_model_file_prefix + fntrunk + cad_model_file_suffix;

            // retrieve, save and export to OBJ
            PlaneCollection planecollection = PlaneCollection.GetActualPlaneCollection(m_ARPlaneManager);
            PlaneCollection.SavePlaneCollectionToFile(planecollection, filename);
#endif
        }

        //====================================================================================================
#if UNITY_WSA
        public Scene GetLatestDeserializedScene() {
            Scene sceneToReturn = null;

            SceneFragment sceneFragment = m_ARPlaneManager.GetLatestSceneSerialization();
            if (sceneFragment == null) {
                Debug.LogWarning("GetLatestDeserializedScene: SceneFragment is null.");
                return null;
            }

            // Deserialize the scene.
            SceneFragment[] sceneFragmentsArray = new SceneFragment[1] { sceneFragment };
            sceneToReturn = SceneUnderstanding.Scene.FromFragments(sceneFragmentsArray);

            if (sceneToReturn == null) {
                Debug.LogWarning("GetLatestDeserializedScene: Scene is null");
            }

            return sceneToReturn;
        }
        
        public PlaneCollection GetActualPlaneCollection(SceneUnderstandingManager planeManager) {
            // List of all SceneObjectKind enum values.
            List<SceneObjectKind> sceneObjectKinds = new List<SceneObjectKind>();
            sceneObjectKinds.Add(SceneObjectKind.Background);
            sceneObjectKinds.Add(SceneObjectKind.Platform);

            SceneUnderstanding.Scene scene = GetLatestDeserializedScene();

            // Retrieve a transformation matrix that will allow us orient the Scene Understanding Objects into
            // their correct corresponding position in the unity world
            System.Numerics.Matrix4x4? sceneToUnityTransformAsMatrix4x4 = m_ARPlaneManager.GetSceneToUnityTransformAsMatrix4x4(scene, true);

            GameObject SceneRootObject = new GameObject();
            SceneRootObject.transform.position = Vector3.zero;
            SceneRootObject.transform.rotation = Quaternion.identity;
            m_ARPlaneManager.SetUnityTransformFromMatrix4x4(SceneRootObject.transform, sceneToUnityTransformAsMatrix4x4.Value, true);

            // Common code
            PlaneCollection collection = new PlaneCollection();
            int count = 0;

            foreach (SceneUnderstanding.SceneObjectKind soKind in sceneObjectKinds) {

                foreach (SceneUnderstanding.SceneObject suObject in scene.SceneObjects) {

                    if (suObject.Kind != soKind) {
                        continue;
                    }

                    IEnumerable<SceneUnderstanding.SceneMesh> meshes = suObject.Meshes;
                    if (meshes == null) {
                        continue;
                    }

                    // This gameobject will hold all the geometry that represents the Scene Understanding Object
                    GameObject unityParentHolderObject = new GameObject(suObject.Kind.ToString());
                    unityParentHolderObject.transform.parent = SceneRootObject.transform;

                    // Scene Understanding uses a Right Handed Coordinate System and Unity uses a left handed one, convert.
                    System.Numerics.Matrix4x4 converted4x4LocationMatrix = m_ARPlaneManager.ConvertRightHandedMatrix4x4ToLeftHanded(suObject.GetLocationAsMatrix());
                    // From the converted Matrix pass its values into the unity transform (Numerics -> Unity.Transform)
                    m_ARPlaneManager.SetUnityTransformFromMatrix4x4(unityParentHolderObject.transform, converted4x4LocationMatrix, true);

                    // This list will keep track of all the individual objects that represent the geometry of
                    // the Scene Understanding Object
                    GameObject unityGeometryObject = new GameObject(suObject.Kind.ToString() + "Mesh/Plane");

                    // For all the Unity Game Objects that represent The Scene Understanding Object
                    // Of this iteration, make sure they are all children of the UnityParent object
                    // And that their local postion and rotation is relative to their parent
                    unityGeometryObject.transform.parent = unityParentHolderObject.transform;
                    unityGeometryObject.transform.localPosition = Vector3.zero;

                    if(m_ARPlaneManager.AlignSUObjectsNormalToUnityYAxis) {
                        // If our Vertex Data is rotated to have it match its Normal to Unity's Y axis, we need to offset the rotation
                        // in the parent object to have the object face the right direction
                        unityGeometryObject.transform.localRotation = Quaternion.Euler(-90.0f, 0.0f, 0.0f);
                    }
                    else {
                        //Otherwise don't rotate
                        unityGeometryObject.transform.localRotation = Quaternion.identity;
                    }


                    // This is the important part
                    // These are equal to SceneRootObject.transform * suObject.GetLocationAsMatrix()
                    Vector3 plane_position = unityParentHolderObject.transform.position;
                    Quaternion plane_orientation = unityParentHolderObject.transform.rotation;


                    Matrix4x4 m = Matrix4x4.TRS(plane_position, plane_orientation, Vector3.one);

                    // Here we need to transform the plane normal because Unity uses Left handed Coordinate system and Scene Understanding SDK uses Right Handed.
                    // The third column (row-wise) of the rotation/orientation matrix holds the (Right Handed) normal of the plane (Z-axis).
                    // The transformation "m" rotates the normal to match Unity's coordinate system Down Axis (Y axis).
                    // The SceneUnderstanding SDK does a local rotation of 180 degrees to convert the Right Handed vertices to Left Handed ones.
                    // Therefore, in order to match Unity's coordinate system UP Axis (Y axis), we rotate/invert/reverse/negate the normal of the plane (and the plane equation).
                    Vector3 plane_normal = new Vector3(-m[0,2], -m[1,2], -m[2,2]);
                    plane_normal.Normalize();

                    // Common code
                    PlaneDefinition thisPlane = new PlaneDefinition(count++);
                    thisPlane.m_color = new Vector3(1.0f, 0.0f, 0.0f); // just red by default

                    float d = -(plane_position.x * plane_normal.x +
                                plane_position.y * plane_normal.y +
                                plane_position.z * plane_normal.z);
                    thisPlane.m_parameters = new Vector4(plane_normal.x, plane_normal.y, plane_normal.z, d);

                    Vector2 mins = new Vector2(+1e3f, +1e3f);
                    Vector2 maxs = new Vector2(-1e3f, -1e3f);

                    // Create the Planar Meshes Scene Objects
                    // Each Scene Object should have only ONE mesh/plane
                    foreach (SceneMesh mesh in meshes)
                    {
                        // Get the mesh vertices.
                        var mvList = new System.Numerics.Vector3[mesh.VertexCount];
                        mesh.GetVertexPositions(mvList);

                        foreach (var v in mvList)
                        {
                            Vector4 bp = new Vector4(v.X, v.Y, 0.0f, 1.0f);
                            Vector4 tbp = m * bp;
                            Vector3 tbp3d = new Vector3(tbp.x, tbp.y, tbp.z);
                            thisPlane.m_convexHull.Add(tbp3d);

                            // calculate bounding box in 2D
                            mins.x = mins.x > v.X ? v.X : mins.x;
                            mins.y = mins.y > v.Y ? v.Y : mins.y;
                            maxs.x = maxs.x < v.X ? v.X : maxs.x;
                            maxs.y = maxs.y < v.Y ? v.Y : maxs.y;
                        }

                        Vector4 bp1 = new Vector4(mins.x, mins.y, 0.0f, 1.0f);    Vector4 tbp1 = m * bp1;    thisPlane.m_rect_plane_points.Add(tbp1);
                        Vector4 bp2 = new Vector4(mins.x, maxs.y, 0.0f, 1.0f);    Vector4 tbp2 = m * bp2;    thisPlane.m_rect_plane_points.Add(tbp2);
                        Vector4 bp3 = new Vector4(maxs.x, maxs.y, 0.0f, 1.0f);    Vector4 tbp3 = m * bp3;    thisPlane.m_rect_plane_points.Add(tbp3);
                        Vector4 bp4 = new Vector4(maxs.x, mins.y, 0.0f, 1.0f);    Vector4 tbp4 = m * bp4;    thisPlane.m_rect_plane_points.Add(tbp4);
                    }

                    collection.m_planes.Add(thisPlane);
                }
            }

            collection.m_numPlanes = count;
            collection.m_device = "HoloLens 2";
            return collection;
        }
#endif
        //====================================================================================================

        Vector3 new_position;
        Quaternion new_rotation;
        bool set_newpose = false;

        //public System.Func<UnityEngine.Quaternion, UnityEngine.Vector3, bool> extResultCallback = null;
        public JSCallback extResultCallback = null;

        private void ThisPoseCallback(RegistrationLib.Result result)
        {
            if(!result.success)
            {
                Debug.LogWarning("Registration result not valid!");
                //LogConsole("Registration result not valid!");
                //return; //was on
            }

            if (result.success)
            {
                for (int i = 0; i < 4; i++)
                {
                    string line = "";
                    for (int j = 0; j < 4; j++)
                    {
                        line += $"{result.pose[i, j],15:N8}";
                    }
                    Debug.Log(line);
                }
                //LogConsole("Registration succeeded!");
                new_rotation = result.rotation;
                new_position = result.position;

                var a = new_rotation;
                var b = new_position;

                var statsJson = JsonUtility.ToJson(result.stats);
                //MainEventDispatcher.Instance.PushEvent(() => {
                var good = result.stats.good_correspondences;
                extResultCallback?.Invoke(
                               new Jint.Native.JsValue("PDC"),
                               new Jint.Native.JsValue[] { result.success, a.x, a.y, a.z, a.w, b.x, b.y, b.z, statsJson, good });
                //});
                set_newpose = true;
            } else
            {
                var good = result.stats.good_correspondences;
                var statsJson = JsonUtility.ToJson(result.stats);
                extResultCallback?.Invoke(
                               new Jint.Native.JsValue("PDC"),
                               new Jint.Native.JsValue[] { result.success, 0, 0, 0, 0, 0, 0, 0, statsJson, good });
            }
        }

        public void Test_extResultCallback()
        {
            //MainEventDispatcher.Instance.PushEvent(() =>
            //{
                try
                {
                    var a = Quaternion.identity;
                    var b = Vector3.one * 2f;

                    Debug.Log("Test_extResultCallback before invoke ");

                    extResultCallback?.Invoke(
                               new Jint.Native.JsValue("PDC"),
                               new Jint.Native.JsValue[] { a.x, a.y, a.z, a.w, b.x, b.y, b.z });

                    Debug.Log("Test_extResultCallback after invoke");
                }
                catch (Exception err)
                {
                    Debug.Log("Test_extResultCallback ERROR => " + err);
                }
            //});
        }

#if UNITY_WSA
        /// <summary>
        /// Task to register the model to the most recent set of planes in the scene.
        /// </summary>
        public void RegisterFromExisting()
        {
            if (m_ARPlaneManager.PlaneDetectionEnabled && m_model_loaded)
            {
                PlaneCollection collection = GetActualPlaneCollection(m_ARPlaneManager);
                string collectionAsJSON = JsonUtility.ToJson(collection);
                bool success = reglib.RegisterSceneFromJsonString(collectionAsJSON);
                if (!success)
                {
                    Debug.LogError("Registering scene from string failed!");
                    LogConsole("Registering scene from string failed!");
                    return;
                }
                Debug.Log("Registering scene from string finished!");
                LogConsole("Registering scene from string finished!");
            }
        }

        bool register_existing_model = false;
        public void RegisterExistingModel() {
            register_existing_model = true;
        }

        public void SceneUnderstandingOnLoadFinished() {
            if (m_ARPlaneManager.AutomaticRegistration) {
                RegisterExistingModel();
            }
        }
#elif UNITY_IOS
        public float TimeElapsedSinceLastAutoRegistration = 0.0f;
        public float AutoRegistrationIntervalInSeconds = 2.0f;
        private bool AutoRegistration = false;

        public void AutoRegisterExistingModel() {
            TimeElapsedSinceLastAutoRegistration = 0.0f;
            AutoRegistration = !AutoRegistration;

            Debug.Log("Auto Registration: " + (AutoRegistration?"ON":"OFF"));
            LogConsole("Auto Registration: " + (AutoRegistration?"ON":"OFF"));
        }

        /// <summary>
        /// Task to register the model to the most recent set of planes in the scene.
        /// </summary>
        /// <returns>
        /// A <see cref="Task"/> that represents the operation.
        /// </returns>
        private Task displayTask = null;
        public Task RegisterDataAsync()
        {
            // See if we already have a running task
            if ((displayTask != null) && (!displayTask.IsCompleted))
            {
                // Yes we do. Return the already running task.
                return displayTask;
            }
            // We have real work to do. Time to start the coroutine and track it.
            else
            {
                // Create a completion source
                TaskCompletionSource<bool> completionSource = new TaskCompletionSource<bool>();

                // Store the task
                displayTask = completionSource.Task;

                // Start the coroutine and pass in the completion source
                StartCoroutine(RegisterFromExisting(completionSource));

                // Return the newly running task
                return displayTask;
            }
        }

        /// <summary>
        /// Registers the model to the most recent set of planes in the scene.
        /// </summary>
        /// <param name="completionSource">
        /// The <see cref="TaskCompletionSource{TResult}"/> that can be used to signal the coroutine is complete.
        /// </param>
        public IEnumerator RegisterFromExisting(TaskCompletionSource<bool> completionSource)
        {
            if (m_ARPlaneManager.enabled)
            {
                PlaneCollection collection = PlaneCollection.GetActualPlaneCollection(m_ARPlaneManager);
                string collectionAsJSON = JsonUtility.ToJson(collection);
                bool success = reglib.RegisterSceneFromJsonString(collectionAsJSON);
                if (!success)
                {
                    Debug.LogError("Registering scene from string failed!");
                    LogConsole("Registering scene from string failed!");
                }
                else
                {
                    Debug.Log("Registering scene from string finished!");
                    LogConsole("Registering scene from string finished!");
                }
            }

            // Let the task complete
            completionSource.SetResult(true);

            // Yield the coroutine back to the main thread
            yield return null;
        }
#endif

        /// <summary>
        /// Stores the detected planes into a file for later.
        /// </summary>
        public void SavePlanesToFile()
        {
            if (m_ARPlaneManager.enabled) {
                string filename;
                WriteDatabaseFile(out filename);
                Debug.Log("File saved: " + filename);
                LogConsole("Model saved to file: " + Path.GetFileNameWithoutExtension(filename));
            }
        }

        /// <summary>
        /// Loads a set of planes from a string for localization.
        /// </summary>
        public void LoadModelFromJsonString(string model_json_string)
        {
            m_model_loaded = reglib.LoadModelFromJsonString(model_json_string);
            if (!m_model_loaded)
            {
                Debug.LogError("Loading model from string failed!");
                LogConsole("Loading model from string failed!");
                return;
            }
            Debug.Log("Loading model from string succeeded!");
            LogConsole("Loading model from string succeeded!");
        }

        /// <summary>
        /// Toggles plane detection and the visualization of the planes.
        /// </summary>
        public void TogglePlaneDetection()
        {
#if UNITY_WSA
            m_ARPlaneManager.TogglePlaneDetection();
#elif UNITY_IOS
            m_ARPlaneManager.enabled = !m_ARPlaneManager.enabled;

            if (m_ARPlaneManager.enabled) {
                SetAllPlanesActive(true);
            }
            else {
                SetAllPlanesActive(false);
            }
#endif
        }

#if UNITY_IOS
        /// <summary>
        /// Iterates over all the existing planes and activates or deactivates their <c>GameObject</c>s'.
        /// </summary>
        /// <param name="value">Each planes' GameObject is SetActive with this value.</param>
        void SetAllPlanesActive(bool value) {
            foreach (var plane in m_ARPlaneManager.trackables) plane.gameObject.SetActive(value);
        }

        /// <summary>
        /// Resets and restarts plane detection.
        /// </summary>
        public void ResetPlaneDetection() {
            if(m_ARSession.enabled) {
                m_ARPlaneManager.enabled = false;
                m_ARSession.Reset();
                m_ARPlaneManager.enabled = true;

                if (xyz != null) {
                    xyz.SetActive(false);
                }
            }
        }
#endif

        void Awake()
        {
            //AwakeImple();
        }

        public void AwakeImple(string jsonConfig)
        {
#if UNITY_IOS
            var ars_go = GameObject.Find("AR Session");
            if(ars_go != null) {
                m_ARPlaneManager = ars_go.GetComponent<ARPlaneManager>();
                m_ARSession = ars_go.GetComponent<ARSession>();
            } else
            {
                Debug.LogError("AR Session not found!");
            }
#endif
            m_persistentPath = Application.persistentDataPath;

            bool success = false;
            reglib = new RegistrationLib(out success);
            if (!success)
            {
                Debug.LogError("Creating registration engine failed!");
                LogConsole("Creating registration engine failed!");
                return;
            }
            Debug.Log("Registration engine created!");
            LogConsole("Registration engine created!");

            success = false;
            if(jsonConfig.Length > 0)
            {
                success = reglib.Configure(jsonConfig);
            }
            
            if(!success){
                RegistrationLib.AlgorithmProperties algProps = new RegistrationLib.AlgorithmProperties()
                {
                    verbosity_level = 1,
                    report_inverse_pose = false
                };
                success = reglib.Configure(algProps);
            }

            if (!success)
            {
                Debug.LogError("Configuring registration engine failed!");
                LogConsole("Configuring registration engine failed!");
                return;
            }
            Debug.Log("Registration engine configured!");
            LogConsole("Registration engine configured!");

            RegistrationLib.PoseCallback poseCallbackHandler = new RegistrationLib.PoseCallback(ThisPoseCallback);
            success = reglib.RegisterPoseCallback(poseCallbackHandler);
            if (!success)
            {
                Debug.LogError("Registering callback failed!");
                LogConsole("Registering callback failed!");
                return;
            }
            Debug.Log("Registering callback succeeded!");
            LogConsole("Registering callback succeeded!");
#if UNITY_WSA
            if (m_ARPlaneManager_prefab != null)
            {
                if (m_ARPlaneManager == null)
                {
                    m_ARPlaneManager = Instantiate(m_ARPlaneManager_prefab, new Vector3(0, 0, 0), Quaternion.identity);
                    if (m_ARPlaneManager != null)
                    {
                        Debug.LogError("Instantiating SceneUnderstandingManager failed!");
                        LogConsole("Instantiating SceneUnderstandingManager failed!");
                        return;
                    }
                    Debug.Log("Instantiating SceneUnderstandingManager succeeded!");
                    LogConsole("Instantiating SceneUnderstandingManager succeeded!");
                }
            }
#endif
        }

        public void StartImple2(string jsonModelString)
        {
            LoadModelFromJsonString(jsonModelString);

            if (objmodel_prefab != null)
            {
                // Instantiate at position (0, 0, 0) and zero rotation.
                Instantiate(objmodel_prefab, new Vector3(0, 0, 0), Quaternion.identity);
                objmodel = Instantiate(objmodel_prefab, new Vector3(0, 0, 0), Quaternion.identity);
                objmodel.SetActive(false);
            }
#if UNITY_WSA
            m_ARPlaneManager.SetOnLoadFinishedEvent(this.SceneUnderstandingOnLoadFinished);
#elif UNITY_IOS
            AutoRegisterExistingModel();
#endif
        }

        private void Update() {
#if UNITY_WSA
            if (register_existing_model) {
                register_existing_model = false;
                RegisterFromExisting();
            }
#endif
            if (set_newpose) {

                set_newpose = false;

                LogConsole("Registration succeeded!");
                if (objmodel != null) {
                    objmodel.transform.rotation = new_rotation;
                    objmodel.transform.position = new_position;
                    objmodel.SetActive(true);
                }
                TogglePlaneDetection();
            }
#if UNITY_IOS
            if (AutoRegistration)
            {
                TimeElapsedSinceLastAutoRegistration += Time.deltaTime;
                if (TimeElapsedSinceLastAutoRegistration >= AutoRegistrationIntervalInSeconds)
                {
                    TimeElapsedSinceLastAutoRegistration = 0.0f;
                    try
                    {
                        RegisterDataAsync();
                    }
                    catch (Exception ex)
                    {
                        Debug.LogError($"Error in {nameof(PlaneDetectionController)} {nameof(AutoRegistration)}: {ex.Message}");
                    }
                }
            }
#endif
        }

        void OnDestroy() {
            Debug.Log("Disposing registration engine...");
            LogConsole("Disposing registration engine...");
            reglib?.Dispose();
        }

        RegistrationLib reglib = null;

#if UNITY_WSA
        public SceneUnderstandingManager m_ARPlaneManager_prefab = null;
        public SceneUnderstandingManager m_ARPlaneManager = null;
#elif UNITY_IOS
        ARPlaneManager m_ARPlaneManager = null;
        ARSession m_ARSession = null;
#endif

        private bool m_model_loaded = false;

        private string m_persistentPath;
        private static string fmt = "yyyy_MM_dd__HH_mm_ss";
        private static string cad_model_file_prefix = "model__";
        private static string cad_model_file_suffix = ".json";

        private GameObject objmodel = null;
        public GameObject objmodel_prefab = null;
    }
}
#endif // V2

#if V1
using System;
using System.IO;
using System.Collections.Generic;
using System.Globalization;

using UnityEngine;

using Microsoft.MixedReality.SceneUnderstanding;
using Microsoft.MixedReality.SceneUnderstanding.Samples.Unity;

using SceneUnderstanding = global::Microsoft.MixedReality.SceneUnderstanding;

using JSCallback = System.Func<Jint.Native.JsValue, Jint.Native.JsValue[], Jint.Native.JsValue>;

namespace Vizario.RegistrationLib
{
    public class PlaneDetectionController : MonoBehaviour {

        //====================================================================================================

        public JSCallback extLogCallback = null;
        private void LogConsole(string msg) {
            if (m_ARPlaneManager != null) {
                m_ARPlaneManager.LogConsole(msg);
            }

            extLogCallback?.Invoke(
                new Jint.Native.JsValue("PDCLOG"),
                new Jint.Native.JsValue[] { msg });
        }

        public void LogPose(string name, Vector3 position, Quaternion orientation) {
            LogConsole(name);
            LogConsole($"    position:    {position.x,15:N8}, {position.y,15:N8}, {position.z,15:N8}");
            LogConsole($"    orientation: {orientation.x,15:N8}, {orientation.y,15:N8}, {orientation.z,15:N8}, {orientation.w,15:N8}");
        }

        public void LogPose(string name, System.Numerics.Vector3 position, System.Numerics.Quaternion orientation) {
            LogConsole(name);
            LogConsole($"    position:    {position.X,15:N8}, {position.Y,15:N8}, {position.Z,15:N8}");
            LogConsole($"    orientation: {orientation.X,15:N8}, {orientation.Y,15:N8}, {orientation.Z,15:N8}, {orientation.W,15:N8}");
        }

        public Scene GetLatestDeserializedScene() {
            Scene sceneToReturn = null;

            SceneFragment sceneFragment = m_ARPlaneManager.GetLatestSceneSerialization();
            if (sceneFragment == null) {
                Debug.LogWarning("GetLatestDeserializedScene: SceneFragment is null.");
                return null;
            }

            // Deserialize the scene.
            SceneFragment[] sceneFragmentsArray = new SceneFragment[1] { sceneFragment };
            sceneToReturn = SceneUnderstanding.Scene.FromFragments(sceneFragmentsArray);

            if (sceneToReturn == null) {
                Debug.LogWarning("GetLatestDeserializedScene: Scene is null");
            }

            return sceneToReturn;
        }
        
        public PlaneCollection GetActualPlaneCollection(SceneUnderstandingManager planeManager)
        {

            // List of all SceneObjectKind enum values.
            List<SceneObjectKind> sceneObjectKinds = new List<SceneObjectKind>();
            sceneObjectKinds.Add(SceneObjectKind.Background);
            sceneObjectKinds.Add(SceneObjectKind.Platform);

            SceneUnderstanding.Scene scene = GetLatestDeserializedScene();

            // Retrieve a transformation matrix that will allow us orient the Scene Understanding Objects into
            // their correct corresponding position in the unity world
            System.Numerics.Matrix4x4? sceneToUnityTransformAsMatrix4x4 = m_ARPlaneManager.GetSceneToUnityTransformAsMatrix4x4(scene, true);

            GameObject SceneRootObject = new GameObject();
            SceneRootObject.transform.position = Vector3.zero;
            SceneRootObject.transform.rotation = Quaternion.identity;
            m_ARPlaneManager.SetUnityTransformFromMatrix4x4(SceneRootObject.transform, sceneToUnityTransformAsMatrix4x4.Value, true);

            // Common code
            PlaneCollection collection = new PlaneCollection();
            int count = 0;

            foreach (SceneUnderstanding.SceneObjectKind soKind in sceneObjectKinds) {

                foreach (SceneUnderstanding.SceneObject suObject in scene.SceneObjects) {

                    if (suObject.Kind != soKind) {
                        continue;
                    }

                    IEnumerable<SceneUnderstanding.SceneMesh> meshes = suObject.Meshes;
                    if (meshes == null) {
                        continue;
                    }

                    // This gameobject will hold all the geometry that represents the Scene Understanding Object
                    GameObject unityParentHolderObject = new GameObject(suObject.Kind.ToString());
                    unityParentHolderObject.transform.parent = SceneRootObject.transform;

                    // Scene Understanding uses a Right Handed Coordinate System and Unity uses a left handed one, convert.
                    System.Numerics.Matrix4x4 converted4x4LocationMatrix = m_ARPlaneManager.ConvertRightHandedMatrix4x4ToLeftHanded(suObject.GetLocationAsMatrix());
                    // From the converted Matrix pass its values into the unity transform (Numerics -> Unity.Transform)
                    m_ARPlaneManager.SetUnityTransformFromMatrix4x4(unityParentHolderObject.transform, converted4x4LocationMatrix, true);

                    // This list will keep track of all the individual objects that represent the geometry of
                    // the Scene Understanding Object
                    GameObject unityGeometryObject = new GameObject(suObject.Kind.ToString() + "Mesh/Plane");

                    // For all the Unity Game Objects that represent The Scene Understanding Object
                    // Of this iteration, make sure they are all children of the UnityParent object
                    // And that their local postion and rotation is relative to their parent
                    unityGeometryObject.transform.parent = unityParentHolderObject.transform;
                    unityGeometryObject.transform.localPosition = Vector3.zero;

                    if(m_ARPlaneManager.AlignSUObjectsNormalToUnityYAxis) {
                        // If our Vertex Data is rotated to have it match its Normal to Unity's Y axis, we need to offset the rotation
                        // in the parent object to have the object face the right direction
                        unityGeometryObject.transform.localRotation = Quaternion.Euler(-90.0f, 0.0f, 0.0f);
                    }
                    else {
                        //Otherwise don't rotate
                        unityGeometryObject.transform.localRotation = Quaternion.identity;
                    }


                    // This is the important part
                    // These are equal to SceneRootObject.transform * suObject.GetLocationAsMatrix()
                    Vector3 plane_position = unityParentHolderObject.transform.position;
                    Quaternion plane_orientation = unityParentHolderObject.transform.rotation;

                    //if (count == 0) {
                    //    LogPose("m_pose:", plane_position, plane_orientation);
                    //    LogPose("unityParentHolderObject:", unityParentHolderObject.transform.position, unityParentHolderObject.transform.rotation);
                    //    LogPose("unityParentHolderObject Local:", unityParentHolderObject.transform.localPosition, unityParentHolderObject.transform.localRotation);
                    //    LogPose("unityParentHolderObject -90:", unityParentHolderObject.transform.position, Quaternion.Euler(-90.0f, 0.0f, 0.0f)*unityParentHolderObject.transform.rotation);
                    //    LogPose("unityParentHolderObject +90:", unityParentHolderObject.transform.position, Quaternion.Euler(+90.0f, 0.0f, 0.0f)*unityParentHolderObject.transform.rotation);
                    //    LogPose("unityGeometryObject:", unityGeometryObject.transform.position, unityGeometryObject.transform.rotation);
                    //    LogPose("unityGeometryObject Local:", unityGeometryObject.transform.localPosition, unityGeometryObject.transform.localRotation);
                    //    {
                    //        System.Numerics.Vector3 vector3;
                    //        System.Numerics.Quaternion quaternion;
                    //        System.Numerics.Vector3 scale;

                    //        System.Numerics.Matrix4x4.Decompose(converted4x4LocationMatrix, out scale, out quaternion, out vector3);
                    //        LogPose("suObject Left:", new Vector3(vector3.X, vector3.Y, vector3.Z), new Quaternion(quaternion.X, quaternion.Y, quaternion.Z, quaternion.W));
                    //    }
                    //    LogPose("suObject Right:", suObject.Position, suObject.Orientation);
                    //}


                    Matrix4x4 m = Matrix4x4.TRS(plane_position, plane_orientation, Vector3.one);

                    // Here we need to transform the plane normal because Unity uses Left handed Coordinate system and Scene Understanding SDK uses Right Handed.
                    // The third column (row-wise) of the rotation/orientation matrix holds the (Right Handed) normal of the plane (Z-axis).
                    // The transformation "m" rotates the normal to match Unity's coordinate system Down Axis (Y axis).
                    // The SceneUnderstanding SDK does a local rotation of 180 degrees to convert the Right Handed vertices to Left Handed ones.
                    // Therefore, in order to match Unity's coordinate system UP Axis (Y axis), we rotate/invert/reverse/negate the normal of the plane (and the plane equation).
                    Vector3 plane_normal = new Vector3(-m[0,2], -m[1,2], -m[2,2]);
                    plane_normal.Normalize();

                    //if (count == 0) {
                    //    LogPose("m_pose:", plane_position, plane_orientation);
                    //    LogConsole($"      normal:    {plane_normal.x,15:N8}, {plane_normal.y,15:N8}, {plane_normal.z,15:N8}");
                    //    LogConsole($"orientation:");
                    //    LogConsole($"    {m[0,0],15:N8}, {m[0,1],15:N8}, {m[0,2],15:N8}, {m[0,3],15:N8}");
                    //    LogConsole($"    {m[1,0],15:N8}, {m[1,1],15:N8}, {m[1,2],15:N8}, {m[1,3],15:N8}");
                    //    LogConsole($"    {m[2,0],15:N8}, {m[2,1],15:N8}, {m[2,2],15:N8}, {m[2,3],15:N8}");
                    //    LogConsole($"    {m[3,0],15:N8}, {m[3,1],15:N8}, {m[3,2],15:N8}, {m[3,3],15:N8}");
                    //}


                    // Common code
                    PlaneDefinition thisPlane = new PlaneDefinition(count++);
                    thisPlane.m_color = new Vector3(1.0f, 0.0f, 0.0f); // just red by default

                    float d = -(plane_position.x * plane_normal.x +
                                plane_position.y * plane_normal.y +
                                plane_position.z * plane_normal.z);
                    thisPlane.m_parameters = new Vector4(plane_normal.x, plane_normal.y, plane_normal.z, d);

                    Vector2 mins = new Vector2(+1e3f, +1e3f);
                    Vector2 maxs = new Vector2(-1e3f, -1e3f);

                    // Create the Planar Meshes Scene Objects
                    // Each Scene Object should have only ONE mesh/plane
                    foreach (SceneMesh mesh in meshes)
                    {
                        // Get the mesh vertices.
                        var mvList = new System.Numerics.Vector3[mesh.VertexCount];
                        mesh.GetVertexPositions(mvList);

                        foreach (var v in mvList)
                        {
                            Vector4 bp = new Vector4(v.X, v.Y, 0.0f, 1.0f);
                            Vector4 tbp = m * bp;
                            Vector3 tbp3d = new Vector3(tbp.x, tbp.y, tbp.z);
                            thisPlane.m_convexHull.Add(tbp3d);

                            // calculate bounding box in 2D
                            mins.x = mins.x > v.X ? v.X : mins.x;
                            mins.y = mins.y > v.Y ? v.Y : mins.y;
                            maxs.x = maxs.x < v.X ? v.X : maxs.x;
                            maxs.y = maxs.y < v.Y ? v.Y : maxs.y;
                        }

                        Vector4 bp1 = new Vector4(mins.x, mins.y, 0.0f, 1.0f);    Vector4 tbp1 = m * bp1;    thisPlane.m_rect_plane_points.Add(tbp1);
                        Vector4 bp2 = new Vector4(mins.x, maxs.y, 0.0f, 1.0f);    Vector4 tbp2 = m * bp2;    thisPlane.m_rect_plane_points.Add(tbp2);
                        Vector4 bp3 = new Vector4(maxs.x, maxs.y, 0.0f, 1.0f);    Vector4 tbp3 = m * bp3;    thisPlane.m_rect_plane_points.Add(tbp3);
                        Vector4 bp4 = new Vector4(maxs.x, mins.y, 0.0f, 1.0f);    Vector4 tbp4 = m * bp4;    thisPlane.m_rect_plane_points.Add(tbp4);
                    }

                    collection.m_planes.Add(thisPlane);
                }
            }

            collection.m_numPlanes = count;
            collection.m_device = "HoloLens 2";
            return collection;
        }

        //====================================================================================================

        /// <summary>
        /// Write Database File for Matlab conversion.
        /// </summary>
        private void WriteDatabaseFile(out string filename)
        {
            // assemble file name based on current date/time
            CultureInfo invC = CultureInfo.InvariantCulture;
            TimeZoneInfo cestZone = TimeZoneInfo.FindSystemTimeZoneById("Central Europe Standard Time");
            DateTime cestTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, cestZone);
            
            string fntrunk = cestTime.ToString(fmt, invC);
            filename = cad_model_file_prefix + fntrunk + cad_model_file_suffix;

            // retrieve, save and export to OBJ
            PlaneCollection planecollection = GetActualPlaneCollection(m_ARPlaneManager);
            PlaneCollection.SavePlaneCollectionToFile(planecollection, filename);
        }

        //====================================================================================================


        
        // the transform for the scene
        Vector3 new_position;
        Quaternion new_rotation;
        bool set_newpose = false;

        //public System.Func<UnityEngine.Quaternion, UnityEngine.Vector3, bool> extResultCallback = null;
        public JSCallback extResultCallback = null;

        private void ThisPoseCallback(RegistrationLib.Result result)
        {
            Debug.Log("ThisPoseCallback: Registration succeeded!");
            if(!result.success)
            {
                Debug.LogWarning("Registration result not valid!");
                //LogConsole("Registration result not valid!");
                return;
            }

            for (int i = 0; i < 4; i++) {
                string line = "";
                for (int j = 0; j < 4; j++) {
                    line += $"{result.pose[i,j],15:N8}";
                }
                Debug.Log(line);
            }
            //LogConsole("Registration succeeded!");
            new_rotation = result.rotation;
            new_position = result.position;

            
            var a = new_rotation;
            var b = new_position;

            //MainEventDispatcher.Instance.PushEvent(() => {
               extResultCallback?.Invoke(
                              new Jint.Native.JsValue("PDC"),
                              new Jint.Native.JsValue[] { a.x, a.y, a.z, a.w, b.x, b.y, b.z });
            //});
            set_newpose = true;
        }

        public void Test_extResultCallback()
        {
            //MainEventDispatcher.Instance.PushEvent(() =>
            //{
                try
                {
                    var a = Quaternion.identity;
                    var b = Vector3.one * 2f;

                    Debug.Log("Test_extResultCallback before invoke ");

                    extResultCallback?.Invoke(
                               new Jint.Native.JsValue("PDC"),
                               new Jint.Native.JsValue[] { a.x, a.y, a.z, a.w, b.x, b.y, b.z });

                    Debug.Log("Test_extResultCallback after invoke");
                }
                catch (Exception err)
                {
                    Debug.Log("Test_extResultCallback ERROR => " + err);
                }
            //});
        }

        /// <summary>
        /// Stores the detected planes into a file for later.
        /// </summary>
        public void RegisterFromExisting()
        {
            if (m_ARPlaneManager.PlaneDetectionEnabled && m_model_loaded)
            {
                PlaneCollection collection = GetActualPlaneCollection(m_ARPlaneManager);
                string collectionAsJSON = JsonUtility.ToJson(collection);
                bool success = reglib.RegisterSceneFromJsonString(collectionAsJSON);
                if (!success)
                {
                    Debug.LogError("Registering scene from string failed!");
                    LogConsole("Registering scene from string failed!");
                    return;
                }
                Debug.Log("Registering scene from string succeeded!");
                LogConsole("Registering scene from string succeeded!");
            }
        }

        bool register_existing_model = false;
        public void RegisterExistingModel() {
            register_existing_model = true;
        }

        public void SceneUnderstandingOnLoadFinished() {
            if (m_ARPlaneManager.AutomaticRegistration) {
                RegisterExistingModel();
            }
        }

        /// <summary>
        /// Stores the detected planes into a file for later.
        /// </summary>
        public void SavePlanesToFile()
        {
            if (m_ARPlaneManager.enabled) {
                string filename;
                WriteDatabaseFile(out filename);
                Debug.Log("File saved: " + filename);
                LogConsole("Model saved to file: " + Path.GetFileNameWithoutExtension(filename));
            }
        }

        /// <summary>
        /// Loads a set of planes from a string for localization.
        /// </summary>
        public void LoadModelFromJsonString(string model_json_string)
        {
            m_model_loaded = reglib.LoadModelFromJsonString(model_json_string);
            if (!m_model_loaded)
            {
                Debug.LogError("Loading model from string failed!");
                LogConsole("Loading model from string failed!");
                return;
            }
            Debug.Log("Loading model from string succeeded!");
            LogConsole("Loading model from string succeeded!");
        }

/// <summary>
        /// Toggles plane detection and the visualization of the planes.
        /// </summary>
        public void TogglePlaneDetection() {
            m_ARPlaneManager.TogglePlaneDetection();
        }

        void Awake()
        {
            //AwakeImple();
        }

        public void AwakeImple(string jsonConfig)
        {
            m_persistentPath = Application.persistentDataPath;

            bool success = false;
            reglib = new RegistrationLib(out success);
            if (!success)
            {
                Debug.LogError("Creating registration engine failed!");
                LogConsole("Creating registration engine failed!");
                return;
            }
            Debug.Log("Registration engine created!");
            LogConsole("Registration engine created!");

            if(jsonConfig.Length > 0)
            {
                success = reglib.Configure(jsonConfig);
            } else
            {
                RegistrationLib.AlgorithmProperties algProps = new RegistrationLib.AlgorithmProperties()
                {
                    ppfs_threshold = 0.1,
                    ppfs_normd_eps = 0.2,
                    ppfs_areas_eps = 0.3,
                    ppfs_votes_std = 1.5,
                    verbosity_level = 1,
                    report_inverse_pose = false
                };
                success = reglib.Configure(algProps);
            }

            if (!success)
            {
                Debug.LogError("Configuring registration engine failed!");
                LogConsole("Configuring registration engine failed!");
                return;
            }
            Debug.Log("Registration engine configured!");
            LogConsole("Registration engine configured!");

            RegistrationLib.PoseCallback poseCallbackHandler = new RegistrationLib.PoseCallback(ThisPoseCallback);
            success = reglib.RegisterPoseCallback(poseCallbackHandler);
            if (!success)
            {
                Debug.LogError("Registering callback failed!");
                LogConsole("Registering callback failed!");
                return;
            }
            Debug.Log("Registering callback succeeded!");
            LogConsole("Registering callback succeeded!");

            if (m_ARPlaneManager_prefab != null)
            {
                if (m_ARPlaneManager == null)
                {
                    m_ARPlaneManager = Instantiate(m_ARPlaneManager_prefab, new Vector3(0, 0, 0), Quaternion.identity);
                    if (m_ARPlaneManager != null)
                    {
                        Debug.LogError("Instantiating SceneUnderstandingManager failed!");
                        LogConsole("Instantiating SceneUnderstandingManager failed!");
                        return;
                    }
                    Debug.Log("Instantiating SceneUnderstandingManager succeeded!");
                    LogConsole("Instantiating SceneUnderstandingManager succeeded!");
                }
            }
        }


        public void StartImple2(string jsonModelString)
        {
            LoadModelFromJsonString(jsonModelString);

            if (objmodel_prefab != null)
            {
                // Instantiate at position (0, 0, 0) and zero rotation.
                Instantiate(objmodel_prefab, new Vector3(0, 0, 0), Quaternion.identity);
                objmodel = Instantiate(objmodel_prefab, new Vector3(0, 0, 0), Quaternion.identity);
                objmodel.SetActive(false);
            }

            m_ARPlaneManager.SetOnLoadFinishedEvent(this.SceneUnderstandingOnLoadFinished);
        }

        public void StartImple()
        {
            GetModels();

            LoadModelFromJsonString(model__2022_08_17__11_52_51);

            if (objmodel_prefab != null)
            {
                // Instantiate at position (0, 0, 0) and zero rotation.
                Instantiate(objmodel_prefab, new Vector3(0, 0, 0), Quaternion.identity);
                objmodel = Instantiate(objmodel_prefab, new Vector3(0, 0, 0), Quaternion.identity);
                objmodel.SetActive(false);
            }

            m_ARPlaneManager.SetOnLoadFinishedEvent(this.SceneUnderstandingOnLoadFinished);
        }

        void Start() {
            
        }

        private void GetModels() {
            // read objects files from disk
            DirectoryInfo dir = new DirectoryInfo(m_persistentPath);
            FileInfo[] filesInfo = dir.GetFiles(cad_model_file_prefix+"*"+cad_model_file_suffix);

            int i = 0;
            List<string> models = new List<string>();
            
            LogConsole("Available models:");
            foreach (FileInfo file in filesInfo) {
                models.Add(Path.GetFileNameWithoutExtension(file.Name));
                LogConsole($"    #{++i,-3} {Path.GetFileNameWithoutExtension(file.Name)}");
            }
            models.Sort();
        }

        private void Update() {
            if (register_existing_model) {
                register_existing_model = false;
                RegisterFromExisting();
            }
            if (set_newpose) {
                LogConsole("Registration succeeded!");
                if (objmodel != null) {

                    objmodel.transform.rotation = new_rotation;
                    objmodel.transform.position = new_position;

                    objmodel.SetActive(true);
                }
                set_newpose = false;
		TogglePlaneDetection();
            }
        }

        void OnDestroy() {
            Debug.Log("Disposing registration engine...");
            LogConsole("Disposing registration engine...");
            reglib?.Dispose();
        }

        RegistrationLib reglib = null;

        public SceneUnderstandingManager m_ARPlaneManager_prefab = null;
        public SceneUnderstandingManager m_ARPlaneManager = null;

        private bool m_model_loaded = false;

        private string m_persistentPath;
        private static string fmt = "yyyy_MM_dd__HH_mm_ss";
        private static string cad_model_file_prefix = "model__";
        private static string cad_model_file_suffix = ".json";

        private GameObject objmodel = null;
        public GameObject objmodel_prefab = null;

        private static string model__2022_08_17__11_52_51 = "{\"m_numPlanes\":15,\"m_version\":2,\"m_planes\":[{\"m_planeID\":\"Plane1\",\"m_parameters\":{\"x\":-0.21425492521855069,\"y\":-0.60023686313807767,\"z\":-0.77059102976206129,\"w\":3.741979924289236},\"m_convexHull\":[{\"x\":1.3671123049899285,\"y\":2.7427923033068824,\"z\":2.3394307247499504},{\"x\":1.4450832686837385,\"y\":2.4217001221962011,\"z\":2.5678601948243105},{\"x\":0.8292353166223343,\"y\":2.4038567830052178,\"z\":2.7529891171047423},{\"x\":0.75126435292852434,\"y\":2.724948964115899,\"z\":2.5245596470303817}],\"m_rect_plane_points\":[{\"x\":1.3671123049899285,\"y\":2.7427923033068824,\"z\":2.3394307247499504},{\"x\":1.4450832686837385,\"y\":2.4217001221962011,\"z\":2.5678601948243105},{\"x\":0.8292353166223343,\"y\":2.4038567830052178,\"z\":2.7529891171047423},{\"x\":0.75126435292852434,\"y\":2.724948964115899,\"z\":2.5245596470303817}],\"m_color\":{\"x\":0.929,\"y\":0.694,\"z\":0.125}},{\"m_planeID\":\"Plane2\",\"m_parameters\":{\"x\":-0.045947857984817542,\"y\":-0.99698651829097762,\"z\":-0.0625034134479181,\"w\":1.7836586542155639},\"m_convexHull\":[{\"x\":-0.41678452126239729,\"y\":1.8223889062215726,\"z\":-0.22539825587106657},{\"x\":-0.26086821259169013,\"y\":1.7856806980253139,\"z\":0.24551311760928554},{\"x\":-1.0039907738377509,\"y\":1.8044121798250463,\"z\":0.49301728152814506},{\"x\":-1.1599070825084579,\"y\":1.841120388021305,\"z\":0.022105908047792996}],\"m_rect_plane_points\":[{\"x\":-0.41678452126239729,\"y\":1.8223889062215726,\"z\":-0.22539825587106657},{\"x\":-0.26086821259169013,\"y\":1.7856806980253139,\"z\":0.24551311760928554},{\"x\":-1.0039907738377509,\"y\":1.8044121798250463,\"z\":0.49301728152814506},{\"x\":-1.1599070825084579,\"y\":1.841120388021305,\"z\":0.022105908047792996}],\"m_color\":{\"x\":0.494,\"y\":0.184,\"z\":0.556}},{\"m_planeID\":\"Plane3\",\"m_parameters\":{\"x\":0.33012387040472591,\"y\":-0.061074181190417548,\"z\":0.94195975210245786,\"w\":0.0031393276627174893},\"m_convexHull\":[{\"x\":-0.19630824242977474,\"y\":-1.8231064997017639,\"z\":-0.052739012957595047},{\"x\":0.48456708749546235,\"y\":-1.8044655934654843,\"z\":-0.29015331924173532},{\"x\":0.4820330647179904,\"y\":-1.2082702733769668,\"z\":-0.25060950399079845},{\"x\":-0.19884226520724668,\"y\":-1.2269111796132464,\"z\":-0.013195197706658196}],\"m_rect_plane_points\":[{\"x\":-0.19630824242977474,\"y\":-1.8231064997017639,\"z\":-0.052739012957595047},{\"x\":0.48456708749546235,\"y\":-1.8044655934654843,\"z\":-0.29015331924173532},{\"x\":0.4820330647179904,\"y\":-1.2082702733769668,\"z\":-0.25060950399079845},{\"x\":-0.19884226520724668,\"y\":-1.2269111796132464,\"z\":-0.013195197706658196}],\"m_color\":{\"x\":0.301,\"y\":0.745,\"z\":0.933}},{\"m_planeID\":\"Plane4\",\"m_parameters\":{\"x\":-0.29401264503597535,\"y\":-0.10025128179208943,\"z\":-0.95052945512382347,\"w\":1.107895415484994},\"m_convexHull\":[{\"x\":0.37403893186943982,\"y\":0.29989688351213895,\"z\":1.0182306161948478},{\"x\":0.10666257108052626,\"y\":0.29327254404841319,\"z\":1.1016326919017798},{\"x\":0.081433718016073353,\"y\":0.77291726290644314,\"z\":1.0588487509829554},{\"x\":0.34881007880498688,\"y\":0.7795416023701689,\"z\":0.97544667527602325}],\"m_rect_plane_points\":[{\"x\":0.37403893186943982,\"y\":0.29989688351213895,\"z\":1.0182306161948478},{\"x\":0.10666257108052626,\"y\":0.29327254404841319,\"z\":1.1016326919017798},{\"x\":0.081433718016073353,\"y\":0.77291726290644314,\"z\":1.0588487509829554},{\"x\":0.34881007880498688,\"y\":0.7795416023701689,\"z\":0.97544667527602325}],\"m_color\":{\"x\":0.929,\"y\":0.929,\"z\":0.929}},{\"m_planeID\":\"Plane5\",\"m_parameters\":{\"x\":-0.040189878481744608,\"y\":-0.998477558485923,\"z\":-0.037780138533531689,\"w\":1.7839925456314951},\"m_convexHull\":[{\"x\":-0.18110795329874863,\"y\":1.7759874230612149,\"z\":0.4761143522757677},{\"x\":0.461447502437469,\"y\":1.678895607750218,\"z\":2.3585789428634349},{\"x\":0.044597147767128975,\"y\":1.6902683193163397,\"z\":2.5014521040239353},{\"x\":-0.59795830796908878,\"y\":1.7873601346273367,\"z\":0.61898751343626834}],\"m_rect_plane_points\":[{\"x\":-0.18110795329874863,\"y\":1.7759874230612149,\"z\":0.4761143522757677},{\"x\":0.461447502437469,\"y\":1.678895607750218,\"z\":2.3585789428634349},{\"x\":0.044597147767128975,\"y\":1.6902683193163397,\"z\":2.5014521040239353},{\"x\":-0.59795830796908878,\"y\":1.7873601346273367,\"z\":0.61898751343626834}],\"m_color\":{\"x\":0,\"y\":0.447,\"z\":0.741}},{\"m_planeID\":\"Plane6\",\"m_parameters\":{\"x\":0.95656221347448811,\"y\":0.012402858392235152,\"z\":-0.29126431442332584,\"w\":0.07301578713862},\"m_convexHull\":[{\"x\":0.43369319478512641,\"y\":-0.35884387961396425,\"z\":1.6597282802888256},{\"x\":0.39714597091373827,\"y\":0.19162789506777006,\"z\":1.5631415427471469},{\"x\":0.49948151981980321,\"y\":0.25788779747309604,\"z\":1.9020506588905681},{\"x\":0.53602874369119125,\"y\":-0.29258397720863827,\"z\":1.9986373964322468}],\"m_rect_plane_points\":[{\"x\":0.43369319478512641,\"y\":-0.35884387961396425,\"z\":1.6597282802888256},{\"x\":0.39714597091373827,\"y\":0.19162789506777006,\"z\":1.5631415427471469},{\"x\":0.49948151981980321,\"y\":0.25788779747309604,\"z\":1.9020506588905681},{\"x\":0.53602874369119125,\"y\":-0.29258397720863827,\"z\":1.9986373964322468}],\"m_color\":{\"x\":0.85,\"y\":0.325,\"z\":0.098}},{\"m_planeID\":\"Plane7\",\"m_parameters\":{\"x\":-0.34319822778038561,\"y\":0.1028320432687517,\"z\":-0.93361691679487913,\"w\":1.0650679557872569},\"m_convexHull\":[{\"x\":0.1074796727718314,\"y\":-0.36660700594611062,\"z\":1.0609085560186837},{\"x\":0.1142671450484174,\"y\":0.13291085542546802,\"z\":1.1134322335522788},{\"x\":0.3772979749201652,\"y\":0.13942816566071492,\"z\":1.0174597584143128},{\"x\":0.37051050264357915,\"y\":-0.36008969571086369,\"z\":0.96493608088071758}],\"m_rect_plane_points\":[{\"x\":0.1074796727718314,\"y\":-0.36660700594611062,\"z\":1.0609085560186837},{\"x\":0.1142671450484174,\"y\":0.13291085542546802,\"z\":1.1134322335522788},{\"x\":0.3772979749201652,\"y\":0.13942816566071492,\"z\":1.0174597584143128},{\"x\":0.37051050264357915,\"y\":-0.36008969571086369,\"z\":0.96493608088071758}],\"m_color\":{\"x\":0.466,\"y\":0.674,\"z\":0.188}},{\"m_planeID\":\"Plane8\",\"m_parameters\":{\"x\":-0.94219586482408391,\"y\":0.0032665185168520849,\"z\":0.33504668654558534,\"w\":-0.46948315182744454},\"m_convexHull\":[{\"x\":-0.46610790334526869,\"y\":0.78548805074595973,\"z\":0.082831445842115214},{\"x\":-0.36050769843241814,\"y\":0.84457745582562815,\"z\":0.37921718474155147},{\"x\":-0.376980417309023,\"y\":1.1198300014467775,\"z\":0.33021014839590229},{\"x\":-0.48258062222187353,\"y\":1.060740596367109,\"z\":0.033824409496466049}],\"m_rect_plane_points\":[{\"x\":-0.46610790334526869,\"y\":0.78548805074595973,\"z\":0.082831445842115214},{\"x\":-0.36050769843241814,\"y\":0.84457745582562815,\"z\":0.37921718474155147},{\"x\":-0.376980417309023,\"y\":1.1198300014467775,\"z\":0.33021014839590229},{\"x\":-0.48258062222187353,\"y\":1.060740596367109,\"z\":0.033824409496466049}],\"m_color\":{\"x\":0.929,\"y\":0.694,\"z\":0.125}},{\"m_planeID\":\"Plane9\",\"m_parameters\":{\"x\":-0.021963935749754308,\"y\":0.99964670627933061,\"z\":-0.014968238081563449,\"w\":1.1972568820235163},\"m_convexHull\":[{\"x\":-0.53100860854958865,\"y\":-1.2075213597170682,\"z\":0.12193626071516861},{\"x\":0.44791973359225545,\"y\":-1.1917889896706895,\"z\":-0.26383441450539685},{\"x\":0.30248493026683076,\"y\":-1.2005158102820055,\"z\":-0.63324441281278432},{\"x\":-0.67644341187501333,\"y\":-1.2162481803283842,\"z\":-0.24747373759221872}],\"m_rect_plane_points\":[{\"x\":-0.53100860854958865,\"y\":-1.2075213597170682,\"z\":0.12193626071516861},{\"x\":0.44791973359225545,\"y\":-1.1917889896706895,\"z\":-0.26383441450539685},{\"x\":0.30248493026683076,\"y\":-1.2005158102820055,\"z\":-0.63324441281278432},{\"x\":-0.67644341187501333,\"y\":-1.2162481803283842,\"z\":-0.24747373759221872}],\"m_color\":{\"x\":0.494,\"y\":0.184,\"z\":0.556}},{\"m_planeID\":\"Plane10\",\"m_parameters\":{\"x\":-0.9352248416982325,\"y\":0.027247536970212372,\"z\":0.35300434444858186,\"w\":-0.49801758148773506},\"m_convexHull\":[{\"x\":-0.0022851194288332488,\"y\":-0.99410311884512081,\"z\":1.4814756552967958},{\"x\":0.31471666136551357,\"y\":-0.8277586194777079,\"z\":2.30847811845676},{\"x\":0.28421781515544053,\"y\":-0.081577132954660445,\"z\":2.1700807105278752},{\"x\":-0.032783965638906287,\"y\":-0.24792163232207337,\"z\":1.343078247367911}],\"m_rect_plane_points\":[{\"x\":-0.0022851194288332488,\"y\":-0.99410311884512081,\"z\":1.4814756552967958},{\"x\":0.31471666136551357,\"y\":-0.8277586194777079,\"z\":2.30847811845676},{\"x\":0.28421781515544053,\"y\":-0.081577132954660445,\"z\":2.1700807105278752},{\"x\":-0.032783965638906287,\"y\":-0.24792163232207337,\"z\":1.343078247367911}],\"m_color\":{\"x\":0.301,\"y\":0.745,\"z\":0.933}},{\"m_planeID\":\"Plane11\",\"m_parameters\":{\"x\":-0.93490226076159633,\"y\":-0.018081499511067359,\"z\":0.354444385197858,\"w\":-0.45049486846307929},\"m_convexHull\":[{\"x\":-0.13398210810858519,\"y\":0.96307239154682811,\"z\":0.9667200271104921},{\"x\":0.059291022865467391,\"y\":1.0666062759153003,\"z\":1.481789647609038},{\"x\":0.023125833722668854,\"y\":1.498954799013871,\"z\":1.4084540029579158},{\"x\":-0.17014729725138372,\"y\":1.3954209146453989,\"z\":0.89338438245937}],\"m_rect_plane_points\":[{\"x\":-0.13398210810858519,\"y\":0.96307239154682811,\"z\":0.9667200271104921},{\"x\":0.059291022865467391,\"y\":1.0666062759153003,\"z\":1.481789647609038},{\"x\":0.023125833722668854,\"y\":1.498954799013871,\"z\":1.4084540029579158},{\"x\":-0.17014729725138372,\"y\":1.3954209146453989,\"z\":0.89338438245937}],\"m_color\":{\"x\":0.929,\"y\":0.929,\"z\":0.929}},{\"m_planeID\":\"Plane12\",\"m_parameters\":{\"x\":0.89835087656019086,\"y\":0.011238539210012943,\"z\":-0.43913482874848553,\"w\":0.61530251286240645},\"m_convexHull\":[{\"x\":-0.72582798547325267,\"y\":-1.244061278066207,\"z\":-0.11551606078976581},{\"x\":-0.766395037345356,\"y\":-0.81139921276287652,\"z\":-0.18743237203561794},{\"x\":-0.62784132379464108,\"y\":-0.75103798813922773,\"z\":0.097555776969366265},{\"x\":-0.58727427192253778,\"y\":-1.1837000534425581,\"z\":0.16947208821521839}],\"m_rect_plane_points\":[{\"x\":-0.72582798547325267,\"y\":-1.244061278066207,\"z\":-0.11551606078976581},{\"x\":-0.766395037345356,\"y\":-0.81139921276287652,\"z\":-0.18743237203561794},{\"x\":-0.62784132379464108,\"y\":-0.75103798813922773,\"z\":0.097555776969366265},{\"x\":-0.58727427192253778,\"y\":-1.1837000534425581,\"z\":0.16947208821521839}],\"m_color\":{\"x\":0,\"y\":0.447,\"z\":0.741}},{\"m_planeID\":\"Plane13\",\"m_parameters\":{\"x\":0.94686529658893936,\"y\":0.030502792121085365,\"z\":-0.32018071426673678,\"w\":-1.5877997993328408},\"m_convexHull\":[{\"x\":1.9834324958944958,\"y\":1.4310866693711659,\"z\":1.0428352597819621},{\"x\":1.9659474361904286,\"y\":1.6275800559368239,\"z\":1.0098463917822886},{\"x\":2.1516637109802632,\"y\":1.7380801736360389,\"z\":1.5695892174557302},{\"x\":2.1691487706843304,\"y\":1.5415867870703812,\"z\":1.6025780854554041}],\"m_rect_plane_points\":[{\"x\":1.9834324958944958,\"y\":1.4310866693711659,\"z\":1.0428352597819621},{\"x\":1.9659474361904286,\"y\":1.6275800559368239,\"z\":1.0098463917822886},{\"x\":2.1516637109802632,\"y\":1.7380801736360389,\"z\":1.5695892174557302},{\"x\":2.1691487706843304,\"y\":1.5415867870703812,\"z\":1.6025780854554041}],\"m_color\":{\"x\":0.85,\"y\":0.325,\"z\":0.098}},{\"m_planeID\":\"Plane14\",\"m_parameters\":{\"x\":0.94633787798892888,\"y\":0.0083595110841050181,\"z\":-0.32307079604607664,\"w\":0.38562371296215558},\"m_convexHull\":[{\"x\":0.4004468489881034,\"y\":-1.2029827145650183,\"z\":2.3354800129842306},{\"x\":-0.45451515062582293,\"y\":-1.0770762380877483,\"z\":-0.16561391992235228},{\"x\":-0.43507154675448018,\"y\":1.5225403610906934,\"z\":-0.041394265609816384},{\"x\":0.41989045285944621,\"y\":1.3966338846134234,\"z\":2.4596996672967664}],\"m_rect_plane_points\":[{\"x\":0.4004468489881034,\"y\":-1.2029827145650183,\"z\":2.3354800129842306},{\"x\":-0.45451515062582293,\"y\":-1.0770762380877483,\"z\":-0.16561391992235228},{\"x\":-0.43507154675448018,\"y\":1.5225403610906934,\"z\":-0.041394265609816384},{\"x\":0.41989045285944621,\"y\":1.3966338846134234,\"z\":2.4596996672967664}],\"m_color\":{\"x\":0.466,\"y\":0.674,\"z\":0.188}},{\"m_planeID\":\"Plane15\",\"m_parameters\":{\"x\":-0.9386093450576386,\"y\":0.011391738421110744,\"z\":0.34479374365875,\"w\":-0.49926132100433118},\"m_convexHull\":[{\"x\":-0.14407110770059028,\"y\":-1.1690889133433977,\"z\":1.0944304964798166},{\"x\":0.14824857549352549,\"y\":0.4811960682399985,\"z\":1.8356689216548028},{\"x\":-0.19085490432614866,\"y\":0.963039094274298,\"z\":0.89663005924035977},{\"x\":-0.48317458752026443,\"y\":-0.68724588730909819,\"z\":0.15539163406537337}],\"m_rect_plane_points\":[{\"x\":-0.14407110770059028,\"y\":-1.1690889133433977,\"z\":1.0944304964798166},{\"x\":0.14824857549352549,\"y\":0.4811960682399985,\"z\":1.8356689216548028},{\"x\":-0.19085490432614866,\"y\":0.963039094274298,\"z\":0.89663005924035977},{\"x\":-0.48317458752026443,\"y\":-0.68724588730909819,\"z\":0.15539163406537337}],\"m_color\":{\"x\":0.929,\"y\":0.694,\"z\":0.125}}]}";
    }
}
#endif //V1