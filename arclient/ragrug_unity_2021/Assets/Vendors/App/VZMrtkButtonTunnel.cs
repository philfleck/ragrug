//Philipp Fleck 2020
using Microsoft.MixedReality.Toolkit.UI;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace RR
{
    using JSCallback = System.Func<Jint.Native.JsValue, Jint.Native.JsValue[], Jint.Native.JsValue>;

    public class VZMrtkButtonTunnel : MonoBehaviour
    {
        private ButtonConfigHelper btnCfgHlp = null;
        JSCallback onClickCb = null;
        // Start is called before the first frame update
        void Start()
        {
            btnCfgHlp = gameObject.GetComponent<ButtonConfigHelper>();
            if (btnCfgHlp != null)
            {
                btnCfgHlp.OnClick.RemoveListener(OnClickTunnel);
                btnCfgHlp.OnClick.AddListener(OnClickTunnel);
            }
        }

        public void RegisterOnClickEvent(JSCallback cb)
        {
            onClickCb = cb;
        }

        public void OnClickTunnel()
        {
            if (onClickCb != null)
            {
                onClickCb.Invoke(new Jint.Native.JsValue("Clicked"), new Jint.Native.JsValue[] { this.name});
            }
        }
    }
}