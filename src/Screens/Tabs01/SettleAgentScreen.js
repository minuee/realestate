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
import { and } from 'react-native-reanimated';

const DOT_ICON_IMAGE =  require('../../../assets/icons/icon_dot.png')
const BACK_BUTTON_IMAGE = require('../../../assets/icons/back_icon2.png');
const BACK_BUTTON_IMAGE2 = require('../../../assets/icons/back_icon_white.png');
const REQUEST_BUTTON = require('../../../assets/icons/btn_request.png');
const EXPIRE_BUTTON = require('../../../assets/icons/btn_expire.png');
const BackgroundImageOff = require('../../../assets/icons/back_request_settle.png');
const BackgroundImageOn = require('../../../assets/icons/back_settle_ing.png');

const itemSkus = Platform.select({
    ios: [
        'GOOD_AGENT_ESTATE_PAY'
    ],
    android: [
        'good_real_estate_pay'
    ],
});

const itemSubs = Platform.select({
    ios: [        
        'GOOD_AGENT_ESTATE_PAY', 
    ],
    android: [
        'good_real_estate_pay'
    ],
});
  
let purchaseUpdateSubscription = null;
let purchaseErrorSubscription = null;
const BackGroundNot =  '#f7f7f7';
const BackGroundUsing = DEFAULT_COLOR.base_color;

class SettleAgentScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading : true,
            isIng : false,
            actionSeltle : false,
            isfirstSettle : true,
            is_failedStatus : false,
            statusBarColor : BackGroundNot,
            productList: [],
            receipt: '',
            RealReceipt : '',
            availableItemsMessage: '',
            myUsingServiceData : null
        }
    }

    getInformation = async ( ) => {
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_checkAgentService({
                locale: "ko",
            });
            if ( returnCode.code === '0000') {
                const myData = returnCode.data.length > 0 ? returnCode.data[0] : {is_status:'none'};               
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
            this.setState({loading:false})
        }catch(e){
            this.setState({loading:false})
        }
    }

    checkStorageReceipt = async () => {
        try {
            const user_receipt = await AsyncStorage.getItem('agent_receipt');
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
        } catch (err) {
            console.warn(err.code, err.message);
        }

        purchaseUpdateSubscription = purchaseUpdatedListener(async purchase => {            
            if (purchase.purchaseStateAndroid === 1 && !purchase.isAcknowledgedAndroid) {
                try {
                    const ackResult = await acknowledgePurchaseAndroid(purchase.purchaseToken);                    
                } catch (ackErr) {                
                }
            }
            //console.log("this.state.isIng",this.state.isIng);
            //console.log("this.state.isImoreLoadingng",this.state.moreLoading);
            //console.log("this.state.actionSeltle",this.state.actionSeltle);
            if ( !this.state.isIng  && this.state.moreLoading && this.state.actionSeltle) {    
                //console.log("purchase.transactionReceipt",typeof purchase);    
                //console.log("purchase.transactionReceipt",typeof purchase.transactionReceipt);    
                //console.log("purchase.transactionReceipt",purchase.transactionReceipt);    
                if ( Platform.OS === 'android') {
                    const nextParams = typeof purchase.transactionReceipt == 'object' ? purchase.transactionReceipt : JSON.parse(purchase.transactionReceipt);
                    this.setState({ RealReceipt: purchase.transactionReceipt ,moreLoading:true}, () => this.goNext(nextParams));
                }else{
                    this.setState({ RealReceipt: purchase.transactionReceipt ,moreLoading:true}, () => this.goNext(purchase));
                }                
            }
        });

        purchaseErrorSubscription = purchaseErrorListener(error => {
            CommonFunction.fn_call_toast('구독신청중 오류(취소)가 발생하였습니다, 관리자에게 문의하시거나 다시 시도해주십시요',2000)
        });        
    }

    async UNSAFE_componentWillMount() {        
        await this.checkStorageReceipt();
        await this.getInformation(); 
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
  
    requestServiceSettle = async(mode) => {
        Alert.alert(
            DEFAULT_CONSTANTS.appName,      
           '월정액 서비스를 신청하시겠습니까?',
            [
                {text: '네', onPress: () => this.requestServiceSettleAction()},
                {text: '아니오', onPress: () => console.log('Cancle')}
            ],
            { cancelable: true }
        ) 
    }

    requestServiceSettleAction = async() => {
        console.log('this.state.receipt',this.state.receipt)
        if ( CommonUtil.isEmpty(this.state.receipt)) {
            const productList = await this.getSubscriptions();
            console.log('productList',productList.length)
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

    setinapp = async() => {
    }
    
    //정상적으로 결제되면 기록해준다
    goNext = async(RealReceipt,reboot=null) => {        
        //console.log("RealReceipt222", RealReceipt);     
        //console.log("RealReceipt",typeof RealReceipt);        
        //console.log("reboot",reboot);
        //console.log("this.state.actionSeltle",this.state.actionSeltle);
        if ( RealReceipt && this.state.actionSeltle) {
            let strRealReceipt =  "";  
            let strRealReceipt2 =  "";            
            if ( Platform.OS === 'ios' && reboot !== null ) {
                //console.log("111111111",RealReceipt);
                strRealReceipt = RealReceipt;
            }else if ( Platform.OS === 'android' && reboot !== null ) {
                //console.log("22222222",RealReceipt);
                strRealReceipt = RealReceipt;
            }else if ( Platform.OS === 'android' && reboot === null ) {
                strRealReceipt = RealReceipt.purchaseToken;                
                //console.log("33333333",RealReceipt);
            }else{
                //console.log("44444444",RealReceipt.transactionReceipt);
                strRealReceipt = RealReceipt.transactionReceipt;
            }
            //console.log("strRealReceipt",strRealReceipt);            
            if ( !CommonUtil.isEmpty(strRealReceipt)) {    
                await AsyncStorage.setItem('agent_receipt', strRealReceipt);             
                try {
                    let returnCode = await apiObject.API_registUserSubscriptions({
                        locale: "ko",
                        class_type : 'agent',
                        receipt : strRealReceipt,
                        receiptInfo : RealReceipt,
                        cost : DEFAULT_CONSTANTS.DEFAULT_AGENT_USE_COST,
                        is_status : 'ing'
                    });
                    //console.log("returnCode",returnCode);   
                    if ( returnCode.code === '0000') {   
                        
                        CommonFunction.fn_call_toast('정상적으로 결제되었습니다. 이용해 주셔서 감사합니다.',1500);
                        setTimeout(() => {
                            this.setState({moreLoading :false,actionSeltle:false})
                            this.props.navigation.goBack(null)
                        }, 1500);
                    }else{                   
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
                    console.log("eeee",e);       
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
        this.setState({moreLoading :true,is_failedStatus:false,actionSeltle:true})
        RNIap.getAvailablePurchases()
        .then((purchases) => {
            if ( purchases.length > 0 ) {                
                let receipt = purchases[0].transactionReceipt;
                if (Platform.OS === 'android' && purchases[0].purchaseToken) {
                    receipt = purchases[0].purchaseToken;
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
            this.setState({moreLoading :false})
        });
    }
    
    getItems = async () => {
        try {
            const products = await RNIap.getProducts(itemSkus);
            this.setState({ productList: products });
            return products;
        } catch (err) {
            return [];
        }
    }

    getSubscriptions = async () => {
        try {
            const products = await RNIap.getSubscriptions(itemSubs);
            this.setState({ productList: products });
            return products;
        } catch (err) {
            return [];
        }
    }

    getAvailablePurchases = async () => {
        try {
            const purchases = await RNIap.getAvailablePurchases();
            if (purchases && purchases.length > 0) {
                this.setState({
                    availableItemsMessage: `Got ${purchases.length} items.`,
                    receipt: purchases[0].transactionReceipt
                });
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
            RNIap.requestSubscription(sku);
        } catch (err) {
            Alert.alert(err.message);
        }
    }
    moveDetail = (nav,item) => {
        this.props.navigation.navigate(nav,{
            screenTitle:item
        })
        
    }
    cancelService = async(mode = 'free',target_pk = null) => {
        Alert.alert(
            DEFAULT_CONSTANTS.appName,
            '월정액 서비스를 해지신청하시겠습니까?',
            [
            {text: '네', onPress: () => this.actionExpireService(mode,target_pk)},
            {text: '아니오', onPress: () => console.log('no')},
            ],
            {cancelable: false},
        );
    }
    actionExpireService = async(mode,target_pk) => {
        this.setState({moreLoading:true})
        const end_date_2 = moment().format("YYYY-MM-") + moment().daysInMonth();
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_expireService({
                locale: "ko",
                expire_type : mode,
                end_date : CommonFunction.convertDateToUnix(end_date_2),
                target_pk
            }); 
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
            CommonFunction.fn_call_toast('일시적으로 오류가 발생하였습니다.',2000) 
            this.setState({moreLoading:false})
        }
    }

    renderServiceStatus = (myUsingServiceData) => {
        if ( !CommonUtil.isEmpty(myUsingServiceData)) {
            if ( myUsingServiceData.is_status === 'ing'  ) {
                return (
                    <View style={styles.backgroundImageWarp2}>                                
                        <ImageBackground
                            source={BackgroundImageOn}
                            resizeMode={'contain'}
                            style={styles.markerBackRedWrap }
                        >
                            <View style={styles.ticketCoverWrap}>
                                <View style={styles.ticketLeftWrap}>
                                    <CustomTextR style={[CommonStyle.textSize14,CommonStyle.fontColorBase]}>착한중개인가입</CustomTextR>
                                    <View style={styles.barStyle} />
                                    <TextRobotoM style={[CommonStyle.textSize20,CommonStyle.fontColor000]}>
                                        {CommonFunction.currencyFormat(DEFAULT_CONSTANTS.DEFAULT_AGENT_USE_COST)}<CustomTextB style={[CommonStyle.textSize18,CommonStyle.fontColor000]}>원/ 월   </CustomTextB> 
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
                                    <TouchableOpacity onPress={()=>this.cancelService('agent',myUsingServiceData.settlement_pk)}>
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
                                    <CustomTextR style={[CommonStyle.textSize14,CommonStyle.fontColorBase]}>착한중개인가입</CustomTextR>
                                    <View style={styles.barStyle} />
                                    <TextRobotoM style={[CommonStyle.textSize20,CommonStyle.fontColor000]}>
                                        {CommonFunction.currencyFormat(DEFAULT_CONSTANTS.DEFAULT_AGENT_USE_COST)}<CustomTextB style={[CommonStyle.textSize18,CommonStyle.fontColor000]}>원/ 월   </CustomTextB> 
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
                                <View style={styles.ticketRightWrap2}>
                                    <CustomTextR style={[CommonStyle.textSize14,CommonStyle.fontColor999]}>해지신청중</CustomTextR>
                                    <View style={styles.paddingStyle01} />                                    
                                </View>
                            </View>
                        </ImageBackground>
                    </View>
                )
            }else{
                return (
                    <View style={styles.backgroundImageWarp2}></View>
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
                                <CustomTextR style={[CommonStyle.textSize14,CommonStyle.fontColorBase]}>착한중개인가입</CustomTextR>
                                <View style={styles.barStyle} />
                                <TextRobotoM style={[CommonStyle.textSize20,CommonStyle.fontColor000]}>
                                {CommonFunction.currencyFormat(DEFAULT_CONSTANTS.DEFAULT_AGENT_USE_COST)}<CustomTextB style={[CommonStyle.textSize18,CommonStyle.fontColor000]}>원/ 월   </CustomTextB> 
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
                                <TouchableOpacity onPress={()=>this.cancelService('agent',myUsingServiceData.settlement_pk)}>
                                    <Image source={EXPIRE_BUTTON} style={styles.btnStyle} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ImageBackground>
                </View>
            )
        }
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
                        {
                            !this.state.isIng &&
                            <CustomTextR style={[CommonStyle.textSize14,CommonStyle.fontColor999]}>현재 이용중인 이용권이 없습니다.</CustomTextR>
                        }
                    </View>
                    
                        
                    <View style={styles.commonFlex}>
                        {
                            this.state.isIng ?
                            <>
                            <View style={{justifyContent:'center',alignItems:'center',backgroundColor:DEFAULT_COLOR.base_color}}>
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
                                        <CustomTextR style={[CommonStyle.textSize14,CommonStyle.fontColorBase]}>착한중개인가입</CustomTextR>
                                        <View style={styles.barStyle} />
                                        <TextRobotoM style={[CommonStyle.textSize20,CommonStyle.fontColor000]}>
                                        {CommonFunction.currencyFormat(DEFAULT_CONSTANTS.DEFAULT_AGENT_USE_COST)}<CustomTextB style={[CommonStyle.textSize18,CommonStyle.fontColor000]}>원/ 월   </CustomTextB> 
                                        </TextRobotoM>
                                        <View style={styles.paddingStyle01} />
                                        <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>매월 자동연장됩니다.</CustomTextR>
                                    </View>
                                    <View style={styles.ticketRightWrap}>
                                        <CustomTextR style={[CommonStyle.textSize14,CommonStyle.fontColorWhite]}>자동연장</CustomTextR>
                                        <View style={styles.paddingStyle01} />
                                        <View style={styles.paddingStyle02} />
                                        {this.state.is_failedStatus ? 
                                        <TouchableOpacity onPress={()=>this.checkeServiceSettle()}>
                                            <CustomTextR style={[CommonStyle.textSize14,CommonStyle.fontColorWhite]}>결제복원</CustomTextR>
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
                                <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor999]}>이용권 구매시, 지도와 착한중개인 리스트에 노출이 됩니다.</CustomTextR>
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
                        {
                            this.state.is_failedStatus || !this.state.isIng && 
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
                justifyContent:'flex-end',
                height: CommonFunction.isIphoneX ? DEFAULT_CONSTANTS.BottomHeight+30 :  DEFAULT_CONSTANTS.BottomHeight+60,
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
    profileImageWrap : {
        flex:1,width:SCREEN_WIDTH/4,height:SCREEN_WIDTH/4
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
        flex:5
    },
    backgroundImageWarp : {
        flex:0.5,
        justifyContent:'center',
    },
    backgroundImageWarp2 : {       
        justifyContent:'center',  
        backgroundColor:DEFAULT_COLOR.base_color,        
        ...Platform.select({
            ios: {
                flex:0.55,
            },
            android: {                
                flex:0.4,
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
    },
    ticketLeftWrap : {
        flex:2,alignItems:'center'
    },
    ticketRightWrap:{
        flex:1.4,alignItems:'center',
        paddingTop:CommonUtil.dpToSize(10)
    },
    ticketRightWrap2:{
        flex:1.4,alignItems:'center',
        paddingTop:CommonUtil.dpToSize(30)
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

export default connect(mapStateToProps,mapDispatchToProps)(SettleAgentScreen);

/*참고사이트
https://dev-yakuza.posstree.com/ko/react-native/react-native-iap/

[Thu Oct 21 2021 15:55:23.241]  LOG      this.state.receipt 
[Thu Oct 21 2021 15:55:23.319]  LOG      productList 1
[Thu Oct 21 2021 15:55:40.329]  LOG      this.state.isIng false
[Thu Oct 21 2021 15:55:40.330]  LOG      this.state.isImoreLoadingng true
[Thu Oct 21 2021 15:55:40.331]  LOG      this.state.actionSeltle true
[Thu Oct 21 2021 15:55:40.331]  LOG      purchase.transactionReceipt {"orderId":"GPA.3318-1060-7697-46306","packageName":"com.realestateagent","productId":"good_real_estate_pay","purchaseTime":1634799335590,"purchaseState":0,"purchaseToken":"kmgcifdkobhjofmieihgfbgg.AO-J1Ox57I1wFHcuG4DtCzc_cIYSb_QHbQZ-OnlVAgpHfrWhet1roUXE81okpoCzmFLyh0sr6goQ2ia7sPelW1vlSgCrqWoSxw","autoRenewing":true,"acknowledged":false}
[Thu Oct 21 2021 15:55:40.389]  LOG      RealReceipt {"autoRenewingAndroid": true, "dataAndroid": "{\"orderId\":\"GPA.3318-1060-7697-46306\",\"packageName\":\"com.realestateagent\",\"productId\":\"good_real_estate_pay\",\"purchaseTime\":1634799335590,\"purchaseState\":0,\"purchaseToken\":\"kmgcifdkobhjofmieihgfbgg.AO-J1Ox57I1wFHcuG4DtCzc_cIYSb_QHbQZ-OnlVAgpHfrWhet1roUXE81okpoCzmFLyh0sr6goQ2ia7sPelW1vlSgCrqWoSxw\",\"autoRenewing\":true,\"acknowledged\":false}", "developerPayloadAndroid": "", "isAcknowledgedAndroid": false, "obfuscatedAccountIdAndroid": "", "obfuscatedProfileIdAndroid": "", "packageNameAndroid": "com.realestateagent", "productId": "good_real_estate_pay", "purchaseStateAndroid": 1, "purchaseToken": "kmgcifdkobhjofmieihgfbgg.AO-J1Ox57I1wFHcuG4DtCzc_cIYSb_QHbQZ-OnlVAgpHfrWhet1roUXE81okpoCzmFLyh0sr6goQ2ia7sPelW1vlSgCrqWoSxw", "signatureAndroid": "U1GYIbBj5ArzWV18OYbyBg1ZHUOuihENMcLnRXZXqpTn2Lq435C6s3VTwdJf9Mem0ty/rzTAsd+L1qYSiJxlSjduxllh1PPW73u58wUvhBbNTs5oKdAm1PEYsXXAWDFYs5Xo2rs9nadY0gsCd61aPOqOHSQ3Q4ZGiU4gUCFKW0njgRPaBN3pZiffNkvlOUeLrEsHOAOcHf9hH8rH9VpIvmoJkcWTQmYWM2okYEErkzRrQ3vM4S12ZV5Tb4ntm38E1Hp0qFDuVjzRmcFViR0Y+dcCI93RIK+R8AC1Y97OWdhB3oESkcLCd2yTrS9UdiwGTVmDGl5Fp2OFGGdjqkITzQ==", "transactionDate": 1634799335590, "transactionId": "GPA.3318-1060-7697-46306", "transactionReceipt": "{\"orderId\":\"GPA.3318-1060-7697-46306\",\"packageName\":\"com.realestateagent\",\"productId\":\"good_real_estate_pay\",\"purchaseTime\":1634799335590,\"purchaseState\":0,\"purchaseToken\":\"kmgcifdkobhjofmieihgfbgg.AO-J1Ox57I1wFHcuG4DtCzc_cIYSb_QHbQZ-OnlVAgpHfrWhet1roUXE81okpoCzmFLyh0sr6goQ2ia7sPelW1vlSgCrqWoSxw\",\"autoRenewing\":true,\"acknowledged\":false}"}
*/

