// React 헤더를 Swift 브릿지 헤더보다 먼저 import하여
// AppDelegate의 RN 의존성이 resolve되도록 합니다.
#import <React/RCTBridgeModule.h>
#import <React-RCTAppDelegate/RCTAppDelegate.h>

#import "RCTNativeMetronome.h"
#import "CadenceRunner-Swift.h"

@implementation RCTNativeMetronome {
    MetronomeEngine *engine;
}

- (id)init {
    if (self = [super init]) {
        engine = [MetronomeEngine new];
    }
    return self;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
    return std::make_shared<facebook::react::NativeMetronomeSpecJSI>(params);
}

- (void)start:(double)bpm {
    [engine start:bpm];
}

- (void)stop {
    [engine stop];
}

- (void)setBpm:(double)bpm {
    [engine setBpm:bpm];
}

- (NSNumber *)isPlaying {
    return @([engine isPlaying]);
}

+ (NSString *)moduleName {
    return @"NativeMetronome";
}

@end
