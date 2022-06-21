/// 2021 By Philipp Fleck

var CNR = {};
CNR.baseapi = RT.Help.GetStringFromCfg("apiurl");

CNR.flowId = "f3784d00.40ef8";
CNR.testFlowUrl = CNR.baseapi + "/flow/" + CNR.flowId;

CNR.flow = {};
CNR.nodes = {};

CNR.clientFunctions = {};
CNR.clientNodeInitFunctions = {};

CNR.flowMemory = {};

//compatibility hook to support the flow namespace/context
var flow = {};
flow.setvalues = {};

flow.set = function (key, value) {
    flow.setvalues[key] = value;
};

flow.get = function (key) {
    return flow.setvalues[key];
}

function CNR_SubscribeToRedeploy() {
    var tTopic = "cnr/redeployflow";
    RT.MQTT.Subscribe(tTopic);
    RT.MQTT.RegisterCallbackTopic(
        function (topic, payload) {
            if (CNR.flowMemory.hasOwnProperty(payload)) {
                CNR_InitFromId(payload);
            }
        }, tTopic);
    console.log("CNR Subscribed to Redeploy");
}

function CNR_InitFromId(flowId) {
    CNR.flowId = flowId;
    CNR.testFlowUrl = CNR.baseapi + "/flow/" + CNR.flowId;
    CNR_Init();
}

/*function CNR_SubscribeToRedeploy() {
    var tTopic = "cnr/redeployflow";
    RT.MQTT.Subscribe(tTopic);
    RT.MQTT.RegisterCallbackTopic(
        function (topic, payload) {
            console.log("Flow redeployed: " + payload);
        }, tTopic);
    console.log("CNR Subscribed to Redeploy");
}*/

function CNR_Init() {
    var headers = ["content-type", "application/x-www-form-urlencoded"];
    var data = "";
    var url = CNR.testFlowUrl;
    
    RT.Web.SendWebReq("GET", url, headers, data,
        function (mError, mData) {
            console.log("CNR_Init WRQ mData=" + mData);
            CNR_ProcessFlow(mData);
        });
}

function CNR_GetMsgGuid() {
    function _p8(s) {
        var p = (Math.random().toString(16) + "000000000").substr(2, 8);
        return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}

function CNR_ProcessFlow(mPayload) {
    if (CNR.flowMemory.hasOwnProperty(CNR.flowId)) {
        var behavior = CNR.flowMemory[CNR.flowId].updateBehavior;
        // Behavior: 0 = Default, 1 = Always override, even if unchanged, 2 = Override only if changed
        if (CNR.flowMemory[CNR.flowId].jsonString.localeCompare(mPayload) == 0) {
            if (behavior == 2) {
                return;
            }
        }
        
        if (behavior != 0) {
            CNR_TeardownFlow();
        }
    }

    // Always re-init. If no update is desired this code is not reached.
    delete CNR.flowMemory[CNR.flowId];
    CNR.flowMemory[CNR.flowId] = {};
    CNR.flowMemory[CNR.flowId].inject = [];
    CNR.flowMemory[CNR.flowId].mqttIn = [];
    CNR.flowMemory[CNR.flowId].jsonString = mPayload;
    CNR.flowMemory[CNR.flowId].updateBehavior = 0;
    CNR.flowMemory[CNR.flowId].objects = [];
    CNR.flowMemory[CNR.flowId].buttonGroups = [];

    CNR.flow = JSON.parse(mPayload);
    var nodes = CNR.flow.nodes;

    console.log("CNR_ProcessFlow #nodes=" + nodes.length);
    for (var ni = 0; ni < nodes.length; ni++) {
        var n = nodes[ni];
        CNR_ProcessNode(n);
    }

    CNR_ResolveButtonGroups();
}

function CNR_TeardownFlow() {
    try {
        console.log("Performing Teardown on Existing Flow " + CNR.flowId);
        var memory = CNR.flowMemory[CNR.flowId];
        for (var i = 0; i < memory.inject.length; i++) {
            importNamespace("Vizario").VApp.jWeb.StopInterval(memory.inject[i]);
        }
        for (var i = 0; i < memory.mqttIn.length; i++) {
            RT.MQTT.UnregisterCallbackTopic(memory.mqttIn[i].index, memory.mqttIn[i].topic);
        }
        for (var i = 0; i < memory.objects.length; i++) {
            memory.objects[i].destroy();
        }
    }
    catch (err) {
        console.log("CNR_TeardownFlow ERROR => " + err);
    }
}

function CNR_CreateNode(mNode) {
    var node = {};
    node.id = mNode.id;
    node.type = mNode.type;
    node.name = mNode.name;
    node.func = null;
    node.wires = mNode.wires;
    node.active = mNode.active;

    node.warn = function (msg) {
        console.log("node.warn: " + msg);
    }

    node.error = function (msg) {
        console.log("node.error: " + msg);
    }

    node.send = function (msg) {
        this.emit(msg);
    }

    node.run = function (msg) {
        //console.log("CNR NODE " + this.id + "(" + this.type + ", " + this.name + ")" + " run(msg) => " + JSON.stringify(msg));
        if (this.func != null) {
            msg = this.func(msg, this);
        }

        //todo add array support here

        if (msg != null) {
            if (msg._msgid == "undefined") {
                msg._msgid = CNR_GetMsgGuid();
            }
            if (msg.payload == "undefined") {
                msg.payload = "";
            }

            this.emit(msg);
        }
    };

    //notify all connected nodes
    node.emit = function (msg) {
        //console.log("CNR NODE.emit " + this.id + "(" + this.type + ", " + this.name + ")" + " emit(msg) => " + JSON.stringify(msg));
        //console.log("CNR NODE.emit isArray = " + Array.isArray(msg) + ", " + msg.length);

        var isAr = Array.isArray(msg);

        var n = this;
        var wires = n.wires;
        for (var wi = 0; wi < wires.length; wi++) {
            var w = wires[wi];
            var amsg = null;

            if (!isAr) {
                amsg = msg;
            } else {
                if (wi < msg.length) {
                    amsg = msg[wi];
                }
            }

            if (amsg != null) {
                for (var wwi = 0; wwi < w.length; wwi++) {
                    var ww = w[wwi];
                    CNR.nodes[ww].run(JSON.parse(JSON.stringify(amsg))); // Create new message object to prevent cross-contamination when using multiple outputs
                }
            }
        }
    }


    //create inject node
    if (node.type == "inject") {
        node.once = mNode.once;
        node.onceDelay = mNode.onceDelay;
        node.payload = mNode.payload;
        node.payloadType = mNode.payloadType;


        if (mNode.repeat.length > 0) {
            node.repeat = parseFloat(mNode.repeat);
            if (node.repeat > 0) { //check units here
                node.func = function (msg) {
                    //TODO move that to func
                    //TODO support other payloads here
                    msg.payload = Date.now();
                    return msg;
                }

                var coroutine = RT.Web.SetInterval(100, 1000 * node.repeat, function () {
                    var msg = {};
                    msg._msgid = CNR_GetMsgGuid();
                    msg.payload = "";
                    node.run(msg);
                });

                CNR.flowMemory[CNR.flowId].inject.push(coroutine)
            }
        }

        if (node.once) {
            if (typeof node.onceDelay == "string") {
                node.onceDelay = parseFloat(node.onceDelay);
            }

            node.func = function (msg) {
                //TODO move that to func
                //TODO support other payloads here
                msg.payload = Date.now();
                return msg;
            }

            var coroutine = RT.Web.SetTiimeout(1000 * node.onceDelay, function () {
                var msg = {};
                msg._msgid = CNR_GetMsgGuid();
                msg.payload = "";
                node.run(msg);
            });

            CNR.flowMemory[CNR.flowId].inject.push(coroutine);
        }
    }

    //create debug node
    if (node.type == "debug") {
        node.complete = mNode.complete;
        node.func = function (msg) {
            if (this.active) {
                if (this.complete == "true") {
                    console.log("CNR debug " + node.id + "(" + node.name + "): " + JSON.stringify(msg));
                } else {
                    console.log("CNR debug " + node.id + "(" + node.name + "): " + JSON.stringify(msg[this.complete]));
                }
            }
        }
    }

    //create function node
    if (node.type == "function") {
        node.outputs = mNode.outputs;
        node.noerr = mNode.noerr;
        node.initialize = mNode.initialize; //TODO add support for this
        node.finalize = mNode.finalize; //TODO add support for this
        node.func = new Function("return " + "function (msg, node) {" + mNode.func + "}")();
    }

    //create mqtt in node
    if (node.type == "mqtt in") {
        node.topic = mNode.topic;
        node.datatype = mNode.datatype;
        node.broker = mNode.broker; //needed when having support for multiple clients
        node.qos = mNode.qos;

        var mqttData = {};
        mqttData.topic = node.topic;

        RT.MQTT.Subscribe(node.topic);
        mqttData.index = RT.MQTT.RegisterCallbackTopic(function (mTopic, mPayload) {
            var msg = {};
            msg._msgid = CNR_GetMsgGuid();
            msg.payload = mPayload;
            msg.topic = mTopic;
            node.run(msg);
        }, node.topic);

        CNR.flowMemory[CNR.flowId].mqttIn.push(mqttData);
    }

    //create mqtt out node
    if (node.type == "mqtt out") {
        node.topic = mNode.topic;
        node.qos = mNode.qos;
        node.retain = mNode.retain;
        node.broker = mNode.broker; //needed when having support for multiple clients
        node.func = function (msg, node) {
            var json = msg.payload;
            if (typeof json != "string") {
                json = JSON.stringify(msg.payload); //was only msg
            }

            var topic = node.topic;
            if (topic.length == 0) {
                if (msg.topic != "undefined") {
                    topic = msg.topic;
                }
            }
            RT.MQTT.Publish(topic, json);
        };
    }

    if (node.type == "http request") {
        node.url = mNode.url;
        node.method = mNode.method;
        node.ret = mNode.ret; // txt, bin, obj
        node.paytoqs = mNode.paytoqs; // ignore, query, body
        node.func = function (msg, node) {
            var url = node.url;
            if (url.length === 0) {
                if (msg.hasOwnProperty("url")) {
                    url = msg.url;
                }
                else {
                    console.log("CNR ERROR: neither http request node " + mNode.id + " nor message have url.")
                }
            }
            var method = node.method;
            if (method === "use") {
                if (msg.hasOwnProperty("method")) {
                    method = msg.method;
                } else {
                    console.log("CNR ERROR: http request node " + mNode.id + " is set to use method of message, but message has no method.");
                }
            }
            var payload = "";
            if (node.paytoqs === "body") {
                if (msg.hasOwnProperty("payload")) {
                    payload = msg.payload;
                } else {
                    console.log("CNR ERROR: http request node " + mNode.id + " is set to use msg payload, but msg has no payload.")
                }
            }
            var headers = msg.hasOwnProperty("headers") ? msg.headers : [];
            RT.Web.SendWebReq(method, url, headers, payload,
                function (mError, mData) {
                    var resultMsg = {};
                    if (node.ret === "obj") {
                        try {
                            resultMsg.payload = JSON.parse(mData);
                        } catch (e) {
                            resultMsg.payload = mData;
                        }
                    } else {
                        resultMsg.payload = mData;
                    }
                    resultMsg.statusCode = mError;
                    node.emit(resultMsg);
                });
        }
    }

    //create button node
    if (node.type == "ui_button") {
        var name = "UIBTN-" + mNode.label;
        var msg = {};
        msg[mNode.topic] = mNode.payload;
        var button = RT.MRTK.SpawnButton(name, mNode.label, mNode.label, false, function () { node.emit(msg) });
        var pos = [MAIN.camHookGo.transform.position.x, MAIN.camHookGo.transform.position.y, MAIN.camHookGo.transform.position.z];
        RT.Unity.SetPose(button.go, pos, null, null);
        MAIN.RR.Runtime.ToggleObjManipulation(name);
        button.destroy = function () {
            RT.Unity.DestroyGO(button.go);
        }
        node.button = button;
        CNR.flowMemory[CNR.flowId].objects.push(button);
    }

    //create button group node
    if (node.type == "mrtk-button-group") {
        var name = "BTNGRP-" + mNode.name;
        var prefab = "NearMenu" + mNode.layout;
        var group = RT.MRTK.SpawnNearMenu(name, prefab);
        node.buttonGroup = group;
        var pos = [MAIN.camHookGo.transform.position.x, MAIN.camHookGo.transform.position.y, MAIN.camHookGo.transform.position.z];
        RT.Unity.SetPose(group.go, pos, null, null);
        group.destroy = function () {
            RT.Unity.DestroyGO(group.go);
        }
        CNR.flowMemory[CNR.flowId].objects.push(group);
        CNR.flowMemory[CNR.flowId].buttonGroups.push(node);
    }

    //create node with client function
    if (mNode.hasOwnProperty("clientFunction")) {
        node.outputs = mNode.outputs;
        node.noerr = mNode.noerr;
        node.func = CNR_GetClientFunction(mNode.clientFunction);
        node = CNR_InitializeClientNode(node, mNode);
    }

    if (mNode.hasOwnProperty("CNRUpdateBehavior")) {
        CNR.flowMemory[CNR.flowId].updateBehavior = parseInt(mNode.CNRUpdateBehavior);
    }

    return node;
}

function CNR_ProcessNode(mNode) {
    var node = CNR_CreateNode(mNode);
    CNR.nodes[node.id] = node;
}

function CNR_InitializeClientNode(node, mNode) {
    try {
        if (CNR.clientNodeInitFunctions.hasOwnProperty(mNode.clientFunction)) {
            return CNR.clientNodeInitFunctions[mNode.clientFunction](node, mNode);
        }

        return node;
    }
    catch (err) {
        console.log("internal_NRInitializeNode ERROR => " + err);
        return node;
    }

}

function CNR_GetClientFunction(clientFunctionString) {
    try {
        if (CNR.clientFunctions.hasOwnProperty(clientFunctionString)) {
            return CNR.clientFunctions[clientFunctionString];
        }

        console.log("internal_NRGetNodeFunction ERROR => Requested client function \"" + clientFunctionString + "\" does not exist. Assigning passthrough function.");
        return function (msg, node) { return msg; };
    }
    catch (err) {
        console.log("internal_NRGetNodeFunction ERROR => " + err);
        return function (msg, node) { return msg; };
    }
}


function CNR_ResolveButtonGroups() {
    var memory = CNR.flowMemory[CNR.flowId];
    for (var i = 0; i < memory.buttonGroups.length; i++) {
        var group = memory.buttonGroups[i];
        for (var j = 0; j < group.wires.length; j++) {
            var wire = group.wires[i];
            for (var k = 0; k < wire.length; k++) {
                var buttonGo = CNR.nodes[wire[k]].button.go;
                group.buttonGroup.fctAddButton(buttonGo);
                MAIN.RR.Runtime.ToggleObjManipulation(buttonGo.name);
            }
        }
    }
}

RT.Web.SetTiimeout(3500, function () {
    CNR_SubscribeToRedeploy();
});

/// msg
/*
{
    "_msgid" : "1734ef69.33ee21",
    "payload" : ...
}
*/

/// Sample Flow
/*
{
   "id":"f3784d00.40ef8",
   "label":"clientside",
   "disabled":false,
   "info":"",
   "nodes":[
      {
         "id":"e62175de.3dcd28",
         "type":"inject",
         "z":"f3784d00.40ef8",
         "name":"",
         "props":[
            {
               "p":"payload"
            },
            {
               "p":"topic",
               "vt":"str"
            }
         ],
         "repeat":"",
         "crontab":"",
         "once":false,
         "onceDelay":0.1,
         "topic":"",
         "payload":"",
         "payloadType":"date",
         "x":330,
         "y":200,
         "wires":[
            [
               "21cc6aca.100ac6"
            ]
         ]
      },
      {
         "id":"21cc6aca.100ac6",
         "type":"function",
         "z":"f3784d00.40ef8",
         "name":"",
         "func":"msg.val1 = \"val1\";\nreturn msg;",
         "outputs":1,
         "noerr":0,
         "initialize":"",
         "finalize":"",
         "x":560,
         "y":200,
         "wires":[
            [
               "473983f5.2a3cdc"
            ]
         ]
      },
      {
         "id":"473983f5.2a3cdc",
         "type":"debug",
         "z":"f3784d00.40ef8",
         "name":"",
         "active":true,
         "tosidebar":true,
         "console":false,
         "tostatus":false,
         "complete":"false",
         "statusVal":"",
         "statusType":"auto",
         "x":800,
         "y":200,
         "wires":[

         ]
      }
   ]
}
*/
