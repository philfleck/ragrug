﻿namespace Microsoft.MixedReality.SceneUnderstanding.Samples.Unity
{
    using System;
    using System.Collections;
    using System.Linq;
    using UnityEngine.XR.WSA.Input;
    using UnityEngine.Windows.Speech;
    using System.Collections.Generic;
    using UnityEngine;
    using UnityEngine.Events;

    using Vizario.RegistrationLib;

    /// <summary>
    /// Maps inputs to actions.
    /// </summary>
    [Serializable]
    public class InputAction
    {
        #region Unity Inspector Fields
        [Tooltip("The phrase that can be used to trigger the action.")]
        [SerializeField]
        private string phrase;

        [Tooltip("The key that can be used to trigger the action.")]
        [SerializeField]
        private KeyCode key;

        [Tooltip("A description of the action to be displayed in help.")]
        [SerializeField]
        private string description;

        [Tooltip("The event that will be raised to handle the action.")]
        [SerializeField]
        private UnityEvent handler = new UnityEvent();
        #endregion // Unity Inspector Fields

        #region Public Methods
        /// <summary>
        /// Quick static helper to create input actions.
        /// </summary>
        /// <param name="phrase">
        /// The phrase that will trigger the action.
        /// </param>
        /// <param name="key">
        /// The key that will trigger the action.
        /// </param>
        /// <param name="description">
        /// A description of the action for help.
        /// </param>
        /// <param name="handler">
        /// A method that will handle the action.
        /// </param>
        /// <returns>
        /// The created input action.
        /// </returns>
        static public InputAction Create(string phrase, KeyCode key, string description, UnityAction handler)
        {
            // Create th
            InputAction ia = new InputAction()
            {
                Phrase = phrase,
                Key = key,
                Description = description,
            };
            ia.Handler.AddListener(handler);
            return ia;
        }
        #endregion // Public Methods

        #region Public Properties
        /// <summary>
        /// Gets or sets a description of the action.
        /// </summary>
        public string Description { get => description; set => description = value; }

        /// <summary>
        /// Gets or sets the key that can be used to trigger the action.
        /// </summary>
        public KeyCode Key { get => key; set => key = value; }

        /// <summary>
        /// Gets or sets the phrase that can be used to trigger the action.
        /// </summary>
        public string Phrase { get => phrase; set => phrase = value; }

        /// <summary>
        /// Gets the event that will be raised to handle the action.
        /// </summary>
        public UnityEvent Handler { get => handler; set => handler = value; }
        #endregion // Public Properties
    }

    public class SampleInputManager : MonoBehaviour
    {
        #region Member Variables
        private bool isEnabled;
        private KeywordRecognizer keywordRecognizer;
        private Dictionary<KeyCode, InputAction> keyMap = new Dictionary<KeyCode, InputAction>();
        private Dictionary<string, InputAction> speechMap = new Dictionary<string, InputAction>();
        private GameObject suMinimap = null;
        #endregion // Member Variables

        #region Unity Inspector Fields
        [Tooltip("Reference to the main registration controller.")]
        [SerializeField]
        private PlaneDetectionController m_PlaneDetectionController;

        [Tooltip("Reference to the main scene understanding manager for default commands.")]
        [SerializeField]
        private SceneUnderstandingManager suManager;

        [Tooltip("Reference to the menu for default commands.")]
        [SerializeField]
        private SampleMenu menu;

        [Tooltip("Reference to the Labeler Component for SU Scene")]
        [SerializeField]
        private SceneUnderstandingLabeler labeler = null;

        [Tooltip("Whether or not to include default commands.")]
        [SerializeField]
        private bool useDefaultCommands = true;

        [Space(10)]
        [Header("Events")]
        [Tooltip("Raised when input is enabled.")]
        [SerializeField]
        private UnityEvent inputEnabled = new UnityEvent();

        [Tooltip("Raised when input is disabled.")]
        [SerializeField]
        private UnityEvent inputDisabled = new UnityEvent();

        [Space(10)]
        [Tooltip("The list of inputs and their respective actions.")]
        [SerializeField]
        private List<InputAction> inputActions = new List<InputAction>();
        #endregion // Unity Inspector Fields

        private readonly string ia_update_phrase = "Update";

        #region Internal Methods
        /// <summary>
        /// Ads default command used in all scenes.
        /// </summary>
        private void AddDefaultCommands()
        {
            // First batch of device-only commands
            if (suManager.QuerySceneFromDevice)
            {
                inputActions.Add(InputAction.Create(ia_update_phrase, KeyCode.None, "Displays the latest data.", async () => await SuManager.DisplayDataAsync()));

                string ia_refresh_phrase = "Toggle Auto Refresh";
                InputAction ia_refresh = null;

                inputActions.Add(InputAction.Create(ia_refresh_phrase, KeyCode.None, "Turns automatic updates on or off", () =>
                {
                    SuManager.AutoRefresh = !SuManager.AutoRefresh;
                    if (!SuManager.AutoRefresh) {
                        SuManager.TimeElapsedSinceLastAutoRefresh = SuManager.AutoRefreshIntervalInSeconds;
                    }

                    if (ia_refresh == null)
                        ia_refresh = inputActions.Where(ia => ia.Phrase == ia_refresh_phrase).First();
                    if (SuManager.AutoRefresh)
                        ia_refresh.Phrase = ia_refresh_phrase + " (True)";
                    else
                        ia_refresh.Phrase = ia_refresh_phrase + " (False)";

                    SuManager.LogConsole("SuManager.AutoRefresh: " + (SuManager.AutoRefresh?"true":"false"));
                }));

                if (ia_refresh == null)
                    ia_refresh = inputActions.Where(ia => ia.Phrase == ia_refresh_phrase).First();
                if (SuManager.AutoRefresh)
                    ia_refresh.Phrase = ia_refresh_phrase + " (True)";
                else
                    ia_refresh.Phrase = ia_refresh_phrase + " (False)";
            }

            //inputActions.Add(InputAction.Create("Toggle Scene Objects", KeyCode.Alpha1, "Show / hide processed scene objects", async () =>
            //{
            //    SuManager.FilterAllSceneObjects = !SuManager.FilterAllSceneObjects;
            //    await SuManager.DisplayDataAsync();
            //}));

            inputActions.Add(InputAction.Create("Toggle Labels", KeyCode.P, "Enable / Disable labels for scene objects", async () =>
            {
                labeler.DisplayTextLabels = !labeler.DisplayTextLabels;
                await SuManager.DisplayDataAsync();
            }));

            inputActions.Add(InputAction.Create("Scene Objects Quad", KeyCode.Alpha2, "Quad Mode", async () =>
            {
                SuManager.SceneObjectRequestMode = RenderMode.Quad;
                await SuManager.DisplayDataAsync();
            }));

            inputActions.Add(InputAction.Create("Scene Objects Mesh", KeyCode.Alpha3, "Mesh Mode", async () =>
            {
                SuManager.SceneObjectRequestMode = RenderMode.Mesh;
                await SuManager.DisplayDataAsync();
            }));

            inputActions.Add(InputAction.Create("Scene Objects Wireframe", KeyCode.Alpha4, "Wireframe Mode", async () =>
            {
                SuManager.SceneObjectRequestMode = RenderMode.Wireframe;
                await SuManager.DisplayDataAsync();
            }));

            inputActions.Add(InputAction.Create("Scene Objects Mask", KeyCode.None, "Mask Mode", async () =>
            {
                SuManager.SceneObjectRequestMode = RenderMode.QuadWithMask;
                await SuManager.DisplayDataAsync();
            }));

            //inputActions.Add(InputAction.Create("Toggle Platforms", KeyCode.Alpha5, "Enable / Disable large horizontal surfaces", async () =>
            //{
            //    SuManager.FilterPlatformSceneObjects = !SuManager.FilterPlatformSceneObjects;
            //    await SuManager.DisplayDataAsync();
            //}));

            //inputActions.Add(InputAction.Create("Toggle Background", KeyCode.Alpha6, "Enable / Disable background objects", async () =>
            //{
            //    SuManager.FilterBackgroundSceneObjects = !SuManager.FilterBackgroundSceneObjects;
            //    await SuManager.DisplayDataAsync();
            //}));

            //inputActions.Add(InputAction.Create("Toggle Unknown", KeyCode.Alpha7, "Enable / Disable unknown objects", async () =>
            //{
            //    SuManager.FilterUnknownSceneObjects = !SuManager.FilterUnknownSceneObjects;
            //    await SuManager.DisplayDataAsync();
            //}));

            //inputActions.Add(InputAction.Create("Toggle Inferred", KeyCode.Alpha8, "Enable / Disable completely inferred surfaces (requires refresh)", () =>
            //{
            //    SuManager.RequestInferredRegions = !SuManager.RequestInferredRegions;
            //}));

            inputActions.Add(InputAction.Create("Toggle World", KeyCode.Alpha9, "Show or hide the world mesh", async () =>
            {
                SuManager.FilterWorldMesh = !SuManager.FilterWorldMesh;
                await SuManager.DisplayDataAsync();
            }));

            inputActions.Add(InputAction.Create("Mesh Coarse", KeyCode.None, "Low quality mesh", () =>
            {
                SuManager.MeshQuality = SceneUnderstanding.SceneMeshLevelOfDetail.Coarse;
            }));

            inputActions.Add(InputAction.Create("Mesh Medium", KeyCode.None, "Medium quality mesh", () =>
            {
                SuManager.MeshQuality = SceneUnderstanding.SceneMeshLevelOfDetail.Medium;
            }));

            inputActions.Add(InputAction.Create("Mesh Fine", KeyCode.None, "High quality mesh", () =>
            {
                SuManager.MeshQuality = SceneUnderstanding.SceneMeshLevelOfDetail.Fine;
            }));

            //inputActions.Add(InputAction.Create("Mesh Unlimited", KeyCode.None, "Unlimited quality mesh", () =>
            //{
            //    SuManager.MeshQuality = SceneUnderstanding.SceneMeshLevelOfDetail.Unlimited;
            //}));

            inputActions.Add(InputAction.Create("Toggle MiniMap", KeyCode.M, "Show or hide the mini map", MiniMapToggle));

            inputActions.Add(InputAction.Create("Toggle Ghost Mode", KeyCode.O, "Enable / Disable Ghost Mode (Scene Objects will be invisible but still occlude)", async () =>
            {
                SuManager.IsInGhostMode = !SuManager.IsInGhostMode;
                await SuManager.DisplayDataAsync();
            }));

            // Last batch of device-only commands
            if (suManager.QuerySceneFromDevice)
            {
                inputActions.Add(InputAction.Create("Increase Radius", KeyCode.None, "Increase the range used to query the environment", () =>
                {
                    float fTempFloat = SuManager.BoundingSphereRadiusInMeters + 5.0f;
                    fTempFloat = Mathf.Clamp(fTempFloat, 5.0f, 100.0f);
                    SuManager.BoundingSphereRadiusInMeters = fTempFloat;
                }));

                inputActions.Add(InputAction.Create("Decrease Radius", KeyCode.None, "Decrease the range used to query the environment", () =>
                {
                    float fTempFloat = SuManager.BoundingSphereRadiusInMeters - 5.0f;
                    fTempFloat = Mathf.Clamp(fTempFloat, 5.0f, 100.0f);
                    SuManager.BoundingSphereRadiusInMeters = fTempFloat;
                }));

            }

            inputActions.Add(InputAction.Create("Save Model", KeyCode.None, "Saves the current scene to storage", SaveData));

            inputActions.Add(InputAction.Create("Set Model", KeyCode.None, "Test RegisterFromExisting", RegisterExistingModel));

            inputActions.Add(InputAction.Create("Toggle plane detection", KeyCode.None, "Toggle plane detection", TogglePlaneDetection));

            inputActions.Add(InputAction.Create("Auto Registration", KeyCode.None, "Toggle Auto Registration", () =>
            {
                SuManager.AutomaticRegistration = !SuManager.AutomaticRegistration;
                SuManager.LogConsole("SuManager.AutomaticRegistration: " + (SuManager.AutomaticRegistration?"true":"false"));
            }));

            //inputActions.Add(InputAction.Create("Toggle Help", KeyCode.H, "Shows or hides the help menu", menu.Toggle));

            inputActions.Add(InputAction.Create("Close App", KeyCode.None, "Close App", () =>
            {
                Application.Quit();
            }));
        }

        /// <summary>
        /// Turns the mini map off.
        /// </summary>
        private void MiniMapOff()
        {
            if (suMinimap != null)
            {
                DestroyImmediate(suMinimap);
                suMinimap = null;
            }
            SuManager.SceneRoot.SetActive(true);
        }

        /// <summary>
        /// Turns the mini map on.
        /// </summary>
        private void MiniMapOn()
        {
            if (suMinimap == null)
            {
                suMinimap = Instantiate(SuManager.SceneRoot);
                suMinimap.name = "Minimap";
                suMinimap.transform.position = Camera.main.transform.position + Camera.main.transform.forward;
                suMinimap.transform.localScale = new Vector3(0.1f, 0.1f, 0.1f);

                SuManager.SceneRoot.SetActive(false);
            }
        }

        /// <summary>
        /// Toggles the mini map on and off.
        /// </summary>
        private void MiniMapToggle()
        {
            if (suMinimap == null)
            {
                MiniMapOn();
            }
            else
            {
                MiniMapOff();
            }
        }

        /// <summary>
        /// Attempts to process any currently pressed keys.
        /// </summary>
        private void ProcessKeys()
        {
            // Look at all registered
            foreach (KeyCode key in keyMap.Keys)
            {
                // Is the key down?
                if (Input.GetKeyDown(key))
                {
                    // Yes, notify
                    keyMap[key].Handler.Invoke();
                }
            }
        }

        /// <summary>
        /// Saves SU data to storage.
        /// </summary>
        private void SaveData()
        {
            //var bytes = SuManager.SaveBytesToDiskAsync();
            var objs = SuManager.SaveObjsToDiskAsync();
            SaveModel();
        }
        #endregion // Internal Methods

        private void SaveModel()
        {
            m_PlaneDetectionController.SavePlanesToFile();
        }

        private void RegisterExistingModel()
        {
            m_PlaneDetectionController.RegisterExistingModel();
        }

        private void TogglePlaneDetection()
        {
            m_PlaneDetectionController.TogglePlaneDetection();
        }

        #region Overrides / Event Handlers
        private void OnPhraseRecognized(PhraseRecognizedEventArgs args)
        {
            // Try to map from phrase to action
            InputAction action;
            if (speechMap.TryGetValue(args.text, out action))
            {
                // Mapped action found, notify
                Debug.Log("SUInputManager.OnPhraseRecognized: Phrase '" + args.text + "'recognized");
                action.Handler.Invoke();
            }
        }

        #endregion // Overrides / Event Handlers

        #region Unity Overrides
        void Start()
        {
            if (useDefaultCommands)
            {

                if (suManager == null)
                {
                    suManager = m_PlaneDetectionController.m_ARPlaneManager;
                }

                if (suManager == null)
                {
                    Debug.LogError($"{nameof(SampleInputManager)}: {nameof(SuManager)} is not set. Disabling.");
                    enabled = false;
                    return;
                }
                if (menu == null)
                {
                    Debug.LogError($"{nameof(SampleInputManager)}: {nameof(Menu)} is not set. Disabling.");
                    enabled = false;
                    return;
                }
                AddDefaultCommands();
            }

            EnableInput();

            // Try to map from phrase to action
            //InputAction update_action = inputActions.Where(ia => ia.Phrase == ia_update_phrase).First();
            //if (update_action != null) {
            //    update_action.Handler.Invoke();
            //}
        }

        private void Update()
        {
            // Process any pressed keys
            ProcessKeys();
        }
        #endregion // Unity Overrides

        #region Public Methods
        /// <summary>
        /// Starts listening for input
        /// </summary>
        public void EnableInput()
        {
            // If already enabled, ignore
            if (isEnabled) { return; }

            // Enabled now
            isEnabled = true;

            // Map inputs to actions
            foreach (InputAction ia in inputActions)
            {
                // Map speech
                speechMap[ia.Phrase] = ia;

                // Map keys
                if (ia.Key != KeyCode.None) { keyMap[ia.Key] = ia; }
            }

            // Start listening for voice commands
            keywordRecognizer = new KeywordRecognizer(speechMap.Keys.ToArray());
            keywordRecognizer.OnPhraseRecognized += OnPhraseRecognized;
            keywordRecognizer.Start();

            // Notify
            InputEnabled.Invoke();
        }

        /// <summary>
        /// Stops listening for input
        /// </summary>
        public void DisableInput()
        {
            // If not enabled, ignore
            if (!isEnabled) { return; }

            // No longer enabled
            isEnabled = false;

            // Stop listening for voice commands
            if (keywordRecognizer != null)
            {
                keywordRecognizer.Stop();
                keywordRecognizer.OnPhraseRecognized -= OnPhraseRecognized;
                keywordRecognizer = null;
            }

            // Clear input maps
            speechMap.Clear();
            keyMap.Clear();

            // Notify
            InputDisabled.Invoke();
        }
        #endregion // Public Methods

        #region Public Properties
        /// <summary>
        /// Gets or sets the list of inputs and their respective actions.
        /// </summary>
        public List<InputAction> InputActions { get => inputActions; set => inputActions = value; }

        /// <summary>
        /// Gets or sets a reference to the menu for default commands.
        /// </summary>
        public SampleMenu Menu { get => menu; set => menu = value; }

        /// <summary>
        /// Gets or sets a reference to the scene understanding manager for default commands.
        /// </summary>
        public SceneUnderstandingManager SuManager { get => suManager; set => suManager = value; }

        /// <summary>
        /// Gets or sets a value that indicates whether or not to include default commands.
        /// </summary>
        public bool UseDefaultCommands { get => useDefaultCommands; set => useDefaultCommands = value; }
        #endregion // Public Properties

        #region Public Events
        /// <summary>
        /// Raised when input is enabled.
        /// </summary>
        public UnityEvent InputEnabled { get => inputEnabled; }

        /// <summary>
        /// Raised when input is disabled.
        /// </summary>
        public UnityEvent InputDisabled { get => inputDisabled; }
        #endregion // Public Events
    }

}