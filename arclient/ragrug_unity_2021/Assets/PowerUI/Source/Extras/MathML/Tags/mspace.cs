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

using Dom;

namespace MathML{
	
	/// <summary>
	/// The MathML mspace tag.
	/// </summary>
	
	[Dom.TagName("mspace")]
	public class MathSpaceElement:MathElement{
		
		public override bool OnAttributeChange(string property){
			
			if(property=="linebreak"){
				
				return true;
				
			}else if(!base.OnAttributeChange(property)){
				return false;
			}
			
			return true;
		}
		
	}
	
}