/*===============================================================================
Copyright (c) 2019 PTC Inc. All Rights Reserved.

Vuforia is a trademark of PTC Inc., registered in the United States and other
countries.
===============================================================================*/

using UnityEngine;

public class HideDevConsole : MonoBehaviour
{
    void Update()
    {
        if (Debug.developerConsoleVisible)
        {
            Debug.developerConsoleVisible = false;
        }
    }
}
