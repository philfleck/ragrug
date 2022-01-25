using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Vizario;

public class CameraMovement : BaseManager<CameraMovement>
{
	private bool Rotation = false;

	private bool Position = true;
	// Use this for initialization
	public GameObject Cam;
	public Camera camera;

	// Update is called once per frame
	void Update () 
	{
#if UNITY_EDITOR
		while(Cam == null)
		{
			Cam = GameObject.Find("#PowerUI");
			if (Cam != null)
			{
				camera = Cam.GetComponentInChildren<Camera>();
				GameObject camObj = Cam.transform.Find("Camera").gameObject;
				Camera cam = camObj.GetComponent<Camera>();

				/*if (cam != null)
				{
					camObj.transform.localPosition = new Vector3(0,0,-60);
					cam.cullingMask = -1;
					cam.clearFlags = CameraClearFlags.SolidColor;
					cam.orthographicSize = 0.1f;
					cam.backgroundColor = Color.black;
					cam.projectionMatrix = Matrix4x4.Perspective(60, Camera.main.aspect, Camera.main.nearClipPlane, Camera.main.farClipPlane);
					cam.depth = -1;
					cam.renderingPath = Camera.main.renderingPath;
					cam.useOcclusionCulling = true;
					cam.allowHDR = false;
					cam.allowMSAA = true;
					cam.allowDynamicResolution = false;
					cam.stereoSeparation = 0.022f;
					cam.stereoConvergence = 10;
				}*/
			}
		}

		//TODO verify if this does not break Hololens, but should not!
		//was on
		//Camera.main.transform.position = Cam.transform.position;
		//Camera.main.transform.rotation = Cam.transform.rotation;
		if (Input.GetKeyDown(KeyCode.Space))
		{
			Rotation = !Rotation;
			Position = !Position;
		}

		if (Position)
		{
			if (Input.GetKey(KeyCode.DownArrow))
			{
				Cam.transform.position = Cam.transform.position - new Vector3(0, 0.01f, 0);
			}
			else if (Input.GetKey(KeyCode.UpArrow))
			{
				Cam.transform.position = Cam.transform.position + new Vector3(0, 0.01f, 0);
			}
			else if (Input.GetKey(KeyCode.LeftArrow))
			{
				Cam.transform.position = Cam.transform.position - new Vector3(0.01f, 0, 0);
			}
			else if (Input.GetKey(KeyCode.RightArrow))
			{
				Cam.transform.position = Cam.transform.position + new Vector3(0.01f, 0, 0);
			}
			else if (Input.GetKey(KeyCode.PageDown))
			{
				Cam.transform.position = Cam.transform.position - new Vector3(0, 0, 0.01f);
			}
			else if (Input.GetKey(KeyCode.PageUp))
			{
				Cam.transform.position = Cam.transform.position + new Vector3(0, 0, 0.01f);
			}
		}
		if (Rotation)
		{
			if (Input.GetKey(KeyCode.DownArrow))
			{
				Cam.transform.Rotate(new Vector3(1, 0, 0));
			}
			else if (Input.GetKey(KeyCode.UpArrow))
			{
				Cam.transform.Rotate(new Vector3(-1, 0, 0));
			}
			else if (Input.GetKey(KeyCode.LeftArrow))
			{
				Cam.transform.Rotate(new Vector3(0, 1, 0));
			}
			else if (Input.GetKey(KeyCode.RightArrow))
			{
				Cam.transform.Rotate(new Vector3(0, -1, 0));
			}
			else if (Input.GetKey(KeyCode.PageDown))
			{
				Cam.transform.Rotate(new Vector3(0, 0, 1));
			}
			else if (Input.GetKey(KeyCode.PageUp))
			{
				Cam.transform.Rotate(new Vector3(0, 0, -1));
			}
		}
#endif
	}

}
