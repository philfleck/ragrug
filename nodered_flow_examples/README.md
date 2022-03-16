# Collection of Examples based on a Single NodeRed Flow

If not said different every example is meant to be run on the ARClient, therefore it can be deaktived on the hub. To be accessible from the ARClient, the flow has to b deployed.
Most of the examples already come with the default installation ([../backend/node-red/flows](../backend/node-red/flows)).



| Example | Files | Image | Description |
| --- | --- | --- | --- |
| Simple Test | [simple_test.json](simple_test.json) | ![](simple_test.jpg) | A simple function test creating output to the console or Unity.log |
| Smart Fride | [smart_fridge.json](smart_fridge.json) | ![](smart_fridge.jpg) | Smart fridge example from the paper. Visualizing Temperature, Distance and Alarm from the sensor. If you dont have the sensor, simply create within another flow fake date as done in [Heating](path to heating)|
| Samrt Fridge Distributed | [smart_fridge_distributed_client.json](smart_fridge_distributed_client.json) [smart_fridge_distributed_hub.json](smart_fridge_distributed_hub.json) | ![](smart_fridge_distributed_client.jpg) ![](smart_fridge_distributed_hub.jpg) | Distributed version on the Smart Fridgge example |
