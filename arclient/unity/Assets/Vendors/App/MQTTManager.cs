//Philipp Fleck 2020
#define M2MQTT

#if MQTTNet
using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Client.Options;
#endif

#if M2MQTT
using uPLibrary.Networking.M2Mqtt;
using uPLibrary.Networking.M2Mqtt.Messages;
#endif

using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using System.Collections.Concurrent;

namespace Vizario
{
    using JSCallback = System.Func<Jint.Native.JsValue, Jint.Native.JsValue[], Jint.Native.JsValue>;
    using CSCallback = System.Func<string, string, string>;

    public class MQTTManager : BaseManager<MQTTManager>
    {
        public class HostData
        {
            public string hostUrl = "localhost";
            public int hostPort = 1883;
        }


#if MQTTNet
        private IMqttClient mqttClient;
#endif
#if M2MQTT
        private MqttClient mqttClient;
#endif
        private static Dictionary<int, JSCallback> callbacks = new Dictionary<int, JSCallback>();
        private static Dictionary<string, Dictionary<int, Callbackholder>> topicCallbacks = new Dictionary<string, Dictionary<int, Callbackholder>>();

        HostData hostData = new HostData();



        void Start()
        {
            //InitClient();
        }

        private async void OnDestroy()
        {
#if MQTTNet
            await mqttClient.DisconnectAsync();
#endif
#if M2MQTT
            if (mqttClient != null)
            {
                mqttClient.Disconnect();
            }
#endif
        }

        public async void InitClientImpl()
        {
            var url = hostData.hostUrl;
            var port = hostData.hostPort;
            //string url = "192.168.1.148";
            //var url = "vizario-dev.ddns.net";
            //var port = 1883;

#if MQTTNet
            mqttClient = new MqttFactory().CreateMqttClient();

            var options = new MqttClientOptionsBuilder()
                .WithClientId(Guid.NewGuid().ToString())
                .WithTcpServer(url, port)
                //.WithCredentials(username, psw)
                /*.WithTls(new MqttClientOptionsBuilderTlsParameters()
                {
                    AllowUntrustedCertificates = false,
                    UseTls = true,
                    // Certificates = new List<byte[]> { File.ReadAllBytes(p) },
                    Certificates = new List<byte[]> { new X509Certificate2(caCert).Export(X509ContentType.Cert) },
                    CertificateValidationCallback = delegate { return true; },
                    IgnoreCertificateChainErrors = false,
                    IgnoreCertificateRevocationErrors = false
                })*/
                .WithCleanSession()
                .WithProtocolVersion(MQTTnet.Formatter.MqttProtocolVersion.V310)
                .Build();

            // Connecting
            mqttClient.UseConnectedHandler(async e =>
            {
                Debug.Log("### CONNECTED WITH SERVER ###");
            });

            mqttClient.UseApplicationMessageReceivedHandler(e =>
            {
                //Debug.Log("### RECEIVED APPLICATION MESSAGE ###");
                //Debug.Log($"+ Topic = {e.ApplicationMessage.Topic}");
                //Debug.Log($"+ Payload = {Encoding.UTF8.GetString(e.ApplicationMessage.Payload)}");
                //Debug.Log($"+ QoS = {e.ApplicationMessage.QualityOfServiceLevel}");
                //Debug.Log($"+ Retain = {e.ApplicationMessage.Retain}");

                var topic = e.ApplicationMessage.Topic;
                var payload = Encoding.UTF8.GetString(e.ApplicationMessage.Payload);
                foreach (var cb in callbacks.Values)
                {
                    cb.Invoke(
                        new Jint.Native.JsValue("MQTTReceive"),
                        new Jint.Native.JsValue[] { topic, payload });
                }
            });
            await mqttClient.ConnectAsync(options);
#endif
#if M2MQTT
            mqttClient = new MqttClient(url);
            mqttClient.Connect("unity-" + Guid.NewGuid().ToString());
            mqttClient.MqttMsgPublishReceived += MqttClient_MqttMsgPublishReceived;
#endif
        }

#if M2MQTT
        class DecoupledCB
        {
            public CSCallback cbcs;
            public JSCallback cb;
            public Jint.Native.JsValue arg1;
            public Jint.Native.JsValue[] arg2;
            public string topic;
            public string payload;
            public DecoupledCB(JSCallback cb, Jint.Native.JsValue arg1, Jint.Native.JsValue[] arg2, CSCallback cbcs, string topic, string payload)
            {
                this.cb = cb;
                this.arg1 = arg1;
                this.arg2 = arg2;

                this.cbcs = cbcs;
                this.topic = topic;
                this.payload = payload;
            }
        }
        ConcurrentQueue<DecoupledCB> updateCBs = new ConcurrentQueue<DecoupledCB>();

        public class Callbackholder
        {
            public JSCallback jscb = null;
            public CSCallback cscb = null;

            public Callbackholder(JSCallback js)
            {
                jscb = js;
            }

            public Callbackholder(CSCallback cs)
            {
                cscb = cs;
            }
        }


        public void Update()
        {
            if (!updateCBs.IsEmpty)
            {
                for (var i = 0; i < 2; i++)
                {
                    DecoupledCB dcb = null;
                    if (updateCBs.TryDequeue(out dcb))
                    {
                        if (dcb != null)
                        {
                            /*StartCoroutine(RunCbAsync(() =>
                            {
                                dcb.cb?.Invoke(dcb.arg1, dcb.arg2);
                                dcb.cbcs?.Invoke(dcb.topic, dcb.payload);
                            }));*/
                            
                            dcb.cb?.Invoke(dcb.arg1, dcb.arg2);
                            dcb.cbcs?.Invoke(dcb.topic, dcb.payload);
                        }
                    } else
                    {
                        break;
                    }
                }
            }
        }

        public IEnumerator RunCbAsync( Action cb)
        {
            cb?.Invoke();
            yield return null;
        }

        private void ProcessInMessage(string topic, string payload)
        {
            foreach (var cb in callbacks.Values)
            {
                updateCBs.Enqueue(new DecoupledCB(
                    cb,
                    new Jint.Native.JsValue("MQTTReceive"),
                    new Jint.Native.JsValue[] { topic, payload },
                    null, null, null));
            }

            //per topic callbacks
            if (topicCallbacks.ContainsKey(topic))
            {
                foreach (var cb in topicCallbacks[topic].Values)
                {
                    updateCBs.Enqueue(new DecoupledCB(
                        cb.jscb,
                        new Jint.Native.JsValue("MQTTReceive"),
                        new Jint.Native.JsValue[] { topic, payload },
                        cb.cscb, topic, payload));
                }
            }
            else
            {
                //What should happen
                // Go over all keys and check for '+' or '#'
                // this mean that a registered topi "a/#" can match 
                // to msg-topic like "a", "a/b", "a/b/c"
                // in all cases the stored topic is <= to the reported one
                // if there is a "+" on the way we just matched it.
                // Therefore we compare subtopic by subtopic until we he '#'
                // Equal cases like "a/b" matching "a/b" are resolved above                    

                var keys = topicCallbacks.Keys;
                var sT = topic.Split('/');
                foreach (var k in keys)
                {
                    var sK = k.Split('/');

                    if (sK.Length <= sT.Length)
                    {
                        bool cont = false;
                        var N = sK.Length;
                        for (var i = 0; i < N - 1; i++)
                        {
                            if (sK[i] != sT[i] && sK[i] != "+")
                            {
                                cont = true;
                                break;
                            }
                        }

                        if (!cont)
                        {
                            if (sK[N - 1] == "#")
                            {
                                foreach (var cb in topicCallbacks[k].Values)
                                {
                                    updateCBs.Enqueue(new DecoupledCB(
                                        cb.jscb,
                                        new Jint.Native.JsValue("MQTTReceive"),
                                        new Jint.Native.JsValue[] { topic, payload },
                                        cb.cscb, topic, payload));
                                }
                            }
                        }

                        if (cont)
                        {
                            continue;
                        }
                    }
                    //var sN = (sT.Length < sK.Length) ? sT.Length : sK.Length;
                }
            }
        }

        private void MqttClient_MqttMsgPublishReceived(object sender, MqttMsgPublishEventArgs e)
        {

            //var senderId = sender.GetType().GetProperty("ClientId").GetValue(sender).ToString();
            //var jsonMsg = Encoding.UTF8.GetString(e.Message);
            //Debug.Log("MqttClient_MqttMsgPublishReceived => " + senderId + "|" + e.Topic + "|" + Encoding.UTF8.GetString(e.Message));
            //var data = Json.JSON.Parse(jsonMsg);
            
            try
            {
                var topic = e.Topic;
                var payload = Encoding.UTF8.GetString(e.Message);
                //StartCoroutine(MainRunner(topic, payload));

                /*
                foreach (var cb in callbacks.Values)
                {
                    cb?.Invoke(
                        new Jint.Native.JsValue("MQTTReceive"),
                        new Jint.Native.JsValue[] { topic, payload });
                }
                */
                ProcessInMessage(topic, payload);
            }
            catch (Exception err)
            {
                Debug.LogError("MqttClient_MqttMsgPublishReceived ERROR => " + err);
            }

        }
#endif
        public IEnumerator MainRunner(string topic, string payload)
        {
            yield return null;

            //call backs on each topic
            foreach (var cb in callbacks.Values)
            {
                cb?.Invoke(
                    new Jint.Native.JsValue("MQTTReceive"),
                    new Jint.Native.JsValue[] { topic, payload });
            }

            ///
            /// per topic callbacks
            /// 

            //JS Callbacks
            if (topicCallbacks.ContainsKey(topic))
            {
                foreach (var cb in topicCallbacks[topic].Values)
                {
                    //js cb invoke
                    cb.jscb?.Invoke(
                        new Jint.Native.JsValue("MQTTReceive"),
                        new Jint.Native.JsValue[] { topic, payload });
                    
                    //cs cb invoke
                    cb.cscb?.Invoke( topic, payload);
                }
            }
        }
        public
#if MQTTNet
            async 
#endif
            void SubscribeImpl(string topic)
        {
            try
            {
                if (mqttClient != null)
                {
#if MQTTNet
                await mqttClient.SubscribeAsync(topic);
#endif
#if M2MQTT
                    //this was on 
                    //byte[] qosLevels = { MqttMsgBase.QOS_LEVEL_EXACTLY_ONCE };
                    byte[] qosLevels = { MqttMsgBase.QOS_LEVEL_AT_MOST_ONCE };
                    string[] topics = { topic };
                    mqttClient.Subscribe(topics, qosLevels);
#endif
                }
            }
            catch (Exception e)
            {
                Debug.LogError("SubscribeImpl Error => " + e);
            }
        }

        public
#if MQTTNet
            async 
#endif
            void UnsubscribeImpl(string topic)
        {
            if (mqttClient != null)
            {
#if MQTTNet
                await mqttClient.UnsubscribeAsync(topic);
#endif
#if M2MQTT
                string[] topics = { topic };
                mqttClient.Unsubscribe(topics);
#endif
            }
        }

        public
#if MQTTNet
            async 
#endif           
            void PublishImple(string topic, string payload)
        {
#if MQTTNET
            await Task.Run(() => mqttClient.PublishAsync(topic,payload));
#endif
#if M2MQTT
            var bytes = Encoding.UTF8.GetBytes(payload);
            mqttClient.Publish(topic, bytes);
#endif
        }

        void PublishModImple(string topic, string payload)
        {
            ProcessInMessage(topic, payload);
        }

            public static void Subscribe(string topic)
        {
            MQTTManager.GetRTInstance().SubscribeImpl(topic);
        }

        public static void Unsubscribe(string topic)
        {
            MQTTManager.GetRTInstance().UnsubscribeImpl(topic);
        }



        public void RegisterCallbackImple(JSCallback fct)
        {
            var index = fct.GetHashCode();
            if (callbacks.ContainsKey(index))
            {
                callbacks[index] = fct;
            }
            else
            {
                callbacks.Add(index, fct);
            }
        }

        public void RegisterCallbackTopicImple(Callbackholder fct, string topic)
        //public void RegisterCallbackTopicImple(JSCallback fct, string topic)
        {
            if (fct != null)
            {
                var index = fct.GetHashCode();
                Dictionary<int, Callbackholder> cbs = null;

                if (topicCallbacks.TryGetValue(topic, out cbs))
                {
                    if (cbs.ContainsKey(index))
                    {
                        cbs[index] = fct;
                    }
                    else
                    {
                        cbs.Add(index, fct);
                    }
                }
                else
                {
                    cbs = new Dictionary<int, Callbackholder>();
                    cbs.Add(index, fct);
                    topicCallbacks.Add(topic, cbs);
                }
            }
        }

        public void UnregisterCallbackImple(JSCallback fct)
        {
            var index = fct.GetHashCode();
            if (callbacks.ContainsKey(index))
            {
                callbacks.Remove(index);
            }
        }

        public void SetHostImpl(string url, int port)
        {
            hostData.hostUrl = url;
            hostData.hostPort = port;
        }

        /// STATIC EXPORTS

        public static void Publish(string topic, string payload)
        {
            GetRTInstance().PublishImple(topic, payload);
        }

        public static void PublishMod(string topic, string payload, bool localOnly)
        {
            if (!localOnly)
            {
                GetRTInstance().PublishImple(topic, payload);
            } else
            {
                GetRTInstance().PublishModImple(topic, payload);
            }
        }

        public static void RegisterCallback(JSCallback fct)
        {
            GetRTInstance().RegisterCallbackImple(fct);
        }

        public static void RegisterCallbackTopic(JSCallback fct, string topic)
        {
            GetRTInstance().RegisterCallbackTopicImple(new Callbackholder(fct), topic);
        }

        public static void RegisterCallbackTopicCs(CSCallback fct, string topic)
        {
            GetRTInstance().RegisterCallbackTopicImple(new Callbackholder(fct), topic);
        }

        public static void UnregisterCallback(JSCallback fct)
        {
            GetRTInstance().UnregisterCallbackImple(fct);
        }

        public static void UnregisterCbFromTopic(string topic, JSCallback fct)
        {
            Dictionary<int, Callbackholder> cbs;
            if (topicCallbacks.TryGetValue(topic, out cbs))
            {
                int index = fct.GetHashCode();
                if (cbs.ContainsKey(index))
                {
                    cbs.Remove(index);
                }
            }
        }

        public static void SetHost(string url, int port)
        {
            GetRTInstance().SetHostImpl(url, port);
        }

        public static void StartClient()
        {
            GetRTInstance().InitClientImpl();
        }
    }
}
