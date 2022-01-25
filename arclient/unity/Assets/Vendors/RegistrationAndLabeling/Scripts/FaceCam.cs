﻿using System.Collections;
using System.Collections.Generic;
 using Modular;
using UnityEngine;

public class FaceCam : MonoBehaviour {

	// Use this for initialization

	private GameObject Cam;
	void Start () {
#if UNITY_EDITOR
		StartCoroutine(InitCamera());
#else
		Cam = Camera.main.gameObject;
		StartCoroutine(faceCamera());
#endif
		
	}

	private IEnumerator InitCamera()
	{

		yield return new WaitUntil(() => CameraMovement.GetRTInstance().camera != null);
		Cam = CameraMovement.GetRTInstance().Cam;
		GameObject camObj = Cam.transform.Find("Camera").gameObject;
		Camera cam = camObj.GetComponent<Camera>();
		if (cam != null)
		{
			camObj.transform.localPosition = Vector3.zero;
			cam.cullingMask = -1;
			cam.clearFlags = CameraClearFlags.SolidColor;
			cam.orthographicSize = 0.1f;
			cam.backgroundColor = Color.black;
			cam.projectionMatrix = Matrix4x4.Perspective(16, Camera.main.aspect, Camera.main.nearClipPlane, Camera.main.farClipPlane);
			cam.depth = -1;
			cam.renderingPath = Camera.main.renderingPath;
			cam.useOcclusionCulling = true;
			cam.allowHDR = false;
			cam.allowMSAA = true;
			cam.allowDynamicResolution = false;
			cam.stereoSeparation = 0.022f;
			cam.stereoConvergence = 10;
		}
		StartCoroutine(faceCamera());
	}
	// Update is called once per frame
	private IEnumerator faceCamera() {

		while (true)
		{
			float strength = 2.5f;
      if(this.transform != null && Cam != null)
      {
	      transform.rotation = Quaternion.LookRotation (transform.position - Cam.transform.position);
      }

			yield return new WaitForSeconds(0.2f);
		}


	}
}
