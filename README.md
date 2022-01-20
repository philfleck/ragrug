# About

### Docu
[Navigation](HtmlUI/docu/navigation.md)
[Docu](HtmlUI/docu/index.md)

Ones deploy Docu can be accessed under:

http://localhost:9999/docu/mdwiki-slim.html#!index.md



### Backend
The backend consist of several loosely couploed components: NodeRed, MQTT-Broker, CouchDb, InfluxDB, Postgres, Grafana and CAD-Parsers (FreeCad and Unity). Except the CAD-Parsers, all entities run as docker container and store their persistant data on a mount on the Host. The current version, can only run the CAD-Parsers and NodeRed from teh same Host.

Due to its complexity in what can happen and is happening, action and data wise, we want to ellaborate on some core concepts:

***MQTT-Topics*** follow a topological pattern, since generated data (in form of devices aka machines aka sensors aka sensors within machines) has an spatial origin. Questions to aks are: Which measurement? Which part of the machine? Which machine? Where is the machine? and so on. This results in a common layout:
```
telemetry/bulding/floor/room/device/part/skill
```

To further distinguish we add the prefix `telemetetry` to all measured and reported data. Due to the topic based concept of MQTT, every client can directly consume messages publish. By either subscribing to a specific topic or to an upper level one e.g. at device level, to receive all measurements of one device: `telemetry/building/floor/room/device/#`. `#` and `+` are MQTT [Wildcards](https://www.hivemq.com/blog/mqtt-essentials-part-5-mqtt-topics-best-practices/).

NodeRed acts as a core manager and data director. In some case it acts as an relay.

### ARClient

# TODOs
[x] add setup file

[x] setup install for node

[x] add to docker build

[x] fix grafana

[] add demo data, and demo tracking db, an assets

# Links

- [sample data couch-db](http://pleasefixme)
- [tracking db](trackingdb link)


# Setup procedure
### Backend
1. enter the backend folder and run from there
1. createDockerNet.sh
1. start.sh
1. Make sure that the created `mnt` (ragrugs/mnt) folder is writeable
1. setupMqtt.sh
1. setupNodeRed.sh
1. connect to couchdb, init and create database "world"
    - browser: http://localhost:5984/_utils
    - init single node
    - default login admin/123456
    - create database: "world"
      - no partioning
1. connect to NodeRed and verify
    - browser: http://localhost:1880
    - set couchdb user/pw in cloudant
    - init database
      - Go to the Flow "InitDatabases" (Top row tab) and press on the "timestamp" (left flap) left to the "create inffeld" node;
      - Error on the debug view should now disapper (right under the deploy button)
    - init postgres
      - run through the "timestamp" nodes conencted to the "postgres" node
1. connect to NodeRed ui
    - browser: http://localhost:1880/ui
    - you should see all the demo topics listed here
1. setupGrafana.sh
1. conenct to grafana
    - browser: http://localhost:3000
    - default login admin/admin
    - add datasource (configuration -> add datasource):
        - datasource-name(Casesensitive): "Inffeld"
        - db address: http://ragrug-influxdb:8086
        - database: inffeld
    - dashboards -> manage -> import
    - import from repo
      - backend/grafana/dashboards/dyndash_000.json
      - bunch of autogen graphs should have apeared
    - save the dashboard
1. check httpserver
    - http://localhost:9999
    - http://localhost:9999/main.html
        - this is also the entrypoint for the client

### ARCLient

1. download compiled client from arclient/builds/{}.html
1. install on H2 via device portal
1. copy and edit a client configuration
    - cfgs/config.json
    - adapt url according to your backend
    - this is the right point, if you are running in VM that it is reachable from other devices
      - same goes for wsl2 on w10
      - same goes for a dedicated machine or whaterver
1. run the app on the h2 which will fully install it onto the device
1. close the app
1. the localstate folder should be created and reachable
1. it is important that the app is closed! (maybe check within the device portal)
1. copy cfg to LocalApps/rr-vu...something..something/localstate
1. run the app, it should now load the ui and other infos from your infrastructure

##### config
The config looks like this and can be accessed from ui code. The only necessary parameter is
the `uiurl` which is accessed within the compiled `C#` part.

```
{
  "apiurl":"http://10.0.0.6:1880",
  "uiurl":"http://10.0.0.2:8080",
  "grafana_dashboard_url":"http://10.0.0.6:3000/api/dashboards/uid/Yq3Gat4Gk"
}

```

`apiurl` points to the node-red api, which is used for major interactions

`uiurl` points to the ui server, when using the included docker container, the port is `9999`

`grafana_dashboard_url` points to the dynmic dyndash, which when imported from the repo only the ip has to be changed


Note: first start will take a bit longer since all WAs have to be uploaded
works much faster on h2
[TODO] add feedback over progress here

### Adding sample device

### Run

# Components

### Backend
###### NodeRed


###### Mqtt-Broker

###### InfluxDb

###### CouchDB

###### Grafana
grafana last to setup
default admin/admin
default anonymous on

when container is up first time call setup grafana
sign in
add influx to the data
import dashboard from repo


# ARCLient
### Localization
The location (area) is identified using the SSID (in combination with BSSID/MAC in the future).  At app-start, the backed is queried using the SSID, and on success, the stored location is retrieved. Such data holds:

 * localization information like WorldAnchors
 * present devices
 * any additional information necessary (eg AssetsBundle, Bim?)

WorldAnchors are download and use for re-localization. If no anchors are present, the ARClient creates them new and adds them to the location.

Ones localized, the Location icon is turned green and a common worldorigin is show. From now, the ARClient operate within a common worldframe. Should the localization fail, it can be manually triggered by pressing on the Localize icon. Orange indicates localization in progress. (Note: Worldanchors generated on the H1 can be loaded on the H2.)

In my office, the localization takes up to 30-50 sec on the H2

Creating world anchors on H2, will create many more chunks compared to H1 (around 400), which are sequally uplaoded to the database (CouchDB). This might take a while (~2-3 Chunks per Second). This chunks are also cached on the disk, and are loaded from there on restart. Starting the app on an already localized area (the location is setup in the database, and has worldanchors) for the first time, all related world anchors chunks will be downloaded and used for localization. Followup starts will use the local cache.

### Loading devices
By pressing on devices, all present devices for the current location are downloaded. This process can be automated and e.g. dais chained after a successful localization.

A device might hold any of the following attributes, but also different ones:

- partlist
    - parts hold (active, position, name, parent, external urls, vis url, mqtt-topics)
e.g. if no mqtt topic given, a part will try to autogen the topic based on given infos and the topic-location-constraint(naming scheme for mqtt device realted data topics)
- is world registered?
    - if so, it will additionally hold its world-pose and sclae
        - location path
        - location key
- tracking database
- model scale
- model and device(instace) name

Processing the list of devices, each device (and its data) is downloaded. This could be swapped to on-time loading to reduce initial load. World registered devices (registered=true) are directly load into the world (device instantation). All other devices are prepared to be registered. Within the img:device_list
a green location checkmark shows registerd and a red exclamation mark shows not registered.

Pressing on the Register Button will trigger the registration mode, which is the same for registered and not registered devices. If a tracking-database is present, the automatic mode is triggered. Otherwise we fall back into manual mode.

If it was a registered device, it's instance will be used, if not a new model (without its parts and data) of the device is spawned.

Once the user is satiesfied with the registration, the state can be saved to store the actual pose. Afterwards the single device instantation starts.

##### Single Device Loading
A device consinst of its parts, its models and additional data stored. While the model is loaded from its AssetBundle, the ARClient starts processing the devices parts. A part will spawn a label, representing the part. The label will check for mqtt, visurl, exturl and other data on startup. E.g. if no mqtt topic is given, we can either autogen the topic or query the part-device-database (query not implemented yet) or parse the default grafana dashboard to extract a chart if no visurl was given.

Mesagges of subscribed topics are parsed and visualsize e.g. measured values. Such data is shown as value with its name, but also passed to visualizeation frameworks like u2vis. The current value of a data field allows to interact with the data e.g. switch shown dimensions of the visualization .
