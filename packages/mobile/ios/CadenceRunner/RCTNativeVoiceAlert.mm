#import <React/RCTBridgeModule.h>
#import <React-RCTAppDelegate/RCTAppDelegate.h>

#import "RCTNativeVoiceAlert.h"
#import "CadenceRunner-Swift.h"

@implementation RCTNativeVoiceAlert {
    VoiceAlertEngine *engine;
}

- (id)init {
    if (self = [super init]) {
        engine = [VoiceAlertEngine new];
    }
    return self;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
    return std::make_shared<facebook::react::NativeVoiceAlertSpecJSI>(params);
}

- (void)speak:(NSString *)text {
    [engine speak:text];
}

- (void)stop {
    [engine stop];
}

+ (NSString *)moduleName {
    return @"NativeVoiceAlert";
}

@end
