/// 2021 By Philipp Fleck
///
/// MOPOP Start here
///

//occupant
// {"TrackableName":"2805595956","TrackedGoName":"VIT-13-2805595956","goName":"Test2805595956","wuName":"UI2805595956"}
//hookwall
//{ "HW_A": { "name": "HW_A", "hooks": { "HW_A_0_0": { "isOccupied": false, "occupante": null }, "HW_A_1_0": { "isOccupied": false, "occupante": null }, "HW_A_2_0": { "isOccupied": false, "occupante": null }, "HW_A_3_0": { "isOccupied": false, "occupante": null }, "HW_A_0_1": { "isOccupied": false, "occupante": null }, "HW_A_1_1": { "isOccupied": false, "occupante": null }, "HW_A_2_1": { "isOccupied": false, "occupante": null }, "HW_A_3_1": { "isOccupied": false, "occupante": null }, "HW_A_0_2": { "isOccupied": false, "occupante": null }, "HW_A_1_2": { "isOccupied": false, "occupante": null }, "HW_A_2_2": { "isOccupied": false, "occupante": null }, "HW_A_3_2": { "isOccupied": false, "occupante": null } } }, "HW_B": { "name": "HW_B", "hooks": { "HW_B_0_0": { "isOccupied": false, "occupante": null }, "HW_B_1_0": { "isOccupied": false, "occupante": null }, "HW_B_2_0": { "isOccupied": false, "occupante": null }, "HW_B_3_0": { "isOccupied": false, "occupante": null }, "HW_B_0_1": { "isOccupied": false, "occupante": null }, "HW_B_1_1": { "isOccupied": false, "occupante": null }, "HW_B_2_1": { "isOccupied": false, "occupante": null }, "HW_B_3_1": { "isOccupied": false, "occupante": null }, "HW_B_0_2": { "isOccupied": false, "occupante": null }, "HW_B_1_2": { "isOccupied": false, "occupante": null }, "HW_B_2_2": { "isOccupied": false, "occupante": null }, "HW_B_3_2": { "isOccupied": false, "occupante": null } } } }


/**
 * @typedef {Object} aHookwall
 * @property {string} name
 * @property {Object.<string,aHook>}       hooks
 * 
*/

/**
 * @typedef {Object} aHook
 * @property {boolean} isOccupied
 * @property {aOccupant} occupant
*/

/**
 * @typedef {Object} aOccupant
 * @property {string} TrackableName
 * @property {string} TrackedGoName
 * @property {string} goName
 * @property {string} wuName
*/
/**
 * @typedef {Object} aTemptable 
 * @property {string} name
 * @property {Object.<string,aHook>} hooks
 */

/**
 * @typedef {Object} aMOPOP
 * @property {aOccupant} picked 
 * @property {Object.<string,aHookwall>} hookwall
 * @property {Object.<string,aHook>} hookwall.hooks
 * @property {Object.<string,aTemptable>} temptable
 * @property {Object.<string,Onject>} artefacts
 * @property {ChartDataIATK} scorechart
 * @property {ChartDataIATK} [scorechart]
 * @property {Object.<string,string>} topics 
 * @property {Object.<string,ChartDataIATK>} yearcharts
 * @property {number} startyear
 * @property {number} endyear
 * @property {string} user
 * @property {Object} info
 * @property {string[]} infopicks
 * @property {function(string):void} AddInfoPick
 */

/** 
 * @type {aMOPOP}
 * */
var MOPOP = {};
MOPOP.picked = null;
MOPOP.hookwall = {};
MOPOP.temptable = {};
MOPOP.artefacts = {};
MOPOP.scorechart = null;
MOPOP.infochart = null;
MOPOP.topics = {
    "wallscore": "MOPOP/wallscore",
    "wallyearhist": "MOPOP/wallyearhist",
    "infocompare": "MOPOP/infocompare"
}
MOPOP.yearcharts = {};
MOPOP.startyear = 0;
MOPOP.endyear = 0;

MOPOP.user = "NOTSET";

MOPOP.info = {};
MOPOP.infopicks = [];
/**
 * 
 * @param {string} mArtefactId
 */
MOPOP.AddInfoPick = function (mArtefactId) {
    var artefact = MOPOP.artefacts[mArtefactId];
    MOPOP.infopicks.push(artefact);
    if (MOPOP.infopicks.length > 3) {
        MOPOP.infopicks.shift();
    }
}

/*
 * Not used anymore
function MOPOP_Register(mMode) {
    myconsolelog("MOPOP_Register mMode = " + mMode);

    if (mMode == "STORAGEA") {
        var go = MAIN.UE.GameObject.Find("ENV_storage_a");
        if (go == null) {
            MOPOP_LoadFromEnv("ENV_storage_a", "Shelf");
        }
    }

    if (mMode == "STORAGEB") {
        var go = MAIN.UE.GameObject.Find("ENV_storage_b");
        if (go == null) {
            MOPOP_LoadFromEnv("ENV_storage_b", "Shelf");
        }
    }

    if (mMode == "STORAGEB") {
        var go = MAIN.UE.GameObject.Find("ENV_storage_b");
        if (go == null) {
            MOPOP_LoadFromEnv("ENV_storage_b", "Shelf");
        }
    }

    if (mMode == "TABLETOP") {
        var go = MAIN.UE.GameObject.Find("ENV_tabletop");
        if (go == null) {
            MOPOP_LoadFromEnv("ENV_tabletop", "TableTop");
        }
    }

    if (mMode == "HOOKWALLA") {
        var go = MAIN.UE.GameObject.Find("ENV_hookwall_a");
        if (go == null) {
            MOPOP_LoadFromEnv("ENV_hookwall_a", "HookWall");
        }
    }

    if (mMode == "HOOKWALLB") {
        var go = MAIN.UE.GameObject.Find("ENV_hookwall_b");
        if (go == null) {
            MOPOP_LoadFromEnv("ENV_hookwall_b", "HookWall");
        }
    }
}
*/

/*
 * Not used anymore
function MOPOP_LoadFromEnv(mName, mAssetName) {
    // Shelf
    // TableTop
    // HookWall
    myconsolelog("MOPOP_SetWall ...");
    try {
        var VZ = importNamespace("Vizario");

        myconsolelog("MOPOP_SetWall ... 1");

        var go = VZ.AssetBundleHolder.InstantiateGameObject(MAIN.location.envassetbundle, mAssetName);

        myconsolelog("MOPOP_SetWall ... 2");

        if (go != null) {
            go.name = mName;

            myconsolelog("MOPOP_SetWall ... 3 " + go);
            var c = importNamespace("RR").Runtime.ToggleObjManipulation(go.name);
        }

        myconsolelog("MOPOP_SetWall ... 4");
    } catch (err) {
        myconsolelog("MOPOP_SetWall ERROR => " + err);
    }
}
*/

function MOPOP_CalcScore() {
    myconsolelog("MOPOP_CalcScore ... ");
    //MOPOP.hookwall[dObj.hookWall].hooks[dObj.tileGoName];
    //MOPOP.hookwall[hGoName].hooks[go.name] = {
    //    "isOccupied": false,
    //    "occupante": null
    //};

    var walls = MOPOP.hookwall;

    /*var test = { "HW_A": { "name": "HW_A", "hooks": { "HW_A_0_0": { "isOccupied": false, "occupante": null }, "HW_A_1_0": { "isOccupied": false, "occupante": null }, "HW_A_2_0": { "isOccupied": false, "occupante": null }, "HW_A_3_0": { "isOccupied": false, "occupante": null }, "HW_A_0_1": { "isOccupied": false, "occupante": null }, "HW_A_1_1": { "isOccupied": false, "occupante": null }, "HW_A_2_1": { "isOccupied": false, "occupante": null }, "HW_A_3_1": { "isOccupied": false, "occupante": null }, "HW_A_0_2": { "isOccupied": false, "occupante": null }, "HW_A_1_2": { "isOccupied": false, "occupante": null }, "HW_A_2_2": { "isOccupied": false, "occupante": null }, "HW_A_3_2": { "isOccupied": false, "occupante": null } } }, "HW_B": { "name": "HW_B", "hooks": { "HW_B_0_0": { "isOccupied": false, "occupante": null }, "HW_B_1_0": { "isOccupied": false, "occupante": null }, "HW_B_2_0": { "isOccupied": false, "occupante": null }, "HW_B_3_0": { "isOccupied": false, "occupante": null }, "HW_B_0_1": { "isOccupied": false, "occupante": null }, "HW_B_1_1": { "isOccupied": false, "occupante": null }, "HW_B_2_1": { "isOccupied": false, "occupante": null }, "HW_B_3_1": { "isOccupied": false, "occupante": null }, "HW_B_0_2": { "isOccupied": false, "occupante": null }, "HW_B_1_2": { "isOccupied": false, "occupante": null }, "HW_B_2_2": { "isOccupied": false, "occupante": null }, "HW_B_3_2": { "isOccupied": false, "occupante": null } } } };
    var test2 = { "HW_A": { "name": "HW_A", "hooks": { "HW_A_0_0": { "isOccupied": false, "occupante": null }, "HW_A_1_0": { "isOccupied": false, "occupante": null }, "HW_A_2_0": { "isOccupied": false, "occupante": null }, "HW_A_3_0": { "isOccupied": false, "occupante": null }, "HW_A_0_1": { "isOccupied": true, "occupante": { "TrackableName": "865341506", "TrackedGoName": "VIT-19-865341506", "goName": "Test865341506", "wuName": "UI865341506" } }, "HW_A_1_1": { "isOccupied": true, "occupante": { "TrackableName": "865341506", "TrackedGoName": "VIT-19-865341506", "goName": "Test865341506", "wuName": "UI865341506" } }, "HW_A_2_1": { "isOccupied": false, "occupante": null }, "HW_A_3_1": { "isOccupied": false, "occupante": null }, "HW_A_0_2": { "isOccupied": false, "occupante": null }, "HW_A_1_2": { "isOccupied": false, "occupante": null }, "HW_A_2_2": { "isOccupied": false, "occupante": null }, "HW_A_3_2": { "isOccupied": false, "occupante": null } } }, "HW_B": { "name": "HW_B", "hooks": { "HW_B_0_0": { "isOccupied": false, "occupante": null }, "HW_B_1_0": { "isOccupied": false, "occupante": null }, "HW_B_2_0": { "isOccupied": false, "occupante": null }, "HW_B_3_0": { "isOccupied": false, "occupante": null }, "HW_B_0_1": { "isOccupied": false, "occupante": null }, "HW_B_1_1": { "isOccupied": false, "occupante": null }, "HW_B_2_1": { "isOccupied": false, "occupante": null }, "HW_B_3_1": { "isOccupied": false, "occupante": null }, "HW_B_0_2": { "isOccupied": false, "occupante": null }, "HW_B_1_2": { "isOccupied": false, "occupante": null }, "HW_B_2_2": { "isOccupied": false, "occupante": null }, "HW_B_3_2": { "isOccupied": false, "occupante": null } } } };
    var walls = test2;*/

    myconsolelog("MOPOP_CalcScore ... walls => " + JSON.stringify(walls));

    var wallsScore = 0;
    var usedYearPerWall = {};


    for (var wKey in walls) {
        myconsolelog("MOPOP_CalcScore ... wKey => " + wKey);
        if (walls.hasOwnProperty(wKey)) {
            usedYearPerWall[wKey] = {};
            myconsolelog("MOPOP_CalcScore ... wKey => " + wKey + " => FOUND");
            var aWall = walls[wKey];
            var wName = aWall.name;
            var wHooks = aWall.hooks;
            var isReversed = aWall.reversed;
            var wallW = aWall.w;
            var wallH = aWall.h;
            myconsolelog("MOPOP_CalcScore ... walls[" + wKey + "].name=" + wName);


            var occupantList = [];


            for (var hKey in wHooks) {
                myconsolelog("MOPOP_CalcScore ...   hKey => " + hKey);
                if (wHooks.hasOwnProperty(hKey)) {
                    var aHook = wHooks[hKey];

                    //console.log("aHook => " + aHook.x + ", " + aHook.y);

                    var isOccupied = aHook.isOccupied;
                    if (isOccupied) {

                        //prepare list of occupants
                        occupantList.push({
                            "hook": aHook,
                            "hookname": hKey
                        });

                        var occupante = aHook.occupante;
                        myconsolelog("MOPOP_CalcScore ... walls[" + wKey + "].hooks[" + hKey + "].occupied=" + isOccupied);
                        myconsolelog("MOPOP_CalcScore ... walls[" + wKey + "].hooks[" + hKey + "].occupante=>" + JSON.stringify(occupante));

                        var occupanteId = occupante.TrackableName;
                        if (MOPOP.artefacts.hasOwnProperty(occupanteId)) {
                            var artefact = MOPOP.artefacts[occupanteId];
                            var score = artefact.score;
                            var year = MOPOP_GetYearFromString(artefact.publishdate);
                            var soldcopies = 0;
                            if (artefact.hasOwnProperty("soldcopies")) {
                                soldcopies = parseFloat(artefact.soldcopies.replace(",", ""));
                                soldcopies *= 0.000001;
                            }

                            //year occupation for year distribution
                            if (!usedYearPerWall[wKey].hasOwnProperty(year)) {
                                var dataId = parseFloat(year) - parseFloat(MOPOP.startyear);
                                usedYearPerWall[wKey][year] = {
                                    "val": 0,
                                    "id": dataId
                                };
                                //usedYearPerWall[wKey][year].val += 1;
                                myconsolelog("MOPOP_CalcScore ... Artefact[" + occupanteId + "].score => " + score);
                            }

                            usedYearPerWall[wKey][year].val += 1;
                            wallsScore += parseFloat(score) * soldcopies;
                        }
                    }
                }
            }

            try {
                if (occupantList.length > 2) {

                    //reversed for year direction
                    //isReversed

                    var NBins = wallW;
                    var xBins = [];

                    //prepare xbins
                    for (var wi = 0; wi < NBins; wi++) {
                        xBins.push([]);
                    }

                    var weightedPenalty = 1;

                    //collect years of occupants
                    var N = occupantList.length;
                    for (var i = 0; i < N; i++) {
                        var occ = occupantList[i];
                        var hook = occ.hook;
                        var hookname = occ.hookname;
                        var hookOccupant = hook.occupante;

                        var hookX = hook.x;
                        var hookY = hook.y;

                        var hooksArtefact = MOPOP.artefacts[occupanteId];
                        var hooksYearStr = MOPOP_GetYearFromString(arthooksArtefactefact.publishdate);
                        var hooksYear = parseInt(hooksYearStr);

                        xBins[hookX].push(hooksYear);
                    }


                    //filter only used bins, so that we can go pairwise through them
                    var filteredBins = [];
                    for (var wi = 0; wi < NBins; wi++) {
                        if (xBins[wi].length > 0) {
                            filteredBins.push(xBins[wi]);
                        }
                    }

                    //check for weak monotonic years
                    var fNbins = filteredBins.length;
                    for (var wi = 1; wi < fNbins; wi++) {

                        var prevBin = filteredBins[wi - 1];
                        var curBin = filteredBins[wi];

                        for (pwi = 0; pwi < prevBin.length; pwi++) {
                            curPrevYear = prevBin[pwi];

                            for (cwi = 0; cwi < curBin.length; cwi++) {
                                curCurYear = curBin[cwi];

                                //check each year of bin A vs each year of bin b
                                //every violation causes a 5% penalty
                                if (isReversed) {

                                    //reverse means year gos from 1990 to 2000 where the hook ids go from 13 to 0
                                    //therefore to be monotonic increasing, the years seen from the ids would be
                                    // decreasing, theferefor we penalize when its increasing
                                    if (curPrevYear < curCurYear) {
                                        weightedPenalty *= 0.9;
                                    }
                                } else {
                                    //regular monotonic increase where the yeare goes from 1990 to 2000 and the
                                    // hook id from 0 to 13, therefore we penalize violations when decreasing
                                    // which means prev year is bigger as next year
                                    if (curPrevYear > curCurYear) {
                                        weightedPenalty *= 0.9;
                                    }
                                }
                            }


                            //TODO maybe check violations inside a xBin
                            /*
                            if (curYear != prevYear) {
                                weightedPenalty += -0.01;
                            }
                            nextYear = prevBin[cwi - 1];
                            */
                        }
                    }
                    wallsScore *= weightedPenalty;
                }
            } catch (tlerr) {
                console.log("MOPOP_CalcScore TL ERROR => " + tlerr);
            }
        }

        if (wallsScore > 0) {
            MOPOP_ReportUserEvent(MOPOP.userevents.score, { "score": wallsScore }, Date.now(), MOPOP.user);

            var data = {
                "score": wallsScore //TODO use real score here
            };
            var jsonScores = JSON.stringify(data);
            RT.MQTT.Publish(MOPOP.topics.wallscore, jsonScores);
            myconsolelog("MOPOP_CalcScore ... done SCORES => " + jsonScores);

            for (var k in usedYearPerWall) {
                var jsonYears = JSON.stringify(usedYearPerWall[k]);
                var topic = MOPOP.topics.wallyearhist + "/" + k.replace("HW_", ""); //dirty fix!!!!
                RT.MQTT.Publish(topic, jsonYears);
                myconsolelog("MOPOP_CalcScore ... done YEARS: " + topic + "/ => " + jsonYears);
            }
        }
    }
}

function MOPOP_UpdateHookOccupation2() {
    //myconsolelog("MOPOP_UpdateHookOccupation2 ..");
    MOPOP_UpdateHookOccupation();
}

var scoreweight = 1;

function MOPOP_UpdateHookOccupation() {
    try {
        if (true || MOPOP.picked != null) {
            //myconsolelog("MOPOP_UpdateHookOccupation picked=> " + JSON.stringify(MOPOP.picked));

            //picked 
            // picked=> {"TrackableName":"2805595956","TrackedGoName":"VIT-13-2805595956","goName":"Test2805595956","wuName":"UI2805595956"}

            //hookwall
            //{"HW_A":{"name":"HW_A","hooks":{"HW_A_0_0":{"isOccupied":false,"occupante":null},"HW_A_1_0":{"isOccupied":false,"occupante":null},"HW_A_2_0":{"isOccupied":false,"occupante":null},"HW_A_3_0":{"isOccupied":false,"occupante":null},"HW_A_4_0":{"isOccupied":false,"occupante":null},"HW_A_0_1":{"isOccupied":false,"occupante":null},"HW_A_1_1":{"isOccupied":false,"occupante":null},"HW_A_2_1":{"isOccupied":false,"occupante":null},"HW_A_3_1":{"isOccupied":false,"occupante":null},"HW_A_4_1":{"isOccupied":false,"occupante":null},"HW_A_0_2":{"isOccupied":false,"occupante":null},"HW_A_1_2":{"isOccupied":false,"occupante":null},"HW_A_2_2":{"isOccupied":false,"occupante":null},"HW_A_3_2":{"isOccupied":false,"occupante":null},"HW_A_4_2":{"isOccupied":false,"occupante":null}}},"HW_B":{"name":"HW_B","hooks":{"HW_B_0_0":{"isOccupied":false,"occupante":null},"HW_B_1_0":{"isOccupied":false,"occupante":null},"HW_B_2_0":{"isOccupied":false,"occupante":null},"HW_B_3_0":{"isOccupied":false,"occupante":null},"HW_B_0_1":{"isOccupied":false,"occupante":null},"HW_B_1_1":{"isOccupied":false,"occupante":null},"HW_B_2_1":{"isOccupied":false,"occupante":null},"HW_B_3_1":{"isOccupied":false,"occupante":null},"HW_B_0_2":{"isOccupied":false,"occupante":null},"HW_B_1_2":{"isOccupied":false,"occupante":null},"HW_B_2_2":{"isOccupied":false,"occupante":null},"HW_B_3_2":{"isOccupied":false,"occupante":null}}}}

            //occupante
            //aHook => {"isOccupied":true,"occupante":{"TrackableName":"2805595956","TrackedGoName":"VIT-13-2805595956","goName":"Test2805595956","wuName":"UI2805595956"}}


            var dirtyScore = false;
            // update hookwalls here
            var walls = MOPOP.hookwall;
            for (var wKey in walls) {
                if (walls.hasOwnProperty(wKey)) {
                    var aWall = walls[wKey];
                    var wName = aWall.name;
                    var wHooks = aWall.hooks;

                    //myconsolelog("MOPOP_UpdateHookOccupation ... walls[" + wKey + "].name=" + wName);

                    //var occupantList = [];
                    for (var hKey in wHooks) {
                        //myconsolelog("MOPOP_UpdateHookOccupation ... hKey => " + hKey);


                        if (wHooks.hasOwnProperty(hKey)) {
                            var aHook = wHooks[hKey];
                            var isOccupied = aHook.isOccupied;

                            if (isOccupied) {
                                var occupante = aHook.occupante;
                                var occupanteId = occupante.TrackableName;


                                /*occupantList.push({
                                    "occ": occupante,
                                    "hook": hKey
                                });*/


                                //myconsolelog("MOPOP_UpdateHookOccupation id check => " + occupanteId + " == " + MOPOP.picked.TrackableName);
                                //look if the picked one occupied a hook
                                if (true) {
                                    //if (occupanteId == MOPOP.picked.TrackableName) {

                                    myconsolelog("MOPOP_UpdateHookOccupation FOUND wKey => " + wKey);
                                    myconsolelog("MOPOP_UpdateHookOccupation FOUND wName => " + wName);
                                    myconsolelog("MOPOP_UpdateHookOccupation FOUND hKey => " + hKey);
                                    myconsolelog("MOPOP_UpdateHookOccupation FOUND aHook => " + JSON.stringify(aHook));


                                    //the hooks gameobject, not the tile only the hook
                                    var hookGoName = wKey + "/" + hKey + "/" + "Hook";
                                    var hookGo = MAIN.UE.GameObject.Find(hookGoName);

                                    var artefactName = aHook.occupante.TrackedGoName;
                                    var artefactGo = MAIN.UE.GameObject.Find(artefactName);

                                    //TODO check here for the distance
                                    var dist = 0;
                                    if (hookGo != null && artefactGo != null) {
                                        var hookPos = hookGo.transform.position;
                                        var artefactPos = artefactGo.transform.position;

                                        myconsolelog("MOPOP_UpdateHookOccupation hookPos=(" + hookPos.x + ", " + hookPos.y + ", " + hookPos.z + ")");
                                        myconsolelog("MOPOP_UpdateHookOccupation artefactPos=(" + artefactPos.x + ", " + artefactPos.y + ", " + artefactPos.z + ")");

                                        dist =
                                            Math.sqrt(
                                                (hookPos.x - artefactPos.x) * (hookPos.x - artefactPos.x) +
                                                (hookPos.y - artefactPos.y) * (hookPos.y - artefactPos.y) +
                                                (hookPos.z - artefactPos.z) * (hookPos.z - artefactPos.z)
                                            );
                                        myconsolelog("MOPOP_UpdateHookOccupation dist=" + dist);
                                    }

                                    if (dist > 0.2) {
                                        //var hookGo = MAIN.UE.GameObject.Find(hookGoName);
                                        if (hookGo != null) {
                                            var r = hookGo.GetComponent(MAIN.UE.Renderer);
                                            if (r != null) {
                                                //r.material.color = MAIN.UE.Color.green;
                                                r.material.color = new MAIN.UE.Color(0.4, 0.4, 0.4, 0.5);
                                            }
                                        }

                                        //TODO maybe set picked here?
                                        //TODO make cover unplaced
                                        MOPOP.picked = aHook.occupante;
                                        try {
                                            var wuName = occupante.wuName;
                                            var tw1 = MAIN.PUI.WorldUI.Find(wuName);
                                            if (tw1 != null) {
                                                tw1.document.Run("Artefact_MakeMePicked", [""]);
                                            }
                                        } catch (setPickedErr) {
                                            myconsolelog("MOPOP Artefact_MakeMePicked ERROR => " + setPickedErr);
                                        }

                                        //TODO killBez here?
                                        aHook.isOccupied = false;
                                        aHook.occupante = null;
                                        dirtyScore = true;
                                        //MOPOP_CalcScore();
                                    }
                                }
                            }
                        } else {
                            myconsolelog("MOPOP_UpdateHookOccupation ... hKey => " + hKey + " NOT FOUND");
                        }
                    }

                    //check occupant list neighbor relations
                    /*if (false) {


                        var bezParentGo = new MAIN.UE.GameObject.Find("pairbezparent");
                        if (bezParentGo == null) {
                            bezParentGo = new MAIN.UE.GameObject("pairbezparent");
                        }


                        //occupantList.push({
                        //    "occ": occupante,
                        //    "hook": hKey
                        //});
                        //{"isOccupied":true,"occupante":{"TrackableName":"2805595956","TrackedGoName":"VIT-13-2805595956","goName":"Test2805595956","wuName":"UI2805595956"}}
                        for (var ai = 0; ai < occupantList.length; ai++) {
                            for (var bi = ai + 1; bi < occupantList.length; bi++) {
                                var occupantA = occupantList[ai];
                                var occupantB = occupantList[bi];

                                //occupantA.occ
                                //occupantA.hook


                                var hookGoA = MAIN.UE.GameObject.Find(occupantA.hook)
                                var hookGoB = MAIN.UE.GameObject.Find(occupantB.hook)

                                if (hookGoA != null && hookGoB != null) {
                                    var posA = hookGoA.transform.localPosition;
                                    var posB = hookGoB.transform.localPosition;

                                    // check distance
                                    // if close, check artist

                                    var dist =
                                        Math.sqrt(
                                            (posA.x - posB.x) * (posA.x - posB.x) +
                                            (posA.y - posB.y) * (posA.y - posB.y) +
                                            (posA.z - posB.z) * (posA.z - posB.z)
                                        );

                                    if (dist < 0.3) {
                                        var coverIdA = occupantA.occ.TrackableName;
                                        var coverIdB = occupantB.occ.TrackableName;

                                        var coverA = MOPOP.artefacts[coverIdA];
                                        var coverB = MOPOP.artefacts[coverIdB];

                                        var artistA = coverA.artist;
                                        var artistB = coverB.artist;

                                        if (artistA == artistB) {
                                            //same artist, which are also close to each other
                                            scoreweight += 0.05;
                                            //

                                            var bezName = "pairbez-" + occupantA.hook + "-" + occupantB.hook;
                                            var bezGo = RT.Unity.CreateBezier(bezName, occupantA.hook, occupantB.hook);
                                            if (bezGo != null) {
                                                RT.Unity.SetParent(bezGo, bezParentGo);
                                            }
                                        }
                                    }
                                }

                            }
                        }
                    }*/


                }
            }

            if (dirtyScore) {
                MOPOP_CalcScore();
                dirtyScore = false;
            }

            //update temp tables here
            var tables = MOPOP.temptable;
            for (var wKey in tables) {
                if (tables.hasOwnProperty(wKey)) {
                    var aTable = tables[wKey];
                    var wName = aTable.name;
                    var wHooks = aTable.hooks;

                    for (var hKey in wHooks) {
                        if (wHooks.hasOwnProperty(hKey)) {
                            var aHook = wHooks[hKey];
                            var isOccupied = aHook.isOccupied;
                            if (isOccupied) {
                                var occupante = aHook.occupante;
                                var occupanteId = occupante.TrackableName;

                                if (true) {

                                    //the hooks gameobject, not the tile only the hook
                                    var hookGoName = wKey + "/" + hKey + "/" + "Hook";
                                    var hookGo = MAIN.UE.GameObject.Find(hookGoName);

                                    var artefactName = aHook.occupante.TrackedGoName;
                                    var artefactGo = MAIN.UE.GameObject.Find(artefactName);

                                    var dist = 0;
                                    if (hookGo != null && artefactGo != null) {
                                        var hookPos = hookGo.transform.position;
                                        var artefactPos = artefactGo.transform.position;

                                        dist =
                                            Math.sqrt(
                                                (hookPos.x - artefactPos.x) * (hookPos.x - artefactPos.x) +
                                                (hookPos.y - artefactPos.y) * (hookPos.y - artefactPos.y) +
                                                (hookPos.z - artefactPos.z) * (hookPos.z - artefactPos.z)
                                            );
                                    }

                                    if (dist > 0.2) { // was 0.05
                                        if (hookGo != null) {
                                            var r = hookGo.GetComponent(MAIN.UE.Renderer);
                                            if (r != null) {
                                                //r.material.color = MAIN.UE.Color.green;
                                                r.material.color = new MAIN.UE.Color(0.4, 0.4, 0.4, 0.5);
                                            }
                                        }

                                        MOPOP.picked = aHook.occupante;
                                        try {
                                            var wuName = occupante.wuName;
                                            var tw1 = MAIN.PUI.WorldUI.Find(wuName);
                                            if (tw1 != null) {
                                                tw1.document.Run("Artefact_MakeMePicked", [""]);
                                            }
                                        } catch (setPickedErr) {
                                            myconsolelog("MOPOP Artefact_MakeMePicked ERROR => " + setPickedErr);
                                        }

                                        //TODO killBez here?
                                        aHook.isOccupied = false;
                                        aHook.occupante = null;
                                    }
                                }
                            }
                        } else {
                            myconsolelog("MOPOP_UpdateHookOccupation ... hKey => " + hKey + " NOT FOUND");
                        }
                    }
                }
            }
        }
    } catch (err) {
        myconsolelog("MOPOP_UpdateHookOccupation ERROR => " + err);
    }
}

/** */
function MOPOP_InitMqtt() {

    //scores topic for vis
    var scoresTopic = MOPOP.topics.wallscore;
    RT.MQTT.Subscribe(scoresTopic);
    RT.MQTT.RegisterCallbackTopic(
        function (topic, payload) {
            myconsolelog("MOPOP_NEW_SCORE: " + topic + " | " + payload);

            //TODO update score chart
        }, scoresTopic);
}

/**
 * 
 * @param {string} mKey
 * @param {GameObject} mParentGo
 * @param {function(string, GameObject):void} mFctDone
 */
function MOPOP_InitYearHist(mKey, mParentGo, mFctDone) {
    var key = mKey;
    var parentGo = mParentGo;
    myconsolelog("MOPOP_InitYearHist mKey=>" + mKey);

    var nextId = Main_GetNextChartId();
    MOPOP.yearcharts[key] = RT.VIS.GetNewChartObject(nextId, 0,
        "BarChart2D", MAIN.usercanvas.canvasSize,
        MAIN.usercanvas.canvasSpacedSize);

    RT.Web.SetTiimeout(250, function () {
        var sy = MOPOP.startyear;
        var ey = MOPOP.endyear;

        labels = [];
        for (var i = sy; i < ey + 1; i++) {
            labels.push(i);
        }

        //var dataObj = JSON.parse(mData);
        //var dimensionName = dataObj.data.dimensionname;
        //var topic = dataObj.data.mqtt;
        //var labels = dataObj.data.labels;
        var data = {
            "data": {
                "xdimname": "years",
                "xlabels": labels,
                "ydimname": "count",
                "nindices": labels.length,
                "mqtt": MOPOP.topics.wallyearhist + "/" + key,
                "mqttdimensionkey": "count",
                "reset": true
            }
        };
        var dataJson = JSON.stringify(data);

        MOPOP.yearcharts[key].fctAddDimensionWithRealtimeKeys(dataJson);
        if (mFctDone != null) {
            mFctDone(key, parentGo);
        }
    });
}

/**
 * 
 * @param {string} mKey
 * @param {GameObject} mParentGo
 * @param {function(string,GameObject):void} mFctDone
 */
function MOPOP_InitInfoCompareChart(mKey, mParentGo, mFctDone) {
    var key = mKey;
    var parentGo = mParentGo;
    myconsolelog("MOPOP_InitInfoCompareChart mKey=>" + mKey);

    var nextId = Main_GetNextChartId();
    MOPOP.infochart = RT.VIS.GetNewChartObject(nextId, 0,
        "BarChart3D", MAIN.usercanvas.canvasSize,
        MAIN.usercanvas.canvasSpacedSize);

    RT.Web.SetTiimeout(250, function () {
        var Nslots = 3;//MOPOP.infopicks.length;
        for (var si = 0; si < Nslots; si++) {
            labels = ["score", "sold"];
            //labels = [0, 1];
            var data = {
                "data": {
                    "xdimname": "Cover" + si,
                    "xlabels": labels,
                    //"ydimname": "y" + si,
                    //"zdimname": "z" + si,
                    "nindices": labels.length,
                    "mqtt": MOPOP.topics.infocompare + "/" + si,
                    "mqttdimensionkey": "Cover" + si,
                    "reset": true
                }
            };
            var dataJson = JSON.stringify(data);
            MOPOP.infochart.fctAddDimensionWithRealtimeKeys(dataJson);
        }

        if (mFctDone != null) {
            mFctDone(key, parentGo);
        }
    });
}

/**
 * 
 * @param {function():void} mFctDone
 */
function MOPOP_InitScoreChart(mFctDone) {
    var nextId = Main_GetNextChartId();

    if (true) {
        //iatk based
        MOPOP.scorechart = RT.VIS.GetNewChartObjectIATK(nextId, 0,
            "LineChart2D", MAIN.usercanvas.canvasSize,
            MAIN.usercanvas.canvasSpacedSize);

        var scoreData = {
            "data": {
                "fieldname": "score",
                "mqtt": MOPOP.topics.wallscore
            }
        }
        var jsonStr = JSON.stringify(scoreData);
        MOPOP.scorechart.fctAddRealtimeDimension(jsonStr, 1);

        if (mFctDone != null) {
            mFctDone();
        }

    } else {
        // u2vis based version

        MOPOP.scorechart = RT.VIS.GetNewChartObject(nextId, 0,
            "LineChart2D", MAIN.usercanvas.canvasSize,
            MAIN.usercanvas.canvasSpacedSize);

        //var fieldname = dataObj.data.fieldname;
        //var topic = dataObj.data.mqtt;
        RT.Web.SetTiimeout(250, function () {
            var scoreData = {
                "data": {
                    "fieldname": "score",
                    "mqtt": MOPOP.topics.wallscore
                }
            }

            var scoreData2 = {
                "attrId": "score",
                "data": MOPOP.topics.wallscore,
            };
            var jsonStr = JSON.stringify(scoreData);

            //we need to do some init here

            MOPOP.scorechart.fctAddRealtimeDimension(jsonStr, 0);
            MOPOP.scorechart.fctAddRealtimeDimension(jsonStr, 0); //THIS a nasty work around to rule out a dimension
            if (mFctDone != null) {
                mFctDone();
            }
            //MOPOP.scorechart.panelGo.Expire();
        });
    }
}

/**
 * 
 * @param {string} mFullDateStr
 */
function MOPOP_GetYearFromString(mFullDateStr) {
    const fullDate = new Date(mFullDateStr);
    var year = fullDate.getFullYear();
    return year;
}

//TODO move this
/**
 * 
 * @param {string} mName
 * @param {[x:number,y:number,z:number]} mTranslation
 * @param {[x:number,y:number,z:number, w:number]} mRotation
 * @param {[x:number,y:number,z:number]} mScale
 * @param {GameObject} mParent
 * @param {string} mLabelText
 * @returns {WorldUI}
 */
/*
function MAIN_CreateLabel(mName, mTranslation, mRotation, mScale, mParent, mLabelText) {
    try {
        var content = '<div style="position: absolute;top: \
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
*/
function MOPOP_SaveEnv() {

    var mopop = MAIN.location.data.mopop;
    myconsolelog("MOPOP_SaveEnv location => " + JSON.stringify(MAIN.location.data));

    var isDirty = false;

    //collect update hookwall transforms
    if (mopop.hasOwnProperty("hookwalls")) {
        var N = mopop.hookwalls.length;
        myconsolelog("MOPOP_SaveEnv #hookswals => " + N);
        for (var i = 0; i < N; i++) {
            var hw = mopop.hookwalls[i];
            var hGoName = "HW_" + hw.name;
            var go = MAIN.UE.GameObject.Find(hGoName);
            if (go != null) {
                myconsolelog("MOPOP_SaveEnv reading => " + hGoName);
                var T = [go.transform.localPosition.x, go.transform.localPosition.y, go.transform.localPosition.z];
                var R = [go.transform.localRotation.x, go.transform.localRotation.y, go.transform.localRotation.z, go.transform.localRotation.w];
                var S = [go.transform.localScale.x, go.transform.localScale.y, go.transform.localScale.z];

                myconsolelog("MOPOP_SaveEnv T => " + T);

                MAIN.location.data.mopop.hookwalls[i].transform = {
                    "position": T,
                    "rotation": R,
                    "scale": S
                };
                isDirty = true;
            }
        }
    }

    //collect update temptables transforms
    if (mopop.hasOwnProperty("temptables")) {
        var N = mopop.temptables.length;
        myconsolelog("MOPOP_SaveEnv #temptables => " + N);
        for (var i = 0; i < N; i++) {
            var hw = mopop.temptables[i];
            var tGoName = "TT_" + hw.name;
            var go = MAIN.UE.GameObject.Find(tGoName);
            if (go != null) {
                myconsolelog("MOPOP_SaveEnv reading => " + tGoName);
                var T = [go.transform.localPosition.x, go.transform.localPosition.y, go.transform.localPosition.z];
                var R = [go.transform.localRotation.x, go.transform.localRotation.y, go.transform.localRotation.z, go.transform.localRotation.w];
                var S = [go.transform.localScale.x, go.transform.localScale.y, go.transform.localScale.z];

                myconsolelog("MOPOP_SaveEnv T => " + T);

                MAIN.location.data.mopop.temptables[i].transform = {
                    "position": T,
                    "rotation": R,
                    "scale": S
                };
                isDirty = true;
            }
        }
    }

    if (isDirty) {
        var id = MAIN.location.data._id;
        var uUrl = MAIN.WEBAPI.apiBase + "/data?name=" + id;
        var uHeaders = ["content-type", "application/json"];
        var uData = JSON.stringify(MAIN.location.data);

        RT.Web.SendWebReq("POST", uUrl, uHeaders, uData,
            function (mError2, mData2) {
                myconsolelog("MOPOP_SaveEnv updated => " + mError2 + "|" + mData2);
                if (!mError2) {
                    var retObj = JSON.parse(mData2);
                    MAIN.location.data._rev = retObj.rev;
                }
            });
    }
    return;
}

function MOPOP_SetupTimeline(hTimeline, hGo, tileSize, W, H, wallWidth, reversed) {
    if (hTimeline != null) {
        var hGoName = hGo.name;
        var goTimelineName = hGoName + "_TL";
        var goTimeline = new MAIN.UE.GameObject(goTimelineName);
        goTimeline.transform.parent = hGo.transform;

        var xOffset = ((W * 0.5) * tileSize) - tileSize * 0.5;
        var yOffset = - tileSize;
        var zOffset = 0.1;
        goTimeline.transform.localPosition = new MAIN.UE.Vector3(xOffset, yOffset, zOffset);

        var goTimelineBar = MAIN.UE.GameObject.CreatePrimitive(3); //cube
        goTimelineBar.name = goTimelineName + "_Bar";
        goTimelineBar.transform.parent = goTimeline.transform;
        goTimelineBar.transform.localPosition = new MAIN.UE.Vector3(0, 0, 0);
        goTimelineBar.transform.localScale = new MAIN.UE.Vector3(wallWidth, 0.01, 0.01);

        var startYear = hTimeline.start;
        var endYear = hTimeline.end;
        var tick = hTimeline.tick;

        MOPOP.startyear = startYear;
        MOPOP.endyear = endYear;
        MOPOP.midyear = (endYear - startYear) * 0.5 + startYear;

        var Nyears = endYear - startYear;
        var tickSpacing = wallWidth / Nyears;
        for (var iTick = 0; iTick < Nyears + 1; iTick++) {
            var goTimelineBarTick = MAIN.UE.GameObject.CreatePrimitive(3);
            goTimelineBarTick.name = goTimelineName + "_tick_" + (startYear + iTick);

            if (reversed) {
                goTimelineBarTick.name = goTimelineName + "_tick_" + (endYear - iTick);
            }

            goTimelineBarTick.transform.parent = goTimeline.transform;
            var tickPos = iTick * tickSpacing - wallWidth * 0.5;

            goTimelineBarTick.transform.localPosition = new MAIN.UE.Vector3(tickPos, 0, 0);
            goTimelineBarTick.transform.localScale = new MAIN.UE.Vector3(0.004, 0.05, 0.005);


            if (iTick == 0) {
                endTickPos = tickPos;
            }

            if (iTick == Nyears) {
                endTickPos = tickPos;
            }


            if (iTick == 0 || iTick == Nyears || iTick == Nyears / 2) {
                goTimelineBarTick.transform.localScale = new MAIN.UE.Vector3(0.008, 0.05, 0.005);
                var r = goTimelineBarTick.GetComponent(MAIN.UE.Renderer);
                if (r != null) {
                    r.material.color = MAIN.UE.Color.green;
                }
            }
        }

        //set startyear label
        if (MOPOP.startyear > 0) {
            var xOffset = ((W * 0.5) * tileSize) - tileSize * 0.5;
            //if (reversed) {
            //    xOffset = ((W * 0.5) * tileSize) - tileSize * 0.5;
            //}
            var yOffset = - tileSize;
            var startLabelName = goTimelineName + "_L_" + MOPOP.startyear;
            var labelText = MOPOP.startyear;
            if (reversed) {
                startLabelName = goTimelineName + "_L_" + MOPOP.endyear;
                labelText = MOPOP.endyear;
            }
            var wTrans = [xOffset - wallWidth * 0.7, yOffset - tileSize - 0.1, zOffset];
            //if (reversed) {
            //    wTrans = [xOffset + wallWidth * 0.7, yOffset - tileSize - 0.1, zOffset];
            //}
            var wRot = [0, 1, 0, 0];
            var wScale = [0.001, 0.001, 0.001];
            MAIN_CreateLabel(startLabelName, wTrans, wRot, wScale, hGo, labelText);
        }

        if (MOPOP.endyear > 0) {
            var xOffset = ((W * 0.5) * tileSize) - tileSize * 0.5;
            var yOffset = - tileSize;
            var endLabelName = goTimelineName + "_L_" + MOPOP.endyear;
            var labelText = MOPOP.endyear;
            if (reversed) {
                endLabelName = goTimelineName + "_L_" + MOPOP.startyear;
                labelText = MOPOP.startyear;
            }
            var wTrans = [xOffset + wallWidth * 0.3, yOffset - tileSize - 0.1, zOffset];
            var wRot = [0, 1, 0, 0];
            var wScale = [0.001, 0.001, 0.001];
            MAIN_CreateLabel(endLabelName, wTrans, wRot, wScale, hGo, labelText);

            var midLabelName = goTimelineName + "_L_" + MOPOP.mid;
            var wTrans2 = [xOffset - wallWidth * 0.2, yOffset - tileSize - 0.1, zOffset];
            MAIN_CreateLabel(midLabelName, wTrans2, wRot, wScale, hGo, MOPOP.midyear);
        }
    }
}

function MOPOP_SetupYearHist(hName, hGo, wallWidth, wallHeight, reversed) {

    var keyWall = hName;
    var parentGo = hGo;
    myconsolelog("MOPOP_InitYearHist before call keyWall => " + keyWall);

    MOPOP_InitYearHist(keyWall, parentGo, function (keyWall, parentGo) {
        myconsolelog("MOPOP_InitYearHist after cb ... keyWall => " + keyWall);
        if (MOPOP.yearcharts[keyWall] != null) {
            var chartData = MOPOP.yearcharts[keyWall];
            try {
                if (chartData.chartGo) {

                    var T = [-wallWidth * 0.2, wallHeight * 0.4, 0.2]; //was: [-wallWidth * 0.2, -wallHeight * 0.2, 0],
                    var R = [0, -0.707, 0, 0.707]; //[0, 1, 0, 0]
                    var S = [0.5, 0.5, 0.5];
                    if (reversed) {
                        T = [wallWidth, wallHeight * 0.4, 0.6];
                        R = [0, 0.707, 0, 0.707];
                    }

                    RT.Unity.SetParent(chartData.chartGo, parentGo);
                    RT.Unity.SetLocalPose(
                        chartData.chartGo,
                        T, //was: [-wallWidth * 0.2, -wallHeight * 0.2, 0],
                        R, //[0, 1, 0, 0]
                        S
                    );

                    if (!reversed) {
                        chartData.chartGo.transform.Rotate(0, 0, -2.6);
                    } else {
                        chartData.chartGo.transform.Rotate(0, 0, 9.7);
                    }
                    //chartData.chartGo.transform.rotation = new UE.Quaternion(R[0], R[1], R[2], R[3]);

                    //chartData.chartGo.transform.Rotate()

                    //add background
                    if (true) {
                        var bgGo = RT.Unity.GetVisPrefabInstance("bgplane", chartData.chartGo.name + "bg");
                        RT.Unity.SetParent(bgGo, chartData.chartGo);
                        RT.Unity.SetLocalPose(
                            bgGo,
                            [0.5, 0.5, 0.1], //was: [-wallWidth * 0.2, -wallHeight * 0.2, 0],
                            [-0.707, 0, 0, 0.707], //[0, 1, 0, 0]
                            [0.15, 0.2, 0.15]
                        );

                        var r = bgGo.GetComponent(MAIN.UE.Renderer);
                        if (r != null) {
                            //r.material.color = MAIN.UE.Color.green;
                            r.material.color = new MAIN.UE.Color(0.3, 0.3, 0.3, 0.9);
                        }
                    }


                    var axisP = chartData.bvv.Presenter.AxisPresenters;
                    axisP[0].IsCategorical = true;
                    axisP[0].LabelTickIntervall = 5;
                    axisP[0].LabelOrientation = 2; //X-Axis //this works
                    axisP[1].LabelOrientation = 2; //Y-Axis //this works

                    myconsolelog("MOPOP_InitYearHist after cb setting axis ... #axisP=" + axisP.length);
                    chartData.bvv.Rebuild();
                }
            } catch (err) {
                myconsolelog("MOPOP_InitYearHist after cb pos ERROR => " + err);
            }

            try {
                if (chartData.panelGo) {
                    myconsolelog("MOPOP_InitYearHist after cb setiing panel ... => " + chartData.panelGoName);
                    chartData.panelGo.Expire();
                    var tWu = MAIN_CreateLabel(chartData.panelGoName, [0.8, 0.9, 0], [0, 0, 0, 0],
                        [0.0015, 0.0015, 0.0015], chartData.chartGo, "Year Distribution");
                    chartData.panelGo = tWu;
                }
            } catch (err) {
                myconsolelog("MOPOP_InitYearHist after cb wu ERROR => " + err);
            }
        }
    });
}



function MOPOP_SetupScoreChart(hGo, wallWidth, wallHeight) {
    var parentGo = hGo;

    //iatk
    MOPOP_InitScoreChart(function () {
        try {
            console.log("MOPOP_InitScoreChart CB 0");
            if (MOPOP.scorechart != null) {
                console.log("MOPOP_InitScoreChart CB 0b");

                var chartData = MOPOP.scorechart;
                if (chartData.chartGo) {
                    console.log("MOPOP_SetupScoreChart SC name => " + chartData.chartGo.name);

                    console.log("MOPOP_InitScoreChart CB 1");
                    RT.Unity.SetParent(chartData.chartGo, parentGo);
                    RT.Unity.SetLocalPose(
                        chartData.chartGo,
                        [-wallWidth * 0.4, wallHeight * 0.5, 0],
                        [0, 1, 0, 0],
                        [0.35, 0.35, 0.35]
                    );

                    console.log("MOPOP_InitScoreChart CB 2");

                    //make chart 2d by removing z axis
                    chartData.abstractVisualisation.visualisationReference.zDimension.Attribute = "Undefined";
                    console.log("MOPOP_InitScoreChart CB 2b");

                    chartData.abstractVisualisation.UpdateVisualisation(chartData.PropertyType.Z);
                    console.log("MOPOP_InitScoreChart CB 2c");

                    //chartData.abstractVisualisation.visualisationReference.sizeDimension = "score";
                    //chartData.abstractVisualisation.UpdateVisualisation(chartData.PropertyType.Size);

                    console.log("MOPOP_InitScoreChart CB 3");
                    //chartData.fctChangeStyle(chartData.GeometryType.Lines); // --> maybe do that later

                    
                    //set gradient
                    var UE = importNamespace("UnityEngine");
                    var gradient = new UE.Gradient();
    
                    // Populate the color keys at the relative time 0 and 1 (0 and 100%)
                    var colorKey = [new UE.GradientColorKey(), new UE.GradientColorKey(), new UE.GradientColorKey()];
                    colorKey[0].color = new UE.Color(1, 0, 0);
                    colorKey[0].time = 0.0;
                    colorKey[1].color = new UE.Color(1, 1, 0)
                    colorKey[1].time = 0.5;
                    colorKey[2].color = new UE.Color(0, 1, 0)
                    colorKey[2].time = 1.0;

                    console.log("MOPOP_InitScoreChart CB 3b");
    
                    // Populate the alpha  keys at relative time 0 and 1  (0 and 100%)
                    var alphaKey = [new UE.GradientAlphaKey(), new UE.GradientAlphaKey(), new UE.GradientAlphaKey()];
                    alphaKey[0].alpha = 1.0;
                    alphaKey[0].time = 0.0;
                    alphaKey[1].alpha = 1.0;
                    alphaKey[1].time = 0.5;
                    alphaKey[2].alpha = 1.0;
                    alphaKey[2].time = 1.0;
                    gradient.SetKeys(colorKey, alphaKey);

                    console.log("MOPOP_InitScoreChart CB 3c");
    
                    chartData.abstractVisualisation.visualisationReference.colourDimension = "score";
                    console.log("MOPOP_InitScoreChart CB 3d");

                    chartData.abstractVisualisation.visualisationReference.dimensionColour = gradient;
                    console.log("MOPOP_InitScoreChart CB 3e");

                    chartData.abstractVisualisation.UpdateVisualisation(chartData.PropertyType.Colour);
                    console.log("MOPOP_InitScoreChart CB 3f");
                    

                    if (true) {
                        console.log("MOPOP_InitScoreChart CB 4");
                        var tWuName = "WU_ScoreEvents";
                        var tWuEHist = RT.Unity.CreateWU(tWuName, MAIN.WEBAPI.uiurl + "/eventhistory.html", true, 700, 1000);
                        RT.Unity.SetParent(tWuEHist, chartData.chartGo);
                        RT.Unity.SetLocalPose(tWuEHist, [1.8, 0.5, 0], [0, 0, 0, 1], [0.001, 0.001, 0.0001]);
                    }

                    console.log("MOPOP_InitScoreChart CB 5");

                    RT.Web.SetTiimeout(500, function () {
                        MOPOP.scorechart.fctChangeStyle(MOPOP.scorechart.GeometryType.Bars);
                        //MOPOP.scorechart.abstractVisualisation.UpdateVisualisation(chartData.PropertyType.GeometryType);
                    });
                    console.log("MOPOP_InitScoreChart CB 5b");
                }

                console.log("MOPOP_InitScoreChart CB 6");

                if (chartData.panelGo) {
                    chartData.panelGo.Expire();

                    var tWu = MAIN_CreateLabel(chartData.panelGoName, [0.8, 0.9, 0], [0, 0, 0, 0],
                        [0.0015, 0.0015, 0.0015], chartData.chartGo, "Live Score");
                    chartData.panelGo = tWu;
                    MOPOP.scorechart.panelGo = tWu;
                    console.log("MOPOP_InitScoreChart CB 7");
                }

                console.log("MOPOP_InitScoreChart CB 8");

                if (true) {
                    var bgGo = RT.Unity.GetVisPrefabInstance("bgplane", chartData.chartGo.name + "bg");
                    RT.Unity.SetParent(bgGo, chartData.chartGo);
                    RT.Unity.SetLocalPose(
                        bgGo,
                        [0.5, 0.5, 0.1], //was: [-wallWidth * 0.2, -wallHeight * 0.2, 0],
                        [-0.707, 0, 0, 0.707], //[0, 1, 0, 0]
                        [0.15, 0.2, 0.15]
                    );

                    var r = bgGo.GetComponent(MAIN.UE.Renderer);
                    if (r != null) {
                        //r.material.color = MAIN.UE.Color.green;
                        r.material.color = new MAIN.UE.Color(0.3, 0.3, 0.3, 0.9);
                    }
                }
            }
        } catch (err) {
            console.log("MOPOP_InitScoreChart CB ERROR => " + err);
        }
    });

    return;
    //u2v
    /*
    MOPOP_InitScoreChart(function () {
        if (MOPOP.scorechart != null) {
            var chartData = MOPOP.scorechart;
            try {
                if (chartData.chartGo) {
                    myconsolelog("MOPOP_SetupScoreChart SC name => " + chartData.chartGo.name);
                    RT.Unity.SetParent(chartData.chartGo, parentGo);
                    RT.Unity.SetLocalPose(
                        chartData.chartGo,
                        [-wallWidth * 0.4, wallHeight * 0.5, 0],
                        [0, 1, 0, 0],
                        [0.35, 0.35, 0.35]
                    );

                    // adding bg plane for readability
                    if (true) {
                        var bgGo = RT.Unity.GetVisPrefabInstance("bgplane", chartData.chartGo.name + "bg");
                        RT.Unity.SetParent(bgGo, chartData.chartGo);
                        RT.Unity.SetLocalPose(
                            bgGo,
                            [0.5, 0.5, 0.1], //was: [-wallWidth * 0.2, -wallHeight * 0.2, 0],
                            [-0.707, 0, 0, 0.707], //[0, 1, 0, 0]
                            [0.15, 0.2, 0.15]
                        );

                        var r = bgGo.GetComponent(MAIN.UE.Renderer);
                        if (r != null) {
                            //r.material.color = MAIN.UE.Color.green;
                            r.material.color = new MAIN.UE.Color(0.3, 0.3, 0.3, 0.9);
                        }
                    }

                    // adding score event history
                    if (true) {
                        var tWuName = "WU_ScoreEvents";
                        var tWuEHist = RT.Unity.CreateWU(tWuName, MAIN.WEBAPI.uiurl + "/eventhistory.html", true, 700, 1000);
                        RT.Unity.SetParent(tWuEHist, chartData.chartGo);
                        RT.Unity.SetLocalPose(tWuEHist, [1.8, 0.5, 0], [0, 0, 0, 1], [0.001, 0.001, 0.0001]);
                    }

                    var U2V = importNamespace("u2vis");
                    var axisP = chartData.chartGo.GetComponentsInChildren(U2V.GenericAxisView);
                    axisP[1].AxisPresenter.LabelOrientation = 2; //Y-Axis
                    chartData.bvv.Rebuild();
                }
            } catch (err) {
                myconsolelog("MOPOP_SetupScoreChart SC ERROR => " + err);
            }

            try {
                if (chartData.panelGo) {
                    chartData.panelGo.Expire();

                    var tWu = MAIN_CreateLabel(chartData.panelGoName, [0.8, 0.9, 0], [0, 0, 0, 0],
                        [0.0015, 0.0015, 0.0015], chartData.chartGo, "Live Score");
                    chartData.panelGo = tWu;
                    MOPOP.scorechart.panelGo = tWu;
                }
            } catch (err) {
                myconsolelog("MOPOP_SetupScoreChart SC panel ERROR => " + err);
            }
        }
    });*/
}

function MOPOP_HookWallHookEntry(mThis, mOther, mData) {
    //{"TrackableName":"16325654015","TrackedGoName":"VIT-6-16325654015","goName":"Test16325654015","wuName":"UI16325654015"}
    var dObj = JSON.parse(mData);

    //only process tracked label hits
    if (mOther.indexOf("UI") < 0) {
        return;
    }

    //hook access for testing
    var hookOcc = MOPOP.hookwall[dObj.hookWall].hooks[dObj.tileGoName];
    myconsolelog("VZTrigger Occ [" + dObj.hookWall + ", " + dObj.tileGoName + "] => " +
        hookOcc.isOccupied + " / " + hookOcc.occupante);

    if (MOPOP.picked != null) {
        MOPOP_ReportUserEvent(MOPOP.userevents.placed,
            {
                "artefact": MOPOP.picked,
                "wall": dObj.hookWall,
                "hook": dObj.tileGoName
            }, Date.now(), MOPOP.user);

        try {
            myconsolelog("MOPOP Artefact_MakeMePlaced => " + MOPOP.picked.wuName);
            var wuName1 = MOPOP.picked.wuName;
            var tw1 = MAIN.PUI.WorldUI.Find(wuName1);
            if (tw1 != null) {
                tw1.document.Run("Artefact_MakeMePlaced", [""]);
            }
        } catch (setPlacedErr) {
            myconsolelog("MOPOP Artefact_MakeMePlaced ERROR => " + setPlacedErr);
        }

        var pickedName = MOPOP.picked.TrackableName;
        var pickedGoName = MOPOP.picked.TrackedGoName;
        myconsolelog("VZTrigger Enter smth picked? => " + JSON.stringify(MOPOP.picked));

        MOPOP.hookwall[dObj.hookWall].hooks[dObj.tileGoName].isOccupied = true;
        MOPOP.hookwall[dObj.hookWall].hooks[dObj.tileGoName].occupante = MOPOP.picked;
        MOPOP.picked = null;



        $("#rr_mopop_bottom_picked").html("");
        $("#rr_mopop_bottom_info").html(dObj.tileGoName + "=>" + pickedName);

        //set is now placed on wall

        //find hook and change color
        var goHookParent = dObj.hookWall + "/" + dObj.tileGoName;
        var goHookName = dObj.hookWall + "/" + dObj.tileGoName + "/" + dObj.hookGoName;
        myconsolelog("VZTrigger looking for => " + goHookName);
        var hookGo = MAIN.UE.GameObject.Find(goHookName);
        if (hookGo != null) {
            var r = hookGo.GetComponent(MAIN.UE.Renderer);
            if (r != null) {
                //r.material.color = MAIN.UE.Color.red;
                r.material.color = new MAIN.UE.Color(0, 1, 0, 0.8);
                //RT.Unity.SpawnNotification(5, "Occupied hook " + dObj.tileGoName);
                PlayNotification();
                MOPOP_CalcScore();
            }
        }

        //set timeline bezier
        var fullDateStr = MOPOP.artefacts[pickedName].publishdate;
        myconsolelog("VZTrigger TL MOPOP.artefacts = > " + JSON.stringify(MOPOP.artefacts));
        myconsolelog("VZTrigger TL fullDateStr = > " + fullDateStr);

        //const fullDate = new Date(fullDateStr);
        //var year = fullDate.getFullYear();
        var year = MOPOP_GetYearFromString(fullDateStr);
        myconsolelog("VZTrigger TL year = > " + year);

        var bezName = "BZ" + "_" + pickedName;
        var yearTickGoName = dObj.hookWall + "/" + dObj.hookWall + "_TL" + "/" + dObj.hookWall + "_TL_tick_" + year;

        myconsolelog("VZTrigger TL bezName => " + bezName);
        myconsolelog("VZTrigger TL yearTickGoName => " + yearTickGoName);

        var bezGo = RT.Unity.CreateBezier(bezName, pickedGoName, yearTickGoName);
        MOPOP.artefacts[pickedName].bezGo = bezGo;
    }
}

function MOPOP_HookWallHookExit(mThis, mOther, mData) {
    //activated on exit
}

function MOPOP_SetupHookwall(W, H, tileModel, tileSize, hGoName, hGo) {
    for (var h = 0; h < H; h++) {
        for (var w = 0; w < W; w++) {
            //myconsolelog("MOPOP_InitEnv [" + w + "," + h + "] hookswalls tile[" + i + "] => current " + w + ", " + h);
            var go = MAIN.VZ.AssetBundleHolder.InstantiateGameObject(MAIN.location.envassetbundle, tileModel);
            if (go != null) {
                //myconsolelog("MOPOP_InitEnv hookswals tile [" + i + "] => current " + w + ", " + h + " => FOUND TILE");
                go.name = hGoName + "_" + w + "_" + h;

                //HW_rockwall_6_1
                //HW_rockwall_7_2
                //[HW_rockwall_0_0][HW_rockwall_1_0][HW_rockwall_2_0]
                //[HW_rockwall_0_1][HW_rockwall_1_1][HW_rockwall_2_1]
                //[HW_rockwall_0_2][HW_rockwall_1_2][HW_rockwall_2_2]

                MOPOP.hookwall[hGoName].hooks[go.name] = {
                    "isOccupied": false,
                    "occupante": null,
                    "x": w,
                    "y": h
                };
                myconsolelog("MOPOP_InitEnv [" + w + "," + h + "] XXX => " + JSON.stringify(MOPOP.hookwall));

                go.transform.parent = hGo.transform;
                go.transform.localPosition = new MAIN.UE.Vector3(tileSize * w, tileSize * h, 0);

                //myconsolelog("MOPOP_InitEnv [" + w + "," + h + "] setting up trigger  hookswals[" + i + "] ...");
                //PrepareInteractionGo(GameObject go, JSCallback enterCB, JSCallback exitCB, string data)
                var centerGo = MAIN.UE.GameObject.Find(go.name + "/Hook");
                if (centerGo != null) {

                    centerGo.transform.localScale =
                        new MAIN.UE.Vector3(
                            centerGo.transform.localScale.x * 5,
                            centerGo.transform.localScale.y * 5,
                            centerGo.transform.localScale.z * 10
                        );

                    //added that to fix starting color
                    var r = centerGo.GetComponent(MAIN.UE.Renderer);
                    if (r != null) {
                        //r.material.color = MAIN.UE.Color.green;
                        r.material.color = new MAIN.UE.Color(0.4, 0.4, 0.4, 0.5);
                    }

                    var triggerData = {
                        "hookWall": hGoName,
                        "tileGoName": go.name,
                        "hookGoName": centerGo.name
                    };
                    MAIN.RR.Runtime.PrepareInteractionGo(
                        centerGo,
                        MOPOP_HookWallHookEntry,
                        MOPOP_HookWallHookExit,
                        JSON.stringify(triggerData)
                    );
                }

                var tileGo = MAIN.UE.GameObject.Find(go.name + "/Tile");
                if (tileGo != null) {
                    RT.Unity.DestroyGO(tileGo);
                }
            }
        }
    }

    console.log("MOPOP_SetupHookwall MOPOP.hookwall[" + hGoName + "] => " + JSON.stringify(MOPOP.hookwall[hGoName]));
}

function MOPOP_TempTable_InfoHookEntry(mThis, mOther, mData) {
    if (mOther.indexOf("UI") < 0) {
        return;
    }

    var pickedName = MOPOP.picked.TrackableName;

    MOPOP_TempTable_StandardHookEntry(mThis, mOther, mData);
    //{"TrackableName":"16325654015","TrackedGoName":"VIT-6-16325654015","goName":"Test16325654015","wuName":"UI16325654015"}

    myconsolelog("MOPOP_TempTable_InfoHookEntry " + mThis + ", " + mOther + ", " + mData);
    //MOPOP_TempTable_InfoHookEntry Hook, Tile, {"temptable":"TT_infotable","tileGoName":"TT_infotable_0_0","hookGoName":"Hook"}
    var dObj = JSON.parse(mData);

    MOPOP.AddInfoPick(pickedName);
    var infoPickedJson = JSON.stringify(MOPOP.infopicks);

    var wuName = MOPOP.temptable["TT_infotable"].wuName;
    var tw = MAIN.PUI.WorldUI.Find(wuName);
    if (tw != null) {
        tw.document.Run("Infotable_NewPick", [infoPickedJson]);
    } else {
        myconsolelog("MOPOP_TempTable_InfoHookEntry before TM tw NOT found for AttrComb_ExternalInitMe");
    }
}

function MOPOP_TempTable_StandardHookEntry(mThis, mOther, mData) {

    //{"TrackableName":"16325654015","TrackedGoName":"VIT-6-16325654015","goName":"Test16325654015","wuName":"UI16325654015"}
    var dObj = JSON.parse(mData);

    //only process tracked label hits
    if (mOther.indexOf("UI") < 0) {
        myconsolelog("VZTrigger Enter no VIT object");
        return;
    }

    myconsolelog("VZTrigger Enter -> " + mThis + ", " + mOther + ", " + mData);

    //hook access for testing
    var ttOcc = MOPOP.temptable[dObj.temptable].hooks[dObj.tileGoName];

    if (MOPOP.picked != null) {
        MOPOP_ReportUserEvent(MOPOP.userevents.placedontable,
            {
                "artefact": MOPOP.picked,
                "temptable": dObj.temptable,
                "hook": dObj.tileGoName
            }, Date.now(), MOPOP.user);

        try {
            myconsolelog("MOPOP Artefact_MakeMePlaced => " + MOPOP.picked.wuName);
            var wuName1 = MOPOP.picked.wuName;
            var tw1 = MAIN.PUI.WorldUI.Find(wuName1);
            if (tw1 != null) {
                tw1.document.Run("Artefact_MakeMePlaced", [""]);
            }
        } catch (setPlacedErr) {
            myconsolelog("MOPOP Artefact_MakeMePlaced ERROR => " + setPlacedErr);
        }

        var pickedName = MOPOP.picked.TrackableName;
        var pickedGoName = MOPOP.picked.TrackedGoName;
        myconsolelog("VZTrigger Enter smth picked? => " + JSON.stringify(MOPOP.picked));

        MOPOP.temptable[dObj.temptable].hooks[dObj.tileGoName].isOccupied = true;
        MOPOP.temptable[dObj.temptable].hooks[dObj.tileGoName].occupante = MOPOP.picked;
        MOPOP.picked = null;

        //find hook and change color
        var goHookName = dObj.temptable + "/" + dObj.tileGoName + "/" + dObj.hookGoName;
        myconsolelog("VZTrigger looking for => " + goHookName);
        var hookGo = MAIN.UE.GameObject.Find(goHookName);
        if (hookGo != null) {
            var r = hookGo.GetComponent(MAIN.UE.Renderer);
            if (r != null) {
                //r.material.color = MAIN.UE.Color.red;
                r.material.color = new MAIN.UE.Color(0, 1, 0, 0.8);
                //RT.Unity.SpawnNotification(5, "Occupied hook " + dObj.tileGoName);
                PlayNotification();
                MOPOP_CalcScore();
            }
        }

    }
}

function MOPOP_TempTable_StandardHookExit(mThis, mOther, mData) {

}


function MOPOP_InitEnv() {
    myconsolelog("MOPOP_InitEnv starting ...");
    myconsolelog("MOPOP_InitEnv starting ... Date.now() => " + Date.now());

    myconsolelog("MOPOP_InitEnv starting ... MOPOP_UpdateHookOccupation every 500ms");
    RT.Web.SetInterval(3000, 500, MOPOP_UpdateHookOccupation2);

    var mUser = RT.Help.GetStringFromCfg("user");
    myconsolelog("MOPOP_InitEnv starting ... mUser = " + mUser);
    if (mUser != null && mUser.length > 0) {
        MOPOP.user = mUser;
    } else {
        MOPOP.user = "auto" + Date.now();
    }

    myconsolelog("MOPOP_InitEnv starting ... MOPOP.user = " + MOPOP.user);

    MOPOP_ReportUserEvent(MOPOP.userevents.start, "", Date.now(), MOPOP.user);


    if (MAIN.hasOwnProperty("location")) {
        myconsolelog("MOPOP_InitEnv MAIN.location FOUND");
        if (MAIN.location.hasOwnProperty("data")) {
            myconsolelog("MOPOP_InitEnv MAIN.location.data FOUND");
            if (MAIN.location.data.hasOwnProperty("mopop")) {
                myconsolelog("MOPOP_InitEnv MAIN.location.data.mopop FOUND");
            }
        }
    }

    myconsolelog("MOPOP_InitEnv MAIN.location.data.mopop => " + MAIN.location.data.mopop);

    if (MAIN.worldgo == null) {
        MAIN.worldgo = MAIN.UE.GameObject.Find("world");
    }

    MOPOP_InitMqtt();
    try {
        var mopop = MAIN.location.data.mopop;
        if (mopop.hasOwnProperty("hookwalls")) {
            var N = mopop.hookwalls.length;
            myconsolelog("MOPOP_InitEnv #hookswals => " + N);
            for (var i = 0; i < N; i++) {

                //this is a hook wall
                var hw = mopop.hookwalls[i];
                var hName = hw.name;
                var hDisplayName = hw.displayname;
                var tileModel = hw.tilemodel;
                var tileSize = hw.tilesize;
                var W = hw.width;
                var H = hw.height;
                var wallWidth = tileSize * W;
                var wallHeight = tileSize * H;

                var hTrans = null;
                if (hw.hasOwnProperty("transform")) {
                    hTrans = hw.transform;
                }

                var hTimeline = null;
                if (hw.hasOwnProperty("timeline")) {
                    //"start": 1990,
                    //"end": 2020,
                    //"tick": 1
                    hTimeline = hw.timeline;
                }

                myconsolelog("MOPOP_InitEnv hookswals[" + i + "] => " + hName + ", " + tileModel + ", " + W + ", " + H + ", " + tileSize);

                var hGoName = "HW_" + hName;
                var hGo = null;
                hGo = MAIN.UE.GameObject.Find(hGoName);
                if (hGo != null) {
                    RT.Unity.DestroyGO(hGo);
                }

                hGo = new MAIN.UE.GameObject();
                myconsolelog("MOPOP_InitEnv 1");

                if (hGo != null) {
                    hGo.name = hGoName;

                    if (MAIN.worldgo != null) {
                        RT.Unity.SetParent(hGo, MAIN.worldgo);
                    }

                    MAIN.RR.Runtime.ToggleObjManipulation(hGo.name);
                    MAIN.RR.Runtime.ToggleBounds(hGo.name);

                    myconsolelog("MOPOP_InitEnv 2");

                    hGo.transform.localPosition = new MAIN.UE.Vector3(0, 0, i * 0.1);

                    myconsolelog("MOPOP_InitEnv 3");

                    MOPOP.hookwall[hGoName] = {};
                    MOPOP.hookwall[hGoName].name = hGoName;
                    MOPOP.hookwall[hGoName].hooks = {};

                    MAIN_CreateLabel(hGoName + "_title", [-tileSize * 0.5, wallHeight - tileSize * 0.5, 0], [0, 1, 0, 0],
                        [0.001, 0.001, 0.001], hGo, hDisplayName);

                    //Creates a Timeline from cube as a set of children
                    MOPOP_SetupTimeline(hTimeline, hGo, tileSize, W, H, wallWidth, hw.reversed);

                    //creates and sets up the year-distribution chart per wall
                    MOPOP_SetupYearHist(hName, hGo, wallWidth, wallHeight, hw.reversed);

                    //create a wall with its tiles and interactions callbacks
                    MOPOP.hookwall[hGoName].reversed = hw.reversed;
                    MOPOP.hookwall[hGoName].w = W;
                    MOPOP.hookwall[hGoName].h = H;
                    MOPOP_SetupHookwall(W, H, tileModel, tileSize, hGoName, hGo);

                    if (hTrans != null) {
                        RT.Unity.SetLocalPose(hGo, hTrans.position, hTrans.rotation, hTrans.scale);
                    }
                }
                myconsolelog("MOPOP_InitEnv NEXT WALL ...");
            }
        }

        //init temptables
        if (mopop.hasOwnProperty("temptables")) {
            var N = mopop.temptables.length;
            myconsolelog("MOPOP_InitEnv #temptables => " + N);
            for (var i = 0; i < N; i++) {

                var tt = mopop.temptables[i];
                var tName = tt.name;
                var tDisplayName = tt.displayname;
                var tileModel = tt.tilemodel;
                var tileSize = tt.tilesize;
                var W = tt.width;
                var H = tt.height;
                var wallWidth = tileSize * W;
                var wallHeight = tileSize * H;

                var tTrans = null;
                if (tt.hasOwnProperty("transform")) {
                    tTrans = tt.transform;
                }

                var tGoName = "TT_" + tName;
                var tGo = null;
                tGo = MAIN.UE.GameObject.Find(tGoName);
                if (tGo != null) {
                    RT.Unity.DestroyGO(tGo);
                }
                tGo = new MAIN.UE.GameObject();

                if (tGo != null) {
                    tGo.name = tGoName;

                    if (MAIN.worldgo != null) {
                        RT.Unity.SetParent(tGo, MAIN.worldgo);
                    }

                    MAIN.RR.Runtime.ToggleObjManipulation(tGo.name);
                    tGo.transform.localPosition = new MAIN.UE.Vector3(0, 0, i * 0.1);
                    MOPOP.temptable[tGoName] = {};
                    MOPOP.temptable[tGoName].name = tGoName;
                    MOPOP.temptable[tGoName].hooks = {};
                    MOPOP.temptable[tGoName].wuName = "TT_WU_" + tName;

                    if (tName != "infotable") {
                        MAIN_CreateLabel(tGoName + "_title", [-tileSize * 0.5, wallHeight - tileSize * 0.5, 0],
                            [0, 0.707, 0.707, 0], [0.001, 0.001, 0.001], tGo, tDisplayName);
                    }

                    if (tName == "infotable") {
                        var tWuName = MOPOP.temptable[tGoName].wuName;
                        var tWuMenu = RT.Unity.CreateWU(tWuName, MAIN.WEBAPI.uiurl + "/infomenu.html", true, 700, 1000);
                        RT.Unity.SetParent(tWuMenu, tGo);
                        RT.Unity.SetLocalPose(tWuMenu, [-tileSize, 0, tileSize], [0, 0.707, 0.707, 0], [0.0005, 0.0005, 0.0005]);
                    }

                    //Creates and sets up a score chart
                    if (tName == "scoretable") {
                        MOPOP_SetupScoreChart(tGo, wallWidth, wallHeight);
                        RT.Web.SetTiimeout(500, function () {
                            //RT.Unity.SetLocalPose(MOPOP.scorechart.chartGo, [-tileSize * 2, 0, tileSize * 0.5], [0, 0.707, 0.707, 0], null);
                            RT.Unity.SetLocalPose(MOPOP.scorechart.chartGo, [0, tileSize * 0.5, -1.5 * tileSize], [0, 0.707, 0.707, 0], null);
                        });
                    }

                    //init temptable tiles
                    for (var h = 0; h < H; h++) {
                        for (var w = 0; w < W; w++) {
                            var go = MAIN.VZ.AssetBundleHolder.InstantiateGameObject(MAIN.location.envassetbundle, tileModel);
                            if (go != null) {
                                go.name = tGoName + "_" + w + "_" + h;
                                MOPOP.temptable[tGoName].hooks[go.name] = {
                                    "isOccupied": false,
                                    "occupante": null
                                };

                                go.transform.parent = tGo.transform;
                                go.transform.localPosition = new MAIN.UE.Vector3(tileSize * w, tileSize * h, 0);

                                var centerGo = MAIN.UE.GameObject.Find(go.name + "/Hook");
                                if (centerGo != null) {

                                    centerGo.transform.localScale =
                                        new MAIN.UE.Vector3(
                                            centerGo.transform.localScale.x * 4,
                                            centerGo.transform.localScale.y * 4,
                                            centerGo.transform.localScale.z * 8
                                        );

                                    var triggerData = {
                                        "temptable": tGoName,
                                        "tileGoName": go.name,
                                        "hookGoName": centerGo.name
                                    };

                                    if (tName == "infotable") {
                                        MAIN.RR.Runtime.PrepareInteractionGo(
                                            centerGo,
                                            MOPOP_TempTable_InfoHookEntry,
                                            MOPOP_TempTable_StandardHookExit,
                                            JSON.stringify(triggerData)
                                        );
                                    } else {
                                        MAIN.RR.Runtime.PrepareInteractionGo(
                                            centerGo,
                                            MOPOP_TempTable_StandardHookEntry,
                                            MOPOP_TempTable_StandardHookExit,
                                            JSON.stringify(triggerData)
                                        );
                                    }


                                }
                            }
                        }
                    }
                    if (tTrans != null) {
                        RT.Unity.SetLocalPose(tGo, tTrans.position, tTrans.rotation, tTrans.scale);
                    }
                }
            }
        }
    } catch (err) {
        myconsolelog("MOPOP_InitEnv ERROR => " + err);
    }

    MOPOP_ToggleWallManipulation();
}

function MOPOP_InfotableClick(mButtonName) {
    if (mButtonName.toUpperCase() == "COMPARE") {

        //TODO replace that through hookwall access
        var parentGo = MAIN.UE.GameObject.Find("TT_infotable");

        try {
            myconsolelog("MOPOP_InfotableClick 1");
            //MOPOP.AddInfoPick("2805595956");

            //parse table here
            myconsolelog("MOPOP_InfotableClick 2");
            if (MOPOP.infopicks.length > 0) {
                if (MOPOP.info.wu != null) {
                    MOPOP.info.wu.Expire();
                }

                myconsolelog("MOPOP_InfotableClick 3 #MOPOP.infopicks=" + MOPOP.infopicks.length);
                myconsolelog("MOPOP_InfotableClick 3 MOPOP.infopicks=" + JSON.stringify(MOPOP.infopicks));
                //setup comparison table here
                //[{"artist":"Lady Gaga","song":"The Fame","coverid":"2805595956","coverart":"2805595956.jpg","publishdate":"2008-10-28T00:00:00.000Z","publisher":"","score":"100"}]
                var infoTrans = {
                    '<>': 'div',
                    'style': 'margin:1vh; padding:1vh; border: solid rgb(238,238,238) 2px; background-color:rgb(0,77,109); border-radius:1vh;font-weight:bold;width:500px;',
                    'html': '${index} <span style="width:30%;margin:1vh;">${artist} - ${song}</span> <span style="width:10%;margin:1vh;">${publisher}</span> <span style="width:10%;margin:1vh;">${score}</span> <span style="width:10%;margin:1vh;">${soldcopies}</span>'
                };
                var html = '<div style="margin:1vh; padding:1vh; border: solid rgb(238,238,238) 2px; background-color:rgb(49,182,188); border-radius:2vh; font-weight:bold; width:550px;">';
                html += '<span style="width:30%;margin:1vh;">ARTIST - SONG</span> <span style="width:10%;margin:1vh;">PUBLISHER</span> <span style="width:10%;margin:1vh;">SCORE</span> <span style="width:10%;margin:1vh;">SOLD</span>';
                html += json2html.transform(MOPOP.infopicks, infoTrans);
                html += "</div>";

                myconsolelog("MOPOP_InfotableClick 4 html =>" + html);

                MOPOP.info.wuName = "TT_WU_infotable";
                MOPOP.info.wu = RT.Unity.CreateWU(MOPOP.info.wuName, html, false, 1024, 768);

                myconsolelog("MOPOP_InfotableClick 5");

                RT.Unity.SetParent(MOPOP.info.wu, parentGo);
                RT.Unity.SetLocalPose(MOPOP.info.wu, [0, 0, 0], [0, 0.707, 0.707, 0], [0.001, 0.001, 0.0001]);
            }
        } catch (berr) {
            myconsolelog("MOPOP_InfotableClick ERROR berr => " + berr);
        }

        if (MOPOP.infochart == null) {

            MOPOP_InitInfoCompareChart("slot", parentGo, function (keyWall, parentGo) {
                myconsolelog("MOPOP_InitInfoCompareChart after cb ... keyWall => " + keyWall);
                if (MOPOP.infochart != null) {
                    var chartData = MOPOP.infochart;
                    try {
                        if (chartData.chartGo) {
                            RT.Unity.SetParent(chartData.chartGo, parentGo);
                            RT.Unity.SetLocalPose(
                                chartData.chartGo,
                                [0.4, -0.4, 0],
                                [0, -0.707, -0.707, 0],
                                [0.3, 0.3, 0.3]
                            );

                            //TODO fix axis and the cat label axis

                            var axisP = chartData.bvv.Presenter.AxisPresenters;
                            axisP[0].IsCategorical = true;
                            axisP[0].LabelTickIntervall = 5;
                            axisP[0].LabelOrientation = 2; //X-Axis //this works
                            axisP[1].LabelOrientation = 2; //Y-Axis //this works
                            chartData.bvv.Rebuild();
                        }


                        //setup data here
                        if (chartData.chartGo) {
                            /*
                            if (MOPOP.infochart.gdp != null) {
                                try {
                                    MOPOP.infochart.gdp.Initialize(this.rtp, 0, 2, [2, 4, 6]);
                                } catch (err) {
                                    MOPOP.infochart.gdp.Initialize(this.rtp, 0, 2, 0, [2, 4, 6]);
                                }
                            }
                            chartData.bvv.Rebuild();
                            */
                            /*var Nslots = 3;//MOPOP.infopicks.length;
                            for (var si = 0; si < Nslots; si++) {
                                labels = ["score", "sold"];
                                var data = {
                                    "data": {
                                        "xdimname": "",
                                        "xlabels": labels,
                                        "ydimname": "amount",
                                        "nindices": labels.length,
                                        "mqtt": MOPOP.topics.infocompare + "/" + si,
                                        "mqttdimensionkey": "amount",
                                        "reset": true
                                    }
                                };
                                var dataJson = JSON.stringify(data);
                                MOPOP.infochart.fctAddDimensionWithRealtimeKeys(dataJson);
                            }*/
                        }
                    } catch (err) {
                        myconsolelog("MOPOP_InfotableClick after cb pos ERROR => " + err);
                    }

                    try {
                        if (chartData.panelGo) {
                            chartData.panelGo.Expire();
                            //var tWu = MAIN_CreateLabel(chartData.panelGoName, [0.8, 0.9, 0], [0, 0, 0, 0],
                            //    [0.0015, 0.0015, 0.0015], chartData.chartGo, "Year Distribution");
                            //chartData.panelGo = tWu;
                        }
                    } catch (err) {
                        myconsolelog("MOPOP_InfotableClick after cb wu ERROR => " + err);
                    }
                }

                //reset chart after init
                RT.Web.SetTiimeout(100, function () {
                    var pN = 3;
                    for (var pi = 0; pi < pN; pi++) {
                        var pl = {
                            "0": {
                                "val": 0, //to replace with val from cover
                                "id": 0
                            },
                            "1": {
                                "val": 0,
                                "id": 1
                            }
                        };
                        var topic = MOPOP.topics.infocompare + "/" + pi;
                        var plStr = JSON.stringify(pl);
                        myconsolelog("MOPOP_InfotableClick publish => " + pN + "|" + topic + " | " + plStr);
                        RT.MQTT.Publish(topic, plStr);
                    }
                });
            });
        }

        //publish mqtt data here
        RT.Web.SetTiimeout(800, function () {
            if (MOPOP.infopicks.length > 0) {
                //{"artist":"Lady Gaga","song":"The Fame","coverid":"2805595956","coverart":"2805595956.jpg","publishdate": "2008-10-28T00:00:00.000Z", "publisher": "", "score": "100"}
                var picks = MOPOP.infopicks;
                var pN = MOPOP.infopicks.length;
                for (var pi = 0; pi < pN; pi++) {
                    var pick = picks[pi];

                    var soldCopiesStr = pick.soldcopies.replace(',', '');
                    var soldCopies = parseFloat(soldCopiesStr) * 0.0001;
                    //TODO normalize data here
                    var pl = {
                        "0": {
                            "val": soldCopies, //to replace with val from cover
                            "id": 0
                        },
                        "1": {
                            "val": parseInt(pick.score),
                            "id": 1
                        }
                    };
                    var topic = MOPOP.topics.infocompare + "/" + pi;
                    var plStr = JSON.stringify(pl);
                    myconsolelog("MOPOP_InfotableClick publish => " + pN + "|" + topic + " | " + plStr);
                    RT.MQTT.Publish(topic, plStr);
                }
            }
        });
    }

    if (mButtonName.toUpperCase() == "CLEAR") {
        MOPOP.infopicks = [];
        if (MOPOP.info.wu != null) {
            MOPOP.info.wu.Expire();
        }

        RT.Web.SetTiimeout(100, function () {
            var pN = 3;
            for (var pi = 0; pi < pN; pi++) {
                var pl = {
                    "0": {
                        "val": 0, //to replace with val from cover
                        "id": 0
                    },
                    "1": {
                        "val": 0,
                        "id": 1
                    }
                };
                var topic = MOPOP.topics.infocompare + "/" + pi;
                var plStr = JSON.stringify(pl);
                myconsolelog("MOPOP_InfotableClick publish => " + pN + "|" + topic + " | " + plStr);
                RT.MQTT.Publish(topic, plStr);
            }
        });
    }
}

function MOPOP_DownloadArtefact(mCoverId) {
    myconsolelog("MOPOP_DownloadArtefact looking for => " + mCoverId);
    var url = MAIN.WEBAPI.apiBase + "/mopop/song?coverid=" + mCoverId;
    var headers = ["content-type", "application/x-www-form-urlencoded"];
    var data = "";

    RT.Web.SendWebReq("GET", url, headers, data,
        function (mError, mData) {
            myconsolelog("MOPOP_DownloadArtefact mData => " + mData);
            if (mError == false) {
                var sData = JSON.parse(mData);
                if (sData.length > 0) {
                    var d = sData[0];
                    myconsolelog("MOPOP_DownloadArtefact => " + d.coverid);
                    MOPOP.artefacts[d.coverid] = d;
                }
            }
        });
}

function MOPOP_AddAnchors() {
    RT.WA.AddToGO("HW_popwall");
    RT.WA.AddToGO("HW_rockwall");
}

/// MOPOP imple -> MOVE ELSEWHERE
function MOPOP_TestDB() {
    myconsolelog("MOPOP_TestDB ...");
    myconsolelog("MOPOP_TestDB MAIN.location.envtargets.xml=" + MAIN.location.envtargets.xml);
    myconsolelog("MOPOP_TestDB MAIN.location.envtargets.dat=" + MAIN.location.envtargets.dat);


    var reqHeaders = ["content-type", "application/x-www-form-urlencoded"];
    var url = MAIN.WEBAPI.apiBase + "/getfile2?name=";

    var urlA = url + MAIN.location.envtargets.xml;
    RT.Web.DownloadFile("GET", urlA, reqHeaders, MAIN.location.envtargets.xml, false, function () {
        myconsolelog("MOPOP_TestDB downloaded => " + MAIN.location.envtargets.xml);
    });

    var urlB = url + MAIN.location.envtargets.dat;
    RT.Web.DownloadFile("GET", urlB, reqHeaders, MAIN.location.envtargets.dat, false, function () {
        myconsolelog("MOPOP_TestDB downloaded => " + MAIN.location.envtargets.dat);
    });

    //TODO delay here
    myconsolelog("MOPOP_TestDB Enabling tracking ...");

    RT.Web.SetTiimeout(5, function () {
        RT.Unity.SpawnNotification(5, "Artefact tracking started");
    });

    return;
    //TODO pass here observeable go
    importNamespace("RR").Runtime.StartImgTracking(
        function (mTrackableName, mTrackedGoName) {
            myconsolelog("MOPOP_TestDB Target Found => " + mTrackableName + ", " + mTrackedGoName);

            var goName = "Test" + mTrackableName;
            var wuName = "UI" + mTrackableName;

            var artefactData = {
                "TrackableName": mTrackableName,
                "TrackedGoName": mTrackedGoName,
                "goName": goName,
                "wuName": wuName
            };

            if (mTrackableName == "18746832409") {
                console.log("XXXX => found " + mTrackableName);
                if (MAIN.worldgo != null) {
                    console.log("XXXX => found MAIN.worldgo");
                    var go = MAIN.UE.GameObject.Find(mTrackedGoName);
                    if (go != null) {
                        console.log("XXXX => found mTrackedGoName => " + mTrackedGoName);
                        //RT.Unity.SetParent(MAIN.worldgo, go);
                        RT.Unity.SetLocalPose(MAIN.worldgo, [0, 0, 0], [0, 0, 0, 0], [1, 1, 1]);
                        MAIN.worldgo.transform.rotation = go.transform.rotation;
                        MAIN.worldgo.transform.position = go.transform.position;

                        //adding temp world anchors
                        RT.WA.AddToGO(MAIN.worldgo.name);
                        //RT.WA.AddToGO("HW_popwall");
                        //RT.WA.AddToGO("HW_rockwall");
                    }
                }
                return;
            }


            if (MOPOP.artefacts.hasOwnProperty(mTrackableName) == false) {
                myconsolelog("MOPOP_TestDB Downloading artefact => " + mTrackableName);
                MOPOP_DownloadArtefact(mTrackableName);
            }

            myconsolelog("MOPOP Target found looking for data => " + mTrackableName);
            myconsolelog("MOPOP artefacts => " + MAIN.location.data.mopop.artefacts)



            //TODO check if its on a hook
            // if it is on a hook, check if it is further away eg 5ck
            // if so pick it up



            //igonre that with registered artefacts
            if (true || MAIN.location.data.mopop.artefacts) {
                var entry = MAIN.location.data.mopop.artefacts[mTrackableName];
                myconsolelog("MOPOP Target found data => " + mTrackableName + " => " + entry);

                // picked up flag
                MOPOP.picked = artefactData;
                //RT.Unity.SpawnNotification(5, "Picked Up " + mTrackableName);
                PlayNotification();
                $("#rr_mopop_bottom_picked").html(mTrackableName);

                try {
                    var tw1 = MAIN.PUI.WorldUI.Find(wuName);
                    if (tw1 != null) {
                        tw1.document.Run("Artefact_MakeMePicked", [""]);
                    }
                } catch (setPickedErr) {
                    myconsolelog("MOPOP Artefact_MakeMePicked ERROR => " + setPickedErr);
                }

                MOPOP_ReportUserEvent(MOPOP.userevents.picked, MOPOP.picked, Date.now(), MOPOP.user);

                try {
                    if (MOPOP.artefacts[mTrackableName].hasOwnProperty("bezGo")) {
                        var bezGo = MOPOP.artefacts[mTrackableName].bezGo;
                        MOPOP.artefacts[mTrackableName].bezGo = null;
                        RT.Unity.DestroyGO(bezGo);
                    }
                } catch (bezCheckErr) {
                    myconsolelog("MOPOP_TestDB Target ERROR bezCheckErr => " + bezCheckErr);
                }

                try {
                    //this was on
                    //MOPOP_UpdateHookOccupation();
                } catch (MP_UHO_err) {
                    myconsolelog("MOPOP_TestDB Target occupation ERROR => " + MP_UHO_err);
                }
            } else {
                $("#rr_mopop_bottom_info").html(mTrackableName + "NOT in artefacts");
            }


            /*RT.Web.SetTiimeout(5, function () {
                RT.Unity.SpawnNotification(5, "Found " + mTrackableName);
            });*/

            var go = MAIN.UE.GameObject.Find(goName);
            if (go == null) {

                go = new MAIN.UE.GameObject(goName);
                var url = MAIN.WEBAPI.uiurl + "/artefact.html";

                //go = MAIN.UE.GameObject.CreatePrimitive(3);
                //go.name = goName;

                var parent = MAIN.UE.GameObject.Find(mTrackedGoName);

                RT.Unity.SetParent(go, parent);
                RT.Unity.SetLocalPose(go, [0, 0, 0], [0, 0, 0, 1], [0.05, 0.05, 0.05]);


                var wu = RT.Unity.CreateWU(wuName, url, true, 1080, 1080);
                RT.Unity.SetParent(wu, go);
                RT.Unity.SetLocalPose(wu,
                    [0, 0, 0],
                    [1, 0, 0, 1],
                    [0.003, 0.003, 0.001] //was null
                );


                var jsonStr = JSON.stringify(artefactData);

                //test external init
                myconsolelog("before AttrComb_ExternalInitMe data2share => " + jsonStr);

                RT.Web.SetTiimeout(500, function () {
                    var tw = MAIN.PUI.WorldUI.Find(wuName);
                    if (tw != null) {
                        tw.document.Run("Artefact_ExternalInitMe", [jsonStr]);
                        tw.document.Run("Artefact_MakeMePicked", [""]);
                    } else {
                        myconsolelog("before TM tw NOT found for AttrComb_ExternalInitMe");
                    }
                });

                RT.Web.SetTiimeout(600, function () {
                    var PUI = importNamespace("PowerUI");
                    var tw = PUI.WorldUI.Find(wuName);
                    if (tw != null) {
                        tw.document.Run("Artefact_ExternalTrackingOn", ["some data"]);
                    } else {
                        myconsolelog("before TM tw NOT found for AttrComb_ExternalInitMe");
                    }
                });
            } else {
                RT.Web.SetTiimeout(5, function () {
                    var PUI = importNamespace("PowerUI");
                    var tw = PUI.WorldUI.Find(wuName);
                    if (tw != null) {
                        tw.document.Run("Artefact_ExternalTrackingOn", ["some data"]);
                    } else {
                        myconsolelog("before TM tw NOT found for AttrComb_ExternalInitMe");
                    }
                });
            }
            //MOPOP_CalcScore();
        },
        function (mTrackableName, mTrackedGoName) {
            var wuName = "UI" + mTrackableName;
            myconsolelog("MOPOP_TestDB Target Lost => " + mTrackableName + ", " + mTrackedGoName);

            //RT.Web.SetTiimeout(5, function () {
            //RT.Unity.SpawnNotification(5, "Lost " + mTrackableName);
            //});
            //PlayNotification();

            RT.Web.SetTiimeout(5, function () {
                var PUI = importNamespace("PowerUI");
                var tw = PUI.WorldUI.Find(wuName);
                if (tw != null) {
                    tw.document.Run("Artefact_ExternalTrackingOff", ["some data"]);
                } else {
                    myconsolelog("before TM tw NOT found for AttrComb_ExternalInitMe");
                }
            });
        },
        MAIN.location.envtargets.xml
    );
}

function MOPOP_MenuHide() {
    $('#rr_mopop_testing').hide();
    var go = MAIN.UE.GameObject.Find("SLIDER_mopop_main");
    if (go != null) {
        RT.Unity.DestroyGO(go);
    }
}

function MOPOP_MenuShow() {
    myconsolelog("MOPOP_MenuShow ...");
    $('#rr_mopop_testing').show();

    myconsolelog("MOPOP_MenuShow ... importing ... ");
    importNamespace("Vizario").AssetBundleHolder.ImportFromFile(
        MAIN.location.envassetbundle, MAIN.location.envassetbundle);

    myconsolelog("MOPOP_MenuShow ... importing ... done");

    //var mainUi = MAIN.UE.GameObject.Find("UI");
    var mainUi = MAIN.UE.GameObject.Find("Main");
    var mainScale = mainUi.transform.localScale;

    var iSx = 1 / mainScale.x;
    var iSy = 1 / mainScale.y;
    var iSz = 1 / mainScale.z;

    RT.Unity.SetupSlider("SLIDER_mopop_main", mainUi,
        [0.0, 0.0, -90.0],
        [0.12 * iSx, 0.03 * iSy, 0 * iSz],
        [0.2 * iSx, 0.4 * iSy, 0.4 * iSz],
        function (sliderGoName, oldVal, newVal) {
            var elem = document.getElementById("rr_mopop_top");
            var maxScroll = elem.scrollHeight * 2;
            var newPos = newVal * maxScroll;
            elem.scrollTop = newPos;
        }
    );
}

function MOPOP_ToggleWallManipulation() {
    var mopop = MAIN.location.data.mopop;
    if (mopop.hasOwnProperty("hookwalls")) {
        var N = mopop.hookwalls.length;
        myconsolelog("MOPOP_InitEnv #hookswals => " + N);
        for (var i = 0; i < N; i++) {
            var hw = mopop.hookwalls[i];
            var hGoName = "HW_" + hw.name;
            MAIN.RR.Runtime.ToggleObjManipulation(hGoName);
            MAIN.RR.Runtime.ToggleBounds(hGoName);
        }
    }
}

MOPOP.userevents = {
    "start": {
        "name": "start",
        "id": 0
    },
    "picked": {
        "name": "picked",
        "id": 1
    },
    "placed": {
        "name": "placed",
        "id": 2
    },
    "score": {
        "name": "score",
        "id": 3
    },
    "placedontable": {
        "name": "placedontable",
        "id": 4
    }
}

function MOPOP_ReportUserEvent(mEventObj, mDataObj, mEventtime, mUser) {

    try {
        var eventName = mEventObj.name;
        var eventId = mEventObj.id;
        var data = mDataObj;
        var eventTime = mEventtime;
        var thisUser = mUser;

        var reportObj = {
            "user": thisUser,
            "name": eventName,
            "id": eventId,
            "data": data,
            "time": eventTime
        }
        var reportStr = JSON.stringify(reportObj);
        RT.MQTT.Publish("MOPOP/userevents", reportStr);
    } catch (err) {
        myconsolelog("MOPOP_ReportUserEvent ERROR => " + err);
    }
}

function MOPOP_AutoStart() {
    RT.Web.SetTiimeout(8000, function () {
        MOPOP_InitEnv();
        RT.Web.SetTiimeout(2000, function () {
            MOPOP_TestDB();
            //<img src="http://localhost:9999/mopop/mopop.jpg" />

            //var murl = MAIN.WEBAPI.uiurl + "/mopop/mopop.jpg";
            //$("#rr_mopop_u_started").html('<img src="' + murl + '" width="100%"/>');
            //$("#rr_mopop_u_started").show();
        });
    });
}

function MOPOP_ImportAssets() {
    importNamespace("Vizario").AssetBundleHolder.ImportFromFile(
        MAIN.location.envassetbundle, MAIN.location.envassetbundle);
}