// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'

//http://forum.unity3d.com/threads/96393-Achieving-a-multi-pass-effect-with-a-Surface-Shader
//http://answers.unity3d.com/questions/11175/how-to-make-an-outline-of-an-object-behind-a-wall.html
 
Shader "Custom/NewOcclusionOutline" {
    Properties {
		_MainTex("Base (RGBA)", 2D) = "black" {}
        //_MainTex ("Base (RGB)", 2D) = "white" {}
        _RimCol ("Rim Colour" , Color) = (1,0,0,1)
        _RimPow ("Rim Power", Float) = 1.0
    }
    SubShader {
        Pass {
                Name "Behind"
                Tags { "RenderType"="transparent" "Queue" = "Transparent" }
                Blend SrcAlpha OneMinusSrcAlpha
                ZTest Greater               // here the check is for the pixel being greater or closer to the camera, in which
                Cull Back                   // case the model is behind something, so this pass runs
                ZWrite Off
                LOD 200                    
               
                CGPROGRAM
                #pragma vertex vert
                #pragma fragment frag
                #include "UnityCG.cginc"
               
                struct v2f {
                    float4 pos : SV_POSITION;
                    float2 uv : TEXCOORD0;
                    float3 normal : TEXCOORD1;      // Normal needed for rim lighting
                    float3 viewDir : TEXCOORD2;     // as is view direction.
                };
               
                sampler2D _MainTex;
                float4 _RimCol;
                float _RimPow;
               
                float4 _MainTex_ST;
               
                v2f vert (appdata_tan v)
                {
                    v2f o;
                    o.pos = UnityObjectToClipPos(v.vertex);
                    o.uv = TRANSFORM_TEX(v.texcoord, _MainTex);
                    o.normal = normalize(v.normal);
                    o.viewDir = normalize(ObjSpaceViewDir(v.vertex));       //this could also be WorldSpaceViewDir, which would
                    return o;                                               //return the World space view direction.
                }
               
                half4 frag (v2f i) : COLOR
                {
                    half Rim = 1 - saturate(dot(normalize(i.viewDir), i.normal));       //Calculates where the model view falloff is       
                                                                                                                                       //for rim lighting.
                   
                    half4 RimOut = _RimCol * pow(Rim, _RimPow);
                    return RimOut;
                }
                ENDCG
            }
           
            Pass {
                Name "Regular"
                Tags { "RenderType"="Opaque" }
                ZTest LEqual                // this checks for depth of the pixel being less than or equal to the shader
                ZWrite On                   // and if the depth is ok, it renders the main texture.
                Cull Back
                LOD 200
               
                CGPROGRAM
                #pragma vertex vert
                #pragma fragment frag
                #include "UnityCG.cginc"
               
                struct v2f {
                    float4 pos : SV_POSITION;
                    float2 uv : TEXCOORD0;
                };
               
                sampler2D _MainTex;
                float4 _MainTex_ST;
               
                v2f vert (appdata_base v)
                {
                    v2f o;
                    o.pos = UnityObjectToClipPos(v.vertex);
                    o.uv = TRANSFORM_TEX(v.texcoord, _MainTex);
                    return o;
                }
               
                half4 frag (v2f i) : COLOR
                {
                    half4 texcol = tex2D(_MainTex,i.uv);
                    return texcol;
                }
                ENDCG
            }          
        }
    FallBack "VertexLit"
}