﻿Shader "Loonim/78" { // Split Luminosity (HSY model) from _Src0

Properties {
	_Src0("Source 0",2D) = "white" {}
}

SubShader {
	Pass {
		
		
		Blend Off
		Tags { "Queue"="Transparent" "RenderType"="Transparent" "IgnoreProjector"="True" }
		ZWrite Off
		
		CGPROGRAM
		
		
		#define OneInput
		#define NoDataInput
		#include "StdLoonimDraw.cginc"
		#include "StdLoonimColours.cginc"
		#pragma vertex vert
		#pragma fragment frag
		
		float4 frag(v2f i) : COLOR{
			
			float2 pt=i.uv;
			
			float4 _0=tex2D(_Src0,pt);
			
			// Compute the luminosity (Using HSY here):
			_0.r=luminanceHSY(_0.rgb);
			_0.gb=_0.r;
			return _0;
		}
		
		ENDCG
	}
}

}