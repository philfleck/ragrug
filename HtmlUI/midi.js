/// 2021 By Philipp Fleck
var MI = {};
MI.visibles = {};
MI.activeDevice = "";
MI.activeTopics = [];
MI.go = null;
MI.buttons = [];

MI.RR = importNamespace("RR");
MI.UE = importNamespace("UnityEngine");

MI.ampli = 1;
MI.freqmult = 1;

function MIDI_INIT() {
    //MI.go = importNamespace("UnityEngine").GameObject.Find("NETGEAR81-5G-midicontrol");
    MI.go = importNamespace("UnityEngine").GameObject.Find("visusguest-midicontrol");

    RT.Web.SetTiimeout(5, MIDI_InitSoundChart);
    RT.Web.SetTiimeout(10, MIDI_Init3DButtons);

    RT.Web.SetTiimeout(25, function () {
        RT.Unity.SetPose(MI.buttonGo, [0, 0, 0, 0], [0, 0, 0, 1], null);
        RT.Unity.SetParent(MI.buttonGo, MI.go);
        RT.Unity.SetPose(MI.buttonGo, [0, 0, 0, 0], [0, 0, 0, 1], null);
        RT.Unity.SetLocalPose(MI.buttonGo, [0, 0, 0, 0], [0, 0, 0, 1], null);

        //var uiScale = MI.go.transform.localScale.x;
        //var s = 1 / uiScale;
        var s = 10000;
        RT.Unity.SetLocalPose(MI.buttonGo, [0, 0, 0, 0], [0, 0, 0, 1], [s, s, s]);
    });
    MIDI_TEST_KEYBOARD();
}

function MIDI_TEST_KEYBOARD()
{
    var t = "visusguest-midi/#";
    RT.MQTT.Subscribe(t);
    RT.MQTT.RegisterCallbackTopic(function (topic, payload) {
        console.log("MU topic:" + topic + ", payload:" + payload);
        //MU_ProcessVisibilities(payload);
    }, t);
}

function MIDI_InitSoundChart() {

    //spawn chart
    var nextId = 100;
    var mPrefabName = "IATKChart";
    MI.chartData = RT.VIS.GetNewChartObjectIATK(nextId, 0, mPrefabName, 0.07, 0.1);
    MI.RR.Runtime.ToggleObjManipulation(MI.chartData.chartGoName);
    MI.chartData.panelGo.Expire();

    RT.Web.SetTiimeout(50, function () {
        try {
            var T = [0, 0, 0];
            var R = [0, 0, 0, 1];

            //thats a dirty search

            RT.Unity.SetParent(MI.chartData.chartGo, MI.go);
            RT.Unity.SetLocalPose(MI.chartData.chartGo, T, R, null);

            RT.Unity.SetLocalPose(MI.chartData.chartGo, [-900, 460, 0], [-0.25, 0, 0, 0.96], null);
        } catch (err) {
            console.log("MIDI_InitSoundChart placement ERROR => " + err);
        }
    });

    var dimData = {};
    dimData.data = {};
    dimData.data.mqtt = "rr/midi/sound";
    dimData.data.fieldname = "ampli";
    var jsonStr = JSON.stringify(dimData);

    RT.Web.SetTiimeout(100, function () {
        try {
            MI.chartData.fctAddRealtimeDimension(jsonStr, 1); // TODO fix conversion fail method
            MI.chartData.fctAddRealtimeDimension(jsonStr, 4); // TODO fix conversion fail method
        } catch (err) {
            console.log("MIDI_InitSoundChart fctAddRealtimeDimension ERROR => " + err);
        }
    });


    RT.Web.SetTiimeout(450, function () {
        try {
            MI.chartData.abstractVisualisation.visualisationReference.zDimension.Attribute = "Undefined";
            MI.chartData.abstractVisualisation.UpdateVisualisation(MI.chartData.PropertyType.Z);
            MI.chartData.abstractVisualisation.visualisationReference.sizeDimension = "Undefined";
            MI.chartData.abstractVisualisation.UpdateVisualisation(MI.chartData.PropertyType.Size);
            MI.chartData.fctChangeStyle(MI.chartData.GeometryType.Lines);
        } catch (err) {
            console.log("MIDI_InitSoundChart setup vis ERROR => " + err);
        }
    });

    RT.Web.SetTiimeout(350, function () {
        try {
            MI.chartData.vis.theVisualizationObject.creationConfiguration.Serialize("");
        } catch (err) {
            console.log("MIDI_InitSoundChart update ERROR => " + err);
        }
    });

    //RT.Web.SetTiimeout(1000, function () {
    //    MI.chartData.fctChangeStyle(MI.chartData.GeometryType.LinesAndDots);
    //});
}

function MIDI_Init3DButtons() {
    try {
        MI.buttonGo = new MI.UE.GameObject("buttons");
        RT.Unity.SetPose(MI.buttonGo, [0, 0, 0, 0], [0, 0, 0, 1], null);
        RT.Unity.SetParent(MI.buttonGo, MI.go);
        RT.Unity.SetPose(MI.buttonGo, [0, 0, 0, 0], [0, 0, 0, 1], null);

        var prefix = "UIBTN-" + MI.chartData.chartGoName;

        //amp plus
        var plusBtnName = prefix + "-ampplus";
        var fctAmpPlus = function () { MIDI_BtnPlus(); };
        var plusBtn = RT.MRTK.SpawnButton(plusBtnName, "Amp+", "Plus", false, fctAmpPlus);
        MI.buttons.push(plusBtn);

        //amp minus
        var minusBtnName = prefix + "-ampminus";
        var fctAmpMinus = function () { MIDI_BtnMinus(); };
        var minusBtn = RT.MRTK.SpawnButton(minusBtnName, "Amp-", "Minus", false, fctAmpMinus);
        MI.buttons.push(minusBtn);

        //freq up
        var freqUpBtnName = prefix + "-frequp";
        var fctFreqUp = function () { MIDI_FreqUp(); };
        var freqUpBtn = RT.MRTK.SpawnButton(freqUpBtnName, "Freq+", "FreqUp", false, fctFreqUp);
        MI.buttons.push(freqUpBtn);

        //freq down
        var freqDownBtnName = prefix + "-freqdown";
        var fctFreqDown = function () { MIDI_FreqDown(); };
        var freqDownBtn = RT.MRTK.SpawnButton(freqDownBtnName, "Freq-", "FreqDown", false, fctFreqDown);
        MI.buttons.push(freqDownBtn);

        //toggle manipulation
        var tmBtnName = prefix + "-tm";
        var fctTM = function () { MIDI_ToggleManip(); };
        var tmBtn = RT.MRTK.SpawnButton(tmBtnName, "TM", "TM", false, fctTM);
        MI.buttons.push(tmBtn);

        var lnBtnName = prefix + "-ln";
        var fctLn = function () { MIDI_Lines(); };
        var lnBtn = RT.MRTK.SpawnButton(lnBtnName, "Lines", "Lines", false, fctLn);
        MI.buttons.push(lnBtn);

        // set parent for all buttons
        for (var i = 0; i < MI.buttons.length; i++) {
            RT.Unity.SetParent(MI.buttons[i].go, MI.buttonGo);
            RT.Unity.SetLocalPose(MI.buttons[i].go, [0, 0, 0, 0], [0, 0, 0, 1], null);
        }



        //set position of button
        RT.Unity.SetLocalPose(plusBtn.go, [-0.07, 0.00, -0.01], [0, 0, 0, 1], [0.8, 0.8, 0.8]);
        RT.Unity.SetLocalPose(minusBtn.go, [-0.035, 0.00, -0.01], [0, 0, 0, 1], [0.8, 0.8, 0.8]);

        RT.Unity.SetLocalPose(freqUpBtn.go, [-0.07, 0.04, -0.01], [0, 0, 0, 1], [0.8, 0.8, 0.8]);
        RT.Unity.SetLocalPose(freqDownBtn.go, [-0.035, 0.04, -0.01], [0, 0, 0, 1], [0.8, 0.8, 0.8]);

        RT.Unity.SetLocalPose(tmBtn.go, [0.07, 0, -0.01], [0, 0, 0, 1], [0.8, 0.8, 0.8]);
        RT.Unity.SetLocalPose(lnBtn.go, [0.07, 0.04, -0.01], [0, 0, 0, 1], [0.8, 0.8, 0.8]);



    } catch (err) {
        console.log("MIDI_Init3DButtons ERROR => " + err);
    }
}

function MIDI_Lines() {
    //MI.chartData.chartGo.SetActive(false);
    MI.chartData.vis.theVisualizationObject.creationConfiguration.Serialize("");
    try {
        MI.chartData.fctChangeStyle(MI.chartData.GeometryType.Lines);
        //MI.chartData.fctChangeStyle(MI.chartData.GeometryType.Bars);
    } catch (err) {
        console.log("MIDI_Lines ERROR => " + err);
    }
    //MI.chartData.chartGo.SetActive(true);
    MI.chartData.vis.theVisualizationObject.creationConfiguration.Serialize("");
}

function MIDI_ToggleManip() {
    try {
        MI.RR.Runtime.ToggleObjManipulation(MI.chartData.chartGoName);
    } catch (err) {
        console.log("MIDI_ToggleManip ERROR => " + err);
    }
}

function MIDI_FreqUp() {
    if (MI.freqmult > 0 && MI.freqmult < 100) {
        MI.freqmult += 5;
    }
    document.getElementById("freqval").innerHTML = MI.freqmult;
    RT.MQTT.Publish("rr/midi/freq", MI.freqmult);
}

function MIDI_FreqDown() {
    MI.freqmult -= 5;
    if (MI.freqmult < 0) {
        MI.freqmult = 1;
    }
    document.getElementById("freqval").innerHTML = MI.freqmult;
    RT.MQTT.Publish("rr/midi/freq", MI.freqmult);
}

function MIDI_BtnPlus() {
    if (MI.ampli > 0 && MI.ampli < 100) {
        MI.ampli += 5;
    }
    document.getElementById("ampval").innerHTML = MI.ampli;
    RT.MQTT.Publish("rr/midi/ampli", MI.ampli);
}

function MIDI_BtnMinus() {
    MI.ampli -= 5;
    if (MI.ampli < 0) {
        MI.ampli = 1;
    }
    document.getElementById("ampval").innerHTML = MI.ampli;
    RT.MQTT.Publish("rr/midi/ampli", MI.ampli);
}





















/*
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
*/