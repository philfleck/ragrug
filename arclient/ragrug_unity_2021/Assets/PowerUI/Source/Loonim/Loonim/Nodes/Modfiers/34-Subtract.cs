﻿using System;
using UnityEngine;

namespace Loonim{
	
	/// <summary>
	/// Module that returns the output of a source module minus another.
	/// </summary>
	public class Subtract : Std2InputNode{
		
		public Subtract(){}
		
		public Subtract(TextureNode _0,TextureNode _1){
			SourceModule1=_0;
			SourceModule2=_1;
		}
		
		public override UnityEngine.Color GetColour(double x,double y){
			
			// Read colour:
			UnityEngine.Color col1=SourceModule1.GetColour(x,y);
			
			// Read colour:
			UnityEngine.Color col2=SourceModule2.GetColour(x,y);
			
			// Subtract away! Ignore alpha though - it comes from col1:
			col1.r-=col2.r;
			col1.g-=col2.g;
			col1.b-=col2.b;
			
			return col1;
			
		}
		
		public override double GetWrapped(double x, double y, int wrap){
			return SourceModule1.GetWrapped(x,y,wrap) - SourceModule2.GetWrapped(x,y,wrap);
		}
		
		public override double GetValue(double x, double y, double z){
			 return SourceModule1.GetValue(x, y, z) - SourceModule2.GetValue(x, y, z);
		}
		
		public override double GetValue(double x, double y){
			return SourceModule1.GetValue(x, y) - SourceModule2.GetValue(x, y);
		}
		
		public override double GetValue(double t){
			
			return SourceModule1.GetValue(t) - SourceModule2.GetValue(t);
			
		}
		
		public override int TypeID{
			get{
				return 34;
			}
		}
		
	}
	
}
