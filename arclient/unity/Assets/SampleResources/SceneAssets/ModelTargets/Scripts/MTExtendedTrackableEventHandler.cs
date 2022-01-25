/*==============================================================================
Copyright (c) 2020 PTC Inc. All Rights Reserved.

Vuforia is a trademark of PTC Inc., registered in the United States and other
countries.
==============================================================================*/

using UnityEngine;
using Vuforia;

/// <summary>
/// This class watches for Tracking state of Model Target Behaviours and draws a
/// colored bounding box to indicate when Model Target is being Extended Tracked.
/// </summary>
public class MTExtendedTrackableEventHandler : TrackableStatusEventHandler
{
    #region PRIVATE_MEMBERS

    [SerializeField] private MeshRenderer boundingBox = null;

    #endregion // PRIVATE_MEMBERS


    #region PROTECTED_METHODS

    protected override void OnTrackingFound()
    {
        base.OnTrackingFound();

        if (mTrackableBehaviour.Trackable is ModelTarget)
        {
            ModelTarget modelTarget = mTrackableBehaviour.Trackable as ModelTarget;
            DrawOrientedBoundingBox3D(modelTarget.GetBoundingBox());
        }
    }

    #endregion // PROTECTED_METHODS


    #region MONOBEHAVIOUR_METHODS

    private void LateUpdate()
    {
        // Currently only one Model Target can be tracked at a given time.
        // As this event handler may be applied to multiple ModelTargetBehaviours in a scene,
        // we confirm that the bounding box is a child of this trackable before enabling/disabling it's renderer.
        if (this.transform.Equals(this.boundingBox.transform.parent))
        {
            this.boundingBox.enabled = (m_NewStatus == TrackableBehaviour.Status.EXTENDED_TRACKED);
        }
    }

    #endregion // MONOBEHAVIOUR_METHODS


    #region PRIVATE_METHODS

    private void DrawOrientedBoundingBox3D(OrientedBoundingBox3D bbox3d)
    {
        if (this.boundingBox)
        {
            // Calculate local position and scale from Model Target bounding box.
            var bboxLocalPosition = new Vector3(bbox3d.Center.x, bbox3d.Center.y, bbox3d.Center.z);
            var bboxLocalScale = new Vector3(bbox3d.HalfExtents.x * 2, bbox3d.HalfExtents.y * 2, bbox3d.HalfExtents.z * 2);

            // Assign values to augmentation bounding box.
            this.boundingBox.transform.SetParent(mTrackableBehaviour.transform);
            this.boundingBox.transform.localEulerAngles = Vector3.zero;
            this.boundingBox.transform.position = Vector3.zero;
            this.boundingBox.transform.localPosition = bboxLocalPosition;
            this.boundingBox.transform.localScale = bboxLocalScale;
        }
    }

    #endregion // PRIVATE_METHODS
}
