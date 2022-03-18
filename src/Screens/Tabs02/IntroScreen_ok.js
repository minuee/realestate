import React, { Component,useCallback, useState } from 'react';
import {StatusBar,SafeAreaView,PermissionsAndroid, Platform, TouchableOpacity, View,StyleSheet,Image,Dimensions,PixelRatio,Text,ToastAndroid,ActivityIndicator,Animated,Alert} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import {connect} from 'react-redux';
import ActionCreator from '../../Ducks/Actions/MainActions';
import Geolocation from 'react-native-geolocation-service';
import SplashScreen from 'react-native-splash-screen';
import MapView,{ Callout, Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import { Overlay,Tooltip } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import FastImage from 'react-native-fast-image';
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
import PopLayerAgent from './PopLayerAgent';
import MapMarker from './MapMarkerOrigin';
import MapAgentMarker from './MapAgentMarker';
const mapRef = React.createRef();
const TOP_LOGO = require('../../../assets/icons/top_logo.png');
const BUTTON_GO_HOME = require('../../../assets/icons/btn_go_myhome.png');
const BUTTON_SHOW_TARGET_OFF = require('../../../assets/icons/btn_target_off.png');
const BUTTON_SHOW_TARGET_ON = require('../../../assets/icons/btn_target_on.png');
const BUTTON_SHOW_AGENT_OFF = require('../../../assets/icons/btn_goodagent_off.png');
const BUTTON_SHOW_AGENT_ON = require('../../../assets/icons/btn_goodagent_on.png')
const BTN_COMDITION = require('../../../assets/icons/icon_condition.png');
const BTN_SEARCH = require('../../../assets/icons/icon_search.png');


const DEFAULT_latitudeDelta = 0.0922*20;//뒤에 숫자가 커질수록 축소 0.0922*30
const DEFAULT_longitudeDelta = (SCREEN_WIDTH/ SCREEN_HEIGHT * DEFAULT_latitudeDelta)
const minZoomLevel = 8;
const maxZoomLevel = 19;
const baseClusterZoomMaker = 5;
const baseSidoZoomMaker = 10;
const baseSigunguZoomMaker = Platform.OS === 'ios' ? 13 : 13;
const baseEupmyeonZoomMaker = Platform.OS === 'ios' ? 15 : 15;
import { apiObject } from "../../Apis/Main";

let repeatNumber = 1;

class IntroScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading : false,
            moreLoading : false,
            searching :false,
            showMaemul : true,
            showAgent : false,
            articleIsFirst : true,
            showModal : false,
            popLayerView : false,
            todayFastDealCount : 0,
            todayFastRentCount : 0,
            baseZoom : 10,            
            fixedLatitude: 37.515342,
            fixedLongitude: 126.9259844,
            latitude: 37.515342,
            longitude: 126.9259844,
            latitudeDelta: DEFAULT_latitudeDelta, 
            longitudeDelta: DEFAULT_longitudeDelta,
            currentLatitude : 37.515342,
            currentLongitude : 126.9259844,
            tracksViewChanges : true,
            mapType : 'standard',
            mapTypeIcon : 'wpexplorer',
            markerNowFocus : 'sido',
            markerAllData : [],
            markerData : [],
            markerDataSido : [],
            markerDataSigungu : [],
            markerDataEupmyeon : [],
            markerDataArticle : [],
            markerDataAgent : [],
            setupRealEstedGubun : [],
            setupRealEstedOption : false,
            apiLatitude : null,
            apiLongitude : null,
            apiLatitude2 : null,
            apiLongitude2 : null,
            mapCondition : {},
            mapSubCondition : {}
        }
    }

    setUpdatePermision = () => {
        setTimeout(() => {this.setState({moreLoading:true})},100)
        setTimeout(() => {this.setState({moreLoading:false})},120)
     
    }
    animatedHeight = new Animated.Value(SCREEN_HEIGHT);
    closePopView = () => {
        this.setState({popLayerView:false})
        this.setUpdatePermision();
    }
    closePopLayer = async( mode = null) => {

        if ( mode ) {
            this.setState({popLayerView:false})
            this.setUpdatePermision();
            this.logoutAction();
        }else{
            //CommonFunction.fn_call_toast('착한중개인 정보는 매물정보와 함께 노출됩니다.',2000)
            const centerLen = this.state.currentLatitude;
            const centerLon = this.state.currentLongitude;
            let markerDataArticle = this.state.markerDataArticle;
            this.setState({popLayerView:false,moreLoading:true,searching:false})
            this.props._toggleMainMapOpenTarget({
                agent:true,maemul:this.props.mainMapViewTarget.maemul
            })
            let returnCode = {code:9998};        
            try {
                returnCode = await apiObject.API_mapsAgentData({
                    locale: "ko", centerLen, centerLon                
                }); 
                if ( returnCode.code === '0000') {
                    this.setState({searching:false,moreLoading:false})
                    let returnArray = [];
                    if ( markerDataArticle.length > 0 && this.props.mainMapViewTarget.maemul ) {
                        returnArray = markerDataArticle.concat(returnCode.data);                        
                    }else{
                        returnArray = returnCode.data;
                    }
                    this.setState({
                        markerDataAgent :  returnCode.data,
                        markerDataArticle : returnArray
                    })
                    this.setUpdatePermision();
                }else{
                    this.setState({searching:false,moreLoading:false})
                    return [];    
                }
            }catch(e){
                this.setState({searching:false,moreLoading:false})
                return [];
            }
        }
    }

    // 조건설정 정보 가져오기
    checkStorageCondition = async () => {
        try {
            const mapCondition = await AsyncStorage.getItem('mapCondition');
            if(mapCondition !== null) {  
                this.props._setupMapCondition(JSON.parse(mapCondition))       
                this.setState({
                    mapCondition : JSON.parse(mapCondition)
                })         
            }
            const mapSubCondition = await AsyncStorage.getItem('mapSubCondition');            
            if(mapSubCondition !== null) {  
                this.props._setupMapSubCondition(JSON.parse(mapSubCondition))     
                this.setState({
                    mapSubCondition : JSON.parse(mapSubCondition)
                })           
            }
        } catch(e) {                        
            
        }
    }

    getInformation = async ( filterData = null,filterSubData = null , isFisrt= false) => {
        if ( this.state.moreLoading === false ) {
            this.setState({moreLoading:true})
            let returnCode = {code:9998};
            let baseZoom = Math.round(Math.log(360 / this.state.longitudeDelta) / Math.LN2);
            let mapCondition = null;
            let mapConditionData = null;
            let nowRealEstedGubun2 = '';
            if ( !CommonUtil.isEmpty(this.props.userToken)) {
                mapCondition = CommonUtil.isEmpty(filterData) ? null : filterData;
                mapConditionData = CommonUtil.isEmpty(mapCondition.condition) ? null : mapCondition.condition ;
                if ( !CommonUtil.isEmpty(mapCondition.condition.realEstedGubun)) {
                    nowRealEstedGubun2 = mapCondition.condition.realEstedGubun;                
                }
            }
            if ( isFisrt && !CommonUtil.isEmpty(this.props.userToken) ) {
                nowRealEstedGubun2 = 'A';
            }
            try {
                returnCode = await apiObject.API_mapsDefaultData({
                    locale: "ko",
                    priceLevel : CommonUtil.isEmpty(mapConditionData) ? null : mapConditionData.priceLevel,
                    realEstedGubun: nowRealEstedGubun2,
                    realEstedOption: CommonUtil.isEmpty(mapConditionData) ? null : mapConditionData.realEstedOption,
                    saleRate: CommonUtil.isEmpty(mapConditionData) ? null : mapConditionData.saleRate,
                    heibo : CommonUtil.isEmpty(filterSubData.heibo) ? null : filterSubData.heibo,
                    household : CommonUtil.isEmpty(filterSubData.household) ? null : filterSubData.household,
                    year : CommonUtil.isEmpty(filterSubData.year) ? null : filterSubData.year
                }); 
                if ( returnCode.code === '0000') {
                    let markerDataSido = [];
                    let markerDataSigungu = [];
                    let todayFastDealCount = this.state.todayFastDealCount;
                    let todayFastRentCount = this.state.todayFastRentCount;
                    if ( returnCode.data.length > 0 ) {
                        markerDataSido = returnCode.data;
                    }
                    if ( returnCode.data.length > 0 ) {
                        markerDataSigungu = returnCode.data2;
                    }               
                    if ( returnCode.todayFast.length > 0 ) {
                        todayFastDealCount = returnCode.todayFast[0].full_count;
                    }
                
                    if ( returnCode.todayFastRent.length > 0 ) {
                        todayFastRentCount = returnCode.todayFastRent[0].full_count;
                    }               
                    
                    this.setState({
                        loading:false,
                        moreLoading:false,
                        markerDataSido :markerDataSido,
                        markerDataSigungu :markerDataSigungu,                    
                        todayFastDealCount,
                        todayFastRentCount
                    })
                }
            }catch(e){
                console.log('returnCode error2',e);
                this.setState({loading:false})
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        const vitalStateChange = nextState.loading !== this.state.loading;
        const vitalStateChange2 = nextState.moreLoading !== this.state.moreLoading;
        return vitalStateChange || vitalStateChange2;
    }

    API_getUrban = async(centerLen, centerLon) => {
        if ( this.state.moreLoading === false ) {
            let returnCode = {code:9998};        
            const mapCondition = this.props.mapCondition;
            const filterSubData = this.props.mapSubCondition;
            const mapConditionData = CommonUtil.isEmpty(mapCondition.condition) ? null : mapCondition.condition ;
            const member_pk =  CommonUtil.isEmpty(this.props.userToken) ? null : this.props.userToken.member_pk;
            
            try {
                returnCode = await apiObject.API_mapsUrbanData({
                    locale: "ko", centerLen, centerLon,
                    priceLevel : CommonUtil.isEmpty(mapConditionData) ? null : mapConditionData.priceLevel,
                    realEstedGubun: CommonUtil.isEmpty(mapConditionData) ? null : mapConditionData.realEstedGubun,
                    realEstedOption: CommonUtil.isEmpty(mapConditionData) ? null : mapConditionData.realEstedOption,
                    saleRate: CommonUtil.isEmpty(mapConditionData) ? null : mapConditionData.saleRate,
                    heibo : CommonUtil.isEmpty(filterSubData.heibo) ? null : filterSubData.heibo,
                    household : CommonUtil.isEmpty(filterSubData.household) ? null : filterSubData.household,
                    year : CommonUtil.isEmpty(filterSubData.year) ? null : filterSubData.year
                }); 
                if ( returnCode.code === '0000') {
                    if ( !CommonUtil.isEmpty(returnCode.todayFast)) {
                        this.setState({
                            todayFastDealCount : returnCode.todayFast
                        })
                    }
                    if ( !CommonUtil.isEmpty(returnCode.todayFastRent)) {
                        this.setState({
                            todayFastRentCount : returnCode.todayFastRent
                        })
                    }
                    return returnCode.data;
                }else{
                    this.setState({searching:false,moreLoading:false})
                    return [];    
                }
                
            }catch(e){
                this.setState({searching:false,moreLoading:false})
                return [];
            }
        }
    }

    API_getArticles = async(centerLen, centerLon) => {
        if ( this.state.moreLoading === false) {
            let returnCode = {code:9998};        
            const mapCondition = this.props.mapCondition;
            const isViewAgent = this.props.mainMapViewTarget.agent;
            const markerDataAgent = this.state.markerDataAgent;
            const filterSubData = this.props.mapSubCondition;
            const mapConditionData = CommonUtil.isEmpty(mapCondition.condition) ? null : mapCondition.condition ;
            const member_pk =  CommonUtil.isEmpty(this.props.userToken) ? null : this.props.userToken.member_pk;
            try {
                returnCode = await apiObject.API_mapsArticleData({
                    locale: "ko", centerLen, centerLon,member_pk,
                    priceLevel : CommonUtil.isEmpty(mapConditionData) ? null : mapConditionData.priceLevel,
                    realEstedGubun: CommonUtil.isEmpty(mapConditionData) ? null : mapConditionData.realEstedGubun,
                    realEstedOption: CommonUtil.isEmpty(mapConditionData) ? null : mapConditionData.realEstedOption,
                    saleRate: CommonUtil.isEmpty(mapConditionData) ? null : mapConditionData.saleRate,
                    heibo : CommonUtil.isEmpty(filterSubData.heibo) ? null : filterSubData.heibo,
                    household : CommonUtil.isEmpty(filterSubData.household) ? null : filterSubData.household,
                    year : CommonUtil.isEmpty(filterSubData.year) ? null : filterSubData.year
                }); 
                //console.log('returnCode',returnCode.data.length);
                if ( returnCode.code === '0000') {
                    if ( !CommonUtil.isEmpty(returnCode.todayFast)) {
                        this.setState({
                            todayFastDealCount : returnCode.todayFast
                        })
                    }
                    if ( !CommonUtil.isEmpty(returnCode.todayFastRent)) {
                        this.setState({
                            todayFastRentCount : returnCode.todayFastRent
                        })
                    }
                    this.setState({searching:false,moreLoading:false})
                    let returnArray = []; 
                    if ( isViewAgent ) {
                        returnArray = markerDataAgent.concat(returnCode.data);                    
                    }else{
                        returnArray = returnCode.data;                    
                    }               
                    return returnArray;
                }else{
                    this.setState({searching:false,moreLoading:false})
                    return [];    
                }
                
            }catch(e){
                this.setState({searching:false,moreLoading:false})
                console.log('returnCode error1',e);
                return [];
            }
        }
    }

    async UNSAFE_componentWillMount() {
        
        SplashScreen.hide();    
        await this.checkStorageCondition();
        await FastImage.preload([
            {uri: DEFAULT_CONSTANTS.imageBaseUrl + 'icon/marker_apart.png'},
            {uri: DEFAULT_CONSTANTS.imageBaseUrl + 'icon/marker_back_red2.png'},
            {uri: DEFAULT_CONSTANTS.imageBaseUrl + 'icon/marker_back_blue2.png'},
            {uri: DEFAULT_CONSTANTS.imageBaseUrl + 'icon/marker_back_blue2.png'},
            {uri: DEFAULT_CONSTANTS.imageBaseUrl + 'icon/marker_agent.png'},
        ])
        await this.getLocation();        
        await this.getInformation(this.props.mapCondition,this.props.mapSubCondition,true);        
        this.props.navigation.addListener('focus', () => {            
            this.setState({mapCondition : this.props.mapCondition})
            this.setState({mapSubCondition : this.props.mapSubCondition})
            const nextMapCondition = this.props.mapCondition;
            const nowMapCondition = this.state.mapCondition; 
            const nowMapSubCondition = this.props.mapSubCondition; 
            if ( nextMapCondition.stime > nowMapCondition.stime) {
                
                this.setState({moreLoading:true})
                if ( this.state.markerNowFocus === 'article' ) {
                    this.reloadArticle();
                }else if ( this.state.markerNowFocus === 'eupmyeon'  ) {
                    this.reloadUrbanData();
                }else{
                    this.getInformation(nextMapCondition,nowMapSubCondition);;
                }
            }
        })
        this.props.navigation.addListener('blur', () => {            
            ////console.log('blur')            
        })
    }

    reloadArticle = async() => {
        const copyyfilterData = await this.API_getArticles(this.state.apiLatitude,this.state.apiLongitude);
        this.setState({
            markerDataArticle : copyyfilterData,
        })
        this.setUpdatePermision()
    }

    reloadUrbanData = async() => {
        const copyyfilterData =  await this.API_getUrban(this.state.apiLatitude2,this.state.apiLongitude2);
        this.setState({
            markerDataEupmyeon : copyyfilterData,
        })
        this.setUpdatePermision()
    }

    componentDidMount() {       
        
    }
        
    componentWillUnmount(){        
        this.removeLocationUpdates();
    }
    stopRendering = () =>
    {
        this.setState({ tracksViewChanges: false });
    }
    removeLocationUpdates = () => {
        if (this.watchId !== null) {
            this.stopForegroundService();
            Geolocation.clearWatch(this.watchId);
            this.watchId = null;
            this.setState({ updatesEnabled: false });
        }
    };

    startForegroundService = async () => {
        if (Platform.Version >= 26) {
            await VIForegroundService.createNotificationChannel({
                id: 'locationChannel',
                name: 'Location Tracking Channel',
                description: 'Tracks location of user',
                enableVibration: false,
            });
        }

        return VIForegroundService.startService({
            channelId: 'locationChannel',
            id: 420,
            title: appConfig.displayName,
            text: 'Tracking location updates',
            icon: 'ic_launcher',
        });
    };
    
    stopForegroundService = () => {
        if (this.state.foregroundService) {
            VIForegroundService.stopService().catch((err) => err);
        }
    };
    getLocation = async () => {
        const hasLocationPermission = await this.hasLocationPermission();
        console.log('hasLocationPermission',hasLocationPermission);
        if (hasLocationPermission) {
            try{
                console.log('getLocation');
                Geolocation.getCurrentPosition(
                    (position) => {
                        console.log('getLocation',position);
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
                        console.log(error);
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
            }catch(e) {

            }

        }else{
            return true;
        }
    };
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
          CommonFunction.fn_call_toast('현재위치 조회권한을 거절하여 기본위치중심으로 노출됩니다.',2000) ;
        }
    
        if (status === 'disabled') {
            CommonFunction.fn_call_toast('위치권한을 거절하여 기본위치로 노출됩니다.',2000) ;
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
            CommonFunction.fn_call_toast('위치권한을 거절하여 기본위치로 노출됩니다.',2000) ;
        } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            CommonFunction.fn_call_toast('위치권한을 거절하여 기본위치로 노출됩니다.',2000) ;    
        }
        return false;
    };

    clickCallout = (item) => {
        this.setState({
            latitude : item.coordinate.latitude,
            longitude : item.coordinate.longitude
        })   
    }

    logoutAction = async() => {
        await this.setState({loading:false,moreLoading:false})
        this.props.navigation.navigate('LoginPopStack');
    }
    joinAction = () => {
        this.props._saveNonUserToken({});
        this.props._saveUserToken({});
        setTimeout(() => {
            this.props.navigation.popToTop();
        }, 500);
    }
    moveNavigation = async(gubun) => {        
        await this.setState({loading:false,moreLoading:false})
        if ( gubun === 'search') {
            this.props.navigation.navigate('SearchFormStack');
        }else if ( gubun === 'search2') {
            this.props.navigation.navigate('SearchFormStack2');
        }else{
            if ( CommonUtil.isEmpty(this.props.userToken)) {
                Alert.alert(
                    DEFAULT_CONSTANTS.appName,      
                    "로그인이 필요합니다. 로그인/회원가입하시겠습니까?",
                    [
                        {text: '로그인', onPress: () => this.logoutAction()},
                        {text: '회원가입', onPress: () => this.joinAction()},
                        {text: '취소', onPress: () => console.log('Cancle')}
                    ],
                    { cancelable: true }
                ) 
            }else{
                if ( gubun === 'today') {                    
                    this.props.navigation.navigate('TodayFastDealStack')
                }else if ( gubun === 'today2') {                    
                    this.props.navigation.navigate('TodayFastRentStack')
                }else if ( gubun === 'search') {
                    
                }else if ( gubun === 'setup') {
                    this.props.navigation.navigate('SetupCondtionStack')
                }else if ( gubun === 'naver') {
                    this.props.navigation.navigate('NaverMapStack')
                }else{
                }
            }
        }
    }

    setupSearchCondition =  async() => {
        this.setState({
            showModal:false
        })
    }

    moveDetail = async(item) => {        
        await this.setState({loading:false,moreLoading:false})
        if ( item.gubun === 'article' && item.sub_gubun === 'agent' ) {
            this.props.navigation.navigate('AgentDetailStack',{
                screenData:item
            })
        }else if ( item.gubun === 'article' && item.sub_gubun === '') {
            this.props.navigation.navigate('ApartDetailStack',{
                screenData:item
            })        
        }else  if ( item.gubun === 'agent' ) {
            this.props.navigation.navigate('AgentListStack',{
                screenData:item
            })
        }else{
        } 
    }

    moveAgentList = async() => {        
        this.setState({popLayerView:false})
        this.setUpdatePermision();
        await this.setState({loading:false,moreLoading:false})
        this.props.navigation.navigate('AgentListStack');
    }

    onRegionChange = (region) => {        
        this.setState({
            currentLatitude : region.latitude,
            currentLongitude : region.longitude
        })
    }
    stopTrackingViewChanges = () => {        
        this.setState(() => ({tracksViewChanges: false,}));
    }
    onRegionChangeComplete = async(region) => {       
        console.log('onRegionChangeComplete',region) 
        const showMaemul = this.props.mainMapViewTarget.maemul;
        const searching = this.state.searching;
        const prevZoomLevel = this.state.baseZoom;
        let baseZoom = Math.round(Math.log(360 / region.longitudeDelta) / Math.LN2);
        let copyyfilterData = [];
        this.setState({
            latitudeDelta : region.latitudeDelta,
            longitudeDelta : region.longitudeDelta,
        })
        if ( showMaemul ) {
            if ( baseZoom > baseEupmyeonZoomMaker ) { //15     
                const centerLat = region.latitude;
                const centerLon = region.longitude;
                if ( this.state.markerNowFocus !== 'article') {                     
                    copyyfilterData = this.state.markerDataArticle;
                    if ( this.state.apiLatitude === null ) {                        
                        await this.setState({
                            apiLatitude : region.latitude,
                            apiLongitude: region.longitude,
                            currentLatitude : region.latitude,
                            currentLongitude : region.longitude,
                            searching:true
                        })
                        copyyfilterData = await this.API_getArticles(centerLat,centerLon);   
                        await this.setState({
                            markerNowFocus : 'article',
                            baseZoom : baseZoom,
                            markerDataArticle : copyyfilterData,
                            moreLoading:false
                        })
                        this.setUpdatePermision();
                    }else{                        
                        const twoPointDistance = await CommonFunction.getDistanceBetweenPoints( this.state.apiLatitude,this.state.apiLongitude,region.latitude,region.longitude);
                        //console.log('article twoPointDistance',twoPointDistance)
                        if ( twoPointDistance > 8000 && !searching) {                        
                            await this.setState({searching:true})
                            copyyfilterData = await this.API_getArticles(centerLat,centerLon);
                            await this.setState({
                                markerNowFocus : 'article',
                                baseZoom : baseZoom,
                                apiLatitude : region.latitude,
                                apiLongitude: region.longitude,
                                currentLatitude : region.latitude,
                                currentLongitude : region.longitude,
                                markerDataArticle : copyyfilterData
                            })
                            this.setUpdatePermision();
                        }else{
                            await this.setState({ markerNowFocus : 'article'})
                            this.setUpdatePermision();
                        }
                        
                    }    
                }else{
                    const twoPointDistance = await CommonFunction.getDistanceBetweenPoints( this.state.apiLatitude,this.state.apiLongitude,region.latitude,region.longitude);
                    //console.log('twoPointDistance',twoPointDistance)
                    if ( twoPointDistance > 8000 && !searching) {
                        await this.setState({searching:true});
                        copyyfilterData = await this.API_getArticles(centerLat,centerLon);
                        await this.setState({                        
                            baseZoom : baseZoom,
                            apiLatitude : region.latitude,
                            apiLongitude: region.longitude,
                            currentLatitude : region.latitude,
                            currentLongitude : region.longitude,
                            markerDataArticle : copyyfilterData
                        })
                        this.setUpdatePermision();
                    }
                        
                }          
            }else if ( baseZoom <= baseEupmyeonZoomMaker && baseZoom > baseSigunguZoomMaker) {  // 14 , 13
                const centerLat2 = region.latitude;
                const centerLon2 = region.longitude;                
                if ( this.state.markerNowFocus !== 'eupmyeon') {
                    
                    if ( this.state.apiLatitude2 === null ) {
                        await this.setState({
                            currentLatitude : region.latitude,
                            currentLongitude : region.longitude,
                            apiLatitude2 : region.latitude,
                            apiLongitude2: region.longitude,
                            searching:true
                        })
                        copyyfilterData = await this.API_getUrban(centerLat2,centerLon2);                        
                        await this.setState({
                            markerNowFocus : 'eupmyeon',
                            baseZoom : baseZoom,
                            markerDataEupmyeon : copyyfilterData,
                            searching:false
                        })
                        this.setUpdatePermision();
                    }else{
                        const twoPointDistance = await CommonFunction.getDistanceBetweenPoints( this.state.apiLatitude2,this.state.apiLongitude2,region.latitude,region.longitude);                        
                        if ( twoPointDistance > 30000 && !searching) {                        
                            await this.setState({searching:true});
                            copyyfilterData = await this.API_getUrban(centerLat2,centerLon2);
                            await this.setState({
                                markerNowFocus : 'eupmyeon',
                                baseZoom : baseZoom,
                                currentLatitude : region.latitude,
                                currentLongitude : region.longitude,
                                apiLatitude2 : region.latitude,
                                apiLongitude2 : region.longitude,
                                markerDataEupmyeon : copyyfilterData,
                                searching:false
                            })
                            this.setUpdatePermision();
                        }else{
                            this.setState({
                                markerNowFocus : 'eupmyeon'
                            }) 
                        }
                        
                    }
                }else{
                    const twoPointDistance = await CommonFunction.getDistanceBetweenPoints( this.state.apiLatitude2,this.state.apiLongitude2,region.latitude,region.longitude);                    
                    if ( twoPointDistance > 30000 && !searching) {
                        await this.setState({searching:true});
                        copyyfilterData = await this.API_getUrban(centerLat2,centerLon2);
                        await this.setState({
                            markerNowFocus : 'eupmyeon',
                            baseZoom : baseZoom,
                            currentLatitude : region.latitude,
                            currentLongitude : region.longitude,
                            apiLatitude2 : region.latitude,
                            apiLongitude2 : region.longitude,
                            markerDataEupmyeon : copyyfilterData,
                            searching:false
                        })
                        this.setUpdatePermision();
                    }else {
                        if( prevZoomLevel > baseZoom  && baseZoom === 14) {
                            await this.setState({markerNowFocus : 'eupmyeon',baseZoom : baseZoom,})
                            this.setUpdatePermision();
                        }else if( prevZoomLevel < baseZoom  && baseZoom === 14){
                            await this.setState({markerNowFocus : 'eupmyeon',baseZoom : baseZoom,})
                            this.setUpdatePermision();
                        }else{
                            //console.log('nothingnothingnothingnothing')
                        }
                    }
                }
            }else {
                //if ( prevZoomLevel != baseZoom  ) {
                    if ( baseZoom <= baseSigunguZoomMaker && baseZoom > baseSidoZoomMaker) { //12 11
                        if ( this.state.markerNowFocus !== 'sigungu') {                            
                            await this.setState({
                                markerNowFocus : 'sigungu',
                                apiLatitude : null, apiLongitude: null,
                                baseZoom : baseZoom,
                            })
                            this.setUpdatePermision();
                        }else{
                            this.setState({markerNowFocus : 'sigungu',})
                        }
                    }else if ( baseZoom <= baseSidoZoomMaker) {   //10
                        
                        if ( this.state.markerNowFocus !== 'sido') {
                            //console.log('666666666')
                            await this.setState({
                                markerNowFocus : 'sido',
                                apiLatitude : null, apiLongitude: null,
                                baseZoom : baseZoom,
                            })
                            this.setUpdatePermision();
                        }else {
                            this.setState({markerNowFocus : 'sido',})
                        }
                    }
                //}
            }
        }else{
            if ( baseZoom > baseEupmyeonZoomMaker ) { //15   
                if ( this.state.markerNowFocus !== 'article') {    
                    await this.setState({
                        markerNowFocus : 'article',
                        apiLatitude : null, apiLongitude: null,
                        baseZoom : baseZoom,
                    })
                    this.setUpdatePermision();
                }
            }else if ( baseZoom <= baseEupmyeonZoomMaker && baseZoom > baseSigunguZoomMaker) {  // 14 , 13
                if ( this.state.markerNowFocus !== 'eupmyeon') {    
                    await this.setState({
                        markerNowFocus : 'eupmyeon',
                        baseZoom : baseZoom,
                        apiLatitude2:null,apiLongitude2:null,
                        searching:false
                    })
                    this.setUpdatePermision();
                }
            }else {
                if ( baseZoom <= baseSigunguZoomMaker && baseZoom > baseSidoZoomMaker) { //12 11
                    if ( this.state.markerNowFocus !== 'sigungu') {    
                        await this.setState({
                            markerNowFocus : 'sigungu',
                            apiLatitude : null, apiLongitude: null,
                            baseZoom : baseZoom,
                        })
                        this.setUpdatePermision();
                    }
                }else{
                    if ( this.state.markerNowFocus !== 'sido') {   
                        await this.setState({
                            markerNowFocus : 'sido',
                            apiLatitude : null, apiLongitude: null,
                            baseZoom : baseZoom,
                        })
                        this.setUpdatePermision();
                    }
                }
            }
           
        }
    }

    toggleData = async( mode, bool) => {
        if ( mode === 'M') {            
            this.props._toggleMainMapOpenTarget({
                maemul:!bool,agent:this.props.mainMapViewTarget.agent
            }) 
            if ( bool) {
                this.onRegionChangeComplete(
                {
                    latitude: this.state.currentLatitude,
                    latitudeDelta: this.state.latitudeDelta,
                    longitude: this.state.currentLongitude,
                    longitudeDelta : this.state.longitudeDelta
                })
            }
            this.setUpdatePermision();
        }else{            
            if ( bool === false  ) {                
                this.setState({popLayerView:true})                    
            }else{
                this.props._toggleMainMapOpenTarget({
                    agent:!bool,maemul:this.props.mainMapViewTarget.maemul
                })
            }
            this.setUpdatePermision();
        }
    }

    _updateGeodata = async () => {             
        const locationlatitude = this.state.fixedLatitude;
        const locationlongitude = this.state.fixedLongitude;
        const latitudeDelta = this.state.latitudeDelta;
        const longitudeDelta = this.state.longitudeDelta;     
   
        this.timeout = setTimeout(
            () => {
                mapRef.current.animateToRegion({
                    latitude : locationlatitude,
                    longitude : locationlongitude,
                    latitudeDelta: latitudeDelta,
                    longitudeDelta: longitudeDelta,
                }) 
            },500
        ); 
        
    }

    renderTooltip = () => {

        return (<View style={{width:'100%',padding:5,alignItems:'flex-end'}}>
            <Image source={require('../../../assets/icons/map_info.png')} resizeMode={"contain"}style={{width:140,height:95}} />
            <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor000]}>회원이시면 급매정보를 확인하실 수 있습니다. </CustomTextR>
            {/*
            <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor555]}>도시정보 : 매매평균가 / 전일기준 등락율</CustomTextR>
            <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor555]}>매매정보 : 매매평균 / 전세평균</CustomTextR>
            <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor555]}>급매정보 : 대표정보 1건 노출 </CustomTextR>
            */}
        </View>)
    }

    renderTopFast = () => {
        let nowRealEstedGubun = '';
        if ( !CommonUtil.isEmpty(this.props.userToken)) {
            if ( !CommonUtil.isEmpty(this.props.mapCondition.condition.realEstedGubun)) {
                nowRealEstedGubun = this.props.mapCondition.condition.realEstedGubun;
            }
            ///급매매 : A ,  급전세 : B, 매매 : C,  전세 : D
        }   
        if ( nowRealEstedGubun === 'B' ) {
            return (
                <TouchableOpacity onPress={()=>this.moveNavigation('today2')}
                style={styles.fixedTodayLink}>
                    <CustomTextL style={[CommonStyle.textSize12,CommonStyle.fontColor222]}>
                        오늘의 급전세 <CustomTextB style={[CommonStyle.textSize17,CommonStyle.fontColorRed]}>
                            {CommonFunction.currencyFormat(this.state.todayFastRentCount)}
                        </CustomTextB>
                        건{"    "}
                    </CustomTextL>
                    <Image source={require('../../../assets/icons/arrow_right.png')} resizeMode={"contain"}
                        style={{width:CommonUtil.dpToSize(12),height:CommonUtil.dpToSize(12)}} />
                </TouchableOpacity>
            )
        }else if ( nowRealEstedGubun === 'A' ) {
            return (
                <TouchableOpacity onPress={()=>this.moveNavigation('today')}
                style={styles.fixedTodayLink}>
                    <CustomTextL style={[CommonStyle.textSize12,CommonStyle.fontColor222]}>
                        오늘의 급매물 <CustomTextB style={[CommonStyle.textSize17,CommonStyle.fontColorRed]}>
                            {CommonFunction.currencyFormat(this.state.todayFastDealCount)}
                        </CustomTextB>
                        건{"    "}
                    </CustomTextL>
                    <Image source={require('../../../assets/icons/arrow_right.png')} resizeMode={"contain"}
                        style={{width:CommonUtil.dpToSize(12),height:CommonUtil.dpToSize(12)}} />
                </TouchableOpacity>
            )
        }else{

        }
        
    }

    renderTopSearch = () => {
        let nowRealEstedGubun = '';
        //console.log('nowRealEstedGubun',nowRealEstedGubun)
        if ( !CommonUtil.isEmpty(this.props.userToken)) {
            if ( !CommonUtil.isEmpty(this.props.mapCondition.condition.realEstedGubun)) {
                nowRealEstedGubun = this.props.mapCondition.condition.realEstedGubun;
            }
            ///급매매 : A ,  급전세 : B, 매매 : C,  전세 : D
        }   
        if ( nowRealEstedGubun === 'A' || nowRealEstedGubun === 'C') {
            return (
                <TouchableOpacity onPress={()=>this.moveNavigation('search')} style={styles.fixedHeaderRight}>
                    <Image source={BTN_SEARCH} style={{width:CommonUtil.dpToSize(35),height:CommonUtil.dpToSize(35)}} />
                </TouchableOpacity>
            )
        }else if ( nowRealEstedGubun === 'B' || nowRealEstedGubun === 'D') {
            return (
                <TouchableOpacity onPress={()=>this.moveNavigation('search2')} style={styles.fixedHeaderRight}>
                    <Image source={BTN_SEARCH} style={{width:CommonUtil.dpToSize(35),height:CommonUtil.dpToSize(35)}} />
                </TouchableOpacity>
            )
            
        }else{
            return (
                <View style={styles.fixedHeaderRight} />
            )
        }
        
    }
    
    render() {
        if ( this.state.loading ) {
            return (
                <SafeAreaView style={ styles.container }>                    
                    <ActivityIndicator size="large" color={DEFAULT_COLOR.base_color} style={{paddingTop:100}} />
                </SafeAreaView> 
            )
        }else {
            //console.log('this.state.showMaemul22222',repeatNumber);
            repeatNumber++;
            let markerData = this.state.markerDataSido;   
            ////console.log('markerData.length222 ',markerData.length )
            ////console.log('this.state.showMaemul ',this.state.showMaemul)
            if ( this.props.mainMapViewTarget.maemul ) {  
                if ( this.state.markerNowFocus === 'sigungu') {
                    markerData = this.state.markerDataSigungu;
                }else if ( this.state.markerNowFocus === 'eupmyeon') {
                    markerData = this.state.markerDataEupmyeon;
                }else if ( this.state.markerNowFocus === 'article') {
                    markerData = this.state.markerDataArticle;
                }
            }else if ( this.props.mainMapViewTarget.agent && this.state.markerNowFocus === 'article' ) {
                markerData = this.state.markerDataAgent;
            }else{
                //console.log('markerData. ',markerData.length)
                markerData = [];
            }
            
            ////console.log('this.state.markerNowFocus.length ',this.state.markerNowFocus ) 
            ////console.log('markerData.length ',this.state.markerData.length )
            return(
                <View style={ styles.container }>                    
                    { Platform.OS == 'android' &&  <StatusBar translucent backgroundColor="transparent" />}
                    <View style={styles.fixedHeaderWrap}>
                        <View style={styles.fixedHeader}>
                            <TouchableOpacity 
                                hitSlop={{left:10,right:10,top:10,bottom:10}} 
                                //onPress={()=>this.setState({showModal:true})} 
                                onPress={()=>this.moveNavigation('setup')} 
                                style={styles.fixedHeaderLeft}
                                >
                                <Image source={BTN_COMDITION} style={{width:CommonUtil.dpToSize(35),height:CommonUtil.dpToSize(35)}} />
                            </TouchableOpacity>
                            <View style={styles.fixedHeaderCenter}>
                                <Image source={TOP_LOGO} resizeMode={"contain"}
                                style={{width:CommonUtil.dpToSize(105),height:CommonUtil.dpToSize(21)}} />
                            </View>
                            {this.renderTopSearch()}
                            
                        </View>
                    </View>
                    <View style={styles.fixedTodayLinkWrap}>
                        {this.renderTopFast()}
                    </View>
                    <View style={{flex:1}}> 
                        <MapView
                            ref={mapRef}                
                            style={styles.map} 
                            showsUserLocation={true}
                            enableZoomControl={this.state.searching ? false : true}
                            showsMyLocationButton={false}
                            pitchEnabled={false} rotateEnabled={true} zoomEnabled={true} scrollEnabled={true}
                            initialRegion={{
                                latitude: this.state.currentLatitude,
                                longitude: this.state.currentLongitude,
                                latitudeDelta: this.state.latitudeDelta,
                                longitudeDelta: this.state.longitudeDelta
                            }}
                            mapType={this.state.mapType}
                            onRegionChangeComplete={(region) => this.onRegionChangeComplete(region)}
                            //onRegionChange={(region)=>this.onRegionChange(region)}
                            minZoomLevel={minZoomLevel}  // default => 0
                            maxZoomLevel={maxZoomLevel} // default => 20
                        >
                            {
                            markerData.length > 0 &&
                            markerData.map((marker,index) => (      
                                !CommonUtil.isEmpty(marker.apart_lat) &&
                                <Marker
                                    key={index}
                                    tracksViewChanges={this.state.tracksViewChanges}
                                    coordinate={{latitude: marker.apart_lat, longitude: marker.apart_lon}}
                                    style={{width: marker.gubun === 'article' ? 110 : 86*1.14}}
                                    onPress={() => this.moveDetail(marker)}
                                >
                                    <MapMarker {...marker} stopTrackingViewChanges={this.stopTrackingViewChanges} />
                                </Marker>                
                            ))}
                            {
                            (this.state.markerDataAgent.length > 0 && this.state.markerNowFocus === 'article' && this.props.mainMapViewTarget.agent ) && 
                            this.state.markerDataAgent.map((marker,index) => (      
                                !CommonUtil.isEmpty(marker.apart_lat) &&
                                <Marker
                                    key={index}
                                    tracksViewChanges={this.state.tracksViewChanges}
                                    coordinate={{latitude: marker.apart_lat, longitude: marker.apart_lon}}
                                    style={{width: CommonUtil.dpToSize(81)}}
                                    onPress={() => this.moveDetail(marker)}
                                >
                                    <MapAgentMarker {...marker} stopTrackingViewChanges={this.stopTrackingViewChanges} />
                                </Marker>                
                            ))}
                        </MapView>
                        
                        {/*
                        <TouchableOpacity style={styles.zoomIn} onPress={()=>{this.props.navigation.navigate('NaverMapStack')}}>
                            <Icon name="minus" style={styles.icon} size={30} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.zoomOut} onPress={()=>{this.onPressZoomOut()}}>
                            <Icon name="plus" style={styles.icon} size={30} />
                        </TouchableOpacity>
                        */}
                        <View style={styles.showButtonWrap}>
                            <TouchableOpacity style={styles.showButton} onPress={()=>this._updateGeodata()}>
                                <Image source={BUTTON_GO_HOME} style={CommonStyle.scaleImage45} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>this.toggleData('M',this.props.mainMapViewTarget.maemul)} style={styles.showButton}>
                                {this.props.mainMapViewTarget.maemul ?
                                <Image source={BUTTON_SHOW_TARGET_OFF} style={CommonStyle.scaleImage45} />
                                :
                                <Image source={BUTTON_SHOW_TARGET_ON} style={CommonStyle.scaleImage45} />
                                }
                            </TouchableOpacity>
                            {
                                this.state.markerNowFocus == 'article' ?
                                <TouchableOpacity onPress={()=>this.toggleData('A',this.props.mainMapViewTarget.agent)} style={styles.showButton}>
                                    {this.props.mainMapViewTarget.agent ?
                                    <Image source={BUTTON_SHOW_AGENT_OFF} style={CommonStyle.scaleImage45} />
                                    :
                                    <Image source={BUTTON_SHOW_AGENT_ON} style={CommonStyle.scaleImage45} />
                                    }
                                </TouchableOpacity>
                                :
                                <View style={styles.showButton} />
                            }
                        </View>
                        {this.state.markerNowFocus === 'article' &&
                        <View style={styles.showButtonWrap2}>
                            <TouchableOpacity 
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                style={styles.infoWrap} 
                            >
                                <Tooltip popover={this.renderTooltip('')} width={SCREEN_WIDTH*0.5} height={100} backgroundColor="#f7f7f7" skipAndroidStatusBar={false}>
                                    <Icon name="questioncircleo" size={PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize20)} color="#555" />
                                </Tooltip>
                            </TouchableOpacity>
                        </View>
                        }
                    </View>
                    {this.state.popLayerView && (
                        <View>
                            <Overlay
                                isVisible={this.state.popLayerView}
                                //onBackdropPress={this.setState({popLayerView:false})}
                                windowBackgroundColor="rgba(0, 0, 0, 0.8)"
                                overlayBackgroundColor="tranparent"
                                containerStyle={{borderRadius:CommonUtil.dpToSize(10)}}
                            >
                                <View style={{width:CommonUtil.dpToSize(270),height:CommonUtil.dpToSize(400),backgroundColor:'transparent'}}>
                                    <PopLayerAgent screenState={{
                                        closePopView : this.closePopView.bind(this),
                                        closePopLayer : this.closePopLayer.bind(this),
                                        moveAgentList : this.moveAgentList.bind(this),
                                    }} />
                                </View>
                            </Overlay>
                        </View>
                    )}
                    { this.state.moreLoading &&
                        <View style={styles.moreWrap}>
                            <ActivityIndicator size="large" color={DEFAULT_COLOR.base_color} />
                        </View>
                    }
                   
                </View>
            );
        }
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    IndicatorContainer : {
        flex: 1,
        width:'100%',
        backgroundColor : "#fff",
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoWrap : {
        justifyContent:'center',alignItems:'center',position:'absolute',right:0,top :0, bottom:0,width:20
    },
    moreWrap : {
        position:'absolute',left:0,top:0,alignItems:'center',justifyContent:'center',width:SCREEN_WIDTH,height:SCREEN_HEIGHT,borderWidth:2,borderColor:'#ff0000',backgroundColor:'transparent'
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
        backgroundColor:'transparent',zIndex:99
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
        flex:1,justifyContent:'center',zIndex:5
    },
    fixedHeaderCenter : {
        flex:2,alignItems:'center',justifyContent:'flex-end',paddingBottom:10
    },
    fixedHeaderRight : {
        flex:1,justifyContent:'center',alignItems:'flex-end',flex:1,justifyContent:'center',zIndex:5
    },
    showButtonWrap : {
        position:'absolute',left:10,bottom:10, height:CommonUtil.dpToSize(45*3), width:80,backgroundColor:'transparent',zIndex:99
    },
    showButton : {
        flex:1,justifyContent:'center',paddingBottom:10
    },
    showButtonWrap2 : {
        position:'absolute',right:20,bottom:10, height:45, width:45,backgroundColor:'transparent',zIndex:99
    },
    tooltipWrap : {
        justifyContent:'center',alignItems:'center',position:'absolute',right:0,top :0, bottom:0,width:20
    },
    markerDefaultWrap : {
        height:50,width:100,aspectRatio:2,alignItems:'center',justifyContent:'center'
    },
    houseDefaultWrap : {
        height:47*1.4,width:86*1.4,alignItems:'center',justifyContent:'center'
    },
    houseBackImageStyle : {
        resizeMode: 'cover',position: 'absolute',top: -20,bottom: '50%',
    },
    houseBackBlackWrap : {
        height:50,width:86*1.14,left:8,top:30,backgroundColor:'#000',borderTopLeftRadius:15,borderTopRightRadius:15
    },
    markerAgentWrap : {
        height:CommonUtil.dpToSize(81) ,width:CommonUtil.dpToSize(72),alignItems:'center',justifyContent:'flex-start',paddingTop:15,paddingHorizontal:10
    },
    markerBackRedWrap : {
        flex: 1,position: 'relative', height:70,width:100,aspectRatio:2,bottom:-40,
    },
    markerBackRedImageStyle : {
        resizeMode: 'cover',position: 'absolute',top: 0,bottom: '50%',
    },
    zoomIn : {
        position:'absolute',top:(SCREEN_HEIGHT/2)-20,right:10,width:30,backgroundColor:'#ff0000'
    },
    zoomOut : {
        position:'absolute',top:(SCREEN_HEIGHT/2)+20,right:10,width:30,backgroundColor:'#ff0000'
    },
    mapTextWrap : {
        flex: 1,width:100,justifyContent:'flex-start',alignItems:'center',paddingTop:5
    },
    cityNameWrap  : {
        flex: 1,justifyContent:'flex-start',alignItems:'center',paddingTop:3
    },
    mapArticleWrap : {
        flex: 1,width:100,justifyContent:'center',alignItems:'flex-start',flexDirection:'row',paddingTop:2
    },
    mapArticleTitleWrap :{
        flex: 1,justifyContent:'center',alignItems:'center',paddingTop:Platform.OS === 'ios' ? 0 : 2
    },
    mapArticleDataWrap : {
        flex: 1,justifyContent:'center',alignItems:'flex-end',paddingRight:10,paddingTop:Platform.OS === 'ios' ? 0 : 4
    },
    mapArticleMarkerWrap : {
        flex: 1,justifyContent:'center',alignItems:'flex-start',flexDirection:'row',paddingTop:15
    },
    mapArticleMarkerTitleWrap : {
        flex: 1,justifyContent:'center',alignItems:'center',paddingLeft:5
    },
    mapArticleMarkerDataWrap : {
        flex: 1,justifyContent:'center',alignItems:'center',paddingRight:10
    },
    fixedTodayLinkWrap : {
        position:'absolute',top:DEFAULT_CONSTANTS.BottomHeight+30,left:0,width:SCREEN_WIDTH,
        height:40,justifyContent:'center',alignItems:'center',backgroundColor:'transparent',zIndex:9,
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
              //elevation: 1
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
});

function mapStateToProps(state) {
    return {
        userToken : state.GlabalStatus.userToken,
        mapCondition : state.GlabalStatus.mapCondition,
        mapSubCondition : state.GlabalStatus.mapSubCondition,
        mainMapViewTarget : state.GlabalStatus.mainMapViewTarget,
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
        _setupMapCondition:(obj)=> {
            dispatch(ActionCreator.setupMapCondition(obj))
        },
        _setupMapSubCondition:(str)=> {
            dispatch(ActionCreator.setupMapSubCondition(str))
        },
        _toggleFastDealBookmark:(bool)=> {
            dispatch(ActionCreator.toggleFastDealBookmark(bool))
        },
        _toggleMainMapOpenTarget:(obj)=> {
            dispatch(ActionCreator.toggleMainMapOpenTarget(obj))
        },
        
    };
}


export default connect(mapStateToProps,mapDispatchToProps)(IntroScreen);