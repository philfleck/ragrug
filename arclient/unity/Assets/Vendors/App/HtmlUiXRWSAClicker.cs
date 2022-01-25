//#define USE_CAMERA_POINTER
//#define USE_LASER_POINTER
//#define USE_BOTH
//#define USE_LASER_POINTER_WUI
//#define H1_ON
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
//using HoloLensHandTracking;
using PowerUI;
using UnityEngine.EventSystems;
using Boo.Lang;
using Microsoft.MixedReality.Toolkit.Utilities;

#if UNITY_WSA
using UnityEngine.XR.WSA.Input;
using Microsoft.MixedReality.Toolkit.Input;
#endif

namespace Vizario
{
    public class HtmlUiXRWSAClicker : MonoBehaviour//, IPointerClickHandler
    {
        public class LpEntry
        {
            public PowerUI.InputPointer lp;
            public GameObject go;
        }
        public int initDone = 0;
        public Dictionary<int, LpEntry> touchDict = new Dictionary<int, LpEntry>();

        //for H1 use
        PowerUI.MousePointer MPointer = null;
        CameraPointer CPointer = null;
        GestureRecognizer gs2;


        GameObject leftTipGo;
        GameObject rightTipGo;
        LaserPointer leftLaser;
        LaserPointer rightLaser;

        void Awake()
        {
            bool mouseOn = false;
#if UNITY_EDITOR
            mouseOn = true;
#endif
            PowerUI.Input.CreateSystemMouse = mouseOn;

#if !UNITY_EDITOR
#if H1_ON
            SetupCameraPointerH1();
#endif
#endif
            InitLR();
        }

        public void InitLR()
        {
            leftTipGo = new GameObject("MyLeftTip");
            rightTipGo = new GameObject("MyRightTip");

            leftLaser = new LaserPointer(leftTipGo.transform, true);
            rightLaser = new LaserPointer(rightTipGo.transform, true);

            var ls = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            ls.name = "MyLeftTipSphere";
            ls.transform.parent = leftTipGo.transform;
            ls.transform.localScale = Vector3.one * 0.02f;
            ls.transform.localPosition = Vector3.zero;
            ls.transform.localRotation = Quaternion.identity;
            ls.GetComponent<Renderer>().material.color = Color.red;

            var rs = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            rs.name = "MyRightTipSphere";
            rs.transform.parent = rightTipGo.transform;
            rs.transform.localScale = Vector3.one * 0.02f;
            rs.transform.localPosition = Vector3.zero;
            rs.transform.localRotation = Quaternion.identity;
            rs.GetComponent<Renderer>().material.color = Color.green;

            leftLaser.Add();
            rightLaser.Add();
        }

        void Update()
        {
            MixedRealityPose leftTip, rightTip;

            var leftHand = HandJointUtils.FindHand(Handedness.Left);
            if (leftHand != null)
            {
                if (leftHand.TryGetJoint(TrackedHandJoint.IndexTip, out leftTip))
                {
                    leftTipGo.transform.position = leftTip.Position;
                    leftTipGo.transform.rotation = leftTip.Rotation;
                }
            } 

            var rightHand = HandJointUtils.FindHand(Handedness.Right);
            if (rightHand != null)
            {
                if (rightHand.TryGetJoint(TrackedHandJoint.IndexTip, out rightTip))
                {
                    rightTipGo.transform.position = rightTip.Position;
                    rightTipGo.transform.rotation = rightTip.Rotation;
                }
            }
        }

        private void OnGUI()
        {
            foreach (var e in touchDict.Values)
            {
                if (e != null)
                {
                    if (e.lp != null)
                    {
                        e.lp.HandleEvent();
                    }
                }
            }

            //H1
#if H1_ON
            MPointer?.HandleEvent();
            CPointer?.HandleEvent();
#endif
            //LR
            leftLaser?.HandleEvent();
            rightLaser?.HandleEvent();
        }

        private void SetupCameraPointerH1()
        {

            // Create a camera pointer that sits in the middle of the screen (50%,50%):
            MPointer = new PowerUI.MousePointer();
            CPointer = new CameraPointer(Camera.main, 0.5f, 0.5f);
            // Add it now:
            MPointer.Add();
            CPointer.Add();

            gs2 = new GestureRecognizer();
            gs2.SetRecognizableGestures(GestureSettings.Tap /*| GestureSettings.Hold*/);
            //gs.TappedEvent += Gs_TappedEvent;

            gs2.Tapped += (TappedEventArgs args) =>
            {
                MPointer?.Click(0);
                CPointer?.Click(0);
            };

            /*
            gs2.HoldStarted += (HoldStartedEventArgs args) =>
            {
                Debug.Log("Hold Started");
                RegMan.SetObjectProperties.GetRTInstance().holdactive = true;
            };
            gs2.HoldCompleted += (HoldCompletedEventArgs args) =>
            {
                Debug.Log("Hold Completed");
                RegMan.SetObjectProperties.GetRTInstance().holdactive = false;
            };

            gs2.HoldCanceled += (HoldCanceledEventArgs args) =>
            {
                Debug.Log("Hold Canceled");
                RegMan.SetObjectProperties.GetRTInstance().holdactive = false;
            };
            */
            gs2.StartCapturingGestures();
        }
    }
}


#if false
namespace Vizario
{
    public class HtmlUiXRWSAClicker : MonoBehaviour//, IPointerClickHandler
    {
        //public GameObject Cursor;
        //private HandsTrackingController hTC;
#if UNITY_WSA
        //#if UNITY_EDITOR
        //GestureRecognizer gs2; 
        LaserPointer laserPointer;



        bool initDone = false;


        //Detect if a click occurs
        public void OnPointerClick(PointerEventData eventData)
        {
            //Output to console the clicked GameObject's name and the following message. You can replace this with your own actions for when clicking the GameObject.
            //Debug.Log(name + " Game Object Clicked!");
            //laserPointer.Click(0);
        }


        void OnGUI()
        {
            // Returns true if your pointer actually did something (it went down or up)
            // You can also directly pass a UnityEngine.Event too.

            //bool didSomething = MyPointer.HandleEvent();
            //bool change = laserPointer.HandleEvent();
        }

        private void Update()
        {
            if (!initDone)
            {
                var go = GameObject.Find("PokePointer(Clone)");
                if (go != null)
                {
                    Debug.Log("HtmlUiXRWSAClicker => Found PokePointer(Clone), setting up laserPointer!");
                    laserPointer = new LaserPointer(go.transform, true);
                    laserPointer.Add();




                    initDone = true;
                }
            }
        }

        void Awake()
        {
            PowerUI.Input.CreateSystemMouse = false;

            //hTC = GetComponent<HandsTrackingController>();
            //if(hTC == null)
            //{    
            //    hTC = this.gameObject.AddComponent<HandsTrackingController>();
            //}

            //laserPointer = new LaserPointer(hTC.gameObject.transform, true);
            //laserPointer.Add();



#if false
            // Disable the system mouse:
            PowerUI.Input.CreateSystemMouse = false; //was false
            //hTC = GetComponent<HandsTrackingController>();
            
            // Create a camera pointer that sits in the middle of the screen (50%,50%):
            MPointer = new MousePointer();
            

            // Add it now:
            MPointer.Add();

            gs2 = new GestureRecognizer();
            gs2.SetRecognizableGestures(GestureSettings.Tap | GestureSettings.Hold);
            //gs.TappedEvent += Gs_TappedEvent;

            gs2.Tapped += (TappedEventArgs args) =>
            {
                // Debug.Log("Cursor Tap Position: " + Cursor.transform.position);
                //LabelCreation.CreateAnnotation.CreateRoomLabels(Cursor.transform.position);
              Debug.Log("Tapped");  
              MPointer.Click(0);
            };
            gs2.HoldStarted += (HoldStartedEventArgs args) =>
            {
                Debug.Log("Hold Started");
                RegMan.SetObjectProperties.GetRTInstance().holdactive = true;
            };
           gs2.HoldCompleted += (HoldCompletedEventArgs args) =>
            {
                Debug.Log("Hold Completed");
                RegMan.SetObjectProperties.GetRTInstance().holdactive = false;
            };

            gs2.HoldCanceled += (HoldCanceledEventArgs args) =>
            {
                Debug.Log("Hold Canceled");
                RegMan.SetObjectProperties.GetRTInstance().holdactive = false;
            };
            gs2.StartCapturingGestures();
#endif

        }
#if false
        void OnGUI()
        {
            // Returns true if your pointer actually did something (it went down or up)
            // You can also directly pass a UnityEngine.Event too.
            if (UnityEngine.Input.GetMouseButtonDown(0))
            {
                Debug.Log("Mouse0 down" + UnityEngine.Input.mousePosition);


            }
            bool didSomething = MPointer.HandleEvent();
        }
#endif

#elif USE_CAMERA_POINTER
            UnityEngine.XR.WSA.Input.GestureRecognizer gs;
        CameraPointer MyPointer;

        void Awake()
        {
            // Disable the system mouse:
            PowerUI.Input.CreateSystemMouse = false;
            hTC = GetComponent<HandsTrackingController>();
            // Create a camera pointer that sits in the middle of the screen (50%,50%):
            MyPointer = new CameraPointer(Camera.main, 0.5f, 0.5f);
            
            // Add it now:
            MyPointer.Add();

            gs = new UnityEngine.XR.WSA.Input.GestureRecognizer();
            gs.SetRecognizableGestures(UnityEngine.XR.WSA.Input.GestureSettings.Tap | UnityEngine.XR.WSA.Input.GestureSettings.Hold);
            //gs.TappedEvent += Gs_TappedEvent;

            gs.Tapped += (UnityEngine.XR.WSA.Input.TappedEventArgs args) =>
            {
                MyPointer.Click(0);
            };
            gs.HoldStarted += (UnityEngine.XR.WSA.Input.HoldStartedEventArgs args) =>
            {
                Debug.Log("Hold Started");
                RegMan.SetObjectProperties.GetRTInstance().holdactive = true;
            };
           gs.HoldCompleted += (UnityEngine.XR.WSA.Input.HoldCompletedEventArgs args) =>
            {
                Debug.Log("Hold Completed");
                RegMan.SetObjectProperties.GetRTInstance().holdactive = false;
            };

            gs.HoldCanceled += (UnityEngine.XR.WSA.Input.HoldCanceledEventArgs args) =>
            {
                Debug.Log("Hold Canceled");
                RegMan.SetObjectProperties.GetRTInstance().holdactive = false;
            };
            gs.StartCapturingGestures();
        }

        void OnGUI()
        {
            // Returns true if your pointer actually did something (it went down or up)
            // You can also directly pass a UnityEngine.Event too.
            bool didSomething = MyPointer.HandleEvent();
        }


#elif USE_BOTH
        UnityEngine.XR.WSA.Input.GestureRecognizer gs;
        UnityEngine.XR.WSA.Input.GestureRecognizer gsdt;
        LaserPointerPAWUI laserPointer;
        CameraPointer cameraPointer;

        void Awake()
        {
            hTC = GetComponent<HandsTrackingController>();
            // Disable the system mouse:
            PowerUI.Input.CreateSystemMouse = false;

            // Create a camera pointer that sits in the middle of the screen (50%,50%):
            var ch = GameObject.Find("CameraHook");
            laserPointer = new LaserPointerPAWUI(hTC, Cursor);
            cameraPointer = new CameraPointer(Camera.main, 0.5f, 0.5f);

            // Add it now:
            laserPointer.Add();
            cameraPointer.Add();

            gs = new UnityEngine.XR.WSA.Input.GestureRecognizer();
            gs.SetRecognizableGestures(UnityEngine.XR.WSA.Input.GestureSettings.Tap | UnityEngine.XR.WSA.Input.GestureSettings.Hold);
            //gs.TappedEvent += Gs_TappedEvent;
            

            gs.Tapped += (TappedEventArgs args) =>
            {
                cameraPointer.Click(0);
                laserPointer.Click(0);
                //Vizario.VApp.AppManager.Instance.RunRegisteredClickFunctions(VApp.ClickTypes.SINGLE);
            };
            
             gs.HoldStarted += (HoldStartedEventArgs args) =>
            {
                Debug.Log("Hold Started");
                if (RegMan.SetObjectProperties.scaleobj)
                {
                    RegMan.SetObjectProperties.GetRTInstance().ScalingRoutine =
                        RegMan.SetObjectProperties.GetRTInstance().Scaling(hTC.Transform_);
                    StartCoroutine(RegMan.SetObjectProperties.GetRTInstance().ScalingRoutine);
                }
                else if(RegMan.SetObjectProperties.translateobj)
                {
                    // RegMan.SetObjectProperties.Instance.Positioning(hTC.Transform_);
                    RegMan.SetObjectProperties.GetRTInstance().PositioningRoutine =
                        RegMan.SetObjectProperties.Positioning(hTC.Transform_);
                    StartCoroutine(RegMan.SetObjectProperties.GetRTInstance().PositioningRoutine);
                }
                else if (RegMan.SetObjectProperties.rotateobj)
                {
                    RegMan.SetObjectProperties.GetRTInstance().RotatingRoutine = RegMan.SetObjectProperties.GetRTInstance().Rotating(hTC.Transform_);
                    StartCoroutine(RegMan.SetObjectProperties.GetRTInstance().RotatingRoutine);
                }
            };
            gs.HoldCompleted += (HoldCompletedEventArgs args) =>
            {
                Debug.Log("Hold Completed");
                if (RegMan.SetObjectProperties.scaleobj)
                {
                    Debug.Log("Stop Scaling");
                    StopCoroutine(RegMan.SetObjectProperties.GetRTInstance().ScalingRoutine);
                }
                else if(RegMan.SetObjectProperties.translateobj)
                {
                    Debug.Log("Stop Positioning");
                    // RegMan.SetObjectProperties.Instance.StopPositioning();
                    StopCoroutine(RegMan.SetObjectProperties.GetRTInstance().PositioningRoutine);
                }
                else if (RegMan.SetObjectProperties.rotateobj)
                {
                    Debug.Log("Stop Rotating");
                    StopCoroutine(RegMan.SetObjectProperties.GetRTInstance().RotatingRoutine);
                }
            };

            gs.HoldCanceled += (HoldCanceledEventArgs args) =>
            {
                Debug.Log("Hold Canceled");
                if (RegMan.SetObjectProperties.scaleobj)
                {
                    Debug.Log("Stop Scaling");
                    StopCoroutine(RegMan.SetObjectProperties.GetRTInstance().ScalingRoutine);
                }
                else if(RegMan.SetObjectProperties.translateobj)
                {
                    Debug.Log("Stop Positioning");
                    // RegMan.SetObjectProperties.Instance.StopPositioning();
                    StopCoroutine(RegMan.SetObjectProperties.GetRTInstance().PositioningRoutine);
                }
                else if (RegMan.SetObjectProperties.rotateobj)
                {
                    Debug.Log("Stop Rotating");
                    StopCoroutine(RegMan.SetObjectProperties.GetRTInstance().RotatingRoutine);
                }
            };
            
            gs.StartCapturingGestures();

            gsdt = new UnityEngine.XR.WSA.Input.GestureRecognizer();
            gsdt.SetRecognizableGestures(UnityEngine.XR.WSA.Input.GestureSettings.DoubleTap);
            gsdt.Tapped += (TappedEventArgs args) =>
            {
                //Vizario.VApp.AppManager.Instance.RunRegisteredClickFunctions(VApp.ClickTypes.DOUBLE);
            };
            gsdt.StartCapturingGestures();
        }

        void OnGUI()
        {
            // Returns true if your pointer actually did something (it went down or up)
            // You can also directly pass a UnityEngine.Event too.
            bool didSomething1 = laserPointer.HandleEvent();
            bool didSomething2 = cameraPointer.HandleEvent();
        }
#elif USE_LASER_POINTER_WUI

        UnityEngine.XR.WSA.Input.GestureRecognizer gs;
        LaserPointerPAWUI MyPointer;
        //
         void Awake()
         { 
             // Disable the system mouse:
            PowerUI.Input.CreateSystemMouse = false;
        
            hTC = GetComponent<HandsTrackingController>();
            MyPointer = new LaserPointerPAWUI(hTC, Cursor);
            MyPointer.Add();
            
            gs = new GestureRecognizer();
            gs.SetRecognizableGestures(GestureSettings.Tap | GestureSettings.Hold);
            //gs.TappedEvent += Gs_TappedEvent;

            gs.Tapped += (TappedEventArgs args) =>
            {
              MyPointer.Click(0);
            };
            gs.HoldStarted += (HoldStartedEventArgs args) =>
            {
                Debug.Log("Hold Started");
                if (RegMan.SetObjectProperties.scaleobj)
                {
                    RegMan.SetObjectProperties.GetRTInstance().ScalingRoutine =
                        RegMan.SetObjectProperties.GetRTInstance().Scaling(hTC.Transform_);
                    StartCoroutine(RegMan.SetObjectProperties.GetRTInstance().ScalingRoutine);
                }
                else if(RegMan.SetObjectProperties.translateobj)
                {
                    // RegMan.SetObjectProperties.Instance.Positioning(hTC.Transform_);
                    RegMan.SetObjectProperties.GetRTInstance().PositioningRoutine =
                        RegMan.SetObjectProperties.Positioning(hTC.Transform_);
                    StartCoroutine(RegMan.SetObjectProperties.GetRTInstance().PositioningRoutine);
                }
                else if (RegMan.SetObjectProperties.rotateobj)
                {
                    RegMan.SetObjectProperties.GetRTInstance().RotatingRoutine = RegMan.SetObjectProperties.GetRTInstance().Rotating(hTC.Transform_);
                    StartCoroutine(RegMan.SetObjectProperties.GetRTInstance().RotatingRoutine);
                }
            };
            gs.HoldCompleted += (HoldCompletedEventArgs args) =>
            {
                Debug.Log("Hold Completed");
                if (RegMan.SetObjectProperties.scaleobj)
                {
                    Debug.Log("Stop Scaling");
                    StopCoroutine(RegMan.SetObjectProperties.GetRTInstance().ScalingRoutine);
                }
                else if(RegMan.SetObjectProperties.translateobj)
                {
                    Debug.Log("Stop Positioning");
                    // RegMan.SetObjectProperties.Instance.StopPositioning();
                    StopCoroutine(RegMan.SetObjectProperties.GetRTInstance().PositioningRoutine);
                }
                else if (RegMan.SetObjectProperties.rotateobj)
                {
                    Debug.Log("Stop Rotating");
                    StopCoroutine(RegMan.SetObjectProperties.GetRTInstance().RotatingRoutine);
                }
            };

            gs.HoldCanceled += (HoldCanceledEventArgs args) =>
            {
                Debug.Log("Hold Canceled");
                if (RegMan.SetObjectProperties.scaleobj)
                {
                    Debug.Log("Stop Scaling");
                    StopCoroutine(RegMan.SetObjectProperties.GetRTInstance().ScalingRoutine);
                }
                else if(RegMan.SetObjectProperties.translateobj)
                {
                    Debug.Log("Stop Positioning");
                    // RegMan.SetObjectProperties.Instance.StopPositioning();
                    StopCoroutine(RegMan.SetObjectProperties.GetRTInstance().PositioningRoutine);
                }
                else if (RegMan.SetObjectProperties.rotateobj)
                {
                    Debug.Log("Stop Rotating");
                    StopCoroutine(RegMan.SetObjectProperties.GetRTInstance().RotatingRoutine);
                }
            };
            gs.StartCapturingGestures();
        }

        void OnGUI()
        {
            // Returns true if your pointer actually did something (it went down or up)
            // You can also directly pass a UnityEngine.Event too.
            bool didSomething = MyPointer.HandleEvent();
        }
        
#endif
        //#endif
    }

}
#endif