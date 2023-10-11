﻿// Copyright (c) Microsoft Corporation. All rights reserved.
namespace Microsoft.MixedReality.SceneUnderstanding.Samples.Unity
{
    using UnityEngine;
    using TMPro;

    /// <summary>
    /// This Script will take the Scene Root and label it with its corresponding labels using textmeshpro
    /// Mesh Font
    /// </summary>
    public class SceneUnderstandingLabeler : MonoBehaviour
    {
        public GameObject SceneRoot;
        public bool DisplayTextLabels;

        public void LabelSUScene()
        {
            if (!DisplayTextLabels)
            {
                return;
            }

            foreach (Transform child in SceneRoot.transform)
            {
                string label = string.Empty;
                GameObject suObject = child.gameObject;
                SceneUnderstandingProperties properties = suObject.GetComponent<SceneUnderstandingProperties>();

                if (properties != null)
                {
                     label = properties.suObjectKind.ToString();
                }
                else
                {
                    label = suObject.name;
                }

                if (
                    label != "Wall"      &&
                    label != "Floor"     &&
                    label != "Ceiling"   &&
                    label != "Unknown"   &&
                    label != "Platform"  &&
                    label != "Background"
                )
                {
                    continue;
                }

                if (suObject == null || label == null)
                {
                    Debug.LogWarning("SceneUnderstandingManager.AddLabel: One or more arguments are null.");
                    return;
                }

                // Create the parent container and give it a name
                GameObject textGO = new GameObject("Label");

                // Set it as a child of the game object
                textGO.transform.SetParent(suObject.transform, worldPositionStays: false);

                // Move it slightly in front of the game object
                textGO.transform.Translate(0, 0, -0.003f);

                // Create a TextMeshPro object for our text
                TextMeshPro tmpro = textGO.AddComponent<TextMeshPro>();

                // Align middle, center
                tmpro.alignment = TextAlignmentOptions.Center;

                // This width, height and scale seems to be about right for HoloLens
                tmpro.rectTransform.SetSizeWithCurrentAnchors(RectTransform.Axis.Horizontal, 20f);
                tmpro.rectTransform.SetSizeWithCurrentAnchors(RectTransform.Axis.Vertical, 6f);
                tmpro.transform.localScale = new Vector3(0.02f, 0.02f, 0.02f);

                // And finally assign the label text
                tmpro.text = label;
            }
        }

    }
}