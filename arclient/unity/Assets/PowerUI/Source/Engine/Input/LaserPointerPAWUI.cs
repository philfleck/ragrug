using System;
using UnityEngine;
using HoloLensHandTracking;


/// <summary>A laser pointer which fires an input ray from e.g. a 3D hand.</summary>
/// NOTE: PowerUI.InputPointer.Raycast is defined in PowerUI git master, not in releases at least up to 2.0.700
public class LaserPointerPAWUI : PowerUI.InputPointer{

	public Transform Transform;
	private GameObject Cursor;
	private Quaternion cursorDefaultRotation;
    public HandsTrackingController hTC;
    /// <summary>True if UI's move around.</summary>
    public bool MovingUIs;


    /// <summary>Setup a laser pointer from the given transform (e.g. a hand object).</summary>
    public LaserPointerPAWUI(HandsTrackingController hTc, GameObject cursor) :this(hTc, cursor, true){}

	/// <summary>Setup a laser pointer from the given transform (e.g. a hand object).</summary>
	/// <param name='movingUIs'>Set this to true if your WorldUI's move around.
	/// Setting it to false is a small performance saving. If you're not sure, just use true.</param>
	public LaserPointerPAWUI(HandsTrackingController hTc, GameObject cursor, bool movingUIs){
        hTC = hTc;
		Transform = hTc.Transform_;
		MovingUIs = movingUIs;
		Cursor = GameObject.Instantiate(cursor);
		cursorDefaultRotation = Cursor.transform.rotation;
		// It won't interact with the main UI so just put it offscreen to skip checking entirely:
		ScreenX = ScreenY = -1000f;

	}

	public override bool Raycast(out RaycastHit hit, Camera cam, Vector2 screenPoint){

        if (hTC.Transform_ != null)
        {
	        Vector3 dir = hTC.Transform_.position - Camera.main.transform.position;
            Ray ray = new Ray(hTC.Transform_.position, dir);

            bool r = Physics.Raycast(ray, out hit);
            
            if (r)
            {
	            Cursor.transform.position = hit.point +  hit.normal * 0.01f;
				Cursor.transform.up = hit.normal;
				Cursor.transform.rotation *= cursorDefaultRotation;
            }

            return r;
        }
        hit = new RaycastHit();
        return false;
	}

    
	public override bool Relocate(out Vector2 delta){

		// We can just ignore delta (it's for the main UI):
		delta = Vector2.zero;

		if(MovingUIs){
			// Always recompute.
			Vector2 screen_coord = Camera.main.WorldToScreenPoint(Cursor.transform.position);
			bool return_value = TryChangePosition(screen_coord, true, out delta);
			return return_value;
		}

		// Transform moved?
		if(hTC.Transform_!=null && hTC.Transform_.hasChanged){
			hTC.Transform_.hasChanged = false;
			return true;
		}

		// Don't bother recalculating - it's not moved.
		// (Always return true if your UI's are moving instead).
		return false;
	}
    

}