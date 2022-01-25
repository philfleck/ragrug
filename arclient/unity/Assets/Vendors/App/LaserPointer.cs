using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


/// <summary>A laser pointer which fires an input ray from e.g. a 3D hand.</summary>
/// NOTE: PowerUI.InputPointer.Raycast is defined in PowerUI git master, not in releases at least up to 2.0.700
public class LaserPointer : PowerUI.InputPointer
{

    public Transform Transform;
    /// <summary>True if UI's move around.</summary>
    public bool MovingUIs;
    float clickFilter = 0.5f;//4f;
    float lastClick = 0;
    //GameObject pointyStick = null;
    bool fingerDown = false;
    bool cooling = false;

    /// <summary>Setup a laser pointer from the given transform (e.g. a hand object).</summary>
    public LaserPointer(Transform transform) : this(transform, true) { }

    /// <summary>Setup a laser pointer from the given transform (e.g. a hand object).</summary>
    /// <param name='movingUIs'>Set this to true if your WorldUI's move around.
    /// Setting it to false is a small performance saving. If you're not sure, just use true.</param>
    public LaserPointer(Transform transform, bool movingUIs)
    {
        Transform = transform;
        MovingUIs = movingUIs;

        // It won't interact with the main UI so just put it offscreen to skip checking entirely:
        ScreenX = ScreenY = -1000f;

    }

    private IEnumerator Cooldown()
    {
        yield return new WaitForSeconds(4f);
        cooling = false;
    }

    private List<float> contHits = new List<float>();
    public override bool Raycast(out RaycastHit hit, Camera cam, Vector2 screenPoint)
    {

        // Fire off your ray in whatever your pointers direction is; we'll use transform.forward here.
        // ('forward' is +ve z):

        Ray ray = new Ray(Transform.position, Transform.forward);
        //Ray ray = new Ray(Transform.position, Camera.main.transform.forward);
        //Debug.Log("LaserPointer t.fw=" + Transform.forward + "vs c.fw=" + Camera.main.transform.forward);
        //orig
        if (false)
        {
            return Physics.Raycast(ray, out hit);
        }

        /*if(pointyStick == null)
        {
            pointyStick = GameObject.Find("PointyStick");
            if (pointyStick == null)
            {
                pointyStick = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                pointyStick.name = "PointyStick";
            }
            pointyStick.transform.localScale = new Vector3(0.001f, 0.001f, 0.2f);
        }*/

        //pointyStick.transform.position = Transform.position;
        //pointyStick.transform.forward = Transform.forward;
        //pointyStick.transform.forward = Camera.main.transform.forward;


        var didHit = Physics.Raycast(ray, out hit, 0.3f); //without distance
        if (didHit)
        {
            string msg = "";
            if (contHits.Count > 0 && contHits[contHits.Count - 1] - hit.distance > 0.01)
            {
                contHits.Add(hit.distance);
            }

            if (contHits.Count == 0)
            {
                contHits.Add(hit.distance);
            }

            foreach (var f in contHits)
            {
                msg += " " + f;
            }

            //Debug.Log("LaserPointer name => " + Transform.name);

            /*
            var sphereName = "";
            if (Transform.name == "MyRightTip")
            {
                sphereName = "MyRightTipSphere";
            }

            if (Transform.name == "MyLeftTip")
            {
                sphereName = "MyLeftTipSphere";
            }

            if (sphereName.Length > 0)
            {
                var go = GameObject.Find(sphereName);

                // 0.3 - 0
                // 1- 0.30 = 0.7
                // 1- 0.05 = 0.95
                // 0.7-0.95 * 0.02 = 0.014 - 0.019
w
                var s = (1f - hit.distance) * (1f - hit.distance) * 0.02f;
                if (go != null)
                {
                    go.transform.localScale = new Vector3(s, s, s);
                }
            }
            */

            //Debug.Log("LaserPointer contHits => " + contHits.Count + "|" + msg);
            //Debug.Log("LaserPointer hit => " + hit.distance + "/" + hit.normal);
            if (hit.distance < 0.05)
            {
                if ((Time.time - lastClick) < clickFilter)
                {
                    return didHit;
                }
                lastClick = Time.time;

                if (contHits.Count < 2)
                {
                    //contHits.Clear();
                    //Debug.Log("LaserPointer => EARLY EXIT!");
                    return didHit;
                }

                float cur = contHits[0];
                for (var i = 1; i < contHits.Count; i++)
                {
                    float next = contHits[i];
                    if (cur < next)
                    {
                        //Debug.Log("LaserPointer => EARLY EXIT & CLEAR!");
                        contHits.Clear();
                        return didHit;
                    }
                }

                //Debug.Log("LaserPointer contHits => CLICK!");
                contHits.Clear();
                this.Click(0);

                /*
                Debug.Log("LaserPointer fingerDown=" + fingerDown + ", clickFilter => " + Time.time + "-" + lastClick + ">" + clickFilter + "=" + ((Time.time - lastClick) > clickFilter));
                //if(true)
                //if (!fingerDown && (Time.time - lastClick) > clickFilter)
                if((Time.time - lastClick) > clickFilter)
                {
                    this.Click(0);
                    lastClick = Time.time;
                    //fingerDown = true;
                }*/
            }
            else
            {
                /*if (fingerDown)
                {
                    //this.Click(0);
                    //Up(0);
                    Debug.Log("LaserPointer fingerDown => " + fingerDown);
                    fingerDown = false;
                }*/
            }
        }
        else
        {
            contHits.Clear();
            /*
            if (Transform.name == "MyRightTip")
            {
                var sphereName = "MyRightTipSphere";
                var go = GameObject.Find(sphereName);
                if (go != null)
                {
                    go.transform.localScale = Vector3.zero;
                }
            }

            if (Transform.name == "MyLeftTip")
            {
                var sphereName = "MyLeftTipSphere";
                var go = GameObject.Find(sphereName);
                if (go != null)
                {
                    go.transform.localScale = Vector3.zero;
                }
            }
            */
        }
        return didHit;
    }

    public override bool Relocate(out Vector2 delta)
    {

        // We can just ignore delta (it's for the main UI):
        delta = Vector2.zero;

        if (MovingUIs)
        {
            // Always recompute.
            return true;
        }

        // Transform moved?
        if (Transform != null && Transform.hasChanged)
        {
            Transform.hasChanged = false;
            return true;
        }

        // Don't bother recalculating - it's not moved.
        // (Always return true if your UI's are moving instead).
        return false;
    }

}

#if false
using System;
using UnityEngine;


/// <summary>A laser pointer which fires an input ray from e.g. a 3D hand.</summary>
/// NOTE: PowerUI.InputPointer.Raycast is defined in PowerUI git master, not in releases at least up to 2.0.700
public class LaserPointer : PowerUI.InputPointer{

	public Transform Transform;
	/// <summary>True if UI's move around.</summary>
	public bool MovingUIs; 


	/// <summary>Setup a laser pointer from the given transform (e.g. a hand object).</summary>
	public LaserPointer(Transform transform):this(transform,true){}

	/// <summary>Setup a laser pointer from the given transform (e.g. a hand object).</summary>
	/// <param name='movingUIs'>Set this to true if your WorldUI's move around.
	/// Setting it to false is a small performance saving. If you're not sure, just use true.</param>
	public LaserPointer(Transform transform, bool movingUIs){
		Transform = transform;
		MovingUIs = movingUIs;

		// It won't interact with the main UI so just put it offscreen to skip checking entirely:
		ScreenX = ScreenY = -1000f;

	}

	public override bool Raycast(out RaycastHit hit, Camera cam, Vector2 screenPoint){

        // Fire off your ray in whatever your pointers direction is; we'll use transform.forward here.
        // ('forward' is +ve z):

        Ray ray = new Ray(Transform.position, Transform.forward);

        // changed by phil
        //var cp = Camera.main.transform.position;
        //var cpf = Camera.main.transform.forward;
        //Ray ray = new Ray(Camera.main.transform.position, Camera.main.transform.forward);

        //from inputpointer
        //Debug.LogError("RAYCAST screenPoint=" + screenPoint);
        //Ray ray = cam.ScreenPointToRay(screenPoint);

#if false
        var layerMask = ~(1 << LayerMask.NameToLayer("spatialmesh"));
        bool r = Physics.Raycast(ray, out hit, 10, layerMask);
#else
        bool r = Physics.Raycast(ray, out hit, 10);
#endif

        /*
        if(r)
        {
            
            
            Debug.LogError("RAYCAST HIt @ " + hit.point + ", name="+ hit.transform.name + ", cname=" + hit.collider.name + ", d=" + hit.distance);
            Debug.LogError("RAYCAST HIt @ CamPos=" + cp);
            Debug.LogError("RAYCAST HIt @ CamFwd" + cpf);
            Debug.LogError("RAYCAST HIt @ textureCoord=" + hit.textureCoord);

            if (hit.collider.name == "S_RPI_Interface")
            {
                var debugCube = GameObject.CreatePrimitive(PrimitiveType.Cube);
                debugCube.transform.localScale = Vector3.one * 0.001f;
                debugCube.transform.position = hit.point;
            }
        }*/

        return r;
	}

    /*
	public override bool Relocate(out Vector2 delta){

		// We can just ignore delta (it's for the main UI):
		delta = Vector2.zero;

		if(MovingUIs){
			// Always recompute.
			return true;
		}

		// Transform moved?
		if(Transform!=null && Transform.hasChanged){
			Transform.hasChanged = false;
			return true;
		}

		// Don't bother recalculating - it's not moved.
		// (Always return true if your UI's are moving instead).
		return false;
	}
    */

}
#endif