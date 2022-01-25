#ifndef _IVizarioCore_DLL_Wrapper_H_INCLUDED_
#define _IVizarioCore_DLL_Wrapper_H_INCLUDED_

//#ifdef ANDROID
//#define float_t float
//#endif

#include <stdint.h>
#include <math.h>

#include "VizarioCoreCallbacks.h"


extern "C" {

  // returns a list of AV devices on the native side
  DECLDIR void STDCALL VizarioCore_enumerateAVDevicesNative(VCHAR* jsonmessage, const int maxlen);

  // return device information
  DECLDIR void STDCALL VizarioCore_getDeviceInfo(VCHAR* jsonmessage, const int maxlen);

  // initialize core module
  DECLDIR void STDCALL VizarioCore_initialize();

  // pass message from other library which does not have it's own log callback into unity
  // this function is not exposed in Unity
  DECLDIR void STDCALL VizarioCore_passLogFromNativeLib(const VCHAR* message);

  // push particual native command
  DECLDIR bool STDCALL VizarioCore_command(const int32_t dllID, VIZARIO_CMDTYPE type, const VCHAR* data );

  // set native texture pointer for rendering from C++
  DECLDIR bool STDCALL VizarioCore_setNativeTexturePointer(void* texturePointer, const VCHAR* textureInfo);

  // push new image data onto Imagechunk stack
  DECLDIR bool STDCALL VizarioCore_pushImageData(const uint8_t* frameData, const int frameDataSize, const VCHAR* poseString, const int32_t frameID);

  // register any callback
  DECLDIR bool STDCALL VizarioCore_registerCallback(const int32_t dllID, VIZARIO_CBTYPE type, void* callback, void* object);

  // unregister any callback
  DECLDIR bool STDCALL VizarioCore_unregisterCallback(const int32_t dllID, VIZARIO_CBTYPE type);

  // get number of callbacks for DLL with given ID
  DECLDIR int32_t STDCALL VizarioCore_getSupportedCallbacks(const int32_t dllID, VIZARIO_CBTYPE* callbackIDs);

  // get status of particular moduleID
  DECLDIR VIZARIO_STATUS STDCALL VizarioCore_getStatus(const int32_t dllID);

  // initialize existing DLL by name
  DECLDIR bool STDCALL VizarioCore_initializeDllByName(const VCHAR* dllname, const VCHAR* data);

  // initialize a given DLL by ID
  DECLDIR bool STDCALL VizarioCore_initializeDllByID(const int32_t dllID, const VCHAR* data);

  // register a new DLL by name
  DECLDIR int32_t STDCALL VizarioCore_registerDllByName(const VCHAR* dllname);

  // unregister existing DLL by name
  DECLDIR bool STDCALL VizarioCore_unregisterDllByName(const VCHAR* dllname);

  // unregister a given DLL by ID
  DECLDIR bool STDCALL VizarioCore_unregisterDllByID(const int32_t dllID);

  // destroy core module
  DECLDIR void STDCALL VizarioCore_destroy();

}; //extern "C"

#endif // _IVizarioCore_DLL_Wrapper_H_INCLUDED_
