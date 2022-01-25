/*===============================================================================
Copyright (c) 2020 PTC Inc. All Rights Reserved.

Confidential and Proprietary - Protected under copyright and other laws.
Vuforia is a trademark of PTC Inc., registered in the United States and other 
countries.
===============================================================================*/


using System;
using System.Linq;
using UnityEditor;
using UnityEditor.PackageManager;
using UnityEditor.PackageManager.Requests;
using UnityEngine;

/// <summary>
/// Imports the latest version of the Windows Mixed Reality package
/// This works around an issue where this dependency is sometimes not updated correctly by Unity
/// </summary>
[InitializeOnLoad]
public static class WindowsMRChecker
{
    const string WINDOWS_MR_PACKAGE_NAME = "com.unity.xr.windowsmr.metro";

    static readonly string[] sBlockList = 
    {
        "3.0.3"
    };

    static SearchRequest sSearchRequest;

    static WindowsMRChecker()
    {
        EditorApplication.update += OnEditorUpdate;
        sSearchRequest = Client.Search(WINDOWS_MR_PACKAGE_NAME);
    }

    static void OnEditorUpdate()
    {
        if (sSearchRequest == null || !sSearchRequest.IsCompleted)
            return;

        EditorApplication.update -= OnEditorUpdate;

        AddLatestCompatibleVersion(sSearchRequest.Result.FirstOrDefault());

        sSearchRequest = null;
    }

    //Add latest version of WindowsMR package with blocklist for more version control
    static void AddLatestCompatibleVersion(UnityEditor.PackageManager.PackageInfo packageInfo)
    {
        if (packageInfo == null)
        {
            Debug.LogErrorFormat("Unable to set latest package version for package '{0}'.", WINDOWS_MR_PACKAGE_NAME);
            return;
        }

        var compatibleVersions = packageInfo.versions.compatible.Except(sBlockList);
        var latestCompatible = compatibleVersions.Select(versionString => new Version(versionString)).Max();

        var versionedPackageName = string.Format("{0}@{1}", WINDOWS_MR_PACKAGE_NAME, latestCompatible);

        Client.Add(versionedPackageName);
    }
}
