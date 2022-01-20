/// 2020 By Philipp Fleck
var CS = {};
//CS.mainwu = null;
//CS.isClicked = false;

CS.msglist = [];
CS.artefacts = {};
CS.apiBase = RT.Help.GetStringFromCfg("apiurl");

function EH_Init() {
    /*var PUI = importNamespace("PowerUI");
    var mainWu = PUI.WorldUI.Find("Main");
    if (mainWu != null) {
        console.log("ChartSub_Init found main wu");
        CS.mainwu = mainWu;
    }*/
    console.log("EH_Init called!");
    EH_SetupMqtt();
    EH_Clear();
}

function EH_Clear() {
    document.getElementById("slotview").innerHTML = "";;
}

function EH_AddMsg(msg) {
    CS.msglist.push(msg);
    if (CS.msglist.length > 10) {
        CS.msglist.shift();
    }
}

function EH_UpdateList() {
    var msg = "";
    for (var i = 0; i < CS.msglist.length; i++) {
        msg += CS.msglist[i];
    }
    document.getElementById("slotview").innerHTML = msg;
}

function EH_SetupMqtt() {
    var tTopic = "MOPOP/userevents";
    RT.MQTT.Subscribe(tTopic);
    RT.MQTT.RegisterCallbackTopic(
        function (topic, payload) {
            console.log("EH_SetupMqtt mqtt-sub: " + topic + " | " + payload);

            var p = JSON.parse(payload);
            var pId = p.id;

            var msg = "";
            //placed
            if (pId == 2) {
                var artefact = p.data.artefact;
                var aId = artefact.TrackableName;

                if (CS.artefacts.hasOwnProperty(aId)) {
                    var art = CS.artefacts[aId];
                    msg = art.artist + "-" + art.song;
                } else {
                    EH_DownloadArtefact(aId);
                    msg = "Placed: " + aId;
                }

                var html = "<p>" + msg + "</p>";
                EH_AddMsg(html);
            }

            //score
            if (pId == 3) {
                var score = p.data.score.toFixed(2);
                msg = "Score: " + score;
                $("#titlebar").html(msg);
            }

            EH_UpdateList();
        }, tTopic);
}


function EH_DownloadArtefact(mCoverId) {
    var url = CS.apiBase + "/mopop/song?coverid=" + mCoverId;
    var headers = ["content-type", "application/x-www-form-urlencoded"];
    var data = "";

    RT.Web.SendWebReq("GET", url, headers, data,
        function (mError, mData) {
            if (mError == false) {
                var sData = JSON.parse(mData);
                if (sData.length > 0) {
                    var d = sData[0];
                    CS.artefacts[d.coverid] = d;
                    EH_UpdateList();
                }
            }
        });
    RT.Web.SetTiimeout(1000, function () {
        EH_UpdateList();
    });
}


/*
function Infotable_Init() {
    console.log("ChartSub_Init called");

    var PUI = importNamespace("PowerUI");
    var mainWu = PUI.WorldUI.Find("Main");
    if (mainWu != null) {
        console.log("ChartSub_Init found main wu");
        CS.mainwu = mainWu;
    }
    Infotable_Clear();
}

function Infotable_NewPick(mData) {
    //Infotable_NewPick mData => [{"artist":"Lady Gaga","song":"The Fame","coverid":"2805595956","coverart":"2805595956.jpg","publishdate":"2008-10-28T00:00:00.000Z","publisher":"","score":"100"}]
    console.log("Infotable_NewPick mData => " + mData);

    try {
        var dObj = JSON.parse(mData);
        console.log("Infotable_NewPick #entries => " + dObj.length);
        for (var i = 0; i < dObj.length; i++) {
            var e = dObj[i];
            var eStr = e.artist + " - " + e.song;
            var slotId = "slot" + i;
            var elem = document.getElementById(slotId);
            if (elem != null) {
                elem.innerHTML = eStr;
            }
            //$('#slot'+i).html(eStr);
        }
    } catch (err) {
        console.log("Infotable_NewPick ERROR => " + err);
        console.log("Infotable_NewPick ERROR @ mData=" + mData);
    }
}



function Infotable_Compare() {
    Infotable_ButtonClick("Compare");
}

function Infotable_ClickCooldown() {
    CS.isClicked = true;
    RT.Web.SetTiimeout(3000, function () {
        CS.isClicked = false;
    });
}

function Infotable_ButtonClick(mButtonName) {
    if (!CS.isClicked) {
        Infotable_ClickCooldown();
        if (CS.mainwu != null) {
            try {
                CS.mainwu.document.Run("MOPOP_InfotableClick", [mButtonName]);
            } catch (err) {
                console.log("Infotable_ButtonClick @" + mButtonName + ", ERROR =>" + err);
            }
        }
    }
}
*/