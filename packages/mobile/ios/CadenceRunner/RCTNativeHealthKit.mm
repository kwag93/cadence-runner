#import <React/RCTBridgeModule.h>
#import <React-RCTAppDelegate/RCTAppDelegate.h>

#import "RCTNativeHealthKit.h"
#import "CadenceRunner-Swift.h"

@implementation RCTNativeHealthKit {
    HealthKitEngine *engine;
}

- (id)init {
    if (self = [super init]) {
        engine = [HealthKitEngine new];
    }
    return self;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
    return std::make_shared<facebook::react::NativeHealthKitSpecJSI>(params);
}

- (void)requestAuthorization {
    [engine requestAuthorization];
}

- (void)saveWorkout:(NSString *)startDate
            endDate:(NSString *)endDate
    durationSeconds:(double)durationSeconds
         avgCadence:(double)avgCadence {
    [engine saveWorkoutWithStartDate:startDate endDate:endDate durationSeconds:durationSeconds avgCadence:avgCadence];
}

- (NSNumber *)isAvailable {
    return @([HealthKitEngine isAvailable]);
}

+ (NSString *)moduleName {
    return @"NativeHealthKit";
}

@end
