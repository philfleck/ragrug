/*==============================================================================
Copyright (c) 2020 PTC Inc. All Rights Reserved.

Vuforia is a trademark of PTC Inc., registered in the United States and other
countries.
==============================================================================*/

using UnityEngine;
using Vuforia;

[RequireComponent(typeof(RectTransform))]
public class DepthCanvas : MonoBehaviour
{
    #region PRIVATE_MEMBERS

    Camera vuforiaCamera;
    RectTransform canvasRectTransform;
    readonly float maxDistanceFromCamera = 1.25f;

    #endregion // PRIVATE_MEMBERS


    #region MONOBEHAVIOUR_METHODS

    void Start()
    {
        vuforiaCamera = VuforiaBehaviour.Instance.GetComponent<Camera>();
        canvasRectTransform = GetComponent<RectTransform>();
    }

    void Update()
    {
        if (!VuforiaARController.Instance.HasStarted)
        {
            return;
        }

        Ray ray = vuforiaCamera.ViewportPointToRay(0.5f * Vector2.one);
        RaycastHit hit;

        if (Physics.Raycast(ray, out hit, vuforiaCamera.farClipPlane))
        {
            var point = hit.point - 0.02f * ray.direction.normalized;
            var depth = Vector3.Distance(ray.origin, point);

            if (canvasRectTransform)
            {
                depth = Mathf.Clamp(depth, vuforiaCamera.nearClipPlane, maxDistanceFromCamera);
                canvasRectTransform.anchoredPosition3D = new Vector3(0, 0, depth);
            }
        }
    }

    #endregion // MONOBEHAVIOUR_METHODS
}
