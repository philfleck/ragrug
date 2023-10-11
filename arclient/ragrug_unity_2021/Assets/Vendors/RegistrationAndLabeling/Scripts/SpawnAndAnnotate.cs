using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Tracing;
using System.IO;
using System.Linq;
using Css;
using Dom;
using PowerUI;
using RegMan;
using RR;
using UnityEditor;
using UnityEngine;
using UnityEngine.Serialization;
using Vizario.VApp;

namespace RegMan
{
    public class SpawnAndAnnotate : MonoBehaviour
    {
        PowerUI.WorldUI wui = null;

        public static void AnnotateCubeBase(GameObject Cube, string[] parts, Vector3[] partPositions)

        {
            AnnotateCube(Cube, parts.ToList<string>(), partPositions.ToList<Vector3>());
        }

        public static void AnnotateCube(GameObject Cube, List<string> parts, List<Vector3> partPositions)
        {
            try
            {
                var urlPrefix = Runtime.GetUrlPrefix();

                if (HtmlUIManager.GetRTInstance().gameObject.GetComponent<LabelManager>() == null)
                    HtmlUIManager.GetRTInstance().gameObject.AddComponent<LabelManager>();

                var partsAndPositions = parts.Zip(partPositions, (n, w) => new { Part = n, Position = w });
                foreach (var p in partsAndPositions)
                {
                    Transform child = Cube.transform.Find(p.Part);
                    if (child == null)
                    {
                        GameObject c = new GameObject(p.Part);
                        child = c.transform;
                        child.transform.parent = Cube.transform;
                        child.transform.localPosition = p.Position;
                    }
                    string name = Cube.transform.name + "_" + child.name;

                    string labelname = "Label-" + name;

                    //maybe destroy and re-init here
                    if (GameObject.Find(labelname)) return;

                    Vector3 direction = (child.transform.position - Cube.transform.position).normalized;
                    
                    Vector3 labelPosition = Vector3.zero;
                    Color dbgColor = Color.gray;
                    if (Vector3.Dot(direction, -Camera.main.transform.forward) > 0)
                    {
                        labelPosition = child.transform.InverseTransformVector(direction * 0.15f);
                        dbgColor = Color.green;
                    }
                    else
                    {
                        direction = new Vector3(-direction.x * 0.15f, -direction.y * 0.15f, 0);
                        labelPosition = child.transform.InverseTransformVector(direction * 0.15f);
                        labelPosition = new Vector3(labelPosition.x, labelPosition.y, -child.transform.localPosition.z);
                        dbgColor = Color.red;
                    }

                    /*
                    //start debugging
                    //labelPosition = direction;// * 0.2f;
                    labelPosition.x = 0f;
                    labelPosition.y = 0.15f;
                    labelPosition.z = 0f;
                    var dGo = GameObject.CreatePrimitive(PrimitiveType.Cube);
                    dGo.name = "DBG-" + labelname;
                    dGo.transform.parent = child.gameObject.transform;
                    dGo.transform.localScale = Vector3.one * 0.01f;
                    dGo.transform.localPosition = labelPosition;
                    dGo.GetComponent<Renderer>().material.color = dbgColor;
                    // end debugging
                    */

                    //string[] args = { Cube.name, p.Part };
                    Debug.Log("AnnotateCube for " + Cube.transform.parent.name + "/" + p.Part);
                    string[] args = { Cube.transform.parent.name, p.Part };
                    HtmlUIManager.GetRTInstance().CreatePanel(labelname, child.gameObject, labelPosition, Vector3.zero, urlPrefix + "/label.html", "Label_SetInfo", args);
                    HtmlUIManager.GetRTInstance().gameObject.GetComponent<LabelManager>().CreateLabel(child.gameObject, labelname, "2D");

                }
                HtmlUIManager.GetRTInstance().gameObject.GetComponent<LabelManager>().InitOcclusionManager();
            }
            catch (Exception e)
            {
                Debug.LogError("AnnotateCube ERROR => " + e);
            }
        }
    }
}
