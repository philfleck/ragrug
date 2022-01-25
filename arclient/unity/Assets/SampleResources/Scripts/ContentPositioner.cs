/*===============================================================================
Copyright (c) 2020 PTC Inc. All Rights Reserved.

Vuforia is a trademark of PTC Inc., registered in the United States and other
countries.
===============================================================================*/

using UnityEngine;

public class ContentPositioner : MonoBehaviour
{
    #region PUBLIC_MEMBERS

    public GameObject contentToAlign;

    #endregion //PUBLIC_MEMBERS


    #region PRIVATE_MEMBERS

    readonly float defaultDistanceHoloLens1 = 1.5f; // default distance
    readonly float defaultDistanceHoloLens2 = 0.75f; // default distance
    float distanceFromCamera;
    bool realignContent = false;
    Vector3 destinationPosition;
    Quaternion destinationRotation;
    Camera cam;

    #endregion // PRIVATE_MEMBERS


    #region MONOBEHAVIOUR_METHODS

    void Start()
    {
        this.cam = Camera.main;

        SetPerDeviceDistanceFromCamera(this.defaultDistanceHoloLens2, this.defaultDistanceHoloLens1);
    }

    void Update()
    {
        UpdateContentAlignment();
    }

    #endregion //MONOBEHAVIOUR_METHODS


    #region PUBLIC_MEMBERS

    public void SetPerDeviceDistanceFromCamera(float distanceHoloLens1, float distanceHoloLens2)
    {
        // Device Model for HL1 = HoloLens (Microsoft Corporation)
        // Device Model for HL2 = HoloLens 2 (Microsoft Corporation)
        this.distanceFromCamera = (SystemInfo.deviceModel.Contains("HoloLens 2")) ? distanceHoloLens2 : distanceHoloLens1;
    }

    public void CenterToCameraView()
    {
        var camForwardFlatY = new Vector3(this.cam.transform.forward.x, 0, this.cam.transform.forward.z);
        this.destinationRotation = Quaternion.LookRotation(camForwardFlatY, Vector3.up);
        this.destinationPosition = this.cam.transform.position + camForwardFlatY * this.distanceFromCamera;
        this.destinationPosition = new Vector3(this.destinationPosition.x, this.cam.transform.position.y - 0.1f, this.destinationPosition.z);

        this.realignContent = true;
    }

    #endregion //PUBLIC_MEMBERS


    #region PRIVATE_MEMBERS

    void UpdateContentAlignment()
    {
        if (this.realignContent && this.contentToAlign)
        {
            var newRotation = Quaternion.Slerp(this.contentToAlign.transform.rotation, this.destinationRotation, Time.deltaTime * 5.0f);
            var newPosition = Vector3.Lerp(this.contentToAlign.transform.position, this.destinationPosition, Time.deltaTime * 5.0f);

            this.contentToAlign.transform.rotation = newRotation;
            this.contentToAlign.transform.position = newPosition;

            string positionsAndDistance = string.Format(
                    "CurrentPos: {0}, DestPos: {1}, Distance: {2}",
                    newPosition,
                    this.destinationPosition,
                    Vector3.Distance(newPosition, this.destinationPosition));

            //VLog.Log("yellow", positionsAndDistance);

            if (Mathf.Abs(Vector3.Distance(newPosition, this.destinationPosition)) < 0.01f)
            {
                Debug.Log("Content Alignment Complete");
                this.realignContent = false;
            }
        }
    }

    #endregion // PRIVATE_MEMBERS
}
