/*===============================================================================
Copyright (c) 2020 PTC Inc. All Rights Reserved.

Vuforia is a trademark of PTC Inc., registered in the United States and other
countries.
===============================================================================*/

using UnityEngine;

public class SetDrivenKey : MonoBehaviour
{
    #region PUBLIC_MEMBERS

    public RectTransform watchSizeChanges;
    public RectTransform readChangedSize;

    #endregion //PUBLIC_MEMBERS


    #region MONOBEHAVIOUR_METHODS

    void Start()
    {
        ApplyRectTransformSizeToTransformScale(readChangedSize);
    }

    void Update()
    {
        if (watchSizeChanges.hasChanged)
        {
            ApplyRectTransformSizeToTransformScale(readChangedSize);
            watchSizeChanges.hasChanged = false;
        }
    }

    #endregion //MONOBEHAVIOUR_METHODS


    #region PRIVATE_METHODS

    void ApplyRectTransformSizeToTransformScale(in RectTransform rectTransform)
    {
        if (rectTransform)
        {
            transform.localScale = new Vector3(rectTransform.sizeDelta.x, rectTransform.sizeDelta.y);
        }
    }

    #endregion //PRIVATE_METHODS
}
