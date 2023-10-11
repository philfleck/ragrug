extern "C" {

typedef void(*stringCallback)(const char16_t* message);

void querySSID(stringCallback cb);

}
