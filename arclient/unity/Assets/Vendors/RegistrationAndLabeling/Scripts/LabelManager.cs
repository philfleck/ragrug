#define DEBUG
using System;
using System.Collections;
using System.Collections.Generic;
using Microsoft.MixedReality.Toolkit.UI;
using PowerUI;
using RR;
using UnityEditor;
using UnityEngine;
using UnityEngine.Networking;
using Vizario;
using Vizario.VApp;

public class LabelManager : BaseManager<LabelManager>
{
    private Dictionary<string, LabelReference> labelHolder = new Dictionary<string, LabelReference>();
    public List<GameObject> labelList = new List<GameObject>();
    public bool boundscreated = false;
    public class LabelReference
    {
        public bool visible;
        public bool occluded;

        public bool pinned;
        public bool resolveOcclusionInProcess;

        public string lName;

        public GameObject lObj;
        public GameObject lmesh;
        public GameObject ScanningTemplate;
        public GameObject BoundsObject;
        public LineRenderer lPole;

        public List<Bounds> labelBoundsList; // ul, ur, bl, br, cent

        public List<Vector3> spiral;

        public CurvePoints lCurvePoints;

        public Vector3 initPos;

        public IEnumerator scanningRoutine;

        private void DrawLinearCurve()
        {

            if (pinned)
                return;
            Vector3[] positions = new Vector3[75];
            for (int i = 1; i < positions.Length + 1; i++)
            {
                float t = i / (float)positions.Length;
                positions[i - 1] = CalculateBrezierPoint(t, lCurvePoints.curvePoints[0], lCurvePoints.curvePoints[1],
                                                            lCurvePoints.curvePoints[2], lCurvePoints.curvePoints[3],
                                                            lCurvePoints.curvePoints[4], lCurvePoints.curvePoints[5]);
            }

            lPole.positionCount = positions.Length;
            lPole.SetPositions(positions);
            //lPole.enabled = true;
        }

        private Vector3 CalculateBrezierPoint(float t, Vector3 p0, Vector3 p1, Vector3 p2, Vector3 p3, Vector3 p4,
                                              Vector3 p5)
        {
            float u = 1 - t;
            float uu = u * u;
            float uuu = uu * u;
            float uuuu = uu * uu;
            float uuuuu = uuuu * u;

            float tt = t * t;
            float ttt = tt * t;
            float tttt = tt * tt;
            float ttttt = tttt * t;

            Vector3 p = uuuuu * p0;
            p += 5 * uuuu * t * p1;
            p += 10 * uuu * tt * p2;
            p += 10 * uu * ttt * p3;
            p += 5 * u * tttt * p4;
            p += ttttt * p5;

            return p;
        }

        public void updateLabelPole()
        {

            if (pinned)
                return;
            DrawLinearCurve();
        }

        public void initCurvePoints(Vector3[] curvePoints)
        {
            if (pinned)
                return;
            CurvePoints nCurvePoints = new CurvePoints { curvePoints = new Vector3[curvePoints.Length] };
            for (int i = 0; i < nCurvePoints.curvePoints.Length; i++)
            {
                nCurvePoints.curvePoints[i] = curvePoints[i];
            }

            lCurvePoints = nCurvePoints;
            updateLabelPole();
        }

        public void SetPolePositions()
        {
            //Debug.Log("SetPolePositions " + lr.lName);

            if (pinned)
                return;
            var child = lObj.transform.Find("New Game Object");
            if (child == null)
            {
                Debug.Log("LabelManager: child not found! " + lName);
                return;
            }

            var curviness = (lObj.gameObject.GetComponent<BoxCollider>().size.x + lObj.gameObject.GetComponent<BoxCollider>().size.y) / 3;
            var localCurvePoints = new Vector3[4];
            var cPoints = new Vector3[6];
            var cent = new Vector3(lObj.gameObject.GetComponent<BoxCollider>().center.x,
                                   lObj.gameObject.GetComponent<BoxCollider>().center.y,
                                   lObj.gameObject.GetComponent<BoxCollider>().center.z);
            cPoints[0] = lObj.transform.TransformPoint(cent);
            var meshPosition = lmesh.transform.position;
            cPoints[5] = meshPosition;
            localCurvePoints[0] = new Vector3(lObj.gameObject.GetComponent<BoxCollider>().center.x,
                                              lObj.gameObject.GetComponent<BoxCollider>().center.y,
                                              lObj.gameObject.GetComponent<BoxCollider>().center.z + curviness);
            cPoints[1] = lObj.transform.TransformPoint(localCurvePoints[0]);
            var labelPosition = lObj.transform.position;
            var dirOfPole = meshPosition - labelPosition;

            localCurvePoints[1] = child.transform.InverseTransformPoint(labelPosition + dirOfPole * 0.25f);
            localCurvePoints[2] = child.transform.InverseTransformPoint(labelPosition + dirOfPole * 0.45f);
            localCurvePoints[3] = child.transform.InverseTransformPoint(labelPosition + dirOfPole * 0.65f);

            cPoints[2] =
              lObj.transform.TransformPoint(new Vector3(localCurvePoints[1].x, localCurvePoints[1].y,
                                                           localCurvePoints[0].z));
            cPoints[3] =
              lObj.transform.TransformPoint(new Vector3(localCurvePoints[2].x, localCurvePoints[2].y,
                                                           localCurvePoints[0].z));
            cPoints[4] =
              lObj.transform.TransformPoint(new Vector3(localCurvePoints[3].x, localCurvePoints[3].y,
                                                           localCurvePoints[0].z));
            initCurvePoints(cPoints);
        }

        public void setMeshName(string text)
        {
            HtmlDocument doc = HtmlUIManager.GetRTInstance().GetDocument(lName);

            if (doc != null)
            {
                Dom.Element elem = doc.getElementById("mesh_info");
            }
        }

    }

    public class CurvePoints
    {
        public Vector3[] curvePoints;
    }

    public LabelReference GetLabelRef(string pName)
    {
        LabelReference resLr = null;
        labelHolder.TryGetValue(pName, out resLr);
        return resLr;
    }

    private void AddOrUpdate(LabelReference lr, bool destroyOnUpdate)
    {
        LabelReference resLr = null;
        if (labelHolder.TryGetValue(lr.lName, out resLr))
        {
            if (destroyOnUpdate)
            {
                Destroy(resLr.lObj.gameObject);
                resLr.lObj = null;
            }

            resLr = lr;
            // Debug.Log(GetType() + " AddOrUpdate failed for " + lr.lName + ", updating");
        }
        else
        {
            // Debug.Log(GetType() + " AddOrUpdate adding " + lr.lName);
            labelHolder.Add(lr.lName, lr);
        }
    }

    // public List<Vector3> setSpiralPoints(GameObject go)
    // {
    //   List<Vector3> spiralPoints = new List<Vector3>();
    //   float distribution = 25f;
    //   float dtheta = (float) (distribution * Mathf.PI / 180);
    //   float A = 5f;
    //   float B = 0.08f;
    //   float min_theta = (float) (Mathf.Log(50f / A) / B);
    //   int count = 0;
    //   for (float theta = min_theta;; theta += dtheta)
    //   {
    //     // Calculate r.
    //     if (count % 25 == 0 && (distribution - 2.5f) > 0)
    //     {
    //       distribution = distribution - 2.5f;
    //       dtheta = (float) (distribution * Mathf.PI / 180);
    //       Debug.Log("distribution: " + distribution + " count: " + count);
    //     }
    //
    //     float r = (float) (A * Mathf.Exp(B * theta));
    //
    //     // Convert to Cartesian coordinates.
    //
    //     float x, y;
    //     x = (float) (r * Mathf.Cos(theta));
    //     y = (float) (r * Mathf.Sin(theta));
    //
    //     GameObject p = Instantiate(point);
    //     GameObject parent = go;
    //     if (parent != null)
    //     {
    //       p.transform.parent = parent.transform;
    //     }
    //
    //     p.transform.localScale = Vector3.one * 3;
    //     Vector3 sp = new Vector3(x, y, 0.0f);
    //
    //
    //     p.transform.localPosition = sp;
    //     Vector3 global_sp = transform.root.transform.TransformVector(p.transform.position);
    //     Destroy(p);
    //     spiralPoints.Add(global_sp);
    //     count++;
    //
    //
    //     // If we have gone far enough, stop.
    //     if (r > 2000f) break;
    //   }
    //
    //   Debug.Log("spiral points size = " + spiralPoints.Count);
    //   return spiralPoints;
    // }

    public void StopScanning(LabelReference lr)
    {
        if (lr.scanningRoutine != null)
        {
            StopCoroutine(lr.scanningRoutine);
        }
    }
    public void activateLabel(LabelReference lr)
    {
        LabelReference resLr = null;
        if (labelHolder.TryGetValue(lr.lName, out resLr))
        {
            resLr.pinned = false;
            resLr.lPole.enabled = true;
            resLr.lObj.GetComponent<Billboard>().enabled = true;
            resLr.lObj.transform.localPosition = resLr.initPos;
        }
    }
    public void deactivateLabel(LabelReference lr)
    {
        LabelReference resLr = null;
        if (labelHolder.TryGetValue(lr.lName, out resLr))
        {
            resLr.pinned = true;
            resLr.occluded = false;
            resLr.lPole.enabled = false;
            resLr.resolveOcclusionInProcess = false;
            resLr.lObj.GetComponent<Billboard>().enabled = false;
            resLr.initPos = resLr.lObj.transform.localPosition;
        }
    }

    public void CreateLabel(GameObject go, string labelName, string type)
    {
        GameObject wui = GameObject.Find(labelName);
        if (wui == null)
        {
            Debug.LogError("WUI CANNOT BE FOUND!");
            return;
        }
        LabelReference nlr = new LabelReference();
        nlr.lName = labelName;
        nlr.lObj = wui;
        nlr.lmesh = go;
        nlr.spiral = null;
        nlr.pinned = false;
        //nlr.lObj.gameObject.AddComponent<FaceCam>();
        addLabelPole(nlr);
        //   nlr.spiral = setSpiralPoints(wui);
        AddOrUpdate(nlr, false);
        wui.AddComponent<Billboard>();
        StartCoroutine(CreateScanningTemplate2D(nlr, wui.transform));
        StartCoroutine(CreateBounds(nlr, wui.transform));
        labelList.Add(wui.gameObject);
    }

    private IEnumerator CreateScanningTemplate2D(LabelReference lr, Transform wui)
    {

        if (lr == null) yield break;
        GameObject ScalingTemplate = new GameObject();
        ScalingTemplate.transform.parent = wui;
        ScalingTemplate.transform.position = Vector3.zero;
        ScalingTemplate.transform.rotation = Quaternion.identity;
        ScalingTemplate.transform.localScale = Vector3.one;
        ScalingTemplate.name = "ScalingTemplate " + lr.lName;

        GameObject center = GameObject.CreatePrimitive(PrimitiveType.Cube);
        center.name = "Center";
        center.transform.parent = ScalingTemplate.transform;
        Vector3 a = wui.GetComponent<BoxCollider>().center;
        center.transform.localPosition = a;
        center.GetComponent<MeshRenderer>().material.color = Color.red;
        center.GetComponent<MeshRenderer>().enabled = false;
        center.transform.localScale = Vector3.one * 5f;

        GameObject lole = GameObject.CreatePrimitive(PrimitiveType.Cube);
        lole.name = "LowerLeft";
        lole.transform.parent = ScalingTemplate.transform;
        Vector3 e = wui.GetComponent<BoxCollider>().center - wui.GetComponent<BoxCollider>().size * 0.5f;
        lole.transform.localPosition = e;
        lole.GetComponent<MeshRenderer>().material.color = Color.red;
        lole.GetComponent<MeshRenderer>().enabled = false;
        lole.transform.localScale = Vector3.one * 5f;

        GameObject upri = GameObject.CreatePrimitive(PrimitiveType.Cube);
        upri.name = "UpperRight";
        upri.transform.parent = ScalingTemplate.transform;
        Vector3 b = wui.GetComponent<BoxCollider>().center + wui.GetComponent<BoxCollider>().size * 0.5f;
        upri.transform.localPosition = b;
        upri.GetComponent<MeshRenderer>().material.color = Color.red;
        upri.GetComponent<MeshRenderer>().enabled = false;
        upri.transform.localScale = Vector3.one * 5f;

        GameObject lori = GameObject.CreatePrimitive(PrimitiveType.Cube);
        lori.name = "LowerRight";
        lori.transform.parent = ScalingTemplate.transform;
        Vector3 c = new Vector3(b.x, e.y, e.z);
        lori.transform.localPosition = c;
        lori.GetComponent<MeshRenderer>().material.color = Color.red;
        lori.GetComponent<MeshRenderer>().enabled = false;
        lori.transform.localScale = Vector3.one * 5f;

        GameObject uple = GameObject.CreatePrimitive(PrimitiveType.Cube);
        uple.name = "UpperLeft";
        uple.transform.parent = ScalingTemplate.transform;
        Vector3 d = new Vector3(e.x, b.y, b.z);
        uple.transform.localPosition = d;
        uple.GetComponent<MeshRenderer>().material.color = Color.red;
        uple.GetComponent<MeshRenderer>().enabled = false;
        uple.transform.localScale = Vector3.one * 5f;

        lr.ScanningTemplate = ScalingTemplate;

    }

    private IEnumerator CreateBounds(LabelReference lr, Transform wui)
    {
        if (lr == null || wui == null) yield break;
        GameObject label = GameObject.Find(lr.lName);
        yield return new WaitUntil(() => label.transform.Find("New Game Object") != null);
        Debug.Log("CreateBounds: New Game Object Found for: " + lr.lName);
        if (label.transform.Find("New Game Object") == null) yield break;
        GameObject child = label.transform.Find("New Game Object").gameObject;
        lr.BoundsObject = child;
        //child.AddComponent<FaceCam>();
        GameObject center = new GameObject { name = "Center" };
        center.transform.parent = child.transform;
        center.transform.localScale = Vector3.one;
        Vector3 a = wui.GetComponent<BoxCollider>().center;
        center.transform.localPosition = a;

        GameObject lole = new GameObject { name = "LowerLeft" };
        lole.transform.parent = child.transform;
        lole.transform.localScale = Vector3.one;
        Vector3 e = wui.GetComponent<BoxCollider>().center - wui.GetComponent<BoxCollider>().size * 0.5f;
        lole.transform.localPosition = e;

        GameObject upri = new GameObject { name = "UpperRight" };
        upri.transform.parent = child.transform;
        upri.transform.localScale = Vector3.one;
        Vector3 b = wui.GetComponent<BoxCollider>().center + wui.GetComponent<BoxCollider>().size * 0.5f;
        upri.transform.localPosition = b;

        GameObject lori = new GameObject { name = "LowerRight" };
        lori.transform.parent = child.transform;
        lori.transform.localScale = Vector3.one;
        Vector3 c = new Vector3(b.x, e.y, e.z);
        lori.transform.localPosition = c;

        GameObject uple = new GameObject { name = "UpperLeft" };
        uple.transform.parent = child.transform;
        uple.transform.localScale = Vector3.one;
        Vector3 d = new Vector3(e.x, b.y, b.z);
        uple.transform.localPosition = d;
        boundscreated = true;
    }

    private void addLabelPole(LabelReference lr)
    {
        LineRenderer lineRend = lr.lObj.gameObject.AddComponent<LineRenderer>();
        if (lineRend != null)
        {

            lineRend.material.color = new Color(49, 182, 188);//Color.yellow;
            lineRend.startWidth = 0.003f; //0.0025f
            lineRend.endWidth = 0.003f; //0.0025f
            lineRend.startColor = new Color(49, 182, 188);
            lineRend.endColor = new Color(238, 238, 238);
            
            lr.lPole = lineRend;
            lr.SetPolePositions();
            lineRend.enabled = true;
            AddOrUpdate(lr, false);
        }
        else
        {
            Debug.LogError("LineRenderer could not be created!");
        }
    }

    public void InitOcclusionManager()
    {
        Debug.Log("LabelManager: Initialising OcclusionManager...");
        if (!gameObject.GetComponent<OcclusionManager>())
        {
            this.gameObject.AddComponent<OcclusionManager>();
            StartCoroutine(this.GetComponent<OcclusionManager>().Init());
        }
    }

}