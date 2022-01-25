using PowerUI;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using Vizario;

//using Paroxe.PdfRenderer;



namespace RR
{
    public class HtmlUIManager : BaseManager<HtmlUIManager>
    {
        private class PanelReference
        {
            public string mName;
            public GameObject mObj;
            public WorldUI mWorldUI;
            public HtmlDocument mDocument;
            public bool mIsFlat;
        }

        private class PanelHolder
        {
            Dictionary<string, PanelReference> holder;
            public PanelHolder()
            {
                holder = new Dictionary<string, PanelReference>();
            }

            ~PanelHolder()
            {
                foreach (var v in holder.Values)
                {
                    if (v.mObj != null)
                    {
                        Destroy(v.mObj);
                        v.mObj = null;
                    }
                }
                holder.Clear();
                holder = null;
            }

            public void AddOrUpdate(PanelReference pr, bool destroyOnUpdate)
            {
                PanelReference resPr = null;
                if (holder.TryGetValue(pr.mName, out resPr))
                {
                    if (destroyOnUpdate)
                    {
                        Destroy(resPr.mObj);
                        resPr.mObj = null;
                    }
                    resPr = pr;
                    Debug.Log(GetType() + " AddOrUpdate failed for " + pr.mName + ", updating");
                }
                else
                {
                    Debug.Log(GetType() + " AddOrUpdate adding " + pr.mName);
                    holder.Add(pr.mName, pr);
                }
            }

            public void DeletePanelRef(string pName)
            {
                PanelReference resPr = null;
                if (holder.TryGetValue(pName, out resPr))
                {

                    Destroy(resPr.mObj);
                    resPr.mObj = null;
                }
                holder.Remove(pName);
            }

            public HtmlDocument GetDocument(string pName)
            {
                PanelReference resPr = GetPanelRef(pName);
                if (resPr != null)
                {
                    return resPr.mDocument;
                }
                else
                {
                    Debug.LogError("GetPanelRef failed for " + pName);
                }
                return null;
            }

            public PanelReference GetPanelRef(string pName)
            {
                PanelReference resPr = null;
                holder.TryGetValue(pName, out resPr);
                return resPr;
            }
        }

        WorldUI mainPanel = null;
        PanelHolder panelHolder = new PanelHolder();



        public WorldUI SpawnMainPanel(GameObject parent, string content, bool isUrl)
        {
            if (mainPanel == null)
            {
                //mainPanel = new WorldUI(Runtime.Statics.MAIN_PANEL_KEY);
                mainPanel = CreateExternalPanel(parent, Vector3.zero, Vector3.zero, Vector3.one,
                    RR.Statics.MAIN_PANEL_KEY, 1920, 1080, content,
                    isUrl, false, true, false, Vector2.zero, 9000, true); //was 3000 //6000 //12000=16cm //9000
            }
            return mainPanel;
        }

        public void LoadUrl(string url, string pName = RR.Statics.MAIN_PANEL_KEY)
        {
            try
            {
                GetDocument(pName).location.href = url;
            }
            catch (Exception e)
            {

            }
        }

        public HtmlDocument GetDocument(string pName)
        {
            PanelReference resPr = panelHolder.GetPanelRef(pName);
            if (resPr != null)
            {
                return resPr.mDocument;
            }
            else
            {
                Debug.LogError("GetPanelRef failed for " + pName);
            }
            return null;
        }

        public WorldUI CreateNotification(float durationSec, Vector3 parentOffset, GameObject parent, string msg)
        {
            var wu = new WorldUI(512, 512);
            if (wu == null)
            {
                Debug.LogError("UM CreateExternalPanel wu is null!!!");
            }

            wu.PixelPerfect = false;
            if (parent != null)
            {
                wu.transform.parent = parent.transform;
            }

            //wu.transform.localScale = objectScale;
            wu.AcceptInput = false;
            wu.InvertResolve = true;
            wu.AlwaysFaceCamera = false;
            wu.SetDepthResolution(1f);
            //was on
            wu.Flat = true;

            //orig
            wu.transform.localPosition = Vector3.zero;
            wu.transform.localRotation = Quaternion.identity;
            wu.transform.localPosition = parentOffset;

            //wu.RenderMode = Css.RenderMode.NoAtlas;
            wu.SetResolution(1000);
            wu.UpdateResolution();

            wu.document.innerHTML = "<div style=\"border: solid white 2px; color:white;\">" + msg + "</div>";
            wu.ExpiresIn = durationSec;
            wu.Expires = true;

            //AppManager.Instance.GetObjectKeeper().AddGoRefByName(pName);
            //AppManager.Instance.GetObjectKeeper().MakeActive(pName, startActive, 0.1f);
            return wu;
        }

        public IEnumerator RunNext(HtmlDocument d, string fctName, string[] args)
        {
            yield return new WaitForSeconds(1f + UnityEngine.Random.Range(2f,15f));
            try
            {
                //string argsStr = "";
                //foreach (var arg in args)
                //    argsStr += "|" + arg;
                //Debug.Log("RunNext running " + fctName + " with " + argsStr + "...");
                if (d != null && fctName.Length > 0)
                {
                    d?.Run(fctName, args);
                }
            } catch(Exception err)
            {
                Debug.Log("RunNext ERROR => " + err);
            }
        }

        // ADDED From Danijela
        public WorldUI CreatePanel(string name, GameObject parent, Vector3 parentOffsetT, Vector3 parentOffsetR, string url, string fctName, string[] args)
        {
            var pr = panelHolder?.GetPanelRef(name);

            if (pr != null)
            {
                panelHolder.DeletePanelRef(name);
            }

            int s = 1920;
            int w = 1920;
            int h = 1400;

            PowerUI.WorldUI wu = new PowerUI.WorldUI(name, w, h) { PixelPerfect = false };
            wu.document.location.href = url;
            //wu.document.location.href = "http://192.168.2.124/HtmlUI/test.html";

            //wu.pixelWidth = w;
            //wu.pixelHeight = h;

            wu.PixelPerfect = false;
            wu.AcceptInput = true;
            wu.InvertResolve = true;

            //wui.WorldPerPixel = (int) (500f / 0.2f); 
            //wui.WorldScreenSize = new Vector2(0.3f, 0.3f);
            int res = (int)(w / 0.15f); //0.25 //was 0.35
            wu.SetDepthResolution(1f);
            //wu.SetDimensions(w, h);
            wu.SetResolution(res);
            wu.UpdateResolution();
            //wu.Update();

            string argsStr = "";
            foreach (var arg in args)
                argsStr += "|" + arg;
            Debug.Log("CreatePanel before calling RunNext with " + wu.Name + ", " + fctName + ", " + argsStr);
            StartCoroutine(RunNext(wu.document, fctName, args));

            if (parent != null)
                wu.transform.parent = parent.transform;

            wu.transform.localPosition = parentOffsetT;
            
            wu.transform.rotation = Quaternion.Euler(Camera.main.transform.forward);
            PanelReference npr = new PanelReference
            {
                mName = name,
                mObj = wu.transform.gameObject,
                mWorldUI = wu,
                mDocument = wu.document,
                mIsFlat = false
            };
            panelHolder?.AddOrUpdate(npr, true);
            return wu;
        }

        public WorldUI CreateExternalPanel(GameObject parent,
                Vector3 parentOffsetT, Vector3 parentOffsetR, Vector3 objectScale,
                string pName, int width, int height, string content, bool isUrl, bool alwaysFaceCamera,
                bool allowInput, bool pixelPerfect, Vector2 origin, int pixelPerWorldUnit,
                bool startActive)
        {
            Debug.Log("UM CreateExternalPanel for " + parent.name + "|" + parent.transform.position + "| => " + pName);
            try
            {
                var pr = panelHolder?.GetPanelRef(pName);

                if (pr != null)
                {
                    panelHolder.DeletePanelRef(pName);
                }

                var wu = new WorldUI(pName, width, height);
                if (wu == null)
                {
                    Debug.LogError("UM CreateExternalPanel wu is null!!!");
                }

                wu.PixelPerfect = pixelPerfect;
                wu.transform.parent = parent.transform;

                //wu.transform.localScale = objectScale;
                wu.AcceptInput = allowInput;
                wu.InvertResolve = true;

                wu.AlwaysFaceCamera = alwaysFaceCamera;

                wu.SetDepthResolution(1f);
                //was on
                wu.Flat = false; //was true

                //orig
                wu.transform.localPosition = Vector3.zero;
                wu.transform.localRotation = Quaternion.identity;
                wu.transform.Rotate(parentOffsetR);
                wu.transform.localPosition = parentOffsetT;

                //wu.RenderMode = Css.RenderMode.NoAtlas;
                wu.SetResolution(pixelPerWorldUnit);
                wu.UpdateResolution();

                PanelReference npr = new PanelReference
                {
                    mName = pName,
                    mObj = wu.transform.gameObject,
                    mWorldUI = wu,
                    mDocument = wu.document,
                    mIsFlat = false
                };

                if (isUrl)
                {
                    wu.document.location.href = content;
                }
                else
                {
                    wu.document.innerHTML = content;
                }

                panelHolder?.AddOrUpdate(npr, true);

                //AppManager.Instance.GetObjectKeeper().AddGoRefByName(pName);
                //AppManager.Instance.GetObjectKeeper().MakeActive(pName, startActive, 0.1f);
                return wu;
            }
            catch (Exception e)
            {
                Debug.LogError("UM CreateExternalPanel ERROR => " + e.Message);
            }
            return null;
        }


    }

}

#if false
namespace Vizario
{
    namespace VApp
    {
        public class HtmlUIManager
        {
            private class PanelReference
            {
                public string mName;
                public GameObject mObj;
                public WorldUI mWorldUI;
                public HtmlDocument mDocument;
                public bool mIsFlat;
            }

            private class PanelHolder
            {
                Dictionary<string, PanelReference> holder;
                public PanelHolder()
                {
                    holder = new Dictionary<string, PanelReference>();
                }

                ~PanelHolder()
                {
                    foreach (var v in holder.Values)
                    {
                        if (v.mObj != null)
                        {
                            Destroy(v.mObj);
                            v.mObj = null;
                        }
                    }
                    holder.Clear();
                    holder = null;
                }

                public void AddOrUpdate(PanelReference pr, bool destroyOnUpdate)
                {
                    PanelReference resPr = null;
                    if (holder.TryGetValue(pr.mName, out resPr))
                    {
                        if (destroyOnUpdate)
                        {
                            Destroy(resPr.mObj);
                            resPr.mObj = null;
                        }
                        resPr = pr;
#if VZ_DEBUG
                        Debug.LogError(GetType() + " AddOrUpdate failed for " + pr.mName + ", updating");
#endif
                    }
                    else
                    {
#if VZ_DEBUG
                        Debug.LogError(GetType() + " AddOrUpdate adding " + pr.mName);
#endif
                        holder.Add(pr.mName, pr);
                    }
                }

                public void DeletePanelRef(string pName)
                {
                    PanelReference resPr = null;
                    if (holder.TryGetValue(pName, out resPr))
                    {

                        Destroy(resPr.mObj);
                        resPr.mObj = null;
                    }
                    holder.Remove(pName);
                }

                public HtmlDocument GetDocument(string pName)
                {
                    PanelReference resPr = GetPanelRef(pName);
                    if (resPr != null)
                    {
                        return resPr.mDocument;
                    }
                    else
                    {
                        Debug.LogError("GetPanelRef failed for " + pName);
                    }
                    return null;
                }

                public PanelReference GetPanelRef(string pName)
                {
                    PanelReference resPr = null;
                    holder.TryGetValue(pName, out resPr);
                    return resPr;
                }
            }

            
            PanelHolder panelHolder = new PanelHolder();

            private UIMode uiMode = UIMode.FLAT;

            HtmlDocument document = null;

            IAppManager appManager = null;

            HtmlDocument cursorDocument;
            WorldUI cursorObj;

            private Dictionary<string, Coroutine> coRoutineHolder = new Dictionary<string, Coroutine>();

            private IAppManager GetAppManager()
            {
                if (appManager == null)
                    appManager = AppManager.Instance;
                return appManager;
            }

            public void Log(string msg)
            {

            }

            private void InitCursor()
            {

                if (cursorDocument == null || cursorObj == null)
                {
                    string cursorHtml =
                    "<body style=\"background: none;\"><img width=\"50\" height=\"50\" src=\"cursor.png\"></img></body>";
                    var wu = new WorldUI("VCursor", 100, 100);
                    wu.PixelPerfect = false;
                    wu.AcceptInput = false;
                    wu.transform.parent = Camera.main.transform;
                    wu.transform.localScale = Vector3.one;
                    wu.transform.rotation = Quaternion.identity;
                    wu.transform.localPosition = new Vector3(0, 0, 2f);
                    wu.AlwaysFaceCamera = false;
                    wu.Flat = true;
                    wu.SetResolution(5000);
                    wu.document.innerHTML = cursorHtml;
                    cursorDocument = wu.document;
                    cursorObj = wu;
                }

            }

            public void SetCursor(string content, bool isUrl)
            {
                if (cursorDocument == null || cursorObj == null)
                {
                    InitCursor();
                }

                if (isUrl)
                {
                    cursorDocument.location.href = content;
                }
                else
                {
                    cursorDocument.innerHTML = content;
                }
            }

            private Dom.Element GetElementById(string id, string pName = Statics.MAIN_PANEL_KEY)
            {
                try
                {
                    if (GetDocument(pName) != null)
                    {
                        return GetDocument(pName).getElementById(id);
                    }
                    else
                    {
                        //GetAppManager().LogError("HtmlUIManager::GetElementById GetDocument == null");
                    }
                }
                catch (Exception e)
                {
                    GetAppManager().LogException(e);
                }
                return null;
            }

            private string NiceMsg(string msg)
            {
                return DateTime.Now.ToLocalTime().ToString("T") + "|" + msg;
            }

            // Use this for initialization
            void Start()
            {
                PowerUI.Http.Web.MaxSimultaneousRequests = 6;
                //InitCursor();
            }

            public HtmlDocument GetDocument(string pName = Statics.MAIN_PANEL_KEY)
            {

                var d = panelHolder?.GetDocument(pName);
                if (d != null)
                {
                    //Debug.LogError("HtmlUIManager GetDocument found for " + pName);
                    return d;
                }
                else
                {
                    //Debug.LogError("HtmlUIManager GetDocument NOT found for " + pName);

                    if (pName == Statics.MAIN_PANEL_KEY)
                    {
                        if (uiMode == UIMode.FLAT)
                        {
                            PanelReference pr = new PanelReference
                            {
                                mName = Statics.MAIN_PANEL_KEY,
                                mObj = null,
                                mWorldUI = null,
                                mDocument = UI.document,
                                mIsFlat = true
                            };
                            panelHolder?.AddOrUpdate(pr, false);
                            document = UI.document;
                            d = UI.document;
                            //Debug.LogError("HtmlUIManager GetDocument FLAT added ref for " + pName);
                        }
                        else if (uiMode == UIMode.AR_GLASS)
                        {
                            var g = GameObject.FindGameObjectWithTag("HtmlPlane");
                            if (g != null)
                            {
                                var h = g.GetComponent<HtmlUIPanel>();
                                if (h != null)
                                {

                                    PanelReference pr = new PanelReference
                                    {
                                        mName = Statics.MAIN_PANEL_KEY,
                                        mObj = null,
                                        mWorldUI = null,
                                        mDocument = h.document,
                                        mIsFlat = true
                                    };
                                    panelHolder?.AddOrUpdate(pr, false);
                                    document = h.document;
                                    d = h.document;
                                    //Debug.LogError("HtmlUIManager GetDocument AR_GLASS added ref for " + pName);

                                    if (document == null)
                                    {
                                        GetAppManager().LogError("document is null");
                                    }
                                }
                                else
                                {
                                    GetAppManager().LogError("HtmlUIPanel not found");
                                }
                            }
                            else
                            {
                                GetAppManager().LogError("HtmlPlane tag no found!");
                                PanelReference pr = new PanelReference
                                {
                                    mName = Statics.MAIN_PANEL_KEY,
                                    mObj = null,
                                    mWorldUI = null,
                                    mDocument = UI.document,
                                    mIsFlat = true
                                };
                                panelHolder?.AddOrUpdate(pr, false);
                                document = UI.document;
                                d = UI.document;
                            }
                        }
                    }
                    else
                    {
                        Debug.LogError("HtmlUIManager GetDocument pName not in list and NOT Main => " + pName);
                    }
                }
                return d;
            }

            // Update is called once per frame
            void Update()
            {

            }

            public void SetMode(UIMode m)
            {
                uiMode = m;
            }

            public string GetMode()
            {
                return uiMode.ToString();
            }

            public void NotifyIncomingCall(string caller)
            {
                if (GetDocument() != null)
                {
                    GetDocument().Run("VZApp_NotifyIncomingCall", caller); //move this to a stored procedure map
                }
            }

            public void NotifyTrackingTargetChanged(string notifiyFctName, string mName, int mId)
            {
                Debug.LogError("NotifyTrackingTargetChanged calling => " + notifiyFctName);
                GetDocument().Run(notifiyFctName, mName, mId);
            }

            public void SetVideoRenderInput(Texture2D videoTexture, string pName = Statics.MAIN_PANEL_KEY)
            {
                try
                {
                    if (GetDocument(pName) != null)
                    {
                        var myElement = GetDocument(pName).getById("idCallWindow_RENDERING");
                        if (myElement != null)
                        {
                            if (true)
                            {
                                myElement.image = videoTexture;
                            }
                        }
                        else
                        {
                            GetAppManager().LogError("SetVideoRenderInput idCallWindow_RENDERING not found");
                        }
                    }
                    else
                    {
                        GetAppManager().LogError("SetVideoRenderInput GetDocument failed");
                    }
                }
                catch (Exception e)
                {
                    GetAppManager().LogError("SetVideoRenderInput ERROR => " + e.Message);
                }
            }

            public void SetVideoPlayTime(int secs, int mins, int hours, string pName = Statics.MAIN_PANEL_KEY)
            {
                if (GetDocument(pName) != null)
                {
                    var myElement = GetDocument(pName).getById("idCallWindow_PLAYTIME");
                    if (myElement != null)
                    {
                        myElement.innerHTML = "" + ((hours > 0) ? "" + hours + ":" : "") + mins + ":" + secs;
                    }
                }
            }

            public void OpenFilePicker(string defaultPath, string filterExtension, PickedFileReady FileReady)
            {
#if WINDOWS_UWP

                var fExt = filterExtension;
                if (filterExtension.Length == 0)
                    fExt = "*";

                UnityEngine.WSA.Application.InvokeOnUIThread(async () =>
                {
                    try
                    {
                        var filePicker = new Windows.Storage.Pickers.FileOpenPicker();
                        filePicker.FileTypeFilter.Clear();
                        filePicker.FileTypeFilter.Add(fExt);
                        var file = await filePicker.PickSingleFileAsync();

                        Windows.Storage.FileProperties.BasicProperties basicProperties =
                            await file.GetBasicPropertiesAsync();
                        var fSize = basicProperties.Size;

                        Windows.Storage.Streams.IRandomAccessStream gifStream =
                            await file.OpenAsync(Windows.Storage.FileAccessMode.Read);

                        var reader = new Windows.Storage.Streams.DataReader(gifStream.GetInputStreamAt(0));
                        var bytes = new byte[fSize];
                        await reader.LoadAsync((uint)fSize);
                        reader.ReadBytes(bytes);


                        FileReady?.Invoke(file.Path, bytes);
                    }
                    catch (Exception e)
                    {
                        GetAppManager().LogError("An error occured while picking a file!");
                        GetAppManager().LogException(e);
                    }
                }, false);
#endif
            }

            public void ShowCallWindow(string peerguid)
            {
                document.Run("VZApp_ShowCallWindow", peerguid);
            }

            public string GetUiCode(string pName = Statics.MAIN_PANEL_KEY)
            {
                return GetDocument(pName).innerHTML;
            }

            public void SetRemoteUI(string code)
            {
                //TODO implement this

                // what to do?
                // get Id of iframe field and set code into iframe field
                //throw new NotImplementedException();
            }

            public void SetConnectionState(UIConnectionState connectionState)
            {
                int id = 0;
                switch (connectionState)
                {
                    case UIConnectionState.DISCONNECTED:
                        id = 0;
                        break;
                    case UIConnectionState.CONNECTING:
                        id = 1;
                        break;
                    case UIConnectionState.CONNECTED:
                        id = 2;
                        break;
                }
                try
                {
                    GetDocument().Run("VZApp_SetConnectionState", id);
                }
                catch (Exception e)
                {
                    GetAppManager().LogError(GetType() + " SetConnectionState ERROR=> " + e.Message);
                }
            }

            public void RunJsCmd(string cmd, string[] args, string pName = Statics.MAIN_PANEL_KEY)
            {
                try
                {
                    //Debug.LogError(GetType() + "::RunJsCmd => " + cmd + "|" + args + "|" + pName);
                    GetDocument(pName).Run(cmd, args);
                }
                catch (Exception e)
                {
                    GetAppManager().LogError(GetType() + " RunJsCmd ERROR=> " + cmd + "|" + args.ToString() + " => " + e.Message);
                }
            }

            public void LoadUrl(string url, string pName = Statics.MAIN_PANEL_KEY)
            {
                try
                {
                    GetDocument(pName).location.href = url;
                }
                catch (Exception e)
                {
                    GetAppManager().LogError(GetType() + " LoadUrl ERROR=> " + e.Message);
                }
            }

            public void SetInterval(string fctName, int msStartDelay, int msInterval, string pName = Statics.MAIN_PANEL_KEY)
            {
                StartCoroutine(SetIntervalRunner(fctName, msStartDelay, msInterval, pName));
            }

            private IEnumerator SetIntervalRunner(string fctName, int msStartDelay, int msInterval, string pName = Statics.MAIN_PANEL_KEY)
            {
                float startDelay = (float)msStartDelay / 1000f;
                float intervalDelay = (float)msInterval / 1000f;
                yield return new WaitForSeconds(startDelay);
                while (true)
                {
                    RunJsCmd(fctName, null, pName);
                    yield return new WaitForSeconds(intervalDelay);
                }
            }

            public void SetInterval2(string fctName, int msStartDelay, int msInterval, string payload, string pName = Statics.MAIN_PANEL_KEY)
            {
                //UI.RenderMode = Css.RenderMode.NoAtlas;
                if (!coRoutineHolder.ContainsKey(fctName + pName))
                {
                    var c = StartCoroutine(SetIntervalRunner2(fctName, msStartDelay, msInterval, payload, pName));
                    coRoutineHolder.Add(fctName + pName, c);
                }
            }

            public void StopInterval(string fctName, string pName = Statics.MAIN_PANEL_KEY)
            {
                var key = fctName + pName;
                Coroutine c = null;
                if(coRoutineHolder.TryGetValue(key, out c))
                {
                    StopCoroutine(c);
                    c = null;
                    coRoutineHolder.Remove(key);
                }
            }

            private IEnumerator SetIntervalRunner2(string fctName, int msStartDelay, int msInterval, string payload, string pName = Statics.MAIN_PANEL_KEY)
            {
                float startDelay = (float)msStartDelay / 1000f;
                float intervalDelay = (float)msInterval / 1000f;
                yield return new WaitForSeconds(startDelay);
                while (true)
                {
                    if (false)
                    {
                        MainEventDispatcher.Instance.PushEvent(() => {
                            string[] args = { payload };
                            RunJsCmd(fctName, args, pName);
                        });
                    }
                    else
                    {
                        string[] args = { payload };
                        RunJsCmd(fctName, args, pName);
                    }
                    yield return new WaitForSeconds(intervalDelay);
                    //yield return new WaitForSecondsRealtime(intervalDelay);
                    //yield return new WaitForEndOfFrame();
                }
            }


            public void ShowWindow(string id, bool hideOthers, string pName = Statics.MAIN_PANEL_KEY)
            {
                if (hideOthers)
                {
                    GetDocument(pName).Run("HideAllMJ", null);
                }
                string[] args = { id };
                GetDocument(pName).Run("ShowWindow", args);
            }

            public void ShowImage(Texture2D tx, string title, int ts = 0, string pName = Statics.MAIN_PANEL_KEY)
            {
                try
                {
                    var elem = GetDocument(pName).getById("idImageVisWindow_RENDERING");
                    if (elem != null)
                    {
                        string[] args = new string[] { "idImageVisWindow_TITLE", title + ((ts > 0) ? " @ sec " + ts.ToString() : "") };
                        RunJsCmd("VZHelper_SetInnerHtml", args, pName);

                        string[] argsTs = new string[] { ts.ToString() };
                        RunJsCmd("VZApp_SetVideoCaptureTs", argsTs, pName);

                        float w = tx.width;
                        float h = tx.height;
                        float sw = 0;
                        float sh = 0;

                        if (w > h)
                        {
                            sw = 300;
                            sh = sw * (h / w);
                        }
                        else
                        {
                            sh = 300;
                            sw = sh * (w / h);
                        }

                        int setW = (int)sw, setH = (int)sh;

                        elem.style.width = "" + setW + "px";
                        elem.style.height = "" + setH + "px";

                        elem.style.maxWidth = "" + setW + "px";
                        elem.style.maxHeight = "" + setH + "px";

                        elem.image = tx;
                        GetDocument(pName).Run("VZHelper_ShowWindow", "idImageVisWindow");
                    }
                }
                catch (Exception e)
                {
                    Debug.LogError("ShowImage ERROR => " + e.Message);
                }
            }

            public void Draw(string id, int x, int y, string pName = Statics.MAIN_PANEL_KEY)
            {
                try
                {
                    var elem = GetDocument(pName).getById(id);
                    if (elem != null)
                    {
                        Color[] cols = new Color[36];
                        for (int i = 0; i < 36; i++)
                        {
                            cols[i] = Color.red;
                        }

                        var tx = elem.image as Texture2D;

                        var fy = y;
                        if (y < 0)
                        {
                            fy = tx.height + y;
                        }

                        tx.SetPixels(x, fy, 6, 6, cols);
                        //tx.SetPixel(x, y, Color.red);
                        tx.Apply();
                    }
                }
                catch (Exception e)
                {
                    GetAppManager().LogException(e);
                }
            }

            public Texture2D GetImage(string id, string pName = Statics.MAIN_PANEL_KEY)
            {
                Texture2D retTx = null;
                /*
                if (false && TxCache.TryGetValue(id, out retTx))
                {
                    //TODO do something useful here
                }
                else
                */
                {
                    var elem = GetDocument(pName).getById(id);
                    if (elem != null)
                    {
                        retTx = elem.image as Texture2D;
                    }
                }
                return retTx;
            }

            public void SetUiImage(string id, Texture2D data, string pName = Statics.MAIN_PANEL_KEY)
            {
                Debug.LogError("SetUiImage id=" + id + ", panel=" + pName);
                try
                {
                    var elem = GetDocument(pName).getById(id);
                    if (elem != null)
                    {
                        elem.image = data;
                        //elem.style.width = "" + 450 + "px";
                        //elem.style.height = "" + 450 + "px";
                        elem.style.width = "450px";
                        elem.style.height = "auto";
                        GetAppManager().LogError("SetUiImage => " + data.width + " x " + data.height);
                    }
                    else
                    {
                        Debug.LogError("SetUiImage ElemNotFound " + pName + "|" + id);
                    }
                }
                catch (Exception e)
                {
                    Debug.LogError("SetUiImage exception caught: " + e.ToString());
                }
            }

            public void SetUiImageAutoSize(string id, Texture2D data, string pName = Statics.MAIN_PANEL_KEY)
            {
                var elem = GetDocument(pName).getById(id);
                if (elem != null)
                {
                    elem.image = data;
                    elem.style.height = "auto";
                    GetAppManager().LogError("SetUiImageWithSize => " + data.width + " x " + data.height);
                }
                else
                {
                    Debug.LogError("SetUiImage ElemNotFound " + pName + "|" + id);
                }
            }

            public string CreateVideoPreview(string prevId, string headline)
            {
                string imgId = (prevId.Length > 0) ? prevId : "idBARCODE_IMG";
                string c = "";
                c += "<div>";
                /*c += "<p style=\"font-size: 30px;color: green;\">" + headline + "</p>";*/
                c += "<img  id=\"" + imgId + "\" src=\"\" style=\"on-atlas:0; transform:scaleY(-1);border: solid white 2px;\">";
                c += "</div>";
                return c;
            }

            public void ReplaceContent(string content, string pName = Statics.MAIN_PANEL_KEY)
            {
                Debug.LogError("ReplaceContent called for " + pName);
                GetDocument(pName).body.innerHTML = content;
            }

            public void CreateExternalPanel(GameObject parent,
                Vector3 parentOffsetT, Vector3 parentOffsetR, Vector3 objectScale,
                string pName, int width, int height, string content, bool isUrl, bool alwaysFaceCamera,
                bool allowInput, bool pixelPerfect, Vector2 origin, int pixelPerWorldUnit,
                bool startActive)
            {

#if VZ_DEBUG
                Debug.LogError("UM CreateExternalPanel for " + parent.name + "|" + parent.transform.position + "| => " + pName);
#endif
                try
                {
                    var pr = panelHolder?.GetPanelRef(pName);

                    if (pr != null)
                    {
                        panelHolder.DeletePanelRef(pName);
                    }

                    //var fu = new FlatWorldUI("FlatUI", width, height);
                    //fu.transform.parent = parent.transform;
                    //fu.document.innerHTML = "THIS IS flat world ui";


                    //var wu = new FlatWorldUI(pName, width, height);
                    var wu = new WorldUI(pName, width, height);
                    
                    if (wu == null)
                    {
                        Debug.LogError("UM CreateExternalPanel wu is null!!!");
                    }

                    wu.PixelPerfect = pixelPerfect;
                    wu.transform.parent = parent.transform;

                    //wu.transform.localScale = objectScale;
                    wu.AcceptInput = allowInput;
                    wu.InvertResolve = true;
                    
                    wu.AlwaysFaceCamera = alwaysFaceCamera;
                    
                    wu.SetDepthResolution(0.0001f);
                    //was on
                    //wu.SetOrigin(origin.x, origin.y);
                    wu.Flat = true;
#if true
                    //orig
                    wu.transform.localPosition = Vector3.zero;
                    wu.transform.localRotation = Quaternion.identity;
                    wu.transform.Rotate(parentOffsetR);
                    wu.transform.localPosition = parentOffsetT;
#else
                    //using wrapper go
                    var wu_wrap = new GameObject();
                    wu_wrap.transform.parent = parent.transform;
                    wu_wrap.transform.localPosition = Vector3.zero;
                    wu_wrap.transform.localRotation = Quaternion.identity;
                    //was on
                    //wu_wrap.transform.Rotate(parentOffsetR);
                    wu_wrap.transform.localPosition = parentOffsetT;
                    wu.transform.parent = wu_wrap.transform;
                    wu.transform.localPosition = Vector3.zero;
                    wu.transform.localRotation = Quaternion.identity;
#endif
                    //wu.RenderMode = Css.RenderMode.NoAtlas;

                    wu.SetResolution(pixelPerWorldUnit);
                    wu.UpdateResolution();

                    PanelReference npr = new PanelReference
                    {
                        mName = pName,
                        mObj = wu.transform.gameObject,
                        mWorldUI = wu,
                        mDocument = wu.document,
                        mIsFlat = true
                    };

                    if (isUrl)
                    {
                        wu.document.location.href = content;
                    }
                    else
                    {
                        wu.document.innerHTML = content;
                    }
                    
                    panelHolder?.AddOrUpdate(npr, true);

                    AppManager.Instance.GetObjectKeeper().AddGoRefByName(pName);
                    AppManager.Instance.GetObjectKeeper().MakeActive(pName, startActive, 0.1f);
                }
                catch (Exception e)
                {
                    Debug.LogError("UM CreateExternalPanel ERROR => " + e.Message);
                }
            }

            //TODO ADD List of received items
            //TODO ADD List of open documents
            //TODO add map of open pdf to implement paging
            private Dictionary<string, PdfContainer> pdfTable = new Dictionary<string, PdfContainer>();
            private class PdfContainer
            {
                public string name = "";
                public string elementId = "";
                public string pName = "";
                public int currentPage = 0;
                public PDFDocument pdfD = null;
            }

            public void LoadPdfOnElementFromString(string pdfName, string content,
                string password, int startPageNum, string targetElementId,
                string pName = Statics.MAIN_PANEL_KEY)
            {
                var bytes = System.Text.Encoding.UTF8.GetBytes(content);
                LoadPdfOnElement(pdfName, bytes,
                 password, startPageNum, targetElementId,
                 pName);
            }

            private PdfContainer InitPdfContainer(string pdfName, string pName, int currentPage, string targetElementId)
            {
                if (pdfTable == null)
                {
                    pdfTable = new Dictionary<string, PdfContainer>();
                }

                PdfContainer pdfC = null;
                if (pdfTable.TryGetValue(pdfName, out pdfC) == false)
                {
                    pdfC = new PdfContainer();
                    pdfTable.Add(pdfName, pdfC);
#if VZ_DEBUG
                    Debug.LogError("LoadPdfOnElement added PdfContatiner -> " + pdfName);
#endif

                }
                pdfC.name = pdfName;
                pdfC.pName = pName;
                pdfC.currentPage = 0;
                pdfC.elementId = targetElementId;

                return pdfC;
            }

            private void ApplyPdf(PdfContainer pdfC)
            {
                if (pdfC.pdfD.IsValid)
                {
                    int pageCount = pdfC.pdfD.GetPageCount();
                    int pageToRender = 0;
                    var pdfR = pdfC.pdfD.Renderer;
                    //var pdfR = new Paroxe.PdfRenderer.PDFRenderer();
                    var pdfTx = pdfR.RenderPageToTexture(
                        pdfC.pdfD.GetPage(pageToRender % pageCount));
                    pdfTx.filterMode = FilterMode.Bilinear;
                    pdfTx.anisoLevel = 8;
                    //SetUiImage(pdfC.elementId, pdfTx, pName);
                    SetUiImageAutoSize(pdfC.elementId, pdfTx, pdfC.pName);
                }
            }


            public void LoadPdfOnElement(string pdfName, byte[] content,
                string password, int startPageNum, string targetElementId,
                string pName = Statics.MAIN_PANEL_KEY)
            {
                /*
                if (pdfTable == null)
                {
                    pdfTable = new Dictionary<string, PdfContainer>();
                }

                PdfContainer pdfC = null;
                if (pdfTable.TryGetValue(pdfName, out pdfC) == false)
                {
                    pdfC = new PdfContainer();
                    pdfTable.Add(pdfName, pdfC);
#if VZ_DEBUG
                    Debug.LogError("LoadPdfOnElement added PdfContatiner -> " + pdfName);
#endif
                }
                

                pdfC.name = pdfName;
                pdfC.pName = pName;
                pdfC.currentPage = 0;
                pdfC.elementId = targetElementId;
                */

                var pdfC = InitPdfContainer(pdfName, pName, startPageNum, targetElementId);

                if (pdfC.pdfD != null)
                {
                    pdfC.pdfD.Dispose();
                    GC.Collect();
                }
                pdfC.pdfD = new PDFDocument(content, password);


                /*
                if (pdfC.pdfD.IsValid)
                {
                    int pageCount = pdfC.pdfD.GetPageCount();
                    int pageToRender = 0;
                    var pdfR = pdfC.pdfD.Renderer;
                    //var pdfR = new Paroxe.PdfRenderer.PDFRenderer();
                    var pdfTx = pdfR.RenderPageToTexture(
                        pdfC.pdfD.GetPage(pageToRender % pageCount));
                    pdfTx.filterMode = FilterMode.Bilinear;
                    pdfTx.anisoLevel = 8;
                    //SetUiImage(pdfC.elementId, pdfTx, pName);
                    SetUiImageAutoSize(pdfC.elementId, pdfTx, pdfC.pName);
                }
                */
                ApplyPdf(pdfC);
            }

            public void LoadPdfOnElementWeb(string pdfName, string url,
                string password, int startPageNum, string targetElementId,
                string pName = "Main")
            {
                var pdfC = InitPdfContainer(pdfName, pName, startPageNum, targetElementId);

                if (pdfC.pdfD != null)
                {
                    pdfC.pdfD.Dispose();
                    GC.Collect();
                }

                StartCoroutine(LoadPdfOnElementWebCoroutine(pdfC, url));
                //var pdfPromise = PDFDocument.LoadDocumentFromUrlAsync(url);
                //pdfC.pdfD = pdfPromise.Result;
            }

            private IEnumerator LoadPdfOnElementWebCoroutine(PdfContainer pdfC, string url)
            {
                var pdfPromise = PDFDocument.LoadDocumentFromUrlAsync(url);

                while(!pdfPromise.HasFinished)
                {
                    Debug.Log("LoadPdfOnElementWebCoroutine loading ... pdfPromise.HasFinished=" + pdfPromise.HasFinished);
                    yield return new WaitForSeconds(1f);
                }
                pdfC.pdfD = pdfPromise.Result;
                yield return new WaitForSeconds(2f);
                ApplyPdf(pdfC);
                yield return null;
            }

            public void PdfNextPage(string pdfName, bool up)
            {
                try
                {
                    if (pdfTable != null)
                    {
                        PdfContainer pdfC = null;
                        if (pdfTable.TryGetValue(pdfName, out pdfC))
                        {
                            //TODO Here is some sort of bug
                            var pN = pdfC.pdfD.GetPageCount();
                            int pAdd = (up == true) ? 1 : -1;
                            int pC = (pdfC.currentPage < 0) ? 0 : pdfC.currentPage;
                            pdfC.currentPage = (pC + pAdd) % pN;

#if VZ_DEBUG
                            Debug.LogError("PdfNextPage " +
                                ", pN=" + pN +
                                ", pAdd=" + pAdd +
                                ", pC=" + pC + "," +
                                ", pdfC.currentPage=" + pdfC.currentPage);
#endif
                            var tx = pdfC.pdfD.Renderer.RenderPageToTexture(
                                pdfC.pdfD.GetPage(pdfC.currentPage));
                            SetUiImageAutoSize(pdfC.elementId, tx, pdfC.pName);
                        }
                        else
                        {
                            Debug.LogError("PdfNextPage ERROR pdfName not Found - " + pdfName);
                        }
                    }
                    else
                    {
                        Debug.LogError("PdfNextPage ERROR pdfTable is null");
                    }
                }
                catch (Exception e)
                {
                    GetAppManager().LogError("PdfNextPage ERROR => " + e.Message);
                }
            }
        }
    }
}
#endif