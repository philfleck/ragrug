Shader "Loonim/17-23" { // Blend (Pin Light)

Properties {
	_Src0("Source 0",2D) = "white" {}
	_Src1("Source 1",2D) = "white" {}
	_Src2("Weight",2D) = "white" {}
}

SubShader {
	Pass {
		
		
		Blend Off
		Tags { "Queue"="Transparent" "RenderType"="Transparent" "IgnoreProjector"="True" }
		ZWrite Off
		
		CGPROGRAM
		
		
		#define NoDataInput
		#include "StdLoonimDraw.cginc"
		#pragma vertex vert
		#pragma fragment frag
		
		sampler2D _Src2;
		
		float4 frag(v2f i) : COLOR
		{
			float2 pt=i.uv;
			float4 _0=tex2D(_Src0,pt);
			float4 _1=tex2D(_Src1,pt);
			
			// Blend factor is..
			float dstA=_0.a;
			float srcA=tex2D(_Src2,pt).r * _1.a;
			
			// Pin Light:
			
			if(_1.r<0.5){
				
				// Darken
				_1.r=min(_1.r,_0.r);
				
			}else{
				
				// Lighten
				_1.r=max(_1.r,_0.r);
				
			}
		
			if(_1.g<0.5){
				
				// Darken
				_1.g=min(_1.g,_0.g);
				
			}else{
				
				// Lighten
				_1.g=max(_1.g,_0.g);
				
			}
		
			if(_1.b<0.5){
				
				// Darken
				_1.b=min(_1.b,_0.b);
				
			}else{
				
				// Lighten
				_1.b=max(_1.b,_0.b);
				
			}
		
			// Time to alpha blend!
			
			float dstAinvSrc=dstA * (1 - srcA);
			float outA=max(srcA + dstAinvSrc,0.001);
			
			_0.rgb = ( (_1.rgb * srcA) + (_0.rgb * dstAinvSrc) ) / outA;
			_0.a=outA;
			
			return _0;
			
		}
		
		ENDCG
	}
}

}