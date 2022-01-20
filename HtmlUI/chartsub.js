/// 2020 By Philipp Fleck
var CS = {};
CS.mainwu = null;
CS.myCanvasName = null;
CS.myMenuName = null;
CS.chart = null;
CS.isClicked = false;
CS.UE = null;

CS.storedPayload = {};

function ChartSub_Init() {
    console.log("ChartSub_Init called");
    CS.UE = importNamespace("UnityEngine");

    var PUI = importNamespace("PowerUI");
    var mainWu = PUI.WorldUI.Find("Main");
    if (mainWu != null) {
        console.log("ChartSub_Init found main wu");
        CS.mainwu = mainWu;
    }
}

function ChartSub_DestroyButtons() {
    if (CS.buttonGo != null) {
        RT.Unity.DestroyGO(CS.buttonGo);
        CS.buttons = [];
    }
}

function ChartSub_AddButtons() {
    CS.buttons = [];
    CS.buttonGo = new CS.UE.GameObject("buttons");
    RT.Unity.SetParent(CS.buttonGo, CS.chart.go);
    RT.Unity.SetLocalPose(CS.buttonGo, [0, 0, 0], [0, 0, 0, 1], [1, 1, 1]);

    var prefix = "UIBTN-" + CS.chart.chartGoName;
    var xBtnName = prefix + "-xdim";
    var yBtnName = prefix + "-ydim";
    var zBtnName = prefix + "-zdim";
    var sizeBtnName = prefix + "-szdim";
    var colorBtnName = prefix + "-coldim";
    var closeBtnName = prefix + "-close";
    var t2tBtnName = prefix + "-tap2place";
    var boundsBtnName = prefix + "-bounds";
    var objmaniBtnName = prefix + "-objmani";

    var barsBtnName = prefix + "-bars";
    var pointsBtnName = prefix + "-points";
    var linesBtnName = prefix + "-Lines";

    var replicateBtnName = prefix + "-replicate";

    var fctX = function () { ChartSub_ButtonClick('XDIM'); };
    var fctY = function () { ChartSub_ButtonClick('YDIM'); };
    var fctZ = function () { ChartSub_ButtonClick('ZDIM'); };
    var fctSz = function () { ChartSub_ButtonClick('SZDIM'); };
    var fctCol = function () { ChartSub_ButtonClick('COLDIM'); };
    var fctClose = function () { ChartSub_ButtonClick('CLOSE'); };
    var fctT2t = function () { ChartSub_ButtonClick('TAP2PLACE'); };
    var fctBounds = function () { ChartSub_ButtonClick('BOUNDS'); };
    var fctObjMani = function () { ChartSub_ButtonClick('OBJMANI'); };
    var fctBars = function () { ChartSub_ButtonClick('BARS'); };
    var fctPoints = function () { ChartSub_ButtonClick('POINTS'); };
    var fctLines = function () { ChartSub_ButtonClick('LINES'); };
    var fctReplicate = function () { ChartSub_ButtonClick('REPLICATE'); };

    var xBtn = RT.MRTK.SpawnButton(xBtnName, "X Dim", "X Dim", false, fctX);
    var yBtn = RT.MRTK.SpawnButton(yBtnName, "Y Dim", "Y Dim", false, fctY);
    var zBtn = RT.MRTK.SpawnButton(zBtnName, "Z Dim", "Z Dim", false, fctZ);
    var SzBtn = RT.MRTK.SpawnButton(sizeBtnName, "Size Dim", "Size Dim", false, fctSz);
    var ColBtn = RT.MRTK.SpawnButton(colorBtnName, "Color Dim", "Color Dim", false, fctCol);
    var closeBtn = RT.MRTK.SpawnButton(closeBtnName, "Close", "Close", false, fctClose);
    var t2tBtn = RT.MRTK.SpawnButton(t2tBtnName, "Tap 2 Place", "Tap 2 Place", false, fctT2t);
    var bndBtn = RT.MRTK.SpawnButton(boundsBtnName, "Bounds", "Bounds", false, fctBounds);
    var omBtn = RT.MRTK.SpawnButton(objmaniBtnName, "Manipulate", "Manipulate", false, fctObjMani);
    var barsBtn = RT.MRTK.SpawnButton(barsBtnName, "Bars", "Bars", false, fctBars);
    var pointsBtn = RT.MRTK.SpawnButton(pointsBtnName, "Points", "Points", false, fctPoints);
    var linesBtn = RT.MRTK.SpawnButton(linesBtnName, "Lines", "Lines", false, fctLines);
    var replicateBtn = RT.MRTK.SpawnButton(replicateBtnName, "Replicate", "Replicate", false, fctReplicate);

    CS.buttons.push(xBtn);
    CS.buttons.push(yBtn);
    CS.buttons.push(zBtn);
    CS.buttons.push(SzBtn);
    CS.buttons.push(ColBtn);
    CS.buttons.push(closeBtn);
    CS.buttons.push(t2tBtn);
    CS.buttons.push(bndBtn);
    CS.buttons.push(omBtn);
    CS.buttons.push(barsBtn);
    CS.buttons.push(pointsBtn);
    CS.buttons.push(linesBtn);
    CS.buttons.push(replicateBtn);

    for (var i = 0; i < CS.buttons.length; i++) {
        RT.Unity.SetParent(CS.buttons[i].go, CS.buttonGo);
    }

    RT.Unity.SetLocalPose(xBtn.go, [1.2, 1, 0], [0, 0, 0, 1], null);
    RT.Unity.SetLocalPose(yBtn.go, [1.2, 0.85, 0], [0, 0, 0, 1], null);
    RT.Unity.SetLocalPose(zBtn.go, [1.2, 0.7, 0], [0, 0, 0, 1], null);
    RT.Unity.SetLocalPose(SzBtn.go, [1.2, 0.55, 0], [0, 0, 0, 1], null);
    RT.Unity.SetLocalPose(ColBtn.go, [1.2, 0.4, 0], [0, 0, 0, 1], null);
    RT.Unity.SetLocalPose(closeBtn.go, [1.35, 1, 0], [0, 0, 0, 1], null);
    RT.Unity.SetLocalPose(t2tBtn.go, [1.35, 0.85, 0], [0, 0, 0, 1], null);
    RT.Unity.SetLocalPose(bndBtn.go, [1.35, 0.7, 0], [0, 0, 0, 1], null);
    RT.Unity.SetLocalPose(omBtn.go, [1.35, 0.55, 0], [0, 0, 0, 1], null);
    RT.Unity.SetLocalPose(barsBtn.go, [1.2, 0.25, 0], [0, 0, 0, 1], null);
    RT.Unity.SetLocalPose(pointsBtn.go, [1.2, 0.1, 0], [0, 0, 0, 1], null);
    RT.Unity.SetLocalPose(linesBtn.go, [1.35, 0.1, 0], [0, 0, 0, 1], null);
    RT.Unity.SetLocalPose(replicateBtn.go, [1.5, 1, 0], [0, 0, 0, 1], null);
}

function ChartSub_ReportPayload(mPayload) {
    //{"attrId":"SF_NETGEAR81-5G-bigserver_RJ45_outbound_mbps","data":{"deviceId":"NETGEAR81-5G-bigserver","partId":"RJ45","fieldname":"outbound_mbps","mqtt":"telemetry/inffeld16/2nd/id2068/bigserver/RJ45/#"},"tipgo":{}}
    var dObj = JSON.parse(mPayload);
    var content = "<span style='font-size:8vh;' >" + dObj.data.fieldname + "/" + dObj.data.partId + "</span></br><span style='font-size:6vh;' >" + dObj.data.deviceId + "</span>";
    var html = "<button id='" + dObj.attrId + "' onclick='PlayClick();ChartSub_PayloadClicked(\"" + dObj.attrId + "\");'>" + content + "</button>";
    document.getElementById('chartsubhook').innerHTML += html;
    CS.storedPayload[attrId] = dObj;
}

function ChartSub_PayloadClicked(mPayloadId) {
    console.log("ChartSub_PayloadClicked mPayloadId => " + mPayloadId);

    try {
        var dObj = CS.storedPayload[mPayloadId]; //THIS MIGJT heave ISSUE
        var attrId = dObj.attrId;
        var data = dObj.data;

        dataStr = JSON.stringify(data);
    } catch (err) {
        console.log("XXXCOMPXXX CS ERROR => " + error);
    }
    console.log("XXXCOMPXXX CS dataStr => " + dataStr);
    console.log("XXXCOMPXXX CS dataStr => " + encodeURIComponent(dataStr));

    try {
        CS.mainwu.document.Run("Main_Canvas_AttrClicked", ["", attrId, encodeURIComponent(dataStr)]);
    } catch (err) {
        console.log("ChartSub_PayloadClicked @" + attrId + ", ERROR =>" + err);
    }
}

function ChartSub_ExternalInitMe(mMyDataJson) {
    console.log("ChartSub_ExternalInitMe mMyDataJson=" + mMyDataJson);
    try {
        CS.chart = JSON.parse(mMyDataJson);
        CS.chart.go = CS.UE.GameObject.Find(CS.chart.chartGoName);

        var titletext = CS.chart.chartGoName + " (data: " + CS.chart.dataGoName + ")";
        $('#titlebar').html(titletext);
    } catch (err) {
        console.log("ChartSub_ExternalInitMe ERROR =>" + err);
    }
    ChartSub_AddButtons();
}

function ChartSub_ClickCooldown() {
    CS.isClicked = true;
    RT.Web.SetTiimeout(3000, function () {
        CS.isClicked = false;
    });
}

function ChartSub_ButtonClick(mButtonName) {
    if (!CS.isClicked) {
        ChartSub_ClickCooldown();
        if (CS.mainwu != null) {
            console.log("ChartSub_ButtonClick CS.chart=" + CS.chart);
            console.log("ChartSub_ButtonClick CS.chart.id=" + CS.chart.id);
            console.log("ChartSub_ButtonClick CS.chart.chartGoName=" + CS.chart.chartGoName);
            console.log("ChartSub_ButtonClick mButtonName=" + mButtonName);
            try {
                CS.mainwu.document.Run("MAIN_RemoteCalled",
                    [CS.chart.id.toString(), CS.chart.chartGoName, mButtonName]);
            } catch (err) {
                console.log("ChartSub_ButtonClick @" + mButtonName + ", ERROR =>" + err);
            }
        }
    }
}