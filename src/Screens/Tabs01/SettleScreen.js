import React, { Component} from 'react';
import {StatusBar,Alert,SafeAreaView, Platform, TouchableOpacity, View,StyleSheet,Image,Dimensions,PixelRatio,BackHandler,ImageBackground} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import 'moment/locale/ko'
import  moment  from  "moment";
import {connect} from 'react-redux';
import ActionCreator from '../../Ducks/Actions/MainActions';
import AsyncStorage from '@react-native-community/async-storage';
import RNIap, {
    InAppPurchase,
    PurchaseError,
    ProductPurchase,
    SubscriptionPurchase,
    acknowledgePurchaseAndroid,
    consumePurchaseAndroid,
    finishTransaction,
    finishTransactionIOS,
    validateReceiptIos,
    purchaseErrorListener,
    purchaseUpdatedListener,
} from 'react-native-iap';

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
import Loader from '../../Utils/Loader';

import { apiObject } from "../../Apis/Member";
const DOT_ICON_IMAGE =  require('../../../assets/icons/icon_dot.png')
const BACK_BUTTON_IMAGE = require('../../../assets/icons/back_icon2.png');
const BACK_BUTTON_IMAGE2 = require('../../../assets/icons/back_icon_white.png');
const REQUEST_BUTTON = require('../../../assets/icons/btn_request.png');
const REGEN_BUTTON = require('../../../assets/icons/btn_regen.png');
const EXPIRE_BUTTON = require('../../../assets/icons/btn_expire.png');
const BackgroundImageOff = require('../../../assets/icons/back_request_settle.png');
const BackgroundImageOn = require('../../../assets/icons/back_settle_ing.png');

const itemSkus = Platform.select({
    ios: [
        //'FASTDEAL_ALARM_SERVICE_PAY',
        'com.cooni.point5000', 
      ],
      android: [
        'test20210616',
      ],
});

const itemSubs = Platform.select({
    ios: [    
        //'com.cooni.point1000'    
        'FASTDEAL_ALARM_SERVICE_PAY', 
    ],
    android: [
        'test20210616'
    ],
});
  
let purchaseUpdateSubscription = null;
let purchaseErrorSubscription = null;

const BackGroundNot =  '#f7f7f7';
const BackGroundUsing = DEFAULT_COLOR.base_color;

class SettleScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading : true,
            isIng : false,
            actionSeltle : false,
            is_failedStatus : false,
            statusBarColor : BackGroundNot,
            productList: [],
            receipt: '',
            RealReceipt : '',
            availableItemsMessage: '',
            myUsingServiceData : null
        }
    }

   
    getInformation = async (isFreeRequest=false) => {
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_checkMyService({
                locale: "ko",
            });      
            console.log('getInformation ',returnCode);       
            if ( returnCode.code === '0000') {
                const myData = returnCode.data.length > 0 ? returnCode.data[0] : {is_status:'none'};
                console.log('myData ',myData);       
                if ( myData.is_status === 'ing' || myData.is_status === 'stop') {
                    this.setState({
                        loading:false,
                        myUsingServiceData : myData,
                        isIng:true,
                        statusBarColor:BackGroundUsing
                    })
                }else{
                    this.setState({statusBarColor:BackGroundNot,loading:false})
                    if ( isFreeRequest ) {
                        this.requestServiceSettleAction()    
                    }
                }   
            }else{
                this.setState({loading:false})
            }
            
        }catch(e){
            //console.log('returnCode error1',e);
            this.setState({loading:false})
        }
    }
    
    // 조건설정 정보 가져오기
    checkStorageReceipt = async () => {
        try {
            const user_receipt = await AsyncStorage.getItem('user_receipt');
            console.log('checkStorageReceipt', error);
            if(user_receipt !== null) {  
                this.setState({receipt  : user_receipt})              
            }
        } catch(e) {                        
            
        }
    }
    _initIAP = async() => {
        if ( Platform.OS === 'ios') {
            await RNIap.clearProductsIOS();
        }
        
        try {
            const result = await RNIap.initConnection();
            await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
            console.log('result', result);            
            //const subscriptions = await RNIap.getSubscriptions(itemSubs[0]);
            //console.log('subscriptions',subscriptions)
        } catch (err) {
            console.warn(err.code, err.message);
        }

        purchaseUpdateSubscription = purchaseUpdatedListener(async purchase => {
            console.log('purchaseUpdatedListener', purchase);
            if (purchase.purchaseStateAndroid === 1 && !purchase.isAcknowledgedAndroid) {
                try {
                    const ackResult = await acknowledgePurchaseAndroid(purchase.purchaseToken);
                    console.log('ackResult', ackResult);
                } catch (ackErr) {
                    console.warn('ackErr', ackErr);
                }
            }
            console.log('this.state.isIng', this.state.isIng);
            if ( !this.state.isIng  && this.state.moreLoading && this.state.actionSeltle) {
                if ( Platform.OS === 'android') {
                    const nextParams = typeof purchase.transactionReceipt == 'object' ? purchase.transactionReceipt : JSON.parse(purchase.transactionReceipt);
                    this.setState({ RealReceipt: purchase.transactionReceipt ,moreLoading:true}, () => this.goNext(nextParams));
                }else{
                    this.setState({ RealReceipt: purchase.transactionReceipt ,moreLoading:true}, () => this.goNext(purchase));
                }
            }
        });

        purchaseErrorSubscription = purchaseErrorListener(error => {
            //console.log('purchaseErrorListener', error);
            //Alert.alert('purchase error', JSON.stringify(error));
            if ( error.code === 'E_USER_CANCELLED') {
                CommonFunction.fn_call_toast('결제를 취소하셨습니다.',2000);
            }else if ( error.code === 'E_ALREADY_OWNED') {
                CommonFunction.fn_call_toast('이미 이용중입니다. 관리자에게 문의하거나 복원을 진행해주세요.',2000)
                setTimeout(() => {
                    this.setState({
                        is_failedStatus :true,
                        moreLoading :false
                    })
                }, 1500);
            }else if ( error.code === 'E_DEVELOPER_ERROR' && error.responseCode === 5 ) {
                CommonFunction.fn_call_toast('구글계정이 없는 환경입니다.',2000)
            }else{
                CommonFunction.fn_call_toast('구독신청중 오류가 발생하였습니다, 관리자에게 문의하시거나 다시 시도해주십시요',2000)
            }
        });
    }

    async UNSAFE_componentWillMount() {
        await this.checkStorageReceipt();
        await this.getInformation(false); 
        await this._initIAP();
    }

    async componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }
    
    handleBackPress = () => {
        this.props.navigation.goBack(null)
        return true;  // Do nothing when back button is pressed
    }
    componentWillUnmount(){
        if (purchaseUpdateSubscription) {
            purchaseUpdateSubscription.remove();
            purchaseUpdateSubscription = null;
        }
        if (purchaseErrorSubscription) {
            purchaseErrorSubscription.remove();
            purchaseErrorSubscription = null;
        }
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
        RNIap.endConnection();
    }
  
    /*
    reqeustService = async() => {
        if ( CommonUtil.isEmpty(this.props.userToken)) {
            Alert.alert(
                DEFAULT_CONSTANTS.appName,      
                "로그인이 필요합니다. 로그인하시겠습니까?",
                [
                    {text: '네', onPress: () => this.logoutAction()},
                    {text: '아니오', onPress: () => console.log('Cancle')},
                    
                ],
                { cancelable: true }
            ) 
        }else{
            Alert.alert(
                DEFAULT_CONSTANTS.appName,      
                "1개월 무료 이용하기를 신청하시겠습니까?",
                [
                    {text: '네', onPress: () => this.reqeustFreeServiceAction()},
                    {text: '아니오', onPress: () => console.log('Cancle')},
                    
                ],
                { cancelable: true }
            ) 
        }
    }
    */
    /*
    reqeustFreeServiceAction = async() => {
        this.setState({moreLoading:true})
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_requestFreeService({
                locale: "ko",
            }); 
            if ( returnCode.code === '0000') {
                if ( returnCode.type === 'check') {
                    if ( returnCode.data.history === 'ing') {
                        CommonFunction.fn_call_toast('현재 1개월무료서비스를 이용중입니다.',2000)
                    }else if ( returnCode.data.history === 'end') {
                        CommonFunction.fn_call_toast('1개월무료서비스를 이미 사용하셨습니다.',2000)
                        this.requestServiceSettle('free');
                    }else{
                        
                    }
                    this.setState({moreLoading:false})
                }else{
                    CommonFunction.fn_call_toast('1개월무료서비스 신청이 완료되었습니다.',2000)
                    this.setState({moreLoading:false})
                }
            }else{
                CommonFunction.fn_call_toast('일시적으로 오류가 발생하였습니다.',2000) 
                this.setState({moreLoading:false})
            }
        }catch(e){
            //console.log('returnCode error1',e);
            CommonFunction.fn_call_toast('일시적으로 오류가 발생하였습니다.',2000) 
            this.setState({moreLoading:false})
        }
    }
    */

    requestServiceSettle = async(mode) => {
        Alert.alert(
            DEFAULT_CONSTANTS.appName,      
            '월정액 서비스를 신청하시겠습니까?',
            [
                {text: '네', onPress: () => this.requestServiceSettleAction()},
                {text: '아니오', onPress: () => console.log('Cancle')},
                
            ],
            { cancelable: true }
        ) 
    }


    requestServiceSettleAction = async() => {
        //await this.getAvailablePurchases();
        console.log('this.state.receipt',this.state.receipt)
        if ( CommonUtil.isEmpty(this.state.receipt)) {
            //const productList = await this.getItems();
            const productList = await this.getSubscriptions();
            console.log('requestServiceSettleAction',productList)
           
            if ( productList.length > 0 ) {
                this.setState({moreLoading :true,actionSeltle:true})
                this.requestSubscription(productList[0].productId)
            }else{
                CommonFunction.fn_call_toast('구독가능한 상품이 없습니다.',2000);
            }
            
        }else{
            CommonFunction.fn_call_toast('이미 이용중인 서비스입니다. 관리자에게 문의하세요',2000);
        }
    }
    /*
    Android :
    requestServiceSettleAction [{"currency": "KRW", "description": "전국에서 실시간으로 쏟아지는 급매물정보를 알림으로 쉽게 받아보세요", "freeTrialPeriodAndroid": "P4W2D", "iconUrl": "", "introductoryPrice": "", "introductoryPriceAsAmountAndroid": "0", "introductoryPriceCyclesAndroid": "0", "introductoryPricePeriodAndroid": "", "localizedPrice": "₩5,000", "originalJson": "{\"productId\":\"test20210616\",\"type\":\"subs\",\"price\":\"₩5,000\",\"price_amount_micros\":5000000000,\"price_currency_code\":\"KRW\",\"title\":\"급매물알림서비스 (착한부동산)\",\"description\":\"전국에서 실시간으로 쏟아지는 급매물정보를 알림으로 쉽게 받아보세요\",\"subscriptionPeriod\":\"P1M\",\"freeTrialPeriod\":\"P4W2D\",\"skuDetailsToken\":\"AEuhp4LffK_h-XdOEMF2cr8i1Mcg255xtuEGnMNdMXYPkC-l8QOxVDSdTBKYc7hyzKxK\"}", "originalPrice": "5000", "originalPriceAndroid": "₩5,000", "packageNameAndroid": "", "price": "5000", "productId": "test20210616", "subscriptionPeriodAndroid": "P1M", "title": "급매물알림서비스 (착한부동산)", "type": "subs", "typeAndroid": "subs"}]
    iOS :
    [{"countryCode": "KOR", "currency": "KRW", "description": "전국아파트 실시간시세와 급매물정보 알림서비스", "discounts": [], "introductoryPrice": "₩0", "introductoryPriceAsAmountIOS": "0", "introductoryPriceNumberOfPeriodsIOS": "1", "introductoryPricePaymentModeIOS": "FREETRIAL", "introductoryPriceSubscriptionPeriodIOS": "MONTH", "localizedPrice": "₩10,000", "price": "10000", "productId": "FASTDEAL_ALARM_SERVICE_PAY", "subscriptionPeriodNumberIOS": "1", "subscriptionPeriodUnitIOS": "MONTH", "title": "급매물 알림 서비스 비용", "type": "subs"}]
    */
    setinapp = async() => {
        
    }

    //정상적으로 결제되면 기록해준다
    goNext = async(RealReceipt,reboot=null) => {
        //console.log('reboot',reboot);
        if ( RealReceipt && this.state.actionSeltle) {
            let strRealReceipt =  "";  
            let strRealReceipt2 =  "";            
            if ( Platform.OS === 'ios' && reboot !== null ) {                
                strRealReceipt = RealReceipt;
            }else if ( Platform.OS === 'android' && reboot !== null ) {                
                strRealReceipt = RealReceipt;
            }else if ( Platform.OS === 'android' && reboot === null ) {
                strRealReceipt = RealReceipt.purchaseToken;                                
            }else{                
                strRealReceipt = RealReceipt.transactionReceipt;
            }
            if ( CommonUtil.isEmpty(strRealReceipt)) { 
                try {
                    returnCode = await apiObject.API_registUserSubscriptions({
                        locale: "ko",
                        class_type : 'alarm',
                        receipt : strRealReceipt,
                        receiptInfo : RealReceipt,
                        cost : DEFAULT_CONSTANTS.DEFAULT_FAST_DEAL_COST,
                        is_status : 'ing'
                    }); 
                    //console.log('goNextreturnCode',returnCode);    
                    if ( returnCode.code === '0000') {   
                        AsyncStorage.setItem('user_receipt', strRealReceipt);
                        CommonFunction.fn_call_toast('정상적으로 결제되었습니다. 이용해 주셔서 감사합니다.',1500);
                        setTimeout(() => {
                            this.setState({moreLoading :false,actionSeltle:false})
                            this.getInformation()
                        }, 1500);
                    }else{
                        //await this.getAvailablePurchases();
                        CommonFunction.fn_call_toast('결제처리중 오류가 발생하였습니다. 복원을 통해 재확인해주십시요',1500);
                        setTimeout(() => {
                            this.setState({
                                is_failedStatus :true,
                                moreLoading :false,
                                actionSeltle:false
                            })
                        }, 1500);
                    }

                }catch(e){   
                    console.log('eeeeee',e);    
                }
            }else{
                CommonFunction.fn_call_toast('결제처리중 오류가 발생하였습니다. 관리자에게 문의하세요',1500);
                setTimeout(() => {
                    this.setState({is_failedStatus :false,moreLoading :false,actionSeltle:false})
                }, 1500);
            }
        }
    }

    checkeServiceSettle = async() => {
        Alert.alert(
            DEFAULT_CONSTANTS.appName,
            '구입내역을 복원시도 하시겠습니까?',
            [
              {text: '네', onPress: () => this.actionCheckeServiceSettle()},
              {text: '아니오', onPress: () => console.log('no')},
            ],
            {cancelable: false},
          );
    }
    actionCheckeServiceSettle = async() => {
        this.setState({moreLoading :true,is_failedStatus:false})
        RNIap.getAvailablePurchases()
        .then((purchases) => {
            //console.debug('restorePurchases',purchases);
            if ( purchases.length > 0 ) {
                let receipt = purchases[0].transactionReceipt;
                console.log('checkeServiceSettle',receipt);
                if (Platform.OS === 'android' && purchases[0].purchaseToken) {
                    receipt = purchases[0].purchaseToken;
                    //console.log('restorePurchases222222',receipt);
                }
                
                if ( !CommonUtil.isEmpty(receipt)) {
                    this.goNext(receipt,'reboot')
                }else{
                    this.setState({moreLoading :false})
                    CommonFunction.fn_call_toast('정상적으로 처리가 되지 않았습니다. 관리자에게 문의하세요',1500);
                }
            }else{
                this.setState({moreLoading :false})
                CommonFunction.fn_call_toast('복원가능한 이력이 없습니다.',1500);
            }
                
        })
        .catch((err) => {
            //console.debug('restorePurchases');
            console.error(err);
            this.setState({moreLoading :false})
            
        });
    }
    
    getItems = async () => {
        console.log('itemSkus', itemSkus);
        try {
            const products = await RNIap.getProducts(itemSkus);            
            console.log('getItems Products', products);
            this.setState({ productList: products });
            return products;
        } catch (err) {
            console.warn(err.code, err.message);
            return [];
        }
    }

    getSubscriptions = async () => {
        console.log('itemSubs', itemSubs[0]);
        try {
            const products = await RNIap.getSubscriptions(itemSubs);
            console.log('getSubscriptions Products22', products);
            this.setState({ productList: products });
            return products;
        } catch (err) {
            console.warn(err.code, err.message);
            return [];
        }
    }

    getAvailablePurchases = async () => {
        try {
            console.info('Get available purchases (non-consumable or unconsumed consumable)');
            const purchases = await RNIap.getAvailablePurchases();
            console.info('Available purchases :: ', purchases);
            if (purchases && purchases.length > 0) {
                
            }
        } catch (err) {
            console.warn(err.code, err.message);
            Alert.alert(err.message);
        }
    }

    requestPurchase = async sku => {
        try {
            RNIap.requestPurchase(sku);
        } catch (err) {
            console.warn(err.code, err.message);
        }
    }

    requestSubscription = async sku => {
        try {
            const purchases = await RNIap.requestSubscription(sku);
        } catch (err) {
            console.warn(err.code, err.message);
        }
    }
   
    cancelService = async(mode = 'free',target_pk = null) => {
        if ( mode !== 'free' ) {
            Alert.alert(
                DEFAULT_CONSTANTS.appName,
                '월정액 서비스를 해지신청하시겠습니까?',
                [
                {text: '네', onPress: () => this.actionExpireService(mode,target_pk)},
                {text: '아니오', onPress: () => console.log('no')},
                ],
                {cancelable: false},
            );
        }else{
            Alert.alert(
                DEFAULT_CONSTANTS.appName,
                '1개월 무료서비스를 해지하시겠습니까?',
                [
                {text: '네', onPress: () => this.actionExpireService(mode,target_pk)},
                {text: '아니오', onPress: () => console.log('no')},
                ],
                {cancelable: false},
            );
        }
    }
    actionExpireService = async(mode,target_pk) => {
        this.setState({moreLoading:true})
        let returnCode = {code:9998};
        const end_date_2 = moment().format("YYYY-MM-") + moment().daysInMonth();
        try {
            returnCode = await apiObject.API_expireService({
                locale: "ko",
                expire_type : 'alarm',
                end_date : CommonFunction.convertDateToUnix(end_date_2),
                target_pk
            }); 
            //console.log('reqeustFreeServiceAction',returnCode);
            if ( returnCode.code === '0000') {
                if ( mode === 'free' ) {
                    CommonFunction.fn_call_toast('해지가 완료되었습니다.',1500) 
                }else{
                    CommonFunction.fn_call_toast('해지신청이 완료되었습니다.',1500) 
                }
                setTimeout(() => {
                    this.setState({moreLoading:false})
                    this.props.navigation.popToTop();
                }, 1500);
            }else{
                CommonFunction.fn_call_toast('일시적으로 오류가 발생하였습니다.',2000) 
                this.setState({moreLoading:false})
            }
        }catch(e){
            //console.log('returnCode error1',e);
            CommonFunction.fn_call_toast('일시적으로 오류가 발생하였습니다.',2000) 
            this.setState({moreLoading:false})
        }
    }

    renderServiceStatus = (myUsingServiceData) => {
        if ( !CommonUtil.isEmpty(myUsingServiceData)) {
            
            if ( myUsingServiceData.is_status === 'ing') {
                return (
                    <View style={styles.backgroundImageWarp2}>                                
                        <ImageBackground
                            source={BackgroundImageOn}
                            resizeMode={'contain'}
                            style={styles.markerBackRedWrap }
                        >
                            <View style={styles.ticketCoverWrap}>
                                <View style={styles.ticketLeftWrap}>
                                    <CustomTextR style={[CommonStyle.textSize14,CommonStyle.fontColorBase]}>급매물알림서비스</CustomTextR>
                                    <View style={styles.barStyle} />
                                    <TextRobotoM style={[CommonStyle.textSize20,CommonStyle.fontColor000]}>
                                        {CommonFunction.currencyFormat(DEFAULT_CONSTANTS.DEFAULT_FAST_DEAL_COST)}<CustomTextB style={[CommonStyle.textSize18,CommonStyle.fontColor000]}>원/ 월   </CustomTextB> 
                                    </TextRobotoM>
                                    <View style={styles.paddingStyle01} />
                                    <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                        {CommonFunction.convertUnixToDateToday2(CommonFunction.convertUnixToDate(myUsingServiceData.start_date))} ~ 
                                        {CommonUtil.isEmpty(myUsingServiceData.end_date) ?
                                        null :
                                        CommonFunction.convertUnixToDateToday2(CommonFunction.convertUnixToDate(myUsingServiceData.end_date))
                                        }
                                    </CustomTextR>
                                </View>
                                <View style={styles.ticketRightWrap}>
                                    <CustomTextR style={[CommonStyle.textSize14,CommonStyle.fontColor999]}>자동연장</CustomTextR>
                                    <View style={styles.paddingStyle01} />
                                    <View style={styles.paddingStyle02} />
                                    <TouchableOpacity onPress={()=>this.cancelService('alarm',myUsingServiceData.settlement_pk)}>
                                        <Image source={EXPIRE_BUTTON} style={styles.btnStyle} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ImageBackground>
                    </View>
                )
            }else if ( myUsingServiceData.is_status === 'stop' ) {
                return (
                    <View style={styles.backgroundImageWarp2}>                                
                        <ImageBackground
                            source={BackgroundImageOn}
                            resizeMode={'contain'}
                            style={styles.markerBackRedWrap }
                        >
                            <View style={styles.ticketCoverWrap}>
                                <View style={styles.ticketLeftWrap}>
                                    <CustomTextR style={[CommonStyle.textSize14,CommonStyle.fontColorBase]}>급매물알림서비스</CustomTextR>
                                    <View style={styles.barStyle} />
                                    <TextRobotoM style={[CommonStyle.textSize20,CommonStyle.fontColor000]}>
                                        {CommonFunction.currencyFormat(DEFAULT_CONSTANTS.DEFAULT_FAST_DEAL_COST)}<CustomTextB style={[CommonStyle.textSize18,CommonStyle.fontColor000]}>원/ 월   </CustomTextB> 
                                    </TextRobotoM>
                                    <View style={styles.paddingStyle01} />
                                    <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                        {CommonFunction.convertUnixToDateToday2(CommonFunction.convertUnixToDate(myUsingServiceData.start_date))} ~ 
                                        {CommonUtil.isEmpty(myUsingServiceData.end_date) ?
                                        null :
                                        CommonFunction.convertUnixToDateToday2(CommonFunction.convertUnixToDate(myUsingServiceData.end_date))
                                        }
                                    </CustomTextR>
                                </View>
                                <View style={styles.ticketRightWrap}>
                                    <CustomTextR style={[CommonStyle.textSize14,CommonStyle.fontColor999]}>해지신청중</CustomTextR>
                                    <View style={styles.paddingStyle01} />
                                    
                                </View>
                            </View>
                        </ImageBackground>
                    </View>
                )
            }else{
                return (
                    <View style={styles.backgroundImageWarp2}>      
                    </View>
                )
            }
        }else{
            return (
                <View style={styles.backgroundImageWarp2}>                                
                    <ImageBackground
                        source={BackgroundImageOn}
                        resizeMode={'contain'}
                        style={styles.markerBackRedWrap }
                    >
                        <View style={styles.ticketCoverWrap}>
                            <View style={styles.ticketLeftWrap}>
                                <CustomTextR style={[CommonStyle.textSize14,CommonStyle.fontColorBase]}>급매물알림서비스</CustomTextR>
                                <View style={styles.barStyle} />
                                <TextRobotoM style={[CommonStyle.textSize20,CommonStyle.fontColor000]}>
                                {CommonFunction.currencyFormat(DEFAULT_CONSTANTS.DEFAULT_FAST_DEAL_COST)}<CustomTextB style={[CommonStyle.textSize18,CommonStyle.fontColor000]}>원/ 월   </CustomTextB> 
                                </TextRobotoM>
                                <View style={styles.paddingStyle01} />
                                <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                    {CommonFunction.convertUnixToDateToday2(CommonFunction.convertUnixToDate(myUsingServiceData.start_date))} ~ {CommonFunction.convertUnixToDateToday2(CommonFunction.convertUnixToDate(myUsingServiceData.end_date))}
                                </CustomTextR>
                            </View>
                            <View style={styles.ticketRightWrap}>
                                <CustomTextR style={[CommonStyle.textSize14,CommonStyle.fontColor999]}>자동연장</CustomTextR>
                                <View style={styles.paddingStyle01} />
                                <View style={styles.paddingStyle02} />
                                <TouchableOpacity onPress={()=>this.cancelService('alarm',myUsingServiceData.settlement_pk)}>
                                    <Image source={EXPIRE_BUTTON} style={styles.btnStyle} />
                                </TouchableOpacity>
                                
                            </View>
                        </View>
                        
                    </ImageBackground>
                </View>
            )
        }
    }

    moveDetail = (nav,item) => {
        this.props.navigation.navigate(nav,{
            screenTitle:item
        })
        
    }

    render() {
        if ( this.state.loading ) {
            return (
                <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} />
            )
        }else {
            return(
                <SafeAreaView style={ styles.container }>   
                    {  Platform.OS == 'android' &&  <StatusBar translucent backgroundColor={this.state.statusBarColor} />}                    
                    <View style={[styles.fixedHeaderWrap,{backgroundColor:this.state.statusBarColor}]}>
                        <View style={styles.fixedHeader}>
                            <TouchableOpacity 
                                hitSlop={{left:10,right:10,top:10,bottom:10}}                                 
                                onPress={()=>this.props.navigation.goBack(null)} 
                                style={styles.fixedHeaderLeft}
                                >
                                <Image source={this.state.isIng ? BACK_BUTTON_IMAGE2 : BACK_BUTTON_IMAGE} style={CommonStyle.defaultIconImage30} />
                            </TouchableOpacity>
                            <View style={styles.fixedHeaderCenter}>
                                <CustomTextB style={this.state.isIng ? CommonStyle.stackHeaderCenterTextWhite : CommonStyle.stackHeaderCenterText}>결제관리</CustomTextB>
                            </View>
                            <View style={styles.fixedHeaderRight}>
                                
                            </View>
                        </View>
                    </View>                 
                    
                    <View style={[this.state.isIng ?styles.dataCoverWrap2 : styles.dataCoverWrap,{backgroundColor:this.state.statusBarColor}]}>
                        {!this.state.isIng &&
                        <CustomTextR style={[CommonStyle.textSize14,CommonStyle.fontColor999]}>현재 이용중인 이용권이 없습니다.</CustomTextR>
                        }
                    </View>
                    <View style={styles.commonFlex}>
                        {this.state.isIng ?
                            <>
                            <View style={styles.usintTextWrap}>
                                <CustomTextR style={[CommonStyle.textSize14,CommonStyle.fontColorWhite]}>현재 이용중인 이용권</CustomTextR>
                            </View>                            
                            { this.renderServiceStatus(this.state.myUsingServiceData)}                            
                            </>
                        :
                        <View style={styles.backgroundImageWarp}>
                            <ImageBackground
                                source={BackgroundImageOff}
                                resizeMode={'contain'}
                                style={styles.markerBackRedWrap }
                            >
                                <View style={styles.ticketCoverWrap}>
                                    <View style={styles.ticketLeftWrap}>
                                        <CustomTextR style={[CommonStyle.textSize14,CommonStyle.fontColorBase]}>급매물알림서비스</CustomTextR>
                                        <View style={styles.barStyle} />
                                        <TextRobotoM style={[CommonStyle.textSize20,CommonStyle.fontColor000]}>
                                        {CommonFunction.currencyFormat(DEFAULT_CONSTANTS.DEFAULT_FAST_DEAL_COST)}<CustomTextB style={[CommonStyle.textSize18,CommonStyle.fontColor000]}>원/ 월   </CustomTextB> 
                                        </TextRobotoM>
                                        <View style={styles.paddingStyle01} />
                                        <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>매월 자동연장됩니다.</CustomTextR>
                                    </View>
                                    <View style={styles.ticketRightWrap}>
                                        <CustomTextR style={[CommonStyle.textSize14,CommonStyle.fontColorWhite]}>자동연장</CustomTextR>
                                        <View style={styles.paddingStyle01} />
                                        <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColorWhite]}>지금신청시</CustomTextR>
                                        <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColorWhite]}>1개월무료</CustomTextR>
                                        <View style={styles.paddingStyle02} />
                                        {/*
                                        <TouchableOpacity onPress={()=>this.reqeustService()}>
                                            <Image source={REQUEST_BUTTON} style={styles.btnStyle} />
                                        </TouchableOpacity>
                                        */}
                                        {this.state.is_failedStatus ? 
                                        <TouchableOpacity onPress={()=>this.checkeServiceSettle()}>
                                            <Image source={REGEN_BUTTON} style={styles.btnStyle} />
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity onPress={()=>this.requestServiceSettle()}>
                                            <Image source={REQUEST_BUTTON} style={styles.btnStyle} />
                                        </TouchableOpacity>
                                        }
                                    </View>
                                </View>
                                
                            </ImageBackground>
                        </View>
                        }
                        {/*
                        <TouchableOpacity 
                            onPress={()=> this.setState({
                                isIng: !this.state.isIng,
                                statusBarColor :  this.state.isIng ? '#f7f7f7': DEFAULT_COLOR.base_color
                            })}
                            style={{paddingHorizontal:20,height:50,alignItems:'center',justifyContent:'center',backgroundColor:'#000'}}
                        >
                            <CustomTextR style={[CommonStyle.textSize14,CommonStyle.fontColorWhite]}>체인지</CustomTextR>
                        </TouchableOpacity>
                        */}
                        <View style={styles.middleTitleWarp}>
                            <CustomTextB style={[CommonStyle.textSize14,CommonStyle.fontColor000]}>이용권 안내사항</CustomTextB>
                        </View>
                        <View style={styles.middleDataWarp}>
                            <View style={styles.datadotWrap}>
                                <Image source={DOT_ICON_IMAGE} style={styles.dotStyle} />
                            </View>  
                            <View style={styles.datacontentWrap}>
                                <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor999]}>이용권 구매시 매일 1회 급매물의 정보를 알림으로 알려드립니다.</CustomTextR>
                            </View> 
                        </View>
                        <View style={styles.middleDataWarp}>
                            <View style={styles.datadotWrap}>
                                <Image source={DOT_ICON_IMAGE} style={styles.dotStyle} />
                            </View>  
                            <View style={styles.datacontentWrap}>
                                <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor999]}>관심아파트 설정대상으로 하며,[마이페이지]-[알림]에서 리스트확인이 가능합니다.</CustomTextR>
                            </View>                        
                        </View>
                        <View style={styles.middleDataWarp}>
                            <View style={styles.datadotWrap}>
                                <Image source={DOT_ICON_IMAGE} style={styles.dotStyle} />
                            </View>  
                            <View style={styles.datacontentWrap}>
                                <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor999]}>이용권은 월이용으로 자동으로 결제됩니다.</CustomTextR>
                            </View>                        
                        </View>
                        <View style={styles.middleDataWarp}>
                            <View style={styles.datadotWrap}>
                                <Image source={DOT_ICON_IMAGE} style={styles.dotStyle} />
                            </View>  
                            <View style={styles.datacontentWrap}>
                                <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor999]}>해지신청을 한 경우 익월부터 결제해지가 됩니다.</CustomTextR>
                            </View>                        
                        </View>
                        <View style={styles.middleDataWarp}>
                            <View style={styles.datadotWrap}>
                                <Image source={DOT_ICON_IMAGE} style={styles.dotStyle} />
                            </View>  
                            <View style={styles.datacontentWrap}>
                                <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor999]}>결제는 구매 확인시 iTunes 계정으로 청구됩니다.</CustomTextR>
                            </View>                        
                        </View>
                        <View style={styles.middleDataWarp}>
                            <View style={styles.datadotWrap}>
                                <Image source={DOT_ICON_IMAGE} style={styles.dotStyle} />
                            </View>  
                            <View style={styles.datacontentWrap}>
                                <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor999]}>현재 기간이 끝나기 최소 24 시간 전에 자동 갱신을 끄지 않으면 구독이 자동으로 갱신됩니다.</CustomTextR>
                            </View>
                        </View>
                        <View style={styles.middleDataWarp}>
                            <View style={styles.datadotWrap}>
                                <Image source={DOT_ICON_IMAGE} style={styles.dotStyle} />
                            </View>  
                            <View style={styles.datacontentWrap}>
                                <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor999]}>구독은 사용자가 관리 할 수 ​​있으며 구매 후 사용자의 계정 설정으로 이동하여 자동 갱신을 끌 수 있습니다.</CustomTextR>
                            </View>
                        </View>
                        <View style={styles.middleDataWarp2}>
                            <TouchableOpacity style={styles.datacontentWrap2} onPress={()=>this.moveDetail('PrivateYakwanStack','개인정보취급방침')}>
                                <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor000]}>개인정보취급방침</CustomTextR>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.datacontentWrap2} onPress={()=>this.moveDetail('UseYakwanStack','서비스 이용약관')}>
                                <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor000]}>서비스이용약관이용약관</CustomTextR>
                            </TouchableOpacity>
                        </View>
                        {this.state.is_failedStatus || !this.state.isIng && 
                        <TouchableOpacity style={[styles.middleDataWarp,{justifyContent:'center'}]} onPress={()=>this.checkeServiceSettle()}>
                            <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColorBase]}>구입내역 복원하기</CustomTextR>
                        </TouchableOpacity>
                        }
                    </View>
                    
                </SafeAreaView>
            );
        }
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,backgroundColor : "#fff",
    },
    IndicatorContainer : {
        flex: 1,
        width:'100%',
        backgroundColor : "#fff",
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },   
    dotStyle : {
        width:7,height:7
    },
    btnStyle : {
        width:CommonUtil.dpToSize(70),height:CommonUtil.dpToSize(20)
    },
    fixedHeaderWrap : {
        position:'absolute',top:0,left:0,width:SCREEN_WIDTH,
        paddingHorizontal:20,zIndex:9999,
        ...Platform.select({
            ios: {
                justifyContent:'center',
                height: CommonFunction.isIphoneX ? DEFAULT_CONSTANTS.BottomHeight+50 :  DEFAULT_CONSTANTS.BottomHeight+60,
            },
            android: {
                justifyContent:'flex-end',
                paddingTop:DEFAULT_CONSTANTS.BottomHeight,
                height:DEFAULT_CONSTANTS.BottomHeight+30,
           }
        })
    },
    fixedHeader : {
        flex:1,flexDirection:'row',
        ...Platform.select({
            ios: {
                justifyContent:'center',
                maxHeight:DEFAULT_CONSTANTS.BottomHeight-20,
            },
            android: {                
                
           }
        })
    },
    fixedHeaderLeft : {
        flex:1,justifyContent:'center'
    },
    fixedHeaderCenter : {
        flex:2,alignItems:'center',justifyContent:'center'
    },
    fixedHeaderRight : {
        flex:1,justifyContent:'center',alignItems:'flex-end'
    },
    horizontalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal:20
    },
    
    valueText: {width: 50,color: '#000',fontSize: 20,}, 
    dataCoverWrap : {
        flex:0.6,alignItems:'center',justifyContent:'center',paddingTop : Platform.OS === 'ios' ? 30 : 60
    },
    dataCoverWrap2 : {
        flex:0.2,alignItems:'center',justifyContent:'center',paddingTop : Platform.OS === 'ios' ? 50 : 80
    },
    
    setupIconWrap : {
        position:'absolute',right:0,bottom:5
    },
    bottomButtonWarp : {
        height:120,
        justifyContent:'center',
        paddingTop:10,paddingBottom:20,paddingHorizontal:20
    },
    buttonWrapOn : {
        backgroundColor:DEFAULT_COLOR.base_color,padding:10,justifyContent:'center',alignItems:'center',borderRadius:25
    },
    commonFlex : {
        flex:4
    },
    usintTextWrap  :{
        justifyContent:'center',alignItems:'center',backgroundColor:DEFAULT_COLOR.base_color,paddingBottom:10
    },
    backgroundImageWarp : {
        flex:0.5,
        justifyContent:'center',
        paddingHorizontal:0
    },
    backgroundImageWarp2 : {
        justifyContent:'center',  
        backgroundColor:DEFAULT_COLOR.base_color,
        flex:0.5,
       ...Platform.select({
        ios: {
            paddingBottom:50
        },
        android: {                
            paddingBottom:100   
        }
        })
        
    },
    middleTitleWarp : {
        paddingHorizontal:20,
        height:50,
        justifyContent:'center',
        
    },
    middleDataWarp : {
        justifyContent:'center',
        paddingHorizontal:20,paddingBottom:5,flexDirection:'row'
    },
    middleDataWarp2 : {
        justifyContent:'center',
        paddingHorizontal:30,paddingVertical:10,flexDirection:'row'
    },
    datadotWrap : {
        width:15,justifyContent:'flex-start',alignItems:'center',paddingTop:7
    },
    datacontentWrap : {
        flex:5,justifyContent:'center'
    },
    datacontentWrap2 : {
        flex:5,justifyContent:'center',alignItems:'center'
    },
    markerBackRedWrap : {
        flex: 1,
        width:CommonUtil.dpToSize(285*1.3),
        height:CommonUtil.dpToSize(120*1.3)
    },
    ticketCoverWrap : {
        flex:1,flexDirection:'row',justifyContent:'center',marginHorizontal:CommonUtil.dpToSize((20)),
        alignItems:'flex-start',
        paddingTop:CommonUtil.dpToSize(30),
        ...Platform.select({
            ios: {
        
            },
            android: {
        
           }
        })
    },
    ticketLeftWrap : {
        flex:2,alignItems:'center',
        ...Platform.select({
            ios: {
                
            },
            android: {
               
           }
        })
    },
    ticketRightWrap:{
        flex:1.4,alignItems:'center',
        paddingTop:CommonUtil.dpToSize(10),
        ...Platform.select({
            ios: {
            },
            android: {
               
           }
        })
    },
    barStyle:{
        width:'60%',height:2,backgroundColor:'#000',marginTop:5,marginBottom:10
    },
    paddingStyle01 : {
        width:'10%',height:2,marginVertical:2
    },
    paddingStyle02 : {
        width:'10%',height:2,marginVertical:5
    }
});


function mapStateToProps(state) {
    return {
        userToken : state.GlabalStatus.userToken,
        mapCondition : state.GlabalStatus.mapCondition,
        mapSubCondition : state.GlabalStatus.mapSubCondition
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
    };
}

export default connect(mapStateToProps,mapDispatchToProps)(SettleScreen);

/*참고사이트
https://dev-yakuza.posstree.com/ko/react-native/react-native-iap/
*/