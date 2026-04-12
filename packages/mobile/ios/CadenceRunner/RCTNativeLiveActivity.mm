#import <React/RCTBridgeModule.h>
#import <React-RCTAppDelegate/RCTAppDelegate.h>

#import "RCTNativeLiveActivity.h"
#import "CadenceRunner-Swift.h"

@implementation RCTNativeLiveActivity {
    LiveActivityManager *manager;
}

- (id)init {
    if (self = [super init]) {
        manager = [LiveActivityManager new];
    }
    return self;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
    return std::make_shared<facebook::react::NativeLiveActivitySpecJSI>(params);
}

- (void)startActivity:(double)targetBpm {
    [manager startActivityWithTargetBpm:(NSInteger)targetBpm];
}

- (void)updateActivity:(double)elapsedSeconds
            currentSpm:(double)currentSpm
             targetBpm:(double)targetBpm
          metronomeOn:(BOOL)metronomeOn {
    [manager updateActivityWithElapsedSeconds:(NSInteger)elapsedSeconds
                                  currentSpm:(NSInteger)currentSpm
                                   targetBpm:(NSInteger)targetBpm
                                metronomeOn:metronomeOn];
}

- (void)endActivity {
    [manager endActivity];
}

+ (NSString *)moduleName {
    return @"NativeLiveActivity";
}

@end
