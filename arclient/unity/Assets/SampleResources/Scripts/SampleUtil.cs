/*===============================================================================
Copyright (c) 2020 PTC Inc. All Rights Reserved.

Vuforia is a trademark of PTC Inc., registered in the United States and other
countries.
===============================================================================*/

using UnityEngine;
using System.Collections.Generic;
using System.Linq;

public class SampleUtil : MonoBehaviour
{
    #region PUBLIC_METHODS

    static public bool AssignStringToTextComponent(GameObject textObj, string text)
    {
        if (textObj)
        {
            var canvasText = textObj.GetComponent<UnityEngine.UI.Text>();
            var textMesh = textObj.GetComponent<UnityEngine.TextMesh>();

            if (canvasText)
            {
                canvasText.text = text;
                return true;
            }
            if (textMesh)
            {
                textMesh.text = text;
                return true;
            }
            return false;
        }
        else
        {
            Debug.LogWarning("Destination Text GameObject is Null.");
            return false;
        }
    }

    public static Dictionary<string, string> CreateDictionary()
    {
        var dictionary = new Dictionary<string, string>();
        dictionary.Clear();

        return dictionary;
    }

    public static string GetValuefromDictionary(Dictionary<string, string> dictionary, string key)
    {
        if (dictionary != null)
        {
            if (dictionary.ContainsKey(key))
            {
                string value;
                dictionary.TryGetValue(key, out value);
                return value;
            }
        }

        return string.Empty;
    }

    public static void ResetObjectTracker()
    {
        var objTracker = Vuforia.TrackerManager.Instance.GetTracker<Vuforia.ObjectTracker>();
        if (objTracker != null && objTracker.IsActive)
        {
            objTracker.Stop();

            List<Vuforia.DataSet> activeDataSets = objTracker.GetActiveDataSets().ToList();

            foreach (Vuforia.DataSet dataset in activeDataSets)
            {
                // The VuforiaEmulator.xml dataset (used by GroundPlane) is managed by Vuforia.
                if (!dataset.Path.Contains("VuforiaEmulator.xml"))
                {
                    VLog.Log("white", "Deactivating: " + dataset.Path);
                    objTracker.DeactivateDataSet(dataset);
                    VLog.Log("white", "Activating: " + dataset.Path);
                    objTracker.ActivateDataSet(dataset);
                }
            }

            objTracker.Start();
        }
    }

    #endregion //PUBLIC_METHODS
}
