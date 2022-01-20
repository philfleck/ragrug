/// 2021 By Philipp Fleck

var CNR = {};
CNR.baseapi = RT.Help.GetStringFromCfg("apiurl");

CNR.flowId = "f3784d00.40ef8";
CNR.testFlowUrl = CNR.baseapi + "/flow/" + CNR.flowId;

CNR.flow = {};
CNR.nodes = {};

//compatibility hook to support the flow namespace/context
var flow = {};
flow.setvalues = {};

flow.set = function (key, value) {
    flow.setvalues[key] = value;
};

flow.get = function (key) {
    return flow.setvalues[key];
}

function CNR_InitFromId(flowId) {
    CNR.flowId = flowId;
    CNR.testFlowUrl = CNR.baseapi + "/flow/" + CNR.flowId;
    CNR_Init();
}

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
    CNR.flow = JSON.parse(mPayload);

    var id = CNR.flow.id;
    var label = CNR.flow.label;
    var disabled = CNR.flow.disabled;
    var info = CNR.flow.info;

    var nodes = CNR.flow.nodes;

    console.log("CNR_ProcessFlow #nodes=" + nodes.length);

    for (var ni = 0; ni < nodes.length; ni++) {
        var n = nodes[ni];
        CNR_ProcessNode(n);
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
                    CNR.nodes[ww].run(amsg);
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

                RT.Web.SetInterval(100, 1000 * node.repeat, function () {
                    var msg = {};
                    msg._msgid = CNR_GetMsgGuid();
                    msg.payload = "";
                    node.run(msg);
                });
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

            RT.Web.SetTiimeout(1000 * node.onceDelay, function () {
                var msg = {};
                msg._msgid = CNR_GetMsgGuid();
                msg.payload = "";
                node.run(msg);
            });

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

        RT.MQTT.Subscribe(node.topic);
        RT.MQTT.RegisterCallbackTopic(function (mTopic, mPayload) {
            var msg = {};
            msg._msgid = CNR_GetMsgGuid();
            msg.payload = mPayload;
            msg.topic = mTopic;
            node.run(msg);
        }, node.topic);
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
    return node;
}

function CNR_ProcessNode(mNode) {
    var node = CNR_CreateNode(mNode);
    CNR.nodes[node.id] = node;
}


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