using System.Collections;
using System.Collections.Generic;

using Loonim;
using RR;
using UnityEngine;
using Vizario.VApp;

public class CreateWorldUI : MonoBehaviour
{
	//private string urlPrefix = "http://10.0.0.2:8080";
	private string urlPrefix = "http://192.168.0.53/HtmlUi";
	public string GetUrlPrefix()
	{
		return urlPrefix;
	}
	// Use this for initialization
	void Start()
	{
		
		Debug.Log("CreateWorldUI");
		HtmlUIManager.GetRTInstance().CreateExternalPanel(this.gameObject, new Vector3(0, 0, 1.5f), Vector3.zero, Vector3.one,
		                                                  "startAlignment", 1400, 400, urlPrefix + "/RegistrationManual/startAlignment.html", true, false, 
		                                                  true, false, Vector2.zero, 3500, true);
		HtmlUIManager.GetRTInstance().CreateExternalPanel(this.gameObject, new Vector3(0, -0.2f, 1.5f), Vector3.zero, Vector3.one,
		                                                  "finishAlignment", 1400, 400, urlPrefix + "/RegistrationManual/finishAlignment.html", true, false, 
		                                                  true, false, Vector2.zero, 3500, true);//2500

		PowerUI.WorldUI ma = PowerUI.WorldUI.Find("Main");
		if (ma != null)
		{
			var radialView = ma.gameObject.GetComponent<Microsoft.MixedReality.Toolkit.Utilities.Solvers.RadialView>();
			var billboard = ma.gameObject.GetComponent<Microsoft.MixedReality.Toolkit.UI.Billboard>();
			radialView.enabled = false;
			billboard.enabled = false;
		}
	}

	
	
}