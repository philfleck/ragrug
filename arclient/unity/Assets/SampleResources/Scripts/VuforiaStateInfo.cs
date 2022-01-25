/*===============================================================================
Copyright (c) 2020 PTC Inc. All Rights Reserved.

Vuforia is a trademark of PTC Inc., registered in the United States and other
countries.
===============================================================================*/

using System.Collections.Generic;
using UnityEngine;
using System.Linq;
using System.IO;
using Vuforia;

public class VuforiaStateInfo : MonoBehaviour
{
	#region PUBLIC_MEMBERS

	public GameObject textObject;

	#endregion //PUBLIC_MEMBERS


	#region PRIVATE_MEMBERS

	readonly string activeDataSetsTitle = "<b>Active DataSets: </b>";
	string activeDataSetsInfo = string.Empty;
	string trackableStateInfo = string.Empty;
	string vumarkTrackableStateInfo = string.Empty;

	ObjectTracker objectTracker;
	StateManager stateManager;
	Dictionary<string, string> trackablesDictionary;

	#endregion // PRIVATE_MEMBERS


	#region MONOBEHAVIOUR_METHODS

	void Start()
	{
		if (VuforiaBehaviour.Instance && VuforiaARController.Instance.HasStarted)
		{
			OnVuforiaStarted();
		}
		else
		{
			VuforiaARController.Instance.RegisterVuforiaStartedCallback(OnVuforiaStarted);
		}
	}

	#endregion //MONOBEHAVIOUR_METHODS


	#region VUFORIA_CALLBACK_METHODS

	void OnVuforiaStarted()
	{
		stateManager = TrackerManager.Instance.GetStateManager();
		objectTracker = TrackerManager.Instance.GetTracker<ObjectTracker>();

		UpdateText();
	}

	#endregion // VUFORIA_CALLBACK_METHODS


	#region PUBLIC_METHODS

	/// <summary>
	/// Public method to be called by a TrackableEventHandler's Lost/Found Events
	/// </summary>
	/// <param name="trackableBehaviour"></param>
	public void TrackableStatusChanged(TrackableBehaviour trackableBehaviour)
	{
		var status = string.Format("{0} -- {1}",
			trackableBehaviour.CurrentStatus,
			trackableBehaviour.CurrentStatusInfo);

		if (this.trackablesDictionary == null)
		{
			this.trackablesDictionary = SampleUtil.CreateDictionary();
		}

		var name = trackableBehaviour.TrackableName;
		if (this.trackablesDictionary != null)
		{
			if (this.trackablesDictionary.ContainsKey(name))
			{
				this.trackablesDictionary[name] = status;
			}
			else
			{
				this.trackablesDictionary.Add(name, status);
			}
		}

		UpdateText();
	}

	#endregion //PUBLIC_METHODS


	#region PRIVATE_METHODS

	void UpdateText()
	{
		UpdateInfo();

		var completeInfo = activeDataSetsTitle + activeDataSetsInfo;

		if (trackableStateInfo.Length > 0 || vumarkTrackableStateInfo.Length > 0)
		{
			completeInfo += string.Format("\n{0}", trackableStateInfo, vumarkTrackableStateInfo);
		}

		SampleUtil.AssignStringToTextComponent(this.textObject ?? this.gameObject, completeInfo);
	}

	void UpdateInfo()
	{
		if (objectTracker != null && stateManager != null)
		{
			this.activeDataSetsInfo = GetDataSetsAsString(objectTracker.GetActiveDataSets());
			this.trackableStateInfo = GetTrackablesAsString(stateManager.GetTrackableBehaviours());
			this.vumarkTrackableStateInfo = GetTrackablesAsString(stateManager.GetVuMarkManager().GetActiveBehaviours());
		}
	}

	string GetDataSetsAsString(IEnumerable<DataSet> datasets)
	{
		if (datasets.Count() > 0)
		{
			var activeDataSetList = string.Empty;

			if (objectTracker != null)
			{
				foreach (DataSet ds in datasets)
				{
					var dsName = Path.GetFileNameWithoutExtension(ds.Path);
					activeDataSetList += "\n" + dsName;
				}
			}
			return activeDataSetList;
		}
		else
		{
			return string.Empty;
		}
	}

	string GetTrackablesAsString(IEnumerable<TrackableBehaviour> trackableBehaviours)
	{
		if (trackableBehaviours != null && trackableBehaviours.Count() > 0 &&
			this.trackablesDictionary != null && this.trackablesDictionary.Count() > 0)
		{
			var trackablesAsMultiLineString = string.Empty;

			foreach (TrackableBehaviour tb in trackableBehaviours)
			{
				var status = SampleUtil.GetValuefromDictionary(this.trackablesDictionary, tb.TrackableName);

				if (!string.IsNullOrEmpty(status))
				{
					trackablesAsMultiLineString += "\n" + tb.TrackableName + ": " + status;
				}
			}

			return trackablesAsMultiLineString;
		}
		else
		{
			return string.Empty;
		}
	}

	#endregion //PRIVATE_METHODS
}
