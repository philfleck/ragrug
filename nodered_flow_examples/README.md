# Collection of Examples based on a Single NodeRed Flow

If not said different every example is meant to be run on the ARClient, therefore it can be deaktived on the hub. To be accessible from the ARClient, the flow has to b deployed.
Most of the examples already come with the default installation ([../backend/node-red/flows](../backend/node-red/flows)).



| Where | Example | Files | Image | Description |
| --- | --- | --- | --- | --- |
| Hub | Heating Data simulation | [Hub:heating_data_sim_hub.json](heating_data_sim_hub.json) | ![](heating_data_sim_hub.jpg) | A number simple random value generator for a numer of topics to test any visualization without the need of real devices. Can be used to copy a real device/sensor 1:1 |
| Client | Simple Test | [simple_test.json](simple_test.json) | ![](simple_test.jpg) | A simple function test creating output to the console or Unity.log |
| Client | Smart Fride | [smart_fridge.json](smart_fridge.json) | ![](smart_fridge.jpg) | Smart fridge example from the paper. Visualizing Temperature, Distance and Alarm from the sensor. If you dont have the sensor, simply create within another flow fake date as done in [Heating](path to heating)|
| Client, Hub | Samrt Fridge Distributed | [smart_fridge_distributed_client.json](smart_fridge_distributed_client.json) [smart_fridge_distributed_hub.json](smart_fridge_distributed_hub.json) | ![](smart_fridge_distributed_client.jpg) ![](smart_fridge_distributed_hub.jpg) | Distributed version on the Smart Fridgge example |
|todo|todo|todo|todo|todo|
