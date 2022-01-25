/*========================================================================
Copyright (c) 2017 PTC Inc. All Rights Reserved.

Vuforia is a trademark of PTC Inc., registered in the United States and other
countries.
=========================================================================*/
Shader "Custom/DepthContourSPI" {

    Properties
    {
        _SilhouetteSize("Size", Float) = 1
        _SilhouetteColor("Color", Color) = (1,1,1,1)
    }

        CGINCLUDE
#include "UnityCG.cginc"

        struct v2f
    {
        float4 position : POSITION;
        float4 color : COLOR;
        UNITY_VERTEX_OUTPUT_STEREO
    };

    struct vertIn
    {
        float4 position : POSITION;
        float3 normal : NORMAL;
        UNITY_VERTEX_INPUT_INSTANCE_ID
    };

    uniform float _SilhouetteSize;
    uniform float4 _SilhouetteColor;

    ENDCG

        SubShader
    {
        Tags { "Queue" = "Geometry" }

        Pass
        {
            Cull Back
            Blend Zero One
        }

        Pass
        {
            Cull Front

            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag

            v2f vert(vertIn input)
            {
                v2f output;

                UNITY_SETUP_INSTANCE_ID(input); //Insert
                UNITY_INITIALIZE_OUTPUT(v2f, output); //Insert
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(output); //Insert

                // unmodified projected position of the vertex
                output.position = UnityObjectToClipPos(input.position);
                output.color = _SilhouetteColor;

                // calculate silhouette in image space
                float3 normal = mul((float3x3)UNITY_MATRIX_IT_MV, input.normal);
                float2 normalScreen = TransformViewToProjection(normal.xy);

                output.position /= output.position.w;

                float2 screenOffset = _SilhouetteSize * normalize(normalScreen);
                output.position.x += screenOffset.x / (_ScreenParams.x * 0.5);
                output.position.y += screenOffset.y / (_ScreenParams.y * 0.5);

                return output;
            }

            half4 frag(v2f input) :COLOR
            {
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(input); //Insert
                return input.color;
            }
            ENDCG
        }
    }

        Fallback "Diffuse"
}
