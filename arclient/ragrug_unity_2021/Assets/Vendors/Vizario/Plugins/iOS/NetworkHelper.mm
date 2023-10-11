#import <NetworkExtension/NetworkExtension.h>
#include "NetworkHelper.h"

extern "C" {
    void querySSID(stringCallback cb)
    {
        __block NSString* strSSID = nil;
        if (@available(iOS 14.0, *)) {
            [NEHotspotNetwork fetchCurrentWithCompletionHandler:^(NEHotspotNetwork * _Nullable currentNetwork) {
                strSSID = [currentNetwork SSID];
                // NSLog(@"This is our fucking SSID: %@",strSSID);
                if(cb) {
                    unichar * data = new unichar[64];
                    [strSSID getCharacters:data range:NSMakeRange(0,fmin(strSSID.length,64))];
                    cb((char16_t*) data);
                }
            }];
        } else {
            // NSLog(@"Fuck you!");
            if(cb) {
                unichar * data = new unichar[64];
                [@"Not available!" getCharacters:data range:NSMakeRange(0,fmin([@"Not available!" length],64))];
                cb((char16_t*) data);
            }
        }
    }
}
