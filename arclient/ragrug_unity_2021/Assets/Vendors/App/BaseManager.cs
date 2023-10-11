//Philipp Fleck 2020
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BaseManager<T> : MonoBehaviour where T : UnityEngine.Component
{
    private static T me = null;

    public static T GetRTInstance()
    {
        if (me == null)
        {
            me = GameObject.Find("Runtime").GetComponent<T>();
            if(me == null)
            {
                GameObject.Find("Runtime").AddComponent<T>();
            }
        }
        return me;
    }
}
