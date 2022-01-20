/// 2020 By Philipp Fleck

/**
 * A Runtime object
 * @typedef {Object} RT
 * @type {Help} [Help]             - text text
 */

/**
 * @typedef {Object} Help
 * @property {function(string): void} [log]     - Set [log](v){...}      'accessor descriptor' only
 */

/**
 * A unity GameObject
 * @typedef {Object} GameObject
*/

/**
 * A unity PowerUI.WorldUI
 * @typedef {Object} WorldUI
*/

var RT = {};
RT.Help = {};
RT.Web = {};
RT.MQTT = {};
RT.WA = {};
RT.Unity = {};
RT.Reg = {};
RT.VIS = {};
RT.MRTK = {};
RT.IATK = {};

RT.Help.TestMsg = internal_TestMsg;
RT.Help.Log = internal_Log;
RT.Help.GetStringFromCfg = internal_GetStringFromCfg;
RT.Help.GetNetwork = internal_GetNetwork;
RT.Help.ReadFile = internal_ReadFile;
RT.Help.WriteFile = internal_WriteFile;
//RT.Help.DashboardJsonUrl = "http://10.0.0.6:3000/api/dashboards/uid/Yq3Gat4Gk";
RT.Help.DashboardJsonUrl = internal_GetStringFromCfg("grafana_dashboard_url");
RT.Help.GetDeviceType = internal_GetDeviceType;
RT.Help.CreateGuid = internal_CreateGuid;

RT.Web.SendWebReq = internal_SendWebReq;
RT.Web.WriteToStore = internal_WriteToStore;
RT.Web.ReadFromStore = internal_ReadFromStore;
RT.Web.SetTiimeout = internal_SetTimeout;
RT.Web.SetInterval = internal_SetInterval;
RT.Web.StopHref = internal_StopHref;
RT.Web.StopHrefAll = internal_StopHrefAll;
RT.Web.AppendFunctionOnClick = internal_AppendFunctionOnClick;
RT.Web.UploadFile = internal_UploadFile;
RT.Web.DownloadFile = internal_DownloadFile;

RT.MQTT.Subscribe = internal_SubscribeMqtt;
RT.MQTT.RegisterCallback = internal_RegisterMqttCallback;
RT.MQTT.RegisterCallbackTopic = internal_RegisterMqttCallbackTopic;
RT.MQTT.UnregisterCallback = internal_UnregisterMqttCallback;
RT.MQTT.UnregisterCallbackFromTopic = internal_UnregisterCallbackFromTopic;
RT.MQTT.SetHost = internal_SetHost;
RT.MQTT.StartClient = internal_StartClient;
RT.MQTT.Publish = internal_PublishMqtt;
RT.MQTT.PublishMod = internal_PublishMqttMod;

RT.WA.AddToGO = internal_AddWorldAnchorToGO;
RT.WA.GetB64FromGo = internal_GetB64WorldAnchorFromGo;
RT.WA.ImportWorldAnchor = internal_ImportWorldAnchor;
RT.WA.ImportWorldAnchorFromKeyStore = internal_ImportWorldAnchorFromKeyStore;

RT.UE = importNamespace("UnityEngine");
RT.Unity.SetParent = internal_SetParent;
RT.Unity.SetLocalPose = internal_SetLocalPose;
RT.Unity.SetPose = internal_SetPose;
RT.Unity.CreateGO = internal_CreateGo;
RT.Unity.CopyGO = internal_CopyGo;
RT.Unity.CopyGoByName = internal_CopyGoByName;
RT.Unity.DestroyGO = internal_DestroyGo;
RT.Unity.GetVisPrefab = internal_GetVisPrefab;
RT.Unity.GetVisPrefabNames = internal_GetVisPrefabNames;
RT.Unity.GetVisPrefabInstance = internal_GetVisPrefabInstance;
RT.Unity.CreateWU = internal_CreateWU;
RT.Unity.CreateBezier = internal_CreateBezier;
RT.Unity.CreateLine = internal_CreateLine;
RT.Unity.SetupSlider = internal_SetupSlider;
RT.Unity.PlayClickSound = internal_PlayClickSound;
RT.Unity.PlayNotificationSound = internal_PlayNotificationSound;
RT.Unity.SpawnNotification = internal_SpawnNotification;
RT.Unity.SpawnAlert = internal_SpawnAlert;

RT.VIS.GetNewChartObject = internal_GetNewChartObject;
RT.VIS.GetNewChartObjectIATK = internal_GetNewChartObjectIATK;
RT.VIS.GetNewChartObjectIATK2 = internal_GetNewChartObjectIATK2;

RT.Reg.Manipulate = internal_Manipulate;
RT.Reg.StartRegistration = internal_StartRegistration;
RT.Reg.RegisterModelTrackedNotification = internal_RegisterModelTrackedNotification;

RT.MRTK.SpawnButton = internal_SpawnButton;
RT.MRTK.SpawnNearMenu = internal_SpawnNearMenu;

RT.IATK.GetReplicator = internal_GetReplicator;
RT.IATK.replicator = null;

function PlayClick() {
    RT.Unity.PlayClickSound();
}

function PlayNotification() {
    RT.Unity.PlayNotificationSound();
}

///
/// Help
///
function internal_TestMsg() {
    console.log("TestMsg called");
    return "export function TestMsg()";
}

/**
 * 
 * @param {string} mKey
 * @returns {string}
 */
function internal_GetStringFromCfg(mKey) {
    console.log("internal_GetStringFromCfg [" + mKey + "] => ... ");
    var val = "";
    try {
        val = importNamespace("RR").Runtime.GetStringFromCfg(mKey);
        console.log("internal_GetStringFromCfg [" + mKey + "] => " + val);
    } catch (err) {
        console.log("internal_GetStringFromCfg [" + mKey + "]ERROR => " + err);
    }
    return val;
}

function internal_GetNetwork() {
    //return "zrga2"
    //return "zrga2-5g";
    //return "NETGEAR81-5G";
    //return "NETGEAR81";
    //return "MBR1200B-3c1"; //cradle point
    return "ASUS_5G";
    if (RT.Help.GetDeviceType() == "EDITOR") {
        //return "zrga2-5g";
        //return "NETGEAR81-5G";
        //return "NETGEAR81";
        return "ASUS_5G";
        //return "MBR1200B-3c1"; //cradle point
    }

    try {
        return importNamespace("RR").Algo.GetNetworkName();
    } catch (err) {
        console.log("internal_GetNetwork ERROR: " + err);
    }
    return "NOTSET";
}

function internal_GetDeviceType() {
    try {
        return importNamespace("RR").Statics.RR_DEVICE;
    } catch (err) {
        console.log("internal_GetDeviceType ERROR: " + err);
    }
    return "NOTSET";
}

function internal_CreateGuid() {
    function _p8(s) {
        var p = (Math.random().toString(16) + "000000000").substr(2, 8);
        return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}

function internal_ReadFile(mFilename) {
    try {
        return importNamespace("RR").Algo.ReadFile2Str(mFilename);
    } catch (err) {
        console.log("internal_ReadFile ERROR: " + err);
    }
}

function internal_WriteFile(mFilename, mData) {
    try {
        return importNamespace("RR").Algo.WriteStr2File(mFilename, mData);
    } catch (err) {
        console.log("internal_WriteFile ERROR: " + err);
    }
}

/**
 * 
 * @param {string} mMsg
 */
function internal_Log(mMsg) {
    console.log(mMsg);
}

///
/// WEB
///
/**
 * Sends web request and calls response function on finish
 * with cResponceFunction(err,data)
 * @param {string} cMethod
 * @param {string} cUrl
 * @param {string[]} cHeaders
 * @param {string} cData
 * @param {function(string, string):void} cResponceFunction
 */
function internal_SendWebReq(cMethod, cUrl, cHeaders, cData, cResponceFunction) {
    console.log("internal_SendWebReq called");
    try {
        importNamespace("Vizario").VApp.jWeb.SendRequest(cMethod, cUrl, cHeaders, cData, cResponceFunction);
    } catch (err) {
        console.log("internal_SendWebReq caused ERROR! => " + err);
    }
}

/**
 * 
 * @param {string} mKey
 * @param {string} mValue
 */
function internal_WriteToStore(mKey, mValue) {
    console.log("internal_WriteToStore called");
    try {
        importNamespace("Vizario").VApp.jWeb.WriteToStore(mKey, mValue);
    } catch (err) {
        console.log("internal_WriteToStore caused ERROR! => " + err);
    }
}

/**
 * 
 * @param {string} mKey
 * @returns {string}
 */
function internal_ReadFromStore(mKey) {
    console.log("internal_ReadFromStore called");
    try {
        return importNamespace("Vizario").VApp.jWeb.ReadFromStore(mKey);
    } catch (err) {
        console.log("internal_ReadFromStore caused ERROR! => " + err);
    }
}

/**
 * 
 * @param {number} mStartDelayMs
 * @param {function():void} mFct
 */
function internal_SetTimeout(mStartDelayMs, mFct) {
    try {
        return importNamespace("Vizario").VApp.jWeb.SetTimeout(mStartDelayMs, mFct);
    } catch (err) {
        console.log("internal_Timeout caused ERROR! => " + err);
    }
}

/**
 * 
 * @param {number} mStartDelayMs
 * @param {number} mIntervalMs
 * @param {function():void} mFct
 */
function internal_SetInterval(mStartDelayMs, mIntervalMs, mFct) {
    try {
        return importNamespace("Vizario").VApp.jWeb.SetInterval(mStartDelayMs, mIntervalMs, mFct);
    } catch (err) {
        console.log("internal_SetInterval caused ERROR! => " + err);
    }
}

function internal_StopHref(event) {
    console.log("internal_StopHref called!");
    if (event != null) {
        event.stopPropagation();
    }
}

function internal_StopHrefAll(mClass) {
    console.log("internal_StopHrefAll for " + mClass);
    try {
        //$("." + mClass).click(internal_StopHref);
        $("." + mClass).attr("onclick", "RT.Web.StopHref(event);");
    } catch (err) {
        console.log("internal_StopHrefAll [" + mClass + "] ERROR => " + err);
    }
}

/**
 * 
 * @param {string} mKey
 * @param {function():void} mFctStr
 */
function internal_AppendFunctionOnClick(mKey, mFctStr) {
    var str_fct = $(mKey).attr("onclick");
    if (str_fct == null) {
        str_fct = "";
    }
    $(mKey).attr("onclick", str_fct + mFctStr);
}

/**
 * cResponceFunction(error, data)
 * @param {string} cMethod
 * @param {string} cUrl
 * @param {string[]} cHeaders
 * @param {string} cFilepath
 * @param {string} cData
 * @param {function(string,string):void} cResponceFunction
 */
function internal_UploadFile(cMethod, cUrl, cHeaders, cFilepath, cData, cResponceFunction) {
    console.log("internal_UploadFile called");
    try {
        importNamespace("Vizario").VApp.jWeb.UploadFile(cMethod, cUrl, cHeaders, cFilepath, cData, cResponceFunction);
    } catch (err) {
        console.log("internal_UploadFile caused ERROR! => " + err);
    }
}

//string method, string url, string[] headers, string filepath, bool append, JSCallback responseCallback
/**
 * 
 * @param {string} cMethod
 * @param {string} cUrl
 * @param {array<string>} cHeaders
 * @param {string} cFilepath
 * @param {bool} cAppend
 * @param {function():void} cResponseFunction
 */
function internal_DownloadFile(cMethod, cUrl, cHeaders, cFilepath, cAppend, cResponseFunction) {
    console.log("internal_DownloadFile called");
    try {
        importNamespace("Vizario").VApp.jWeb.DownloadFile(cMethod, cUrl, cHeaders, cFilepath, cAppend, cResponseFunction);
    } catch (err) {
        console.log("internal_DownloadFile caused ERROR! => " + err);
    }
}

///
/// MQTT
///

/**
 * Subscribes internal mqtt client to topic
 * @param {string} mTopic
 */
function internal_SubscribeMqtt(mTopic) {
    try {
        importNamespace("Vizario").MQTTManager.Subscribe(mTopic);
    } catch (err) {
        console.log("internal_SubscribeMqtt ERROR => " + err);
    }
}

/**
 * 
 * @param {string} mTopic
 * @param {string} mPayload
 */
function internal_PublishMqtt(mTopic, mPayload) {
    try {
        importNamespace("Vizario").MQTTManager.Publish(mTopic, mPayload);
    } catch (err) {
        console.log("internal_PublishMqtt ERROR => " + err);
    }
}

/**
 * 
 * @param {string} mTopic
 * @param {string} mPayload
 * @param {boolean} mLocalOnly
 */
function internal_PublishMqttMod(mTopic, mPayload, mLocalOnly) {
    try {
        importNamespace("Vizario").MQTTManager.PublishMod(mTopic, mPayload, mLocalOnly);
    } catch (err) {
        console.log("internal_PublishMqtt ERROR => " + err);
    }
}
/**
 * Register a callback (topic, payload) for a specific topic
 * to receive mqtt messages
 * @param {function( string:string):void} mFct
 * @param {string} mTopic
 */
function internal_RegisterMqttCallbackTopic(mFct, mTopic) {
    try {
        importNamespace("Vizario").MQTTManager.RegisterCallbackTopic(mFct, mTopic);
    } catch (err) {
        console.log("internal_RegisterMqttCallbackTopic ERROR => " + err);
    }
}

/**
 * * Register a callback (topic, payload) for a all topics
 * to receive mqtt messages
 * @param {function( string:string):void} mFct
 */
function internal_RegisterMqttCallback(mFct) {
    try {
        importNamespace("Vizario").MQTTManager.RegisterCallback(mFct);
    } catch (err) {
        console.log("internal_RegisterMqttCallback ERROR => " + err);
    }
}

/**
 * Can not unregister anonymous lambda
 * @param {function( string:string):void}} mFct
 */
function internal_UnregisterMqttCallback(mFct) {
    try {
        importNamespace("Vizario").MQTTManager.UnregisterCallback(mFct);
    } catch (err) {
        console.log("internal_UnregisterMqttCallback ERROR => " + err);
    }
}

/**
 * Unregisters a specific Callback Function from a topic
 * @param {string} mTopic
 * @param {Function} mRegisteredCallbackFct
 */
function internal_UnregisterCallbackFromTopic(mTopic, mRegisteredCallbackFct) {
    try {
        importNamespace("Vizario").MQTTManager.UnregisterCbFromTopic(mTopic, mRegisteredCallbackFct);
    } catch (err) {
        console.log("internal_UnregisterCallbackFromTopic ERROR => " + err);
    }
}

/**
 * 
 * @param {string} mHost
 * @param {number} mPort
 */
function internal_SetHost(mHost, mPort) {
    try {
        importNamespace("Vizario").MQTTManager.SetHost(mHost, mPort);
    } catch (err) {
        console.log("internal_mPortSetHost ERROR => " + err);
    }
}

function internal_StartClient() {
    try {
        importNamespace("Vizario").MQTTManager.StartClient();
    } catch (err) {
        console.log("internal_mPortSetHost ERROR => " + err);
    }
}

///
/// World Anchors
///
function internal_AddWorldAnchorToGO(mGoName) {
    try {
        importNamespace("Vizario").AnchorManager.AddWorldAnchorToGo(mGoName);
    } catch (err) {
        console.log("internal_AddWorldAnchorToGo ERROR => " + err);
    }
}

function internal_GetB64WorldAnchorFromGo(mGoName, mCbFct) {
    try {
        importNamespace("Vizario").AnchorManager.GetB64WorldAnchorFromGo(mGoName, mCbFct);
    } catch (err) {
        console.log("internal_GetB64WorldAnchorFromGo ERROR => " + err);
    }
}

function internal_ImportWorldAnchor(goName, b64Data, acc) {
    try {
        RT.Help.Log("internal_ImportWorldAnchor for => " + goName + ", " + acc);
        importNamespace("Vizario").AnchorManager.ImportWorldAnchor(goName, b64Data, acc);
        RT.Help.Log("internal_ImportWorldAnchor for => " + goName + ", " + acc + " ==> returned");
    } catch (err) {
        console.log("internal_ImportWorldAnchor ERROR => " + err);
    }
}

function internal_ImportWorldAnchorFromKeyStore(goName, key, acc) {
    try {
        RT.Help.Log("internal_ImportWorldAnchorFromKeyStore for => " + goName + ", " + key + ", " + acc);
        importNamespace("Vizario").AnchorManager.ImportWorldAnchorFromKeyStore(goName, key, acc);
        RT.Help.Log("internal_ImportWorldAnchorFromKeyStore for => " + goName + ", " + key + ", " + acc + " ==> returned");
    } catch (err) {
        console.log("internal_ImportWorldAnchorFromKeyStore ERROR => " + err);
    }
}

///
/// UNITY
///
function internal_PlayClickSound() {
    try {
        importNamespace("RR").Runtime.PlayClickSound();
    } catch (err) {
        console.log("internal_PlayClickSound ERROR => " + err);
    }
}

function internal_PlayNotificationSound() {
    try {
        importNamespace("RR").Runtime.PlayNotificationSound();
    } catch (err) {
        console.log("internal_PlayNotificationSound ERROR => " + err);
    }
}

/**
 * mEventCallback: function(sliderGoName, oldVal, newVal):void
 * @param {string} mSliderName
 * @param {GameObject} mParentGo
 * @param {[x:number, y:number, z:number, w:number]} mRotation
 * @param {[x:number, y:number, z:number]} mTranslation
 * @param {[x:number, y:number, z:number]} mScale
 * @param {function(string, number, number):void} mEventCallbackFct
 * @returns {null|GameObject}
 */
function internal_SetupSlider(mSliderName, mParentGo,
    mRotation, mTranslation, mScale, mEventCallbackFct) {
    var RR = importNamespace("RR");
    var UE = importNamespace("UnityEngine");


    var sliderGo = UE.GameObject.Find(mSliderName);
    if (sliderGo == null) {
        sliderGo = RT.Unity.GetVisPrefabInstance("MyPinchSlider", mSliderName);
    }

    if (sliderGo != null) {
        if (mParentGo != null) {
            sliderGo.transform.parent = mParentGo.transform;
        }

        if (mRotation != null && mRotation.length == 3) {
            //sliderGo.transform.Rotate(mRotateBy[0], mRotateBy[1], mRotateBy[2]);
            sliderGo.transform.localRotation = UE.Quaternion.Euler(mRotation[0], mRotation[1], mRotation[2]);
        }

        if (mTranslation != null && mTranslation.length == 3) {
            sliderGo.transform.localPosition = new UE.Vector3(
                mTranslation[0], mTranslation[1], mTranslation[2]);
        }

        if (mScale != null && mScale.length == 3) {
            sliderGo.transform.localScale = new UE.Vector3(
                mScale[0], mScale[1], mScale[2]);
        }

        if (mEventCallbackFct != null) {
            RR.Runtime.SetEventCallback(sliderGo, mEventCallbackFct);
        }

    }
    return sliderGo;
}

/**
 * 
 * @param {string} mBezName
 * @param {string} mTargetGoName
 * @param {string} mParentGoName
 * @returns {null|GameObject}
 */
function internal_CreateBezier(mBezName, mTargetGoName, mParentGoName) {
    try {
        var bezGo = importNamespace("RR").Runtime.CreateBezier(mBezName, mTargetGoName, mParentGoName);
        return bezGo;
    } catch (err) {
        console.log("MOPOP_CreateBezier ERROR => " + err);
    }
    return null;
}

/**
 * 
 * @param {string} mBezName
 * @param {string} mTargetGoName
 * @param {string} mParentGoName
 * @param {string} mText
 */
function internal_CreateLine(mBezName, mTargetGoName, mParentGoName, mText) {
    try {
        var bezGo = importNamespace("RR").Runtime.CreateLine(mBezName, mTargetGoName, mParentGoName, mText);
        return bezGo;
    } catch (err) {
        console.log("internal_CreateLine ERROR => " + err);
    }
    return null;
}

/**
 * 
 * @param {string} mName
 * @param {string} mContent
 * @param {booleean} mIsUrl
 * @param {number} mPixelWidth
 * @param {number} mPixelHeight
 * @returns {WorldUI}
 */
function internal_CreateWU(mName, mContent, mIsUrl, mPixelWidth, mPixelHeight) {
    var w = 1920;
    var res = w / 0.35;

    if (mPixelWidth == undefined) {
        mPixelWidth = 600;
    }

    if (mPixelHeight == undefined) {
        mPixelHeight = 600;
    }
    var wu = importNamespace("PowerUI").WorldUI(mName, mPixelWidth, mPixelHeight);

    //TODO replace this part with generic html/css like label.html
    if (mIsUrl) {
        wu.document.location.href = mContent;
    } else {
        wu.document.innerHTML = mContent;
    }
    wu.PixelPerfect = false;
    wu.AcceptInput = true;
    wu.InvertResolve = true;

    wu.SetDepthResolution(1);
    wu.SetResolution(res);
    wu.UpdateResolution();
    return wu;
}

/**
 * 
 * @param {GameObject} mChild
 * @param {GameObject} mParent
 */
function internal_SetParent(mChild, mParent) {
    try {
        if (mChild != null && mParent != null) {
            mChild.transform.parent = mParent.transform;
        }
    } catch (err) {
        console.log("internal_SetParent ERROR => " + err);
    }
}

/**
 * Sets the local R,T,s of an GameObject
 * @param {GameObject} mGo
 * @param {[x:number, y:number, z:number]} mT
 * @param {[x:number, y:number, z:number, w:number]} mR
 * @param {[x:number, y:number, z:number]} mS
 */
function internal_SetLocalPose(mGo, mT, mR, mS) {
    try {
        if (mGo != null) {
            var UE = importNamespace("UnityEngine");
            if (mT != null) {
                mGo.transform.localPosition = new UE.Vector3(mT[0], mT[1], mT[2]);
            }

            if (mR != null) {
                mGo.transform.localRotation = new UE.Quaternion(mR[0], mR[1], mR[2], mR[3]);
            }

            if (mS != null) {
                mGo.transform.localScale = new UE.Vector3(mS[0], mS[1], mS[2]);
            }
        }
    } catch (err) {
        console.log("internal_SetLocalPose ERROR => " + err);
    }
}

/**
 * Sets the global R,T,s of an GameObject
 * @param {GameObject} mGo
 * @param {[x:number, y:number, z:number]} mT
 * @param {[x:number, y:number, z:number, w:number]} mR
 * @param {[x:number, y:number, z:number]} mS
 */
function internal_SetPose(mGo, mT, mR, mS) {
    try {
        if (mGo != null) {
            var UE = importNamespace("UnityEngine");
            if (mT != null) {
                mGo.transform.position = new UE.Vector3(mT[0], mT[1], mT[2]);
            }

            if (mR != null) {
                mGo.transform.rotation = new UE.Quaternion(mR[0], mR[1], mR[2], mR[3]);
            }

            if (mS != null) {
                mGo.transform.localScale = new UE.Vector3(mS[0], mS[1], mS[2]);
            }
        }
    } catch (err) {
        console.log("internal_SetPose ERROR => " + err);
    }
}

/**
 * Creates a Unity Gameobject
 * @param {string} mName
 * @return {GameObject}
 */
function internal_CreateGo(mName) {
    try {
        var go = new importNamespace("UnityEngine").GameObject(mName);
        return go;
    } catch (err) {
        console.log("internal_CreateGo ERROR => " + err);
    }
}

/**
 * Copies a GameObject
 * @param {GameObject} mGoSrc
 * @return {null|GameObject} -the copied GameObject
 */
function internal_CopyGo(mGoSrc) {
    try {
        return importNamespace("RR").Runtime.CopyGo(mGoSrc);
    } catch (err) {
        console.log("internal_CopyGo ERROR => " + err);
    }
    return null;
}

/**
 * Copies a GameObject by name
 * @param {string} mGoName
 * @return {null|GameObject} -the copied GameObject
 */
function internal_CopyGoByName(mGoName) {
    try {
        return importNamespace("RR").Runtime.CopyGoByName(mGoName);
    } catch (err) {
        console.log("internal_CopyGoByName ERROR => " + err);
    }
    return null;
}

/**
 * 
 * @param {GameObject} mGo
 */
function internal_DestroyGo(mGo) {
    try {
        return importNamespace("RR").Runtime.DestroyGO(mGo);
    } catch (err) {
        console.log("internal_DestroyGo ERROR => " + err);
    }
}

/**
 *
 * @param {string} mName
 */
function internal_GetVisPrefab(mName) {
    try {
        return importNamespace("RR").Runtime.GetVisPrefab(mName);
    } catch (err) {
        console.log("internal_GetVisPrefab ERROR => " + err);
    }
    return null;
}

function internal_GetVisPrefabNames() {
    try {
        return importNamespace("RR").Runtime.GetVisPrefabNames();
    } catch (err) {
        console.log("internal_GetVisPrefabNames ERROR => " + err);
    }
    return null;
}

function internal_GetVisPrefabInstance(mVisName, mTargetGoName) {
    try {
        return importNamespace("RR").Runtime.GetVisPrefabInstance(mVisName, mTargetGoName);
    } catch (err) {
        console.log("GetVisPrefabInstance ERROR => " + err);
    }
    return null;
}

function internal_SpawnAlert(mDuration, mText) {
    var t = {
        "msgbox": {
            "<>": "div",
            "style": "\
margin:1vw;padding:1vw;width:90vw;height:90vh;border: solid white 4px;\
border-raidus:10px;background-color:red;font-weight:bold;\
font-size:4vw;color: rgb(238,238,238);text-align:center;vertical-align:middle;",
            "id": "msgdiv",
            "html": "${msgtext}"
        }
    };

    var tHtml = json2html.transform({ "msgtext": mText }, t.msgbox);
    try {

        var wuName = "WU_ALERT";
        var UE = importNamespace("UnityEngine");
        var PUI = importNamespace("PowerUI");
        var wu = PUI.WorldUI.Find(wuName);

        if (wu != null) {
            wu.Expire();
        }

        var goCamMain = UE.Camera.main.transform;
        wu = RT.Unity.CreateWU(wuName, tHtml, false, 1920, 260);
        wu.ExpiresIn = mDuration;
        wu.Expires = true;

        RT.Unity.SetParent(wu, goCamMain);
        RT.Unity.SetLocalPose(wu,
            [0, 0.05, 0.7],
            [0, 0, 0, 1],
            null
        );
    } catch (err) {
        console.log("internal_SpawnNotification ERROR => " + err);
    }
}

/**
 * 
 * @param {number} mDuration
 * @param {string} mText
 */
function internal_SpawnNotification(mDuration, mText) {

    console.log("internal_SpawnNotification => " + mDuration + ", " + mText);
    PlayNotification();
    //font-size: 5vh;
    //font-weight: bold;
    // color: rgb(238,238,238);
    // background-color: rgb(0,77,109); /*rgb(49,182,188);*/
    // border: solid rgb(238, 238, 238) 2px;

    var t = {
        "msgbox": {
            "<>": "div",
            "style": "\
margin:1vw;padding:1vw;width:90vw;height:90vh;solid rgb(238, 238, 238) 4px;\
border-raidus:10px;background-color:rgb(0,77,109);font-weight:bold;\
font-size:4vw;color: rgb(238,238,238);text-align:center;vertical-align:middle;",
            "id": "msgdiv",
            "html": "${msgtext}"
        }
    };

    var tHtml = json2html.transform({ "msgtext": mText }, t.msgbox);

    console.log("internal_SpawnNotification tHtml => " + tHtml);

    try {

        console.log("internal_SpawnNotification 1");

        var wuName = "WU_NOTIFY";
        var UE = importNamespace("UnityEngine");
        var PUI = importNamespace("PowerUI");
        var wu = PUI.WorldUI.Find(wuName);

        console.log("internal_SpawnNotification 2");

        if (wu != null) {
            wu.Expire();
        }

        var goCamMain = UE.Camera.main.transform;

        console.log("internal_SpawnNotification 3");

        wu = RT.Unity.CreateWU(wuName, tHtml, false, 1920, 260);
        wu.ExpiresIn = mDuration;
        wu.Expires = true;

        console.log("internal_SpawnNotification 4");

        RT.Unity.SetParent(wu, goCamMain);
        RT.Unity.SetLocalPose(wu,
            [0, 0.05, 0.7],
            [0, 0, 0, 1],
            null
        );

        console.log("internal_SpawnNotification 5");

    } catch (err) {
        console.log("internal_SpawnNotification ERROR => " + err);
    }
}

///
/// VIS
///
// IATK
/**
 * @typedef {Object} ChartDataIATK
 * @property {string} lib
 * @property {number} id
 * @property {number} xpos
 * @property {string} prefix
 * @property {string} chartGoName
 * @property {string} panelGoName
 * @property {string} dataGoName
 * @property {string} panelContentUrl
 * @property {number} chartSize
 * @property {number} panelInitDelayMs
 * @property {GameObject} chartGo
 * @property {GameObject} panelGo
 * @property {GameObject} dataGo
 * @property {string[]} storedDimensions
 * @property {number[]} countPerDimension
 * @property {RealTimeDataSource} rtds
 * @property {Visualisation} vis
 * @property {AbstractVisualisation} abstractVisualisation
 * @property {function(number):void} fctUpdateId
 * @property {function():void} fctUpdateRefs
 * @property {function(number):void} fctUpdatePos
 * @property {function():void} fctInitWorldUi
 * @property {function():void} fctDestroy
 * @property {Object} GeometryType
 * @property {Object} PropertyType
 * @property {function():void} fctInitDataProvider
 * @property {function():void} fctInit
 * @property {function():void} fctInitChartPanel
 */

/**
 * IATK.RealTimeDataSource
 * @typedef {Object} RealTimeDataSource
 */

/**
 * IATK.Visualisation
 * @typedef {Object} Visualisation
 */

/**
 * IATK.Visualisation
 * @typedef {Object} AbstractVisualisation
 */


/**
 * 
 * @param {number} mId
 * @param {number} mOrder
 * @param {string} mPrefabName
 * @param {number} mCanvasSize
 * @param {number} mCanvasSpacedSize
 * @returns {ChartDataIATK}
 */
function internal_GetNewChartObjectIATK(mId, mOrder, mPrefabName, mCanvasSize, mCanvasSpacedSize) {
    return internal_GetNewChartObjectIATK2(mId, mOrder, mPrefabName, mCanvasSize, mCanvasSpacedSize, true);
}

function internal_GetNewChartObjectIATK2(mId, mOrder, mPrefabName, mCanvasSize, mCanvasSpacedSize, mAddControls) {

    var chartData = {};
    chartData.lib = "IATK";
    chartData.id = mId;
    chartData.xpos = mOrder * mCanvasSpacedSize;
    chartData.prefix = "UCanvas";
    chartData.chartGoName = chartData.prefix + "_" + mId;
    chartData.panelGoName = chartData.chartGoName + "_Panel";
    chartData.dataGoName = "CGOVIS-" + chartData.chartGoName;

    console.log("chartData.fctUpdateRefs var-setup id/chartGoName => " + chartData.id + "/" + chartData.chartGoName);

    try {
        chartData.panelContentUrl = MAIN.WEBAPI.uiurl + "/chartsub.html";
    } catch (err) {
        console.log("internal_GetNewChartObjectIATK ERROR => " + err);
    }

    chartData.chartSize = mCanvasSize;
    chartData.panelInitDelayMs = 1000;
    chartData.chartGo = null;
    chartData.panelGo = null;
    chartData.dataGo = null;
    chartData.storedDimensions = [];
    chartData.countPerDimension = [];

    //IATK
    chartData.rtds = null; //IATKExt.RealTimeDataSource
    chartData.vis = null; //IATK.Visualisation
    chartData.abstractVisualisation = null;

    /**
     * updates the chart-id in case of re-init
     * @param {number} mId
     */
    chartData.fctUpdateId = function (mId) {
        chartData.id = mId;
        chartData.chartGoName = chartData.prefix + "_" + mId;
        chartData.panelGoName = chartData.chartGoName + "_Panel";
        chartData.dataGoName = "CGOVIS-" + chartData.chartGoName;
    };

    /**
     * update GameObject refs in case of name changes or re-hooking
     * */
    chartData.fctUpdateRefs = function () {
        try {
            var UE = importNamespace("UnityEngine");
            chartData.chartGo = UE.GameObject.Find(chartData.chartGoName);
            chartData.panelGo = UE.GameObject.Find(chartData.panelGoName);
            chartData.dataGo = UE.GameObject.Find(chartData.dataGoName);
        } catch (err) {
            console.log("chartData.fctUpdateRefs ERROR => " + err);
        }
    };

    /**
     * 
     * @param {number} mOrder
     */
    chartData.fctUpdatePos = function (mOrder) {
        console.log("chartData.fctInit @ mXpos=" + mOrder);
        this.xpos = mOrder * mCanvasSpacedSize;
        var cs = this.chartSize;
        RT.Unity.SetLocalPose(this.chartGo,
            [this.xpos, 0, 0, 0], // T
            [0, 0, 0, 1], // R
            [cs, cs, cs] //S
        );
    };

    chartData.fctInitWorldUi = function () {
        console.log("chartData.fctInitWorldUi @ " + this.id +
            ", " + this.chartGoName + ", " + this.panelGoName);
        try {
            if (this.panelGo != null) {
                this.panelGo.Expire();
            }

            this.panelGo = RT.Unity.CreateWU(this.panelGoName, this.panelContentUrl, true, 1920, 560);
            RT.Unity.SetParent(this.panelGo, this.chartGo);
            RT.Unity.SetLocalPose(this.panelGo,
                [0.5, -0.4, 0],
                [0, 0, 0, 1],
                null
            );
        } catch (err) {
            console.log("chartData.fctInitWorldUi fctInitWorldUi ERROR => " + err);
        }

        console.log("chartData.fctInitWorldUi before time out");
        RT.Web.SetTiimeout(5000/*this.panelInitDelayMs*/, function () {
            console.log("chartData.fctInitWorldUi IN timeout");
            chartData.fctInitChartPanel();
            chartData.fctUpdateChart();
        });
    };

    chartData.fctDestroy = function () {
        console.log("chartData.fctDestroy @ " + this.id +
            ", " + this.chartGoName + ", " + this.panelGoName);

        this.id = -1;
        if (this.chartGo != null) {
            RT.Unity.DestroyGO(this.dataGo);
            RT.Unity.DestroyGO(this.chartGo);
        }

        if (this.panelGo != null) {
            this.panelGo.Expire();
        }
    };

    //IATK
    chartData.GeometryType = { //AbstractVisualisation.GeometryType
        "Undefined": 0,
        "Points": 1,
        "Lines": 2,
        "Quads": 3,
        "LinesAndDots": 4,
        "Cubes": 5,
        "Bars": 6,
        "Spheres": 7
    };

    chartData.PropertyType = { //AbstractVisualisation.PropertyType
        "None": 0,
        "X": 1,
        "Y": 2,
        "Z": 3,
        "Colour": 4,
        "Size": 5,
        "GeometryType": 6,
        "LinkingDimension": 7,
        "OriginDimension": 8,
        "DestinationDimension": 9,
        "GraphDimension": 10,
        "DimensionFiltering": 11,
        "Scaling": 12,
        "BlendSourceMode": 13,
        "BlendDestinationMode": 14,
        "AttributeFiltering": 15,
        "DimensionChange": 16,
        "VisualisationType": 17,
        "SizeValues": 18,
        "DimensionChangeFiltering": 19,
        "VisualisationWidth": 20,
        "VisualisationHeight": 21,
        "VisualisationLength": 22
    };

    chartData.DataType = {
        "Undefined": 0,
        "Float": 1,
        "Int": 2,
        "Bool": 3,
        "String": 4,
        "Date": 5,
        "Time": 6,
        "Graph": 7
    }

    chartData.fctInitDataProvider = function () {
        try {
            var IATK = importNamespace('IATK');
            this.dataGo = new RT.UE.GameObject(this.dataGoName);
            this.rtds = this.dataGo.AddComponent(IATK.RealtimeDataSource);

            if (this.rtds != null) {
                this.rtds.AddDimension("names", 2, this.DataType.String);
                //this.rtds.AddDimension("names", 0, 100, this.DataType.Float);
                this.rtds.SetDataStrStr("names", "id");
                //this.rtds.SetDataStrVal("names", 0);


                this.rtds.AddDimension("id", 0, 100, this.DataType.Float);
                for (var i = 0; i < 100; i++) {
                    //this.rtds.AddDataByStr("id", i);
                    //this.rtds.SetData("id", i);
                    this.rtds.SetDataStrVal("id", i);
                }
            }
        } catch (err) {
            console.log("fctInitDataProvider ERROR => " + err);
        }
    }

    chartData.fctInit = function () {
        console.log("chartData.fctInit @ " + this.id + ", " + this.chartGoName);
        try {

            if (this.chartGo == null) {
                var IATK = importNamespace('IATK');
                this.chartGo = new RT.UE.GameObject(this.chartGoName);
                this.vis = this.chartGo.AddComponent(IATK.Visualisation);

                if (this.vis.theVisualizationObject == null) {
                    this.vis.CreateVisualisation(0); //AbstractVisualisation.VisualisationTypes.SCATTERPLOT 0
                    this.abstractVisualisation = this.vis.theVisualizationObject;
                }

                console.log("chartData.fctInit @ " + this.id + ", " + this.chartGoName + " VIS-UID=" + this.vis.uid);

                this.vis.dataSource = this.rtds;
                this.abstractVisualisation.visualisationReference.xDimension.Attribute = "id";
                this.abstractVisualisation.UpdateVisualisation(this.PropertyType.X);
                this.abstractVisualisation.visualisationReference.yDimension.Attribute = "id";
                this.abstractVisualisation.UpdateVisualisation(this.PropertyType.Y);
                this.abstractVisualisation.visualisationReference.zDimension.Attribute = "id";
                this.abstractVisualisation.UpdateVisualisation(this.PropertyType.Z);
                this.abstractVisualisation.visualisationReference.sizeDimension = "id";
                this.abstractVisualisation.UpdateVisualisation(this.PropertyType.Size);

                //this.abstractVisualisation.visualisationReference.size = 0.03;
                this.abstractVisualisation.visualisationReference.minSize = 0.01;
                this.abstractVisualisation.visualisationReference.maxSize = 0.2;
                //this.abstractVisualisation.visualisationReference.fontAxesSize = 800;
                this.abstractVisualisation.UpdateVisualisation(this.PropertyType.SizeValues);


                this.abstractVisualisation.visualisationReference.graphDimension = "Undefined";
                this.abstractVisualisation.visualisationReference.colourDimension = "Undefined";
                this.abstractVisualisation.visualisationReference.colorPaletteDimension = "Undefined";

                this.abstractVisualisation.visualisationReference.linkingDimension = "names";
                this.abstractVisualisation.UpdateVisualisation(this.PropertyType.LinkingDimension);

                //this.abstractVisualisation.UpdateVisualisation(this.PropertyType.Colour);

                //this.abstractVisualisation.UpdateVisualisation(this.PropertyType.SizeValues);
                //this.abstractVisualisation.UpdateVisualisation(this.PropertyType.GraphDimension);
                this.abstractVisualisation.UpdateVisualisation(this.PropertyType.None);

                this.fctChangeStyle(this.GeometryType.Points);
                this.fctUpdateChart();

                try {
                    this.vis.updateViewProperties(this.PropertyType.GraphDimension);
                } catch (err3) {
                    console.log("internal_GetNewChartObject fctUpdateChart err3 ERROR => " + err3);
                }
            }

            var cs = this.chartSize;
            RT.Unity.SetParent(this.chartGo, RT.UE.GameObject.Find("usercanvas"));
            RT.Unity.SetLocalPose(this.chartGo,
                [this.xpos, 0, 0], // T
                [0, 0, 0, 1], // R
                [cs, cs, cs] //S
            );

            //this.vis.width = cs;
            //this.vis.height = cs;
            //this.vis.depth = cs;

        } catch (err) {
            console.log("fctInit ERROR => " + err);
        }
    };

    chartData.fctInitChartPanel = function () {
        if (this.panelGo != null) {

            try {
                var thisShared = {};
                thisShared.chartGoName = this.chartGoName;
                thisShared.panelGoName = this.panelGoName;
                thisShared.dataGoName = this.dataGoName;
                thisShared.id = this.id;
                thisShared.lib = this.lib;

                var jsonStr = JSON.stringify(thisShared);
                console.log("fctInitChartPanel before call jsonStr => " + jsonStr);

                this.panelGo.document.Run("ChartSub_ExternalInitMe", [jsonStr]);
            } catch (err) {
                console.log("fctInitChartPanel ERROR => " + err);
            }
        }
    }

    chartData.fctUpdateChart = function () {
        try {
            if (this.vis != null) {
                this.vis.updateView(this.PropertyType.None);
            }
        } catch (err) {
            console.log("internal_GetNewChartObject fctUpdateChart err ERROR => " + err);
        }

        /*try {
            if (this.vis != null) {
                this.vis.theVisualizationObject.creationConfiguration.Serialize("");
            }
        } catch (err2) {
            console.log("internal_GetNewChartObject fctUpdateChart err2 ERROR => " + err);
        }*/
    };

    /**
     * @typedef {Object} RealtimeDimensionData
     * @property {Object.<string,string>} data
     */
    /**
     * 
     * @param {RealtimeDimensionData} mData
     * @param {number} mAxisIndicator
     */
    chartData.fctAddRealtimeDimension = function (mData, mAxisIndicator) {

        try {
            console.log("chartData.fctAddRealtimeDimension @ " + this.id +
                ", " + this.chartGoName + ", " + this.panelGoName);
            console.log("chartData.fctAddRealtimeDimension mData => " + mData);

            var dataObj = JSON.parse(mData);
            //add dimesion
            //add mqtt hook

            var fieldname = dataObj.data.fieldname;
            var topic = dataObj.data.mqtt;

            console.log("chartData.fctAddRealtimeDimension fieldname => " + fieldname + "|" + typeof fieldname);
            console.log("chartData.fctAddRealtimeDimension topic => " + topic + "|" + typeof topic);

            var uniqueFieldName = fieldname;
            var splitTopic = topic.split('/');
            if (splitTopic.length > 3) {
                uniqueFieldName = fieldname + "-" + splitTopic[4]; // telemetry/buidling/floor/room/device/part/skill -> take device
            }
            //var uniqueFieldName = fieldname + "-" + topic.split('/')[4]; // telemetry/buidling/floor/room/device/part/skill -> take device //eg telemetry/inffeld16/2nd/id2068/bigserver/DC-BIG/dcin
            this.storedDimensions.push(uniqueFieldName);
            //this.storedDimensions.push(fieldname);
            var dimensionId = this.storedDimensions.length - 1;
            //console.log("chartData.fctAddRealtimeDimension storedDimensions=" + this.storedDimensions + ", dimensionId=" + dimensionId);

            var locationAdded = false;
            //this is already done at init
            if (this.rtds != null) {
                locationAdded = this.rtds.AddDimension(uniqueFieldName, 0, 100, this.DataType.Float); //fix normalization problem
                //console.log("RTDS chartData.fctAddRealtimeDimension locationExists=" + locationExists);
                if (locationAdded) {
                    //this.rtds.SetDataStrVal("names", dimensionId);
                    this.rtds.SetDataStrStr("names", uniqueFieldName);
                }
                //this.rtds.AddStrDataByStr("names", uniqueFieldName);
                if (false) {
                    for (var i = 0; i < 100; i++) {
                        //this.rtds.AddDataByStr("id", i);
                        //this.rtds.SetData("id", i);
                        this.rtds.SetDataStrVal("id", i);
                    }
                }
            }

            this.countPerDimension[uniqueFieldName] = {};
            this.countPerDimension[uniqueFieldName].id = 0;


            //TODO add function to manipulate dimensions

            if (mAxisIndicator == 0) {
                this.abstractVisualisation.visualisationReference.xDimension.Attribute = uniqueFieldName;
                this.abstractVisualisation.UpdateVisualisation(this.PropertyType.X);
            } else if (mAxisIndicator == 1) {
                this.abstractVisualisation.visualisationReference.yDimension.Attribute = uniqueFieldName;
                this.abstractVisualisation.UpdateVisualisation(this.PropertyType.Y);
            } else if (mAxisIndicator == 2) {
                this.abstractVisualisation.visualisationReference.zDimension.Attribute = uniqueFieldName;
                this.abstractVisualisation.UpdateVisualisation(this.PropertyType.Z);
            } else if (mAxisIndicator == 3) {
                this.abstractVisualisation.visualisationReference.sizeDimension = uniqueFieldName;
                this.abstractVisualisation.UpdateVisualisation(this.PropertyType.Size);
            } else if (mAxisIndicator == 4) { //color
                var UE = importNamespace("UnityEngine");
                var gradient = new UE.Gradient();

                // Populate the color keys at the relative time 0 and 1 (0 and 100%)
                var colorKey = [new UE.GradientColorKey(), new UE.GradientColorKey()];
                colorKey[0].color = new UE.Color(1, 0, 0);
                colorKey[0].time = 0.0;
                colorKey[1].color = new UE.Color(0, 1, 0)
                colorKey[1].time = 1.0;

                // Populate the alpha  keys at relative time 0 and 1  (0 and 100%)
                var alphaKey = [new UE.GradientAlphaKey(), new UE.GradientAlphaKey()];
                alphaKey[0].alpha = 1.0;
                alphaKey[0].time = 0.0;
                alphaKey[1].alpha = 1.0;
                alphaKey[1].time = 1.0;
                gradient.SetKeys(colorKey, alphaKey);

                this.abstractVisualisation.visualisationReference.colourDimension = uniqueFieldName;
                //this.abstractVisualisation.UpdateVisualisation(this.PropertyType.Colour);

                this.abstractVisualisation.visualisationReference.dimensionColour = gradient;
                this.abstractVisualisation.UpdateVisualisation(this.PropertyType.Colour);
            }

            //only add mqtt if location does ont exist yet            
            if (locationAdded) {
                RT.MQTT.Subscribe(topic);
                RT.MQTT.RegisterCallbackTopic(function (mTopic, mPayload) {
                    //console.log("chartData.fctAddRealtimeDimension mqtt cb => " + mTopic + "|" + mPayload);
                    var dobj = JSON.parse(mPayload);
                    //console.log("chartData.fctAddRealtimeDimension mqtt => " + mPayload);
                    if (dobj.hasOwnProperty(fieldname)) {
                        try {
                            //console.log("chartData.fctAddRealtimeDimension mqtt => " + mPayload);
                            var uniqueFieldName = fieldname;
                            var splitTopic = topic.split('/');
                            if (splitTopic.length > 3) {
                                uniqueFieldName = fieldname + "-" + splitTopic[4]; // telemetry/buidling/floor/room/device/part/skill -> take device
                            }
                            var mVal = dobj[fieldname];
                            mVal = parseFloat(mVal);

                            //var dirty = chartData.rtds.AddDataByStr(uniqueFieldName, mVal);
                            //var dirty = chartData.rtds.SetData(uniqueFieldName, mVal);
                            //console.log("RTDS chartData.fctAddRealtimeDimension mqtt before add => " + uniqueFieldName + ": " + mVal);
                            var dirty = chartData.rtds.SetDataStrVal(uniqueFieldName, mVal);
                            chartData.fctUpdateChart();

                        } catch (err) {
                            console.log("chartData.fctAddRealtimeDimension mqtt cb ERROR => " + err);
                        }
                    }
                }, topic);
            }

            this.fctUpdateChart();

            this.vis.theVisualizationObject.creationConfiguration.Serialize("");

        } catch (err) {
            console.log("chartData.fctAddRealtimeDimension ERROR => " + err);
        }
    };

    chartData.fctChangeStyle = function (mStyle) {
        if (this.vis != null) {
            this.vis.geometry = mStyle;
            this.fctUpdateChart();
        }
    }


    chartData.fctInitDataProvider();
    chartData.fctInit();
    if (mAddControls) {
        chartData.fctInitWorldUi();
    }

    RT.Web.SetTiimeout(2000, function () {
        chartData.fctUpdateChart();
    });

    //chartData.fctInitChartPanel();
    return chartData;
}

// U2Vis
function internal_GetNewChartObject(mId, mOrder, mPrefabName, mCanvasSize, mCanvasSpacedSize) {
    var chartData = {};
    chartData.lib = "U2V";
    chartData.id = mId;
    chartData.xpos = mOrder * mCanvasSpacedSize;
    chartData.prefix = "UCanvas";
    chartData.prefabName = mPrefabName;
    chartData.chartGoName = chartData.prefix + "_" + mId;
    chartData.panelGoName = chartData.chartGoName + "_Panel";
    //chartData.panelContentUrl = MAIN.WEBAPI.uiurl + "/chartsub.html";
    try {
        chartData.panelContentUrl = MAIN.WEBAPI.uiurl + "/chartsub.html";
    } catch (err) {
        console.log("internal_GetNewChartObjectIATK ERROR => " + err);
    }
    chartData.chartSize = mCanvasSize;
    chartData.panelInitDelayMs = 500;
    chartData.chartGo = RT.Unity.GetVisPrefabInstance(mPrefabName, chartData.chartGoName); //U2V
    chartData.panelGo = null;
    chartData.rtp = null;
    chartData.dataGoName = "CGOVIS-" + chartData.chartGoName;
    chartData.dataGo = null;
    chartData.rtp = null; //U2V
    chartData.bvv = null; //U2V
    chartData.gdp = null; //U2V
    chartData.storedDimensions = [];
    chartData.countPerDimension = [];

    //moved that here for persistance
    chartData.paramsIdx = [];
    chartData.idToAxisMapping = {
        "x": 0,
        "y": 0,
        "z": 0,
    };

    /*if (chartData.chartGo != null) {
        var MSUI = importNamespace("Microsoft.MixedReality.Toolkit.UI");
        chartData.chartGo.AddComponent(MSUI.ObjectManipulator);
    }*/


    chartData.fctUpdateId = function (mId) {
        chartData.id = mId;
        chartData.chartGoName = chartData.prefix + "_" + mId;
        chartData.panelGoName = chartData.chartGoName + "_Panel";
        chartData.dataGoName = "CGOVIS-" + chartData.chartGoName;
    };

    chartData.fctUpdateRefs = function () {
        try {
            var UE = importNamespace("UnityEngine");
            chartData.chartGo = UE.GameObject.Find(chartData.chartGoName);
            chartData.panelGo = UE.GameObject.Find(chartData.panelGoName);
            chartData.dataGo = UE.GameObject.Find(chartData.dataGoName);
        } catch (err) {
            console.log("chartData.fctUpdateRefs ERROR => " + err);
        }
    };

    chartData.fctUpdatePos = function (mOrder) {
        console.log("chartData.fctInit @ mXpos=" + mOrder);
        this.xpos = mOrder * mCanvasSpacedSize;
        var cs = this.chartSize;
        RT.Unity.SetLocalPose(this.chartGo,
            [this.xpos, 0, 0, 0], // T
            [0, 0, 0, 1], // R
            [cs, cs, cs] //S
        );
    };

    chartData.fctInit = function () {
        console.log("chartData.fctInit @ " + this.id + ", " + this.chartGoName);
        try {
            var cs = this.chartSize;
            RT.Unity.SetParent(this.chartGo, RT.UE.GameObject.Find("usercanvas"));
            RT.Unity.SetLocalPose(this.chartGo,
                [this.xpos, 0, 0, 0], // T
                [0, 0, 0, 1], // R
                [cs, cs, cs] //S
            );
        } catch (err) {
            console.log("internal_GetNewChartObject fctInit ERROR => " + err);
        }
    };

    chartData.fctInitDataProvider = function () {
        console.log("chartData.fctInitDataProvider @ " + this.id + ", " + this.dataGoName);

        var UE = importNamespace("UnityEngine");
        var RRU2V = importNamespace("RRu2v");
        var U2V = importNamespace("u2vis");

        try {
            //if else depending on type of presenter
            console.log("chartData.fctInitDataProvider A");
            this.gdp = this.chartGo.GetComponent(U2V.MultiDimDataPresenter);
            if (this.gdp == null) {
                console.log("chartData.fctInitDataProvider A2");
                this.gdp = this.chartGo.GetComponent(U2V.GenericDataPresenter); //U2V.MultiDimDataPresenter
            }

            console.log("chartData.fctInitDataProvider B");
            this.bvv = this.chartGo.GetComponent(U2V.BaseVisualizationView);
            if (this.bvv == null) {
                console.log("chartData.fctInitDataProvider B could not get bvv!");
            }

            console.log("chartData.fctInitDataProvider C");
            this.dataGo = new UE.GameObject(this.dataGoName);
            this.rtp = this.dataGo.AddComponent(RRU2V.RealtimeDataProvider);

            console.log("chartData.fctInitDataProvider D");
            //for testing
            var n = 50;
            this.rtp.Data.Add(new U2V.FloatDimension("id", null));
            this.rtp.Data.Add(new U2V.FloatDimension("id2", null));

            this.storedDimensions.push("id");
            var id = this.storedDimensions.length - 1;

            this.storedDimensions.push("id2");
            var id2 = this.storedDimensions.length - 1;

            for (var i = 0; i < n; i++) {
                //this.rtp.AddToDataInt(0, i);
                this.rtp.AddToDataFloat(0, i);
                this.rtp.AddToDataFloat(1, i);
            }

            console.log("chartData.fctInitDataProvider E");

            var paramsIdx = [0, 1];
            try {
                console.log("chartData.fctInitDataProvider E2 => this.gdp.Initialize(this.rtp, 0, n, paramsIdx);");
                this.gdp.Initialize(this.rtp, 0, n, paramsIdx);
                console.log("chartData.fctInitDataProvider E2 after");
            } catch (err) {
                console.log("chartData.fctInitDataProvider E2 ERROR => " + err);
                console.log("chartData.fctInitDataProvider E3 => this.gdp.Initialize(this.rtp, 0, n, 0, paramsIdx);");
                this.gdp.Initialize(this.rtp, 0, n, 0, paramsIdx);
            }

            console.log("chartData.fctInitDataProvider F");
            try {
                if (this.bvv != null) {
                    //this.bvv.Rebuild();
                }
            } catch (err) {
                console.log("chartData.fctInitDataProvider could not call this.bvv.Rebuild();");
            }
        } catch (err) {
            console.log("chartData.fctInitDataProvider ERROR => " + err);
        }
    };


    chartData.fctUpdateChart = function () {
        console.log("chartData.fctUpdateChart @ " + this.id +
            ", " + this.chartGoName + ", " + this.panelGoName);
        try {
            if (this.panelGo != null) {

                console.log("internal_GetNewChartObject fctUpdateChart 0");
                var toSer = this;
                var t_rtp = this.rtp;
                var t_gdp = this.gdp;
                var t_bvv = this.bvv;

                console.log("internal_GetNewChartObject fctUpdateChart 1");

                delete toSer.rtp;
                delete toSer.gdp;
                delete toSer.bvv;

                console.log("internal_GetNewChartObject fctUpdateChart 2 this.panelGo=" + this.panelGo);
                var jsonStr = JSON.stringify(this);
                this.panelGo.document.Run("ChartSub_ExternalInitMe", [jsonStr]);
                toSet = null;

                console.log("internal_GetNewChartObject fctUpdateChart 3");

                this.rtp = t_rtp;
                this.gdp = t_gdp;
                this.bvv = t_bvv;

                console.log("internal_GetNewChartObject fctUpdateChart 4");
            }
        } catch (err) {
            console.log("internal_GetNewChartObject fctUpdateChart ERROR => " + err);
        }
    };

    chartData.fctInitWorldUi = function () {
        console.log("chartData.fctInitWorldUi @ " + this.id +
            ", " + this.chartGoName + ", " + this.panelGoName);
        try {
            if (this.panelGo != null) {
                this.panelGo.Expire();
            }

            this.panelGo = RT.Unity.CreateWU(this.panelGoName, this.panelContentUrl, true, 1920, 560);
            RT.Unity.SetParent(this.panelGo, this.chartGo);
            RT.Unity.SetLocalPose(this.panelGo,
                [0.5, -0.4, 0],
                [0, 0, 0, 1],
                null
            );
        } catch (err) {
            console.log("internal_GetNewChartObject fctInitWorldUi ERROR => " + err);
        }

        RT.Web.SetTiimeout(this.panelInitDelayMs, function () {
            chartData.fctUpdateChart();
        });
    };

    chartData.fctDestroy = function () {
        console.log("chartData.fctDestroy @ " + this.id +
            ", " + this.chartGoName + ", " + this.panelGoName);

        this.id = -1;
        if (this.chartGo != null) {
            RT.Unity.DestroyGO(this.dataGo);
            RT.Unity.DestroyGO(this.chartGo);
        }

        if (this.panelGo != null) {
            this.panelGo.Expire();
        }
    };

    chartData.fctAddDimensionWithRealtimeKeys = function (mData) {
        console.log("chartData.fctAddDimensionWithRealtimeKeys @ " + this.id +
            ", " + this.chartGoName + ", " + this.panelGoName);
        console.log("chartData.fctAddDimensionWithRealtimeKeys mData => " + mData);

        var dataObj = JSON.parse(mData);
        var topic = dataObj.data.mqtt;
        var nindices = dataObj.data.nindices;

        console.log("chartData.fctAddDimensionWithRealtimeKeys topic => " + topic + "|" + typeof topic);

        var U2V = importNamespace("u2vis");
        //var paramsIdx = [];

        //x dimension
        if (dataObj.data.hasOwnProperty("xdimname")) {
            var xdimname = dataObj.data.xdimname;

            this.storedDimensions.push(xdimname);
            var xdimId = this.storedDimensions.length - 1;
            this.paramsIdx.push(xdimId);

            if (dataObj.data.hasOwnProperty("xlabels")) {
                var xlabels = dataObj.data.xlabels;

                if (xlabels.length > 0) {

                    console.log("chartData.fctAddDimensionWithRealtimeKeys xlabels[0] => " + xlabels[0] + "|" + typeof xlabels[0]);
                    if ((typeof xlabels[0]) == "string") {

                        //add the actual data dimension
                        console.log("chartData.fctAddDimensionWithRealtimeKeys adding ids X-dim ...");
                        this.rtp.Data.Add(new U2V.FloatDimension(xdimname, null));
                        for (var i = 0; i < nindices; i++) {
                            this.rtp.AddToDataFloat(xdimId, i);
                        }

                        //added string label dimension for labeling
                        this.storedDimensions.push("xlabels");
                        xdimId = this.storedDimensions.length - 1;
                        //paramsIdx.push(xdimId);
                        console.log("chartData.fctAddDimensionWithRealtimeKeys adding label X-dim ...");
                        this.rtp.Data.Add(new U2V.StringDimension("xlabels", null));
                        for (var i = 0; i < nindices; i++) {
                            this.rtp.AddToDataString(xdimId, xlabels[i]);
                        }


                    } else {
                        //in case labels are number and categorial
                        this.rtp.Data.Add(new U2V.IntegerDimension(xdimname, null));
                        for (var i = 0; i < nindices; i++) {
                            this.rtp.AddToDataInt(xdimId, xlabels[i]);
                        }
                    }

                }
            } else {
                this.rtp.Data.Add(new U2V.FloatDimension(xdimname, null));
                for (var i = 0; i < nindices; i++) {
                    this.rtp.AddToDataFloat(xdimId, 0);
                }
            }
        }

        //y dimension
        if (dataObj.data.hasOwnProperty("ydimname")) {
            var ydimname = dataObj.data.ydimname;

            this.storedDimensions.push(ydimname);
            var ydimId = this.storedDimensions.length - 1;
            this.paramsIdx.push(ydimId);

            if (dataObj.data.hasOwnProperty("ylabels")) {
                var ylabels = dataObj.data.ylabels;
                this.rtp.Data.Add(new U2V.IntegerDimension(ydimname, null));
                for (var i = 0; i < nindices; i++) {
                    this.rtp.AddToDataInt(ydimId, ylabels[i]);
                }
            } else {
                this.rtp.Data.Add(new U2V.FloatDimension(ydimname, null));
                for (var i = 0; i < nindices; i++) {
                    this.rtp.AddToDataFloat(ydimId, 0);
                }
            }
        }

        //z dimension
        if (dataObj.data.hasOwnProperty("zdimname")) {
            var zdimname = dataObj.data.zdimname;

            this.storedDimensions.push(zdimname);
            var zdimId = this.storedDimensions.length - 1;
            this.paramsIdx.push(zdimId);

            if (dataObj.data.hasOwnProperty("zlabels")) {
                var zlabels = dataObj.data.zlabels;
                this.rtp.Data.Add(new U2V.IntegerDimension(zdimname, null));
                for (var i = 0; i < nindices; i++) {
                    this.rtp.AddToDataInt(zdimId, zlabels[i]);
                }
            } else {
                this.rtp.Data.Add(new U2V.FloatDimension(zdimname, null));
                for (var i = 0; i < nindices; i++) {
                    this.rtp.AddToDataFloat(zdimId, 0);
                }
            }
        }

        //var paramsIdx = [2, 3];
        if (this.gdp != null) {
            try {
                this.gdp.Initialize(this.rtp, 0, nindices, this.paramsIdx);
            } catch (err) {
                this.gdp.Initialize(this.rtp, 0, nindices, 0, this.paramsIdx);
            }
        }
        this.gdp.SetSelectedItemIndices(0, nindices);

        //mqtt updates
        RT.MQTT.Subscribe(topic);
        RT.MQTT.RegisterCallbackTopic(function (mTopic, mPayload) {
            try {
                var targetDimension = dataObj.data.mqttdimensionkey;
                var N = dataObj.data.nindices;
                var doReset = dataObj.data.reset;

                console.log("chartData.fctAddDimensionWithRealtimeKeys targetDimension => " + targetDimension);
                console.log("chartData.fctAddDimensionWithRealtimeKeys mqtt cb => " + mTopic + "|" + mPayload);
                var dobj = JSON.parse(mPayload);

                var dimensionId = chartData.storedDimensions.indexOf(targetDimension);

                console.log("chartData.fctAddDimensionWithRealtimeKeys dimensionId => " + dimensionId);

                if (doReset) {
                    for (var i = 0; i < N; i++) {
                        chartData.rtp.SetValueFloatNonCylcing(dimensionId, i, 0);
                    }
                }

                console.log("chartData.fctAddDimensionWithRealtimeKeys before looping ... ");

                for (var k in dobj) {
                    console.log("chartData.fctAddDimensionWithRealtimeKeys updating key for " +
                        targetDimension + "=> " + k + " = " + dobj[k]);
                    var val = parseFloat(dobj[k].val);
                    var dataId = dobj[k].id;
                    console.log("chartData.fctAddDimensionWithRealtimeKeys val = "
                        + val + "(" + typeof val + ")");

                    console.log("chartData.fctAddDimensionWithRealtimeKeys this.storedDimensions => " +
                        JSON.stringify(chartData.storedDimensions));



                    console.log("chartData.fctAddDimensionWithRealtimeKeys dimensionId = " + dimensionId);


                    //chartData.rtp.SetValueFloat(dimensionId, 1, val);
                    chartData.rtp.SetValueFloatNonCylcing(dimensionId, dataId, val);

                    //chartData.rtp.SetValueFloat(dimensionId, slotId, mVal);
                    chartData.bvv.Rebuild();
                }
            } catch (mqttCbErr) {
                console.log("chartData.fctAddDimensionWithRealtimeKeys ERROR => " + mqttCbErr);
            }
        }, topic);
    };

    chartData.fctAddRealtimeDimension = function (mData, mAxisIndicator) {
        try {
            console.log("chartData.fctAddRealtimeDimension @ " + this.id +
                ", " + this.chartGoName + ", " + this.panelGoName);
            console.log("chartData.fctAddRealtimeDimension mData => " + mData);

            var dataObj = JSON.parse(mData);
            //add dimesion
            //add mqtt hook

            var fieldname = dataObj.data.fieldname;
            var topic = dataObj.data.mqtt;

            console.log("chartData.fctAddRealtimeDimension fieldname => " + fieldname + "|" + typeof fieldname);
            console.log("chartData.fctAddRealtimeDimension topic => " + topic + "|" + typeof topic);

            console.log("chartData.fctAddRealtimeDimension has rtp => " + this.hasOwnProperty("rtp") + "|" + typeof this.rtp + "|" + this.rtp);

            //this.rtp = this.dataGo.GetComponent(RRU2V.RealtimeDataProvider);
            console.log("chartData.fctAddRealtimeDimension A");

            var uniqueFieldName = fieldname;
            var splitTopic = topic.split('/');
            if (splitTopic.length > 3) {
                uniqueFieldName = fieldname + "-" + splitTopic[4]; // telemetry/buidling/floor/room/device/part/skill -> take device
            }
            //var uniqueFieldName = fieldname + "-" + topic.split('/')[4]; // telemetry/buidling/floor/room/device/part/skill -> take device //eg telemetry/inffeld16/2nd/id2068/bigserver/DC-BIG/dcin
            this.storedDimensions.push(uniqueFieldName);
            //this.storedDimensions.push(fieldname);
            var dimensionId = this.storedDimensions.length - 1;
            console.log("chartData.fctAddRealtimeDimension storedDimensions=" + this.storedDimensions + ", dimensionId=" + dimensionId);

            var RRU2V = importNamespace("RRu2v");
            var U2V = importNamespace("u2vis");

            this.rtp.Data.Add(new U2V.FloatDimension(uniqueFieldName, null));
            //this.rtp.Data.Add(new U2V.FloatDimension(fieldname, null));

            for (var i = 0; i < 50; i++) {
                this.rtp.AddToDataFloat(dimensionId, 0);
            }

            this.countPerDimension[uniqueFieldName] = {};
            this.countPerDimension[uniqueFieldName].id = 0;
            //this.countPerDimension[fieldname] = {};
            //this.countPerDimension[fieldname].id = 0;

            console.log("chartData.fctAddRealtimeDimension B");
            //TODO check if already exists and get id

            console.log("chartData.fctAddRealtimeDimension C");

            var Ndim = this.storedDimensions.length;

            var nStop = 2;
            if (Ndim < 4) {
                nStop = 0;
            }

            var paramsIdx = [];
            if (mAxisIndicator == -1) {
                for (var i = Ndim - 1; i >= nStop; i--) {
                    paramsIdx.push(i);
                }
            } else {
                if (mAxisIndicator == 0) {
                    chartData.idToAxisMapping.x = dimensionId;
                } else if (mAxisIndicator == 1) {
                    chartData.idToAxisMapping.y = dimensionId;
                } else if (mAxisIndicator == 2) {
                    chartData.idToAxisMapping.z = dimensionId;
                }

                paramsIdx.push(chartData.idToAxisMapping.x);
                paramsIdx.push(chartData.idToAxisMapping.y);
                paramsIdx.push(chartData.idToAxisMapping.z);
            }

            //a way to etup fixed dimension
            //var paramsIdx = [dimensionId, 0, 0];


            console.log("chartData.fctAddRealtimeDimension C.2");

            if (this.gdp != null) {
                try {
                    this.gdp.Initialize(this.rtp, 0, 50, paramsIdx);
                } catch (err) {
                    this.gdp.Initialize(this.rtp, 0, 50, 0, paramsIdx);
                }
            }
            this.gdp.SetSelectedItemIndices(0, 50);
            console.log("chartData.fctAddRealtimeDimension D");

            //RT.MQTT.Subscribe(topic);
            RT.MQTT.RegisterCallbackTopic(function (mTopic, mPayload) {
                console.log("chartData.fctAddRealtimeDimension mqtt cb => " + mTopic + "|" + mPayload);
                var dobj = JSON.parse(mPayload);
                if (dobj.hasOwnProperty(fieldname)) {
                    try {
                        var uniqueFieldName = fieldname;
                        var splitTopic = topic.split('/');
                        if (splitTopic.length > 3) {
                            uniqueFieldName = fieldname + "-" + splitTopic[4]; // telemetry/buidling/floor/room/device/part/skill -> take device
                        }
                        var mVal = dobj[fieldname];
                        mVal = parseFloat(mVal);
                        console.log("chartData.fctAddRealtimeDimension mqtt cb mVal = " + mVal + "|" + typeof mVal + ", dimensionId=" + dimensionId);


                        console.log("chartData.fctAddRealtimeDimension uniqueFieldName = " + uniqueFieldName);
                        console.log("chartData.fctAddRealtimeDimension chartData.countPerDimension => " + JSON.stringify(chartData.countPerDimension));

                        var slotId = chartData.countPerDimension[uniqueFieldName].id;
                        //var slotId = chartData.countPerDimension[fieldname].id;

                        console.log("chartData.fctAddRealtimeDimension mqtt cb 1");

                        chartData.rtp.SetValueFloat(dimensionId, slotId, mVal);
                        //chartData.rtp.AddToDataFloat(dimensionId, mVal);

                        console.log("chartData.fctAddRealtimeDimension mqtt cb 2");

                        //TODO use shifting as in label.js here
                        chartData.countPerDimension[uniqueFieldName].id = (slotId + 1) % 50;
                        //chartData.countPerDimension[fieldname].id = (slotId + 1) % 50;

                        console.log("chartData.fctAddRealtimeDimension mqtt cb B");
                        chartData.bvv.Rebuild();
                    } catch (err) {
                        console.log("chartData.fctAddRealtimeDimension mqtt cb ERROR => " + err);
                    }
                }
            }, topic);
        } catch (err) {
            console.log("chartData.fctAddRealtimeDimension ERROR => " + err);
        }
    };

    chartData.fctInit();
    chartData.fctInitDataProvider();
    chartData.fctInitWorldUi();
    return chartData;
}

///
/// Reg
///

function internal_Manipulate(mMode, mDir, mDeviceId) {
    try {
        if (mMode.toUpperCase() === "SAVE") {

            console.log("S1");

            //parse data into c# readable format
            var UE = importNamespace("UnityEngine");
            var cDevStr = RT.Web.ReadFromStore(mDeviceId);
            var cDev = JSON.parse(cDevStr);

            console.log("S2");

            var partsPos = [];
            var parts = [];
            for (var i = 0; i < cDev.parts.length; i++) {
                var p = cDev.parts[i];
                if (p.hasOwnProperty("active")) {
                    console.log(cDev._id + "-" + p.name + ", active=" + p.active);
                    if (p.active == true) {
                        parts[i] = p.name;
                        partsPos[i] = new UE.Vector3(
                            p.position[0],
                            p.position[1],
                            p.position[2]);
                    }
                } else {
                    parts[i] = p.name;
                    partsPos[i] = new UE.Vector3(
                        p.position[0],
                        p.position[1],
                        p.position[2]);
                }
                console.log("S2 - " + i);
            }

            console.log("S3");
            //var partsPos = [new UE.Vector3(0.0, 0, 0), new UE.Vector3(0.3, 0, 0)];
            //var parts = ["s000", "s001"];
            importNamespace("RegMan").SetObjectProperties.finishRegistration(mDeviceId, partsPos, parts);
            console.log("S4");
        }

        if (mMode.toUpperCase() === "SCALE") {
            importNamespace("RegMan").SetObjectProperties.ScaleObject();
        }

        if (mMode.toUpperCase() === "TRANSLATE") {
            importNamespace("RegMan").SetObjectProperties.TranslateObject();
        }

        if (mMode.toUpperCase() === "ROTATE") {
            importNamespace("RegMan").SetObjectProperties.RotateObject();
        }

        if (mDir.toUpperCase() === "X") {
            importNamespace("RegMan").SetObjectProperties.ManipulateXAxis();
        }

        if (mDir.toUpperCase() === "Y") {
            importNamespace("RegMan").SetObjectProperties.ManipulateYAxis();
        }

        if (mDir.toUpperCase() === "Z") {
            importNamespace("RegMan").SetObjectProperties.ManipulateZAxis();
        }

        if (mDir.toUpperCase() === "ALL") {
            importNamespace("RegMan").SetObjectProperties.ManipulateAllAxes();
        }
    } catch (err) {
        console.log("internal_Manipulate ERROR => " + err + "(" + mMode + "|" + mDir + "|" + mDeviceId + ")");
    }
}

function internal_StartRegistration(event, deviceName) {
    console.log("internal_StartRegistration");
    try {
        importNamespace("RegMan").SetObjectProperties.StartRegistration(deviceName);
    } catch (err) {
        console.log("internal_startAlignment ERROR => " + err);
    }
}

function internal_RegisterModelTrackedNotification(mCallbackFunction) {
    try {
        importNamespace("RR").Runtime.RegisterModelTrackedNotification(mCallbackFunction);
    } catch (err) {
        console.log("internal_RegisterModelTrackedNotification ERROR => " + err);
    }
}

///
/// MRTK
/// 

function internal_SpawnNearMenu(mGoName) {
    var nm = {};
    nm.goName = mGoName;
    nm.prefabName = "NearMenu4x2";
    nm.go = RT.Unity.GetVisPrefabInstance(nm.prefabName, nm.goName);
    nm.goButtons = nm.go.transform.GetChild(2);

    nm.buttonCollection = null;
    try {
        nm.buttonCollection = importNamespace("RR").Runtime.GetGridObjectCollection(nm.goButtons.gameObject);
    } catch (err) {
        console.log("internal_SpawnNearMenu nm.buttonCollection ERROR => " + err);
    }

    //var collection = nm.go.GetComponentInChildren(importNamespace("Microsoft").MixedReality.Toolkit.Utilities.BaseObjectCollection);
    //nm.collection = collection;

    //var coll = nm.goButtons.GetComponent( importNamespace("Microsoft.MixedReality.Toolkit.Utilities").GridObjectCollection );
    //console.log("internal_SpawnNearMenu found => " + coll);

    //nm.goButtons = nm.collection.gameObject;
    console.log("internal_SpawnNearMenu found => " + nm.go.name + "/" + nm.goButtons.name);

    nm.fctCleanChildren = function () {
        try {
            var n = this.goButtons.transform.childCount;
            for (var i = n - 1; i >= 0; i--) {
                RT.Unity.DestroyGO(this.goButtons.transform.GetChild(i).gameObject);
            }
        } catch (err) {
            console.log("internal_SpawnNearMenu::fctCleanChildren ERROR => " + err);
        }
    }

    nm.fctAddButton = function (mGo) {
        try {
            console.log("internal_SpawnNearMenu::fctAddButton => " + mGo.name + ", " + this.goButtons.name);
            RT.Unity.SetParent(mGo, this.goButtons);
            this.fctUpdate();
        } catch (err) {
            console.log("internal_SpawnNearMenu::fctAddButton ERROR => " + err);
        }
    }

    nm.fctUpdate = function () {
        if (this.buttonCollection != null) {
            try {
                this.buttonCollection.UpdateCollection();
            } catch (err) {
                console.log("internal_SpawnNearMenu::fctUpdate UpdateCollection ERROR => " + err);
            }
        }
    }

    nm.fctCleanChildren();
    nm.fctUpdate();
    return nm;
}

function internal_SpawnButton(mGoName, mTitle, mSayTitle, mSayTitleEnabled, fctOnPressed) {

    var button = {};
    button.prefabName = "PressableButtonHoloLens2";
    button.goName = mGoName;
    button.title = mTitle;
    button.sayTitle = mSayTitle;
    button.mSayTitleEnabled = mSayTitleEnabled;
    button.go = RT.Unity.GetVisPrefabInstance(button.prefabName, button.goName);

    console.log("internal_SpawnButton 1 " + typeof button.go);

    try {
        if (button.go != null) {

            console.log("internal_SpawnButton 2");
            button.helper = importNamespace("RR").Runtime.GetMRTKButtonHelper(button.go);
            if (button.helper == null) {
                console.log("internal_SpawnButton button.helper not found!");
                return null;
            }

            button.helper.MainLabelText = button.title;
            button.helper.SeeItSayItLabelText = button.sayTitle;
            button.helper.SeeItSayItLabelEnabled = button.mSayTitleEnabled;

            //workaround for below
            button.tunnel = button.go.AddComponent(importNamespace("RR").VZMrtkButtonTunnel);
            button.tunnel.RegisterOnClickEvent(fctOnPressed);

            /*
            // THIS IS NOT WORKING on UWP/H1+H2 but in the editor 
            button.helper.OnClick.AddListener(function () {
                console.log("internal_SpawnButton 4c ==> PRESSED");
                if (fctOnPressed != null) {
                    try {
                        fctOnPressed();
                    } catch (pressErr) {
                        console.log("internal_SpawnButton PRESSED Error => " + pressErr);
                    }
                }
            });
            */
            button.helper.ForceRefresh();
        }
    } catch (err) {
        console.log("internal_SpawnButton ERROR => " + err);
    }
    return button;
}

///
/// IATK
///
function internal_GetReplicator() {
    try {
        if (RT.IATK.replicator == null) {
            RT.IATK.replicator = importNamespace("UnityEngine").GameObject.Find("Runtime").GetComponent(importNamespace("IATK").Replicator);
        }
        return RT.IATK.replicator;
    } catch (err) {
        console.log("internal_GetReplicator ERROR => " + err);
    }
    return null;
}





