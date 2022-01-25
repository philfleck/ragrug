//Philipp Fleck 2020
using Microsoft.MixedReality.Toolkit.UI;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace RR
{
    using JSCallback = System.Func<Jint.Native.JsValue, Jint.Native.JsValue[], Jint.Native.JsValue>;

    public class JSSlider : MonoBehaviour
    {
        JSCallback jsUpdateFct;

        // Start is called before the first frame update
        void Start()
        {

        }

        // Update is called once per frame
        void Update()
        {

        }

        public void ReportChange(SliderEventData sed)
        {
            var oldv = sed.OldValue;
            var newv = sed.NewValue;

            try
            {
                jsUpdateFct?.Invoke(
                        new Jint.Native.JsValue("SliderUpdate"),
                        new Jint.Native.JsValue[] { gameObject.name, oldv, newv });
            }
            catch (Exception err)
            {
                Debug.LogError("JSSlider::ReportChange ERROR => " + err);
            }
        }

        public void SetCallback(JSCallback cb)
        {
            jsUpdateFct = cb;
        }
    }
}