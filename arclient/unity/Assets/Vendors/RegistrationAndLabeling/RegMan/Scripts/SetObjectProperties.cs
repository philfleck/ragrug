using System;
using System.Collections;
using System.Collections.Generic;
using HoloLensHandTracking;
using UnityEngine;
using UnityEngine.XR.WSA.Input;
using Vizario;


namespace RegMan
{
    public class SetObjectProperties : BaseManager<SetObjectProperties>
    {
        public GameObject Cube;
        public static bool scaleobj;
        public static bool translateobj;
        public static bool rotateobj;

        private GameObject alignments;
        private GameObject currentDevice;
        private static GameObject currentBoundingBox;
        private static Vector3 axis;
        private static bool hasModel;

        public HandsTrackingController htc;
        private Transform Hand;
        public bool holdactive;

        private void Start()
        {
            if (htc == null)
            {
                Debug.Log("SetObjectProperties: HandTrackingController found!");
                Debug.Log("SetObjectProperties: Initializing HandTrackingController!");
                GameObject HandTracker = GameObject.Find("HandTracking");
                if (!HandTracker)
                {
                    Debug.LogError("SetObjectProperties: Cannot Find GameObject 'HandTracking'!");
                    return;
                }

                htc = HandTracker.GetComponent<HandsTrackingController>();
                Hand = htc.Transform_;
            }

        }



        public static bool setBoundingBox(GameObject Device)
        {
            GameObject BoundingBox = null;
            bool hasModel = true;
            try
            {
                if (Device != null)
                {
                    string deviceName = Device.name;
                    if (deviceName != null)
                    {
                        var deviceDataStr = Vizario.VApp.jWeb.ReadFromStore(deviceName);
                        if (deviceDataStr != null)
                        {
                            var parseDevice = Json.JSON.Parse(deviceDataStr);
                            var assetNameJ = parseDevice["assetname"];
                            var modelNameJ = parseDevice["modelname"];

                            Debug.Log("setBoundingBox assetNameJ=" + assetNameJ + ", modelNameJ=" + modelNameJ);
                            if (assetNameJ != null && modelNameJ != null)
                            {
                                var assetName = assetNameJ.ToString();
                                var modelName = modelNameJ.ToString();
                                BoundingBox = Vizario.AssetBundleHolder.InstantiateGameObject(assetName, modelName);

                                Debug.Log("setBoundingBox InstantiateGameObject=>" + BoundingBox.name);
                                if (BoundingBox != null)
                                {
                                    var s = BoundingBox.AddComponent<RRExtern.ThreeDModelFunctions>();
                                } 
                            }
                        }

                    }
                }
            }
            catch (Exception err)
            {
                Debug.LogError("setBoundingBox ERROR => " + err);
            }

            if (BoundingBox == null)
            {
                hasModel = false;
                BoundingBox = Instantiate(GetRTInstance().Cube);
            }

            BoundingBox.name = Device.name + "BoundingBox";
            BoundingBox.transform.parent = Device.transform;
            BoundingBox.transform.localPosition = Vector3.zero;
            BoundingBox.transform.localRotation = Quaternion.identity;
            //BoundingBox.transform.localScale = Vector3.one ;
            toggleVisibility(BoundingBox, false);

            return hasModel;
        }

        public static void toggleVisibility(GameObject Device, bool visible)
        {

            Debug.Log("toggleVisibility for " + Device.name);
            try
            {
                var sr = Device.GetComponent<Renderer>();
                if (sr != null)
                {
                    sr.enabled = visible;
                }

                Renderer[] rs = Device.GetComponentsInChildren<Renderer>();
                foreach (Renderer r in rs)
                {
                    r.enabled = visible;
                }
            }
            catch (Exception err)
            {
                Debug.LogError("toggleVisibility ERROR => " + err);
            }
        }

        public static void StartRegistration(string RegistrationObjectName)
        {
            Debug.Log("StartRegistration for " + RegistrationObjectName);
            GameObject world = GameObject.Find("world");
            if (world == null)
            {
                world = new GameObject("world");
                Debug.Log("Creating world GameObject");
            }

            if (GameObject.Find(RegistrationObjectName))
            {
                GetRTInstance().currentDevice = GameObject.Find(RegistrationObjectName);
                //return;
            }

            GetRTInstance().alignments = GameObject.Find("alignments");
            if (GetRTInstance().alignments == null)
            {
                GetRTInstance().alignments = new GameObject("alignments");
                GetRTInstance().alignments.transform.parent = world.transform;



                //Here we have to set the local position since we have
                // world
                //   alignemnts
                //if we set global to 0 and the world anchor is elsewere, it's
                //local position is computed and the alignments are ofset to the
                //world anchor
                //GetRTInstance().alignments.transform.position = Vector3.zero;
                //GetRTInstance().alignments.transform.rotation = Quaternion.identity;
                //GetRTInstance().alignments.transform.localScale = Vector3.one;
                GetRTInstance().alignments.transform.localPosition = Vector3.zero;
                GetRTInstance().alignments.transform.localRotation = Quaternion.identity;
                GetRTInstance().alignments.transform.localScale = Vector3.one;
            }

            GameObject alignment_top = GameObject.Find(RegistrationObjectName);
            if (alignment_top == null)
            {
                alignment_top = new GameObject(RegistrationObjectName);
                alignment_top.transform.parent = GetRTInstance().alignments.transform;

                //when setting the local position here, while being localized in the world
                //the position will be relative to the world
                //therefore we have to set is global position, so its local cann be autocomputed
                //alignment_top.transform.localPosition =
                alignment_top.transform.position =
                    Camera.main.transform.position + Camera.main.transform.forward * 1.5f;
                alignment_top.transform.localRotation = Quaternion.identity;
            }

            hasModel = true;
            GameObject BoundingBox = GameObject.Find(alignment_top.transform.name + "BoundingBox");
            if (!BoundingBox)
            {
                hasModel = setBoundingBox(alignment_top);
                BoundingBox = GameObject.Find(alignment_top.transform.name + "BoundingBox");
                /*BoundingBox = Instantiate(GetRTInstance().Cube);
                BoundingBox.transform.parent = alignment_top.transform;
                BoundingBox.transform.name = alignment_top.transform.name + "BoundingBox";
                BoundingBox.transform.localPosition = Vector3.zero;
                BoundingBox.transform.localRotation = Quaternion.identity;*/
            }

            GameObject UniScale = GameObject.Find(alignment_top.transform.name + "UniScale");
            if (!UniScale)
            {
                UniScale = new GameObject(alignment_top.transform.name + "UniScale");
                UniScale.transform.parent = alignment_top.transform;
                UniScale.transform.localPosition = Vector3.zero;
                UniScale.transform.localRotation = Quaternion.identity;
            }
            GetRTInstance().currentDevice = alignment_top;
            currentBoundingBox = BoundingBox;
            toggleVisibility(currentBoundingBox, hasModel);
        }
        public static void finishRegistration(string RegistrationObjectName, Vector3[] partPositions, string[] parts)
        {
            Debug.Log("finishRegistration: " + RegistrationObjectName);
            GameObject regObject = GameObject.Find(RegistrationObjectName + "UniScale");
            GameObject BoundingBox = GameObject.Find(RegistrationObjectName + "BoundingBox");
            if (regObject != null && BoundingBox != null)
            {
                var sr = BoundingBox.GetComponent<Renderer>();
                if (sr != null)
                {
                    sr.enabled = hasModel;
                }

                Renderer[] rs = BoundingBox.GetComponentsInChildren<Renderer>();
                foreach (Renderer r in rs)
                {
                    r.enabled = hasModel;
                }
                SpawnAndAnnotate.AnnotateCube(regObject, new List<string>(parts), new List<Vector3>(partPositions));
            }
            else
            {
                Debug.Log("Could not find Registration Object: " + RegistrationObjectName);
            }
        }

        public static void ManipulateXAxis()
        {
            //Debug.Log("ManipulateXAxis");
            axis = Vector3.right;
        }

        public static void ManipulateYAxis()
        {
            //Debug.Log("ManipulateYAxis");
            axis = Vector3.up;
        }

        public static void ManipulateZAxis()
        {
            //Debug.Log("ManipulateZAxis");
            axis = Vector3.forward;
        }

        public static void ManipulateAllAxes()
        {
            //Debug.Log("ManipulateAllAxes");
            axis = Vector3.one;
        }

        public static void ScaleObject()
        {
            //Debug.Log("ScaleObject");
            scaleobj = true;
            rotateobj = false;
            translateobj = false;
        }

        public static void TranslateObject()
        {
            //Debug.Log("TranslateObject");

            translateobj = true;
            rotateobj = false;
            scaleobj = false;
        }

        public static void RotateObject()
        {
            //Debug.Log("RotateObject");

            rotateobj = true;
            scaleobj = false;
            translateobj = false;
        }

        private float mapRange(float input, float input_start, float input_end, float output_start, float output_end)
        {
            return output_start + ((output_end - output_start) / (input_end - input_start)) * (input - input_start);
        }

        Vector3 handStartPos = Vector3.zero;
        private void Translate(Transform obj)
        {
            var diff = Hand.position - handStartPos;
            obj.position += diff * Time.deltaTime;

            /*
           obj.position = Vector3.Lerp(
               obj.position,  
               Camera.main.transform.forward * Vector3.Distance(Hand.position, obj.position) + Hand.position, 
               Time.deltaTime*3);
               */
        }

        private void Rotate(Transform obj, float strength)
        {
            obj.Rotate(axis * strength * 20f * Time.deltaTime);
        }

        private void Scale(Transform obj, float strength)
        {
            Vector3 newScale = obj.localScale + axis * strength * 0.01f;
            if (newScale.x > 0 && newScale.y > 0 && newScale.z > 0)
            {
                obj.localScale = newScale;
                Transform uniscale = obj.transform.Find(obj.name + "UniScale");
                uniscale.localScale = new Vector3(1 / obj.localScale.x, 1 / obj.localScale.y, 1 / obj.localScale.z);
            }
        }

        private float calcStrength(Vector3 handPosition)
        {
            Vector2 viewport = Camera.main.WorldToViewportPoint(handPosition);

            if (viewport.x < 0.5f)
            {
                //Debug.Log("Left");
                return mapRange(viewport.x, 0, 0.49f, -1f, 0);
            }
            else
            {
                //Debug.Log("Right");
                return mapRange(viewport.x, 0.5f, 1f, 0f, 1f);
            }
        }

        bool testHold = false;
        void Update()
        {
            if (!holdactive && testHold)
            {
                testHold = false;
            }

            if (Hand == null)
            {
                if (htc == null)
                {
                    GameObject HandTracker = GameObject.Find("HandTrackingManager");
                    if (!HandTracker)
                    {
                        return;
                    }

                    htc = HandTracker.GetComponent<HandsTrackingController>();
                }
                Hand = htc.Transform_;
            }

            if (holdactive && Hand && currentDevice)
            {
                if (!testHold)
                {
                    handStartPos = Hand.position;
                    testHold = true;
                }

                float strength = calcStrength(Hand.position);

                if (translateobj)
                {
                    //Debug.Log("Translating...");
                    Translate(GetRTInstance().currentDevice.transform);
                }
                else if (rotateobj)
                {
                    //Debug.Log("Rotating...");
                    Rotate(GetRTInstance().currentDevice.transform, strength);
                }
                else if (scaleobj)
                {
                    //Debug.Log("Scaling...");
                    Scale(GetRTInstance().currentDevice.transform, strength);
                }
            }
        }
    }
}