using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace RRu2v
{
    public class Runtime : MonoBehaviour
    {
        public GameObject chartGo;
        public GameObject chartPrefab;
        public RealtimeDataProvider rtp;
        public u2vis.BaseVisualizationView bvv;
        public u2vis.GenericDataPresenter gdp;
        public int nCached = 10;
        public int lastIndex = 0;


        float lastMeasurement;
        // Start is called before the first frame update
        void Start()
        {
            Init();
            StartCoroutine(GenNext());
        }

        // Update is called once per frame
        void Update()
        {

        }

        public IEnumerator GenNext()
        {
            yield return new WaitForSeconds(5f);

            rtp.Data.Add(new u2vis.FloatDimension("deltaTime", null));
            for (var i = 0; i < nCached; i++)
            {
                rtp.Data[1].Add(0f);
            }

            var tmpGo = chartGo;
            bvv = tmpGo.GetComponent<u2vis.BaseVisualizationView>();
            gdp = tmpGo.GetComponent<u2vis.GenericDataPresenter>();

            int[] paramsIdx = { 0, 1 };
            gdp.Initialize(rtp, 0, nCached, paramsIdx);

            StartCoroutine(RunData());
        }

        public IEnumerator RunData()
        {
            yield return new WaitForSeconds(2f);
            while (true)
            {
                yield return new WaitForSeconds(0.2f);
                
                //taking measurement
                lastMeasurement = Time.deltaTime;

                //moving chart
                for(int i = 0; i < nCached-1; i++)
                {
                    var next = rtp.Data[1].GetObjValue(i + 1);
                    rtp.Data[1].Set(i, next);
                }
                rtp.Data[1].Set(nCached-1, lastMeasurement);

                //orig, running index
                //rtp.Data[1].Set(lastIndex, lastMeasurement);

                bvv.Rebuild();
                lastIndex = (lastIndex + 1) % nCached;
            }
        }

        public IEnumerator CInit()
        {
            yield return new WaitForSeconds(1f);

            rtp = gameObject.AddComponent<RealtimeDataProvider>();

            rtp.Data.Add(new u2vis.IntegerDimension("id", null));
            //rtp.Data.Add(new u2vis.IntegerDimension("id2", null));
            for (var i = 0; i < nCached; i++)
            {
                rtp.Data[0].Add(i);
                //rtp.Data[1].Add(i);
            }

            chartGo = Instantiate(chartPrefab);
            bvv = chartGo.GetComponent<u2vis.BaseVisualizationView>();
            gdp = chartGo.GetComponent<u2vis.GenericDataPresenter>();
            gdp.SetSelectedItemIndices(0, nCached);
        }

        public void Init()
        {
            StartCoroutine(CInit());
            
        }
    }
}