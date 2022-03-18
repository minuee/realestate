import React, { Component } from 'react';
import {SafeAreaView,Image,View,StyleSheet,PixelRatio,Dimensions,TouchableOpacity,StatusBar,Linking,KeyboardAvoidingView,ScrollView,Platform,Text} from 'react-native';
import {connect} from 'react-redux';
import ActionCreator from '../../Ducks/Actions/MainActions';
import {Input} from 'react-native-elements';
//import jwt_decode from "jwt-decode";
import * as NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-community/async-storage';
import messaging from '@react-native-firebase/messaging';
import RNIap from 'react-native-iap';
/* SNS Loin */
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'; //google
GoogleSignin.configure(); //google
import { NaverLogin, getProfile } from "@react-native-seoul/naver-login"; //naver
const iosKeys = {
    kConsumerKey: "nyEJ_7s_h3l4IPl3nZFb",
    kConsumerSecret: "yeZpe2DLFG",
    kServiceAppName: "착한부동산(iOS)",
    kServiceAppUrlScheme: "kr.com.realestate" // only for iOS
}; 
const androidKeys = {
    kConsumerKey: "nyEJ_7s_h3l4IPl3nZFb",
    kConsumerSecret: "yeZpe2DLFG",
    kServiceAppName: "착한부동산(안드로이드)"
};
const initials = Platform.OS === "ios" ? iosKeys : androidKeys;//naver
import KakaoLogins from '@react-native-seoul/kakao-login'; //kakao
if (!KakaoLogins) {
    console.error('Module is Not Linked');
}
import appleAuth from '@invertase/react-native-apple-authentication';
//공통상수 필요에 의해서 사용
import  * as getDEFAULT_CONSTANTS   from '../../Constants';
import CommonStyle from '../../Style/CommonStyle';
const DEFAULT_CONSTANTS = getDEFAULT_CONSTANTS.DEFAULT_CONSTANTS;
const DEFAULT_TEXT = getDEFAULT_CONSTANTS.DEFAULT_TEXT;
const DEFAULT_COLOR = getDEFAULT_CONSTANTS.DEFAULT_COLOR;
const {height: SCREEN_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('window');
import {CustomTextR,CustomTextL, CustomTextB, CustomTextM, TextRobotoM,TextRobotoR} from '../../Components/CustomText';
import CommonFunction from '../../Utils/CommonFunction';
import CommonUtil from '../../Utils/CommonUtil';
import CustomAlert from '../../Components/CustomAlert';
import Loader from '../../Utils/Loader';
import CheckConnection from '../../Components/CheckConnection';

//apis
import { Auth, CurrentAuthUiState, AuthType } from "@psyrenpark/auth";
import { apiObject } from "../../Apis/Member";
import jwtDecode from 'jwt-decode';


Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
Input.defaultProps = Input.defaultProps || {};
Input.defaultProps.allowFontScaling = false;

class SignupScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            thisUUID : null,
            loading : true,
            moreLoading :false,
            formUserID : '',
            formPassword : '',
            isMemoryID : false,
            isFocus : true,
            fcmToken : null
        }
    }

 
    
    async UNSAFE_componentWillMount() {
        const isMemoryUserID = await AsyncStorage.getItem('isMemoryUserID');
        if(!CommonUtil.isEmpty(isMemoryUserID) ) {
            this.setState({formUserID:isMemoryUserID,isMemoryID:true});
        }
        if ( !CommonUtil.isEmpty(this.props.rootState)) {
            if ( !CommonUtil.isEmpty(this.props.rootState.thisUUID)) {
                this.props._saveUserFCMToken(this.props.rootState.fcmToken);
                this.setState({
                    thisUUID : this.props.rootState.thisUUID,
                    fcmToken: this.props.rootState.fcmToken,
                })
            }
        }

        if ( __DEV__ ) {
            this.setState({
                formUserID : 'minuee@nate.com',
                formPassword : 'lena47',
            })
        }
        //this.messageListener();
        if ( !CommonUtil.isEmpty(this.props.rootState.pushRouteName) && this.props.rootState.pushRouteIdx > 0 ) {
            //this.movePushPage(this.props.rootState.pushRouteName,this.props.rootState.pushRouteIdx)
        }
        this.props.navigation.addListener('blur', () => {            
           this.setState({loading:false,moreLoading:false})       
        })
    }

    movePushPage = async(routeName,routeIdx) => {
        if ( routeName === 'OrderDetailStack') {
            this.props.navigation.navigate(routeName,{
                screenData : {order_pk : routeIdx }
            });
        }else if ( routeName === 'NoticeDetailStack') {
            this.props.navigation.navigate(routeName,{
                screenData : {notice_pk : routeIdx }
            })
        }
    }

    messageListener = async () => {    
        
        //백그라운드에서 푸시를 받으면 호출됨 
        messaging().setBackgroundMessageHandler(async remoteMessage => {
            const { title, body } = remoteMessage.notification;
            const { routeIdx, routeName } = remoteMessage.data;
            this.setState({
                fcmTitle :  title,
                fcmbody : body,
                pushRouteName : routeName,
                pushRouteIdx :routeIdx
            })
            if ( !CommonUtil.isEmpty(routeName) && routeIdx > 0 ) {
                this.movePushPage(routeName,routeIdx)
            }
        });
    }
   

    componentDidMount() {    
        if (Platform.OS === 'android') { //안드로이드는 아래와 같이 initialURL을 확인하고 navigate 합니다.
            Linking.getInitialURL().then(url => {
              if(url) this.getNavigateInfo(url); //
            });
        }else{ //ios는 이벤트리스너를 mount/unmount 하여 url을 navigate 합니다.
            Linking.addEventListener('url', this.handleOpenURL);
        }  
        GoogleSignin.configure({
            webClientId: '295342043131-kll8ahuqaas8fk8a8532o381nul76lhb.apps.googleusercontent.com', 
            offlineAccess: true, 
            hostedDomain: '', 
            forceConsentPrompt: true, 
          }); 
        NetInfo.addEventListener(this.handleConnectChange); 
        this.timeout = setTimeout(
            () => {
            this.setState({loading:false});
            },
            1000
        ); 
    }
    UNSAFE_componentWillUnmount() { 
        Linking.removeEventListener('url', this.handleOpenURL);
        NetInfo.removeEventListener(this.handleConnectChange)
    }

    handleOpenURL = (event) => { //이벤트 리스너.
        this.getNavigateInfo(event.url);
    }
    handleConnectChange = state => {
        this.setState({isConnected:state.isConnected,loading:false})
    }

    setFcmTokenToSaveDB = async (uid,token) => {
        try {
            returnCode = await apiObject.API_SaveUserToken({
                locale: "ko",
                member_uuid : uid,
                fcm_token : token,
                os_type : Platform.OS
            });             
        }catch(e){     
            
        }
    }

    getUserInformation = async (uid) => {
        let returnCode = {code:9998};
        const fcmToken = this.state.fcmToken;
        this.setState({moreLoading:true})
        try {
            returnCode = await apiObject.API_getUserInfo({
                locale: "ko",
                member_uuid : uid
            });             
            if ( returnCode.code === '0000') {
                if(!CommonUtil.isEmpty(fcmToken)) {
                    this.setFcmTokenToSaveDB(uid,fcmToken)
                }
                this.setState({moreLoading:false})
                return returnCode.data;
            }else{
                //await this.insertError('getuserinfoN',uid,uid)
                this.setState({moreLoading:false})
                CommonFunction.fn_call_toast('로그인중 오류가 발생하였습니다.',2000);
                return false;
            }
        }catch(e){
            //await this.insertError('getuserinfoE',e,uid)            
            this.setState({moreLoading:false})
            CommonFunction.fn_call_toast('로그인중 오류가 발생하였습니다.',2000);
                return false;
        }
    }

    //급매물 서비스 영수증 체크 
    checkSubscriptions = async(receipt,mode) => {        
        let isValidated = false;
        if ( Platform.OS === 'ios') {
            //const receipt = await AsyncStorage.getItem('user_receipt');
            if (receipt) {
                //const newReceipt = await RNIap.getReceiptIOS(); //영수증가져오기
                const validated = await RNIap.validateReceiptIos(
                    {
                        'receipt-data': receipt,
                        password: DEFAULT_CONSTANTS.iosAppSharePassword,
                    }
                );                
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
                    console.debug('checkReceiptAndroid');
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

    loginAction = async (userInfo_uid) => {
        console.log('userInfo_uid',userInfo_uid)
        if ( !CommonUtil.isEmpty(userInfo_uid) ) {
            let userInfo = await this.getUserInformation(userInfo_uid);
            if ( !CommonUtil.isEmpty(userInfo.memberInfo) && !CommonUtil.isEmpty(userInfo.memberInfo.member_pk) ) {
                await AsyncStorage.setItem('autoLogin', userInfo_uid);
                let agentInfo = [];
                if ( !CommonUtil.isEmpty(userInfo.agentInfo))  agentInfo = userInfo.agentInfo;
                if ( !CommonUtil.isEmpty(userInfo.memberInfo.receipt)) {                    
                    await this.checkSubscriptions(userInfo.agentInfo.receipt,'user');
                }else if ( !CommonUtil.isEmpty(userInfo.agentInfo.receipt)) {
                    await this.checkSubscriptions(userInfo.agentInfo.receipt,'agent');
                }                
                this.props._saveUserToken({
                    ...userInfo.memberInfo,
                    ...agentInfo[0],
                    uid : this.state.formUserID
                });
                setTimeout(() => {
                    this.props._saveNonUserToken({uuid : this.state.thisUUID});          
                    this.setState({loading :false,moreLoading:false})             
                    this.props.navigation.popToTop();
                }, 1000);
            }else{
                CommonFunction.fn_call_toast('로그인처리중 오류가 발생하였습니다.[관리자문의]',2000);
                this.setState({loading :false,moreLoading:false})
            }
           
        }else{
            CommonFunction.fn_call_toast('회원정보가 존재하지 않습니다. 관리자에게 문의하세요.',2000);
            this.setState({loading :false,moreLoading:false})
        }
    }
    checkDup = async(formUserId) => {
        if ( CommonFunction.ValidateEmail(formUserId)) {
            if ( !CommonUtil.isEmpty(formUserId)) {
                this.setState({moreLoading:true})
                let returnCode = {code:9998};
                try {
                    returnCode = await apiObject.API_checkDupUserId({
                        locale: "ko",
                        member_id : CommonFunction.fn_dataEncode(formUserId.toLowerCase())
                    });                     
                    if ( returnCode.code === '0000') {
                        //this.setState({moreLoading:false,dupCheckUID:true,showdupid:true,showdupid_text:'사용가능한 아이디입니다.'})
                        return 'true';
                    }else{                        
                        //this.setState({moreLoading:false,dupCheckUID:false,showdupid :true,showdupid_text:'이미 사용중인 아이디입니다.'})
                        return 'false';
                    }
                }catch(e){
                    return 'not';
                }
            }
        }else{
            CommonFunction.fn_call_toast('정확한 이메일을 입력해주세요',2000);
            return 'not';
        }
        
    }
    isSameEmailCheck = async(userEmail,result,gubun) => {        
        const isAlreadyID = await this.checkDup(userEmail);        
        if ( isAlreadyID === 'false' ) {
            CommonFunction.fn_call_toast('일반계정으로 가입된 계정(이메일)입니다. ',1500);
            setTimeout(() => {
                this.setState({loading:false,moreLoading:false})
            }, 1500);
        }else{
            CommonFunction.fn_call_toast('가입된 정보가 없습니다. 회원등록을 진행해주세요',1500)
            if ( gubun === 'kakao') {
                setTimeout(() => {
                    this.setState({loading:false,moreLoading:false})
                    this.props.navigation.navigate('SignInStep01Stack',{
                        screenData : {
                            formKind : 'K',
                            formUserId : result.id,
                            formProfileImage  : !CommonUtil.isEmpty(result.thumb_image_url) ? result.profile_image_url : null,
                            formUserName : CommonUtil.isEmpty(result.nickname) ? '' : result.nickname,
                            formEmail : result.email,
                            formpw : 'kakao'+result.email
                        }
                    })
                }, 1500);
            }else if ( gubun === 'google') {
                setTimeout(() => {
                    this.setState({loading:false,moreLoading:false})
                    this.props.navigation.navigate('SignInStep01Stack',{
                        screenData : {
                            formKind : 'G',
                            formUserId : result.id,
                            formProfileImage  : CommonUtil.isEmpty(result.photo) ? null: result.photo,
                            formUserName : result.name,
                            formEmail : result.email,
                            formpw : 'google'+result.email
                        }
                    })
                }, 1500);
            }else if ( gubun === 'naver') {
                setTimeout(() => {
                    this.setState({loading:false,moreLoading:false})
                    this.props.navigation.navigate('SignInStep01Stack',{
                        screenData : {
                            formKind : 'N',
                            formUserId : result.id,
                            formProfileImage  : CommonUtil.isEmpty(result.profile_image) ? null : result.profile_image,
                            formUserName : result.name,
                            formEmail : result.email,
                            formpw : 'naver'+result.email
                        }
                    })
                }, 1500);
            }else if ( gubun === 'apple') {
                CommonFunction.fn_call_toast('가입된 정보가 없습니다. 회원등록을 진행해주세요',1500)
                setTimeout(() => {
                    this.setState({loading:false,moreLoading:false})
                    this.props.navigation.navigate('SignInStep01Stack',{
                        screenData : {
                            formKind : 'A',
                            formUserId : result.user,
                            formProfileImage  : null,
                            formUserName : result.fullName,
                            formEmail : result.email,
                            formpw : 'apple'+result.email
                        }
                    })
                }, 1500);
            }
        }
    }
    
    SocialLoginCheck = async(gubun,result,formData = {}) => {        
        await this.setState({moreLoading :true})
        if ( gubun === 'kakao') {
            Auth.signInProcess(
                {
                    email: formData.userEmail,
                    password: formData.userPassword,
                    authType: AuthType.EMAIL,
                },
                async (data) => {
                    const userInfo_uid = data.attributes.sub;
                    this.loginAction(userInfo_uid)
                },async (data) => {
                    const userInfo_uid = data.attributes.sub;
                    this.loginAction(userInfo_uid)
                },async(error) => {
                    //this.insertError('kakao_E',JSON.stringify(error),formData.userEmail)
                    await this.isSameEmailCheck(formData.userEmail,result,'kakao')
                },
                null
            )
        }else if ( gubun === 'google' ) {
            Auth.signInProcess(
                {
                    email: formData.userEmail,
                    password: formData.userPassword,
                    authType: AuthType.EMAIL,
                },
                async (data) => {
                    const userInfo_uid = data.attributes.sub;
                    this.loginAction(userInfo_uid)
                },async (data) => {
                    const userInfo_uid = data.attributes.sub;
                    this.loginAction(userInfo_uid)
                },async(error) => {
                    //this.insertError('google_E',JSON.stringify(error),formData.userEmail)
                    await this.isSameEmailCheck(formData.userEmail,result,'google');                    
                },
                null
            );   
        }else if ( gubun === 'naver' ) {            
            Auth.signInProcess(
                {
                    email: formData.userEmail,
                    password: formData.userPassword,
                    authType: AuthType.EMAIL,
                },
                async (data) => {
                    const userInfo_uid = data.attributes.sub;
                    this.loginAction(userInfo_uid)
                },async (data) => {
                    const userInfo_uid = data.attributes.sub;
                    this.loginAction(userInfo_uid)
                },async(error) => {
                    //this.insertError('naver_E',JSON.stringify(error),formData.userEmail)
                    await this.isSameEmailCheck(formData.userEmail,result,'naver')
                },
                null
            );            
            
        }else if ( gubun === 'apple') {
            //const { user, email,fullName } = result;
            Auth.signInProcess(
                {
                    email: formData.userEmail,
                    password: formData.userPassword,
                    authType: AuthType.EMAIL,
                },
                async (data) => {
                    const userInfo_uid = data.attributes.sub;
                    this.loginAction(userInfo_uid)
                },async (data) => {
                    const userInfo_uid = data.attributes.sub;
                    this.loginAction(userInfo_uid)
                },async(error) => {
                    //this.insertError('apple_E',JSON.stringify(error),formData.userEmail)
                    await this.isSameEmailCheck(formData.userEmail,result,'apple');                    
                },
                null
            ); 
        }
       

    }

    onAppleButtonPress = async() =>{
        try {
            const response = await await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
            });
            const { user, email,fullName,identityToken } = response;
            if ( !CommonUtil.isEmpty(email)) {
                this.SocialLoginCheck(
                    'apple',response,
                    {
                        userEmail : response.email,
                        userPassword :  'apple'+response.email
                    }
                );
            }else{
                if( !CommonUtil.isEmpty(identityToken)) {
                const response2 = jwtDecode(identityToken);
                this.SocialLoginCheck(
                    'apple',response2,
                    {
                        userEmail : response2.email,
                        userPassword :  'apple'+response2.email
                    }
                );
                }else{
                    //CommonFunction.fn_call_toast('해당계정은 로그인이 불가능합니다.',2000);
                    CommonFunction.fn_call_toast('이 이메일은 더이상 사용하실 수 없습니다.',2000);
                    return ;
                }
            }
        } catch(e) {
            console.error(e);
        }
        
    }

    getNavigateInfo = (url) =>{        
        const basepaths = url.split('?'); // 쿼리스트링 관련한 패키지들을 활용하면 유용합니다.
        const paths = basepaths[1].split('|'); // 쿼리스트링 관련한 패키지들을 활용하면 유용합니다.
        if ( paths[0] === 'shareJoin') {
             if ( !CommonUtil.isEmpty(paths[1])) {
                const shareMember = paths[1].split('=');
                if ( !CommonUtil.isEmpty( shareMember[1])) {
                    this.setState({
                        shareMember : shareMember[1]
                    })
                }
            }
        }else{
            let arrayParams = [];
            if(paths.length>1){ //파라미터가 있다
              const params= paths[1].split('&');
              let id;
              for(let i=0; i<params.length; i++){
                //let param = params[i].split('=');// [0]: key, [1]:value
                let nextData = params[i].replace('=',':');
                arrayParams.push(nextData)
                
              }
               this.props.navigationProps.navigate(paths[0],arrayParams)
            }
        }
        
    }

    // Somewhere in your code
    googleSignIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            if ( !CommonUtil.isEmpty(userInfo.user.email)) {
                this.SocialLoginCheck('google',userInfo.user,
                {
                    userEmail : userInfo.user.email,
                    userPassword :  'google'+userInfo.user.email
                }); 
            }else{
                CommonFunction.fn_call_toast('이메일정보가 없습니다 확인후 다시 이용해주세요',2000)
                return;
            }
        } catch (error) {
        
            CommonFunction.fn_call_toast('이메일정보가 없습니다 확인후 다시 이용해주세요',2000)
            //this.insertError('goole_E2',error,null)            
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled the login flow
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // operation (e.g. sign in) is in progress already
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                // play services not available or outdated
            } else {
                // some other error happened
            }
        }
    };

    naverLogin = props => {
        return new Promise((resolve, reject) => {
          NaverLogin.login(props, (err, token) => {
            //console.log(`Token is fetched  :: `, token);
            if (err) {
                reject(err);
                return;
            }else if ( !CommonUtil.isEmpty(token) ) {
                //this.moveLogin('naver',token.accessToken)
                this.getUserProfile(token)
            }
            
            resolve(token);
          });
        });
       
    };
    
    getUserProfile = async (naverToken) => {        
        const profileResult = await getProfile(naverToken.accessToken);
        if (profileResult.resultcode === "024") {
            return;
        }else{            
            if ( !CommonUtil.isEmpty(profileResult.response.email)) {
                this.SocialLoginCheck('naver',profileResult.response,
                {
                    userEmail : profileResult.response.email,
                    userPassword :  'naver'+profileResult.response.email
                });            
            }else{
                CommonFunction.fn_call_toast('이메일정보가 없습니다 확인후 다시 이용해주세요',2000)
                return;
            }
        }
    };

    naverLogout = () => {
        NaverLogin.logout();
    };
    
    kakaoLogin = () => {        
        KakaoLogins.login()
        .then(result => {                        
            this.getKakaoProfile();
            //this.moveLogin('kakaotalk',JSON.stringify(result.accessToken));
        })
        .catch(err => {
            //this.insertError('kakao_E2',err,null)
            if (err.code === 'E_CANCELLED_OPERATION') {
              //logCallback(`Login Cancelled:${err.message}`, setLoginLoading(false));
            } else {
                
            }
        });
    };

    getKakaoProfile = () => {        
        KakaoLogins.getProfile()
        .then(result => {                      
        if ( CommonUtil.isEmpty(result.email) ) {
            CommonFunction.fn_call_toast('이메일정보가 없습니다 확인후 다시 이용해주세요',2000);
            return;
        }else{            
            this.SocialLoginCheck('kakao',result,
            {
                userEmail :result.email,
                userPassword :  'kakao'+result.email
            }); 
        }
        })
        .catch(err => {            
            CommonFunction.fn_call_toast('이메일정보가 없습니다 확인후 다시 이용해주세요.',2000);
            return;
        });
    };
    
    unlinkKakao = () => {
        KakaoLogins.unlink()
          .then(result => {
            //setToken(TOKEN_EMPTY);
            //setProfile(PROFILE_EMPTY);
            //logCallback(`Unlink Finished:${result}`, setUnlinkLoading(false));
          })
          .catch(err => {
            //console.log('KakaoLogins errrrr ', err)
          });
    };

    nonUserLogin = async() => {        
        this.props._saveNonUserToken({
            uuid : this.state.thisUUID
        });
        setTimeout(() => {
            this.props.navigation.popToTop();
        }, 500);        
    }
    insertError = async( class_type, error , user_id ) => {
        try {
            returnCode = await apiObject.API_insertError({
                locale: "ko",
                class_type,
                error,
                user_id
            }); 
            //console.log('insertError 11',returnCode);            
        }catch(e){     
            //console.log('insertError 22',e);          
        }
    }
    
    //--------------------------------------
    // 콜백 방식
    signInFuntion = async (formData) => {
        await this.setState({moreLoading:true})
        Auth.signInProcess(
        {
            email: formData.userEmail.trim(),
            password: formData.userPassword,
            authType: AuthType.EMAIL,
        },
        async (data) => {
            const userInfo_uid = data.attributes.sub;
            this.loginAction(userInfo_uid)
        },
        async (data) => {
            const userInfo_uid = data.attributes.sub;
            this.loginAction(userInfo_uid)
        },
        (error) => {
            this.setState({moreLoading:false})
            //console.log("err:2",error);
            // 실패처리,
            /*
            try{
                this.insertError('A',JSON.stringify(error),formData.userEmail)
            }catch(e){

            }
            */
            if( error.code === 'NotAuthorizedException') {
                if ( error.message.includes('exceeded')) {
                    CommonFunction.fn_call_toast('인증시도가 초과되었습니다. 3시간이후에 시도해주세요.',2000);
                    return false;
                }else{
                    CommonFunction.fn_call_toast('없는 계정이거나 비밀번호가 맞지 않습니다.',2000);
                    return false;
                }
            }else if( error.code === 'UserNotFoundException') {
                CommonFunction.fn_call_toast('없는 계정이거나 사용중인 계정이 아닙니다.',2000);
                return false;
            }else if( error.code === 'LimitExceededException') {
                CommonFunction.fn_call_toast('인증시도가 초과되었습니다. 3시간이후에 시도해주세요.',2000);
                return false;
            }else if( error.code === 'PasswordResetRequiredException') {
                CommonFunction.fn_call_toast('비밀번호가 만료되었습니다.. 관리자에게 문의하세요.',2000);
                return false;
            }else{
                CommonFunction.fn_call_toast('오류가 발생하였습니다',2000);
                return false;
            }
        },
        null
        );
    };
    loginForm = async() => {
        if ( CommonUtil.isEmpty(this.state.formUserID)) {
            CommonFunction.fn_call_toast('아이디(이메일)을 입력해주세요',2000);
            return true;
        }else if ( CommonFunction.ValidateEmail(this.state.formUserID) === false ) {
            CommonFunction.fn_call_toast('정확한 이메일을 입력해주세요',2000);
            return false;
        }else if ( CommonUtil.isEmpty(this.state.formPassword)) {
            CommonFunction.fn_call_toast('비밀번호를 입력해주세요',2000);
            return true;
        }else{
            this.signInFuntion({
                userEmail : this.state.formUserID,
                userPassword :  this.state.formPassword
            })           
        }
    }

    clearInputText = field => {
        this.setState({[field]: ''});
    };

    checkItem = async(bool) => {
        this.setState({isMemoryID:!bool})
        await AsyncStorage.setItem('isMemoryUserID',!bool ? this.state.formUserID : '');   
    }

    joinMember = () => {
        this.props.navigation.navigate('SignInStep01Stack',{
            screenData : {
                formKind : 'Z',                
                formUserId : null,
                formProfileImage  : null,
                formUserName : null,
                formEmail : null,
                formpw : null
            }
        });
        
    }

    setEmailAddress = (val) => {
        let dataval = val.trim();        
        this.setState({formUserID:dataval.toLowerCase()})
    }
     
    render() {
        if ( this.state.loading ) {
            return (
                <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} /> 
            )
        }else {
        return(
            <SafeAreaView style={ styles.container }>
                <CheckConnection />
                <KeyboardAvoidingView style={{paddingVertical:10}} behavior={Platform.OS === 'ios' ? "padding" : 'height'}  enabled> 
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    indicatorStyle={'white'}
                    scrollEventThrottle={16}
                    keyboardDismissMode={'on-drag'}      
                    style={{width:'100%'}}
                >
                { Platform.OS == 'android' && <StatusBar backgroundColor={'#fff'} translucent={false}  barStyle="dark-content" />}
                
                <View style={styles.commonFlex2}>
                    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                        <CustomTextM style={[CommonStyle.textSize14,CommonStyle.fontColorDefault]}>
                            부동산 중개수수료를 협의해주는
                        </CustomTextM>
                        <View style={{paddingVertical:10}}>
                            <Image 
                                source={require('../../../assets/icons/title_logo.png')} resizeMode={"contain"}
                                style={{width:CommonUtil.dpToSize(175),height:CommonUtil.dpToSize(35)}} 
                            />
                        </View>
                    </View>
                </View>
                <View style={[styles.commonFlex,{marginTop:20}]}>
                    <View style={styles.commonFlex3}>
                        <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColorccc]}>
                            SNS계정으로 가입하신 분은 해당아이콘을 클릭하세요
                        </CustomTextR>
                        <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColorccc]}>
                            비밀번호 대소문자구분(첫글자 대문자로 등록하신분 주의)
                        </CustomTextR>
                    </View>
                    <View style={styles.middleDataWarp}>
                        <View style={styles.dataInputWrap}>
                            <Input   
                                value={this.state.formUserID}
                                placeholder="이메일주소를 입력하세요"
                                keyboardType={'email-address'}
                                maxLength={40}
                                placeholderTextColor={DEFAULT_COLOR.base_color_666}                            
                                inputContainerStyle={styles.inputContainerStyle}
                                inputStyle={styles.inputStyle}
                                clearButtonMode={'always'}
                                onChangeText={value => this.setEmailAddress(value)}
                                onFocus={()=>this.setState({isFocus:false})}
                                onBlur={()=>this.setState({isFocus:true})}
                            />
                            {( Platform.OS === 'android' && this.state.formUserID !== '' ) && (
                                <TouchableOpacity 
                                    hitSlop={{left:10,right:10,bottom:10,top:10}}
                                    style={{position: 'absolute', right: 20,top:10}} 
                                    onPress={() => this.clearInputText('formUserID')}
                                >
                                    <Image source={require('../../../assets/icons/btn_remove.png')} style={{width:CommonUtil.dpToSize(20),height:CommonUtil.dpToSize(20)}} />
                                </TouchableOpacity>
                                )
                            }
                        </View>                        
                    </View>
                    <View style={styles.middleDataWarp}>
                        <View style={{flex:1}}>
                            <Input   
                                secureTextEntry={true}
                                value={this.state.formPassword}
                                placeholder="비밀번호를 입력하세요(대소문자구분)"
                                placeholderTextColor={DEFAULT_COLOR.base_color_666}                            
                                inputContainerStyle={styles.inputContainerStyle}
                                inputStyle={styles.inputStyle}
                                clearButtonMode={'always'}
                                onChangeText={value => this.setState({formPassword:value})}
                                onFocus={()=>this.setState({isFocus:false})}
                                onBlur={()=>this.setState({isFocus:true})}
                            />
                            {( Platform.OS === 'android' && this.state.formPassword !== '' )  && (
                            <TouchableOpacity 
                                hitSlop={{left:10,right:10,bottom:10,top:10}}
                                style={{position: 'absolute', right: 20,top:10}} 
                                onPress={() => this.clearInputText('formPassword')}
                            >
                                <Image source={require('../../../assets/icons/btn_remove.png')} style={{width:CommonUtil.dpToSize(20),height:CommonUtil.dpToSize(20)}} />
                            </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    
                    <TouchableOpacity style={styles.middleDataWarp2}>
                        <TouchableOpacity 
                            onPress={()=>this.loginForm()}
                            style={(CommonUtil.isEmpty(this.state.formUserID) && CommonUtil.isEmpty(this.state.formPassword) ) ? styles.buttonWrapOff : styles.buttonWrapOn }
                        >
                            <CustomTextM style={[CommonStyle.textSize17,CommonStyle.fontColorWhite]}> 로그인</CustomTextM>
                        </TouchableOpacity>
                    </TouchableOpacity>                    
                </View>
                <View style={[styles.commonFlex2,{flexDirection:'row'}]}>
                    <TouchableOpacity 
                        style={{paddingHorizontal:5}}       
                        onPress={() => this.kakaoLogin()}
                    >
                        <Image source={require('../../../assets/icons/icon_kakao.png')} style={{width:CommonUtil.dpToSize(45),height:CommonUtil.dpToSize(45)}} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={{paddingHorizontal:5}}
                        onPress={() => this.naverLogin(initials)}
                    >
                        <Image source={require('../../../assets/icons/icon_naver.png')} style={{width:CommonUtil.dpToSize(45),height:CommonUtil.dpToSize(45)}} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={{paddingHorizontal:5}}
                        onPress={()=>this.googleSignIn()}
                    >
                        <Image source={require('../../../assets/icons/icon_google.png')} style={{width:CommonUtil.dpToSize(45),height:CommonUtil.dpToSize(45)}} />
                    </TouchableOpacity>
                    {Platform.OS === 'ios' &&
                    <TouchableOpacity 
                        style={{paddingHorizontal:5}}    
                        onPress={()=>this.onAppleButtonPress()}
                    >
                        <Image source={require('../../../assets/icons/apple_logo.png')} style={{width:CommonUtil.dpToSize(45),height:CommonUtil.dpToSize(45)}} />
                    </TouchableOpacity>
                    }
                    <TouchableOpacity 
                        style={{paddingHorizontal:5,paddingTop:5}}
                        onPress={()=>this.props.navigation.navigate('SignInStep01Stack')}
                    >
                        <View style={{width:CommonUtil.dpToSize(36),height:CommonUtil.dpToSize(36),borderRadius:CommonUtil.dpToSize(18),backgroundColor:DEFAULT_COLOR.base_color,justifyContent:'center',alignItems:'center',paddingTop:2}}>
                        <CustomTextM style={[CommonStyle.textSize10,CommonStyle.fontColorWhite,{lineHeight:12}]}>
                            회원{"\n"}가입
                        </CustomTextM>
                        </View>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.commonFlex2} onPress={()=>this.props.navigation.navigate('PWResetStack')}>
                    <CustomTextR style={[CommonStyle.textSize13,CommonStyle.fontColor222]}>
                        비밀번호를 잃어버리셨나요?(소셜로그인제외)
                    </CustomTextR>
                </TouchableOpacity>
                </ScrollView>
                
                </KeyboardAvoidingView>
                { this.state.moreLoading &&
                    <View style={CommonStyle.moreWrap}>
                        <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} />
                    </View>
                }
                <View style={CommonStyle.blankWrap}>

                </View>
            </SafeAreaView>
        );
        }
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor : "#fff",
    },
    IndicatorContainer : {
        flex: 1,
        width:'100%',
        backgroundColor : "#fff",
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    commonFlex : {
        flex:1,paddingHorizontal:20,minHeight:SCREEN_HEIGHT*0.2
    },
    commonFlex2 : {
        flex:0.5,padding:20
    },
    commonFlex3 : {
        flex:1,paddingHorizontal:10
    },
    topMenuWrap : {
        flex:1,flexDirection:'row',justifyContent:'flex-end',maxHeight:30
    },
    fixedBottom : {
        position:'absolute',left:0,bottom:0,height:80,width:SCREEN_WIDTH,justifyContent:'center',backgroundColor:'#eee',
        paddingHorizontal:20
    },
    fixedBottomBall : {
        position:'absolute',right:20,bottom:40,height:80,width:80,justifyContent:'center',borderRadius:40,alignItems:'center',overflow:'hidden'
    },
    middleDataWarp : {
        flex:1,
        justifyContent:'center',
        marginVertical:5
    },
    dataInputWrap : {
        flex:1,height:55
    },
    middleDataWarp2 : {
        flex:1,
        justifyContent:'center',
        paddingTop:10,paddingBottom:20,paddingHorizontal:10
    },
    buttonWrapOn : {
        backgroundColor:DEFAULT_COLOR.base_color,padding:10,justifyContent:'center',alignItems:'center',borderRadius:25
    },
    buttonWrapOn2 : {
        backgroundColor:'#fff',paddingVertical:5,justifyContent:'center',alignItems:'center',borderRadius:25,borderWidth:1,borderColor:DEFAULT_COLOR.base_color
    },
    buttonWrapOff : {
        backgroundColor:'#ccc2e6',padding:10,marginHorizontal:15,justifyContent:'center',alignItems:'center',borderRadius:25
    },
    titleWrap : {
        flex:1,justifyContent:'flex-end',height:45,paddingLeft:20
    },
    memoryWrap : {
        flex:1,flexDirection:'row',flexGrow:1,justifyContent:'center',paddingLeft:20,paddingVertical:10
    },
    memoryRightWrap : {
        flex:1
    },
    titleText : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize16),color:DEFAULT_COLOR.base_color_666
    },
    titleText2 : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize14),color:DEFAULT_COLOR.base_color_666
    },
});


function mapStateToProps(state) {
    return {
        userToken : state.GlabalStatus.userToken,
        userNonToken : state.GlabalStatus.userNonToken,
    };
}

function mapDispatchToProps(dispatch) {
    return {        
        _saveUserToken:(str)=> {
            dispatch(ActionCreator.saveUserToken(str))
        },
        _saveNonUserToken:(str)=> {
            dispatch(ActionCreator.saveNonUserToken(str))
        },
        _saveUserFCMToken:(str)=> {
            dispatch(ActionCreator.saveUserFCMToken(str))
        }
    };
}


export default connect(mapStateToProps,mapDispatchToProps)(SignupScreen);