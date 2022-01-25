using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.WSA.Input;

namespace RegMan
{
    public class LabelPinner : BaseManager<LabelPinner>
    {
        public IEnumerator moveLabel_;
        private GestureRecognizer gs;
        public bool moveIsRunning;

        //public static LabelPinner instance;

        // Start is called before the first frame update
        void Start()
        {
            //instance = this;
            gs = new GestureRecognizer();
            gs.SetRecognizableGestures(GestureSettings.Tap | GestureSettings.Hold | GestureSettings.DoubleTap);

            gs.Tapped += (TappedEventArgs args) =>
            {
                
                if (GetRTInstance().moveIsRunning)
                {
                    Debug.Log("move label stopped");
                    StopCoroutine(GetRTInstance().moveLabel_);
                    GetRTInstance().moveIsRunning = false;
                    gs.StopCapturingGestures();
                }
            };
            //gs.StartCapturingGestures();
        }

        private IEnumerator moveLabel(Transform label)
        {
            GetRTInstance().moveIsRunning = true;
            Transform child = label.GetChild(0);
            while (true)
            {
                RaycastHit hit;
                if (Physics.Raycast(Camera.main.transform.position, Camera.main.transform.forward, out hit))
                {
                    if (hit.transform.name.Contains("SpatialMesh"))
                    {
                        //Debug.Log("moving label " + hit.transform.name);
                        child.position = hit.point + hit.normal * 0.15f;

                        child.forward = -hit.normal;
                    }

                }

                yield return new WaitForSeconds(0.15f);
            }
        }

        public static void pinToMesh(string devicename, string partname)
        {

            GameObject device = GameObject.Find(devicename + "UniScale");
            if (!device)
            {
                Debug.LogError("pinToMesh: Device not found!");
                return;
            }

            Transform label = device.transform.Find(partname);

            if (!label)
            {
                Debug.LogError("pinToMesh: Label not found! " + devicename + "part: " + partname);
                return;
            }
            
            if (label.transform.GetChild(0))
            {
                GameObject lr = label.transform.GetChild(0).gameObject;
                if (lr)
                {
                    if (LabelManager.GetRTInstance().labelList.Contains(lr))
                    {
                        var labelname = "Label-" + devicename + "UniScale_" + label.name;
                        var wu = PowerUI.WorldUI.Find(labelname);
                        var lref = LabelManager.GetRTInstance().GetLabelRef(lr.name);
                        if (lref.pinned)
                        {
                            if(wu != null)
                            {
                                //var sz = wu.WorldScreenSize;
                                //wu.SetDimensions((int)sz.x * 2, (int)sz.y * 2);

                                int res = (int)(1920 / 0.35f);
                                wu.SetResolution(res);
                                wu.UpdateResolution();
                            } 
                            else
                            {
                                Debug.LogError("YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY wu is null");
                            }

                            Debug.Log("activateLabel " + lref.lName);
                            LabelManager.GetRTInstance().activateLabel(lref);
                        }
                        else
                        {
                            Debug.LogError("YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY " + label.name);
                            //Label-zrga2-r0UniScale_s001
                            // Label-[device]UniScale_[part]
                           
                            if(wu != null)
                            {
                                //var sz = wu.WorldScreenSize;
                                //wu.SetDimensions((int)sz.x * 2, (int)sz.y * 2);

                                int res = (int)(1920 / 0.7f);
                                wu.SetResolution(res);
                                wu.UpdateResolution();
                            } 
                            else
                            {
                                Debug.LogError("YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY wu is null");
                            }

                            Debug.Log("deactivateLabel " + lref.lName);
                            GetRTInstance().moveLabel_ = GetRTInstance().moveLabel(label);
                            GetRTInstance().StartCoroutine(GetRTInstance().moveLabel_);
                            GetRTInstance().gs.StartCapturingGestures();
                            LabelManager.GetRTInstance().deactivateLabel(lref);
                        }

                    }
                }
            }
        }
    }
}
