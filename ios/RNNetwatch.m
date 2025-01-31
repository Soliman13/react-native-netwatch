//
//  RNNetwatch.m
//  RNNetwatch
//
//  Copyright © 2020 Imran Mentese. All rights reserved.
//

#import "RNNetwatch.h"
#import "NetwatchInterceptor.h"

@implementation RNNetwatch

RCT_EXPORT_MODULE(RNNetwatch);

RCT_EXPORT_METHOD(startNetwatch) {
    // curent config
    NSURLSessionConfiguration *configuration = [NSURLSessionConfiguration defaultSessionConfiguration];
    NSArray *currentProtocolClasses = configuration.protocolClasses ?: @[];
    
    // add Netwatch interceptor
    NSMutableArray *protocolClasses = [NSMutableArray arrayWithArray:currentProtocolClasses];
    [protocolClasses insertObject:[NetwatchInterceptor class] atIndex:0];
    
    // inject new config
    configuration.protocolClasses = protocolClasses;
    [NSURLProtocol registerClass:[NetwatchInterceptor class]];
}

RCT_EXPORT_METHOD(getNativeRequests : (RCTResponseSenderBlock)callback) {
    NSUserDefaults *preferences = [NSUserDefaults standardUserDefaults];

    if ([preferences objectForKey:kNetwatchUserDefault] == nil)
    {
        callback([self returnJSONValue:@""]);
    } else {
        NSArray *cachedRequests = [self readArrayWithCustomObjFromUserDefaults];

        callback([self returnJSONValue: cachedRequests]);
        [[NSUserDefaults standardUserDefaults] removeObjectForKey:kNetwatchUserDefault];
    }
}

-(NSArray *)readArrayWithCustomObjFromUserDefaults
{
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSData *data = [defaults objectForKey:kNetwatchUserDefault];
    NSArray *myArray = [NSKeyedUnarchiver unarchiveObjectWithData:data];
    [defaults synchronize];
    return myArray;
}

- (NSArray *)returnJSONValue:(NSString*)result {
    return @[@{@"result":result}];
}


@end
