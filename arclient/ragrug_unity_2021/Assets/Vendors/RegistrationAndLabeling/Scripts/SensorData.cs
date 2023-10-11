using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Serialization;
using Vizario;

public class SensorData : BaseManager<SensorData>
{
  public Dictionary<string , SensorReference> sensorHolder;
  public class SensorReference
  {
    public string sName;
    public string sType;
    public string currentTemperature;
    public List<string> temperature;
  }
  public void AddOrUpdate(SensorReference sr) 
  {
    SensorReference resSr = null;
    Debug.Log("Adding/Updating Panel: " + sr.sName);
    if (sensorHolder.TryGetValue(sr.sName, out resSr))
    {
      Debug.Log("Sensor Reference already added for: " + sr.sName);
      Debug.Log("Update current temperature and temperature list for: " + sr.sName);
      resSr.currentTemperature = sr.currentTemperature;
      resSr.temperature.Add(sr.currentTemperature);
    }
    else
    {
      //  Debug.Log(GetType() + " AddOrUpdate adding " + pr.mName);
      sensorHolder.Add(sr.sName, sr);
    }
  }
  
  
    
}
