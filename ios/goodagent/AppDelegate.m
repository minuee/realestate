#import <Firebase.h>
#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

#import <KakaoOpenSDK/KakaoOpenSDK.h>
#import <NaverThirdPartyLogin/NaverThirdPartyLoginConnection.h>

#import <CodePush/CodePush.h>

#ifdef FB_SONARKIT_ENABLED
#import <FlipperKit/FlipperClient.h>
#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>
#import <FlipperKitReactPlugin/FlipperKitReactPlugin.h>



static void InitializeFlipper(UIApplication *application) {
  FlipperClient *client = [FlipperClient sharedClient];
  SKDescriptorMapper *layoutDescriptorMapper = [[SKDescriptorMapper alloc] initWithDefaults];
  [client addPlugin:[[FlipperKitLayoutPlugin alloc] initWithRootNode:application withDescriptorMapper:layoutDescriptorMapper]];
  [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
  [client addPlugin:[FlipperKitReactPlugin new]];
  [client addPlugin:[[FlipperKitNetworkPlugin alloc] initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];
  [client start];
}
#endif

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    if ([FIRApp defaultApp] == nil) {
        [FIRApp configure];
    }
    #ifdef FB_SONARKIT_ENABLED
    InitializeFlipper(application);
    #endif

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"goodagent"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  [[NaverThirdPartyLoginConnection getSharedInstance] setIsNaverAppOauthEnable:YES];
  [KOSession sharedSession].automaticPeriodicRefresh = YES;

  return YES;
}

- (BOOL)application:(UIApplication *)app
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
  {
	if ([url.scheme isEqualToString:@"kr.com.realestate"]) {
		return [[NaverThirdPartyLoginConnection getSharedInstance] application:app openURL:url options:options];
  }
  if ([KOSession isKakaoAccountLoginCallback:url]) {
		return [KOSession handleOpenURL:url];
	}
	return NO;
}

- (BOOL)handleWithUrl:(NSURL *)url {
  NSLog(@"url : %@", url);
  NSLog(@"url scheme : %@", url.scheme);
  //NSLog(@"url scheme : %@", kServiceAppUrlScheme);
  // NSLog(@"result - %d", [url.scheme isEqualToString:kServiceAppUrlScheme]);

  
      // 네이버앱으로부터 전달받은 url값을 NaverThirdPartyLoginConnection의 인스턴스에 전달
      NaverThirdPartyLoginConnection *thirdConnection = [NaverThirdPartyLoginConnection getSharedInstance];
      THIRDPARTYLOGIN_RECEIVE_TYPE resultType = [thirdConnection receiveAccessToken:url];

      if (SUCCESS == resultType) {
        NSLog(@"Getting auth code from NaverApp success!");
      } else {
        NSLog(@"  Error  ::  %u", resultType);
        // 앱에서 resultType에 따라 실패 처리한다.
        /*  SUCCESS = 0, PARAMETERNOTSET = 1, CANCELBYUSER = 2, NAVERAPPNOTINSTALLED = 3 , NAVERAPPVERSIONINVALID = 4,
         .  OAUTHMETHODNOTSET = 5, INVALIDREQUEST = 6, CLIENTNETWORKPROBLEM = 7, UNAUTHORIZEDCLIENT = 8,
         .  UNSUPPORTEDRESPONSETYPE = 9, NETWORKERROR = 10, UNKNOWNERROR = 11 */
      }
  return YES;
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
  [KOSession handleDidBecomeActive];
}
- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  //return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  return [CodePush bundleURL];
#endif
}


@end
