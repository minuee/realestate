import React, { Component,useCallback, useState } from 'react';
import {StatusBar,ScrollView,ActivityIndicator, Platform, TouchableOpacity, View,StyleSheet,Image,Dimensions,PixelRatio,Alert,ImageBackground,Animated,BackHandler} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import 'moment/locale/ko'
import  moment  from  "moment";
import {connect} from 'react-redux';
import ActionCreator from '../../Ducks/Actions/MainActions';
import {Overlay} from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
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
import CheckConnection from '../../Components/CheckConnection';

import Slider from 'rn-range-slider';

import Thumb from '../../Components/Slider/Thumb';
import Thumb2 from '../../Components/Slider/Thumb2';
import Rail from '../../Components/Slider/Rail';
import Rail2 from '../../Components/Slider/Rail2';
import RailSelected from '../../Components/Slider/RailSelected';
import RailSelected2 from '../../Components/Slider/RailSelected2';
import Notch from '../../Components/Slider/Notch';
import Label from '../../Components/Slider/Label';


import { apiObject } from "../../Apis/Member";

const baseStartPrice = 1;
const baseEndPrice = 100;
const BUTTON_RIGHT_GRAY = require('../../../assets/icons/arrow_right_gray.png');

/*
https://github.com/githuboftigran/rn-widgets-demo/blob/master/src/screens/Slider/index.js
*/
const SliderScreen = (props) => {   
    const setupRealEstedGubun = props.screenState.mapCondition.setupRealEstedGubun;    
    let isEditable = false;
    if ( setupRealEstedGubun === 'C' || setupRealEstedGubun === 'D' )  {
        isEditable = true;
    } 
    const dataLow = props.screenState.mapCondition.selectedRateDataFrom;
    const dataHigh = props.screenState.mapCondition.selectedRateDataTo;
    const [low, setLow] = useState(0);
    const [high, setHigh] = useState(100);
    const renderThumb = useCallback(() => <Thumb />, []);
    const renderThumb2 = useCallback(() => <Thumb2 />, []);
    const renderRail = useCallback(() => <Rail />, []);
    const renderRail2 = useCallback(() => <Rail2 />, []);
    const renderRailSelected = useCallback(() => <RailSelected/>, []);
    const renderRailSelected2 = useCallback(() => <RailSelected2/>, []);
    const renderLabel = useCallback(value => <Label text={value} unit={'%'} />, []);
    const renderNotch = useCallback(() => <Notch/>, []);
    const handleValueChange = useCallback((low, high) => {
        setLow(low);
        setHigh(high);
        props.screenState.setRateData(low,high)
    }, []);
    
    return <>
        <View style={styles.sliderRoot}>
            { 
                isEditable ?
                <View style={styles.horizontalContainer}>
                    <CustomTextM style={[CommonStyle.textSize20,CommonStyle.fontColorccc]}>{low}%</CustomTextM>
                    <CustomTextM style={[CommonStyle.textSize20,CommonStyle.fontColorccc]}>{high}%</CustomTextM>
                </View>
                :
                <View style={styles.horizontalContainer}>
                    <CustomTextM style={[CommonStyle.textSize20,CommonStyle.fontColorBase]}>{low}%</CustomTextM>
                <CustomTextM style={[CommonStyle.textSize20,CommonStyle.fontColorBase]}>{high}%</CustomTextM>
                </View>
            }
            <Slider
                style={styles.slider}
                min={10}
                max={50}
                low={dataLow}
                high={dataHigh}
                disabled={isEditable}
                step={5}
                floatingLabel={true}
                allowLabelOverflow={true}
                disableRange={false}        
                renderThumb={isEditable ? renderThumb2 : renderThumb}
                renderRail={isEditable ? renderRail2 : renderRail}
                renderRailSelected={isEditable ? renderRailSelected2 : renderRailSelected}
                renderLabel={renderLabel}
                renderNotch={renderNotch}
                onValueChanged={handleValueChange}
            />
        </View>
        </>
}

const SliderScreen2 = (props) => {
    const setupRealEstedGubun = props.screenState.mapCondition.setupRealEstedGubun;
    let isEditable = false;
    if ( setupRealEstedGubun === 'A' || setupRealEstedGubun === 'B' )  {
        isEditable = true;
    }
    const dataLow = props.screenState.mapCondition.selectedPriceDataFrom;
    const dataHigh = props.screenState.mapCondition.selectedPriceDataTo;
    const [low2, setLow2] = useState(0);
    const [high2, setHigh2] = useState(100);
    const renderThumb = useCallback(() => <Thumb />, []);
    const renderThumb2 = useCallback(() => <Thumb2 />, []);
    const renderRail = useCallback(() => <Rail/>, []);
    const renderRail2 = useCallback(() => <Rail2 />, []);
    const renderRailSelected = useCallback(() => <RailSelected />, []);
    const renderRailSelected2 = useCallback(() => <RailSelected2 />, []);
    const renderLabel = useCallback(value => <Label text={value} unit={'억'} />, []);
    const renderNotch = useCallback(() => <Notch/>, []);
    const handleValueChange = useCallback((low2, high2) => {
        setLow2(low2);
        setHigh2(high2);
        props.screenState.setPriceData(low2,high2)
    }, []);
    
    return <>
        <View style={styles.sliderRoot}>
            { 
                isEditable ?
                <View style={styles.horizontalContainer}>
                    <CustomTextM style={[CommonStyle.textSize20,CommonStyle.fontColorccc]}>{low2}억</CustomTextM>
                    <CustomTextM style={[CommonStyle.textSize20,CommonStyle.fontColorccc]}>{high2}억</CustomTextM>
                </View>
                :
                <View style={styles.horizontalContainer}>
                    <CustomTextM style={[CommonStyle.textSize20,CommonStyle.fontColorBase]}>{low2}억</CustomTextM>
                    <CustomTextM style={[CommonStyle.textSize20,CommonStyle.fontColorBase]}>{high2}억</CustomTextM>
                </View>
            }
            <Slider
                style={styles.slider}
                min={baseStartPrice}
                max={baseEndPrice}
                low={dataLow}
                high={dataHigh}
                step={1}
                disabled={isEditable}
                floatingLabel={true}
                allowLabelOverflow={true}
                disableRange={false}        
                renderThumb={isEditable ? renderThumb2 : renderThumb}
                renderRail={isEditable ? renderRail2 : renderRail}
                renderRailSelected={isEditable ? renderRailSelected2 : renderRailSelected}
                renderLabel={renderLabel}
                renderNotch={renderNotch}
                onValueChanged={handleValueChange}
            />
        </View>
        </>
}

const RequestAlarmServeice = (props) => {
    return <>
        <View style={styles.popLayerWrap}>
            <View style={styles.modalTitleWrap} >
                <View style={styles.modalLeftWrap} />
                <TouchableOpacity onPress={()=>props.screenState.closePopView()} style={styles.modalRightWrap}>
                    <Image source={require('../../../assets/icons/btn_close.png')} resizeMode={'contain'} style={CommonStyle.defaultImage40} />
                </TouchableOpacity>
            </View>
            <View style={styles.poplayerDataCoverWrap} >
                <Image 
                    source={require('../../../assets/icons/title_alarm_service.png')} resizeMode={"contain"}
                    style={{width:CommonUtil.dpToSize(149),height:CommonUtil.dpToSize(51.5)}}
                />
                <View style={styles.poplayerDataWrap3} >
                    <View style={styles.poplayerDataLeftWrap3}>
                        <Image 
                            source={require('../../../assets/icons/icon_shape.png')} resizeMode={"contain"}
                            style={{width:CommonUtil.dpToSize(11.5),height:CommonUtil.dpToSize(9.1)}}
                        />
                    </View>
                    <View style={styles.poplayerDataRightWrap3}>
                        <CustomTextM style={[CommonStyle.textSize14,CommonStyle.fontColor000]}>
                            아파트 급매물 놓치지 않기
                        </CustomTextM>
                    </View>
                </View>
                <View style={styles.poplayerDataWrap2} >
                    <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor000]}>
                        매일 1회 급매물의 정보를 알림으로 알려드립니다.
                    </CustomTextR>
                    <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor000]}>
                    관심아파트 설정대상{"\n"}[마이페이지]-[알림]에서 리스트확인
                    </CustomTextR>                    
                </View>
                <View style={[styles.poplayerDataWrap,{width:'100%'}]} >
                    <ImageBackground
                        source={require('../../../assets/icons/btn_background.png')}
                        style={{width:CommonUtil.dpToSize(210),height:CommonUtil.dpToSize(50)}}
                    >
                        <TouchableOpacity 
                            style={styles.popLayerButtonWarp}
                            onPress={()=>props.screenState.reqeustFreeService()}
                        >
                            <CustomTextM style={[CommonStyle.textSize14,CommonStyle.fontColorWhite]}>
                                1개월 무료이용하기
                            </CustomTextM>
                        </TouchableOpacity>
                    </ImageBackground>
                </View>
            </View>
        </View>
    </>
}


 class SetupConditionScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading : false,
            moreLoading :false,
            showModal : false,
            showModalYear : false,
            popLayerView : false,
            popLayerViewIsFirst : false,

            selectedRateDataFrom : 0,
            selectedRateDataTo : 50,
            selectedPriceDataFrom : 1,
            selectedPriceDataTo : 100,
            setupRealEstedGubun : [],
            setupRealEstedOption : false,
            closePopView : this.closePopView.bind(this),
            reqeustFreeService : this.reqeustFreeService.bind(this)
        }
    }

    closePopView = () => {
        this.setState({popLayerView:false,moreLoading:false})
    }

    setRateData = async(low = 0, hight = 50 ) => {
        this.setState({
            selectedRateDataFrom : low,
            selectedRateDataTo : hight
        })
    }
    setPriceData = async(low = 1, hight = 15 ) => {
        this.setState({
            selectedPriceDataFrom : low,
            selectedPriceDataTo : hight
        })
    }

    async UNSAFE_componentWillMount() {
        if ( !CommonUtil.isEmpty(this.props.mapCondition.condition) ) {
            this.setState({                
                selectedRateDataFrom : !CommonUtil.isEmpty(this.props.mapCondition.condition.saleRate.sSaleRate) ? this.props.mapCondition.condition.saleRate.sSaleRate : 10,
                selectedRateDataTo : !CommonUtil.isEmpty(this.props.mapCondition.condition.saleRate.eSaleRate) ? this.props.mapCondition.condition.saleRate.eSaleRate : 50,
                selectedPriceDataFrom : !CommonUtil.isEmpty(this.props.mapCondition.condition.priceLevel)? this.props.mapCondition.condition.priceLevel.sPriceLevel : 1,
                selectedPriceDataTo : !CommonUtil.isEmpty(this.props.mapCondition.condition.priceLevel)?this.props.mapCondition.condition.priceLevel.ePriceLevel : 100,
                setupRealEstedGubun : this.props.mapCondition.condition.realEstedGubun,
                setupRealEstedOption : this.props.mapCondition.condition.realEstedOption
                
            })
        }
    }
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }
    handleBackPress = () => {
        this.props.navigation.goBack(null)
        return true;  // Do nothing when back button is pressed
    }

    logoutAction = async() => {
        await this.closePopView();
        /*
        this.props._saveNonUserToken({});
        this.props._saveUserToken({});
        setTimeout(() => {
            this.props.navigation.popToTop();
        }, 500);
        */
        this.props.navigation.navigate('LoginPopStack');
    }
    reqeustFreeService = async() => {
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
    reSettleAlert = () => {
        Alert.alert(
            DEFAULT_CONSTANTS.appName,      
            "1개월무료서비스를 이미 사용하셨습니다? 유료서비스를 신청하시겠습니까?",
            [
                {text: '네', onPress: () => this.props.navigation.navigate('SettleStack',{isFreeRequest : true})},
                {text: '아니오', onPress: () => console.log('Cancle')},
                
            ],
            { cancelable: true }
        ) 
    }

    reqeustFreeServiceAction = async() => {
        this.setState({moreLoading:true})
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_requestFreeService({
                locale: "ko",
            }); 
            //console.log('reqeustFreeServiceAction',returnCode);
            if ( returnCode.code === '0000') {

                if ( CommonUtil.isEmpty(returnCode.data) ) {
                    await this.closePopView();
                    this.props.navigation.navigate('SettleStack',{isFreeRequest : true});  
                }else{
                    if ( returnCode.data.is_status === 'end' ) {
                        await this.closePopView();
                        this.reSettleAlert()
                    }else{
                        this.setState({moreLoading:false})
                        CommonFunction.fn_call_toast('현재 서비스를 이용중입니다.',2000);
                    }
                }

                /*
                if ( returnCode.type === 'check') {
                    if ( returnCode.data.history === 'ing') {
                        CommonFunction.fn_call_toast('현재 1개월무료서비스를 이용중입니다.',2000)
                    }else if ( returnCode.data.history === 'end') {
                        CommonFunction.fn_call_toast('1개월무료서비스를 이미 사용하셨습니다.',2000)
                    }else{
                        
                    }
                    this.setState({moreLoading:false,popLayerView:false})
                }else{
                    CommonFunction.fn_call_toast('1개월무료서비스 신청이 완료되었습니다.',2000)
                    this.setState({moreLoading:false,popLayerView:false})
                }
                */
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
    
    checkRealEstedGubun = async(gubun) => {
        let tmpRealEstedGubun = this.state.setupRealEstedGubun;
        if ( tmpRealEstedGubun.includes(gubun)) {
            //let tmpRealEstedGubun2 = await tmpRealEstedGubun.filter((info) => info !== gubun )
            tmpRealEstedGubun = [];
            this.setState({setupRealEstedGubun : tmpRealEstedGubun})
        }else{
            tmpRealEstedGubun = gubun;
            this.setState({setupRealEstedGubun : tmpRealEstedGubun})            
            if ( !this.state.popLayerViewIsFirst && gubun === 'A') {
                //this.setState({popLayerView:true,popLayerViewIsFirst:true})
            }
        }
    }

    animatedHeight = new Animated.Value(SCREEN_HEIGHT);
    
    closeModal = () => {
        this.setState({showModal:false})
    };
    closeModalYear = () => {
        this.setState({showModalYear:false})
    };

    checkRealEstedOption = async(bool) => {
        this.setState({
            setupRealEstedOption : !bool
        })
    }

    setMemberRate = async(selectedRateDataFrom,selectedRateDataTo) => {
        if ( !CommonUtil.isEmpty(this.props.userToken)) {
            let returnCode = {code:9998};
            try {
                returnCode = await apiObject.API_updateFastDealRate({
                    locale: "ko",
                    member_pk : this.props.userToken.member_pk,
                    sSaleRate : selectedRateDataFrom,
                    eSaleRate : selectedRateDataTo,
                }); 
                //console.log('reqeustFreeServiceAction',returnCode);
            }catch(e){
                //console.log('eee',e);
            }
        }
    }
    setupSearchCondition =  async() => {
        const selectedRateDataFrom = this.state.selectedRateDataFrom;
        const selectedRateDataTo = this.state.selectedRateDataTo;
        const selectedPriceDataFrom = this.state.selectedPriceDataFrom;
        const selectedPriceDataTo = this.state.selectedPriceDataTo;
        this.setMemberRate(selectedRateDataFrom,selectedRateDataTo)
        await  AsyncStorage.setItem('mapCondition',
            JSON.stringify({
                stime : moment().unix(),
                condition : {                
                    realEstedGubun : this.state.setupRealEstedGubun,
                    realEstedOption :  this.state.setupRealEstedOption,
                    priceLevel : {
                        sPriceLevel : selectedPriceDataFrom,
                        ePriceLevel : selectedPriceDataTo
                    },
                    saleRate : {
                        sSaleRate : selectedRateDataFrom,
                        eSaleRate : selectedRateDataTo
                    },
                }
            })
        );    
        this.props._setupMapCondition({
            stime : moment().unix(),
            condition : {                
                realEstedGubun : this.state.setupRealEstedGubun,
                realEstedOption :  this.state.setupRealEstedOption,
                priceLevel : {
                    sPriceLevel : selectedPriceDataFrom,
                    ePriceLevel : selectedPriceDataTo
                },
                saleRate : {
                    sSaleRate : selectedRateDataFrom,
                    eSaleRate : selectedRateDataTo
                },
            }
        })
        setTimeout(() => {
            this.setState({loading:false,moreLoading:false})
            this.props.navigation.goBack(null);
        }, 1000);
    }

    moveNavigation = (gubun) => {
        //console.log('moveDetail',item)   
        if ( this.state.setupRealEstedGubun === 'C' || this.state.setupRealEstedGubun === 'D' )  {
            if ( gubun === 'setyear') {
                this.props.navigation.navigate('SetupYearStack')
            }else if ( gubun === 'setheibo') {
                this.props.navigation.navigate('SetupHeiboStack');
            }else if ( gubun === 'sethousehold') {
                this.props.navigation.navigate('SetupHouseholdStack')
            }else{

            }
        }else{
            CommonFunction.fn_call_toast('매매와 전세선택시 설정가능합니다.',2000)
            return;
        }
    }
    

    render() {
        if ( this.state.loading ) {
            return (
                <ActivityIndicator size="small" color={DEFAULT_COLOR.base_color} style={{paddingTop:100}} />
            )
        }else {
            return(
                <View style={ styles.container }>
                    <CheckConnection isFull={true} />
                    { Platform.OS == 'android' &&  <StatusBar translucent backgroundColor="transparent" />}
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        indicatorStyle={'white'}
                    >
                    <View style={styles.modalDataCoverWrap} >
                        <View style={styles.modalDataTitleWrap} >
                            <CustomTextB style={[CommonStyle.textSize13,CommonStyle.fontColor000]}>부동산구분</CustomTextB>
                        </View>
                        <View style={styles.modalDataWrap} >
                            {/*
                            <TouchableOpacity 
                                onPress={()=>this.checkRealEstedGubun('A')} 
                                style={this.state.setupRealEstedGubun.includes('A') ? styles.modalDataEachWrapOn : styles.modalDataEachWrapOff}
                            >
                                <CustomTextB style={[CommonStyle.textSize11,this.state.setupRealEstedGubun.includes('A') ? CommonStyle.fontColorBase: CommonStyle.fontColor555]}>급매매</CustomTextB>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>this.checkRealEstedGubun('B')} style={this.state.setupRealEstedGubun.includes('B') ? styles.modalDataEachWrapOn : styles.modalDataEachWrapOff}>
                                <CustomTextB style={[CommonStyle.textSize11,this.state.setupRealEstedGubun.includes('B') ? CommonStyle.fontColorBase: CommonStyle.fontColor555]}>급전세</CustomTextB>
                            </TouchableOpacity>
                            */}
                            <TouchableOpacity onPress={()=>this.checkRealEstedGubun('C')} style={this.state.setupRealEstedGubun.includes('C') ? styles.modalDataEachWrapOn : styles.modalDataEachWrapOff}>
                                <CustomTextB style={[CommonStyle.textSize11,this.state.setupRealEstedGubun.includes('C') ? CommonStyle.fontColorBase: CommonStyle.fontColor555]}>매매</CustomTextB>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>this.checkRealEstedGubun('D')} style={this.state.setupRealEstedGubun.includes('D') ? styles.modalDataEachWrapOn : styles.modalDataEachWrapOff}>
                                <CustomTextB style={[CommonStyle.textSize11,this.state.setupRealEstedGubun.includes('D') ? CommonStyle.fontColorBase: CommonStyle.fontColor555]}>전세</CustomTextB>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalDataTitleWrap} >
                            <CustomTextB style={[CommonStyle.textSize13,CommonStyle.fontColor000]}>시세대비 저렴한 비율(10~50%)</CustomTextB>
                        </View>
                        <View style={styles.modalDataWrap} >
                            <SliderScreen 
                                screenState={{setRateData : this.setRateData.bind(this),mapCondition:this.state}} 
                                screenProps={this.props}
                            />
                        </View>
                        <View style={styles.modalDataTitleWrap} >
                            <CustomTextB style={[CommonStyle.textSize13,CommonStyle.fontColor000]}>가격대(1억~100억)</CustomTextB>
                        </View>
                        <View style={styles.modalDataWrap} >
                            <SliderScreen2 
                                screenState={{setPriceData : this.setPriceData.bind(this),mapCondition:this.state}} 
                                screenProps={this.props}
                            />
                        </View>
                        <TouchableOpacity onPress={()=>this.moveNavigation('setyear')}  style={styles.modalTitleLinkWrap} >
                            <View style={styles.modalTitleLinkLeft}>
                                { ( this.state.setupRealEstedGubun === 'C' || this.state.setupRealEstedGubun === 'D' )  ?
                                <CustomTextB style={[CommonStyle.textSize13,CommonStyle.fontColor000]}>연식</CustomTextB>
                                :
                                <CustomTextB style={[CommonStyle.textSize13,CommonStyle.fontColorccc]}>연식</CustomTextB>
                                }
                                <View style={{flexDirection:'row',paddingLeft:20}}>
                                    {!CommonUtil.isEmpty(this.props.mapSubCondition.year) &&
                                    <CustomTextR style={[CommonStyle.textSize13,CommonStyle.fontColor555]}>
                                        {this.props.mapSubCondition.year.sYear} ~ {this.props.mapSubCondition.year.eYear}
                                    </CustomTextR>
                                    }
                                </View>
                            </View>
                            <View style={styles.modalTitleLinkRight}>
                                <Image source={BUTTON_RIGHT_GRAY} style={CommonStyle.defaultIconImage30} />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>this.moveNavigation('setheibo')}  style={styles.modalTitleLinkWrap} >
                            <View style={styles.modalTitleLinkLeft}>
                                { ( this.state.setupRealEstedGubun === 'C' || this.state.setupRealEstedGubun === 'D' )  ?
                                <CustomTextB style={[CommonStyle.textSize13,CommonStyle.fontColor000]}>평형</CustomTextB>
                                :
                                <CustomTextB style={[CommonStyle.textSize13,CommonStyle.fontColorccc]}>평형</CustomTextB>
                                }
                                <View style={{flexDirection:'row',paddingLeft:20}}>
                                    {!CommonUtil.isEmpty(this.props.mapSubCondition.heibo) &&
                                    <CustomTextR style={[CommonStyle.textSize13,CommonStyle.fontColor555]}>
                                        {this.props.mapSubCondition.heibo.sHeibo}평 ~ {this.props.mapSubCondition.heibo.eHeibo}평
                                    </CustomTextR>
                                    }
                                </View>
                            </View>
                            <View style={styles.modalTitleLinkRight}>
                                <Image source={BUTTON_RIGHT_GRAY} style={CommonStyle.defaultIconImage30} />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>this.moveNavigation('sethousehold')}  style={styles.modalTitleLinkWrap} >
                            <View style={styles.modalTitleLinkLeft}>
                                { ( this.state.setupRealEstedGubun === 'C' || this.state.setupRealEstedGubun === 'D' )  ?
                                <CustomTextB style={[CommonStyle.textSize13,CommonStyle.fontColor000]}>세대수</CustomTextB>
                                :
                                <CustomTextB style={[CommonStyle.textSize13,CommonStyle.fontColorccc]}>세대수</CustomTextB>
                                }
                                <View style={{flexDirection:'row',paddingLeft:20}}>
                                    {!CommonUtil.isEmpty(this.props.mapSubCondition.household) &&
                                    <CustomTextR style={[CommonStyle.textSize13,CommonStyle.fontColor555]}>
                                        {this.props.mapSubCondition.household.shousehold}세대 ~ {this.props.mapSubCondition.household.ehousehold}세대
                                    </CustomTextR>
                                    }
                                </View>
                            </View>
                            <View style={styles.modalTitleLinkRight}>
                                <Image source={BUTTON_RIGHT_GRAY} style={CommonStyle.defaultIconImage30} />
                            </View>
                        </TouchableOpacity>
                        { ( this.state.setupRealEstedGubun === 'C' || this.state.setupRealEstedGubun === 'D' )  &&
                        <>
                        <View style={styles.modalDataTitleWrap} >
                            <CustomTextB style={[CommonStyle.textSize13,CommonStyle.fontColor000]}>옵션</CustomTextB>
                        </View>                        
                        <View style={styles.modalDataWrap2} >
                            <TouchableOpacity onPress={()=>this.checkRealEstedOption(this.state.setupRealEstedOption)} style={[this.state.setupRealEstedOption ? styles.modalDataEachWrapOn : styles.modalDataEachWrapOff,{width:100}]}>
                                <CustomTextB style={[CommonStyle.textSize11,this.state.setupRealEstedOption ? CommonStyle.fontColorBase: CommonStyle.fontColor555]}>1층 제외</CustomTextB>
                            </TouchableOpacity>                                
                        </View>
                        </>
                        }

                    </View>
                    </ScrollView>
                    <TouchableOpacity style={styles.middleDataWarp2}>
                        <TouchableOpacity 
                            onPress={()=>this.setupSearchCondition()}
                            style={styles.buttonWrapOn }
                        >
                            <CustomTextM style={[CommonStyle.textSize17,CommonStyle.fontColorWhite]}>설정완료</CustomTextM>
                        </TouchableOpacity>
                    </TouchableOpacity> 
                    {this.state.popLayerView && (
                        <View style={{zIndex:99999,borderRadius:30}}>
                            <Overlay
                                isVisible={this.state.popLayerView}
                                //onBackdropPress={this.closepopLayer}
                                windowBackgroundColor="rgba(0, 0, 0, 0.8)"
                                overlayBackgroundColor="tranparent"                                
                                containerStyle={{margin:0,padding:0,borderRadius:30,overflow:'hidden'}}
                            >
                                <RequestAlarmServeice screenState={this.state} screenProps={this.props} />
                            </Overlay>
                        </View>
                    )}
                     { this.state.moreLoading &&
                        <View style={CommonStyle.moreWrap}>
                            <ActivityIndicator size="small" color={DEFAULT_COLOR.base_color} style={{paddingTop:100}} />
                        </View>
                    }
                </View>
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
    /* slider */
    sliderRoot :{    
        alignItems: 'stretch',padding: 5,flex: 1,
    },
    slider : {},
    fixedHeaderWrap : {
        position:'absolute',top:0,left:0,width:SCREEN_WIDTH,
        height:DEFAULT_CONSTANTS.BottomHeight+30,
        //borderBottomColor:'#ccc', borderBottomWidth:1,
        paddingTop:DEFAULT_CONSTANTS.BottomHeight-10,
        justifyContent:'flex-end',paddingHorizontal:20,
        backgroundColor:'transparent',zIndex:9999
    },
    horizontalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal:20
    },
    
    valueText: {width: 50,color: '#000',fontSize: 20,},
    /* slider */
    fixedHeader : {
        flex:1,flexDirection:'row'
    },
    fixedHeaderLeft : {
        flex:1,justifyContent:'center'
    },
    fixedHeaderCenter : {
        flex:2,alignItems:'center',justifyContent:'flex-end',paddingBottom:10
    },
    fixedHeaderRight : {
        flex:1,justifyContent:'center',alignItems:'flex-end'
    },
    showButtonWrap : {
        position:'absolute',left:10,bottom:10, height:180, width:80,backgroundColor:'transparent',zIndex:9999
    },
    showButton : {
        flex:1,justifyContent:'center',paddingBottom:10
    },
    markerDefaultWrap : {
        height:50,width:100,aspectRatio:2,alignItems:'center',justifyContent:'center'
    },
    markerBackRedWrap : {
        flex: 1,position: 'relative', height:70,width:100,aspectRatio:2,bottom:-40,
    },
    markerBackRedImageStyle : {
        resizeMode: 'cover',position: 'absolute',top: 0,bottom: '50%',
    },
    markerAgentWrap : {
        height:65,width:65,alignItems:'center',justifyContent:'center'
    },
    fixedTodayLinkWrap : {
        position:'absolute',top:DEFAULT_CONSTANTS.BottomHeight+30,left:0,width:SCREEN_WIDTH,
        height:40,justifyContent:'center',alignItems:'center',backgroundColor:'transparent',zIndex:9999,
        ...Platform.select({
            ios: {
              shadowColor: "#ccc",
              shadowOpacity: 0.5,
              shadowRadius: 2,
              shadowOffset: {
                height: 0,
                width: 0.1
             }
           },
            android: {
              elevation: 5
           }
         })
    },
    fixedTodayLink : {
        width:SCREEN_WIDTH*0.5,justifyContent:'center',alignItems:'center',backgroundColor:'#fff',borderRadius:18,flexDirection:'row',paddingVertical:Platform.OS === 'ios' ? 10 : 5
    },
    map: {
        width: null,
        height: '100%',
        width : '100%',
        flex: 1,        
    },
 

    /**** Modal  *******/
    modalContainer: {   
        zIndex : 10,     
        position :'absolute',
        left:0,
        //top : BASE_HEIGHY,
        width:SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        paddingTop: Platform.OS ==='ios' ? 50 : 10,
        backgroundColor: '#fff'
    },
    modalTitleWrap : {
        paddingHorizontal:10,paddingVertical:5,flexDirection:'row'
    },
    modalLeftWrap : {
        flex:1,justifyContent:'center'
    },
    modalRightWrap : {
        flex:1,justifyContent:'center',alignItems:'flex-end'
    },
    modalDataCoverWrap : {
        flex:1,paddingHorizontal:20,paddingVertical:15,
    },
    modalDataTitleWrap : {
        paddingVertical:15
    },
    modalTitleLinkWrap : {
        marginTop:10,paddingVertical:10,flexDirection:'row',borderBottomColor:'#ccc',borderBottomWidth:1
    },
    modalTitleLinkLeft : {flex:5,flexDirection:'row',alignItems:'center'},
    modalTitleLinkRight : {flex:1,alignItems:'flex-end'},
    modalDataWrap : {
        flex:1,paddingVertical:10,flexDirection:'row',justifyContent:'space-between'
    },
    modalDataWrap2 : {
        flex:1,paddingVertical:10
    },
    modalDataEachWrapOn : {
        flex:1,justifyContent:'center',alignItems:'center',marginHorizontal:5,borderColor:DEFAULT_COLOR.base_color,borderWidth:1,borderRadius:20,paddingVertical:5
    },
    modalDataEachWrapOff : {
        flex:1,justifyContent:'center',alignItems:'center',marginHorizontal:5,borderColor:'#ddd',borderWidth:1,borderRadius:20,paddingVertical:5
    },
    checkboxIcon : {
        width : PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize22),height:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize22)
    },
    menuTitleText : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15)
    },
    bottomWrap : {
        height:60,justifyContent:'center',alignItems:'center',flexDirection:'row'
    },
    bottomDataWrap : {
        width:80,backgroundColor:'#e1e1e1',justifyContent:'center',alignItems:'center',padding:5,marginRight:5
    },
    middleDataWarp2 : {
        height:120,
        justifyContent:'center',
        paddingTop:10,paddingBottom:20,paddingHorizontal:10
    },
    buttonWrapOn : {
        backgroundColor:DEFAULT_COLOR.base_color,paddingVertical:10,marginHorizontal:20,justifyContent:'center',alignItems:'center',borderRadius:25
    },
    /* Pop Layer */
    popLayerWrap : {
        width:SCREEN_WIDTH*0.8,height:SCREEN_HEIGHT*0.5,backgroundColor:'#fff',margin:0,padding:0
    },
    poplayerDataCoverWrap : {
        flex:1,paddingHorizontal:10,justifyContent:'center',alignItems:'center'
    },
    poplayerDataWrap : {
        flex:1,justifyContent:'center',alignItems:'center'
    },
    poplayerDataWrap2 : {
        height:70,justifyContent:'flex-start',paddingHorizontal:30
    },
    poplayerDataWrap3 : {
        flex:1,justifyContent:'center',alignItems:'center',maxHeight:50,paddingHorizontal:30,flexDirection:'row',marginTop:30
    },
    poplayerDataLeftWrap3 : {
        flex:1,alignItems:'flex-end',paddingRight:10
    },
    poplayerDataRightWrap3 : {
        flex:5
    },
    popLayerButtonWarp : {
        flex:1,justifyContent:'center',alignItems:'center',paddingBottom:5
    }
});


function mapStateToProps(state) {
    return {
        userToken : state.GlabalStatus.userToken,
        mapCondition : state.GlabalStatus.mapCondition,
        mapSubCondition : state.GlabalStatus.mapSubCondition,
    };
}

function mapDispatchToProps(dispatch) {
    return {        
        _saveUserToken:(str)=> {
            dispatch(ActionCreator.saveUserToken(str))
        },
        _setupMapCondition:(str)=> {
            dispatch(ActionCreator.setupMapCondition(str))
        }
    };
}


export default connect(mapStateToProps,mapDispatchToProps)(SetupConditionScreen);