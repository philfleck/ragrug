using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace RR
{
    using JSCallback = System.Func<Jint.Native.JsValue, Jint.Native.JsValue[], Jint.Native.JsValue>;
    public class VZVisibilityTrigger : MonoBehaviour
    {
        public JSCallback onVisCb = null;
        public JSCallback offVisCb = null;
        public string data;

        private void OnBecameVisible()
        {
            if (onVisCb != null)
            {
                onVisCb.Invoke(
                new Jint.Native.JsValue("visible"),
                new Jint.Native.JsValue[] { this.name, true, data });
            }
        }

        private void OnBecameInvisible()
        {
            if (offVisCb != null)
            {
                offVisCb.Invoke(
                new Jint.Native.JsValue("invisible"),
                new Jint.Native.JsValue[] { this.name, false, data });
            }
        }
    }
}
