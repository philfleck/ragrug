#pragma once

#include <stdint.h>
#include <type_traits>
#include <memory>
#include <string>

#if defined(WIN32) || defined(WINAPI_FAMILY)
#define STDCALL __cdecl
#ifdef _WINDLL
#define DECLDIR __declspec(dllexport)
#else
#define DECLDIR __declspec(dllimport)
#endif
#else
#define STDCALL
#define DECLDIR __attribute__ ((visibility("default")))
#endif

#include <codecvt>
#include <locale>

typedef char16_t VCHAR;

enum class FileType
{
    Json = 0,
    Txt = 1,
    Invalid = 2
};

template<typename INPUTTYPE, typename OUTPUTTYPE> DECLDIR std::basic_string<OUTPUTTYPE> STDCALL convertUTFFormat8toV(const std::basic_string<INPUTTYPE>& data);
template<typename INPUTTYPE, typename OUTPUTTYPE> DECLDIR std::basic_string<OUTPUTTYPE> STDCALL convertUTFFormatVto8(const std::basic_string<INPUTTYPE>& data);
template<> DECLDIR std::basic_string<char> STDCALL convertUTFFormatVto8(const std::basic_string<char>& data);
template<> DECLDIR std::basic_string<char> STDCALL convertUTFFormatVto8(const std::basic_string<char16_t>& data);
template<> DECLDIR std::basic_string<char> STDCALL convertUTFFormat8toV(const std::basic_string<char>& data);
template<> DECLDIR std::basic_string<char16_t> STDCALL convertUTFFormat8toV(const std::basic_string<char>& data);
// TAKEN FROM VIZARIOCORECALLBACKS_H END

extern "C" {

typedef void (STDCALL * RegistrationLib_PoseCallback)(const VCHAR*);

DECLDIR bool STDCALL RegistrationLib_Create();
DECLDIR bool STDCALL RegistrationLib_Configure(const VCHAR* configString);
DECLDIR bool STDCALL RegistrationLib_ConfigureFromFile(const VCHAR* configfilename, FileType type);
DECLDIR bool STDCALL RegistrationLib_RegisterPoseCallback(RegistrationLib_PoseCallback handler);
DECLDIR bool STDCALL RegistrationLib_UnRegisterPoseCallback();
DECLDIR bool STDCALL RegistrationLib_Destroy();
DECLDIR bool STDCALL RegistrationLib_LoadModelFromFile(const VCHAR* modelfilename, FileType type);
DECLDIR bool STDCALL RegistrationLib_LoadModelFromJsonString(const VCHAR* modelAsJsonString);
DECLDIR bool STDCALL RegistrationLib_RegisterSceneFromFile(const VCHAR*  scenefilename, FileType type);
DECLDIR bool STDCALL RegistrationLib_RegisterSceneFromJsonString(const VCHAR* sceneAsJsonString);

}
