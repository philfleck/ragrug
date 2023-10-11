//Coded by Abishek J Reuben
//https://abishekjreuben.wixsite.com/portfolio/post/creating-a-exploded-view-for-3d-models-in-unity

using UnityEngine;
using System.Collections.Generic;
using System;
using UnityEngine.UIElements;

namespace RRExtern
{
    [Serializable]
    public class SubMeshes
    {
        public MeshRenderer meshRenderer;
        public Vector3 originalPosition;
        public Vector3 explodedPosition;
    }

    public class SubLabelMeshes
    {
        public GameObject LabelMesh;
        public Vector3 originalPosition;
        public Vector3 explodedPosition;
    }

    public class ThreeDModelFunctions : MonoBehaviour
    {
        #region Variables
        public List<SubMeshes> childMeshRenderers;
        public List<SubLabelMeshes> ModelLabels;
        bool isInExplodedView = false;
        public float explosionSpeed = 0.1f;
        bool isMoving = false;


        #endregion


        #region UnityFunctions


        private void Awake()
        {
            childMeshRenderers = new List<SubMeshes>();
           
            foreach (var item in GetComponentsInChildren<MeshRenderer>())
            {
                SubMeshes mesh = new SubMeshes();
                
                mesh.meshRenderer = item;
                mesh.originalPosition = mesh.meshRenderer.transform.localPosition;
                mesh.explodedPosition = mesh.meshRenderer.transform.localPosition * 2f;
                childMeshRenderers.Add(mesh);
            }
            
            
        }

        private void setLabelMeshes()
        {
            if (ModelLabels != null) return;
            
            ModelLabels = new List<SubLabelMeshes>();
            Transform parent = transform.parent;
            if (parent != null)
            {
                Transform label_go = parent.Find(parent.transform.name + "UniScale");
                if (label_go)
                {
                    for (int i = 0; i < label_go.childCount; i++)
                    {
                        Transform label = label_go.GetChild(i);
                        SubLabelMeshes slm = new SubLabelMeshes();
                        slm.LabelMesh = label.gameObject;
                        slm.originalPosition = label.transform.localPosition;
                        slm.explodedPosition = label.transform.localPosition * 2f;
                        ModelLabels.Add(slm);
                    }

                }
            }
            
        }

        private void Update()
        {
            if (isMoving)
            {
                if (isInExplodedView)
                {
                    foreach (var item in childMeshRenderers)
                    {
                        item.meshRenderer.transform.localPosition = Vector3.Lerp(item.meshRenderer.transform.localPosition, item.explodedPosition, explosionSpeed);
                        if (Vector3.Distance(item.meshRenderer.transform.localPosition, item.explodedPosition) < 0.001f)
                        {
                            isMoving = false;
                        }
                    }
                    foreach (var label in ModelLabels)
                    {
                        label.LabelMesh.transform.localPosition = Vector3.Lerp(label.LabelMesh.transform.localPosition, label.explodedPosition, explosionSpeed);
                        if (Vector3.Distance(label.LabelMesh.transform.localPosition, label.explodedPosition) < 0.001f)
                        {
                            isMoving = false;
                        }
                    }
                }
                else
                {
                    foreach (var item in childMeshRenderers)
                    {
                        item.meshRenderer.transform.localPosition = Vector3.Lerp(item.meshRenderer.transform.localPosition, item.originalPosition, explosionSpeed);
                        if (Vector3.Distance(item.meshRenderer.transform.localPosition, item.originalPosition) < 0.001f)
                        {
                            isMoving = false;
                        }
                    }
                    foreach (var label in ModelLabels)
                    {
                        label.LabelMesh.transform.localPosition = Vector3.Lerp(label.LabelMesh.transform.localPosition, label.originalPosition, explosionSpeed);
                        if (Vector3.Distance(label.LabelMesh.transform.localPosition, label.originalPosition) < 0.001f)
                        {
                            isMoving = false;
                        }
                    }
                }
            }
        }
        #endregion

        #region CustomFunctions
        public void ToggleExplodedView()
        {
            setLabelMeshes();
            if (isInExplodedView)
            {
                isInExplodedView = false;
                isMoving = true;
            }
            else
            {
                isInExplodedView = true;
                isMoving = true;
            }
        }
        #endregion
    }
}