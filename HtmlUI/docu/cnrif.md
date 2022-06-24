#CNRIF API Documentation

This is the documentation of the JavaScript API, which is available to Node-RED function nodes deployed on the ARClient. It can be accessed using the `CNRIF` pseudo-namespace, which contains methods to interface with IATK and representations of IATK and Unity enums. Note that a lot of this functionality present [RagRug Node-RED package](https://flows.nodered.org/node/@ragrug/ragrug-nodered), which provides nodes that act as easy-to-use wrappers around CNRIF.

###Value Objects
|Name|Values|Description|
|-----|-----|-----|
|`CNRIF.MeshTopology`|`Triangles`, `Quads`, `Lines`, `LineStrip`, `Points`|Representation of the `UnityEngine.MeshTopology` Enum|
|`CNRIF.GeometryType`|`Undefined`, `Points`, `Lines`, `Quads`, `LinesAndDots`, `Cubes`, `Bars`, `Spheres`|Representation of the `AbstractVisualization.GeometryType` Enum|
|`CNRIF.DataType`|`Undefined`, `Float`, `Int`, `Bool`, `String`, `Date`, `Time`, `Graph`|Representation of the `IATK.DataTypes.DataType` Enum|
|`CNRIF.ViewAttribute`|`Size`, `MinSize`, `MaxSize`, `MinNormX`, `MaxNormX`, `MinNormY`, `MaxNormY`, `MinNormZ`, `MaxNormZ`, `MinX`, `MaxX`, `MinY`, `MaxY`, `MinZ`, `MaxZ`, `BlendingDestinationMode`, `BlendingSourceMode`|Representations of View Attributes for code clarity|
|`CNRIF.ViewData`|`VertexId`, `Size`, `Filter`, `Color`, `XPosition`, `YPosition`, `ZPosition`, `Indices`|Representation of View Data Fields for code clarity|
|`CNRIF.DataContext`|`StrVal`, `StrStr`, `IdxVal`, `IdxStr`|Which method of data insertion to use for a Realtime Data Source|

###Methods in `CNRIF.VB`
Methods relating to the IATK ViewBuilder.
<!--`` (``): <br>-->
<!--View Container, ViewData Format, Axes Format-->

|Name|Parameters|Description|
|-----|-----|-----|
|`CreateViewBuilder`|`vbName` (`string`): GUID given to ViewBuilder and to-be-created View<br>`topology` (`string`): Value from `CNRIF.MeshTopology` <br>`geometry` (`number`): Value from `CNRIF.GeometryType`|Creates a ViewBuilder object|
|`InitializeDataView`|`vbName` (`string`): GUID of target ViewBuilder<br>`pointCount` (`number`): Data buffer size |Initializes the ViewBuilder's data|
|`CreateView`|`vbName` (`string`): GUID of target ViewBuilder|Creates a View, destroys the ViewBuilder|

###Methods in `CNRIF.View`
Methods relating to IATK Views and View Axes.

|Name|Parameters|Description|
|-----|-----|-----|
|`Get`|`viewName` (`string`): GUID of target View<br>`caller` (`string`): Arbitrary string for logging purposes<br>Returns `object`: The container holding the View|Retrieves a View container|
|`Show`|`viewName` (`string`): GUID of target View<br>`show` (`boolean`): true = show, false = hide|Hides or shows a View|
|`SetData`|`viewName` (`string`): GUID of target View<br>`type` (`number`): Value from `CNRIF.ViewData`<br>`data` (`any`): Data to be written<br>|Writes data to one of the View's data fields|
|`SetAttribute`|`viewName` (`string`): GUID of target View<br>`attribute` (`number`): Value from `CNRIF.ViewAttribute`<br>`value` (`number`): Value to set|Sets one of the View's attributes|
|`GetAttribute`|`viewName` (`string`): GUID of target View<br>`attribute` (`number`): Value from `CNRIF.ViewAttribute`|Retrieves one of the View's attributes|
|`TweenPosition`|`viewName` (`string`): GUID of target View<br>|Sets the main texture of the View's render material|
|`TweenSize`|`viewName` (`string`): GUID of target View<br>|Sets a View's TweenPosition flag|
|`SetMainTexture`|`viewName` (`string`): GUID of target View<br>`texture` (`UnityEngine.Texture`): Source texture|Sets a View's TweenSize flag|
|`GetPositions`|`viewName` (`string`): GUID of target View<br>Returns `number[3][]`: List of Vector3 representations|Retrieves a View's positions|
|`GetColors`|`viewName` (`string`): GUID of target View<br>Returns `number[4][]` List of Color representations: |Retrieves a View's colors|
|`GetFilter`|`viewName` (`string`): GUID of target View<br>Returns `number[]` List of values|Retrieves a View's filter channel|
|`Destroy`|`viewName` (`string`): GUID of target View<br>|Destroys a View|
|`AddAxes`|`viewName` (`string`): GUID of target View<br>`axes` (`string[]`): List of Axis definition strings|Adds one or more axes to a View|
|`SetAxisData`|`viewName` (`string`): GUID of target View<br>`dataName` (`string`): Name of to-be-linked Realtime Data Source<br>`axes` (`string[]`): List of axis definition strings<br>`dimension` (`string`): To-be-linked data dimension|Links a Realtime Data Source to one or more axes|
|`ShowAxis`|`viewName` (`string`): GUID of target View<br>`axes` (`string[]`): List of Axis definition strings<br>`show` (`boolean`): true = show, false = hide|Hides or shows one or more axes|
|`SetAxisLength`|`viewName` (`string`): GUID of target View<br>`axes` (`string[]`): List of Axis definition strings<br>`newLength` (`number`): New axis length|Sets the length of one or more axes|
|`SetAxisTickSpacing`|`viewName` (`string`): GUID of target View<br>`axes` (`string[]`): List of Axis definition strings<br>`newSpacing` (`number`): New tick spacing|Sets the tick spacing of one or more axes|
|`SetAxisOffset`|`viewName` (`string`): GUID of target View<br>`axes` (`string[]`): List of Axis definition strings<br>`newOffset` (`number`): New offset|Sets the offset of one or more axes|
|`UpdateAxis`|`viewName` (`string`): GUID of target View<br>`axes` (`string[]`): List of Axis definition strings|Updates the axis tick labels of one or more axes|
|`DestroyAxis`|`viewName` (`string`): GUID of target View<br>`axes` (`string[]`): List of Axis definition strings|Destroys one or more axes|

####View Containers
View containers are JavaScript objects that always contain a `view` member, which references the View script assocated with that view. The object may also contain up to twelve references to Axis scripts.

####View Data Format
When setting View data, the expected input depends on which field is being set.
For the values `VertexId`, `Size`, `Filter`, `XPosition`, `YPosition`, `ZPosition`, a list of numbers is expected.
For `Colors`, a list of lists is expected with each inner list holding four values corresponding to the RGBA of the color.
For `Indices`, the following data structure must be passed: `{isLinking: [true|false], data: [...]}`. If `isLinking` is true, the `data` field should contain a list of length equal to the View's point count. This list should be filled with identifiers, if two consecutive points have the same identifier, they are linked. If `islinking` is false, the list can be of arbitrary length, but must contain pairs of point indices, each pair representing a line between points.

####Axis Format
The `axes` list in the relevant methods contains string identifiers for all targeted axes. Each identifier consists of two parts, the first is the primary direction, which can be x, y or z. The second part encodes where the axis is located, possible values are: r for right, u for up, b for back. Using combinations of up to two of these values it is possible to address all twelve edges of a View's bounding cube. For example `x` is the primary X axis, `x_ub` is the upper-back X axis.

###Methods in `CNRIF.RTDS`
Methods relating to the Realtime Data Source.

|Name|Parameters|Description|
|-----|-----|-----|
|`Create`|`dataName` (`string`): GUID of created Realtime Data Source<br>`dimensionSize` (`number`): Buffer size for dimensions|Creates a Realtime Data Source|
|`AddDimension`|`dataName` (`string`): GUID of target Realtime Data Source<br>`dimensionName` (`string`): Name of the to-be-created dimension<br>`min` (`number`): Lower normalization bound<br>`max` (`number`): Upper normalization bound<br>`dataType` (`number`): Value of `CNRIF.DataType`|Adds a numeric dimension to a Realtime Data Source|
|`AddDimensionDiscrete`|`dataName` (`string`): GUID of target Realtime Data Source<br>`dimensionName` (`string`): Name of the to-be-created dimension|Adds a string dimension to a Realtime Data Source|
|`SetData`|`dataName` (`string`): GUID of target Realtime Data Source<br>`dimension` (`string`): Name of target dimension<br>`value` (`any`): Value to add<br>`context` (`number`): Value of `CNRIF.DataContext`, only `StrVal` and `StrStr` supported|Adds a value to a Realtime Data Source|
|`GetData`|`dataName` (`string`): GUID of target Realtime Data Source<br>`dimension` (`string`): Name of target dimension<br>`isString` (`boolean`): If true, attempts to retrieve string values<br>Returns `any[]`: List of retrieved values|Retrieves all data of a Realtime Data Source dimension|
|`SetShiftData`|`dataName` (`string`): GUID of target Realtime Data Source<br>`value` (`boolean`): true = shift, false = override|Sets the shift mode of a Realtime Data Source|
|`GetShiftData`|`dataName` (`string`): GUID of target Realtime Data Source<br>Returns `boolean`: Current shiftData value|Retrieves the shift mode of a Realtime Data Source|
|`Destroy`|`dataName` (`string`): GUID of target Realtime Data Source<br>|Destroys a Realtime Data Source|
