
#define SCANNING
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using Microsoft.MixedReality.Toolkit.Utilities.Solvers;
using UnityEngine;


public class OcclusionManager : MonoBehaviour
{
    private Camera cam;
    private IEnumerator _detectVisibleLabels;
    private IEnumerator _detectOccludedLabels;
    private IEnumerator _initScanRoutine;
    private IEnumerator _showAndHideLabels;

    private bool running = false;
    // Use this for initialization
    public IEnumerator Init()
    {
        if (running)
        {
            yield break;
        }
        running = true;
        _detectVisibleLabels = DetectVisibleLabels();
        _detectOccludedLabels = DetectOccludedLabels();
        _initScanRoutine = InitScanRoutine();
        _showAndHideLabels = ShowAndHideLabels();
        yield return new WaitForSeconds(0.5f);
#if UNITY_EDITOR
        Debug.Log("OcclusionManager: Initializing Camera for UNITY_EDITOR mode...");
        if (gameObject.GetComponent<CameraMovement>() == null)
            this.gameObject.AddComponent<CameraMovement>();
        yield return new WaitUntil(() => CameraMovement.GetRTInstance().camera != null);
        //cam = CameraMovement.GetRTInstance().camera;
        cam = Camera.main;
#else
		Debug.Log("OcclusionManager: Initializing Camera for Hololens mode...");
		cam = Camera.main;
#endif
        Debug.Log("OcclusionManager: Start Visibility Detection...");
        StartCoroutine(_detectVisibleLabels);
#if SCANNING
        Debug.Log("OcclusionManager: Start Occlusion Detection...");
        StartCoroutine(_detectOccludedLabels);
        Debug.Log("OcclusionManager: Initialize Scanning Routine...");
        StartCoroutine(_initScanRoutine);
#endif
#if !UNITY_EDITOR
    StartCoroutine(_showAndHideLabels);
#endif
        yield return null;
    }


    private IEnumerator ShowAndHideLabels()
    {
        while (true)
        {
            var labels = new List<GameObject>(LabelManager.GetRTInstance().labelList);
            foreach (var label in labels)
            {
                var lr = LabelManager.GetRTInstance().GetLabelRef(label.name);
                //Debug.LogError("lr.lObj.name =>" + lr.lObj.name);

                Transform child = lr.lObj.transform.Find("New Game Object");
                if (child)
                {
                    float distance = Vector3.Distance(lr.lmesh.transform.parent.position, cam.transform.position);
                    var enable = distance < 2f;
                    //child.gameObject.GetComponent<MeshRenderer>().enabled = enable;
                    child.gameObject.GetComponent<Renderer>().enabled = enable;
                    if (!lr.pinned)
                    {
                        //lr.lObj.gameObject.GetComponent<Renderer>().enabled = enable;
                        lr.lObj.gameObject.GetComponent<LineRenderer>().enabled = enable;
                    } else
                    {
                        lr.lObj.gameObject.GetComponent<LineRenderer>().enabled = false;
                    }

                    Debug.LogError("lr.lObj.name =>" + child.name);
                    var rs = lr.lObj.GetComponentsInChildren<Renderer>();
                    foreach(var r in rs)
                    {
                        //Debug.LogError("r =>" + r.name);
                        r.enabled = enable;
                    }

                    /*
                    if (distance > 2f)
                    {
                        //Debug.Log("HIde Labels " + distance);
                        child.gameObject.GetComponent<MeshRenderer>().enabled = false;
                        if (!lr.pinned)
                            lr.lObj.gameObject.GetComponent<LineRenderer>().enabled = false;

                    }
                    else
                    {
                        //Debug.Log("Show Labels " + distance);

                        child.gameObject.GetComponent<MeshRenderer>().enabled = true;
                        if (!lr.pinned)
                            lr.lObj.gameObject.GetComponent<LineRenderer>().enabled = true;

                    }
                    */
                }
                //yield return new WaitForSeconds(0.25f);
            }
            yield return new WaitForSeconds(0.25f);
        }
    }
    private void DebugDrawBox(GameObject scanningTemplate, Color color)
    {
        var upperRight = scanningTemplate.transform.Find("UpperRight");
        var upperLeft = scanningTemplate.transform.Find("UpperLeft");
        var lowerRight = scanningTemplate.transform.Find("LowerRight");
        var lowerLeft = scanningTemplate.transform.Find("LowerLeft");


        var urPos = transform.TransformVector(upperRight.position);
        var ulPos = transform.TransformVector(upperLeft.position);
        var llPos = transform.TransformVector(lowerLeft.position);
        var lrPos = transform.TransformVector(lowerRight.position);
        /*
        Debug.DrawLine(llPos, lrPos, color);
        Debug.DrawLine(llPos, ulPos, color);
        Debug.DrawLine(ulPos, urPos, color);
        Debug.DrawLine(lrPos, urPos, color);
        */
    }

    private IEnumerator Scanning(LabelManager.LabelReference lr, bool dir)
    {
        lr.resolveOcclusionInProcess = true;

        var limit = 0;
        lr.ScanningTemplate.transform.position -= lr.ScanningTemplate.transform.forward * 0.005f;
        Vector3 startPosition = lr.ScanningTemplate.transform.position;

        while (lr.occluded)
        {
            //Debug.Log("Scanning Label: " + lr.lName);
            if (lr.spiral != null)
            {
                for (var i = 0; i < lr.spiral.Count; i++)
                {
                    lr.ScanningTemplate.transform.position = dir ? new Vector3(-lr.spiral[i].x, -lr.spiral[i].y, lr.spiral[i].z) : lr.spiral[i];

                    DebugDrawBox(lr.ScanningTemplate, Color.green);
                    yield return new WaitForSeconds(0.1f);
                }
            }
            else
            {
                limit += 5;
                var distanceFromLabel = Vector3.Distance(lr.ScanningTemplate.transform.position, startPosition);
                if (distanceFromLabel > 0.5f) // was 1f
                {
                    lr.ScanningTemplate.transform.position = startPosition;
                    lr.ScanningTemplate.transform.position -= lr.ScanningTemplate.transform.forward * 0.3f;
                    startPosition = lr.ScanningTemplate.transform.position;
                    Debug.Log("Moving Forward " + lr.lName);
                    DebugDrawBox(lr.ScanningTemplate, Color.green);
                    limit = 5;
                }

                var xDecCounter = 0;
                while (xDecCounter <= limit && lr.occluded)
                {
                    xDecCounter++;
                    lr.ScanningTemplate.transform.position += lr.ScanningTemplate.transform.right * 0.02f;
                    DebugDrawBox(lr.ScanningTemplate, Color.green);
                    if (CheckBoundsForOcclusion(lr) == false)
                    {
                        lr.lObj.transform.position = lr.ScanningTemplate.transform.position;
                        lr.occluded = false;
                        yield break;
                    }
                }

                var yDecCounter = 0;
                while (yDecCounter <= limit && lr.occluded)
                {
                    yDecCounter++;
                    lr.ScanningTemplate.transform.position += lr.ScanningTemplate.transform.up * 0.02f;
                    DebugDrawBox(lr.ScanningTemplate, Color.green);
                    if (CheckBoundsForOcclusion(lr) == false)
                    {
                        lr.lObj.transform.position = lr.ScanningTemplate.transform.position;
                        lr.occluded = false;
                        lr.scanningRoutine = null; //added 
                        yield break;
                    }
                }
                limit += 5;

                var xIncCounter = 0;
                while (xIncCounter <= limit && lr.occluded)
                {
                    xIncCounter++;

                    lr.ScanningTemplate.transform.position -= lr.ScanningTemplate.transform.right * 0.02f;
                    DebugDrawBox(lr.ScanningTemplate, Color.green);
                    if (CheckBoundsForOcclusion(lr) == false)
                    {
                        lr.lObj.transform.position = lr.ScanningTemplate.transform.position;
                        lr.occluded = false;
                        lr.scanningRoutine = null; //added 
                        yield break;
                    }
                }
                var yIncCounter = 0;
                while (yIncCounter <= limit && lr.occluded)
                {
                    yIncCounter++;
                    lr.ScanningTemplate.transform.position -= lr.ScanningTemplate.transform.up * 0.02f;
                    DebugDrawBox(lr.ScanningTemplate, Color.green);
                    if (CheckBoundsForOcclusion(lr) == false)
                    {
                        lr.lObj.transform.position = lr.ScanningTemplate.transform.position;
                        lr.occluded = false;
                        lr.scanningRoutine = null; //added 
                        yield break;
                    }
                }
                yield return null;
            }
        }
    }
    private IEnumerator InitScanRoutine()
    {
        while (true)
        {
            var dir = true;


            LabelManager.GetRTInstance().labelList.Sort(SortLabelsByDistance);
            var labels = new List<GameObject>(LabelManager.GetRTInstance().labelList);
            foreach (var label in labels)
            {
                var lr = LabelManager.GetRTInstance().GetLabelRef(label.name);

                if (!lr.visible || !lr.occluded || lr.resolveOcclusionInProcess) continue;
                dir = !dir;
                lr.scanningRoutine = Scanning(lr, dir);

                StartCoroutine(lr.scanningRoutine);
                yield return new WaitUntil(() => (lr.occluded == false || lr.visible == false));
            }

            yield return new WaitForSeconds(1f);
        }
    }

    private bool CheckBoundsForOcclusion(LabelManager.LabelReference lr)
    {
        if (lr.ScanningTemplate == null) return false;
        //lr.ScanningTemplate.transform.rotation = lr.lObj.transform.rotation;
        var childCount = lr.ScanningTemplate.transform.childCount;
        var scanningPositions = new Vector3[childCount];
        var occlusionCount = 0;

        for (var i = 0; i < childCount; i++)
        {
            Transform child = lr.ScanningTemplate.transform.GetChild(i);
            scanningPositions[i] = transform.TransformVector(child.position);
            var camPosition = cam.transform.position;
            RaycastHit[] enterHits = Physics.RaycastAll(camPosition,
                                                        scanningPositions[i] - camPosition,
                                                        Vector3.Distance(camPosition, scanningPositions[i]) + 0.1f);
            RaycastHit[] sortedHitPoints = SortHits(enterHits);

            if (sortedHitPoints.Length == 0) continue;

            if (sortedHitPoints[0].transform.GetComponent<RadialView>() ||
                sortedHitPoints[0].transform.IsChildOf(Camera.main.transform) ||
                sortedHitPoints[0].transform.root.name == "MixedRealityPlayspace" && !sortedHitPoints[0].transform.name.Contains("SpatialMesh"))
            {
                List<RaycastHit> tmp = new List<RaycastHit>(sortedHitPoints);
                tmp.RemoveAt(0);
                sortedHitPoints = tmp.ToArray();
                //continue;
            }

            if (sortedHitPoints.Length == 0) continue;

            if (!((child.name == sortedHitPoints[0].transform.name &&
                   child.parent.name == sortedHitPoints[0].transform.parent.name) ||
                  sortedHitPoints[0].transform.name == lr.lName))
            {
                occlusionCount++;
                /*Debug.Log("CheckBoundsForOcclusion: label " + lr.lName + " child.name " + child.name + 
                          " sortedHitPoints[0].transform.name " + sortedHitPoints[0].transform.name + " child.parent.name " + 
                          child.parent.name);*/
            }
        }
        return occlusionCount != 0;
    }

    private bool CheckLabelForOcclusion(LabelManager.LabelReference lr)
    {
        if (lr.lObj.transform.Find("New Game Object") == null) return false;
        //lr.ScanningTemplate.transform.rotation = lr.lObj.transform.rotation;
        var boundsparent = lr.lObj.transform.Find("New Game Object");
        var childCount = boundsparent.childCount;
        var scanningPositions = new Vector3[childCount];
        var occlusionCount = 0;
        for (var i = 0; i < childCount; i++)
        {
            var child = boundsparent.GetChild(i);
            scanningPositions[i] = transform.TransformVector(child.position);
            var camPosition = cam.transform.position;
            RaycastHit[] enterHits = Physics.RaycastAll(camPosition,
                                                        scanningPositions[i] - camPosition,
                                                        Vector3.Distance(camPosition, scanningPositions[i]) +
                                                        10.1f);
            RaycastHit[] sortedHitPoints = SortHits(enterHits);

            if (sortedHitPoints.Length == 0) continue;

            if (sortedHitPoints[0].transform.GetComponent<RadialView>() ||
                sortedHitPoints[0].transform.IsChildOf(Camera.main.transform) ||
                sortedHitPoints[0].transform.root.name == "MixedRealityPlayspace" && !sortedHitPoints[0].transform.name.Contains("SpatialMesh"))
            {
                List<RaycastHit> tmp = new List<RaycastHit>(sortedHitPoints);
                tmp.RemoveAt(0);
                sortedHitPoints = tmp.ToArray();
                //continue;
            }

            if (sortedHitPoints.Length == 0) continue;


            if (!((child.name == sortedHitPoints[0].transform.name && sortedHitPoints.Length > 1 &&
                   lr.lName == sortedHitPoints[1].transform.name) ||
                   sortedHitPoints[0].transform.name == lr.lName))
            {
                /*Debug.Log("CheckLabelForOcclusion " + " lr.lName " + lr.lName + " child name = " + child.name + " sortedHitPoints[0].transform.name " + 
                          sortedHitPoints[0].transform.name + " child.parent.transform.parent.name " + 
                          child.parent.transform.parent.name );*/
                occlusionCount++;
            }
        }

        return occlusionCount != 0;
    }
    int SortLabelsByDistance(GameObject a, GameObject b)
    {
        float squaredRangeA = (a.transform.position - cam.transform.position).sqrMagnitude;
        float squaredRangeB = (b.transform.position - cam.transform.position).sqrMagnitude;
        return squaredRangeA.CompareTo(squaredRangeB);
    }
    private static RaycastHit[] SortHits(RaycastHit[] hits)
    {
        for (var i = 0; i < hits.Length; ++i)
        {
            var key = hits[i];
            var j = i - 1;

            while (j >= 0 && hits[j].distance > key.distance)
            {
                hits[j + 1] = hits[j];
                j = j - 1;
            }

            hits[j + 1] = key;
        }

        return hits;
    }
    private IEnumerator DetectOccludedLabels()
    {
        while (true)
        {
            var labels = new List<GameObject>(LabelManager.GetRTInstance().labelList);
            foreach (var lr in from l in labels select LabelManager.GetRTInstance().GetLabelRef(l.name))
            {
                if (lr == null)
                {
                    Debug.LogError("LabelReference is null!");
                    break;
                }

                if (lr.visible /*&& lr.scanningRoutine != null*/)
                {
                    lr.occluded = CheckLabelForOcclusion(lr);
                    if (!lr.occluded && lr.resolveOcclusionInProcess)
                    {
                        //if (lr.scanningRoutine != null)
                        {
                            StopCoroutine(lr.scanningRoutine);
                        }
                        lr.resolveOcclusionInProcess = false;
                        lr.ScanningTemplate.transform.position = lr.lObj.transform.position;
                    }
                    else if (!lr.resolveOcclusionInProcess && lr.ScanningTemplate)
                    {
                        lr.ScanningTemplate.transform.position = lr.lObj.transform.position;
                        lr.ScanningTemplate.transform.rotation = lr.lObj.transform.rotation;
                    }
                }
                else if (!lr.visible && lr.resolveOcclusionInProcess)
                {
                    //if (lr.scanningRoutine != null)
                    {
                        StopCoroutine(lr.scanningRoutine);
                    }
                    lr.resolveOcclusionInProcess = false;
                    lr.ScanningTemplate.transform.position = lr.lObj.transform.position;
                    Debug.Log("DetectOccludedLabels: new label position set to " + lr.ScanningTemplate.transform.position + " for " + lr.lName);
                }
            }

            yield return new WaitForSeconds(0.5f);
        }
    }

    private IEnumerator DetectVisibleLabels()
    {
        while (true)
        {
            var labels = new List<GameObject>(LabelManager.GetRTInstance().labelList);
            foreach (var l in labels)
            {

                var lr = LabelManager.GetRTInstance().GetLabelRef(l.name);
                if (lr != null && !lr.pinned)
                {
                    if (cam != null)
                    {
                        var screenPoint = cam.WorldToViewportPoint(l.transform.position);
                        var onScreen = screenPoint.z > 0 && screenPoint.x > 0 && screenPoint.x < 1 && screenPoint.y > 0 && screenPoint.y < 1;
                        lr.visible = onScreen;

                        yield return new WaitUntil(() => lr.lObj.transform.Find("New Game Object") != null);

                        lr.SetPolePositions();
                    }
                    else
                    {
                        Debug.Log("Cam not found :( ");
                    }
                }
            }
            yield return new WaitForSeconds(.5f);
        }
    }
}