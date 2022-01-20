# Add Vuforia Tracking to Device/Location
Depending on the application, we can add vuforia tracking database as a known key within the device / or location definition in couchdb or create
an arbitrary key, which can later be used.

Adding `imagetargetenv` to the location, to be loaded at startup when unsing the RR-Runtime:
```json
"imagetargetenv": [
    "rrenv.xml",
    "rrenv.dat"
  ]
```
The order is important, the xml goes first.
Within `main.js` it will end up here:

```js
if (data.hasOwnProperty("imagetargetenv")) {
    var envTargets = data.imagetargetenv;
    MAIN.location.envtargets = {
        "xml": envTargets[0],
        "dat": envTargets[1]
    };
}
```

And is loaded by `MAIN_RREnvOnTrackingLost` which will use the callbacks `MAIN_RREnvOnTracked` for tracked and `MAIN_RREnvOnTrackingLost` for tracking lost:
```js
function MAIN_StartRREnvTracking() {

    var reqHeaders = ["content-type", "application/x-www-form-urlencoded"];
    var url = MAIN.WEBAPI.apiBase + "/getfile2?name=";

    var urlA = url + MAIN.location.envtargets.xml;
    RT.Web.DownloadFile("GET", urlA, reqHeaders, MAIN.location.envtargets.xml, false, function () {
        console.log("MAIN_StartRREnvTracking downloaded => " + MAIN.location.envtargets.xml);
    });

    var urlB = url + MAIN.location.envtargets.dat;
    RT.Web.DownloadFile("GET", urlB, reqHeaders, MAIN.location.envtargets.dat, false, function () {
        console.log("MAIN_StartRREnvTracking downloaded => " + MAIN.location.envtargets.dat);
    });

    // Start tracking
    importNamespace("RR").Runtime.StartImgTracking(
        MAIN_RREnvOnTracked, MAIN_RREnvOnTrackingLost, MAIN.location.envtargets.xml);

    MAIN_RREnvStartPosUpdater();
}
```


On device level, you can add a `trackingdb`, which can also be a 3D Target
```json
"trackingdb": [
    "rockpro64_clean_centered_scaled.xml",
    "rockpro64_clean_centered_scaled.dat"
  ]
```