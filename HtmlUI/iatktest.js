//UnityEngine.MeshTopology
//Triangles = 0
//Quads = 2
//Lines = 3
//LineStrip = 4
//Points = 5

function IATKTest_ViewBuilder() {
    //IATKTest_ViewBuilder_Dots();
    //IATKTest_ViewBuilder_Lines();
    //IATKTest_UseVBIntegration_Dots();
    //IATKTest_UseVBIntegration_Lines();
    IATKTest_UseVBIntegration_LinesViewInit();
    //IATKTest_StackedLines();
    //IATKTest_StackedLineBars();
    //IATKTest_Quads();
    IATKTest_CreateRTDS();
    IATKTest_CreateAxis();
}

function IATKTest_View() {
    //IATKTest_ViewIntegrationUpdate();
    //IATKTest_ViewIntegrationUpdateIndices();
    //IATKTest_ViewIntegrationColorCycle();
    //IATKTest_ViewIntegrationTexture();
}

function IATKTest_ViewBuilder_Dots() {
    try {
        var UE = importNamespace("UnityEngine");
        var IATK = importNamespace("IATK");

        var vb = new IATK.ViewBuilder(5, "Dots Test View"); // Points
        var mat = IATK.IATKUtil.GetMaterialFromTopology(1); // Points

        vb.initialiseDataView(4)
            .setDataDimension([0, 0, 1, 2], 0) // X
            .setDataDimension([0, 1, 0, 1], 1) // Y
            .setDataDimension([1, 0, 1, 0], 2) // Z
            .setColors([new UE.Color(1, 0, 0), new UE.Color(0, 1, 0), new UE.Color(0, 0, 1), new UE.Color(1, 0, 1)]);

        var testGO = new UE.GameObject("Test Game Object");
        vb.updateView();
        var view = vb.apply(testGO, mat);
        view.SetMaxX(2);

        RT.Unity.SetLocalPose(view.gameObject,
            [0, 0, 0],
            [0, 0, 0, 1],
            [1, 1, 1]
        )
    }
    catch (err) {
        console.log("IATKTest_ViewBuilder_Dots Error => " + err)
    }
}

function IATKTest_ViewBuilder_Lines() {
    try {
        var UE = importNamespace("UnityEngine");
        var IATK = importNamespace("IATK");

        var vb = new IATK.ViewBuilder(3, "Lines Test View"); // Lines
        var mat = IATK.IATKUtil.GetMaterialFromTopology(2); // Lines
        mat.SetFloat("_MinSize", 0.01);
        mat.SetFloat("_MaxSize", 1);

        vb.initialiseDataView(4)
            .setDataDimension([0, 0, 1, 2], 0) // X
            .setDataDimension([0, 1, 0, 1], 1) // Y
            .setDataDimension([1, 0, 1, 0], 2) // Z
            .createIndicesConnectedLineTopology([0, 0, 0, 0])
            .setColors([new UE.Color(1, 0, 0), new UE.Color(0, 1, 0), new UE.Color(0, 0, 1), new UE.Color(1, 0, 1)]);

        var testGO = new UE.GameObject("Test Game Object");
        vb.updateView();
        var view = vb.apply(testGO, mat);
        view.SetMaxX(2);

        RT.Unity.SetLocalPose(view.gameObject,
            [0, 0, 0],
            [0, 0, 0, 1],
            [1, 1, 1]
        )
    }
    catch (err) {
        console.log("IATKTest_ViewBuilder_Lines Error => " + err)
    }
}

function IATKTest_UpdateView() {
    try {
        var UE = importNamespace("UnityEngine");
        var IATK = importNamespace("IATK");
        var view = UE.GameObject.Find("Lines Test View").GetComponentInChildren(IATK.View);
        view.UpdateXPositions([0, 0, 2, 1]);
        view.UpdateYPositions([0, 1, 0, 1]);
        view.UpdateZPositions([1, 0, 1, 0]);
        view.SetColors([new UE.Color(1, 1, 0), new UE.Color(0, 1, 1), new UE.Color(1, 0, 1), new UE.Color(1, 1, 1)]);
    }
    catch (err) {
        console.log("IATKTest_UpdateView Error => " + err)
    }
}

function IATKTest_UseVBIntegration_Dots() {
    var name = "Integration Test View Dots";
    CNRIF.VB.CreateViewBuilder(name, CNRIF.MeshTopology.Points, CNRIF.GeometryType.Points);
    CNRIF.VB.InitializeDataView(name, 4);
    CNRIF.VB.SetSpatialDimension(name, 0, [1, 1, 0, 0]);
    CNRIF.VB.SetSpatialDimension(name, 1, [1, 0, 0, 1]);
    CNRIF.VB.SetSpatialDimension(name, 2, [1, 0, 1, 0]);
    CNRIF.VB.SetColors(name, [[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1]])
    CNRIF.VB.CreateView(name);
}

function IATKTest_UseVBIntegration_Lines() {
    var name = "Integration Test View Lines";
    CNRIF.VB.CreateViewBuilder(name, CNRIF.MeshTopology.Lines, CNRIF.GeometryType.Lines);
    CNRIF.VB.InitializeDataView(name, 4);
    CNRIF.VB.SetSpatialDimension(name, 0, [2, 2, 0, 0]);
    CNRIF.VB.SetSpatialDimension(name, 1, [1, 0, 0, 1]);
    CNRIF.VB.SetSpatialDimension(name, 2, [1, 0, 1, 0]);
    CNRIF.VB.SetColors(name, [[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1]])
    //IF.VB.SetSizes(name, [0.1, 0.2, 0.3, 0.4]);
    CNRIF.VB.SetLinkingField(name, [0, 0, 0, 0]);
    CNRIF.VB.CreateView(name);
    CNRIF.View.SetAttribute(name, CNRIF.ViewAttribute.MaxX, 2);
}

function IATKTest_UseVBIntegration_LinesViewInit() {
    var name = "Integration Test View Lines";
    CNRIF.VB.CreateViewBuilder(name, CNRIF.MeshTopology.Lines, CNRIF.GeometryType.Lines);
    CNRIF.VB.InitializeDataView(name, 4);
    CNRIF.VB.CreateView(name);
    CNRIF.View.SetData(name, CNRIF.ViewData.Indices, { isLinking: false, data: [0, 1, 0, 2, 0, 3, 1, 2, 1, 3, 2, 3] });
    CNRIF.View.SetData(name, CNRIF.ViewData.XPosition, [2, 2, 0, 0]);
    CNRIF.View.SetData(name, CNRIF.ViewData.YPosition, [1, 0, 0, 1]);
    CNRIF.View.SetData(name, CNRIF.ViewData.ZPosition, [1, 0, 1, 0]);
    CNRIF.View.SetData(name, CNRIF.ViewData.Color, [[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1]]);
    CNRIF.View.SetAttribute(name, CNRIF.ViewAttribute.MaxX, 2);
}

function IATKTest_ViewIntegrationUpdate() {
    var name = "Integration Test View Lines";
    CNRIF.View.SetData(name, CNRIF.ViewData.XPosition, [1, 1, 0, 0]);
}

function IATKTest_ViewIntegrationUpdateIndices() {
    var name = "Integration Test View Lines";
    CNRIF.View.SetData(name, CNRIF.ViewData.Indices, { isLinking: false, data: [0, 1, 0, 2, 0, 3] }); // Not the same as linking field, this allows for n-n links
}

function IATKTest_ViewIntegrationColorCycle() {
    var name = "Integration Test View Lines";

    try {
        var colors = CNRIF.View.GetColors(name);
        var newColors = [];
        newColors.push(colors[colors.length - 1]);

        for (let i = 0; i < colors.length - 1; i++) {
            newColors.push(colors[i]);
        }
        CNRIF.View.SetData(name, CNRIF.ViewData.Color, newColors);
    }
    catch (err) {
        console.log("IATKTest_ViewIntegrationColorCycle ERROR => " + err);
    }
}

function IATKTest_ViewIntegrationTexture() {
    var name = "Integration Test View Dots";

    try {
        var texture = new RT.UE.Texture2D(2, 2);
        texture.filterMode = RT.UE.FilterMode.Point;
        texture.SetPixel(0, 0, new RT.UE.Color(1, 1, 1, 1));
        texture.SetPixel(1, 1, new RT.UE.Color(1, 1, 1, 1));
        texture.SetPixel(1, 0, new RT.UE.Color(0, 0, 0, 1));
        texture.SetPixel(0, 1, new RT.UE.Color(0, 0, 0, 1));
        texture.Apply();
        CNRIF.View.SetMainTexture(name, texture);
    }
    catch (err) {
        console.log("IATKTest_ViewIntegrationTexture ERROR => " + err);
    }   
}

function IATKTest_StackedLines() {
    var name = "Stacked Lines";

    try {
        CNRIF.VB.CreateViewBuilder(name, CNRIF.MeshTopology.Lines, CNRIF.GeometryType.Lines);
        CNRIF.VB.InitializeDataView(name, 12);
        CNRIF.VB.SetSpatialDimension(name, 0, [0, 0.333, 0.666, 1, 0, 0.333, 0.666, 1, 0, 0.333, 0.666, 1]);
        CNRIF.VB.SetSpatialDimension(name, 1, [0, 0.2, 0.3, 0.1, 0, 0.3, 0.4, 0.2, 0, 0.5, 0.7, 0.8]);
        CNRIF.VB.SetSpatialDimension(name, 2, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
        CNRIF.VB.SetColors(name, [[1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1]]);
        //IF.VB.SetSizes(name, [0.1, 0.2, 0.3, 0.4]);
        CNRIF.VB.SetLinkingField(name, [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2]);
        CNRIF.VB.CreateView(name);
    }
    catch (err) {
        console.log("IATKTest_StackedLines ERROR => " + err);
    }
}

// Works in theory but it has artefacts between the line segments.
function IATKTest_StackedLineBars() {
    var name = "Stacked Lines";

    try {
        CNRIF.VB.CreateViewBuilder(name, CNRIF.MeshTopology.Lines, CNRIF.GeometryType.Lines);
        CNRIF.VB.InitializeDataView(name, 18);
        CNRIF.VB.SetSpatialDimension(name, 0, [0, 0, 0, 0, 0, 0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1, 1, 1, 1, 1, 1]);
        CNRIF.VB.SetSpatialDimension(name, 1, [0, 0.2, 0.2, 0.5, 0.5, 0.6, 0, 0.4, 0.4, 0.7, 0.7, 1, 0, 0.3, 0.3, 0.5, 0.5, 0.7]);
        CNRIF.VB.SetSpatialDimension(name, 2, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
        CNRIF.VB.SetColors(name, [[1, 0, 0], [1, 0, 0], [0, 1, 0], [0, 1, 0], [0, 0, 1], [0, 0, 1], [1, 0, 0], [1, 0, 0], [0, 1, 0], [0, 1, 0], [0, 0, 1], [0, 0, 1], [1, 0, 0], [1, 0, 0], [0, 1, 0], [0, 1, 0], [0, 0, 1], [0, 0, 1]]);
        CNRIF.VB.SetSizes(name, [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]);
        CNRIF.VB.SetLinkingField(name, [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8]);
        CNRIF.VB.CreateView(name);
    }
    catch (err) {
        console.log("IATKTest_StackedLines ERROR => " + err);
    }
}

function IATKTest_Quads() {
    var name = "Integration Test View Dots";
    
    try {
        CNRIF.VB.CreateViewBuilder(name, CNRIF.MeshTopology.Points, CNRIF.GeometryType.Quads);
        CNRIF.VB.InitializeDataView(name, 4);
        CNRIF.VB.SetSpatialDimension(name, 0, [1, 1, 0, 0]);
        CNRIF.VB.SetSpatialDimension(name, 1, [1, 0, 0, 1]);
        CNRIF.VB.SetSpatialDimension(name, 2, [1, 0, 1, 0]);
        CNRIF.VB.SetColors(name, [[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1]])
        CNRIF.VB.CreateView(name);
    }
    catch (err) {
        console.log("IATKTest_Quads ERROR => " + err);
    }
}

function IATKTest_CreateRTDS() {
    var dataName = "Test Data Source";
    CNRIF.RTDS.Create(dataName, 4);
    CNRIF.RTDS.AddDimension(dataName, "Dim1", 0, 4, CNRIF.DataType.Float);
    for (var i = 0; i < 4; i++) {
        CNRIF.RTDS.SetData(dataName, "Dim1", i, CNRIF.DataContext.StrVal);
    }
    //var data = CNRIF.RTDS.GetData(dataName, "Dim1", true);
}

function IATKTest_CreateAxis() {
    var dataName = "Test Data Source";
    var viewName = "Integration Test View Lines";
    CNRIF.View.AddAxes(viewName);
    CNRIF.View.SetAxisData(viewName, dataName, 1, "Dim1");
}