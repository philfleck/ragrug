/// 2020 By Philipp Fleck
var AC = {};
AC.mainwu = null;
AC.data = null;

function Artefact_Init() {
    console.log("Artefact_Init called");
    AC.apiBase = RT.Help.GetStringFromCfg("apiurl");

    /*
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
    */
}

function Artefact_ExternalTrackingOn(mData) {
    console.log("Artefact_ExternalTrackingOn mData=" + mData);
}

function Artefact_ExternalTrackingOff(mData) {
    console.log("Artefact_ExternalTrackingOff mData=" + mData);
}

function Artefact_ExternalInitMe(mMyDataJson) {
    console.log("Artefact_ExternalInitMe mMyDataJson=" + mMyDataJson);

    //{"TrackableName":"zooropa","TrackedGoName":"VIT-5-zooropa","goName":"Testzooropa","wuName":"UIzooropa"}

    try {
        AC.data = JSON.parse(mMyDataJson);
        console.log("AttrComb_ExternalInitMe parsed: " + mMyDataJson);

        //$('#attr1').html(AC.data.attr1);
        //$('#attr2').html(AC.data.attr2);

        var titletext = "Id: " + AC.data.TrackableName;
        $('#titlebar').html(titletext);

        var coverid = AC.data.TrackableName;
        if (AC.data.TrackableName == "timetomove") {
            coverid = "17994376284";
        } else if (AC.data.TrackableName == "zooropa") {
            coverid = "23924371708";
        } else if (AC.data.TrackableName == "zooropa") {
            coverid = "23924371708";
        }

        var url = AC.apiBase + "/mopop/song?coverid=" + coverid;
        $('#rr_canvasbody').html("<p>Downloading</p><p>" + url + " ...</p>");

        var headers = ["content-type", "application/x-www-form-urlencoded"];
        var data = "";

        RT.Web.SendWebReq("GET", url, headers, data,
            function (mError, mData) {
                console.log("Artefact_ExternalInitMe web-response ERR = > " + mError);
                console.log("Artefact_ExternalInitMe web-response Data = > [" + typeof mData + "] " + mData);

                if (mError == false) {
                    var sData = JSON.parse(mData);

                    if (sData.length > 0) {
                        var sHtml = "";
                        sHtml += "<p>Artist:" + sData[0].artist + "</p>";
                        //sHtml += "<p>" + sData[0].song + "</p>";
                        sHtml += "<p>Genre:" + sData[0].genre + "</p>";
                        sHtml += "<p>Sold: " + sData[0].soldcopies + "</p>";
                        sHtml += "<p>Score: " + sData[0].score + "</p>";
                        //sHtml += "<p>" + sData[0].publisher + "</p>";
                        sHtml += "<p>Year: " + Artefact_GetYearFromString(sData[0].publishdate) + "</p>";
                        $('#rr_canvasbody').html(sHtml);
                        $('#titlebar').html(sData[0].song);
                    } else {
                        $('#rr_canvasbody').html("<p>NOT FOUND</p>");
                    }
                }
            });


    } catch (err) {
        console.log("AttrComb_ExternalInitMe ERROR =>" + err);
    }

}

function Artefact_GetYearFromString(mFullDateStr) {
    const fullDate = new Date(mFullDateStr);
    var year = fullDate.getFullYear();
    return year;
}

function Artefact_ClickCooldown() {
    CS.isClicked = true;
    RT.Web.SetTiimeout(3000, function () {
        CS.isClicked = false;
    });
}

function Artefact_MakeMePicked() {
    //$('#titlebar').css("background-color", "rgb(0,77,109)");
    //$('#titlebar').css("background-color", "green");
    document.getElementById("titlebar").style.backgroundColor = "green";
}

function Artefact_MakeMePlaced() {
    //$('#titlebar').css("background-color", "red");
    document.getElementById("titlebar").style.backgroundColor = "red";
}

/*
function Artefact_ButtonClick(mButtonName) {
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
*/