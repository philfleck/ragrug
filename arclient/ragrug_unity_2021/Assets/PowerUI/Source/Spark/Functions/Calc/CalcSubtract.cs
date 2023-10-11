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


namespace Css.Functions{
	
	/// <summary>
	/// Represents the calc() subtract operation.
	/// </summary>
	
	public class CalcSubtract:CalcOperator{
		
		public override float GetDecimal(RenderableData context,CssProperty property){
			return Input0.GetDecimal(context,property) - Input1.GetDecimal(context,property);
		}
		
	}
	
}



