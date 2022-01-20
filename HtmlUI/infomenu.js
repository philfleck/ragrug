/// 2020 By Philipp Fleck
var CS = {};
CS.mainwu = null;
CS.isClicked = false;

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

function Infotable_Clear() {
    $('#slot0').html("Empty");
    $('#slot1').html("Empty");
    $('#slot2').html("Empty");
    Infotable_ButtonClick("Clear");
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