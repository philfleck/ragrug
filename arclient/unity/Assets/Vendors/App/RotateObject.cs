using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace RR {
	public class RotateObject : MonoBehaviour {

		public float speed = -100f;
		public bool XAxis = false;
		public bool YAxis = true;
		public bool ZAxis = false;

        private bool cont_play = true;

		void Start () {
			
		}

        public void Play()
        {
            cont_play = true;
        }

        public void Pause()
        {
            cont_play = false;
        }

        public void TogglePlay()
        {
            cont_play = !cont_play;
        }

        void Update () {
            if (cont_play)
            {
                float x = 0, y = 0, z = 0;
                if (XAxis)
                    x = 1;
                if (YAxis)
                    y = 1;
                if (ZAxis)
                    z = 1;

                if (!XAxis && !YAxis && !ZAxis)
                    z = 1;

                transform.Rotate(new Vector3(x, y, z), speed * Time.deltaTime);
            }
		}
	}

}
