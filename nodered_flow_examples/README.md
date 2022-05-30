# Collection of Examples based on a Single NodeRed Flow

If not said different every example is meant to be run on the ARClient, therefore it can be deaktived on the hub. To be accessible from the ARClient, the flow has to b deployed.
Most of the examples already come with the default installation ([../backend/node-red/flows](../backend/node-red/flows)).



| Where | Example | Files | Image | Description |
| --- | --- | --- | --- | --- |
| Hub | Heating Data simulation | [heating_data_sim_hub.json](heating_data_sim_hub.json) | ![](heating_data_sim_hub.jpg) | A number simple random value generator for a numer of topics to test any visualization without the need of real devices. Can be used to copy a real device/sensor 1:1 |
| Client | Simple Test | [simple_test.json](simple_test.json) | ![](simple_test.jpg) | A simple function test creating output to the console or Unity.log |
| Client | Smart Fride | [smart_fridge.json](smart_fridge.json) | ![](smart_fridge.jpg) | Smart Fridge example from the paper. Visualizing Temperature, Distance and Alarm from the sensor. If you dont have the sensor, simply create within another flow fake date as done in [Heating](path to heating)|
| Client, Hub | Smart Fridge Distributed | [smart_fridge_distributed_client.json](smart_fridge_distributed_client.json) [smart_fridge_distributed_hub.json](smart_fridge_distributed_hub.json) | ![](smart_fridge_distributed_client.jpg) ![](smart_fridge_distributed_hub.jpg) | Distributed version on the Smart Fridge example |
|todo|todo|todo|todo|todo|
|Client|Daisy IATK|[daisy_iatk.json](daisy_iatk.json)|![](daisy_iatk.jpg)| Demonstrates on how to create flow based visualization configurations|
|Client|Basement generic device visualization|[basement_generic_device_part_vis.json](basement_generic_device_part_vis.json)|![](basement_generic_device_part_vis.jpg)|Shows how a generically define visualization can be applied to every part of every loaded device or referrent using auto-self initialization.|
|Client|All temperatures|[all_temperaures_proxemics.json](all_temperaures_proxemics.json)|![](all_temperaures_proxemics.jpg)|In this example we gather all temperatures published to MQTT following a common topic-pattern and visualize them in a single Visualization by name. Furthermore, we use the users headpose to calculate the users distance to the visualizaion, which allows us demonstrate proxemics by switching level of detail.|
|Client|IATK NR|[flow_rtds_data.json](all_temperaures_proxemics.json), [flow_rtds_view.json](flow_rtds_view.json)| ![](flow_rtds_data.jpg)![](flow_rtds_view.jpg) | This example uses simulated data from the Heating flow where the data part adds data into the RealtimeDatasource and and the view part creates and update the visualization. Furthermore it demonstrates how to uses RagRug's [NodeRed Package](https://flows.nodered.org/node/@ragrug/ragrug-nodered). |
| Client | Simple Views | [simple_dots.json](simple_dots.json), [simple_line.json](simple_line.json), [simple_line_link.json](simple_line_link.json) | ![](simple_view.png) | Three examples of how to use RagRug's NodeRed Package to create simple views |
| Client | Updating a View | [updating_view.json](updating_view.json) | ![](updating_view.png) | This example shows how to use RagRug's NodeRed Package to dynamically update views. |
| Client | Realtime Data Source | [basic_rtds.json](basic_rtds.json) | ![](basic_rtds.png) | Demonstrates how to use RagRug's NodeRed Package to create a Realtime Data Source and use it to buffer inputs from a high-rate sensor. |
| Client | Adding Axes | [adding_axes.json](adding_axes.json) | ![](adding_axes.png) | Uses RagRug's NodeRed Package to add labelled axes to a scatter plot. |
| Client | Dynamic Axis Labels | [axes_dynamic_labels.json](axes_dynamic_labels.json) | ![](axes_dynamic_labels.png) | Uses RagRug's NodeRed Package to create a  bar chart with dynamically updated labels on the X-Axis. |
| Client | MRTK Scene Buttons | [mrtk_scene_buttons.json](mrtk_scene_buttons.json) | ![](mrtk_scene_buttons.png) | Demonstrates how to spawn responsive scene buttons from MRTK using RagRug's special node handling. |
| Client | Redeploying a Flow | [redeploying.json](redeploying.json) | ![](redeploying.png) | This example consists of node snippets that can be used to redeploy a flow from the NodeRed editor, as well as best-practices on how to ensure smooth redeployment and avoid duplicate views. |
