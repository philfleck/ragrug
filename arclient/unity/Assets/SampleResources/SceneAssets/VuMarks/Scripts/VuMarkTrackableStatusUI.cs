/*===============================================================================
Copyright (c) 2016-2020 PTC Inc. All Rights Reserved.

Confidential and Proprietary - Protected under copyright and other laws.
Vuforia is a trademark of PTC Inc., registered in the United States and other
countries.
===============================================================================*/
using UnityEngine;
using UnityEngine.UI;

public class VuMarkTrackableStatusUI : MonoBehaviour
{
    public Image m_Image;
    public Text m_Info;

    public void Show(string vuMarkId, string vuMarkDataType, string vuMarkDesc, Sprite vuMarkImage)
    {
        m_Info.text =
            "<color=yellow>VuMark Instance Id: </color>" +
            "\n" + vuMarkId + " - " + vuMarkDesc +
            "\n\n<color=yellow>VuMark Type: </color>" +
            "\n" + vuMarkDataType;

        m_Image.sprite = vuMarkImage;
        m_Image.enabled = true;
    }
}
