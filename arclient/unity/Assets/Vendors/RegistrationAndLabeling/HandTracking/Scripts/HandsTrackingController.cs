
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.

using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.XR.WSA.Input;

namespace HoloLensHandTracking
{
    /// <summary>
    /// HandsManager determines if the hand is currently detected or not.
    /// </summary>
    public class HandsTrackingController : MonoBehaviour
    {
        /// <summary>
        /// HandDetected tracks the hand detected state.
        /// Returns true if the list of tracked hands is not empty.
        /// </summary>
        public bool HandDetected
        {
            get { return trackedHands.Count > 0; }
        }

        public GameObject TrackingObject;

        private HashSet<uint> trackedHands = new HashSet<uint>();
        private Dictionary<uint, GameObject> trackingObject = new Dictionary<uint, GameObject>();
        private GestureRecognizer gestureRecognizer;
        private uint activeId; 
        [HideInInspector]
        public Transform Transform_;
        public Vector3 Position;
        
        void Awake()
        {
            InteractionManager.InteractionSourceDetected += InteractionManager_InteractionSourceDetected;
            InteractionManager.InteractionSourceUpdated += InteractionManager_InteractionSourceUpdated;
            InteractionManager.InteractionSourceLost += InteractionManager_InteractionSourceLost;

            gestureRecognizer = new GestureRecognizer();
            gestureRecognizer.SetRecognizableGestures(GestureSettings.Tap | GestureSettings.Hold);         
            gestureRecognizer.StartCapturingGestures();
        }
       
        private void InteractionManager_InteractionSourceDetected(InteractionSourceDetectedEventArgs args)
        {
            uint id = args.state.source.id;
            // Check to see that the source is a hand.
            if (args.state.source.kind != InteractionSourceKind.Hand)
            {
                return;
            }            
            trackedHands.Add(id);
            activeId = id;

            var obj = Instantiate(TrackingObject) as GameObject;
            Vector3 pos;

            if (args.state.sourcePose.TryGetPosition(out pos))
            {
                obj.transform.position = new Vector3(pos.x-0.035f, pos.y+0.105f, pos.z);
                obj.transform.forward = Camera.main.transform.forward;

                Position = new Vector3(pos.x-0.035f, pos.y + 0.105f, pos.z);
                Transform_ = obj.transform;
            }

            trackingObject.Add(id, obj);
        }

        private void InteractionManager_InteractionSourceUpdated(InteractionSourceUpdatedEventArgs args)
        {
            uint id = args.state.source.id;
            Vector3 pos;

            if (args.state.source.kind == InteractionSourceKind.Hand)
            {
                if (trackingObject.ContainsKey(id))
                {
                    if (args.state.sourcePose.TryGetPosition(out pos))
                    {
                        trackingObject[id].transform.position = new Vector3(pos.x - 0.035f, pos.y + 0.105f, pos.z);

                        Position = new Vector3(pos.x - 0.035f, pos.y + 0.105f, pos.z);
                        Transform_ = trackingObject[id].transform;
                    }
                }
            }
        }

        private void InteractionManager_InteractionSourceLost(InteractionSourceLostEventArgs args)
        {
            uint id = args.state.source.id;
            // Check to see that the source is a hand.
            if (args.state.source.kind != InteractionSourceKind.Hand)
            {
                return;
            }

            if (trackedHands.Contains(id))
            {
                trackedHands.Remove(id);
            }

            if (trackingObject.ContainsKey(id))
            {
                var obj = trackingObject[id];
                trackingObject.Remove(id);
                Destroy(obj);
            }
            if (trackedHands.Count > 0)
            {
                activeId = trackedHands.First();
            }
        }

        void OnDestroy()
        {                        
            InteractionManager.InteractionSourceDetected -= InteractionManager_InteractionSourceDetected;
            InteractionManager.InteractionSourceUpdated -= InteractionManager_InteractionSourceUpdated;
            InteractionManager.InteractionSourceLost -= InteractionManager_InteractionSourceLost;
            gestureRecognizer.StopCapturingGestures();
        }
    }
}