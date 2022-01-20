# Setup Location
Within couchdb a location consists of at least one location document and a device document. We use the convention `{locationname}` for the location and `{locationname}-devices` for the device list.
There are two ways to add a location:

1. Once the ARCLient is within a new location, but it is not found, the location will be automatically added by the client with default values. Those can be changed at any time later.
2. We can also add the location defintion manually within couchdb

Sample Location:
```json
{
  "_id": "NETGEAR81-5G",
  "_rev": "55-d100e50f68240498a6f1fd3220883a39",
  "name": "NETGEAR81-5G",
  "type": "location",
  "numwabatches": 370,
  "waprefix": "NETGEAR81-5G-WA-",
  "envassetbundle": "mopop.ab",
  "imagetargetenv": [
    "rrenv.xml",
    "rrenv.dat"
  ]
}
```

Sample device list:
```json
{
  "_id": "NETGEAR81-5G-devices",
  "_rev": "8-214e26a4982cea753db1f2f6d85c45d9",
  "name": "NETGEAR81-5G-devices",
  "present": [
    "NETGEAR81-5G-littleserver",
    "NETGEAR81-5G-bigserver",
    "NETGEAR81-5G-bigserver2",
    "NETGEAR81-5G-thermometer",
    "NETGEAR81-5G-midi"
  ]
}
```

Sample Device:
```json
{
  "_id": "NETGEAR81-5G-midi",
  "_rev": "8-3b2a300f43fc5e86b9c14f3358a490e3",
  "Xmodelname": "midi",
  "devicename": "midi",
  "registered": true,
  "assetname": "midi.ab",
  "commonname": "midi",
  "locationkey": "NETGEAR81-5G",
  "locationpath": "inffeld16/2nd/id2068",
  "scale": 1,
  "id": "NETGEAR81-5G-midi",
  "parts": [{
      "name": "DemoPart",
      "position": [
        0.0593402295,
        0.00209352895,
        0.0061
      ],
      "parent": "root",
      "active": true
    }],
  "envtrackedname":"machine_mikro_2",
  "ondevicecontrols": {
    "controlurl": "http://10.0.0.2:9999/midi.html",
    "width": 1,
    "height": 1
  },
  "transform": {
    "position": [
      0.2739790201187134,
      -0.34729713201522827,
      0.4392329454421997
    ],
    "rotation": [
      0.19814874231815338,
      0.742375373840332,
      0.5748777985572815,
      -0.2813031077384949
    ],
    "scale": [
      1.0000001192092896,
      0.9999998807907104,
      1.0000001192092896
    ]
  }
}
```