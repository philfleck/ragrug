//--------------------------------------
//               PowerUI
//
//        For documentation or 
//    if you have any issues, visit
//        powerUI.kulestar.com
//
//    Copyright � 2013 Kulestar Ltd
//          www.kulestar.com
//--------------------------------------

using System;
using UnityEngine;


namespace Css.Functions{
	
	/// <summary>
	/// Represents the scale x transform function.
	/// </summary>
	
	public class ScaleX:Transformation{
		
		public ScaleX(){
			
			Name="scalex";
			
		}
		
		/// <summary>Sets the default params for this transformation.</summary>
		public override void SetDefaults(){
			Clear(1f);
		}
		
		public override Matrix4x4 CalculateMatrix(RenderableData context){
			
			Matrix4x4 matrix=Matrix4x4.identity;
			
			matrix[0]=this[0].GetDecimal(context,ValueAxis.X,ValueRelativity.None);
			
			return matrix;
			
		}
		
		public override string[] GetNames(){
			return new string[]{"scalex"};
		}
		
		protected override Css.Value Clone(){
			ScaleX result=new ScaleX();
			result.Values=CopyInnerValues();
			return result;
		}
		
	}
	
}



