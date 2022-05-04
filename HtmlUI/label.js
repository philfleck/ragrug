/// 2020 By Philipp Fleck
var LABEL = {};

function Label_SetInfo(mDeviceId, mPartId) {
    try {
        RT.Help.Log("Label_SetInfo " + mDeviceId + ", " + mPartId);
        //document.getElementById("mstatus").innerHTML = "" + mDeviceId + "/" + mPartId;
        LABEL.deviceId = mDeviceId;
        LABEL.partId = mPartId;

        document.getElementById("titlebar").innerHTML = LABEL.partId;
        Label_Init();
        //RT.Web.SetTiimeout(50, Label_Init());
    } catch (err) {
        RT.Help.Log("Label_SetInfo ERROR => " + err);
    }
}

function Label_Init() {
    try {
        var dKey = LABEL.deviceId;
        var pKey = LABEL.partId;
        var strData = RT.Web.ReadFromStore(dKey);
        var data = JSON.parse(strData);


        //initmanipulation
        var c = importNamespace("RR").Runtime.ToggleObjManipulation(Label_GetThisGo().name);


        /*
         * strData
         * {"_id":"zrga2-d1","_rev":"2-5720262ae352d84d1245b95d53908bcb","name":"d1","id":"zrga2-d1","registered":false,"parts":[{"name":"s000","position":[0,1,0],"mqttTopic":"inffeld16/2nd/id02068/d1/s000","visurl":"http://192.168.1.168:3000/render/d-solo/H6CTNOUZz/heating?orgId=1&refresh=30s&from=1585542623524&to=1585564223524&panelId=2&width=1000&height=500&tz=Europe%2FVienna"},{"name":"s001","position":[0.5,0.5,0.5],"mqttTopic":"inffeld16/2nd/id02068/d1/s001"}]}
         */

        //Label_Init dKey=NETGEAR81-5G-littleserver, pKey=JACK
        RT.Help.Log("Label_Init dKey=" + dKey + ", pKey=" + pKey);
        RT.Help.Log("Label_Init strData= " + strData);

        var thisPart = null;
        var thisPartId = 0;
        for (var i = 0; i < data.parts.length; i++) {
            if (data.parts[i].name === pKey) {
                thisPart = data.parts[i];
                thisPartId = i;
                break;
            }
        }

        LABEL.device = data;
        LABEL.part = thisPart;

        $("#img_cont").hide();
        $("#mqtt_cont").hide();


        if (thisPart.hasOwnProperty("displayname")) {
            console.log("LABEL_Init displayname=" + thisPart.displayname);
            document.getElementById("titlebar").innerHTML = thisPart.displayname;
        }

        if (thisPart.hasOwnProperty("mqttTopic")) {
            RT.Help.Log("Label_Init " + pKey + " thisPart.mqttTopic= " + thisPart.mqttTopic);
            //$("#mqtt_cont").html(thisPart.mqttTopic).show();
            LABEL.mqttTopic = thisPart.mqttTopic;
            Label_SetupMqtt(thisPart.mqttTopic);
        } else {
            //TODO try auto create path based on the provided info for live vis
            var autoGenTopic = "telemetry";
            autoGenTopic += "/" + data.locationpath;
            autoGenTopic += "/" + data.devicename; //data.modelname
            autoGenTopic += "/" + pKey;
            autoGenTopic += "/#"; //including all subs

            RT.Help.Log("Label_Init MQTT autoGenTopic=" + autoGenTopic);

            $("#mqtt_cont").html(thisPart.mqttTopic).show();
            LABEL.mqttTopic = autoGenTopic;
            Label_SetupMqtt(autoGenTopic);

        }

        if (thisPart.hasOwnProperty("loadcnr") && thisPart.hasOwnProperty("cnrid")) {
            if (thisPart.loadcnr == true) {
                //LABEL_InitCnr();
                CNR_InitFromId(thisPart.cnrid);
            } else {
                //do not load cnr
            }
        } else {
            //LABEL_InitCnr();
        }

        if (thisPart.hasOwnProperty("overlaoadurl")) {
            document.location.href = thisPart.overlaoadurl;
            //var iframeDiv = '<iframe id="frame" src="' + thisPart.overlaoadurl + '" width="100%" height="300"></iframe >';
            //$("#img_cont").html(iframeDiv);
        }

        //partially depends on LABEL.mqttTopic
        if (thisPart.hasOwnProperty("visurl")) {
            $("#img_cont").show();
            Label_UpdateImage();
            RT.Web.SetInterval(1000 + (Math.random() * 1000), 120000 + (Math.random() * 1000), Label_UpdateImage);
        } else {
            //TODO 
            //var dashboardUrl = "http://10.0.0.6:3000/api/dashboards/uid/Yq3Gat4Gk";

            var headers = ["content-type", "application/x-www-form-urlencoded"];
            var data = "";

            var dashboarJsonUrl = RT.Help.DashboardJsonUrl;

            //console.log("Label_Init visurl dashboarJsonUrl=" + dashboarJsonUrl);

            RT.Web.SendWebReq("GET", dashboarJsonUrl, headers, data,
                function (mError, mData) {
                    //console.log("Label_Init visurl ERR = > " + mError);
                    //console.log("Label_Init visurl Data = > [" + typeof mData + "] " + mData);

                    if (!mError && data != null) {
                        dashObj = JSON.parse(mData);

                        var panels = dashObj.dashboard.panels;
                        if (panels != null && panels != 'undefined') {
                            //console.log("Label_Init visurl #panels =" + panels.length);
                            for (var i = 0; i < panels.length; i++) {
                                var qDevice = panels[i].scopedVars.tag_q_device.value;


                                var qDeviceP = qDevice.split("/");
                                var autoPath = LABEL.mqttTopic;
                                var autoPathP = autoPath.split("/");

                                //console.log("Label_Init visurl " + qDevice + " vs " + autoPath);

                                var panelId = -1;
                                for (var pi = 0; pi < qDeviceP.length; pi++) {
                                    if (qDeviceP[pi] == autoPathP[pi]) {
                                        panelId = panels[i].id;
                                    } else {
                                        panelId = -1;
                                        break;
                                    }
                                }

                                if (panelId > 0) {

                                    panelStoreKey = LABEL.device + "-P" + panelId;
                                    var setPanel = RT.Web.ReadFromStore(panelStoreKey);

                                    if (setPanel == null) {

                                        //console.log("Label_Init visurl FOUND panel => " + panelId + ", " + qDevice + ", " + autoPath);

                                        var extUrl = "http://10.0.0.2:3000/d-solo/Yq3Gat4Gk/dyndash?orgId=1&panelId=" + panelId + "&width=800&height=500";
                                        var renderUrl = "http://10.0.0.2s:3000/render/d-solo/Yq3Gat4Gk/dyndash?orgId=1&panelId=" + panelId + "&width=800&height=500";
                                        //var extUrl = "http://192.168.0.152:3000/d-solo/Yq3Gat4Gk/dyndash?orgId=1&panelId=" + panelId + "&width=800&height=500";
                                        //var renderUrl = "http://192.168.0.152:3000/render/d-solo/Yq3Gat4Gk/dyndash?orgId=1&panelId=" + panelId + "&width=800&height=500";
                                        thisPart.visurl = renderUrl;
                                        thisPart.exturl = extUrl;

                                        //console.log("Label_Init visurl #renderUrl=" + renderUrl + ", extUrl=" + extUrl);

                                        $("#img_cont").show();
                                        RT.Web.SetInterval(1000 + (Math.random() * 1000), 120000 + (Math.random() * 1000), Label_UpdateImage);
                                        RT.Web.WriteToStore(panelStoreKey, renderUrl);
                                    }
                                    break;
                                }

                                //console.log("Label_Init visurl panels[0] =" + panels[0].scopedVars.value);
                                //http://10.0.0.6:3000/render/d-solo/Yq3Gat4Gk/dyndash?orgId=1&refresh=1m&from=1601357733032&to=1601379333033&var-tag_q_room=All&var-tag_q_device=All&var-tag_q_part=All&panelId=112&width=1000&height=500&tz=Europe%2FVienna
                                //http://10.0.0.6:3000/render/d-solo/Yq3Gat4Gk/dyndash?orgId=1&panelId=112&width=1000&height=500
                            }
                        }
                    }
                });
        }

        if (thisPart.hasOwnProperty("show3dpart")) {
            Label_Show3dPart();
        }

        if (thisPart.hasOwnProperty("exturl")) {
            LABEL.exturl = thisPart.exturl;
            Label_ExtUrl();
        }

        if (thisPart.hasOwnProperty("cmd")) {

            var html = "";
            for (var i = 0; i < thisPart.cmd.length; i++) {
                var c = thisPart.cmd[i];

                html += "<div class='rr-customval' onclick='PlayClick();Label_SendMqttCmd(\"" +
                    c + "\");'>" + c + "</div>";
            }
            $("#mqtt_cmd").html(html).show();
        }
    } catch (err) {
        RT.Help.Log("Label_Init ERROR => " + err);
    }
}

function Label_SendMqttCmd(mCmd) {
    try {
        RT.MQTT.Publish(LABEL.mqttTopic + "/cmd", mCmd);
    } catch (err) {
        console.log("Label_SendMqttCmd [" + LABEL.mDevice + "|" + LABEL.mPartId + "] ERROR => " + msg);
    }
}

function LABEL_InitCnr() {
    CNR_InitFromId("6f1bb07c.9a108");
}

function Label_ExtUrl() {

}

function Label_GetThisGo() {
    try {
        console.log("Label_GetThisGo ... ");

        var dKey = LABEL.deviceId;
        var pKey = LABEL.partId;

        var parentNameToPlaceAt = "Label-" + dKey + "UniScale" + "_" + pKey;
        console.log("Label_GetThisGo looking  => " + parentNameToPlaceAt);

        var targetParentGO = importNamespace("UnityEngine").GameObject.Find(parentNameToPlaceAt);
        if (targetParentGO != null) {
            console.log("Label_GetThisGo looking for parent ... " + parentNameToPlaceAt + " => FOUND!");
        }
        return targetParentGO;
    } catch (err) {
        console.log("Label_GetThisGo ERROR => " + err);
    }
    return null;
}

function Label_Show3dPart() {
    try {
        var dKey = LABEL.deviceId;
        var pKey = LABEL.partId;
        var strData = RT.Web.ReadFromStore(dKey);
        var data = JSON.parse(strData);

        var UE = importNamespace("UnityEngine");

        var deviceModelName = dKey + "BoundingBox";
        var deviceGo = UE.GameObject.Find(deviceModelName);

        if (deviceGo != null) {
            //console.log("XXXXXXXXXX deviceGo found => " + deviceModelName);
        } else {
            return;
        }

        var parentNameToPlaceAt = "Label-" + dKey + "UniScale" + "_" + pKey;

        var targetParentGO = UE.GameObject.Find(parentNameToPlaceAt);
        if (targetParentGO != null) {

            //var partGo = deviceGo.transform.Find(pKey);
            var partGo = UE.GameObject.Find(pKey);
            if (partGo != null) {

                //var partCopy = UE.GameObject.Instantiate(partGo);
                var partCopy = RT.Unity.CopyGO(partGo);
                if (partCopy != null) {
                    partCopy.name = "Copy_" + pKey + "Model";
                    partCopy.transform.parent = targetParentGO.transform;
                    partCopy.transform.localPosition = UE.Vector3.zero;
                    partCopy.transform.localScale = UE.Vector3.one;

                    if (partGo != null && deviceGo != null) {
                        //partCopy.transform.localScale = partGo.transform.lossyScale;

                        var sx = deviceGo.transform.localScale.x / targetParentGO.transform.localScale.x;
                        var sy = deviceGo.transform.localScale.y / targetParentGO.transform.localScale.y;
                        var sz = deviceGo.transform.localScale.z / targetParentGO.transform.localScale.z;

                        partCopy.transform.localScale = new UE.Vector3(sx, sy, sz);
                    }
                }
            }
        } else {
        }
    } catch (err) {
        console.log("Label_Show3dPart ERROR => " + err);
    }
}

function Label_UpdateImage() {
    try {

        /*
        var skip = false;
        if (LABEL.hasOwnProperty("skipData")) {
            skip = LABEL.skipData;
        }

        if (skip) {
            $("#img_cont").hide();
            return;
        }
        */

        $("#img_cont").show();
        var thisPart = LABEL.part;
        if (thisPart.hasOwnProperty("visextern")) {
            document.getElementById("img_cont").innerHTML = "<img onclick='PlayClick();Label_RClick(\"" + thisPart.visextern + "\");' src='" + thisPart.visurl + "'></img>";
        } else {
            document.getElementById("img_cont").innerHTML = "<img src='" + thisPart.visurl + "'></img>";
        }
    } catch (err) {
        console.log("Label_UpdateImage ERROR => " + err);
    }
}

function Label_RClick(mUrl) {
    RT.MQTT.Publish("companion/url", mUrl);
}

function Label_SelectField(event, mFieldName) {
    var dKey = LABEL.deviceId;
    var pKey = LABEL.partId;

    //NETGEAR81-5G-littleserver|DC-BIG|dcin_v|undefined|undefined
    console.log("Label_SelectField => " + dKey + "|" + pKey + "|" + mFieldName);

    /*
    //local vis update
    try {
        //try update GOVIS w
        console.log("GOVIS => mFieldName=" + mFieldName);
        console.log("GOVIS => LABEL.GOVIS.dimids=" + LABEL.GOVIS.dimids);

        var idxK = LABEL.GOVIS.dim.indexOf(mFieldName)
        var targetDimension = LABEL.GOVIS.dimids[idxK];

        console.log("GOVIS => targetDimension=" + targetDimension);

        var paramsIdx = [0, targetDimension];
        LABEL.GOVIS.gdp.Initialize(LABEL.GOVIS.rtp, 0, LABEL.GOVIS.nCached - 1, paramsIdx);
        LABEL.GOVIS.bvv.Rebuild();
    } catch (viserr) {
        console.log("GOVIS Label_SelectField ERROR => viserr => " + viserr);
    }
    */

    //interaction notice, mqtt -> in canvas multiuser hehe
    try {
        //TODO move that to settings
        var interactionTopic = "vis/interaction/selectedfield";
        var interactionPayload = {
            "deviceId": LABEL.deviceId,
            "partId": LABEL.partId,
            "fieldname": mFieldName,
            "mqtt": LABEL.mqttTopic
        };

        //RT.MQTT.Publish(interactionTopic, JSON.stringify(interactionPayload));
        RT.MQTT.PublishMod(interactionTopic, JSON.stringify(interactionPayload), true);
    } catch (viserr2) {
        console.log("GOVIS Label_SelectField ERROR => viserr2 => " + viserr);
    }


    return;

    // old selector code
    var selector = {};
    selector.field = mFieldName;
    selector.tag4 = mDevice;
    selector.tag5 = mName;

    var gcd = RT.Web.ReadFromStore("GRAPHCOMP");
    console.log("gcd => " + gcd);

    var selectors = [];

    if (gcd == null) {
        selectors[0] = selector;
        selectors[1] = selector;
    } else {
        selectors = JSON.parse(gcd);
        selectors[0] = selectors[1];
        selectors[1] = selector;
    }

    var sjStr = JSON.stringify(selectors);
    console.log("Label_SelectField => " + sjStr);
    RT.Web.WriteToStore("GRAPHCOMP", sjStr);
}

function Label_GetIntTypeStr() {
    return "INT";
}

function Label_GetFloatTypeStr() {
    return "FLOAT";
}

function Label_GetITypeStr() {
    return "STRING";
}

function Label_InitGOVIS() {
    console.log("Label_InitGOVIS initiaizing ...");
    try {
        if (!LABEL.hasOwnProperty("GOVIS")) {
            var UE = importNamespace("UnityEngine");
            var RRU2V = importNamespace("RRu2v");
            var U2V = importNamespace("u2vis");

            LABEL.GOVIS = {};
            LABEL.GOVIS.goName = "GOVIS-" + LABEL.deviceId + "" + LABEL.partId;
            LABEL.GOVIS.chartGoName = "Chart-" + LABEL.deviceId + "" + LABEL.partId;
            LABEL.GOVIS.chartGo = null;
            LABEL.GOVIS.goVis = new UE.GameObject(LABEL.GOVIS.goName);
            LABEL.GOVIS.rtp = LABEL.GOVIS.goVis.AddComponent(RRU2V.RealtimeDataProvider);
            LABEL.GOVIS.visPrefabNames = RT.Unity.GetVisPrefabNames();
            LABEL.GOVIS.bvv = null;
            LABEL.GOVIS.gdp = null;
            LABEL.GOVIS.dim = [];
            LABEL.GOVIS.dimids = [];
            LABEL.GOVIS.lastDimid = 0;
            LABEL.GOVIS.lastIdxs = [];
            LABEL.GOVIS.nCached = 10;
        }
    } catch (err) {
        console.log("Label_InitGOVIS ERROR => " + err);
    }
}

function Label_VIS_AddDimensionToDataSet(mDimensionName, mInitValue, mTypeStr, mInitWithI) {
    try {
        if (LABEL != null) {
            if (LABEL.hasOwnProperty("GOVIS")) {
                if (LABEL.GOVIS.rtp != null) {
                    var U2V = importNamespace("u2vis");

                    //add dimension and its id
                    var dimMensionId = LABEL.GOVIS.lastDimid;
                    LABEL.GOVIS.dim.push(mDimensionName);
                    LABEL.GOVIS.dimids.push(dimMensionId);
                    LABEL.GOVIS.lastIdxs.push(0);
                    LABEL.GOVIS.lastDimid += 1;

                    if (mTypeStr.toUpperCase() == "FLOAT") {
                        LABEL.GOVIS.rtp.Data.Add(new U2V.FloatDimension(mDimensionName, null));
                        for (var i = 0; i < LABEL.GOVIS.nCached; i++) {
                            if (mInitWithI) {
                                LABEL.GOVIS.rtp.AddToDataFloat(dimMensionId, i);
                            } else {
                                LABEL.GOVIS.rtp.AddToDataFloat(dimMensionId, mInitValue);
                            }
                        }
                        return true;
                    }

                    if (mTypeStr.toUpperCase() == "INT") {
                        LABEL.GOVIS.rtp.Data.Add(new U2V.IntegerDimension(mDimensionName, null));
                        for (var i = 0; i < LABEL.GOVIS.nCached; i++) {
                            if (mInitWithI) {
                                LABEL.GOVIS.rtp.AddToDataInt(dimMensionId, i);
                            } else {
                                LABEL.GOVIS.rtp.AddToDataInt(dimMensionId, mInitValue);
                            }
                        }
                        return true;
                    }

                    if (mTypeStr.toUpperCase() == "STRING") {
                        LABEL.GOVIS.rtp.Data.Add(new U2V.StringDimension(mDimensionName, null));
                        for (var i = 0; i < LABEL.GOVIS.nCached; i++) {
                            if (mInitWithI) {
                                LABEL.GOVIS.rtp.AddToDataString(dimMensionId, "" + i);
                            } else {
                                LABEL.GOVIS.rtp.AddToDataString(dimMensionId, "" + mInitValue);
                            }
                        }
                        return true;
                    }
                }
                LABEL.GOVIS.bvv.Rebuild();
            }
        }
    } catch (err) {
        console.log("Label_VIS_AddDimensionToDataSet ERROR => " + err);
    }
    return false;
}

function Label_MatchTopics(inTopic, regTopic) {
    var contProcessing = false;
    if (inTopic.length >= 6 && regTopic.length >= 6) {
        for (var i = 5; i >= 0; i--) { //reverse to shorten searchtime because of /telemetry/building/room//device/part ! we are at part level here
            if (inTopic[i] == regTopic[i]) {
                contProcessing = true;
            } else {
                contProcessing = false;
                break;
            }
        }
    }
    return contProcessing;
}

function LABEL_VIS_InitChart(mChartPrefabName, mChartGoName) {
    try {
        console.log("LABEL_VIS_InitChart instantiating  => " + mChartPrefabName + " @ " + mChartGoName);

        LABEL.GOVIS.chartGo = RT.Unity.GetVisPrefabInstance(mChartPrefabName, mChartGoName);
        if (LABEL.GOVIS.chartGo != null) {

            console.log("LABEL_VIS_InitChart spawned => " + LABEL.GOVIS.chartGo.name);
            var parent = Label_GetThisGo();

            if (parent != null) {
                var UE = importNamespace("UnityEngine");
                var U2V = importNamespace("u2vis");
                LABEL.GOVIS.chartGo.transform.parent = parent.transform;
                LABEL.GOVIS.chartGo.transform.localPosition = new UE.Vector3(-800, 900, 0);
                LABEL.GOVIS.chartGo.transform.localScale = new UE.Vector3(700, 700, 700);
                LABEL.GOVIS.chartGo.transform.localRotation = new UE.Quaternion(0, 0, 0, 1);
                LABEL.GOVIS.gdp = LABEL.GOVIS.chartGo.GetComponent(U2V.GenericDataPresenter);
                //LABEL.GOVIS.gdp = LABEL.GOVIS.chartGo.GetComponent(U2V.MultiDimDataPresenter);
                LABEL.GOVIS.bvv = LABEL.GOVIS.chartGo.GetComponent(U2V.BaseVisualizationView);

                if (LABEL.GOVIS.gdp != null) {
                    console.log("LABEL_VIS_InitChart found gdp!");
                    LABEL.GOVIS.gdp.SetSelectedItemIndices(0, LABEL.GOVIS.nCached);
                }

                if (LABEL.GOVIS.bvv != null) {
                    console.log("LABEL_VIS_InitChart found bvv!");
                    LABEL.GOVIS.bvv.Rebuild();
                }

                //LABEL.GOVIS.bvv.LazyRebuild = true;
            } else {
                console.log("LABEL_VIS_InitChart parent NOT FOUND!");
            }
        }
    } catch (err) {
        console.log("LABEL_VIS_InitChart ERROR => " + err);
    }
}

function Label_VIS_SetValue(mDimId, mPosIndex, mTypeStr, mValue) {
    try {
        console.log("Label_VIS_SetValue mDimId=" + mDimId + "(" + LABEL.GOVIS.dim[mDimId] + ")|mPosIndex=" + mPosIndex + "|" + mTypeStr + "|mValue=" + mValue);

        if (mDimId == "undefined") {
            return false;
        }

        //LABEL.GOVIS.rtp.Data[dim].Set(LABEL.GOVIS.lastIdx, kFloat);
        if (mTypeStr.toUpperCase() == "FLOAT") {
            console.log("Label_VIS_SetValue float before " + mTypeStr);
            LABEL.GOVIS.rtp.SetValueFloat(mDimId, mPosIndex, mValue);
            console.log("Label_VIS_SetValue float after");
            return true;
        }

        if (mTypeStr.toUpperCase() == "INT") {
            console.log("Label_VIS_SetValue int before " + mTypeStr);
            LABEL.GOVIS.rtp.SetValueInt(mDimId, mPosIndex, mValue);
            console.log("Label_VIS_SetValue int after");
            return true;
        }

        if (mTypeStr.toUpperCase() == "STRING") {
            console.log("Label_VIS_SetValue string before " + mTypeStr);
            LABEL.GOVIS.rtp.SetValueString(mDimId, mPosIndex, mValue);
            console.log("Label_VIS_SetValue string after");
            return true;
        }
    } catch (err) {
        console.log("Label_VIS_SetValue ERROR => " + err);
    }
    return false;
}

function Label_SetupMqtt(mTopic) {
    try {
        var dKey = LABEL.deviceId;
        var pKey = LABEL.partId;
        RT.MQTT.Subscribe(mTopic);

        RT.MQTT.RegisterCallbackTopic(
            function (topic, payload) {
                var inTopic = topic.split("/");
                var regTopic = LABEL.mqttTopic.split("/");
                var contProcessing = Label_MatchTopics(inTopic, regTopic);

                //semi good fix
                //if (inTopic[inTopic.length - 1] == "STATE") {
                //    contProcessing = false;
                //}


                if (contProcessing) {
                    var data = null;
                    var d = JSON.parse(payload);

                    if (Array.isArray(d)) {
                        data = d[0];
                    } else {
                        data = d;
                    }

                    //cabinet realted controll part
                    try {
                        LABEL_CabinetRelatedControlCustoms(topic, data);
                    } catch (err000) {
                        console.log("Label_SetupMqtt LABEL_CabinetRelatedControlCustoms ERROR => " + err000);
                    }

                    if (LABEL.hasOwnProperty("skipData")) {
                        if (LABEL.skipData) {
                            return;
                        }
                    }

                    /*
                    // Setup GOVIS object for u2vis graph
                    RT.Web.SetTiimeout(5, function () {
                        if (!LABEL.hasOwnProperty("GOVIS")) {
                            try {
                                Label_InitGOVIS();
                                var isOk = Label_VIS_AddDimensionToDataSet("id", 0, Label_GetIntTypeStr(), true);
                                //for testing
                                //Label_VIS_AddDimensionToDataSet("id2", 0, Label_GetIntTypeStr(), true);
                                if (isOk) {
                                    try {
                                        LABEL_VIS_InitChart(LABEL.GOVIS.visPrefabNames[0], LABEL.GOVIS.chartGoName);
                                        //if (LABEL.GOVIS.gdp != null) {
                                        //    var paramsIdx = [0, 1];
                                        //    LABEL.GOVIS.gdp.Initialize(LABEL.GOVIS.rtp, 0, LABEL.GOVIS.nCached, paramsIdx);
                                        //}
                                        //LABEL.GOVIS.bvv.RebindPresenter();
                                        //LABEL.GOVIS.bvv.Rebuild();
                                        //LABEL.GOVIS.bvv.RebindPresenter();
                                    } catch (err001) {
                                        console.log("GOVIS ERROR visPrefabNames NOT FOUND => " + err001);
                                    }
                                }
                            } catch (viserr) {
                                console.log("GOVIS ERROR GOVIS => " + viserr);
                            }
                        }
                    });*/


                    //console.log("mqtt-sub: generic value for datastreams");
                    // generic value for datastreams
                    var html = "";
                    var keys = Object.keys(data);
                    for (var i = 0; i < keys.length; i++) {
                        var k = keys[i];
                        //console.log("mqtt-sub: " + i + "/" + keys.length + " => " + k);
                        if (
                            !(
                                k == "ts" ||
                                k == "type" ||
                                k == "building" ||
                                k == "floor" ||
                                k == "room" ||
                                k == "device" ||
                                k == "name"
                            )
                        ) {

                            var elemId = "id-" + k;
                            var elem = document.getElementById(elemId);
                            var innerElemCont = "";

                            var val = parseFloat(data[k]);
                            //console.log("found " + k + " -- " + data[k] + " -- " + parseFloat(data[k]) + " -- " + typeof parseFloat(data[k]) );

                            if ("" + val !== "NaN") {
                                val = "" + val.toFixed(2);
                                LABEL_AddedValElem(elemId, val, k);
                            } else {
                                var subdata = data[k];
                                var subkeys = Object.keys(subdata);

                                if (subkeys.length > 0) {
                                    for (var si = 0; si < subkeys.length; si++) {

                                        var sk = subkeys[si];
                                        elemId = k + "-" + sk;
                                        var sv = parseFloat(subdata[sk]);

                                        console.log("LABEL_MqttSubCb " + LABEL.deviceId + "/" + LABEL.partId + ", sk=" + sk + ", ssd[k]=" +
                                            subdata[sk] + ", elemId=" + elemId + ", sv=" + sv);

                                        console.log("LABEL_MqttSubCb a");
                                        if ("" + sv !== "NaN") {
                                            sv = "" + sv.toFixed(2);
                                        } else {
                                            sv = subdata[sk];
                                        }
                                        console.log("LABEL_MqttSubCb b");
                                        LABEL_AddedValElem(elemId, sv, sk);
                                        console.log("LABEL_MqttSubCb c");
                                    }

                                } else {
                                    console.log("LABEL_MqttSubCb d");
                                    LABEL_AddedValElem(elemId, subdata, k);
                                }


                            }

                            //dynamically add reported fields and values

                            //if (justInitGOVIS) {
                            //    return;
                            //}


                            //RT.Web.SetTiimeout(100, function () {

                            /*
                            try {
                                var idxK = LABEL.GOVIS.dim.indexOf(k);
                                console.log("Label_SetupMqtt adding ... " + k + ", " + idxK);
                                console.log("Label_SetupMqtt LABEL.GOVIS.dim=" + LABEL.GOVIS.dim);

                                //this is a new value we never saw bevore
                                if (idxK < 0) {
                                    var key = k;
                                    var val = data[k];
                                    var kFloat = parseFloat(data[k].toFixed(4));

                                    //LABEL.GOVIS.chartGo.SetActive(false);

                                    console.log("GOVIS adding A idxK=" + idxK + "|key=" + key + "|val=" + val);
                                    var isOk = Label_VIS_AddDimensionToDataSet(key, 0, Label_GetFloatTypeStr(), false);

                                    //RT.Web.SetTiimeout(50, function () {
                                    if (isOk) {
                                        idxK = LABEL.GOVIS.dim.indexOf(k);
                                        Label_VIS_SetValue(LABEL.GOVIS.dimids[idxK], 0, Label_GetFloatTypeStr(), kFloat);
                                    }

                                    if (isOk == false) {
                                        console.log("GOVIS Label_VIS_AddDimensionToDataSet FAILED!");
                                    }

                                    if (LABEL.GOVIS.gdp != null) {
                                        console.log("GOVIS LABEL.GOVIS.gdp.Initialize ...");
                                        var paramsIdx = [0, 1, 2];
                                        //var paramsIdx = LABEL.GOVIS.dimids;
                                        LABEL.GOVIS.gdp.Initialize(LABEL.GOVIS.rtp, 0, LABEL.GOVIS.nCached, paramsIdx);
                                    }


                                    //LABEL.GOVIS.bvv.RebindPresenter();
                                    //LABEL.GOVIS.bvv.Rebuild();
                                    //});

                                    //LABEL.GOVIS.bvv.RebindPresenter();
                                    //LABEL.GOVIS.chartGo.SetActive(true);

                                } else {
                                    var kFloat = parseFloat(data[k].toFixed(4));
                                    var dimId = LABEL.GOVIS.dimids[idxK];
                                    var posIdx = LABEL.GOVIS.lastIdxs[idxK];
                                    LABEL.GOVIS.lastIdxs[idxK] = (LABEL.GOVIS.lastIdxs[idxK] + 1) % LABEL.GOVIS.nCached;
                                    Label_VIS_SetValue(dimId, posIdx, Label_GetFloatTypeStr(), kFloat);
                                    //LABEL.GOVIS.bvv.RebindPresenter();
                                    LABEL.GOVIS.bvv.Rebuild();
                                    //importNamespace("RR").Runtime.TriggerReInitChart(LABEL.GOVIS.chartGo);

                                }
                            } catch (viserr2) {
                                console.log("Label_SetupMqtt ERROR GOVIS adding k=" + k + "," + data[k] + ", Error=" + viserr2);
                            }*/
                            //});
                        }
                    }
                    //LABEL.GOVIS.bvv.Rebuild();

                    //TODO
                    // todo show all selectable fields here
                    // on click write selected field to store
                    // after pressing on compare retrieve a new comparison graf on the interface

                }

            }, mTopic);
    } catch (err) {
        console.log("Label_SetupMqtt ERROR => " + err);
    }
}

/*
innerElemCont = val + "</br>" + "<span>" + k + "</span>";
if (elem == null || elem == 'undefined') {
    html = "<button id='" + elemId + "' class='rr-customval' onclick=\"PlayClick();Label_SelectField(event,'" +
        k + "');\">" +
        innerElemCont + "</button>";
    console.log("GOVIS html=>" + html);
    document.getElementById("mqtt_cont").innerHTML += html;
} else {
    elem.innerHTML = innerElemCont;
}
 */

function LABEL_AddedValElem(elemId, val, k) {
    var elem = document.getElementById(elemId);
    innerElemCont = val + "</br>" + "<span>" + k + "</span>";
    if (elem == null || elem == 'undefined') {
        html = "<button id='" + elemId + "' class='rr-customval' onclick=\"PlayClick();Label_SelectField(event,'" +
            k + "');\">" +
            innerElemCont + "</button>";
        console.log("GOVIS html=>" + html);
        document.getElementById("mqtt_cont").innerHTML += html;
    } else {
        elem.innerHTML = innerElemCont;
    }
}

function Label_HandleCabinet(topic, data) {
    try {
        if (data.hasOwnProperty("reachable")) {
            var isReachable = data.reachable;

            console.log("isReachable=" + isReachable + ", LABEL.exturl=" + LABEL.exturl);

            if (isReachable === false) {
                //<iframe id="theFrame" src="http://localhost" style="width:100%;" frameborder="0"></iframe >
                //LABEL.exturl = "http://www.orf.at";
                var iframeHtml = "<iframe src=\"" + LABEL.exturl + "\" style=\"width:100%;height:500px;background:none;border:none;\" allowtransparency=\"true\"></iframe>";
                document.getElementById("mqtt_cont").innerHTML = iframeHtml;
            } else {
                document.getElementById("mqtt_cont").innerHTML = "OK";
            }
        }
    } catch (err) {
        console.log("Label_HandleCabinet ERROR => " + err)
    }
}

function Label_PinToMesh(event) {
    console.log("Label_PinToMesh Pin Clicked! " + LABEL.deviceId);
    try {
        importNamespace("RegMan").LabelPinner.pinToMesh(LABEL.deviceId, LABEL.partId);
    } catch (err) {
        console.log("Label_PinToMesh ERROR => " + err);
    }
}

function Label_ToggleExplosion(event) {
    try {
        var UE = importNamespace("UnityEngine");
        var ERR = importNamespace("RRExtern");
        var gName = LABEL.deviceId + "BoundingBox";
        var go = UE.GameObject.Find(gName);
        //if (go != null) {
        console.log("Label_ToggleExplosion go found => " + gName);
        var td = go.GetComponent(ERR.ThreeDModelFunctions);
        //if (td != null) {

        td.ToggleExplodedView();
        //}
        //}
    } catch (err) {
        console.log("Label_ToggleExplosion ERROR => " + err);
    }
}

function LABEL_CabinetRelatedControlCustoms(topic, data) {
    if (topic === "home/1st/hallway/ecabinet/9") {
        //Label_HandleCabinet(topic, data);
        if (data.hasOwnProperty("reachable")) {
            var isReachable = data.reachable;

            console.log("isReachable=" + isReachable + ", LABEL.exturl=" + LABEL.exturl);

            if (isReachable === false) {
                LABEL.skipData = true;
                //<iframe id="theFrame" src="http://localhost" style="width:100%;" frameborder="0"></iframe >
                //LABEL.exturl = "http://www.orf.at";
                var iframeHtml = "<iframe src=\"" + LABEL.exturl + "\" style=\"width:100%;height:500px;background:none;border:none;\" allowtransparency=\"true\"></iframe>";
                document.getElementById("mqtt_cont").innerHTML = iframeHtml;
                $("#img_cont").hide();
                return;
            } else {
                document.getElementById("mqtt_cont").innerHTML = "";
                LABEL.skipData = false;
                $("#img_cont").show();
            }
            return;
        }
    }
}