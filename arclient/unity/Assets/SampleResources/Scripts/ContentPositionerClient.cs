/*===============================================================================
Copyright (c) 2020 PTC Inc. All Rights Reserved.

Vuforia is a trademark of PTC Inc., registered in the United States and other
countries.
===============================================================================*/

using UnityEngine;

public class ContentPositionerClient : MonoBehaviour
{
    #region PUBLIC_MEMBERS

    [Header("Distance From Camera")]
    public float distanceHoloLens1 = 1.5f; // adjust to preferred distance
    public float distanceHoloLens2 = 1.5f; // adjust to preferred distance

    #endregion //PUBLIC_MEMBERS


    #region MONOBEHAVIOUR_METHODS

    void Start()
    {
        var contentPositioner = FindObjectOfType<ContentPositioner>();

        if (contentPositioner)
        {
            contentPositioner.SetPerDeviceDistanceFromCamera(this.distanceHoloLens1, this.distanceHoloLens2);
            contentPositioner.contentToAlign = this.gameObject;
            contentPositioner.CenterToCameraView();
        }
    }

    #endregion //MONOBEHAVIOUR_METHODS
}
