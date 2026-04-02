#import <React/RCTBridgeModule.h>
#import <React-RCTAppDelegate/RCTAppDelegate.h>

#import "RCTNativeCadence.h"
#import "CadenceRunner-Swift.h"

@implementation RCTNativeCadence {
    CadenceEngine *engine;
}

- (id)init {
    if (self = [super init]) {
        engine = [CadenceEngine new];
    }
    return self;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
    return std::make_shared<facebook::react::NativeCadenceSpecJSI>(params);
}

- (void)start {
    [engine start];
}

- (void)stop {
    [engine stop];
}

- (NSNumber *)isAvailable {
    return @([CadenceEngine isAvailable]);
}

- (NSNumber *)getCurrentSpm {
    return @([engine currentSpm]);
}

+ (NSString *)moduleName {
    return @"NativeCadence";
}

@end
