import React from 'react';
import {View,Text,StyleSheet,BackHandler,ToastAndroid,Platform,Alert,StatusBar,Dimensions,PixelRatio,PermissionsAndroid,NativeModules} from 'react-native';
import 'react-native-gesture-handler';
import RNExitApp from 'react-native-exit-app';
import SplashScreen from 'react-native-splash-screen';//https://ingg.dev/rn-splash/
import DeviceInfo from 'react-native-device-info';
import Orientation from 'react-native-orientation';
import AsyncStorage from '@react-native-community/async-storage';
import CryptoJS from "react-native-crypto-js";
import messaging from '@react-native-firebase/messaging';
import { Provider } from 'react-redux';
import initStore from './src/Ducks/mainStore';
const store = initStore();
import RNIap from 'react-native-iap';
import AppHomeStack from './src/Route/Navigation';
import 'moment/locale/ko'
import  moment  from  "moment";
//공통상수 필요에 의해서 사용
import Geolocation from 'react-native-geolocation-service';
import  * as getDEFAULT_CONSTANTS   from './src/Constants';
const {width: SCREEN_WIDTH,height: SCREEN_HEIGHT} = Dimensions.get("window");
const DEFAULT_CONSTANTS = getDEFAULT_CONSTANTS.DEFAULT_CONSTANTS;
const DEFAULT_TEXT = getDEFAULT_CONSTANTS.DEFAULT_TEXT;
const DEFAULT_COLOR = getDEFAULT_CONSTANTS.DEFAULT_COLOR;
import CommonUtil from './src/Utils/CommonUtil';
import CommonFunction from './src/Utils/CommonFunction';
import Loader from './src/Utils/Loader';
import AppLink from './src/Utils/AppLink';

const todays = new Date();
const topicTimes = todays.getHours();
//amplifier
import { Auth } from "@psyrenpark/auth";
import { Api } from "@psyrenpark/api";
import { Storage } from "@psyrenpark/storage";
import awsmobile from "./aws-exports";
Auth.setConfigure(awsmobile);
Api.setConfigure(awsmobile);
Storage.setConfigure(awsmobile);

import codePush from 'react-native-code-push';
import CodePushComponent from './CodePushComponent';
const codePushOptions = {
    checkFrequency: codePush.CheckFrequency.ON_APP_START,
    installMode: codePush.InstallMode.IMMEDIATE,
}

import PopupScreen from './src/Components/PopupScreen20211101';
import { apiObject } from "./src/Apis/Member";

//Text.defaultProps = Text.defaultProps || {};
//Text.defaultProps.allowFontScaling = false;

class App extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {   
            loading : true,
            showNoticePop : false,
            authCurrentSession : false,
            isInstalledMTAP : false,                
            isConnected : true, 
            exitApp : false,
            orientation : '',
            fcmToken : null,
            thisUUID : null,
            deviceModel : null,
            saveUserToken : null,
            pushRouteName : null,
            pushRouteIdx :0
        };
    }  

    //급매물 서비스 영수증 체크 
    checkSubscriptions = async(receipt,mode) => {
        ////console.log('checkSubscriptions',receipt)
        let isValidated = false;
        if ( Platform.OS === 'ios') {
            //const receipt = await AsyncStorage.getItem('user_receipt');
            //console.log('checkSubscriptions',receipt)
            if (receipt) {
                //const newReceipt = await RNIap.getReceiptIOS(); //영수증가져오기
                const validated = await RNIap.validateReceiptIos(
                    {
                        'receipt-data': receipt,
                        password: DEFAULT_CONSTANTS.iosAppSharePassword,
                    }
                );
                //console.log('validated',validated)
                if (validated !== false && validated.status === 0) {
                    isValidated = true;
                    if( mode === 'user') {
                        AsyncStorage.setItem('user_receipt', receipt);
                    }else{
                        AsyncStorage.setItem('agent_receipt', receipt);
                    }
                    
                } else {
                    isValidated = false;
                    if( mode === 'user') {
                        AsyncStorage.removeItem('user_receipt');
                    }else{
                        AsyncStorage.removeItem('agent_receipt');
                    }                    
                }
            }
        }else{
            if (receipt) {
                try {
                    const purchases = await RNIap.getAvailablePurchases();
                    let androidreceipt = purchases[0].transactionReceipt;
                    if (purchases[1].purchaseToken) {
                        androidreceipt = purchases[1].purchaseToken;
                    }
                    if ( androidreceipt === receipt ) {
                        isValidated = true;
                        if( mode === 'user') {
                            AsyncStorage.setItem('user_receipt', receipt);
                        }else{
                            AsyncStorage.setItem('agent_receipt', receipt);
                        }
                    }else{
                        isValidated = false;
                        if( mode === 'user') {
                            AsyncStorage.removeItem('user_receipt');
                        }else{
                            AsyncStorage.removeItem('agent_receipt');
                        }  
                    }
                } catch (error) {
                    isValidated = false;
                    if( mode === 'user') {
                        AsyncStorage.removeItem('user_receipt');
                    }else{
                        AsyncStorage.removeItem('agent_receipt');
                    }  
                }
            }
        }
        return isValidated;
    }
    getUserInformation = async (uid) => {
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_getUserInfo({
                locale: "ko",
                member_uuid : uid
            }); 
            
            if ( returnCode.code === '0000') {
                return returnCode.data;
            }else{
                return false;
            }
        }catch(e){
            return false;
        }
    }
    // 조건설정 정보 가져오기
    checkStorageCondition = async () => {
        try {
            const mapCondition = await AsyncStorage.getItem('mapCondition');
            //console.log('mapCondition',mapCondition)
            if(mapCondition !== null) {  
                const mapCondition2 = JSON.parse(mapCondition);
                //console.log('mapCondition.condition',mapCondition2.condition)
                if(!CommonUtil.isEmpty(mapCondition2.condition)) {
                    await  AsyncStorage.setItem('mapCondition',
                        JSON.stringify({
                            stime : mapCondition2.stime,
                            condition : {                
                                realEstedGubun : 'A',
                                realEstedOption :  mapCondition2.condition.realEstedOption,
                                priceLevel : mapCondition2.condition.realEstedOption,
                                saleRate : mapCondition2.condition.saleRate
                            }
                        })
                    ); 
                }
            }else{
                await  AsyncStorage.setItem('mapCondition',
                    JSON.stringify({
                        stime : moment().unix(),
                        condition : {                
                            realEstedGubun : 'A',
                            realEstedOption :  null,
                            priceLevel : {
                                sPriceLevel : 1,
                                ePriceLevel : 100
                            },
                            saleRate : {
                                sSaleRate : 10,
                                eSaleRate : 50
                            },
                        }
                    })
                ); 
            } 
            
        } catch(e) {                        
            
        }
    }

    loginAction = async (userInfo_uid) => {

        if ( !CommonUtil.isEmpty(userInfo_uid) ) {
            let userInfo = await this.getUserInformation(userInfo_uid);   
            if ( !CommonUtil.isEmpty(userInfo.memberInfo) && !CommonUtil.isEmpty(userInfo.memberInfo.member_pk) ) {
                let agentInfo = {};
                //console.log('userInfo.memberInfo',userInfo.memberInfo)
                if ( !CommonUtil.isEmpty(userInfo.agentInfo))  agentInfo = userInfo.agentInfo;
                await AsyncStorage.setItem('saveUserToken', JSON.stringify(
                    {
                        ...userInfo.memberInfo,
                        ...agentInfo[0]
                    }
                ));
               
                this.setState({
                    //loading : false,
                    saveUserToken : {
                        ...userInfo.memberInfo,
                        ...agentInfo[0]
                    }
                })
                //fcm 구독확인
                messaging().unsubscribeFromTopic('realestate_2_5').then(() => {
                    //console.log('realestate_2_5 remove okay');
                }).catch(() => {});
                messaging().unsubscribeFromTopic('realestate_5_8').then(() => {
                    //console.log('realestate_5_8 remove okay');
                }).catch(() => {});
                messaging().unsubscribeFromTopic('realestate_8_11').then(() => {
                    //console.log('realestate_8_11 remove okay');
                }).catch(() => {});
                messaging().unsubscribeFromTopic('realestate_11_14').then(() => {
                    //console.log('realestate_11_14 remove okay');
                }).catch(() => {});
                messaging().unsubscribeFromTopic('realestate_14_17').then(() => {
                    //console.log('realestate_14_17 remove okay');
                }).catch(() => {});
                messaging().unsubscribeFromTopic('realestate_17_20').then(() => {
                    //console.log('realestate_17_20 remove okay');
                }).catch(() => {});
                messaging().unsubscribeFromTopic('realestate_20_23').then(() => {
                    //console.log('realestate_20_23 remove okay');
                }).catch(() => {});
                
                //const fcmTopic = DEFAULT_CONSTANTS.fcmCommonTopic;
                let timeTopic = 'realestate_2_5';
                if ( topicTimes >= 5 && topicTimes < 8 ) {
                    timeTopic = 'realestate_5_8';
                }else if ( topicTimes >= 8 && topicTimes < 9 ) {
                    timeTopic = 'realestate_8_11';
                }else if ( topicTimes >= 10 && topicTimes < 14 ) {
                    timeTopic = 'realestate_11_14';
                }else if ( topicTimes >= 14 && topicTimes < 17 ) {
                    timeTopic = 'realestate_14_17';
                }else if ( topicTimes >= 17 && topicTimes < 20 ) {
                    timeTopic = 'realestate_17_20';
                }else if ( topicTimes >= 20 && topicTimes < 23 ) {
                    timeTopic = 'realestate_20_23';
                }else if ( topicTimes > 23 && topicTimes < 2 ) {
                    timeTopic = 'realestate_23_2';
                }else{
                    timeTopic = 'realestate_2_5';
                }
                
                if ( !CommonUtil.isEmpty(this.state.fcmToken) ) {
                    if ( !CommonUtil.isEmpty(userInfo.memberInfo.is_notification)) {
                        if ( userInfo.memberInfo.is_notification ) {
                            messaging().subscribeToTopic(timeTopic).then(() => {}).catch(() => {});
                        }else{//구독취소
                            messaging().unsubscribeFromTopic(timeTopic).then(() => {}).catch(() => {});
                        }
                    }
                }
                
               
                if ( !CommonUtil.isEmpty(userInfo.memberInfo.receipt)) {                    
                    await this.checkSubscriptions(userInfo.agentInfo.receipt,'user');
                }else if ( !CommonUtil.isEmpty(userInfo.agentInfo.receipt)) {
                    await this.checkSubscriptions(userInfo.agentInfo.receipt,'agent');
                }
            }else{
                //this.setState({loading:false})
            }
        }else{
            //this.setState({loading:false})
        }
    }

    checkToLoginFunction = async (props) => {
        Auth.currentSessionProcess(
          async (data) => {
            //console.log('checkToLoginFunction',data)
            // 성공처리 및 로그인 된 상태
            // 자동 로그인 필요
            // 서버에서 유저 정보 필요시 여기서 비동기로 가져올것
            return true;
          },
          (error) => {
            // 실패처리 및 로그아웃 상태
            // 로그인 화면으로 이동 필요
            //console.log('checkToLoginFunction logout');
            return true;
          },
          null
        );
      };

    // 비동기 방식
    isCheckToLoginFunction = async (props) => {
        try {
            const auth = await Auth.currentSession();
            return true;
        } catch (error) {
            return false;
        }
    }
    // 조건설정 정보 가져오기
    showNotification = async () => {
        //AsyncStorage.removeItem('isNoticePop20211101');
        try {
            const isNoticePop20211101 = await AsyncStorage.getItem('isNoticePop20211101');
            if(isNoticePop20211101 == null) {  
                this.setState({showNoticePop:true})
            }
        } catch(e) {                        
            console.log('showNotification',e)
        }
    }

    moveAppStore = async() => {
        
        const appStoreId = DEFAULT_CONSTANTS.iosAppStoreID;
        const playStoreId = DEFAULT_CONSTANTS.androidPackageName;
        if ( Platform.OS === 'ios') {
            AppLink.openInStore({ appStoreId}).then(() => {
                setTimeout(() => {
                    RNExitApp.exitApp()
                },1000)                
            })
            .catch((err) => {
                // handle error
            });
        }else{
            AppLink.openInStore({ playStoreId}).then(() => {
                RNExitApp.exitApp();
            })
            .catch((err) => {
            // handle error
            });
        }

        //openInStore(DEFAULT_CONSTANTS.appName,DEFAULT_CONSTANTS.iosAppStoreID,'en',DEFAULT_CONSTANTS.androidPackageName)
    }
    isForceAppStoreUpdate = async() => {
        //console.log('DEFAULT_CONSTANTS.iosAppStoreID',DEFAULT_CONSTANTS.androidPackageName)
        const VersionCheck = NativeModules.RNVersionCheck ? NativeModules.RNVersionCheck : null;
        //console.log('VersionCheck',VersionCheck);
        if ( VersionCheck == null ) {     
            this.setState({loading:false})       
            Alert.alert(
                "[착한부동산 관리자]",
                "앱의 새로운 버전이 출시되었습니다. 이동후 업데이트 진행해주세요.\n스토어이동후 업데이트가 안뜰경우 삭제후 다시 설치를 진행해주세요 ",
                [
                    {text: '업데이트 이동', onPress: () => this.moveAppStore()},
                ],
                {cancelable: false},
            );
        }else{
            this.setState({loading:false})
        }
    }
    
    async UNSAFE_componentWillMount() {
        
        //await this.showNotification();
        await this.checkStorageCondition();
        await this.requestUserPermissionForFCM();
        this.getLocation();
        const authCurrentSession = await this.isCheckToLoginFunction();
        const autoLogin = await AsyncStorage.getItem('autoLogin');
        console.log('autoLogin',autoLogin)
        console.log('authCurrentSession',authCurrentSession)
        if(!CommonUtil.isEmpty(autoLogin) && authCurrentSession  ) {
            await this.loginAction(autoLogin)
        }else{
            await AsyncStorage.setItem('saveUserToken','');
            //this.setState({loading:false})
        }
        let makeUUID =  DeviceInfo.getMacAddressSync() + DeviceInfo.getUniqueId();        
        let deviceModel = DeviceInfo.getModel();
        let uuid =  DEFAULT_CONSTANTS.appID + CryptoJS.MD5(makeUUID).toString()
        await this.setState({authCurrentSession,thisUUID:uuid,deviceModel:deviceModel})
        
        this.messageListener();
        BackHandler.addEventListener('hardwareBackPress', this.rootHandleBackButton);   
        const initial = Orientation.getInitialOrientation();
        Orientation.lockToPortrait();
        await this.isForceAppStoreUpdate();
    }
    
    componentDidMount() {
        Dimensions.addEventListener( 'change', () =>    {        
            this.getOrientation();
        });
    }
  
 
    UNSAFE_componentWillUnmount() {
        Orientation.getOrientation((err, orientation) => {});
        Orientation.removeOrientationListener(this._orientationDidChange);
    }

    getLocation = async () => {
        /*
        const hasLocationPermission = await this.hasLocationPermission();
        console.log('hasLocationPermission',hasLocationPermission)

        if ( hasLocationPermission ) {
            this.setMyBaseLocation();
        }else{
            return ;
        }
        */
        Promise.resolve(
            this.hasLocationPermission()
        )
        .then((appLaunched) => {
            SplashScreen.hide();  
        });

        
    };

    setMyBaseLocation = () => {
        () => {
            Geolocation.getCurrentPosition(
                (position) => {
                    this.setState({
                        fixedLatitude: position.coords.latitude,
                        fixedLongitude: position.coords.longitude,
                        currentLatitude : position.coords.latitude,
                        currentLongitude : position.coords.longitude,
                        //loading: false 
                    })
                },
                (error) => {
                    //this.setState({ loading: false });
                    ////console.log(error);
                },
                {
                    enableHighAccuracy: this.state.highAccuracy,
                    timeout: 15000,
                    maximumAge: 10000,
                    distanceFilter: 0,
                    forceRequestLocation: this.state.forceLocation,
                    showLocationDialog: this.state.showLocationDialog,
                },
            );
        };
    }
    hasLocationPermissionIOS = async () => {
        const openSetting = () => {
            Linking.openSettings().catch(() => {
                Alert.alert('Unable to open settings');
            });
        };
        const status = await Geolocation.requestAuthorization('whenInUse');
    
        if (status === 'granted') {
          return true;
        }
    
        if (status === 'denied') {
          //Alert.alert('Location permission denied');
          CommonFunction.fn_call_toast('위치권한을 거절하여 기본위치로 노출됩니다.',2000) ;
        }
    
        if (status === 'disabled') {
           
        }
    
        return false;
    };
    
    hasLocationPermission = async () => {
        if (Platform.OS === 'ios') {
            const hasPermission = await this.hasLocationPermissionIOS();
            return hasPermission;
        }
    
        if (Platform.OS === 'android' && Platform.Version < 23) {
            return true;
        }
    
        const hasPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
    
        if (hasPermission) {
            return true;
        }
    
        const status = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
    
        if (status === PermissionsAndroid.RESULTS.GRANTED) {
            return true;
        }
    
        if (status === PermissionsAndroid.RESULTS.DENIED) {
            CommonFunction.fn_call_toast('위치권한을 거절하여 기본위치로 노출됩니다...',2000) ;
        } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            CommonFunction.fn_call_toast('위치권한을 거절하여 기본위치로 노출됩니다..',2000) ;
        }

        return false;
    };

  
    messageListener = async () => {    
        
        //백그라운드에서 푸시를 받으면 호출됨 
        messaging().setBackgroundMessageHandler(async remoteMessage => {
            //console.log('Message handled in the background!2', remoteMessage);
          
            const { title, body } = remoteMessage.notification;
            const { routeIdx, routeName } = remoteMessage.data;
            this.setState({
                fcmTitle :  title,
                fcmbody : body,
                pushRouteName : routeName,
                pushRouteIdx :routeIdx,
                loading:false
            })
        });
    }

    requestUserPermissionForFCM = async () => {
        const authStatus = await messaging().requestPermission();
        const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
            const fcmToken = await messaging().getToken();
            if ( !CommonUtil.isEmpty(fcmToken) ) {
                //this.setFcmTokenToDataBase(fcmToken,Platform.OS,this.state.thisUUID)
                const fcmTopic = DEFAULT_CONSTANTS.fcmCommonTopic;
                messaging()
                .subscribeToTopic(fcmTopic)
                .then(() => {
                    //console.log('fcmTopicResult');
                    //Toast.showWithGravity(`${topic} 구독 성공!!`, Toast.LONG, Toast.TOP);
                })
                .catch(() => {
                    //console.log('fcmTopicResult22222');
                    //Toast.showWithGravity(`${topic} 구독 실패! ㅜㅜ`, Toast.LONG, Toast.TOP);
                });
            }
            this.setState({fcmToken : fcmToken})
            this.handleFcmMessage();
        } else {
            console.log('fcm auth fail');
        }
    }

    handleFcmMessage = () => {
        //알림창을 클릭한 경우 호출됨 
        messaging().getInitialNotification()
        .then(remoteMessage => {
            if (remoteMessage) {
                const { title, body } = remoteMessage.notification;
                const { routeIdx, routeName } = remoteMessage.data;
                this.setState({
                    fcmTitle :  title,
                    fcmbody : body,
                    pushRouteName : routeName,
                    pushRouteIdx :routeIdx
                })
            }
        });
        
        //푸시를 받으면 호출됨 
        const unsubscribe = messaging().onMessage(async remoteMessage => {
            //Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
            //console.log('remoteMessage:',remoteMessage);
            const { title, body } = remoteMessage.notification;
            const { routeIdx, routeName } = remoteMessage.data;
            this.setState({
                fcmTitle :  title,
                fcmbody : body,
                pushRouteName : routeName,
                pushRouteIdx :routeIdx
            })
        });
        return unsubscribe;
    }
     
    getOrientation = () => {        
        if( this.rootView ){            
            if( Dimensions.get('window').width < Dimensions.get('window').height ){                
                this.setState({ orientation: 'portrait' });
            }else{                
                this.setState({ orientation: 'landscape' });
            }
        }
    }

    rootHandleBackButton = () => {      
        if ( this.state.exitApp ) {
            clearTimeout(this.timeout);
            this.setState({ exitApp: false });
            RNExitApp.exitApp();
        } else {
            ToastAndroid.show('한번 더 누르시면 종료됩니다.', ToastAndroid.SHORT);
            this.setState({ exitApp: true});
            this.timeout = setTimeout(
                () => {
                    this.setState({ exitApp: false});
                },
                2000    // 2초
            );                        
        }
        return true;
    }; 

    
    setFcmTokenToDataBase = async(fcmToken,ostype,uuid) => {
        
    }

    requestPermission = async () => {
        try {
            await firebase.messaging().requestPermission();
            // User has authorised
        } catch (error) {
            // User has rejected permissions
            //console.log('requestPermission error : ', error);
        }
    }

    closePopUp = async() => {
        this.setState({isNoticePop:false})
    }

    showAlert = async(title, message,idx) => {
        Alert.alert(
            title,
            message,
            [
                {text: '닫기', onPress: () => console.log('OK Pressed')},
            ],
            {cancelable: false},
        );
    }

   

    render() {
        if ( this.state.loading ) {
            return (
                <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} />
            )
        }else {
            return (
            <Provider store={store} >                
                { Platform.OS == 'android' && <StatusBar backgroundColor={'#fff'} translucent={false}  barStyle="dark-content" />}
                { 
                    this.state.showNoticePop &&
                    <PopupScreen 
                        isVisible={this.state.showNoticePop}
                        screenState={{closePopUp:this.closePopUp.bind(this)}}
                        screenProps={this.props}
                    /> 
                }
                <CodePushComponent />
                <AppHomeStack screenState={this.state} screenProps={this.props} />
            </Provider>
            );
        }
    }
}


const styles = StyleSheet.create({
    Rootcontainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor : "#fff",
    },
    introImageWrapper : {
    },
    IndicatorContainer : {
        flex: 1,
        width:'100%',
        backgroundColor : "#fff",
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

//export default App;
export default codePush(codePushOptions)(App)