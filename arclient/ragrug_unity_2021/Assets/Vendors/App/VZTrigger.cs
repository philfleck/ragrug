using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace RR
{
    using JSCallback = System.Func<Jint.Native.JsValue, Jint.Native.JsValue[], Jint.Native.JsValue>;
    public class VZTrigger : MonoBehaviour
    {
        public JSCallback enterC = null;
        public JSCallback exitC = null;
        public string data;

        private void OnTriggerEnter(Collider other)
        {
            if (enterC != null)
            {
                enterC.Invoke(
                new Jint.Native.JsValue("enter"),
                new Jint.Native.JsValue[] { this.name, other.name, data });
            }
        }

        private void OnTriggerExit(Collider other)
        {
            if (exitC != null)
            {
                exitC.Invoke(
                new Jint.Native.JsValue("exit"),
                new Jint.Native.JsValue[] { this.name, other.name, data });
            }
        }
    }
}
