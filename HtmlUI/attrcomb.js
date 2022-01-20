/// 2020 By Philipp Fleck
var AC = {};
AC.mainwu = null;
AC.data = null;

function AttrComb_Init() {
    console.log("AttrComb_Init called");

    var PUI = importNamespace("PowerUI");
    var mainWu = PUI.WorldUI.Find("Main");
    if (mainWu != null) {
        console.log("AttrComb_Init found main wu");
        AC.mainwu = mainWu;
    }

    var thisGo = importNamespace("UnityEngine").GameObject.Find("MergeMenu");
    var thisScale = thisGo.transform.localScale;
    RT.Unity.SetupSlider("SLIDER_merge_options", thisGo,
        [0.0, 0.0, -90.0],
        [0.2 * 1 / thisScale.x, -0.04 * 1 / thisScale.y, 0 * 1 / thisScale.z],
        [0.5 * 1 / thisScale.x, 0.5 * 1 / thisScale.y, 0.5 * 1 / thisScale.z],
        function (sliderGoName, oldVal, newVal) {
            var elem = document.getElementById("id_merge_canvas");
            var maxScroll = elem.scrollHeight * 1.5;
            var newPos = newVal * maxScroll;
            elem.scrollTop = newPos;
        }
    );
}

function AttrComb_ExternalInitMe(mMyDataJson) {
    console.log("AttrComb_ExternalInitMe mMyDataJson=" + mMyDataJson);

    //{"attr1":"SF_NETGEAR81-5G-littleserver_RJ45_bandwidth_Mbps","attr2":"SF_NETGEAR81-5G-littleserver_RJ45_inbound_mbps","finger":{"right":{"attrId":"SF_NETGEAR81-5G-littleserver_RJ45_bandwidth_Mbps","data":{"deviceId":"NETGEAR81-5G-littleserver","partId":"RJ45","fieldname":"bandwidth_Mbps","mqtt":"telemetry/inffeld16/2nd/id2068/littleserver/RJ45/#"},"tipgo":{}}},"clicked":{"deviceId":"NETGEAR81-5G-littleserver","partId":"RJ45","fieldname":"inbound_mbps","mqtt":"telemetry/inffeld16/2nd/id2068/littleserver/RJ45/#"}}
    
    try {
        AC.data = JSON.parse(mMyDataJson);
        console.log("AttrComb_ExternalInitMe parsed: " + mMyDataJson);

        $('#attr1').html(AC.data.attr1);
        $('#attr2').html(AC.data.attr2);

        //var titletext = CS.chart.chartGoName + " (data: " + CS.chart.dataGoName + ")";
        //$('#titlebar').html(titletext);
    } catch (err) {
        console.log("AttrComb_ExternalInitMe ERROR =>" + err);
    }
}

function AttrComb_ClickCooldown() {
    CS.isClicked = true;
    RT.Web.SetTiimeout(3000, function () {
        CS.isClicked = false;
    });
}

function AttrComb_ButtonClick(mButtonName) {
    if (!CS.isClicked) {
        AttrComb_ClickCooldown();
        if (CS.mainwu != null) {
            console.log("AttrComb_ButtonClick CS.chart=" + CS.chart);
            console.log("AttrComb_ButtonClick CS.chart.id=" + CS.chart.id);
            console.log("AttrComb_ButtonClick CS.chart.chartGoName=" + CS.chart.chartGoName);
            console.log("AttrComb_ButtonClick mButtonName=" + mButtonName);
            try {
                CS.mainwu.document.Run("MAIN_RemoteCalled",
                    [CS.chart.id.toString(), CS.chart.chartGoName, mButtonName]);
            } catch (err) {
                console.log("AttrComb_ButtonClick @" + mButtonName + ", ERROR =>" + err);
            }
        }
    }
}