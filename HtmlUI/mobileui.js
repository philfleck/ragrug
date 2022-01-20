/// 2021 By Philipp Fleck
var MU = {};
MU.visibles = {};
MU.activeDevice = "";
MU.activeTopics = [];


function MU_LoadDevices() {
    $("#id_controls_2").hide();
    RT.MQTT.Publish("arclient/inject", "Main_RegisterDevice();");
}


function MU_ShowReadings() {
    document.getElementById("id_sensor_reading").style.display = "block";
    document.getElementById("id_sensor_vis").style.display = "block";
    document.getElementById("id_controls_1").style.display = "block";
}

function MU_CloseVis() {
    $("#id_sensor_reading").hide();
    $("#id_sensor_vis").hide();
    $("#id_controls_1").hide();

    try {
        //unregister active mqtt
        for (var i = 0; i < MU.activeTopics.length; i++) {
            RT.MQTT.UnregisterCallbackFromTopic(MU.activeTopics[i], MU_MqttSubCb);
        }
        MU.activeTopics = [];
    } catch (err) {
        console.log("MU_CloseVis => " + err);
    }

    document.getElementById("id_sensor_reading").innerHTML =
        '<div id="id_sensor_reading_title" class="sensor-readings-title">' +
        "No Device" + '</div>';
}

function MU_Init() {
    console.log("MU_Init ...");
    var t = "rr/visibility";
    RT.MQTT.Subscribe(t);
    RT.MQTT.RegisterCallbackTopic(function (topic, payload) {
        console.log("MU topic:" + topic + ", payload:" + payload);
        MU_ProcessVisibilities(payload);
    }, t);
}

function MU_ProcessVisibilities(mPayload) {
    var data = JSON.parse(mPayload);
    var goName = data.goName;

    MU_AddButton(data);

    if (data.isVisible) {
        if (MU.visibles.hasOwnProperty(goName)) {

        } else {
            MU.visibles[goName] = data;
        }
    } else {
        delete MU.visibles[goName];
    }
}

function MU_AddButton(data) {
    if (data.isVisible) {
        var html = '<div id="' + data.goName + '" class="vis-button" >' +
            '<button onclick="MU_ButtonClicked(\'' + data.goName + '\');">' + data.data.devicename + "</button>"
            + '</div>';
        console.log("MU_AddButton html => " + html);
        document.getElementById("id_visible_sensors").innerHTML += html;
    } else {
        document.getElementById(data.goName).remove();
    }
}

function MU_ButtonClicked(mName) {
    console.log("MU_ButtonClicked => " + mName);
    MU_CloseVis();

    var data = MU.visibles[mName];
    MU.activeDevice = data.data.devicename;
    MU.ativeDeviceKey = mName;
    //$('#id_sensor_reading').show();
    MU_ShowReadings();
    document.getElementById("id_sensor_reading_title").innerHTML = data.data.devicename;

    // device
    // parts
    // mqtt: telemetry/locationpath/devicename/partkey/#

    var locationpath = data.data.locationpath;
    var devicename = data.data.devicename;

    document.getElementById("id_sensor_reading").innerHTML =
        '<div id="id_sensor_reading_title" class="sensor-readings-title">' +
        data.data.devicename + '</div>';

    MU.activeTopics = [];

    for (var i = 0; i < data.data.parts.length; i++) {
        var part = data.data.parts[i];
        if (part.active) {
            var partKey = data.data.parts[i].name;

            var genTopic = "telemetry/" + locationpath + "/" + devicename + "/" + partKey + "/#";

            if (data.data.parts[i].hasOwnProperty("mqttTopic")) {
                genTopic = data.data.parts[i].mqttTopic;
            }

            console.log("MU_ButtonClicked genTopic=" + genTopic);

            //RT.MQTT.Subscribe(getTopic);
            

            //RT.MQTT.UnregisterCallback(MU_MqttSubCb);
            RT.MQTT.UnregisterCallbackFromTopic(genTopic, MU_MqttSubCb);
            RT.MQTT.RegisterCallbackTopic(MU_MqttSubCb, genTopic);
            MU.activeTopics.push(genTopic);
        }
    }
    
    //Grafana Vis
    var grafanaTopic = "telemetry/" + locationpath + "/" + devicename + "/" + partKey + "/#";
    MU_LoadGrafana(grafanaTopic, mName);
}

function MU_LoadGrafana(mGenTopic, mName) {
    var headers = ["content-type", "application/x-www-form-urlencoded"];
    var data = "";

    var dashboarJsonUrl = RT.Help.DashboardJsonUrl;
    console.log("MU_LoadGrafana dashboarJsonUrl=" + dashboarJsonUrl);
    //console.log("Label_Init visurl dashboarJsonUrl=" + dashboarJsonUrl);

    RT.Web.SendWebReq("GET", dashboarJsonUrl, headers, data,
        function (mError, mData) {
            if (!mError && data != null) {
                dashObj = JSON.parse(mData);

                var panels = dashObj.dashboard.panels;
                if (panels != null && panels != 'undefined') {
                    console.log("MU_LoadGrafana found panels => " + mData);

                    for (var i = 0; i < panels.length; i++) {
                        var qDevice = panels[i].scopedVars.tag_q_device.value;

                        var qDeviceP = qDevice.split("/");
                        var autoPath = mGenTopic;
                        var autoPathP = autoPath.split("/");

                        console.log("MU_LoadGrafan qDeviceP => " + qDeviceP);
                        console.log("MU_LoadGrafan autoPath => " + autoPath);

                        var panelId = -1;
                        for (var pi = 0; pi < qDeviceP.length; pi++) {
                            if (qDeviceP[pi] == autoPathP[pi]) {
                                panelId = panels[i].id;
                            } else {
                                panelId = -1;
                                break;
                            }
                        }

                        console.log("MU_LoadGrafan panelId => " + panelId);

                        if (panelId > 0) {

                            //panelStoreKey = LABEL.device + "-P" + panelId;
                            //var setPanel = RT.Web.ReadFromStore(panelStoreKey);

                            //if (setPanel == null) {
                            if (true) {
                                //console.log("Label_Init visurl FOUND panel => " + panelId + ", " + qDevice + ", " + autoPath);
                                panelId = 119;
                                //var extUrl = "http://10.0.0.2:3000/d-solo/Yq3Gat4Gk/dyndash?orgId=1&panelId=" + panelId + "&width=800&height=500";
                                //var renderUrl = "http://10.0.0.2:3000/render/d-solo/Yq3Gat4Gk/dyndash?orgId=1&panelId=" + panelId + "&width=800&height=500";
                                var extUrl = "http://192.168.0.152:3000/d-solo/Yq3Gat4Gk/dyndash?orgId=1&panelId=" + panelId + "&width=800&height=500";
                                var renderUrl = "http://192.168.0.152:3000/render/d-solo/Yq3Gat4Gk/dyndash?orgId=1&panelId=" + panelId + "&width=800&height=500";
                                MU.visibles[mName].visurl = renderUrl;
                                MU.visibles[mName].exturl = extUrl;
                                MU.activeVisUrl = renderUrl;
                                MU.activeExtUrl = extUrl;
                                //console.log("Label_Init visurl #renderUrl=" + renderUrl + ", extUrl=" + extUrl);

                                console.log("MU_LoadGrafana MU.activeVisUrl=" + MU.activeVisUrl);

                                $("#id_sensor_vis").show();
                                MU_UpdateImage();
                                //RT.Web.SetInterval(50, 59000, MU_UpdateImage);
                                //RT.Web.WriteToStore(panelStoreKey, renderUrl);
                            }
                            break;
                        }
                    }
                }
            }
        });
}

function MU_UpdateImage() {
    console.log("MU_LoadGrafana MU_UpdateImage MU.activeVisUrl => " + MU.activeVisUrl);
    console.log("MU_LoadGrafana MU_UpdateImage MU.activeExtUrl => " + MU.activeExtUrl);

    if (MU.hasOwnProperty("activeExtUrl")) {
        document.getElementById("id_sensor_vis").innerHTML = "<img onclick='MU_ImgClick(\"" + MU.activeExtUrl + "\");' src='" + MU.activeVisUrl + "'></img>";
    } else {
        document.getElementById("id_sensor_vis").innerHTML = "<img src='" + MU.activeVisUrl + "'></img>";
    }

    //TODO if in the same here!
    RT.Web.SetTiimeout(59000, MU_UpdateImage);
}

function MU_ImgClick(mUrl) {
    console.log("MU_ImgClick mUrl => " + mUrl);
    importNamespace("UnityEngine").Application.OpenURL(mUrl);
}

function MU_MqttSubCb(topic, payload) {
    console.log("MU_MqttSubCb topic=" + topic + ", payload=" + payload);

    //safety mqtt filter
    var doCont = false;
    var topics = topic.split('/');
    for (var ti = 0; ti < topics.length; ti++) {
        if (MU.activeDevice == topics[ti]) {
            doCont = true;
            break;
        }
    }

    //check if accidently hit mqtt cb from inactive device
    if (!doCont) {
        return;
    }

    var sd = JSON.parse(payload);

    var keys = Object.keys(sd);
    for (var i = 0; i < keys.length; i++) {

        try {
            var k = keys[i];

            var elemId = "id-" + k;
            console.log("MU_MqttSubCb elemId=" + elemId);

            //var elem = document.getElementById(elemId);
            //var innerElemCont = "";

            var val = parseFloat(sd[k]);
            if ("" + val !== "NaN") {
                val = "" + val.toFixed(2);
                MU_AddedValElem(elemId, val, k);
            } else {
                
                //check if object
                var subkeys = Object.keys(sd[k]);

                if (subkeys.length > 0) {


                    var ssd = sd[k];
                    for (var si = 0; si < subkeys.length; si++) {

                        var sk = subkeys[si];
                        elemId = k + "-" + sk;
                        var sv = parseFloat(ssd[sk]);

                        console.log("MU_MqttSubCb sk=" + sk + ", ssd[k]=" + ssd[sk] + ", elemId=" + elemId + ", sv=" + sv);


                        if ("" + sv !== "NaN") {
                            sv = "" + sv.toFixed(2);
                        } else {
                            sv = ssd[sk];
                        }
                        MU_AddedValElem(elemId, sv, sk);
                    }

                } else {
                    MU_AddedValElem(elemId, sd[k], k);
                }
                
            }

            //innerElemCont = "<span>" + val + "</span><span>" + k + "</span>";
            //console.log("MU_MqttSubCb innerElemCont=" + innerElemCont);

            //if (elem == null || elem == 'undefined') {
            //    html = '<div id="' + elemId + '" class="sensor-val">';
            //    html += innerElemCont;
            //    html += "</div>";
            //    document.getElementById("id_sensor_reading").innerHTML += html;
            //} else {
            //    elem.innerHTML = innerElemCont;
            //}

        } catch (readerr) {
            console.log("MU_MqttSubCb ERROR => " + readerr);
        }

    }
}

function MU_AddedValElem(elemId, val, k) {
    var elem = document.getElementById(elemId);
    var innerElemCont = "";

    innerElemCont = "<span>" + val + "</span><span>" + k + "</span>";
    console.log("MU_MqttSubCb innerElemCont=" + innerElemCont);

    if (elem == null || elem == 'undefined') {
        var html = '<div id="' + elemId + '" class="sensor-val">';
        html += innerElemCont;
        html += "</div>";
        document.getElementById("id_sensor_reading").innerHTML += html;
    } else {
        elem.innerHTML = innerElemCont;
    }
}