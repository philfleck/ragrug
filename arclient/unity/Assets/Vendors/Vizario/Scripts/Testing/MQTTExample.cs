#if false
using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography.X509Certificates;
using UnityEngine;

using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Client.Options;
using System.Threading.Tasks;
using System.Text;

public class MQTTExample : MonoBehaviour
{
    async void Start()
    {
        string cafn = "server.pfx";
        string p = Path.Combine(Application.streamingAssetsPath, cafn);
        string cafns = "ca.crt";
        string q = Path.Combine(Application.streamingAssetsPath, cafns);

        //Create a new MQTT client
        var mqttClient = new MqttFactory().CreateMqttClient();

        //var caCert = new X509Certificate(p, "ar4gmbh");
        var caCert = new X509Certificate(q, "");
        var url = "vizario-dev.ddns.net";
        //var username = "user";
        //var psw = "user";
        var port = 1883;
        var options = new MqttClientOptionsBuilder()
            .WithClientId(Guid.NewGuid().ToString())
            .WithTcpServer(url, port)
            //.WithCredentials(username, psw)
            .WithTls(new MqttClientOptionsBuilderTlsParameters()
            {
                AllowUntrustedCertificates = false,
                UseTls = true,
                // Certificates = new List<byte[]> { File.ReadAllBytes(p) },
                Certificates = new List<byte[]> { new X509Certificate2(caCert).Export(X509ContentType.Cert) },
                CertificateValidationCallback = delegate { return true; },
                IgnoreCertificateChainErrors = false,
                IgnoreCertificateRevocationErrors = false
            })
            .WithCleanSession()
            .WithProtocolVersion(MQTTnet.Formatter.MqttProtocolVersion.V310)
            .Build();

        // Connecting
        mqttClient.UseConnectedHandler(async e =>
        {
            Debug.Log("### CONNECTED WITH SERVER ###");

            // Subscribe to a topic
            await mqttClient.SubscribeAsync(new TopicFilterBuilder().WithTopic("test/topic").Build());

            Debug.Log("### SUBSCRIBED ###");
        });
        mqttClient.UseApplicationMessageReceivedHandler(e =>
        {
            Debug.Log("### RECEIVED APPLICATION MESSAGE ###");
            Debug.Log($"+ Topic = {e.ApplicationMessage.Topic}");
            Debug.Log($"+ Payload = {Encoding.UTF8.GetString(e.ApplicationMessage.Payload)}");
            Debug.Log($"+ QoS = {e.ApplicationMessage.QualityOfServiceLevel}");
            Debug.Log($"+ Retain = {e.ApplicationMessage.Retain}");

            Task.Run(() => mqttClient.PublishAsync("test/topic"));
        });
        await mqttClient.ConnectAsync(options);
    }
}
#endif