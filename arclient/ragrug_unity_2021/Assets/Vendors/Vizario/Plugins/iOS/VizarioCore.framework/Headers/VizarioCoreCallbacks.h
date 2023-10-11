#ifndef _VizarioCoreCallbacks_h_included_
#define _VizarioCoreCallbacks_h_included_

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

template<typename INPUTTYPE, typename OUTPUTTYPE> DECLDIR std::basic_string<OUTPUTTYPE> STDCALL convertUTFFormat8toV(const std::basic_string<INPUTTYPE>& data);
template<typename INPUTTYPE, typename OUTPUTTYPE> DECLDIR std::basic_string<OUTPUTTYPE> STDCALL convertUTFFormatVto8(const std::basic_string<INPUTTYPE>& data);
template<> DECLDIR std::basic_string<char> STDCALL convertUTFFormatVto8(const std::basic_string<char>& data);
template<> DECLDIR std::basic_string<char> STDCALL convertUTFFormatVto8(const std::basic_string<char16_t>& data);
template<> DECLDIR std::basic_string<char> STDCALL convertUTFFormat8toV(const std::basic_string<char>& data);
template<> DECLDIR std::basic_string<char16_t> STDCALL convertUTFFormat8toV(const std::basic_string<char>& data);

// unified callback definitions in all libraries

enum class VIZARIO_CBTYPE
{
    CB_LOG = 1,
    CB_RESASJSON = 2,
    CB_PUSHNATIVEIMAGE = 3,
    CB_NOTIFYNATIVEIMAGE = 4,
    CB_MAX_TYPE
};

enum class VIZARIO_STATUS
{
    STAT_IDLE = 1,
    STAT_BUSY = 2,
    STAT_UNKNOWN = 3,
    STAT_MAX_TYPE
};

enum class VIZARIO_CMDTYPE
{
    CMD_CONFIG = 1,
    CMD_RECONFIG = 2,
    CMD_STARTCAMERA = 3,
    CMD_STOPCAMERA = 4,
    CMD_CREATETRACKER = 5,
    CMD_STARTSTOPTRACKER = 6,
    CMD_DESTROYTRACKER = 7,
	  CMD_INVALIDATECONFIG = 8,
    CMD_MAX_TYPE
};

enum class VIZARIO_IMGFORMATTYPE
{
	FMT_RGB24 = 1,
	FMT_YUV2 = 2,  // BEWARE, YUV2 is also known as YUYV, so not sure if this is a good naming!
	FMT_BGRA32 = 3,
  FMT_YUYV = 4,
  FMT_BGR24 = 5,
	FMT_YONLY = 7,
	FMT_MAX_TYPE
};

enum class VIZARIO_MESSAGETYPE
{
	MSG_NOTIFYNEWDATA = 1,
	MSG_CONVERTINPUTDATA = 2,
	MSG_GARBAGECOLLECT = 3,
	MSG_MAX_TYPE
};

// http://blog.bitwigglers.org/using-enum-classes-as-type-safe-bitmasks/

template<typename Enum>
struct EnableBitMaskOperators
{
	static const bool enable = false;
};

template<typename Enum>
typename std::enable_if<EnableBitMaskOperators<Enum>::enable, Enum>::type
operator |(Enum lhs, Enum rhs)
{
	using underlying = typename std::underlying_type<Enum>::type;
	return static_cast<Enum> (
		static_cast<underlying>(lhs) |
		static_cast<underlying>(rhs)
		);
}

template<typename Enum>
typename std::enable_if<EnableBitMaskOperators<Enum>::enable, Enum>::type
operator &(Enum lhs, Enum rhs)
{
	using underlying = typename std::underlying_type<Enum>::type;
	return static_cast<Enum> (
		static_cast<underlying>(lhs) &
		static_cast<underlying>(rhs)
		);
}

template<typename Enum>
typename std::enable_if<EnableBitMaskOperators<Enum>::enable, Enum>::type
operator ^(Enum lhs, Enum rhs)
{
	using underlying = typename std::underlying_type<Enum>::type;
	return static_cast<Enum> (
		static_cast<underlying>(lhs) ^
		static_cast<underlying>(rhs)
		);
}

template<typename Enum>
typename std::enable_if<EnableBitMaskOperators<Enum>::enable, Enum>::type
operator ~(Enum rhs)
{
	using underlying = typename std::underlying_type<Enum>::type;
	return static_cast<Enum> (
		~static_cast<underlying>(rhs)
		);
}

template<typename Enum>
typename std::enable_if<EnableBitMaskOperators<Enum>::enable, Enum>::type &
operator |=(Enum &lhs, Enum rhs)
{
	using underlying = typename std::underlying_type<Enum>::type;
	lhs = static_cast<Enum> (
		static_cast<underlying>(lhs) |
		static_cast<underlying>(rhs)
		);

	return lhs;
}

template<typename Enum>
typename std::enable_if<EnableBitMaskOperators<Enum>::enable, Enum>::type &
operator &=(Enum &lhs, Enum rhs)
{
	using underlying = typename std::underlying_type<Enum>::type;
	lhs = static_cast<Enum> (
		static_cast<underlying>(lhs) &
		static_cast<underlying>(rhs)
		);

	return lhs;
}

template<typename Enum>
typename std::enable_if<EnableBitMaskOperators<Enum>::enable, Enum>::type &
operator ^=(Enum &lhs, Enum rhs)
{
	using underlying = typename std::underlying_type<Enum>::type;
	lhs = static_cast<Enum> (
		static_cast<underlying>(lhs) ^
		static_cast<underlying>(rhs)
		);

	return lhs;
}

#define ENABLE_BITMASK_OPERATORS(x) \
template<>                          \
struct EnableBitMaskOperators<x>    \
{                                   \
static const bool enable = true;    \
};

enum class VIZARIO_CONVERSIONMODIFIER : unsigned
{
	CVT_TO_YONLY				= 0x1,
	CVT_ALL_MIPMAPS				= 0x2,
	CVT_FLIP_V					= 0x4,
	CVT_SAVE_PYRAMID_TO_FILE	= 0x8
};
ENABLE_BITMASK_OPERATORS(VIZARIO_CONVERSIONMODIFIER)

typedef struct IChnk
{
	typedef struct dPtr
	{
		dPtr() {
			for (int32_t i = 0; i < 8; i++)
				m_lvl[i] = NULL;
		}
		~dPtr() {
			if (m_lvl[0])
				delete[] m_lvl[0];
		}
		uint8_t* m_lvl[8];
	} dataPtr;

	DECLDIR IChnk();
	DECLDIR IChnk(const int32_t m_w, const int32_t m_h, const VIZARIO_IMGFORMATTYPE m_f, const int32_t m_id, const std::string poseString);

	int32_t m_basewidth;
	int32_t m_baseheight;
	int32_t m_frameID;
	int32_t m_dataSize;
	std::string m_poseInfo;
	VIZARIO_IMGFORMATTYPE m_baseformat;
	std::shared_ptr<dataPtr> m_levels;
} ImageChunk;
typedef  std::shared_ptr<ImageChunk> ImageChunkPtr;

// prototype of callbacks - these are used from Unity
typedef void(STDCALL *intStringCallback)(const int32_t dllID, const VCHAR* message);
typedef const VCHAR*(STDCALL *str_intStringCallback)(const int32_t dllID, const VCHAR* message);
// these are only used in C++
typedef void(STDCALL *objStringCallback)(void* thisptr, const char* data);
typedef bool(STDCALL *objUint8PtrIntStringIntCallback)(void* thisptr, const uint8_t* rawbytes, const int32_t rawbytessize, const char* data, const int32_t value);


#endif // _VizarioCoreCallbacks_h_included_
