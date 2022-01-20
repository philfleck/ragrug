
var myconsolelog = function (msg) {
    //console.log(msg);
}

var MAIN = {};

MAIN.isMobile = false;

MAIN.WEBAPI = {};
MAIN.location = {};
MAIN.User = {};
MAIN.User.reportId = "rr_report";
MAIN.User.nMsgs = 5;
MAIN.User.msgs = [];
MAIN.UE = importNamespace("UnityEngine");
MAIN.PUI = importNamespace("PowerUI");
MAIN.VZ = importNamespace("Vizario");
MAIN.RR = importNamespace("RR");

MAIN.WEBAPI.ip = "10.0.0.6";
//MAIN.WEBAPI.ip = "192.168.1.168";
//MAIN.WEBAPI.ip = "192.168.0.25";
//MAIN.WEBAPI.apiBase = "http://" + MAIN.WEBAPI.ip + ":1880";
MAIN.WEBAPI.uiurl = RT.Help.GetStringFromCfg("uiurl");
MAIN.WEBAPI.apiBase = RT.Help.GetStringFromCfg("apiurl");
MAIN.WEBAPI.mqttBrokerIp = RT.Help.GetStringFromCfg("mqttbrokerip");
MAIN.WEBAPI.mqttBrokerPort = parseInt(RT.Help.GetStringFromCfg("mqttbrokerport"));
myconsolelog("MAIN.WEBAPI.apiBase => " + MAIN.WEBAPI.apiBase);

MAIN.waCache = [];
MAIN.waCacheId = 0;
MAIN.downloadingWAs = false;
MAIN.worldGoName = "world";
MAIN.worldGo = null;
MAIN.palmHandMenuGoName = "PalmUpHandMenu";
MAIN.palmHandMenuGo = null;
MAIN.batchesToDownload = 0;

MAIN.syncingDevices = false;
MAIN.uipinned = false;

//usercanvas
MAIN.usercanvas = {};
MAIN.usercanvas.isClick = false;
MAIN.usercanvas.rootGoName = "usercanvas";
MAIN.usercanvas.lastChartId = 0;
MAIN.usercanvas.charts = [];
MAIN.usercanvas.charts2 = {};
MAIN.usercanvas.canvasSize = 0.3;
MAIN.usercanvas.canvasSpacedSize = MAIN.usercanvas.canvasSize * 1.35;
MAIN.envhooks = {};
MAIN.envhooks.descr = "this holds env hooks to targets";

MAIN.camHookGoName = "camHook";
MAIN.camHookGo = null;

//sticky fingers
MAIN.stickyfinger = {};
MAIN.stickyfinger.right = null;

// 3D buttons
MAIN.buttons = [];

//control
MAIN.enableLocalization = false;

MAIN.worldgo = null;






function SC_LOAD(event) {
    importNamespace("Vizario").AssetBundleHolder.ImportFromFile("sc.ab", "sc.ab");
    RT.Web.SetTiimeout(500, function () {
        //var go = MAIN.VZ.AssetBundleHolder.InstantiateGameObject("sc.ab", "scfull");
        //if (go != null) {
        //    MAIN.RR.Runtime.ToggleObjManipulation(go.name);
        //}

        var go = MAIN.VZ.AssetBundleHolder.InstantiateGameObject("sc.ab", "fire");
        if (go != null) {
            go.name = "sc_fire";
            MAIN.RR.Runtime.ToggleObjManipulation(go.name);
        }

        var go1 = MAIN.VZ.AssetBundleHolder.InstantiateGameObject("sc.ab", "cabinet");
        if (go1 != null) {
            go1.name = "sc_cabinet";
            MAIN.RR.Runtime.ToggleObjManipulation(go1.name);
        }
    });
}

function Main_GetNextChartId() {
    //return RT.Help.CreateGuid();
    return MAIN.usercanvas.lastChartId++;
}

function Main_InitUserCanvas() {
    //check for hookGo
    MAIN.camHookGoName = "camHook";
    MAIN.camHookGo = MAIN.UE.GameObject.Find(MAIN.camHookGoName);
    if (MAIN.camHookGo == null) {
        MAIN.camHookGo = new MAIN.UE.GameObject(MAIN.camHookGoName);
        RT.Unity.SetParent(MAIN.camHookGo, MAIN.UE.Camera.main);
        RT.Unity.SetLocalPose(MAIN.camHookGo, [0, 0, 1], [0, 0, 0, 1], [1, 1, 1]);
    }


    //check for root-usercanvas
    var rootGo = MAIN.UE.GameObject.Find(MAIN.usercanvas.rootGoName);
    if (rootGo == null) {
        rootGo = new MAIN.UE.GameObject(MAIN.usercanvas.rootGoName);
    }
    MAIN.usercanvas.rootGo = rootGo;

    if (MAIN.usercanvas.rootGo != null) {
        //do world go
        if (MAIN.worldGo == null) {
            MAIN.worldGo = MAIN.UE.GameObject.Find(MAIN.worldGoName);
        }
        RT.Unity.SetParent(MAIN.usercanvas.rootGo, MAIN.worldGo);
        RT.Unity.SetLocalPose(MAIN.usercanvas.rootGo, [0, 0, 0], [0, 0, 0, 1], [1, 1, 1]);

        //do hand go
        //var handGo = MAIN.UE.GameObject.Find(MAIN.palmHandMenuGoName);
        //RT.Unity.SetParent(MAIN.usercanvas.rootGo, handGo);
        //RT.Unity.SetLocalPose(MAIN.usercanvas.rootGo, [0.3, 0, 0], null, null);
    }
}

function MAIN_TestLocalPubSub() {
    console.log("MAIN_TestLocalPubSub ...");

    var localTopic = "a/local/topic";
    //without subscription, this topic remains local and is not callable from external messages
    RT.MQTT.RegisterCallbackTopic(function (topic, payload) {
        console.log("MAIN_TestLocalPubSub A recieved => " + topic + ", " + payload);
    }, localTopic);

    var localRemoteTopic = "b/remote/local/topic";
    RT.MQTT.Subscribe(localRemoteTopic); //subscribe to a topic as usual
    RT.MQTT.RegisterCallbackTopic(function (topic, payload) {
        console.log("MAIN_TestLocalPubSub B recieved => " + topic + ", " + payload);
    }, localRemoteTopic);

    //publish some test payloads
    RT.Web.SetTiimeout(2000, function () {
        //RT.MQTT.PublishMod can use the local fast path
        RT.MQTT.PublishMod(localTopic, "THIS IS A LOCAL ONLY PUB", true);
        RT.MQTT.PublishMod(localRemoteTopic, "THIS IS A REMOTE ONLY PUB", false);
    });
}

function MAIN_LINQ_TestingFilter(nIn) {
    console.log("LINQ MAIN_LINQ_TestingFilter nIn=" + nIn);
    var n = JSON.parse(nIn);
    return n.val1 > 1;
}

function MAIN_LINQ_Testing() {

    var ar = MAIN.RR.Runtime.testList;
    console.log("LINQ JS => typeof ar=" + typeof ar);
    console.log("LINQ JS => typeof ar[0]=" + typeof ar[0]);
    console.log("LINQ JS => ar[0]=" + ar[0]);
    console.log("LINQ JS => ar[0].val1=" + ar[0].val1);

    console.log("LINQ JS before RunLinqJsTest(MAIN_LINQ_TestingFilter)");
    MAIN.RR.Runtime.RunLinqJsTest(MAIN_LINQ_TestingFilter);
    console.log("LINQ JS after RunLinqJsTest(MAIN_LINQ_TestingFilter)");

    console.log("LINQ JS before RunLinqJsTest(lambda)");
    MAIN.RR.Runtime.RunLinqJsTest(function (nIn) {
        var n = JSON.parse(nIn);
        return n.val3 > 1.3;
    });
    console.log("LINQ JS after RunLinqJsTest(lambda)");

    /*
    MAIN.RR.Runtime.RunLinqJsTest2(function (total, next) {
        total.val1 += next.val1;
        total.val3 /= next.val3;
        total.val2 = "special";
        return total;
    });
    */

    var ar2 = MAIN.RR.Runtime.RunLinqFilter(ar, function (n) {
        return n.val3 > 1.3;
    });

    console.log("LINQ JS => typeof ar2=" + typeof ar2);

    var ar3 = MAIN.RR.Runtime.RunLinqFilter(ar2, function (n) {
        return n.val1 < 5;
    });

    try {
        console.log("LINQ JS parsing from text ...");
        var fct = new Function("return " + "function (n) {return JSON.parse(n).val1 == 2}")();
        MAIN.RR.Runtime.RunLinqFilter(ar, fct);
    } catch (err) {
        console.log("LINQ JS ERROR 2 => " + err);
    }

}

function MAIN_Init3DButtons() {
    console.log("RR MAIN_Init3DButtons");

    try {
        //MAIN_LINQ_Testing(); //here is something not working on the hololens
    } catch (err) {
        console.log("MAIN_LINQ_Testing FAILED => " + err);
    }

    if (MAIN.palmHandMenuGo == null) {
        MAIN.palmHandMenuGo = MAIN.UE.GameObject.Find(MAIN.palmHandMenuGoName);
    }

    if (MAIN.worldGo == null) {
        MAIN.worldGo = MAIN.UE.GameObject.Find(MAIN.worldGoName);
    }

    console.log("RR MAIN_Init3DButtons adding UIBTN-RegDevice");
    var deviceButton = RT.MRTK.SpawnButton("UIBTN-RegDevice", "Device", "Device", false, Main_RegisterDevice);
    MAIN.buttons.push(deviceButton);
    RT.Unity.SetParent(deviceButton.go, MAIN.palmHandMenuGo);
    RT.Unity.SetLocalPose(deviceButton.go, [0.02, 0.1, 0], null, null);

    console.log("RR MAIN_Init3DButtons adding UIBTN-Canvas");
    var canvasButton = RT.MRTK.SpawnButton("UIBTN-Canvas", "Canvas", "Canvas", false, function () { Main_Canvas(); });
    MAIN.buttons.push(canvasButton);
    RT.Unity.SetParent(canvasButton.go, MAIN.palmHandMenuGo);
    RT.Unity.SetLocalPose(canvasButton.go, [0.08, 0.1, 0], null, null);

    console.log("RR MAIN_Init3DButtons adding UIBTN-IatkChart");
    var iatkButton = RT.MRTK.SpawnButton("UIBTN-IatkChart", "IATKChart", "IATKChart", false, function () { Main_CanvasStyleClick('IATKChart'); });
    MAIN.buttons.push(iatkButton);
    RT.Unity.SetParent(iatkButton.go, MAIN.palmHandMenuGo);
    RT.Unity.SetLocalPose(iatkButton.go, [0.14, 0.1, 0], null, null);


    //env vis binder
    console.log("RR MAIN_Init3DButtons adding UIBTN-rrenv");
    var rrenvButton = RT.MRTK.SpawnButton("UIBTN-rrenv", "RREnv Start", "RREnv Start", false, function () { MAIN_StartRREnvTracking(); });
    MAIN.buttons.push(rrenvButton);
    RT.Unity.SetParent(rrenvButton.go, MAIN.palmHandMenuGo);
    RT.Unity.SetLocalPose(rrenvButton.go, [-0.04, 0.1, 0], null, null);

    //temp cnr
    console.log("RR MAIN_Init3DButtons adding UIBTN-tempcnr");
    var cnrButton = RT.MRTK.SpawnButton("UIBTN-tempcnr", "Temp CNR", "Temp CNR", false, function () { CNR_InitFromId(/*"f3784d00.40ef8"*/"a3b70a95.71cd58"); });
    MAIN.buttons.push(cnrButton);
    RT.Unity.SetParent(cnrButton.go, MAIN.palmHandMenuGo);
    RT.Unity.SetLocalPose(cnrButton.go, [-0.04, 0.1, 0], null, null);

    //fridge cnr
    console.log("RR MAIN_Init3DButtons adding UIBTN-fridgecnr");
    var cnrButton = RT.MRTK.SpawnButton("UIBTN-fridgecnr", "Fridge CNR", "Fridge CNR", false, function () { CNR_InitFromId("f3784d00.40ef8"); });
    MAIN.buttons.push(cnrButton);
    RT.Unity.SetParent(cnrButton.go, MAIN.palmHandMenuGo);
    RT.Unity.SetLocalPose(cnrButton.go, [-0.04, 0.1, 0], null, null);

    
    //mopop cnr
    console.log("RR MAIN_Init3DButtons adding UIBTN-mopopcnr");
    var mopopCnrButton = RT.MRTK.SpawnButton("UIBTN-mopopcnr", "Mopop CNR", "Mopop CNR", false, function () { CNR_InitFromId("923bd7d5.f34fa8"); });
    MAIN.buttons.push(mopopCnrButton);
    RT.Unity.SetParent(mopopCnrButton.go, MAIN.palmHandMenuGo);
    RT.Unity.SetLocalPose(mopopCnrButton.go, [-0.04, 0.1, 0], null, null);


    // 17e18994.3545c6
    
    var mopopCnrButton = RT.MRTK.SpawnButton("UIBTN-UNIKON", "UNIKON", "UNIKON", false, function () { CNR_InitFromId("17e18994.3545c6"); });
    MAIN.buttons.push(mopopCnrButton);
    RT.Unity.SetParent(mopopCnrButton.go, MAIN.palmHandMenuGo);
    RT.Unity.SetLocalPose(mopopCnrButton.go, [-0.04, 0.1, 0], null, null);

    /*
    //mopop js
    console.log("RR MAIN_Init3DButtons adding UIBTN-mopopjs");
    var mopopJSButton = RT.MRTK.SpawnButton("UIBTN-mopopjs", "Mopop JS", "Mopop JS", false, function () {
        RT.Web.SetTiimeout(8000, function () {
            importNamespace("Vizario").AssetBundleHolder.ImportFromFile(
                MAIN.location.envassetbundle, MAIN.location.envassetbundle);
            MOPOP_AutoStart();
        });
    });
    MAIN.buttons.push(mopopJSButton);
    RT.Unity.SetParent(mopopJSButton.go, MAIN.palmHandMenuGo);
    RT.Unity.SetLocalPose(mopopJSButton.go, [-0.04, 0.1, 0], null, null);
    */

    //near menu
    console.log("RR MAIN_Init3DButtons adding UIBTN-MainMenu #buttons=" + MAIN.buttons.length);

    var nearMenu = RT.MRTK.SpawnNearMenu("UIBTN-MainMenu");
    console.log("RR MAIN_Init3DButtons spawned nearMenu");

    for (var i = 0; i < MAIN.buttons.length; i++) {
        console.log("RR MAIN_Init3DButtons setting up nearMenu => +" + MAIN.buttons[i].go.name);
        nearMenu.fctAddButton(MAIN.buttons[i].go);
    }
    console.log("RR MAIN_Init3DButtons preparing final");
    RT.Unity.SetParent(nearMenu.go, MAIN.palmHandMenuGo);
    RT.Unity.SetLocalPose(nearMenu.go, [-0.0625, -0.025, 0], null, null);

    console.log("RR MAIN_Init3DButtons done");
}

function MAIN_InitIatkReplicator() {
    console.log("MAIN_InitIatkReplicator ...");
    try {
        var repl = MAIN_GetRepl();
        if (repl != null) {

            /*
            RT.Web.SetTiimeout(5, function () {
                console.log("MAIN_InitIatkReplicator repl.Publish = MAIN_IatkPublishImple");
                repl.Publish = MAIN_IatkPublishImple;
                console.log("MAIN_InitIatkReplicator repl.Publish = MAIN_IatkPublishImple done");
            });

            RT.Web.SetTiimeout(10, function () {
                console.log("MAIN_InitIatkReplicator repl.PublishDatasource = MAIN_IatkPublishDatasourceImple");
                repl.PublishDatasource = MAIN_IatkPublishDatasourceImple;
                console.log("MAIN_InitIatkReplicator repl.PublishDatasource = MAIN_IatkPublishDatasourceImple done");
            });

            RT.Web.SetTiimeout(15, function () {
                console.log("MAIN_InitIatkReplicator repl.GetStreamData = MAIN_IatkGetStreamData");
                repl.GetStreamData = MAIN_IatkGetStreamData;
                console.log("MAIN_InitIatkReplicator repl.GetStreamData = MAIN_IatkGetStreamData done");
            });

            RT.Web.SetTiimeout(20, function () {
                console.log("MAIN_InitIatkReplicator repl.NewVisSpawnNotification = MAIN_IatkSpawnNot");
                repl.NewVisSpawnNotification = MAIN_IatkSpawnNot;
                console.log("MAIN_InitIatkReplicator repl.NewVisSpawnNotification = MAIN_IatkSpawnNot done");
            });
            
            RT.Web.SetTiimeout(25, function () {
                console.log("MAIN_InitIatkReplicator => MAIN_IatkListenForReplicationUpdate");
                MAIN_IatkListenForReplicationUpdate();
                console.log("MAIN_InitIatkReplicator => MAIN_IatkListenForReplicationUpdate done");
            });
            */

            /*
            Func<string, string, string> publish,
            Func<string, string, string> publishDatasource,
            Func<string, Func<string, string, string>, string> getStreamDatam,
            Func<string, string> newVisSpawnNotification)
             */
            /*
            console.log("MAIN_InitIatkReplicator => repl.SetCallbacks");
            repl.SetCallbacks(MAIN_IatkPublishImple, MAIN_IatkPublishDatasourceImple, MAIN_IatkGetStreamData, MAIN_IatkSpawnNot);
            console.log("MAIN_InitIatkReplicator => repl.SetCallbacks done");
            */

            console.log("MAIN_InitIatkReplicator => MAIN.RR.Runtime.SetReplicatorCallbacks");
            MAIN.RR.Runtime.SetReplicatorCallbacks(repl, MAIN_IatkPublishImple, MAIN_IatkPublishDatasourceImple, MAIN_IatkGetStreamData, MAIN_IatkSpawnNot);
            console.log("MAIN_InitIatkReplicator => MAIN.RR.Runtime.SetReplicatorCallbacks done");

            console.log("MAIN_InitIatkReplicator => MAIN_IatkListenForReplicationUpdate");
            MAIN_IatkListenForReplicationUpdate();
            console.log("MAIN_InitIatkReplicator => MAIN_IatkListenForReplicationUpdate done");

        } else {
            console.log("MAIN_InitIatkReplicator repl=null!");
        }
    } catch (err) {
        console.log("MAIN_InitIatkReplicator ERROR => " + err);
    }
}

function MAIN_IatkSpawnNot(mGoName) {
    try {
        MAIN.RR.Runtime.ToggleObjManipulation(mGoName);
        var go = MAIN.UE.GameObject.Find(mGoName);
        var bc = MAIN.RR.Runtime.AddBoxCollider(go);
        bc.size = new MAIN.UE.Vector3(0.3, 0.3, 0.3);

        var hT = MAIN.camHookGo.transform.position;
        var hR = MAIN.camHookGo.transform.rotation;
        var T = [hT.x, hT.y, hT.z];
        var R = [hR.x, hR.y, hR.z, hR.w];
        RT.Unity.SetPose(go, T, R, null);
    } catch (err) {
        console.log("MAIN_IatkSpawnNot ERROR => " + err);
    }
    return "";
}

function MAIN_IatkPublishImple(id, payload) {
    console.log("MAIN_IatkPublishImple => " + id + ", " + payload);
    var topic = "rr/vis/replication/" + id + "/view";
    RT.MQTT.Publish(topic, payload);
    return topic;
}

function MAIN_IatkPublishDatasourceImple(id, payload) {
    console.log("MAIN_IatkPublishDatasourceImple => " + id + ", " + payload);
    var topic = "rr/vis/replication/" + id + "/ds";
    RT.MQTT.Publish(topic, payload);
    return topic;
}

function MAIN_IatkGetStreamData(uri, mOnNewDataCallbackId) {
    //function MAIN_IatkGetStreamData(uri, mOnNewDataCallback) {
    console.log("MAIN_IatkGetStreamData uri = " + uri);
    //console.log("MAIN_IatkGetStreamData mOnNewDataCallback = " + mOnNewDataCallback);
    console.log("MAIN_IatkGetStreamData mOnNewDataCallbackId = " + mOnNewDataCallbackId);
    try {
        RT.MQTT.Subscribe(uri);
        /*var fct = new Function("return " + mOnNewDataCallback)();*/
        /*RT.MQTT.RegisterCallbackTopic(function (topic, payload) {
            fct(topic, payload);
        }, uri);*/
        /*RT.MQTT.RegisterCallbackTopic(function (topic, payload) {
            mOnNewDataCallback(topic, payload);
        }, uri);*/

        /*importNamespace("Vizario").MQTTManager.RegisterCallbackTopicCs(function (topic, payload) {
            mOnNewDataCallback(topic, payload);
        }, uri);*/

        //importNamespace("Vizario").MQTTManager.RegisterCallbackTopicCs(
        //    MAIN.RR.Runtime.streamParserCbs[mOnNewDataCallbackId], uri);

        //importNamespace("Vizario").MQTTManager.RegisterCallbackTopicCs(
        //    MAIN.RR.Runtime.GetParserFunc(mOnNewDataCallbackId), uri);

        MAIN.RR.Runtime.SetMqttParserFuncFromList(mOnNewDataCallbackId, uri);

    } catch (err) {
        console.log("MAIN_IatkGetStreamData ERROR => " + err);
    }
    return uri;
}

function MAIN_IatkListenForReplicationUpdate() {
    console.log("MAIN_IatkListenForReplicationUpdate ...");
    try {
        var t = "rr/vis/replication/#";
        RT.MQTT.Subscribe(t);
        RT.MQTT.RegisterCallbackTopic(function (topic, payload) {
            console.log("MAIN_IatkListenForReplicationUpdate => topic:" + topic + ", payload:" + payload);

            var uid = null;
            var parts = topic.split('/');
            var plType = parts[parts.length - 1];

            if (parts.length > 1) {
                uid = parts[parts.length - 2];
            }

            console.log("MAIN_IatkListenForReplicationUpdate plType=" + plType + ", uid=" + uid);

            if (plType == "view" && uid != null && uid.length > 0) {
                //process payload
                console.log("MAIN_IatkListenForReplicationUpdate updating repliques ...");
                MAIN_GetRepl().UpdateReplicas(uid, payload, null);
            }

            if (plType == "ds" && uid != null && uid.length > 0) {
                console.log("MAIN_IatkListenForReplicationUpdate updating datasources ...");
                MAIN_GetRepl().UpdateDatasource(uid, payload);
            }

            return topic;
        }, t);
    } catch (err) {
        console.log("MAIN_IatkListenForReplicationUpdate ERROR => " + err);
    }
}

function MAIN_GetRepl() {
    return RT.IATK.GetReplicator();
}

function MAIN_Init2DMobileUi() {
    if (!MAIN.isMobile) {
        return;
    }

    var mainui = MAIN.UE.GameObject("mainui");
    var mm = mainui.AddComponent(MAIN.PUI.Manager);
    mm.Url = MAIN.WEBAPI.uiurl + "/mobileui.html";
    //mm.document.location.href = MAIN.WEBAPI.uiurl + "/main.html";
    mm.Navigate(mm.Document);
}

function Main_SpawnCanvasChart(mPrefabName) {
    var nextId = Main_GetNextChartId();

    if (mPrefabName == "IATKChart") {
        var chartObj = RT.VIS.GetNewChartObjectIATK(nextId, MAIN.usercanvas.charts.length,
            mPrefabName, MAIN.usercanvas.canvasSize, MAIN.usercanvas.canvasSpacedSize);
        MAIN.usercanvas.charts.push(chartObj);
        MAIN.RR.Runtime.ToggleObjManipulation(chartObj.chartGoName);

        try {
            var hT = MAIN.camHookGo.transform.position;
            var hR = MAIN.camHookGo.transform.rotation;
            var T = [hT.x, hT.y, hT.z];
            var R = [hR.x, hR.y, hR.z, hR.w];
            RT.Unity.SetPose(chartObj.chartGo, T, R, null);
        } catch (err) {
            console.log("Main_SpawnCanvasChart placement ERROR => " + err);
        }
        return;
    }

    var chartObj = RT.VIS.GetNewChartObject(nextId, MAIN.usercanvas.charts.length,
        mPrefabName, MAIN.usercanvas.canvasSize, MAIN.usercanvas.canvasSpacedSize);
    MAIN.usercanvas.charts.push(chartObj);

    var fixAxis = true;
    var addBg = false;
    var addBgBox = false;

    if (mPrefabName.replace("2D", "") != mPrefabName) {
        addBg = true;
    }

    if (mPrefabName.replace("3D", "") != mPrefabName) {
        addBgBox = true;
    }

    if (chartObj.chartGo) {
        if (addBg) {
            var bgGo = RT.Unity.GetVisPrefabInstance("bgplane", chartObj.chartGo.name + "bg");
            RT.Unity.SetParent(bgGo, chartObj.chartGo);
            RT.Unity.SetLocalPose(
                bgGo,
                [0.5, 0.5, 0.01], //was: [-wallWidth * 0.2, -wallHeight * 0.2, 0],
                [-0.707, 0, 0, 0.707], //[0, 1, 0, 0]
                [0.15, 0.15, 0.15]
            );

            var r = bgGo.GetComponent(MAIN.UE.Renderer);
            if (r != null) {
                //r.material.color = MAIN.UE.Color.green;
                r.material.color = new MAIN.UE.Color(0.3, 0.3, 0.3, 0.9);
            }
        }

        if (addBgBox) {
            var bgGo = RT.Unity.GetVisPrefabInstance("bgbox", chartObj.chartGo.name + "bg");
            RT.Unity.SetParent(bgGo, chartObj.chartGo);
            RT.Unity.SetLocalPose(
                bgGo,
                [0.5, 0.5, 0.5], //was: [-wallWidth * 0.2, -wallHeight * 0.2, 0],
                [0, 0, 0, 1], //[0, 1, 0, 0]
                [1, 1, 1]
            );
        }

        if (fixAxis) {

            /*
            var axisP = chartObj.bvv.Presenter.AxisPresenters;
            axisP[0].IsCategorical = true;
            axisP[0].LabelTickIntervall = 5;
            axisP[0].LabelOrientation = 2; //X-Axis //this works
            axisP[1].LabelOrientation = 2; //Y-Axis //this works
            */

            //myconsolelog("MOPOP_InitYearHist after cb setting axis ... #axisP=" + axisP.length);
            //chartData.bvv.Rebuild();

        }
    }
}

function Main_ClickCooldown() {
    MAIN.usercanvas.isClick = true;
    RT.Web.SetTiimeout(3000, function () {
        MAIN.usercanvas.isClick = false;
    });
}

function Main_CanvasStyleClick(mPrefabName) {
    if (!MAIN.usercanvas.isClick) {
        Main_ClickCooldown();
        Main_SpawnCanvasChart(mPrefabName);
    }
}

function Main_DisableDiagnostics() {
    myconsolelog("Main_DisableDiagnostics disabling ...");
    try {
        var go = MAIN.UE.GameObject.Find("Diagnostics");
        if (go != null) {
            go.SetActive(false);
        }

        var leftTipGo = MAIN.UE.GameObject.Find("MyLeftTipSphere");
        if (leftTipGo != null) {
            leftTipGo.transform.localScale = MAIN.UE.Vector3(0.01, 0.01, 0.01);
            leftTipGo.SetActive(false);
        }

        var rightTipGo = MAIN.UE.GameObject.Find("MyRightTipSphere");
        if (rightTipGo != null) {
            rightTipGo.transform.localScale = MAIN.UE.Vector3(0.01, 0.01, 0.01);
            rightTipGo.SetActive(false);
        }
    } catch (err) {
        myconsolelog("Main_DisableDiagnostics ERROR => " + err)
    }
}


function Main_ReportToUi(mMsg) {
    myconsolelog(mMsg);
    $("rr-info").hide();
    return;
    try {
        MAIN.User.msgs.push(mMsg);
        RT.Help.Log(mMsg);
        if (MAIN.User.msgs.length > MAIN.User.nMsgs) {
            MAIN.User.msgs.shift();
        }

        var allMsg = "";
        var N = (MAIN.User.msgs.length > MAIN.User.nMsgs ? MAIN.User.nMsgs : MAIN.User.msgs.length) - 1;
        for (var i = N; i >= 0; i--) {
            allMsg += "<span>" + MAIN.User.msgs[i] + "</span></br>";
        }
        document.getElementById(MAIN.User.reportId).innerHTML = allMsg;
    } catch (err) {
        myconsolelog("Main_ReportToUi Error => " + err);
    }
}

function Main_InitNodeRedLinking() {
    var tTopic = "NR/linking";
    RT.MQTT.Subscribe(tTopic);
    RT.MQTT.RegisterCallbackTopic(
        function (topic, payload) {
            myconsolelog("mqtt-sub: " + topic + " | " + payload);
            if (topic == tTopic) {
            }
        }, tTopic);
}

function Main_InitInject() {
    var tTopic = "arclient/inject";
    RT.MQTT.Subscribe(tTopic);
    RT.MQTT.RegisterCallbackTopic(
        function (topic, payload) {
            console.log("INJECT: " + topic + " | " + payload);
            var res = eval(payload);
            RT.MQTT.Publish("arclient/response", "Executeted => " + payload);
        }, tTopic);
    console.log("INJECT init done");
}

function Main_InitPosUpdater() {
    RT.Web.SetInterval(5000, 300, Main_PosUpdater);
}

function Main_PosUpdater() {
    try {
        var UE = importNamespace("UnityEngine");
        if (MAIN.hasOwnProperty("location")) {
            if (MAIN.location.hasOwnProperty("devices")) {
                if (MAIN.location.devices.hasOwnProperty("data")) {
                    var data = {};
                    data.objs = [];
                    data.head = {};
                    data.head.transform = {};

                    //setup head
                    var MC = UE.Camera.main;
                    var hT = [];
                    var hR = [];
                    var hS = [];
                    hT[0] = MC.transform.position.x;
                    hT[1] = MC.transform.position.y;
                    hT[2] = MC.transform.position.z;

                    hR[0] = MC.transform.rotation.x;
                    hR[1] = MC.transform.rotation.y;
                    hR[2] = MC.transform.rotation.z;
                    hR[3] = MC.transform.rotation.w;

                    hS[0] = MC.transform.localScale.x;
                    hS[1] = MC.transform.localScale.y;
                    hS[2] = MC.transform.localScale.z;

                    data.head.transform.T = hT;
                    data.head.transform.R = hR;
                    data.head.transform.S = hS;


                    //setup objects
                    var keys = Object.keys(MAIN.location.devices.data);
                    for (var i = 0; i < keys.length; i++) {
                        var k = keys[i];
                        //var cDev = MAIN.location.devices.data[k];
                        var go = UE.GameObject.Find(k);
                        if (go != null) {

                            var n = k;
                            var T = [];
                            var R = [];
                            var S = [];

                            T[0] = go.transform.position.x;
                            T[1] = go.transform.position.y;
                            T[2] = go.transform.position.z;

                            R[0] = go.transform.rotation.x;
                            R[1] = go.transform.rotation.y;
                            R[2] = go.transform.rotation.z;
                            R[3] = go.transform.rotation.w;

                            S[0] = go.transform.localScale.x;
                            S[1] = go.transform.localScale.y;
                            S[2] = go.transform.localScale.z;

                            var obj = {};
                            obj.transform = {};
                            obj.transform.T = T;
                            obj.transform.R = R;
                            obj.transform.S = S;
                            obj.name = n;
                            data.objs[i] = obj;
                        }
                    }

                    var dataStr = JSON.stringify(data);
                    //myconsolelog("dataStr => " + dataStr);
                    RT.MQTT.Publish("companion/env", dataStr);
                }
            }
        }
    } catch (err) {
        myconsolelog("Main_PosUpdater ERROR => " + err);
    }
}

function Main_Reload(event) {
    //document.location.href = "http://10.0.0.2:8080/main.html";
    //document.location.href = "http://192.168.1.115:8080/main.html";
    //document.location.href = "http://192.168.0.53/HtmlUi/main.html";

    document.location.href = document.location.href;
}


function Main_LocateArea(event) {

    RT.Unity.SpawnNotification(5, "Localization started ..");

    $("#rr_locate_state").removeClass("orange").removeClass("green").removeClass("red").addClass("red");
    $('#rr_info').show();
    Main_ReportToUi("Localizing ...");
    var networkName = RT.Help.GetNetwork();

    //testfix
    //networkName = "NETGEAR81-5G";

    var url = MAIN.WEBAPI.apiBase + "/data?name=" + networkName;
    Main_ReportToUi("Looking for area [" + networkName + "]");

    var headers = ["content-type", "application/x-www-form-urlencoded"];
    var data = "";

    RT.Web.SendWebReq("GET", url, headers, data,
        function (mError, mData) {
            myconsolelog("Main_LocateArea web-response ERR = > " + mError);
            myconsolelog("Main_LocateArea web-response Data = > [" + typeof mData + "] " + mData);

            if (mError) {
                Main_ReportToUi("ERROR: Could not get data from [" + url + "]");
                $("#rr_locate_state").removeClass("orange").removeClass("green").removeClass("red").addClass("red");
            } else {
                if (mData === "null") {
                    var msg = "No data found for [" + networkName + "] -> adding new";
                    Main_ReportToUi(msg);
                    Main_CreateWA();
                    $("#rr_locate_state").removeClass("orange").removeClass("green").removeClass("red").addClass("orange");
                } else {
                    if (!MAIN.downloadingWAs) {
                        MAIN.downloadingWAs = true;
                        var msg = "Data found for [" + networkName + "], downloading ...";
                        Main_ReportToUi(msg);

                        //{"_id":"NETGEAR81-5G","_rev":"1-48f10fc5a23a85b566cabf6558da225f","type":"location","numwabatches":42,"waprefix":"NETGEAR81-5G-MarkUpsRoot-WA-"}
                        //RT.Help.Log("Data => [" + mData + "]");

                        var data = JSON.parse(mData);
                        MAIN.location.data = data;
                        if (data.type === "location") {
                            $("#rr_locate_state").removeClass("orange").removeClass("green").removeClass("red").addClass("orange");
                            MAIN.batchesToDownload = data.numwabatches;
                            Main_ReportToUi("data._id = " + data._id);
                            Main_ReportToUi("data.type = " + data.type);
                            Main_ReportToUi("data.waprefix = " + data.waprefix);
                            Main_ReportToUi("data.numwabatches = " + data.numwabatches);

                            if (data.hasOwnProperty("assetsurl")) {
                                Main_ReportToUi("data.assetsurl = " + data.assetsurl);
                                Main_ReportToUi("data.assetsname = " + data.assetsname);
                                Main_ReportToUi("data.assetsname = " + data.assetshash);

                                RT.Web.SetTiimeout(100, function () {
                                    Main_DownloadAssetBundle(data.assetsurl, data.assetsname, data.assetshash);
                                });
                            }

                            if (data.hasOwnProperty("imagetargetenv")) {
                                var envTargets = data.imagetargetenv;
                                MAIN.location.envtargets = {
                                    "xml": envTargets[0],
                                    "dat": envTargets[1]
                                };
                            }

                            if (data.hasOwnProperty("quickloc")) {
                                //TODO call fernandos code here
                                var ql = data.quickloc;
                                var qlJsonStr = JSON.stringify(ql);

                                RT.Web.SetInterval(50, 10000, function () {
                                    RT.Unity.SpawnNotification(5, "QuickLocalization called ... ");
                                    MAIN.RR.Runtime.QuickLocalization(qlJsonStr, function (tx, ty, tz, rt, rx, ry, rz, rw) {
                                        console.log("QUICKLOC JS => LOCALIZED x=" + tx);
                                        console.log("QUICKLOC JS => LOCALIZED y=" + ty);
                                        console.log("QUICKLOC JS => LOCALIZED z=" + tz);
                                        RT.Unity.SpawnNotification(5, "QL LOCALIZED!");
                                    });
                                });
                            }

                            if (data.hasOwnProperty("envassetbundle")) {

                                var devEnd = "";
                                if (RT.Help.GetDeviceType() == "ANDROID") {
                                    devEnd = ".android";
                                }

                                MAIN.location.envassetbundle = data.envassetbundle;

                                var assetFile = MAIN.location.envassetbundle;
                                var reqHeaders = ["content-type", "application/x-www-form-urlencoded"];
                                var url = MAIN.WEBAPI.apiBase + "/getfile?name=" + assetFile + devEnd;

                                RT.Web.DownloadFile("GET", url, reqHeaders, assetFile, false, function () {
                                    myconsolelog("Main_LocateArea envassetbundle Asset [" + assetFile + "] ... done");
                                    //we will import it when needed
                                });
                            }

                            if (data.hasOwnProperty("moreassets")) {
                                ma = data.moreassets;
                                for (var mai = 0; mai < ma.length; mai++) {
                                    var assetFile = ma[mai];
                                    var reqHeaders = ["content-type", "application/x-www-form-urlencoded"];
                                    var url = MAIN.WEBAPI.apiBase + "/getfile?name=" + assetFile;

                                    RT.Web.DownloadFile("GET", url, reqHeaders, assetFile, false, function () {
                                        myconsolelog("Main_LocateArea envassetbundle Asset [" + assetFile + "] ... done");
                                        //we will import it when needed
                                    });
                                }
                            }

                            //###EXIT
                            //return;
                            Main_ReportToUi("Downloading " + MAIN.batchesToDownload + "WA batches");
                            var waUrl = MAIN.WEBAPI.apiBase + "/data?name=";
                            for (var i = 0; i < data.numwabatches; i++) {
                                //RT.Web.SetTiimeout(100 * i, Main_DownloadWABatch(waUrl, data.waprefix, i, data.numwabatches));

                                //on for hololens
                                if (RT.Help.GetDeviceType() == "EDITOR") {
                                    //Do not download and process WA batches;
                                } else if (RT.Help.GetDeviceType() == "WSA") {
                                    if (MAIN.enableLocalization) {
                                        Main_DownloadWABatch(waUrl, data.waprefix, i);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
}

function Main_DownloadAssetBundle(mUrl, mName, mHashUrl) {

    //read hash from disk
    var headers = ["content-type", "application/json"];
    var data = "";

    RT.Web.SendWebReq("GET", mHashUrl, headers, data,
        function (mError, mData) {
            myconsolelog("[" + mName + "]" + "Downloaded hash => " + mData);

            //read hash from disk
            var fnHash = mName + ".hash";
            var fHash = RT.Help.ReadFile(fnHash);
            myconsolelog("[" + mName + "]" + "Assets: " + fnHash + " -- " + fHash + ", " + fHash.length);

            if (fHash.length == 0) {
                myconsolelog("[" + mName + "]" + "No stored hash for " + mName);
                //nothing found
                //write hash and download asset
                RT.Help.WriteFile(fnHash, mData);

                //download asset here
                RT.Web.SendWebReq("GET", mUrl, headers, data,
                    function (mError, mData) {
                        myconsolelog("[" + mName + "]" + "Main_DownloadAssetBundle complete! for " + mName);
                        RT.Help.WriteFile(mName, mData);
                        RT.Web.WriteToStore(mName, mData);
                        importNamespace("Vizario").AssetBundleHolder.ImportFromStore(mName);
                    }
                );
            } else {
                myconsolelog("[" + mName + "]" + "hash found for " + mName);
                myconsolelog("[" + mName + "]" + "comapring " + mData + " vs " + fHash);

                //compare hashes, if similar load from disk
                if (mData === fHash) {
                    myconsolelog("[" + mName + "]" + "hashes equal, loading from disk");
                    var asset = RT.Help.ReadFile(mName);
                    RT.Web.WriteToStore(mName, asset);
                    importNamespace("Vizario").AssetBundleHolder.ImportFromStore(mName);
                } else {
                    myconsolelog("[" + mName + "]" + "hashes NOT equal, updating");
                    RT.Help.WriteFile(fnHash, mData);
                    //download asset here
                    RT.Web.SendWebReq("GET", mUrl, headers, data,
                        function (mError, mData) {
                            myconsolelog("[" + mName + "]" + "Main_DownloadAssetBundle complete! for " + mName);
                            RT.Help.WriteFile(mName, mData);
                            RT.Web.WriteToStore(mName, mData);
                            importNamespace("Vizario").AssetBundleHolder.ImportFromStore(mName);
                        }
                    );
                }

            }
        }
    );


    return;

    /*
    /// old code
    Main_ReportToUi("Main_DownloadAssetBundle " + mUrl + ", " + mName);

    var url = mUrl;

    var headers = ["content-type", "application/json"];
    var data = "";

    RT.Web.SendWebReq("GET", url, headers, data,
        function (mError, mData) {
            //myconsolelog("Main_DownloadAssetBundle => " + mData);
            myconsolelog("Main_DownloadAssetBundle complete! for " + mName);
            RT.Web.WriteToStore(mName, mData);
            importNamespace("Vizario").AssetBundleHolder.ImportFromStore(mName);

            //just for testing
            //var GO = importNamespace("Vizario").AssetBundleHolder.InstantiateGameObject(mName, "Radiator_sl");

        }
    );
    */
}

function Main_ButtonClicked(event) {
    //document.getElementById("mstatus").innerHTML = "Main_buttonClicked " + event.target.id;
}

function Main_RegisterDevice(event) {

    $("#rr_registerd_state").removeClass("orange").removeClass("green").removeClass("red").addClass("orange");

    $('#rr_info').show();
    Main_ReportToUi("Syncing devices");

    if (MAIN.syncingDevices === true) {
        $("#rr_registerd_state").removeClass("orange").removeClass("green").removeClass("red").addClass("green");
        return;
    }
    MAIN.syncingDevices = true;

    //importNamespace("Vizario").AssetBundleHolder.ImportFromFile(
    //    MAIN.location.envassetbundle, MAIN.location.envassetbundle);

    //TODO
    // 1. download list of sensors
    // 2. choose from list
    // 3. perform registration of device
    // 4. store registration of device

    try {
        var devices = RT.Help.GetNetwork();
        devices += "-devices";
        var reqDevicesUrl = MAIN.WEBAPI.apiBase + "/data?name=" + devices;

        var reqHeaders = ["content-type", "application/x-www-form-urlencoded"];
        var reqData = "";

        RT.Web.SendWebReq("GET", reqDevicesUrl, reqHeaders, reqData,
            function (mError, mData) {
                try {
                    $("#rr_registerd_state").removeClass("orange").removeClass("green").removeClass("red").addClass("orange");
                    if (!mError) {
                        if (mData != "null") {
                            MAIN.syncingDevices = false;
                            RT.Help.Log("Main_RegisterDevice mError=" + mError + ", " + typeof mError)
                            RT.Help.Log("Main_RegisterDevice mData=" + mData + ", " + typeof mData);
                            Main_ReportToUi("Main_RegisterDevice mData =" + mData);


                            RT.Help.Log("Main_RegisterDevice A");

                            var devices = JSON.parse(mData);

                            RT.Help.Log("Main_RegisterDevice B");

                            if (!("devices" in MAIN.location)) {

                                RT.Help.Log("Main_RegisterDevice C");
                                MAIN.location.devices = {};
                                MAIN.location.devices.data = [];
                            }

                            RT.Help.Log("Main_RegisterDevice D");

                            MAIN.location.devices.cfg = devices;

                            RT.Help.Log("Main_RegisterDevice E");

                            RT.Help.Log("Main_RegisterDevice E a = " + devices.present.length);

                            if ("present" in devices) {

                                RT.Help.Log("Main_RegisterDevice F");

                                for (var i = 0; i < devices.present.length; i++) {
                                    var dn = devices.present[i];

                                    RT.Help.Log("Main_RegisterDevice G dn=" + dn);

                                    var dnUrl = MAIN.WEBAPI.apiBase + "/data?name=" + dn;
                                    var dnHeaders = ["content-type", "application/x-www-form-urlencoded"];
                                    var dnData = "";


                                    RT.Web.SendWebReq("GET", dnUrl, dnHeaders, dnData,
                                        function (mError, mData) {
                                            if (!mError) {
                                                if (mData != "null") {
                                                    RT.Help.Log("Main_RegisterDevice H download OK => " + mData);
                                                    var dData = JSON.parse(mData);
                                                    MAIN.location.devices.data[dData.id] = dData;
                                                    //myconsolelog("Device Loaded => dData.id=" + dData.id + ", dData=" + JSON.stringify(dData));
                                                    RT.Web.WriteToStore(dData.id, mData);
                                                    RT.Web.SetTiimeout(50, Main_DevicesSynced); //was 5   
                                                }
                                            }
                                        });

                                }
                            } else {
                                RT.Help.Log("Main_RegisterDevice present NOT FOUND");
                            }
                        } else {
                            //document.getElementById("mstatus").innerHTML = "Main_RegisterDevice data is null!"
                            Main_ReportToUi("RegisterDevice data is null!");
                        }
                    } else {
                        //document.getElementById("mstatus").innerHTML = "Main_RegisterDevice ERROR occured while downloading";
                        Main_ReportToUi("RegisterDEvice ERROR while loading!");
                    }
                } catch (err) {
                    Main_ReportToUi("Main_RegisterDevice ERROR => " + err);
                }

            });
    } catch (err) {
        Main_ReportToUi("Main_RegisterDevice ERROR=" + err);
    }
}

function Main_DevicesSynced() {
    $("#rr_registerd_state").removeClass("orange").removeClass("green").removeClass("red").addClass("green");
    var UE = importNamespace("UnityEngine");
    var N = MAIN.location.devices.cfg.present.length;
    //var n = MAIN.location.devices.data.length;
    var n = Object.keys(MAIN.location.devices.data).length;
    RT.Help.Log("Main_DevicesSynced #MAIN.location.devices.cfg.present.length=" + N);
    RT.Help.Log("Main_DevicesSynced #MAIN.location.devices.data=" + n);
    if (N === n) {
        RT.Help.Log("Main_DevicesSynced device downloads completed");

        // TODO add popup view here for registartion
        var keys = Object.keys(MAIN.location.devices.data);
        for (var iDevice = 0; iDevice < keys.length; iDevice++) {
            var k = keys[iDevice];
            //var cDev = MAIN.location.devices.data[k];
            var cDev = JSON.parse(RT.Web.ReadFromStore(k));
            RT.Help.Log("Main_DevicesSynced [" + (iDevice + 1) + "/" + keys.length + "|" + k.toString() + " (" + typeof k + ")]=" +
                cDev.id + ", #parts=" + cDev.parts.length);

            Main_ReportToUi("Loading Device [" + k.toString() + "]=" +
                cDev.name + ", #parts=" + cDev.id + ", " + cDev.parts.length);


            RT.Help.Log("Main_DevicesSynced [" + cDev.id + "] assetname=" + cDev.assetname);

            try {
                //Download AssetFile 
                if (cDev.hasOwnProperty("assetname")) {

                    var reqHeaders = ["content-type", "application/x-www-form-urlencoded"];
                    var url = MAIN.WEBAPI.apiBase + "/getfile?name=" + cDev.assetname + ".uwp";
                    //var url = MAIN.WEBAPI.apiBase + "/getfile?name=" + cDev.assetname + ".windows";

                    if (MAIN.isMobile) {
                        url = MAIN.WEBAPI.apiBase + "/getfile?name=" + cDev.assetname + ".android";
                        if (RT.Help.GetDeviceType() == "EDITOR") {
                            url = MAIN.WEBAPI.apiBase + "/getfile?name=" + cDev.assetname + ".uwp";
                        }
                    }

                    RT.Help.Log("Main_DevicesSynced AssetLoading [" + cDev.id + "] url=" + url);

                    var hasAsset = importNamespace("Vizario").AssetBundleHolder.HasAsset(cDev.assetname);
                    if (!hasAsset) {
                        RT.Web.DownloadFile("GET", url, reqHeaders, cDev.assetname, false, function () {
                            myconsolelog("Main_DevicesSynced Downloaded Asset [" + cDev.assetname + "] ... done");

                            myconsolelog("Main_DevicesSynced Downloaded Asset [" + cDev.assetname + "] importing ...");
                            importNamespace("Vizario").AssetBundleHolder.ImportFromFile(cDev.assetname, cDev.assetname);
                            myconsolelog("Main_DevicesSynced Downloaded Asset [" + cDev.assetname + "] importing ... done");
                        });
                    }
                } else {
                    RT.Help.Log("Main_DevicesSynced [" + cDev.id + "] assetname NOT FOUND!");
                }

                if (cDev.hasOwnProperty("trackingdb")) {
                    var trackingDbFiles = cDev.trackingdb;
                    for (var iTrackingDb = 0; iTrackingDb < trackingDbFiles.length; iTrackingDb++) {
                        var file2download = trackingDbFiles[iTrackingDb];

                        var reqHeaders = ["content-type", "application/x-www-form-urlencoded"];
                        var url = MAIN.WEBAPI.apiBase + "/getfile2?name=" + file2download + "";
                        RT.Help.Log("Main_DevicesSynced trackingdb [" + cDev.id + "] url=" + url);

                        RT.Web.DownloadFile("GET", url, reqHeaders, file2download, false, function () {
                            myconsolelog("Main_DevicesSynced Downloaded trackingdb [" + file2download + "] ... done");
                        });
                    }
                } else {
                    RT.Help.Log("Main_DevicesSynced [" + cDev.id + "] assetname NOT FOUND!");
                }

            } catch (aErr) {
                RT.Help.Log("Main_DevicesSynced AssetLoading ERROR => " + aErr);
            }

            //TODO check if that works inside for loop for multiple devices
            RT.Help.Log("Main_DevicesSynced loading registered devices ...");

            if (cDev.registered) {

                RT.Help.Log("Main_DevicesSynced loading registered devices ... 1");

                var partsPos = [];
                var parts = [];
                for (var jParts = 0; jParts < cDev.parts.length; jParts++) {
                    RT.Help.Log("Main_DevicesSynced loading registered devices ... 2 -> " + jParts + "/" + cDev.parts.length);
                    var p = cDev.parts[jParts];

                    var isActive = false;
                    var hasActive = false;

                    myconsolelog(JSON.stringify(p));
                    if (p.hasOwnProperty("active")) {
                        myconsolelog("Main_DevicesSynced " + cDev.id + " part " + p.name + " FOUND ACTIVE " + p.active);
                        hasActive = true;
                        isActive = p.active;
                    }

                    if (hasActive === false || (hasActive === true && isActive === true)) {
                        myconsolelog("Main_DevicesSynced " + cDev.id + " adding part " + p.name);
                        parts.push(p.name);
                        partsPos.push(new UE.Vector3(
                            p.position[0],
                            p.position[1],
                            p.position[2]));
                    }
                }

                RT.Help.Log("Main_DevicesSynced loading registered devices ... 3  parts parsed");

                // load game object
                var alignments = UE.GameObject.Find("world/alignments");
                var go = new UE.GameObject(k.toString());
                var bc = MAIN.RR.Runtime.AddBoxCollider(go);
                bc.size = new MAIN.UE.Vector3(0.1, 0.1, 0.1);
                MAIN.RR.Runtime.ToggleObjManipulation(go.name);

                RT.Help.Log("Main_DevicesSynced loading registered devices ... 4");

                var dummyRenderer = go.AddComponent(MAIN.UE.MeshRenderer);
                var visTrig = go.AddComponent(MAIN.RR.VZVisibilityTrigger);
                visTrig.data = JSON.stringify(cDev);
                visTrig.onVisCb = function (goName, isVisible, payload) {
                    console.log("VZVisibilityTrigger ON => " + goName + ", " + isVisible + ", " + payload);
                    var d = {
                        "goName": goName,
                        "isVisible": isVisible,
                        "data": JSON.parse(payload)
                    }
                    var jsonStr = JSON.stringify(d);
                    RT.MQTT.Publish("rr/visibility", jsonStr);
                }
                visTrig.offVisCb = function (goName, isVisible, payload) {
                    console.log("VZVisibilityTrigger OFF => " + goName + ", " + isVisible + ", " + payload);
                    var d = {
                        "goName": goName,
                        "isVisible": isVisible,
                        "data": JSON.parse(payload)
                    }
                    var jsonStr = JSON.stringify(d);
                    RT.MQTT.Publish("rr/visibility", jsonStr);
                }

                RT.Help.Log("Main_DevicesSynced loading registered devices ... 5");

                var go_uniscale = new UE.GameObject(k.toString() + "UniScale");

                go.transform.parent = alignments.transform;
                go_uniscale.transform.parent = go.transform;

                RT.Help.Log("Main_DevicesSynced loading registered devices ... 5b");

                go.transform.localPosition = new UE.Vector3(
                    cDev.transform.position[0],
                    cDev.transform.position[1],
                    cDev.transform.position[2]);

                go.transform.localRotation = new UE.Quaternion(
                    cDev.transform.rotation[0],
                    cDev.transform.rotation[1],
                    cDev.transform.rotation[2],
                    cDev.transform.rotation[3]);

                go.transform.localScale = new UE.Vector3(
                    cDev.transform.scale[0],
                    cDev.transform.scale[1],
                    cDev.transform.scale[2]);

                go_uniscale.transform.localScale = new UE.Vector3(
                    1 / cDev.transform.scale[0],
                    1 / cDev.transform.scale[1],
                    1 / cDev.transform.scale[2]);

                RT.Help.Log("Main_DevicesSynced loading registered devices ... 6 loading device model ... ");

                Main_LoadDevicemodel((iDevice + 1) * 2500, go.name);
                //RT.Web.SetTiimeout(iDevice*5000, function () {
                //    myconsolelog("Main_DevicesSynced before setBoundingBox for " + go.name);
                //    var hasModel = importNamespace("RegMan").SetObjectProperties.setBoundingBox(go);
                //    importNamespace("RegMan").SetObjectProperties.toggleVisibility(go, hasModel);
                //});

                RT.Help.Log("Main_DevicesSynced loading registered devices ... 7 loading device model ... done");

                myconsolelog("Main_DevicesSynced before AnnotateCubeBase for " + go_uniscale.name);
                importNamespace("RegMan").SpawnAndAnnotate.AnnotateCubeBase(go_uniscale, parts, partsPos);

                //myconsolelog("Main_DevicesSynced before toggleVisibility for " + go.name);


                myconsolelog("Main_DevicesSynced Downloaded Asset [" + cDev.assetname + "] instantiating ");
                var goInst = importNamespace("Vizario").AssetBundleHolder.InstantiateGameObject(cDev.assetname, cDev.commonname);
                if (goInst != null) {
                    goInst.transform.parent = go.transform;
                }
                myconsolelog("Main_DevicesSynced Downloaded Asset [" + cDev.assetname + "] instantiating ... done");



                //check for control interface
                if (cDev.hasOwnProperty("ondevicecontrols")) {
                    var controlurl = cDev.ondevicecontrols.controlurl;
                    var controlW = cDev.ondevicecontrols.width;
                    var controlH = cDev.ondevicecontrols.height;
                    var pixelWidth = 1920;
                    var pixelHeight = 1080;

                    if (cDev.ondevicecontrols.hasOwnProperty("pixelw")) {
                        pixelWidth = cDev.ondevicecontrols.pixelw;
                    }

                    if (cDev.ondevicecontrols.hasOwnProperty("pixelh")) {
                        pixelHeight = cDev.ondevicecontrols.pixelh;
                    }

                    if (controlurl.length > 0) {
                        var html = controlurl;
                        var controlWu = RT.Unity.CreateWU(k.toString() + "control", html, true, pixelWidth, pixelHeight);
                        RT.Unity.SetParent(controlWu.gameObject, go_uniscale);
                    }
                }



                myconsolelog("Main_DevicesSynced finished " + go.name + ", " + iDevice + "/" + keys.length);
            }

        }

        myconsolelog("Main_DevicesSynced devices done, generating ui");
        try {

            var popupmain = "ws-devicelist";
            tl = Main_GetDeviceListTransform();
            var tlHtml = json2html.transform({ "popupmain": popupmain, "data": MAIN.location.devices.data }, tl.list);
            RT.Help.Log("Main_DevicesSynced tlHtml=" + tlHtml);

            var transPopup = Main_GetPopUpBaseTransform();
            var html = json2html.transform({ "popupmain": popupmain, "content": tlHtml }, transPopup.popupmain);
            //document.getElementById("ws_popup_hook").innerHTML += html;

            //this was on
            //$("#ws_popup_hook").show();

            //RT.Help.Log("Main_DevicesSynced html=" + html);

            //for testing
            //spawning this into a new wui panel
            html =
                + '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">'
                + '<head>'
                + '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />'
                + '<meta name="viewport" content="initial-scale=1.0, width=device-width" />'
                + '<link rel="stylesheet" type="text/css" href="' + MAIN.WEBAPI.uiurl + '/main.css" />'
                + '<script type="text/javascript" src="' + MAIN.WEBAPI.uiurl + '/jQuery"></script>'
                + '<script type="text/javascript" src="' + MAIN.WEBAPI.uiurl + '/json2html.js"></script>'
                + '<script type="text/javascript" src="' + MAIN.WEBAPI.uiurl + '/runtime.js"></script>'
                + '</head>'
                + '<body>'
                + html
                + '</body>'
                + '</html>';
            var deviceRegPanelWu = RT.Unity.CreateWU("WU-deviceRegPanel", html, false, 1920, 1080);
            RT.Unity.SetParent(deviceRegPanelWu.gameObject, MAIN.worldGo); //move that to UIs under world
            RT.Unity.SetPose(deviceRegPanelWu.gameObject,
                [MAIN.palmHandMenuGo.transform.position.x, MAIN.palmHandMenuGo.transform.position.y, MAIN.palmHandMenuGo.transform.position.z - 0.03],
                [MAIN.palmHandMenuGo.transform.rotation.x, MAIN.palmHandMenuGo.transform.rotation.y, MAIN.palmHandMenuGo.transform.rotation.z, MAIN.palmHandMenuGo.transform.rotation.w],
                null
            );
            deviceRegPanelWu.Update();
            MAIN.RR.Runtime.ToggleObjManipulation(deviceRegPanelWu.gameObject.name);

            var closeDeviceRegPanelButton = RT.MRTK.SpawnButton("UIBTN-CloseRegDevice", "Close", "Close", false, function () { deviceRegPanelWu.Expire(); });
            MAIN.buttons.push(closeDeviceRegPanelButton);
            RT.Unity.SetLocalPose(closeDeviceRegPanelButton.go, [0, 0, 0], [0, 0, 0, 1], [1, 1, 1]);
            RT.Unity.SetParent(closeDeviceRegPanelButton.go, deviceRegPanelWu.gameObject);
            var s = deviceRegPanelWu.gameObject.transform.localScale.x;
            var is = 1 / s;
            RT.Unity.SetLocalPose(closeDeviceRegPanelButton.go, [0.15 * is, 0.15 * is, 0], null, null);


        } catch (err) {
            RT.Help.Log("Main_DevicesSynced ERROR=>" + err);
        }
        $('#rr_info').hide();
    }
}

function Main_LoadDevicemodel(delayMs, mGoName) {

    var cachedGo = importNamespace("UnityEngine").GameObject.Find(mGoName);
    if (cachedGo != null) {
        RT.Web.SetTiimeout(delayMs, function () {
            console.log("Main_LoadDevicemodel before setBoundingBox for " + cachedGo.name);
            var hasModel = importNamespace("RegMan").SetObjectProperties.setBoundingBox(cachedGo);
            console.log("Main_LoadDevicemodel " + mGoName + ", hasModel = " + hasModel);

            //importNamespace("RegMan").SetObjectProperties.toggleVisibility(cachedGo, hasModel);
            importNamespace("RegMan").SetObjectProperties.toggleVisibility(cachedGo, true);

            if (!hasModel) {
                var bb = MAIN.UE.GameObject.Find(mGoName + "BoundingBox");
                if (bb != null) {
                    RT.Unity.SetLocalPose(bb, null, null, [0.03, 0.03, 0.03]);
                }
            }
        });
    }
}

function Main_OnClickDevice(event, mDeviceId, mMode) {
    RT.Help.Log("Main_OnClickDevice mDeviceId=>" + mDeviceId + ", mMode=" + mMode);

    var device = MAIN.location.devices.data[mDeviceId];

    if (mMode.toUpperCase() === "SHOW") {

    }

    if (mMode.toUpperCase() === "REGISTER") {

        var deviceDataStr = JSON.stringify(device);

        var popupname = "popup_device_manipulation";
        var tm = {};
        var tlHtml = "";
        var hasTrackingDb = false;
        //load device tracker if there is a tracking database
        if (device.hasOwnProperty("trackingdb")) {
            Main_StartDeviceTracking(device);
            popupname = "popup_device_manipulation";
            tm = Main_GetTrackingControl();
            tlHtml = json2html.transform(
                {
                    "id": mDeviceId,
                    "name": mDeviceId,
                    "popupmain": popupname,
                    "submsg": "Please look for: " + mDeviceId + " to align with reality!</br>using: [" + device.trackingdb + "]"
                }, tm.list);
            hasTrackingDb = true;
        } else {
            popupname = "popup_device_manipulation";
            tm = Main_GetManipulationControl();
            tlHtml = json2html.transform({ "id": mDeviceId, "name": mDeviceId, "popupmain": popupname }, tm.list);
        }

        var transPopup = Main_GetPopUpBaseTransform();
        var html = json2html.transform({ "popupmain": popupname, "content": tlHtml }, transPopup.popupmain);
        document.getElementById("ws_popup_hook").innerHTML += html;





        //Danijela Function
        Main_DoDevicetRegistration(event, mDeviceId, deviceDataStr, hasTrackingDb);
    }
}

function Main_DoDevicetRegistration(event, deviceName, deviceDataStr, hasTrackingDb) {
    Main_ReportToUi("Main_DoDevicetRegistration Starting alignment deviceName=" + deviceName);
    RT.Reg.StartRegistration(event, deviceName);

    //Move to camera view for registration
    if (hasTrackingDb) {
        try {
            var RR = importNamespace("RR");
            var UE = importNamespace("UnityEngine");
            var go = UE.GameObject.Find(deviceName);

            var prevParent = UE.GameObject.Find("PalmUpHandMenu");
            if (prevParent != null) {
                go.transform.parent = prevParent.transform;
                go.transform.localPosition = new UE.Vector3(0, -0.1, 0);
            } else {
                go.transform.parent = UE.Camera.main.transform;
                go.transform.localPosition = new UE.Vector3(-0.05, -0.05, 0.5);
            }
            //var ro = go.AddComponent(RR.RotateObject);
            //ro.speed = -50;
        } catch (err) {
            Main_ReportToUi("Main_DoDevicetRegistration ERROR => " + err);
        }
    }
}

function Main_StartDeviceTracking(mDeviceObj) {
    myconsolelog("Enabling tracking ...");
    myconsolelog("Enabling tracking ... mDeviceObj => " + JSON.stringify(mDeviceObj));
    myconsolelog("Enabling tracking xml => " + mDeviceObj.trackingdb[0]);
    myconsolelog("Enabling tracking dat => " + mDeviceObj.trackingdb[1]);

    //TODO pass here observeable go
    importNamespace("RR").Runtime.StartDeviceTracking(mDeviceObj.id, mDeviceObj.trackingdb[0]);
}

function Main_DownloadDevice(mDeviceId) {
    var dnUrl = MAIN.WEBAPI.apiBase + "/data?name=" + mDeviceId;
    var dnHeaders = ["content-type", "application/x-www-form-urlencoded"];
    var dnData = "";

    Main_ReportToUi("ownloading device " + mDeviceId);
    RT.Web.SendWebReq("GET", dnUrl, dnHeaders, dnData,
        function (mError, mData) {
            if (!mError) {
                if (mData != "null") {
                    var dData = JSON.parse(mData);
                    MAIN.location.devices.data[dData.id] = dData;
                    RT.Web.WriteToStore(dData.id, mData);
                }
            }
        });
}

function Main_DeviceManipulation(event, mMode, mDir, mDeviceId) {
    RT.Help.Log("Main_DeviceManipulation mMode=" + mMode + ", mDir=" + mDir + ", mDeviceId=" + mDeviceId);
    var device = MAIN.location.devices.data[mDeviceId];

    if (mMode.toUpperCase() === "QUIT") {
        RT.Web.SetTiimeout(50, function () {
            $("#" + mDir).remove();
        });
        return;
    }

    if (mMode.toUpperCase() === "SAVE") {

        //update device
        // either 
        //  MAIN.location.devices.data
        // or
        // read from store
        // or
        // get from web  and update


        var worldAlName = MAIN.worldGoName + "/alignments";
        myconsolelog("SAVE => looking for " + mDeviceId);
        myconsolelog("SAVE => looking for " + worldAlName);

        //get Gameobject
        var UE = importNamespace("UnityEngine");
        var go = UE.GameObject.Find(mDeviceId);
        var worldAl = UE.GameObject.Find(worldAlName);
        //var T = [go.transform.position.x, go.transform.position.y, go.transform.position.z];
        //var R = [go.transform.rotation.x, go.transform.rotation.y, go.transform.rotation.z, go.transform.rotation.w];
        //var S = [go.transform.localScale.x, go.transform.localScale.y, go.transform.localScale.z];


        if (go != null) {
            myconsolelog("SAVE => looking for " + mDeviceId + " => FOUND!");
        }

        if (worldAl != null) {
            myconsolelog("SAVE => looking for " + worldAlName + " => FOUND!");
        }

        if (go != null && worldAl != null) {
            go.transform.parent = worldAl.transform;
        }

        //local because those nodes are children of the worldanchor
        var T = [go.transform.localPosition.x, go.transform.localPosition.y, go.transform.localPosition.z];
        var R = [go.transform.localRotation.x, go.transform.localRotation.y, go.transform.localRotation.z, go.transform.localRotation.w];
        var S = [go.transform.localScale.x, go.transform.localScale.y, go.transform.localScale.z];
        //from store
        var storeDevice = RT.Web.ReadFromStore(mDeviceId);
        //Main_ReportToUi("Found device = " + storeDevice);

        var dData = JSON.parse(storeDevice);
        RT.Help.Log("Main_DeviceManipulation mDeviceId=>" + mDeviceId + ", registered=true");
        dData.registered = true;
        dData.transform = {};
        dData.transform.position = T;
        dData.transform.rotation = R;
        dData.transform.scale = S;

        var uUrl = MAIN.WEBAPI.apiBase + "/data?name=" + mDeviceId;
        var uHeaders = ["content-type", "application/json"];
        var uData = JSON.stringify(dData);

        Main_ReportToUi("Saving device [" + mDeviceId + "]");
        RT.Web.SendWebReq("POST", uUrl, uHeaders, uData,
            function (mError2, mData2) {
                var updatedDevice = JSON.parse(mData2);
                Main_DownloadDevice(updatedDevice.id);
            });
        Main_ReportToUi("Device manipulation done");
    }

    RT.Reg.Manipulate(mMode, mDir, mDeviceId);
    $("#" + mDir).remove();

    //$("#ws_device_manipulation .activateable-button").removeClass("active-button");
    //$("#ws_device_manipulation .activateable-button").removeClass("active-button");
    var elem = $(event.target);
    //elem.addClass("active-button").parent().siblings().children().removeClass('active-button');
    elem.parent().parent().siblings().children().children().removeClass('active-button');
    elem.addClass("active-button").parent().siblings().children().removeClass('active-button');
}

function Main_GetManipulationControl() {
    var t = {
        "list": {
            "<>": "div",
            "class": "ws-list",
            "id": "ws_device_manipulation",
            "html": [
                {
                    "<>": "div",
                    "class": "ws-list-inner",
                    "html": [
                        /* INFO */
                        {
                            "<>": "div",
                            "class": "ws-list-elems ws-firstrow",
                            "html": [
                                {
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": "${name}"
                                },
                                {
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": function () {
                                        var html = "";
                                        html += "<button onclick=\"PlayClick();Main_DeviceManipulation(event, 'SAVE', '" + this.popupmain + "','" + this.id + "');\" ";
                                        html += ">Save</button>";
                                        return html;
                                    }
                                },
                                {
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": function () {
                                        var html = "";
                                        html += "<button onclick=\"PlayClick();Main_DeviceManipulation(event, 'QUIT', '" + this.popupmain + "','" + this.id + "');\" ";
                                        html += ">Quit</button>";
                                        return html;
                                    }
                                }
                            ]
                        },
                        /* SCALE */
                        {
                            "<>": "div",
                            "class": "ws-list-elems",
                            "html": [
                                {
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": "Scale"
                                },
                                {
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": function () {
                                        var html = "";
                                        html += "<button class=\"activateable-button\" onclick=\"PlayClick();Main_DeviceManipulation(event,'SCALE','ALL','" + this.id + "');\" ";
                                        html += ">All</button>";
                                        return html;
                                    }
                                },
                                {
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": function () {
                                        var html = "";
                                        html += "<button class=\"activateable-button\" onclick=\"PlayClick();Main_DeviceManipulation(event,'SCALE','X','" + this.id + "');\" ";
                                        html += ">X</button>";
                                        return html;
                                    }
                                },
                                {
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": function () {
                                        var html = "";
                                        html += "<button class=\"activateable-button\" onclick=\"PlayClick();Main_DeviceManipulation(event,'SCALE','Y','" + this.id + "');\" ";
                                        html += ">Y</button>";
                                        return html;
                                    }
                                },
                                {
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": function () {
                                        var html = "";
                                        html += "<button class=\"activateable-button\" onclick=\"PlayClick();Main_DeviceManipulation(event,'SCALE','Z','" + this.id + "');\" ";
                                        html += ">Z</button>";
                                        return html;
                                    }
                                }

                            ]
                        },

                        /* TRANSLATE */
                        {
                            "<>": "div",
                            "class": "ws-list-elems",
                            "html": [
                                {
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": "Translate"
                                },
                                {
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": function () {
                                        var html = "";
                                        html += "<button class=\"activateable-button\" onclick=\"PlayClick();Main_DeviceManipulation(event,'TRANSLATE','ALL','" + this.id + "');\" ";
                                        html += ">All</button>";
                                        return html;
                                    }
                                },
                                {
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": function () {
                                        var html = "";
                                        html += "<button class=\"activateable-button\" onclick=\"PlayClick();Main_DeviceManipulation(event,'TRANSLATE','X','" + this.id + "');\" ";
                                        html += ">X</button>";
                                        return html;
                                    }
                                },
                                {
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": function () {
                                        var html = "";
                                        html += "<button class=\"activateable-button\" onclick=\"PlayClick();Main_DeviceManipulation(event,'TRANSLATE','Y','" + this.id + "');\" ";
                                        html += ">Y</button>";
                                        return html;
                                    }
                                },
                                {
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": function () {
                                        var html = "";
                                        html += "<button class=\"activateable-button\" onclick=\"PlayClick();Main_DeviceManipulation(event,'TRANSLATE','Z','" + this.id + "');\" ";
                                        html += ">Z</button>";
                                        return html;
                                    }
                                }

                            ]
                        },

                        /* ROTATE */
                        {
                            "<>": "div",
                            "class": "ws-list-elems",
                            "html": [
                                {
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": "Rotate"
                                },
                                {
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": function () {
                                        var html = "";
                                        html += "<button class=\"activateable-button\" onclick=\"PlayClick();Main_DeviceManipulation(event,'ROTATE','ALL','" + this.id + "');\" ";
                                        html += ">All</button>";
                                        return html;
                                    }
                                },
                                {
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": function () {
                                        var html = "";
                                        html += "<button class=\"activateable-button\" onclick=\"PlayClick();Main_DeviceManipulation(event,'ROTATE','X','" + this.id + "');\" ";
                                        html += ">X</button>";
                                        return html;
                                    }
                                },
                                {
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": function () {
                                        var html = "";
                                        html += "<button class=\"activateable-button\" onclick=\"PlayClick();Main_DeviceManipulation(event,'ROTATE','Y','" + this.id + "');\" ";
                                        html += ">Y</button>";
                                        return html;
                                    }
                                },
                                {
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": function () {
                                        var html = "";
                                        html += "<button class=\"activateable-button\" onclick=\"PlayClick();Main_DeviceManipulation(event,'ROTATE','Z','" + this.id + "');\" ";
                                        html += ">Z</button>";
                                        return html;
                                    }
                                }

                            ]
                        }
                    ]
                }
            ]
        }
    }
    return t;
}

function Main_GetTrackingControl() {
    var t = {
        "list": {
            "<>": "div",
            "class": "ws-list",
            "id": "ws_device_manipulation",
            "html": [
                {
                    "<>": "div",
                    "class": "ws-list-inner",
                    "html": [
                        /* INFO */
                        {
                            "<>": "div",
                            "class": "ws-list-elems ws-firstrow",
                            "html": [
                                {
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": "${name}"
                                }
                                /*,{
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": function () {
                                        var html = "";
                                        //html += "<button onclick=\"Main_DeviceManipulation(event, 'SAVE', '" + this.popupmain + "','" + this.id + "');\" ";
                                        //html += ">Save</button>";
                                        //save e161
                                        html += "<button class='rr-button' onclick=\"Main_DeviceManipulation(event, 'SAVE', '" + this.popupmain + "','" + this.id + "');\" ";
                                        html += '<i class="material-icons md-f">&#xe161;</i><p>Save</p>';
                                        html += "</button>";
                                        return html;
                                    }
                                }
                                ,{
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": function () {
                                        var html = "";
                                        //html += "<button onclick=\"Main_DeviceManipulation(event, 'QUIT', '" + this.popupmain + "','" + this.id + "');\" ";
                                        //html += ">Quit</button>";
                                        //close e5cd
                                        html += "<button class='rr-button' onclick=\"Main_DeviceManipulation(event, 'QUIT', '" + this.popupmain + "','" + this.id + "');\" ";
                                        html += '<i class="material-icons md-f">&#xe5cd;</i><p>Quit</p>';
                                        html += "</button>";
                                        return html;
                                    }
                                }*/
                                /*,{
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": "<p>${submsg}</p>"
                                }*/
                            ]
                        },
                        {
                            "<>": "div",
                            "class": "ws-list-elem",
                            "html": [
                                {
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": function () {
                                        var html = "";
                                        //html += "<button onclick=\"Main_DeviceManipulation(event, 'SAVE', '" + this.popupmain + "','" + this.id + "');\" ";
                                        //html += ">Save</button>";
                                        //save e161
                                        html += "<button class='rr-button' onclick=\"PlayClick();Main_DeviceManipulation(event, 'SAVE', '" + this.popupmain + "','" + this.id + "');\" ";
                                        html += '<i class="material-icons md-f">&#xe161;</i><p>Save</p>';
                                        html += "</button>";
                                        return html;
                                    }
                                }
                                , {
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": function () {
                                        var html = "";
                                        //html += "<button onclick=\"Main_DeviceManipulation(event, 'QUIT', '" + this.popupmain + "','" + this.id + "');\" ";
                                        //html += ">Quit</button>";
                                        //close e5cd
                                        html += "<button class='rr-button' onclick=\"PlayClick();Main_DeviceManipulation(event, 'QUIT', '" + this.popupmain + "','" + this.id + "');\" ";
                                        html += '<i class="material-icons md-f">&#xe5cd;</i><p>Quit</p>';
                                        html += "</button>";
                                        return html;
                                    }
                                }
                            ]
                        },
                        {
                            "<>": "div",
                            "class": "ws-list-elem",
                            "html": "<p>${submsg}</p>"
                        }
                    ]
                }
            ]
        }
    }
    return t;
}

function Main_GetDeviceListTransform() {
    var t = {
        "list": {
            "<>": "div",
            "class": "ws-list",
            "html": [
                {
                    "<>": "div",
                    "class": "ws-list-inner2",
                    "html": [
                        /* INFO */
                        {
                            "<>": "div",
                            "class": "ws-firstrow",
                            "html": [
                                {
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": "<div>Device Registration</div>"
                                },
                                {
                                    "<>": "div",
                                    "class": "ws-list-elem",
                                    "html": function () {
                                        var html = "";
                                        html += "<button class='rr-button' onclick=\"PlayClick();$('#" + this.popupmain + "').remove();\" ";
                                        html += '<i class="material-icons md-f">&#xe92f;</i><p>Done</p>'
                                        html += "</button>";
                                        return html;
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    "<>": "div",
                    "class": "ws-list-inner",
                    "html": function () {
                        var html = "";

                        var keys = Object.keys(this.data);
                        for (var i = 0; i < keys.length; i++) {
                            var k = keys[i];
                            var cDev = this.data[k];

                            Main_ReportToUi("Main_DevicesSynced [" + k.toString() + ", " + k + "]=" +
                                cDev.name + ", #parts=" + cDev.id + ", " + cDev.parts.length);
                            html += json2html.transform(cDev, t.elem);
                        }
                        return html;
                    }
                }
            ]
        },
        "elem": {
            "<>": "div",
            "class": "ws-list-elems",
            "html": [
                /*{
                    "<>": "div",
                    "class": "ws-list-elem ws-nametitle",
                    "html": "${name}"
                },*/
                {
                    "<>": "div",
                    "class": "ws-list-elem ws-nametitle",
                    "html": "${id}"
                },
                {
                    "<>": "div",
                    "class": function () {
                        var cls = "";
                        cls += "ws-list-elem ";

                        if (this.registered) {
                            cls += " ws-green-icon ";
                        } else {
                            cls += " ws-red-icon ";
                        }
                        return cls;
                    },
                    "html": function () {
                        var html = "";
                        html += "<button class='rr-button' onclick=\"PlayClick();Main_OnClickDevice(event, '" + this.id + "', 'regstate');\" ";
                        if (this.registered) {
                            html += '<i class="material-icons md-f">&#xe177;</i><p>Reg OK</p>'
                        } else {
                            html += '<i class="material-icons md-f">&#xe002;</i><p>NOT Reg</p>'
                        }
                        html += "</button>";
                        return html;
                    }
                },
                {
                    "<>": "div",
                    "class": "ws-list-elem",
                    "html": function () {
                        var html = "";
                        html += "<button class='rr-button' onclick=\"PlayClick();Main_OnClickDevice(event, '" + this.id + "', 'show');\" ";
                        html += '<i class="material-icons md-f">&#xf1c5;</i><p>Show</p>'
                        html += "</button>";
                        return html;
                    }
                },
                {
                    "<>": "div",
                    "class": "ws-list-elem",
                    "html": function () {
                        var html = "";
                        html += "<button class='rr-button' onclick=\"PlayClick();Main_OnClickDevice(event, '" + this.id + "', 'register');\" ";
                        html += '<i class="material-icons md-f">&#xe02e;</i><p>Register</p>'
                        html += "</button>";
                        return html;
                    }
                }

            ]
        }
    }
    return t;
}

function Main_GetPopUpBaseTransform() {
    var t = {
        "popupmain": {
            "<>": "div",
            "class": "ws-popup-main",
            "id": "${popupmain}",
            "html": [
                {
                    "<>": "div",
                    "class": "ws-popup-main-inner",
                    "id": "${popupmain}-inner",
                    "html": "${content}"
                }
            ]
        }
    };
    return t;
}


function Main_GetWABatchName(mId) {
    var ntName = RT.Help.GetNetwork();
    ntName = ntName.replace(" ", "_");
    return "" + ntName + "-WA-" + mId;
}

function Main_CreateWA() {
    var goName = MAIN.worldGoName;

    Main_ReportToUi("Main_CreateWA creating world anchor for => " + goName);

    RT.WA.AddToGO(goName);
    MAIN.waCache = [];
    MAIN.waCacheId = 0;
    RT.WA.GetB64FromGo(goName, function (mWoName, b64AnchorData) {
        try {
            if (b64AnchorData.length > 0) {
                Main_ReportToUi("Main_CreateWA got data part " + MAIN.waCacheId);
                var key = Main_GetWABatchName(MAIN.waCacheId);
                RT.Web.WriteToStore(key, b64AnchorData);
                MAIN.waCache[MAIN.waCacheId] = key;
                MAIN.waCacheId++;
            } else {
                Main_ReportToUi("RT.WA.GetB64FromGo complete");
                Main_WAExportFromGoComplete();
            }
        } catch (err) {
            RT.Help.Log("Main_CreateWA ERROR => " + err);
            Main_ReportToUi("Main_CreateWA ERROR => " + err);
            //myconsolelog("VZAnnotator_RootMarkWorldAnchorNotify ERROR => " + err);
            //VZHelper_SetInnerHtml(VZAnnotator_baseId_content_status, "VZAnnotator_RootMarkWorldAnchorNotify ERROR => " + err);
        }
    });
}

function Main_WAExportFromGoComplete() {

    var networkName = RT.Help.GetNetwork();
    var N = MAIN.waCache.length;

    // add location
    var waUrl = MAIN.WEBAPI.apiBase + "/data?name=";
    var reqUrl = waUrl + networkName;

    //adding location
    var location = {};
    location._id = networkName;
    location.name = networkName;
    location.type = "location";
    location.numwabatches = N;
    location.waprefix = networkName + "-WA-";

    RT.Help.Log("Uploading Location [" + networkName + "]");

    var reqData = JSON.stringify(location);
    var reqHeaders = ["content-type", "application/json"];

    RT.Web.SendWebReq("POST", reqUrl, reqHeaders, reqData,
        function (mError, mData) {
            RT.Help.Log("Uploading Location response [" + networkName + "]. err=" + mError + ", data=" + mData);
        });

    //adding devices    
    var loc_devices = {};
    loc_devices._id = networkName + "-devices";
    loc_devices.name = networkName + "-devices";
    loc_devices.present = [];
    var loc_devices_reqData = JSON.stringify(loc_devices);
    var loc_devices_reqHeaders = ["content-type", "application/json"];
    var loc_devices_reqUrl = waUrl + loc_devices.name;

    RT.Web.SendWebReq("POST", loc_devices_reqUrl, loc_devices_reqHeaders, loc_devices_reqData,
        function (mError, mData) {
            RT.Help.Log("Uploading Location-devices response [" + networkName + "]. err=" + mError + ", data=" + mData);
        });


    for (var i = 0; i < N; i++) {
        var waId = i;
        RT.Web.SetTiimeout(50 * i, Main_UploadWABatch(waUrl, waId, N, location));
    }

}

function Main_UploadWABatch(mUrl, mWaId, mN, mLocation) {
    var key = Main_GetWABatchName(mWaId);
    var batchData = RT.Web.ReadFromStore(key);
    var batch = {};
    batch.id = mWaId;
    batch.name = mLocation.waprefix + mWaId;
    batch._id = batch.name;
    batch.data = batchData;

    var reqUrl = mUrl + batch.name;
    var reqData = JSON.stringify(batch);
    var reqHeaders = ["content-type", "application/json"];

    RT.Help.WriteFile(batch.name, reqData);
    RT.Web.SendWebReq("POST", reqUrl, reqHeaders, reqData,
        function (mError, mData) {
            Main_ReportToUi("Uploading WA batch response [" + batch.name + "]. err=" + mError + ", data=" + mData);
        });
}



function Main_DownloadWAsFinished(mN) {

    MAIN.downloadingWAs = false;

    var goName = MAIN.worldGoName;
    for (var i = 0; i < mN; i++) {
        var key = MAIN.waCache[i];
        Main_ReportToUi("Importing WA " + i + ", " + key);
        //RT.Unity.SpawnNotification(5, "Importing WA " + i + ", " + key);
        PlayNotification();
        RT.WA.ImportWorldAnchorFromKeyStore(goName, key, true);
        RT.Web.WriteToStore(key, "");
    }
    Main_ReportToUi("Finalizing WA import");
    RT.WA.ImportWorldAnchorFromKeyStore(goName, "", false);
    $('#rr_info').hide();
    $("#rr_locate_state").removeClass("orange").removeClass("green").removeClass("red").addClass("green");
    //MAIN.waCache[i] = {};
}

function Main_DownloadWABatch(mUrl, mPrefix, mId) {
    Main_ReportToUi("Downloading batch " + mId);
    RT.Unity.SpawnNotification(5, "Downloading batch " + mId);
    var waPartName = mPrefix + mId;
    var reqUrl = mUrl + waPartName;
    var reqHeaders = ["content-type", "application/x-www-form-urlencoded"];
    var reqData = "";

    var waData = RT.Help.ReadFile(waPartName);
    if (waData.length > 0) {
        try {
            var data = JSON.parse(waData);
            var key = data.name;
            RT.Web.WriteToStore(key, data.data);
            MAIN.waCache[data.id] = key;
            //Main_ReportToUi("Downloaded " + MAIN.waCache.length + "/" + MAIN.batchesToDownload + " (" + ((data.data.length / 1000) / 1000).toFixed(2) + "mb)");
            Main_ReportToUi("Reading from disk WA " + MAIN.waCache.length + "/" + MAIN.batchesToDownload);

            if (MAIN.waCache.length === MAIN.batchesToDownload) {
                Main_ReportToUi("Read completed, importing ...");
                RT.Web.SetTiimeout(250, Main_DownloadWAsFinished(MAIN.batchesToDownload));
            }
        } catch (err) {
            Main_ReportToUi("Read completed ERROR =>" + err);
        }
    } else {

        // TODO replace with file-download
        RT.Web.DownloadFile("GET", reqUrl, reqHeaders, waPartName, false, function () {
            myconsolelog("Main_DownloadWABatch DownloadFile [" + waPartName + "] ... done");

            var fdata = RT.Help.ReadFile(waPartName);
            var data = JSON.parse(fdata);

            var key = data.name;
            RT.Web.WriteToStore(key, data.data);
            MAIN.waCache[data.id] = key;

            fdata = null;
            data = null;

            if (MAIN.waCache.length === MAIN.batchesToDownload) {
                Main_ReportToUi("Download completed, importing ...");
                //Main_DownloadWAsFinished(MAIN.batchesToDownload); //maybe try timeout here to decouple
                RT.Web.SetTiimeout(250, Main_DownloadWAsFinished(MAIN.batchesToDownload));
            }
        });

        /*
        //old version using direct download
        RT.Web.SendWebReq("GET", reqUrl, reqHeaders, reqData,
            function (mError, mData) {
                if (mError) {
                    RT.Help.Log("WA Batch download error!");
                } else {
                    if (mData === "null") {
                        RT.Help.Log("WA Batch download no data found!");
                    } else {
                        try {
                            RT.Help.WriteFile(waPartName, mData);
                            var data = JSON.parse(mData);

                            var key = data.name;
                            RT.Web.WriteToStore(key, data.data);
                            MAIN.waCache[data.id] = key;
                            //Main_ReportToUi("Downloaded " + MAIN.waCache.length + "/" + MAIN.batchesToDownload + " (" + ((data.data.length / 1000) / 1000).toFixed(2) + "mb)");
                            Main_ReportToUi("Downloaded WA " + MAIN.waCache.length + "/" + MAIN.batchesToDownload);

                            if (MAIN.waCache.length === MAIN.batchesToDownload) {
                                Main_ReportToUi("Download completed, importing ...");

                                //Main_DownloadWAsFinished(MAIN.batchesToDownload); //maybe try timeout here to decouple

                                RT.Web.SetTiimeout(250, Main_DownloadWAsFinished(MAIN.batchesToDownload));
                            }
                        } catch (err) {
                            Main_ReportToUi("Download completed ERROR =>" + err);
                        }
                    }
                }
            });
        */
    }
}

function Main_CompareStreams(event) {
    /*
    var selector = {};
    selector.field = mFieldName;
    selector.tag4 = mDevice;
    selector.tag5 = mName;
    */

    $('#rr_graphcomp').show();

    var gcd = RT.Web.ReadFromStore("GRAPHCOMP");
    myconsolelog("Main_CompareStreams => " + gcd);

    if (gcd != null) {

        var data = JSON.parse(gcd);
        var tag4A = data[0].tag4;
        var tag4B = data[1].tag4;
        var tag5A = data[0].tag5;
        var tag5B = data[1].tag5;
        var fieldA = data[0].field;
        var fieldB = data[1].field;

        var url = "";
        url = "http://192.168.1.168:3000/render/d-solo/H6CTNOUZz/heating?";
        url += "orgId=1&";
        url += "refresh=30s&";
        url += "var-tag5selectorA=" + tag5A + "&";
        url += "var-tag5selectorB=" + tag5B + "&";
        url += "var-tag4selectorB=" + tag4B + "&";
        url += "var-tag4selectorA=" + tag4A + "&";
        url += "var-fieldA=" + fieldA + "&";
        url += "var-fieldB=" + fieldB + "&";
        url += "panelId=18&";
        url += "width=800&";
        url += "height=400&";
        url += "tz=Europe%2FVienna";

        var html = "<img onclick='PlayClick();$(\"#rr_graphcomp\").hide();' class='rr-img-graphcomp' src='" + url + "'></img>";

        document.getElementById("rr_graphcomp").innerHTML = html;
    }

}

function Main_ToggleUiPinning(event) {
    try {
        var RR = importNamespace("RR");
        if (MAIN.uipinned) {
            //unpin ui
            RR.Runtime.FollowMeUi();
            MAIN.uipinned = false;
        } else {
            //pin ui
            RR.Runtime.StandHereUi();
            MAIN.uipinned = true;
        }
    } catch (err) {
        myconsolelog("Main_ToggleUiPinning ERROR => " + err);
    }
}

function Main_ObjectTrackedState(mIsTracked, mGameObjectName) {
    myconsolelog("Main_ObjectTrackedState mIsTracked=" + mIsTracked + ", mGameObjectName=" + mGameObjectName);
    var UE = importNamespace("UnityEngine");

    try {
        //serach for device and place or show placement list
        var testId = "NETGEAR81-5G-littleserver";

        var data = RT.Web.ReadFromStore(testId);

        /*
        myconsolelog("Main_ObjectTrackedState 0");

        if (MAIN.hasOwnProperty("location")) {
            myconsolelog("Main_ObjectTrackedState 0 MAIN.location FOUND => " + JSON.stringify(MAIN.location));

            if (MAIN.location.hasOwnProperty("devices")) {
                myconsolelog("Main_ObjectTrackedState 0 MAIN.location.devices FOUND");

                if (MAIN.location.devices.hasOwnProperty("data")) {
                    myconsolelog("Main_ObjectTrackedState 0 MAIN.location.devices.data FOUND");
                }
            }
        }

        myconsolelog("Main_ObjectTrackedState 0 MAIN.location=>" + MAIN.location);
        myconsolelog("Main_ObjectTrackedState 0 MAIN.location.devices=>" + MAIN.location.devices);
        myconsolelog("Main_ObjectTrackedState 0 MAIN.location.devices.data=>" + MAIN.location.devices.data);

        var keys = Object.keys(MAIN.location.devices.data);

        myconsolelog("Main_ObjectTrackedState 1");

        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            myconsolelog("Main_ObjectTrackedState => " + i + "/" + keys.length + ", " + k);
            //var cDev = MAIN.location.devices.data[k];
            //var go = UE.GameObject.Find(k);
            //if (go != null) {
            //}
        }
        */







        myconsolelog("Main_ObjectTrackedState 0 data=" + data);

        //var dataObj = MAIN.location.devices.data[testId];
        var dataObj = JSON.parse(data);

        myconsolelog("Main_ObjectTrackedState 1");

        if (dataObj != null) {
            var dCommonName = dataObj.commonname; //"commonname": "rockpro64",
            var dId = dataObj.id; //"id": "NETGEAR81-5G-littleserver",

            myconsolelog("Main_ObjectTrackedState found in data => dCommonName=" + dCommonName + ", dId=" + dId);

            var trackedGO = UE.GameObject.Find(mGameObjectName);
            //var trackedGO = UE.GameObject.Find(mGameObjectName + "/Cube");
            var go = UE.GameObject.Find(dId);
            if (go != null && trackedGO != null) {
                go.transform.parent = trackedGO.transform;
                go.transform.localPosition = new UE.Vector3(0, 0, 0);
                go.transform.localRotation = new UE.Quaternion(0, 0, 0, 1);
            }
        }

    } catch (err) {
        myconsolelog("Main_ObjectTrackedState ERROR => " + err);
    }

}

function Main_InitSlider() {

}



function Main_Canvas(event) {
    document.getElementById("rr_canvas_attr").innerHTML = "";
    //subscribe to mqtt
    //var mainUi = MAIN.UE.GameObject.Find("UI");
    var mainUi = MAIN.UE.GameObject.Find("Main");
    var mainScale = mainUi.transform.localScale;

    var iSx = 1 / mainScale.x;
    var iSy = 1 / mainScale.y;
    var iSz = 1 / mainScale.z;

    RT.Unity.SetupSlider("SLIDER_canvas_style", mainUi,
        [0.0, 0.0, -90.0],
        [0.12 * iSx, 0.03 * iSy, 0 * iSz],
        [0.2 * iSx, 0.4 * iSy, 0.4 * iSz],
        function (sliderGoName, oldVal, newVal) {
            var elem = document.getElementById("rr_canvas_style");
            var maxScroll = elem.scrollHeight * 2;
            var newPos = newVal * maxScroll;
            elem.scrollTop = newPos;
        }
    );

    RT.Unity.SetupSlider("SLIDER_canvas_vist", mainUi,
        [0.0, 0.0, -90.0],
        [0.12 * iSx, -0.03 * iSy, 0 * iSz],
        [0.2 * iSx, 0.4 * iSy, 0.4 * iSz],
        function (sliderGoName, oldVal, newVal) {
            var elem = document.getElementById("rr_canvas_attr");
            var maxScroll = elem.scrollHeight * 2;
            var newPos = newVal * maxScroll;
            elem.scrollTop = newPos;
        }
    );

    var interactionTopic = "vis/interaction/selectedfield";

    //TODO mqtt unsubscribe first
    RT.MQTT.Subscribe(interactionTopic);
    RT.MQTT.RegisterCallbackTopic(
        function (topic, payload) {
            myconsolelog("Main_Canvas mqtt@selectedfield=>" + topic + "|" + payload + "|" + encodeURIComponent(payload));

            //Expecting:
            /*
             * var interactionTopic = "vis/interaction/selectedfield";
                var interactionPayload = {
                    "deviceId": LABEL.deviceId,
                    "partId": LABEL.partId,
                    "fieldname": mFieldName,
                    "mqtt": LABEL.mqttTopic
                };
             */

            try {
                var interObj = JSON.parse(payload);
                var attrDiv = document.getElementById("rr_canvas_attr");

                var attrToAddId = "SF_" + interObj.deviceId + "_" + interObj.partId + "_" + interObj.fieldname;
                myconsolelog("Main_Canvas looking for => " + attrToAddId);
                var attrField = document.getElementById(attrToAddId);
                myconsolelog("Main_Canvas looking for => " + attrToAddId + " => " + attrField);

                RT.Web.SetTiimeout(5, function () {
                    //this call enables direct drop to viz-template
                    console.log("XXXCOMPXXX MQTTCB payload => " + payload);
                    Main_Canvas_AttrClicked(event, attrToAddId, payload);
                });

                //add new field
                if (attrField === null) {
                    var elemCont = interObj.fieldname + "</br>" +
                        "<span>" + interObj.deviceId + "/" + interObj.partId + "</span>";

                    //class=window-content
                    //draggable='true'
                    //<div class='window-content' draggable='true'>
                    var attrFieldHtml = "";
                    //attrFieldHtml += "<div class='window-content' draggable='true'>";
                    attrFieldHtml += "<button id='" + attrToAddId + "' " +
                        "class='XXrr-customval' onclick=\"PlayClick();Main_Canvas_AttrClicked(event,'" +
                        attrToAddId + "','" + encodeURIComponent(payload) + "');\">" +
                        elemCont + "</button>";
                    //attrFieldHtml += "</div>";

                    attrDiv.innerHTML += attrFieldHtml;
                    myconsolelog("Main_Canvas looking adding => " + attrFieldHtml);

                    $("#" + attrToAddId).draggable();
                } else {
                    //this attr is already added
                }



            } catch (sferr) {
                myconsolelog("Main_Canvas ERROR => " + sferr);
            }


        }, interactionTopic);

    //show canvas
    $("#rr_canvas_wrap").show();

}

function Main_Canvas_AttrClicked(event, mAttrId, mPayload) {
    //var MSUI = importNamespace("Microsoft.MixedReality.Toolkit.UI");
    var UE = importNamespace("UnityEngine");


    console.log("XXXCOMPXXX AC mPayload => " + mPayload);

    var dPayload = decodeURIComponent(mPayload);
    var oData = JSON.parse(dPayload);

    //nothing picked up
    if (MAIN.stickyfinger.right == null) {
        console.log("Main_Canvas_AttrClicked clicked =>" + mAttrId + " | " + decodeURIComponent(mPayload));

        MAIN.stickyfinger.right = {
            "attrId": mAttrId,
            "data": oData,
            "tipgo": null
        };
        var rightFinger = UE.GameObject.Find("MyRightTip");

        var elemCont = "<div style='font-size:5vh;border-radius:4px;border:solid white 4px;font-weight:bold; background-color:rgb(0,77,109);padding:1vh;margin:1vh;'>" +
            "<span style='font-size:8vh;'>" + oData.fieldname + "</span></br>" +
            "<span style='font-size:4vh;'>Part: " + oData.partId + "</span></br>" +
            "<span style='font-size:4vh;'>Device: " + oData.deviceId + "</span></div>";

        //setup wu
        var wu = RT.Unity.CreateWU(mAttrId, elemCont, false);
        RT.Unity.SetParent(wu, rightFinger);
        RT.Unity.SetLocalPose(wu, [0, 0, 0.02], [0, 0, 0, 1], null);

        MAIN.stickyfinger.right.tipgo = wu;

        //add billboarding
        //wu.gameObject.AddComponent(MSUI.Billboard);
    } else {
        return;// THIS DISABLES the merge menu
        try {
            var palmGo = UE.GameObject.Find("PalmUpHandMenu");
            var wuName = "MergeMenu";

            var data2share = {
                "attr1": MAIN.stickyfinger.right.attrId,
                "attr2": mAttrId,
                "finger": MAIN.stickyfinger,
                "clicked": oData
            };
            var jsonStr = JSON.stringify(data2share);

            //reset sticky finger
            MAIN.stickyfinger.right.tipgo.Expire();
            MAIN.stickyfinger.right = null;

            elemCont = MAIN.WEBAPI.uiurl + "/attrcomb.html";
            var twu = RT.Unity.CreateWU(wuName, elemCont, true, 1920, 1080);

            RT.Unity.SetParent(twu, palmGo);
            RT.Unity.SetLocalPose(twu, [-0.4, 0, 0], [0, 0, 0, 1], null);

            myconsolelog("before AttrComb_ExternalInitMe data2share => " + jsonStr);

            //twu.document.Run("AttrComb_ExternalInitMe", [jsonStr]);
            RT.Web.SetTiimeout(500, function () {
                myconsolelog("before TM AttrComb_ExternalInitMe data2share => " + jsonStr);

                var PUI = importNamespace("PowerUI");
                var tw = PUI.WorldUI.Find("MergeMenu");
                if (tw != null) {
                    myconsolelog("before TM tw found for AttrComb_ExternalInitMe");
                    tw.document.Run("AttrComb_ExternalInitMe", [jsonStr]);
                } else {
                    myconsolelog("before TM tw NOT found for AttrComb_ExternalInitMe");
                }
            });
        } catch (err) {
            myconsolelog("preparing AttrComb ERROR => " + err);
        }
    }

}

function Main_CopyChart(mChartData) {

    if (mChartData == null) {
        myconsolelog("Main_CopyChart mChartData not set!");
        return;
    }

    try {
        var nextId = Main_GetNextChartId();
        var srcDataGoName = mChartData.dataGoName;
        var srcChartGoName = mChartData.chartGoName;
        var srcPanelGoName = mChartData.panelGoName;

        // ORDER of init commands of the copy IS IMPORTANT

        myconsolelog("Main_CopyChart 1");

        //TODO there might be some ref issue of generated copies
        //TODO make sure thats a copy
        var newChartData = mChartData; //this might be not deep enough
        MAIN.usercanvas.charts.push(newChartData);
        newChartData.fctUpdateId(nextId);

        newChartData.chartGo = RT.Unity.CopyGoByName(srcChartGoName);
        newChartData.chartGo.name = newChartData.chartGoName;

        newChartData.dataGo = RT.Unity.CopyGoByName(srcDataGoName);
        newChartData.dataGo.name = newChartData.dataGoName;

        newChartData.fctInit();
        newChartData.fctUpdateRefs();


        //search in hirarchy to get the right panel
        newChartData.panelGo = MAIN.UE.GameObject.Find(
            newChartData.chartGoName + "/" + srcPanelGoName);

        if (newChartData.panelGo != null) {
            RT.Unity.DestroyGO(newChartData.panelGo);

            //this important
            newChartData.panelGo = null;
        }

        newChartData.fctUpdatePos(MAIN.usercanvas.charts.length);
        newChartData.fctInitDataProvider();
        newChartData.fctInitWorldUi();
    } catch (err) {
        myconsolelog("Main_CopyChart ERROR => " + err);
    }
}

function Main_CanvasHide() {
    $('#rr_canvas_wrap').hide();

    var gos = MAIN.UE.GameObject.Find("SLIDER_canvas_style");
    if (gos != null) {
        RT.Unity.DestroyGO(gos);
    }

    var gov = MAIN.UE.GameObject.Find("SLIDER_canvas_vist");
    if (gov != null) {
        RT.Unity.DestroyGO(gov);
    }
}

function MAIN_RemoteCalled(mId, mChartGoName, mActionName) {
    myconsolelog("MAIN_RemoteCalled mId => " + mId);
    myconsolelog("MAIN_RemoteCalled mChartGoName => " + mChartGoName);
    myconsolelog("MAIN_RemoteCalled mActionName => " + mActionName);

    //TODO check if we have stickyfinger
    //if so use attr from sticky finger

    //TODO find chartData and set
    var id = parseInt(mId);

    myconsolelog("MAIN_RemoteCalled " + id + "/" + MAIN.usercanvas.charts.length);

    try {
        if (id >= 0) {

            var chartData = 0;
            for (var i = 0; i < MAIN.usercanvas.charts.length; i++) {
                if (id == MAIN.usercanvas.charts[i].id) {
                    chartData = MAIN.usercanvas.charts[i];
                    break;
                }
            }

            //sanety check
            if (chartData.chartGoName == mChartGoName) {
                if (mActionName.toUpperCase() == "TAP2PLACE") {
                    var c = importNamespace("RR").Runtime.ToggleTapToPlace(mChartGoName);
                }

                if (mActionName.toUpperCase() == "BOUNDS") {
                    var c = importNamespace("RR").Runtime.ToggleBounds(mChartGoName);
                }

                if (mActionName.toUpperCase() == "OBJMANI") {
                    var c = importNamespace("RR").Runtime.ToggleObjManipulation(mChartGoName);
                }

                if (mActionName.toUpperCase() == "CLOSE") {
                    //TODO delete from array
                    //update ids on all others after that one
                    //call update pos on all other

                    var chartId = chartData.id;
                    chartData.fctDestroy();

                    var tmpCharts = [];
                    for (var i = 0; i < MAIN.usercanvas.charts.length; i++) {
                        var c = MAIN.usercanvas.charts[i];
                        if (c.id >= 0) {
                            tmpCharts.push(c);
                        }
                    }

                    for (var i = 0; i < tmpCharts.length; i++) {
                        tmpCharts[i].fctUpdatePos(i);
                    }
                    MAIN.usercanvas.charts = tmpCharts;
                }

                if (mActionName.toUpperCase() == "COPY") {
                    Main_CopyChart(chartData);
                }

                if (mActionName.toUpperCase() == "REPLICATE") {
                    // get replicator instance
                    console.log("MAIN_RemoteCalled REPLICATE pressed!");
                    var repl = MAIN_GetRepl();
                    if (repl != null) {
                        RT.Web.SetTiimeout(1, function () {
                            console.log("MAIN_RemoteCalled REPLICATE before repl.AddVisToReplicate");
                            var vis = chartData.vis;
                            repl.AddVisToReplicate(vis.uid, vis, false);
                            console.log("MAIN_RemoteCalled REPLICATE after repl.AddVisToReplicate");
                        });
                    } else {
                        console.log("REPL => repl is NULL;");
                    }
                }

                if (mActionName.toUpperCase() == "ADDDIM" ||
                    mActionName.toUpperCase() == "XDIM" ||
                    mActionName.toUpperCase() == "YDIM" ||
                    mActionName.toUpperCase() == "ZDIM" ||
                    mActionName.toUpperCase() == "SZDIM" ||
                    mActionName.toUpperCase() == "COLDIM") {

                    var dimIdToAttach = 0;
                    var dimIdToAttach = -1;
                    if (mActionName.toUpperCase() == "XDIM") {
                        dimIdToAttach = 0;
                    } else if (mActionName.toUpperCase() == "YDIM") {
                        dimIdToAttach = 1;
                    } else if (mActionName.toUpperCase() == "ZDIM") {
                        dimIdToAttach = 2;
                    } else if (mActionName.toUpperCase() == "SZDIM") {
                        dimIdToAttach = 3;
                    } else if (mActionName.toUpperCase() == "COLDIM") {
                        dimIdToAttach = 4;
                    }

                    myconsolelog("MAIN_RemoteCalled " + mActionName + " ...");

                    if (MAIN.stickyfinger.right != null) {

                        var fData = {
                            "attrId": MAIN.stickyfinger.right.attrId,
                            "data": MAIN.stickyfinger.right.data //maybe parse that as an object
                        }

                        var jsonStr = JSON.stringify(MAIN.stickyfinger.right);
                        var replMqtt = MAIN.stickyfinger.right.data.mqtt;
                        var replFieldname = MAIN.stickyfinger.right.data.fieldname;
                        console.log("MAIN_RemoteCalled replMqtt= " + replMqtt);
                        console.log("MAIN_RemoteCalled replMqtt= " + replFieldname);

                        //report back to chartsub
                        console.log("MAIN_RemoteCalled updating panel ...");
                        RT.Web.SetTiimeout(1, function () {
                            chartData.panelGo.document.Run("ChartSub_ReportPayload", [jsonStr]);
                        });

                        //update replicator
                        console.log("MAIN_RemoteCalled updating replication ds ...");
                        RT.Web.SetTiimeout(1, function () {
                            var uniqueFieldName = replFieldname;
                            var splitTopic = replMqtt.split('/');
                            if (splitTopic.length > 3) {
                                uniqueFieldName = replFieldname + "-" + splitTopic[4]; // telemetry/buidling/floor/room/device/part/skill -> take device
                            }
                            var repl = MAIN_GetRepl();
                            repl.AddDataSourceDef(chartData.vis.uid, replMqtt, uniqueFieldName, replFieldname);
                        });


                        RT.Web.SetTiimeout(1, function () {
                            chartData.fctAddRealtimeDimension(jsonStr, dimIdToAttach); // TODO fix conversion fail method
                        });

                        MAIN.stickyfinger.right.tipgo.Expire();
                        MAIN.stickyfinger.right = null;


                    }
                }

                if (mActionName.toUpperCase() == "TXCAT" || mActionName.toUpperCase() == "TYCAT" || mActionName.toUpperCase() == "TZCAT") {
                    var axisID = -1;
                    if (mActionName.toUpperCase() == "TXCAT") {
                        axisID = 0;
                    } else if (mActionName.toUpperCase() == "TYCAT") {
                        axisID = 1;
                    } else if (mActionName.toUpperCase() == "TZCAT") {
                        axisID = 2;
                    }
                    var axisP = chartData.bvv.Presenter.AxisPresenters;
                    axisP[axisID].IsCategorical = !axisP[axisID].IsCategorical;
                    chartData.bvv.Rebuild();
                }

                if (mActionName.toUpperCase() == "TXORI" || mActionName.toUpperCase() == "TYORI" || mActionName.toUpperCase() == "TZORI") {
                    var axisID = -1;
                    if (mActionName.toUpperCase() == "TXORI") {
                        axisID = 0;
                    } else if (mActionName.toUpperCase() == "TYORI") {
                        axisID = 1;
                    } else if (mActionName.toUpperCase() == "TZORI") {
                        axisID = 2;
                    }
                    var axisP = chartData.bvv.Presenter.AxisPresenters;
                    var labelOri = axisP[axisID].LabelOrientation;
                    console.log("mActionName.toUpperCase() = " + mActionName.toUpperCase() + " ==================> " + labelOri);
                    axisP[axisID].LabelOrientation = (labelOri + 1) % 3;
                    chartData.bvv.Rebuild();
                }

                if (mActionName.toUpperCase() == "TXTICK" || mActionName.toUpperCase() == "TYTICK" || mActionName.toUpperCase() == "TZTICK") {
                    var axisID = -1;
                    if (mActionName.toUpperCase() == "TXTICK") {
                        axisID = 0;
                    } else if (mActionName.toUpperCase() == "TYTICK") {
                        axisID = 1;
                    } else if (mActionName.toUpperCase() == "TZTICK") {
                        axisID = 2;
                    }
                    var axisP = chartData.bvv.Presenter.AxisPresenters;
                    var labelTI = axisP[axisID].LabelTickIntervall;
                    labelTI = (labelTI + 1) % 5;
                    console.log("mActionName.toUpperCase() = " + mActionName.toUpperCase() + " ==================> " + labelTI);
                    axisP[axisID].LabelTickIntervall = labelTI;
                    chartData.bvv.Rebuild();
                }

                if (mActionName.toUpperCase() == "POINTS") {
                    if (chartData.lib == "IATK") {
                        chartData.fctChangeStyle(chartData.GeometryType.Points);
                    }
                }

                if (mActionName.toUpperCase() == "BARS") {
                    if (chartData.lib == "IATK") {
                        chartData.fctChangeStyle(chartData.GeometryType.Bars);
                    }
                }

                if (mActionName.toUpperCase() == "LINES") {
                    if (chartData.lib == "IATK") {
                        RT.Web.SetTiimeout(3, function () {
                            //chartData.abstractVisualisation.UpdateVisualisation(chartData.PropertyType.GraphDimension);
                            chartData.fctChangeStyle(chartData.GeometryType.Lines);
                            chartData.abstractVisualisation.UpdateVisualisation(chartData.PropertyType.LinkingDimension);
                            chartData.abstractVisualisation.UpdateVisualisation(chartData.PropertyType.GeometryType);
                            chartData.abstractVisualisation.CreateVisualisation();
                        });
                    }
                }
            }
        }
    } catch (err) {
        myconsolelog("MAIN_RemoteCalled ERROR => " + err);
    }
}

MAIN.visGo = null;
MAIN.vis = null;
MAIN.rtdsGo = null;
MAIN.rtds = null;

function MAIN_IATKTest() {
    var IATK = importNamespace('IATK');
    var IATKTest = importNamespace('IATKTest');

    console.log("MAIN_IATKTest 0");

    //Setup datasource
    var rtdsGo = new MAIN.UE.GameObject("jrtds");
    var rtds = rtdsGo.AddComponent(IATK.RealtimeDataSource);

    console.log("MAIN_IATKTest 1");

    //setup dimension
    rtds.AddDimension("id", 0, 100);
    rtds.AddDimension("val", 0, 100);

    //rtds.AddStrDataByStr("names", "id");
    //rtds.AddStrDataByStr("names", "val");

    for (var i = 0; i < 100; i++) {
        rtds.AddDataByStr("id", i);
    }

    console.log("MAIN_IATKTest 2");

    // setup vis
    var visGoName = "jvisgo";
    var visGo = new MAIN.UE.GameObject(visGoName);
    var vis = visGo.AddComponent(IATK.Visualisation);

    console.log("MAIN_IATKTest 3");

    if (vis != null) {

        console.log("MAIN_IATKTest 4");

        if (vis.theVisualizationObject == null) {
            vis.CreateVisualisation(0); //AbstractVisualisation.VisualisationTypes.SCATTERPLOT 0
        }

        vis.dataSource = rtds;
        var abstractVisualisation = vis.theVisualizationObject;

        // Axis
        abstractVisualisation.visualisationReference.xDimension.Attribute = "id"; // DimA
        abstractVisualisation.UpdateVisualisation(1); // AbstractVisualisation.PropertyType.X 1
        abstractVisualisation.visualisationReference.yDimension.Attribute = "val"; //DimB
        abstractVisualisation.UpdateVisualisation(2); // AbstractVisualisation.PropertyType.Y 2
        //abstractVisualisation.visualisationReference.zDimension.Attribute = "DimC";
        //abstractVisualisation.UpdateVisualisation(3); // AbstractVisualisation.PropertyType.Z 3
        //abstractVisualisation.visualisationReference.sizeDimension = "DimD";
        //abstractVisualisation.UpdateVisualisation(8); // AbstractVisualisation.PropertyType.OriginDimension 8

        //abstractVisualisation.visualisationReference.linkingDimension = "names";
        //abstractVisualisation.UpdateVisualisation(7);

        //AbstractVisualisation.GeometryType.Points 1
        //AbstractVisualisation.GeometryType.Bars 6
        //AbstractVisualisation.GeometryType.LinesAndDots 4
        vis.geometry = 6;
        vis.gameObject.name = visGoName;
        try {
            //vis.updateView(0);
        } catch (err) {
            console.log("MAIN_IATKTest vis.updateView(0); ERROR => " + err);
        }
    }
    RT.Web.SetInterval(5000, 13, IATK_RunTest);
}

function IATK_RunTest() {
    try {
        if (MAIN.rtdsGo == null) {
            MAIN.IATK = importNamespace('IATK');
            MAIN.IATKTest = importNamespace('IATKTest');

            MAIN.rtdsGo = MAIN.UE.GameObject.Find("jrtds");
            MAIN.rtds = MAIN.rtdsGo.GetComponent(MAIN.IATK.RealtimeDataSource);
        }

        MAIN.rtds.AddDataByStr("val", Math.floor(Math.random() * 5000));

        if (MAIN.visGo == null) {
            MAIN.visGo = MAIN.UE.GameObject.Find("jvisgo");
            MAIN.vis = MAIN.visGo.GetComponent(MAIN.IATK.Visualisation);

            var bc = MAIN.RR.Runtime.AddBoxCollider(MAIN.visGo);
            bc.center = new MAIN.UE.Vector3(0.5, 0.5, 0.5);
            MAIN.RR.Runtime.ToggleObjManipulation(MAIN.visGo.name);
        }
    } catch (e1) {
        console.log("IATK_RunTest ERROR e1 => " + e1);
    }

    try {
        MAIN.vis.updateView(0);
        //MAIN.IATKExt.IATKRuntime.UpdateVisView(MAIN.visGo);
    } catch (err) {
        console.log("MAIN_IATKTest live vis.updateView(0); ERROR => " + err);
    }
}


function MAIN_RREnvStartPosUpdater() {
    RT.Web.SetInterval(1000, 2000, MAIN_RREnvPosUpdater);
}

function MAIN_RREnvPosUpdater() {
    for (var key in MAIN.envhooks) {
        if (MAIN.envhooks.hasOwnProperty(key)) {
            if (MAIN.envhooks[key].hasOwnProperty("hasVis") && MAIN.envhooks[key].hasOwnProperty("isVis")) {
                if (MAIN.envhooks[key].hasVis && MAIN.envhooks[key].isVis) {

                    console.log("MAIN_RREnvPosUpdater key=" + key);

                    if (MAIN.envhooks[key].trackedGo != null) {
                        var visId = MAIN.envhooks[key].visId;
                        var curPosUE = MAIN.envhooks[key].trackedGo.transform.position;
                        var lastPos = MAIN.envhooks[key].lastPosition;

                        var dist =
                            Math.sqrt(
                                (curPosUE.x - lastPos[0]) * (curPosUE.x - lastPos[0]) +
                                (curPosUE.y - lastPos[1]) * (curPosUE.y - lastPos[1]) +
                                (curPosUE.z - lastPos[2]) * (curPosUE.z - lastPos[2])
                            );

                        console.log("MAIN_RREnvPosUpdater dist=" + dist);
                        if (dist > 0.05) {

                            MAIN.envhooks[key].lastPosition = [curPosUE.x, curPosUE.y, curPosUE.z];
                            var fixedPos = MAIN.envhooks[key].lastPosition;
                            fixedPos[1] += 0.15;

                            RT.Unity.SetLocalPose(MAIN.usercanvas.charts[visId].chartGo, [0, 0, 0], null, null);
                            RT.Unity.SetPose(MAIN.usercanvas.charts[visId].chartGo,
                                fixedPos, null, null);
                        }
                    }
                } else if (MAIN.envhooks[key].hasVis && !MAIN.envhooks[key].isVis) {

                    //fix that, this is replicated code
                    var curPosUE = MAIN.envhooks[key].trackedGo.transform.position;
                    var curRotUE = MAIN.envhooks[key].trackedGo.transform.rotation;
                    var lastPos = MAIN.envhooks[key].lastPosition;

                    var dist =
                        Math.sqrt(
                            (curPosUE.x - lastPos[0]) * (curPosUE.x - lastPos[0]) +
                            (curPosUE.y - lastPos[1]) * (curPosUE.y - lastPos[1]) +
                            (curPosUE.z - lastPos[2]) * (curPosUE.z - lastPos[2])
                        );

                    if (dist > 0.05) {
                        MAIN.envhooks[key].lastPosition = [curPosUE.x, curPosUE.y, curPosUE.z];
                        MAIN.envhooks[key].lastRotation = [curRotUE.x, curRotUE.y, curRotUE.z, curRotUE.w];

                        var fixedPos = MAIN.envhooks[key].lastPosition;
                        var fixedRot = MAIN.envhooks[key].lastRotation;

                        RT.Unity.SetLocalPose(MAIN.envhooks[key].go, [0, 0, 0], null, null);
                        RT.Unity.SetPose(MAIN.envhooks[key].go,
                            fixedPos, fixedRot, null);
                    }
                }
            }
        }
    }
}

function MAIN_RREnvOnTracked(mTrackableName, mTrackedGoName) {
    console.log("onTracked mTrackableName=" + mTrackableName + ", mTrackedGoName=" + mTrackedGoName);

    //set world to cover for tesing
    if (mTrackableName == "komplete_kontrol_m32") {
        console.log("XXXX => found " + mTrackableName);

        if (MAIN.worldGo == null) {
            MAIN.worldGo = MAIN.UE.GameObject.Find(MAIN.worldGoName);
        }

        if (MAIN.worldGo != null) {
            console.log("XXXX => found MAIN.worldGo");
            var go = MAIN.UE.GameObject.Find(mTrackedGoName);
            if (go != null) {
                console.log("XXXX => found mTrackedGoName => " + mTrackedGoName);
                //RT.Unity.SetParent(MAIN.worldgo, go);
                RT.Unity.SetLocalPose(MAIN.worldGo, [0, 0, 0], [0, 0, 0, 0], [1, 1, 1]);
                MAIN.worldGo.transform.rotation = go.transform.rotation;
                MAIN.worldGo.transform.position = go.transform.position;

                //adding temp world anchors
                RT.WA.AddToGO(MAIN.worldGo.name);
                //RT.WA.AddToGO("HW_popwall");
                //RT.WA.AddToGO("HW_rockwall");
            }
        }
        return;
    }
    try {
        if (MAIN.envhooks.hasOwnProperty(mTrackableName) == false) {
            console.log("onTracked initializing properties for " + mTrackableName);

            var parentGo = MAIN.UE.GameObject.Find(mTrackedGoName);
            MAIN.envhooks[mTrackableName] = {};
            MAIN.envhooks[mTrackableName].trackedGo = parentGo;
            MAIN.envhooks[mTrackableName].trackedGoName = mTrackedGoName;
            MAIN.envhooks[mTrackableName].id = mTrackableName;
            MAIN.envhooks[mTrackableName].hasVis = false;
            MAIN.envhooks[mTrackableName].isVis = true;
        }

        console.log("onTracked updating position");
        var parent = MAIN.envhooks[mTrackableName].trackedGo;
        var parentPos = parent.transform.position;
        var parentRot = parent.transform.rotation;
        MAIN.envhooks[mTrackableName].lastPosition = [parentPos.x, parentPos.y, parentPos.z];
        MAIN.envhooks[mTrackableName].lastRotation = [parentRot.x, parentRot.y, parentRot.z, parentRot.w];
        console.log("onTracked updating position => lastPosition=" + MAIN.envhooks[mTrackableName].lastPosition);
        console.log("onTracked updating position => lastRotation=" + MAIN.envhooks[mTrackableName].lastRotation);
    } catch (err1) {
        console.log("onTracked envhook setup ERROR => " + err1);
    }

    // check if that is a vis hook
    if (mTrackableName.indexOf("vis") >= 0) {
        try {
            console.log("onTracked vis linking ...");
            //find free chart to attach
            if (MAIN.envhooks[mTrackableName].hasVis == false) {
                var N = MAIN.usercanvas.charts.length;
                if (N > 0) {
                    for (var i = 0; i < N; i++) {
                        if (MAIN.usercanvas.charts[i].hasOwnProperty("hasTarget") == false) {
                            MAIN.usercanvas.charts[i].hasTarget = mTrackableName;

                            var visId = i;
                            var visGoName = MAIN.usercanvas.charts[visId].chartGo.name;

                            RT.Unity.SetLocalPose(MAIN.usercanvas.charts[visId].chartGo, [0, 0, 0], null, null);
                            RT.Unity.SetPose(MAIN.usercanvas.charts[visId].chartGo,
                                MAIN.envhooks[mTrackableName].lastPosition, null, null);

                            MAIN.envhooks[mTrackableName].hasVis = true;
                            MAIN.envhooks[mTrackableName].visId = visId;
                            console.log("onTracked linking " + MAIN.usercanvas.charts[i].chartGo.name +
                                " <=> " + mTrackableName);

                            console.log("onTracked vis linking 5");

                            //add billboard
                            //var bb = MAIN.RR.Runtime.GetOrAddBillboard(MAIN.usercanvas.charts[visId].chartGo);
                            //bb.PivotAxis = 0; // Microsoft.MixedReality.Toolkit.Utilities.PivotAxis.Y 1

                            //add bezier curve to target
                            var bezName = "pairbez-" + mTrackedGoName + "-" + visGoName;
                            var bezGo = RT.Unity.CreateLine(bezName, visGoName, mTrackedGoName, mTrackableName);
                            if (bezGo != null) {
                                MAIN.envhooks[mTrackableName].bezGo = bezGo;
                                //TODO maybe make bez as child of the vis-go
                                RT.Unity.SetParent(bezGo, MAIN.envhooks[mTrackableName].trackedGo);
                            }
                        }
                    }
                }
            } else {
                //todo update pos here
                console.log("onTracked vis updating vis-pose ...");
                var visId = MAIN.envhooks[mTrackableName].visId;
                RT.Unity.SetLocalPose(MAIN.usercanvas.charts[visId].chartGo, [0, 0, 0], null, null);
                RT.Unity.SetPose(MAIN.usercanvas.charts[visId].chartGo,
                    MAIN.envhooks[mTrackableName].lastPosition, null, null);
            }
        } catch (err2) {
            console.log("onTracked linking ERROR => " + err2);
        }
    } else {

        //check for gameobject

        //search if we have a device match
        if (MAIN.envhooks[mTrackableName].hasVis == false) {


            var dkeys = Object.keys(MAIN.location.devices.data);
            for (var ki = 0; ki < dkeys.length; ki++) {
                var dkey = dkeys[ki];
                var deviceData = MAIN.location.devices.data[dkey];
                console.log("onTracked dkey = " + dkey);



                if (deviceData.hasOwnProperty("envtrackedname")) {
                    var target = deviceData.envtrackedname;
                    console.log("onTracked target = " + target);
                    console.log("onTracked deviceData.name = " + dkey);

                    if (target == mTrackableName) {
                        var goDeviceName = dkey;
                        MAIN.envhooks[mTrackableName].hasVis = true;
                        MAIN.envhooks[mTrackableName].isVis = false;
                        MAIN.envhooks[mTrackableName].goName = goDeviceName;
                        MAIN.envhooks[mTrackableName].go = MAIN.UE.GameObject.Find(goDeviceName);

                        RT.Unity.SetLocalPose(MAIN.envhooks[mTrackableName].go, [0, 0, 0], null, null);
                        RT.Unity.SetPose(MAIN.envhooks[mTrackableName].go,
                            MAIN.envhooks[mTrackableName].lastPosition, MAIN.envhooks[mTrackableName].lastRotation, null);
                    }
                }
            }
        } else {
            RT.Unity.SetLocalPose(MAIN.envhooks[mTrackableName].go, [0, 0, 0], [0, 0, 0, 1], null);
            RT.Unity.SetPose(MAIN.envhooks[mTrackableName].go,
                MAIN.envhooks[mTrackableName].lastPosition, MAIN.envhooks[mTrackableName].lastRotation, null);
        }
    }
    //TODO do some filtering on the parent here
}

function MAIN_RREnvOnTrackingLost(mTrackableName, mTrackedGoName) {
    console.log("onTrackingLost mTrackableName=" + mTrackableName + ", mTrackedGoName=" + mTrackedGoName);
}

function MAIN_StartRREnvTracking() {

    var reqHeaders = ["content-type", "application/x-www-form-urlencoded"];
    var url = MAIN.WEBAPI.apiBase + "/getfile2?name=";

    var urlA = url + MAIN.location.envtargets.xml;
    RT.Web.DownloadFile("GET", urlA, reqHeaders, MAIN.location.envtargets.xml, false, function () {
        console.log("MAIN_StartRREnvTracking downloaded => " + MAIN.location.envtargets.xml);
    });

    var urlB = url + MAIN.location.envtargets.dat;
    RT.Web.DownloadFile("GET", urlB, reqHeaders, MAIN.location.envtargets.dat, false, function () {
        console.log("MAIN_StartRREnvTracking downloaded => " + MAIN.location.envtargets.dat);
    });

    importNamespace("RR").Runtime.StartImgTracking(
        MAIN_RREnvOnTracked, MAIN_RREnvOnTrackingLost, MAIN.location.envtargets.xml);

    MAIN_RREnvStartPosUpdater();
}

function MAIN_CreateLabel(mName, mTranslation, mRotation, mScale, mParent, mLabelText) {
    try {
        var content = '<div id="thislabel" style="position: absolute;top: \
position: absolute;top: 0;left: 0; \
height: auto; margin: 2vh; padding: 2vh; font-size: 14vh; \
font-weight: bold; color: rgb(238, 238, 238); \
background-color: rgb(0, 77, 109); border: solid rgb(238, 238, 238) 2px; \
display: block; border-radius: 5px;">' + mLabelText + '</div>';
        var tWu1 = RT.Unity.CreateWU(mName, content, false, 700, 360);
        tWu1.SetOrigin(0.5, 0.5);
        RT.Unity.SetParent(tWu1, mParent);
        RT.Unity.SetLocalPose(tWu1, mTranslation, mRotation, mScale);
        return tWu1;
    } catch (err) {
        myconsolelog("MAIN_CreateLabel ERROR => " + err);
    }
    return null;
}

//TODO move that elsewhere
//moved to mopop.js as is
