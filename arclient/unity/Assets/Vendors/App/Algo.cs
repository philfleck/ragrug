//Philipp Fleck 2020
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using UnityEngine;

#if WINDOWS_UWP
using Windows.Networking.Connectivity;
using Windows.Networking;
#else
using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
#endif


namespace RR
{
    public static class Algo
    {
        static public byte[] Compress(byte[] data)
        {
            MemoryStream output = new MemoryStream();
            using (DeflateStream dstream = new DeflateStream(output, System.IO.Compression.CompressionLevel.Optimal))
            {
                dstream.Write(data, 0, data.Length);
            }
            return output.ToArray();
        }

        static public byte[] Decompress(byte[] data)
        {
            MemoryStream input = new MemoryStream(data);
            MemoryStream output = new MemoryStream();
            using (DeflateStream dstream = new DeflateStream(input, System.IO.Compression.CompressionMode.Decompress))
            {
                dstream.CopyTo(output);
            }
            return output.ToArray();
        }

        static public string GetNetworkName()
        {
            return Vizario.Platform.NetworkHelper.GetCurrentNetworkName();
        }

        static public async void GetBSSID()
        {
            var currentSSID = GetNetworkName(); ;
            var msg = "";

#if WINDOWS_UWP
            //msg = Windows.Devices.WiFi.WiFiAvailableNetwork.Bssid;
            var /*List<Windows.Devices.WiFi.WiFiAdapter>*/ wifiadapters = await Windows.Devices.WiFi.WiFiAdapter.FindAllAdaptersAsync();
            foreach(var awa in wifiadapters)
            {
                var /*List<Windows.Devices.WiFi.WiFiAvailableNetwork>*/ anetowrks = awa.NetworkReport.AvailableNetworks;
                foreach(var nt in anetowrks)
                {   
                    var bssid = nt.Bssid;
                    var ssid = nt.Ssid;
                    if(ssid == currentSSID) {
                        msg += "FOUND (" + currentSSID + "): ";    
                        //return bssid;    
                    }
                    msg += ssid + " - " + bssid + "\n";
                }
            }

            /*
            var icp = NetworkInformation.GetInternetConnectionProfile();
            if (icp != null)
            {
                if(icp.IsWlanConnectionProfile) {
                }
                msg = icp.ProfileName;
            }
            msg = "no internet"; // msg;
            */
#endif
            Debug.Log("GetBSSID => " + msg);
            //return msg;
        }

        static public void WriteStr2File(string filename, string data)
        {
            var path = Path.Combine(Application.persistentDataPath, filename);
            Debug.Log("WriteStr2File " + path);
            Vizario.Platform.FileReadWrite.WriteStringToFile(path, data);
        }

        static public string ReadFile2Str(string filename)
        {
            string data = "";
            var path = Path.Combine(Application.persistentDataPath, filename);
            Debug.Log("ReadFile2Str " + path);
            data = Vizario.Platform.FileReadWrite.ReadFileAsString(path, false);
            return data;
        }

        public static byte[] BytesFromString(string data, bool ascii)
        {
            var byteData = (!ascii) ? System.Text.Encoding.Unicode.GetBytes(data) : System.Text.Encoding.ASCII.GetBytes(data);
            return byteData;
        }

        public static string StringFromBytes(byte[] data)
        {
            var strData = System.Text.Encoding.Unicode.GetString(data);
            return strData;
        }

        public static string StringFromBytesAscii(byte[] data)
        {
            var strData = System.Text.Encoding.ASCII.GetString(data);
            return strData;
        }

        public static string EncodeB64FromBytes(byte[] data)
        {
            var b64 = System.Convert.ToBase64String(data);
            return b64;
        }

        public static string EncodeB64FromString(string data, bool ascii)
        {
            var bytes = BytesFromString(data, ascii);
            return EncodeB64FromBytes(bytes);
        }

        public static byte[] DecodeB64BytesToBytes(byte[] data)
        {
            var bytes = StringFromBytes(data);
            var byteData = System.Convert.FromBase64String(bytes);
            return byteData;
        }

        public static string DecodeB64BytesToString(byte[] data)
        {
            var bytes = DecodeB64BytesToBytes(data);
            var strData = StringFromBytes(bytes);
            return strData;
        }

        public static string HashString(string mString)
        {
            var bytes = BytesFromString(mString, true);
            var hasher = System.Security.Cryptography.SHA1.Create();
            var hashedBytes = hasher.ComputeHash(bytes);
            var b64Hash = EncodeB64FromBytes(hashedBytes);
            return b64Hash;
        }

        public static byte[] DecodeB64StringToBytes(string data, bool ascii)
        {
            var bytesData = BytesFromString(data, ascii);
            var bytes = DecodeB64BytesToBytes(bytesData);
            return bytes;
        }

        public static string DecodeB64StringToString(string data, bool ascii)
        {
            var bytesData = BytesFromString(data, ascii);
            var bytes = DecodeB64BytesToString(bytesData);
            return bytes;
        }

        //string path = Path.Combine(Application.persistentDataPath, mName);
        //var mBytes = System.Convert.FromBase64String(mContent);
        //Vizario.Platform.FileReadWrite.WriteBytesToFile(path, mBytes);
        public static byte[] ReadBytes(string filename, bool decompress)
        {
            string path = Path.Combine(Application.persistentDataPath, filename);
            var data = Vizario.Platform.FileReadWrite.ReadFileAsBytes(path);
            if (decompress)
            {
                data = Decompress(data);
            }
            return data;
        }

        public static string MakePersistantPath(string filename)
        {
            return Path.Combine(Application.persistentDataPath, filename);
        }

        public static string ReadString(string filename)
        {
            try
            {
                string path = MakePersistantPath(filename);
                var data = Vizario.Platform.FileReadWrite.ReadFileAsString(path);
                return data;
            }
            catch (Exception e)
            {
                Debug.LogError("ReadString ERROR => " + e);
            }
            return null;
        }

        public static void WriteBytes(string filename, byte[] data, bool compress)
        {
            string path = MakePersistantPath(filename);
            var wData = data;
            if (compress)
            {
                wData = Compress(data);
            }
            Vizario.Platform.FileReadWrite.WriteBytesToFile(path, wData);
        }

        public static void WriteString(string filename, string data)
        {
            string path = MakePersistantPath(filename);
            var wData = data;
            Vizario.Platform.FileReadWrite.WriteStringToFile(path, wData);
        }

        public static void WriteBytesFromB64(string filename, byte[] data, bool decompress)
        {
            var bytesData = DecodeB64BytesToBytes(data);
            if (decompress)
            {
                bytesData = Decompress(bytesData);
            }
            WriteBytes(filename, bytesData, false);
        }

        public static void WriteBytesFromB64String(string filename, string data, bool decompress, bool ascii)
        {
            var bytes = BytesFromString(data, ascii);
            WriteBytesFromB64(filename, bytes, decompress);
        }
    }


}
