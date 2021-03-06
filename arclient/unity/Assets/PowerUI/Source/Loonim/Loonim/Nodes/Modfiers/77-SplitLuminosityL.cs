using System;
using UnityEngine;

namespace Loonim{

	/// <summary>Reads the luminosity (HSL) channel of an image.</summary>
	public class SplitLuminosityL : Std1InputNode{
		
		public override UnityEngine.Color GetColour(double x,double y){
			
			// Read:
			Color colour=SourceModule.GetColour(x,y);
			
			// Get:
			float channel=HslRgb.Luminance(colour.r,colour.g,colour.b);
			
			return new Color(channel,channel,channel,1f);
		}
		
		public override double GetWrapped(double x, double y, int wrap){
			
			// Read:
			Color colour=SourceModule.GetColour(x,y);
			
			// Get:
			float channel=HslRgb.Luminance(colour.r,colour.g,colour.b);
			
			return channel;
			
		}
		
		public override double GetValue(double x, double y, double z){
			
			// Read:
			Color colour=SourceModule.GetColour(x,y);
			
			// Get:
			float channel=HslRgb.Luminance(colour.r,colour.g,colour.b);
			
			return channel;
			
		}
		
		public override double GetValue(double x, double y){
			
			// Read:
			Color colour=SourceModule.GetColour(x,y);
			
			// Get:
			float channel=HslRgb.Luminance(colour.r,colour.g,colour.b);
			
			return channel;
			
		}
		
		public override int TypeID{
			get{
				return 77;
			}
		}
		
	}
	
}
