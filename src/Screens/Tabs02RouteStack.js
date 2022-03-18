import React, { Component } from 'react';
import {TouchableOpacity,Image,PixelRatio,View,Platform} from 'react-native';
import {useSelector,useDispatch} from 'react-redux';
import ActionCreator from '../Ducks/Actions/MainActions';
const Stack = createStackNavigator();
import AsyncStorage from '@react-native-community/async-storage';
//공통상수
import  * as getDEFAULT_CONSTANTS   from '../Constants';
import CommonStyle from '../Style/CommonStyle';
const DEFAULT_CONSTANTS = getDEFAULT_CONSTANTS.DEFAULT_CONSTANTS;
const DEFAULT_TEXT = getDEFAULT_CONSTANTS.DEFAULT_TEXT;
const DEFAULT_COLOR = getDEFAULT_CONSTANTS.DEFAULT_COLOR;
import {CustomTextB,CustomTextR} from '../Components/CustomText';

import {createStackNavigator} from '@react-navigation/stack';
import CommonUtil from '../Utils/CommonUtil';
import CommonFunction from '../Utils/CommonFunction';

const BACK_BUTTON_IMAGE = require('../../assets/icons/back_icon2.png');
const CLOSE_BUTTON_IMAGE = require('../../assets/icons/btn_close.png');
const FAVORITE_IMAGE = require('../../assets/icons/icon_favorite.png');
const NONFAVORITE_IMAGE = require('../../assets/icons/icon_nonfavorite.png');
const Write_BUTTON_IMAGE = require('../../assets/icons/icon_pencil.png');

import SampleScreen from '../Utils/SampleScreen';

import SearchFormScreen from './Tabs02/SearchFormScreen';
import SearchFormScreen2 from './Tabs02/SearchFormScreen2';
import TodayFastDealScreen from './Tabs02/TodayFastDealScreen';
import TodayFastRentScreen from './Tabs02/TodayFastRentScreen';
import SetupCondtionScreen from './Tabs02/SetupCondtionScreen';
import SetupYearScreen from './Tabs02/SetupYearScreen';
import SetupHeiboScreen from './Tabs02/SetupHeiboScreen';
import SetupHouseholdScreen from './Tabs02/SetupHouseholdScreen';
import ApartDetailScreen from './Tabs02/ApartDetailScreen';
import HouseStoryDetailScreen from './Tabs02/HouseStoryDetailScreen';
import HouseStoryRegistScreen from './Tabs02/HouseStoryRegistScreen';
import AgentListSceen from './Tabs02/AgentListSceen';
import AgentDetailScreen from './Tabs02/AgentDetailScreen';
import IntroNaverScreen from './Tabs02/IntroNaverScreen';


import { apiObject } from "../Apis/Main";

const ApartDetailStack = ({navigation,route}) => {
    //console.log(';ProductListStack',route.params.screenData.apart_code)        
    const navTitle = CommonUtil.isEmpty(route.params.screenData.articlename) ? '아파트' : route.params.screenData.articlename;
    const apart_code = route.params.screenData.apart_code;
    const dispatch = useDispatch();
    const reduxData = useSelector(state => state);
    const {userToken,isApartBookMark} = reduxData.GlabalStatus;
    
    //CommonUtil.isEmpty(route.params.screenData.favorite_pk) ? dispatch(ActionCreator.toggleApartDetailBookmark(true)) : null;   
    /*
    if(!CommonUtil.isEmpty(route.params.screenData.favorite_pk)) {
        console.log('isApartBookMark11111')  
        dispatch(()=>ActionCreator.toggleApartDetailBookmark(true))
    }else{
        console.log('isApartBookMark2222')  
        dispatch(()=>ActionCreator.toggleApartDetailBookmark(false))
    }
    */
    //console.log('apart_code',apart_code)   
    const addBookMark = async(type) => {
       
        if ( CommonUtil.isEmpty(userToken)) {
            let aletTitle = DEFAULT_CONSTANTS.appName;
            let alertMessage = '로그인이 필요합니다.\n로그인 하시겠습니까?';
            let alertbuttons = [
                {text: '확인', onPress: () => console.log(1)},
                {text: '취소', onPress: () => console.log(2)},
            ]
            let returnCode = await CommonFunction.showAsyncAlert(aletTitle, alertMessage, alertbuttons)

            if (returnCode === 0) {
                await dispatch(ActionCreator.saveNonUserToken({}));
                setTimeout(() => {
                    //navigation.popToTop();
                    navigation.navigate('LoginPopStack');
                }, 500);
            } else {
                console.log('option else')
            }
        }else{
            //console.log('apart_code',apart_code)   
            console.log('defaultArray22222',defaultArray) 
            let defaultArray = isApartBookMark;
            let isInclude =  await defaultArray.indexOf(apart_code);
            //console.log('isInclude',isInclude)   
            if ( isInclude == -1 ) {
                //console.log('defaultArray1111',defaultArray)   
                await defaultArray.push(apart_code);  
                //console.log('defaultArray33333',defaultArray)   
                //newdefaultArray = newdefaultArray.filter((element) => element !== null);    
                let returnCode = {code:9998};        
                try {
                    returnCode = await apiObject.API_updateBookmark({
                        locale: "ko",class_type : 'Apart' ,target_pk : apart_code, is_mode : 'regist',member_pk : userToken.member_pk
                    }); 
                    //console.log('returnCode',returnCode);
                    if ( returnCode.code === '0000') {
                        CommonFunction.fn_call_toast('관심매물로 등록되었습니다',2000);
                        await dispatch(ActionCreator.toggleApartDetailBookmark(defaultArray.filter((element) => element !== null)));
                        
                    }else{
                        CommonFunction.fn_call_toast('관심매물로 등록에 실패하였습니다.',2000);
                    }
                    
                }catch(e){
                    CommonFunction.fn_call_toast('관심매물로 등록에 실패하였습니다.',2000);
                }
                
                
            }else{
                console.log('defaultArray22222',defaultArray)   
                let newdefaultArray = defaultArray.filter((element) => element !== apart_code);
                let returnCode = {code:9998};        
                try {
                    returnCode = await apiObject.API_updateBookmark({
                        locale: "ko",class_type : 'Apart' ,target_pk : apart_code, is_mode : 'remove',member_pk : userToken.member_pk
                    }); 
                    //console.log('returnCode',returnCode);
                    if ( returnCode.code === '0000') {
                        CommonFunction.fn_call_toast('관심매물 해제되었습니다',2000);
                        await dispatch(ActionCreator.toggleApartDetailBookmark(newdefaultArray));
                    }else{
                        CommonFunction.fn_call_toast('관심매물 해제에 실패하였습니다.',2000);
                    }
                    
                }catch(e){
                    CommonFunction.fn_call_toast('관심매물 해제에 실패하였습니다.',2000);
                }
                
            }
            console.log('isApartBookMark',isApartBookMark);
            return true; 
        }
    }

    return (
        <Stack.Navigator
            initialRouteName={'ApartDetailScreen'}
            screenOptions={{
                headerStyle: {shadowColor: 'transparent',elevation: 0,shadowOpacity: 0,borderBottomWidth: 0},
                headerLeft: (props) => (
                    <TouchableOpacity onPress= {()=> navigation.goBack()} style={CommonStyle.stackHeaderLeftWrap}>
                        <Image source={BACK_BUTTON_IMAGE} style={CommonStyle.backButtonWrap} />
                    </TouchableOpacity>
                ),
                
                headerTitle : (props) => (
                    <View style={CommonStyle.stackHeaderCenterWrap}>
                        <CustomTextB style={CommonStyle.stackHeaderCenterText}>{navTitle}</CustomTextB>
                    </View>
                ),
                headerRight : (props) => (
                    <TouchableOpacity onPress= {()=> addBookMark('Apart')} style={[CommonStyle.stackHeaderRightWrap,{flexDirection:'row',alignItems:'center'}]}>
                        <Image source={ isApartBookMark.includes(apart_code) ? FAVORITE_IMAGE : NONFAVORITE_IMAGE} style={CommonStyle.starButtonWrap} />                        
                    </TouchableOpacity>
                ),
            }}
        >
        <Stack.Screen name="ApartDetailScreen" >
            {props => <ApartDetailScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const StoryDetailStack = ({navigation,route}) => {
    //console.log(';ProductListStack',route)        
    const navTitle = CommonUtil.isEmpty(route.params.screenData.articlename) ? '아파트' : route.params.screenData.articlename;    

    const dispatch = useDispatch();
    const reduxData = useSelector(state => state);
    const {userToken} = reduxData.GlabalStatus;

    const loginAlert = async() => {
       
        if ( CommonUtil.isEmpty(userToken)) {
            let aletTitle = DEFAULT_CONSTANTS.appName;
            let alertMessage = '로그인이 필요합니다.\n로그인 하시겠습니까?';
            let alertbuttons = [
                {text: '확인', onPress: () => console.log(1)},
                {text: '취소', onPress: () => console.log(2)},
            ]
            let returnCode = await CommonFunction.showAsyncAlert(aletTitle, alertMessage, alertbuttons)

            if (returnCode === 0) {
                await dispatch(ActionCreator.saveNonUserToken({}));
                setTimeout(() => {
                    //navigation.popToTop();
                    navigation.navigate('LoginPopStack');
                }, 500);
            } else {
                console.log('option else')
            }
        }else{
            navigation.navigate('StoryRegistStack',{
                screenData : route.params.screenData,
                apart_code : route.params.screenData.apart_code
            });
        }
    }

    return (
        <Stack.Navigator
            initialRouteName={'HouseStoryDetailScreen'}
            screenOptions={{
                headerStyle: {shadowColor: 'transparent',elevation: 0,shadowOpacity: 0,borderBottomWidth: 0},
                headerLeft: (props) => (
                    <TouchableOpacity onPress= {()=> navigation.goBack()} style={CommonStyle.stackHeaderLeftWrap}>
                        <Image source={BACK_BUTTON_IMAGE} style={CommonStyle.backButtonWrap} />
                    </TouchableOpacity>
                ),
                
                headerTitle : (props) => (
                    <View style={CommonStyle.stackHeaderCenterWrap}>
                        <CustomTextB style={CommonStyle.stackHeaderCenterText}>{navTitle}</CustomTextB>
                    </View>
                ),
                headerRight : (props) => (
                    <TouchableOpacity onPress= {()=> loginAlert()} style={[CommonStyle.stackHeaderRightWrap,{flexDirection:'row',alignItems:'center'}]}>
                        <Image source={Write_BUTTON_IMAGE} style={{width:CommonUtil.dpToSize(12),height:CommonUtil.dpToSize(12)}} />
                        <CustomTextB style={[CommonStyle.textSize13,CommonStyle.fontColorBase]}>{" "}글작성</CustomTextB>
                    </TouchableOpacity> 
                ),
            }}
            
        >
        
            <Stack.Screen name="HouseStoryDetailScreen" >
                {props => <HouseStoryDetailScreen {...props} extraData={route} />}
            </Stack.Screen>
        </Stack.Navigator>
    );
};


const StoryRegistStack = ({navigation,route}) => {
    //console.log(';ProductListStack',route)        
    let navTitle = '글작성';
    return (
        <Stack.Navigator
            initialRouteName={'HouseStoryRegistScreen'}
            screenOptions={{
                headerStyle: {shadowColor: 'transparent',elevation: 0,shadowOpacity: 0,borderBottomWidth: 0},
                headerLeft: (props) => (
                    <TouchableOpacity onPress= {()=> navigation.goBack()} style={CommonStyle.stackHeaderLeftWrap}>
                        <Image source={BACK_BUTTON_IMAGE} style={CommonStyle.backButtonWrap} />
                    </TouchableOpacity>
                ),
                
                headerTitle : (props) => (
                    <View style={CommonStyle.stackHeaderCenterWrap}>
                        <CustomTextB style={CommonStyle.stackHeaderCenterText}>{navTitle}</CustomTextB>
                    </View>
                ),
                headerRight : (props) => (<View style={CommonStyle.stackHeaderRightWrap} />), 
            }}
            
        >
        
        <Stack.Screen name="HouseStoryRegistScreen" >
            {props => <HouseStoryRegistScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const SearchFormStack = ({navigation,route}) => {
    //console.log(';ProductListStack',route)    
    let navTitle = '';
    return (
        <Stack.Navigator
            initialRouteName={'SearchFormScreen'}
            screenOptions={{
                headerStyle: {shadowColor: 'transparent',elevation: 0,shadowOpacity: 0,borderBottomWidth: 0},
                headerLeft: (props) => (
                    <TouchableOpacity onPress= {()=> navigation.goBack()} style={CommonStyle.stackHeaderLeftWrap}>
                        <Image source={BACK_BUTTON_IMAGE} style={CommonStyle.backButtonWrap} />
                    </TouchableOpacity>
                ),
                
                headerTitle : (props) => (
                    <View style={CommonStyle.stackHeaderCenterWrap}>
                        <CustomTextB style={CommonStyle.stackHeaderCenterText}>{navTitle}</CustomTextB>
                    </View>
                ),
                headerRight : (props) => (<View style={CommonStyle.stackHeaderRightWrap} />), 
            }}
        >
        <Stack.Screen name="SearchFormScreen" >
            {props => <SearchFormScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const SearchFormStack2 = ({navigation,route}) => {
    //console.log(';ProductListStack',route)    
    let navTitle = '';
    return (
        <Stack.Navigator
            initialRouteName={'SearchFormScreen2'}
            screenOptions={{
                headerStyle: {shadowColor: 'transparent',elevation: 0,shadowOpacity: 0,borderBottomWidth: 0},
                headerLeft: (props) => (
                    <TouchableOpacity onPress= {()=> navigation.goBack()} style={CommonStyle.stackHeaderLeftWrap}>
                        <Image source={BACK_BUTTON_IMAGE} style={CommonStyle.backButtonWrap} />
                    </TouchableOpacity>
                ),
                
                headerTitle : (props) => (
                    <View style={CommonStyle.stackHeaderCenterWrap}>
                        <CustomTextB style={CommonStyle.stackHeaderCenterText}>{navTitle}</CustomTextB>
                    </View>
                ),
                headerRight : (props) => (<View style={CommonStyle.stackHeaderRightWrap} />), 
            }}
        >
        <Stack.Screen name="SearchFormScreen2" >
            {props => <SearchFormScreen2 {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};
const SetupCondtionStack = ({navigation,route}) => {
    //console.log(';ProductListStack',route)    
    let navTitle = '조건설정';
    return (
        <Stack.Navigator
            initialRouteName={'SetupCondtionScreen'}
            screenOptions={{
                headerStyle: {shadowColor: 'transparent',elevation: 0,shadowOpacity: 0,borderBottomWidth: 0},
                headerLeft: (props) => (
                    <View style={CommonStyle.stackHeaderLeftWrap} />
                ),
                
                headerTitle : (props) => (
                    <View style={CommonStyle.stackHeaderCenterWrap}>
                        <CustomTextB style={CommonStyle.stackHeaderCenterText}>{navTitle}</CustomTextB>
                    </View>
                ),
                headerRight : (props) => (
                    <TouchableOpacity onPress= {()=> navigation.goBack()} style={CommonStyle.stackHeaderRightWrap}>
                        <Image source={CLOSE_BUTTON_IMAGE} style={CommonStyle.backButtonWrap} />
                    </TouchableOpacity> 
                ), 
            }}
            
        >
        
        <Stack.Screen name="SetupCondtionScreen" >
            {props => <SetupCondtionScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const SetupYearStack = ({navigation,route}) => {
    //console.log(';ProductListStack',route)    
    let navTitle = '연식';
    const dispatch = useDispatch();
    const reduxData = useSelector(state => state);
    const {mapSubCondition} = reduxData.GlabalStatus;
    const resetConditionYear = async() => {
        
        let aletTitle = DEFAULT_CONSTANTS.appName;
        let alertMessage = '정말로 초기화하시겠습니까??';
        let alertbuttons = [
            {text: '확인', onPress: () => console.log(1)},
            {text: '취소', onPress: () => console.log(2)},
        ]
        let returnCode = await CommonFunction.showAsyncAlert(aletTitle, alertMessage, alertbuttons)
        //console.log('returnCode else',returnCode)
        if (returnCode === 0) {
            await  AsyncStorage.setItem('mapSubCondition',
            JSON.stringify({
            ...mapSubCondition,
            year : {}
            })
        );  
            await dispatch(ActionCreator.setupMapSubCondition({
                ...mapSubCondition,
                year : {}
            }));    
            navigation.goBack();    
        } else {
            console.log('option else')
        }
    }
    return (
        <Stack.Navigator
            initialRouteName={'SetupYearScreen'}
            screenOptions={{
                headerStyle: {shadowColor: 'transparent',elevation: 0,shadowOpacity: 0,borderBottomWidth: 0},
                headerLeft: (props) => (
                    <TouchableOpacity onPress= {()=> navigation.goBack()} style={CommonStyle.stackHeaderLeftWrap}>
                        <Image source={BACK_BUTTON_IMAGE} style={CommonStyle.backButtonWrap} />
                    </TouchableOpacity>
                ),
                
                headerTitle : (props) => (
                    <View style={CommonStyle.stackHeaderCenterWrap}>
                        <CustomTextB style={CommonStyle.stackHeaderCenterText}>{navTitle}</CustomTextB>
                    </View>
                ),
                headerRight : (props) => (
                    <TouchableOpacity onPress= {()=> resetConditionYear()} style={CommonStyle.stackHeaderRightWrap}>
                        <CustomTextB style={[CommonStyle.textSize12,CommonStyle.fontColorBase]}>초기화</CustomTextB>
                    </TouchableOpacity> 
                ), 
            }}
            
        >
        
        <Stack.Screen name="SetupYearScreen" >
            {props => <SetupYearScreen {...props} extraData={route}  />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const SetupHeiboStack = ({navigation,route}) => {
    //console.log(';ProductListStack',route)    
    let navTitle = '평형';
    const dispatch = useDispatch();
    const reduxData = useSelector(state => state);
    const {mapSubCondition} = reduxData.GlabalStatus;

    const resetConditionHeibo = async() => {
        let aletTitle = DEFAULT_CONSTANTS.appName;
        let alertMessage = '정말로 초기화하시겠습니까??';
        let alertbuttons = [
            {text: '확인', onPress: () => console.log(1)},
            {text: '취소', onPress: () => console.log(2)},
        ]
        let returnCode = await CommonFunction.showAsyncAlert(aletTitle, alertMessage, alertbuttons)

        if (returnCode === 0) {
            await  AsyncStorage.setItem('mapSubCondition',
                JSON.stringify({
                ...mapSubCondition,
                heibo : {}, tmpHheibo : {}
            })
            ); 
            await dispatch(ActionCreator.setupMapSubCondition({
                ...mapSubCondition,
                heibo : {}, tmpHheibo : {}
            }));  
            navigation.goBack();          
        } else {
            console.log('option else')
        }
    }
    return (
        <Stack.Navigator
            initialRouteName={'SetupHeoboScreen'}
            screenOptions={{
                headerStyle: {shadowColor: 'transparent',elevation: 0,shadowOpacity: 0,borderBottomWidth: 0},
                headerLeft: (props) => (
                    <TouchableOpacity onPress= {()=> navigation.goBack()} style={CommonStyle.stackHeaderLeftWrap}>
                        <Image source={BACK_BUTTON_IMAGE} style={CommonStyle.backButtonWrap} />
                    </TouchableOpacity>
                ),
                
                headerTitle : (props) => (
                    <View style={CommonStyle.stackHeaderCenterWrap}>
                        <CustomTextB style={CommonStyle.stackHeaderCenterText}>{navTitle}</CustomTextB>
                    </View>
                ),
                headerRight : (props) => (
                    <TouchableOpacity onPress= {()=> resetConditionHeibo()} style={CommonStyle.stackHeaderRightWrap}>
                        <CustomTextB style={[CommonStyle.textSize12,CommonStyle.fontColorBase]}>초기화</CustomTextB>
                    </TouchableOpacity> 
                ), 
            }}
            
        >
        
        <Stack.Screen name="SetupHeiboScreen" >
            {props => <SetupHeiboScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const SetupHouseholdStack = ({navigation,route}) => {
    //console.log(';ProductListStack',route)    
    let navTitle = '세대수';
    const dispatch = useDispatch();
    const reduxData = useSelector(state => state);
    const {mapSubCondition} = reduxData.GlabalStatus;

    const resetConditionHeibo = async() => {
        let aletTitle = DEFAULT_CONSTANTS.appName;
        let alertMessage = '정말로 초기화하시겠습니까??';
        let alertbuttons = [
            {text: '확인', onPress: () => console.log(1)},
            {text: '취소', onPress: () => console.log(2)},
        ]
        let returnCode = await CommonFunction.showAsyncAlert(aletTitle, alertMessage, alertbuttons)

        if (returnCode === 0) {
            await  AsyncStorage.setItem('mapSubCondition',
                JSON.stringify({
                ...mapSubCondition,
                household : {}, tmphousehold : {}
            })
            ); 
            await dispatch(ActionCreator.setupMapSubCondition({
                ...mapSubCondition,
                household : {}, tmphousehold : {}
            }));    
            navigation.goBack();
        } else {
            console.log('option else')
        }
    }
    return (
        <Stack.Navigator
            initialRouteName={'SetupHouseholdScreen'}
            screenOptions={{
                headerStyle: {shadowColor: 'transparent',elevation: 0,shadowOpacity: 0,borderBottomWidth: 0},
                headerLeft: (props) => (
                    <TouchableOpacity onPress= {()=> navigation.goBack()} style={CommonStyle.stackHeaderLeftWrap}>
                        <Image source={BACK_BUTTON_IMAGE} style={CommonStyle.backButtonWrap} />
                    </TouchableOpacity>
                ),
                
                headerTitle : (props) => (
                    <View style={CommonStyle.stackHeaderCenterWrap}>
                        <CustomTextB style={CommonStyle.stackHeaderCenterText}>{navTitle}</CustomTextB>
                    </View>
                ),
                headerRight : (props) => (
                    <TouchableOpacity onPress= {()=> resetConditionHeibo()} style={CommonStyle.stackHeaderRightWrap}>
                        <CustomTextB style={[CommonStyle.textSize12,CommonStyle.fontColorBase]}>초기화</CustomTextB>
                    </TouchableOpacity> 
                ), 
            }}
            
        >
        
        <Stack.Screen name="SetupHouseholdScreen" >
            {props => <SetupHouseholdScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const TodayFastDealStack = ({navigation,route}) => {
    //console.log(';ProductListStack',route)    
    let navTitle = '오늘의 급매물';
    const dispatch = useDispatch();
    const reduxData = useSelector(state => state);
    const {userToken,isViewFastDeal} = reduxData.GlabalStatus;
    const toggleBookMark = async() => {
       
        if ( CommonUtil.isEmpty(userToken)) {
            let aletTitle = DEFAULT_CONSTANTS.appName;
            let alertMessage = '로그인이 필요합니다.\n로그인 하시겠습니까?';
            let alertbuttons = [
                {text: '확인', onPress: () => console.log(1)},
                {text: '취소', onPress: () => console.log(2)},
            ]
            let returnCode = await CommonFunction.showAsyncAlert(aletTitle, alertMessage, alertbuttons)

            if (returnCode === 0) {
                await dispatch(ActionCreator.saveNonUserToken({}));
                setTimeout(() => {
                    //navigation.popToTop();
                    navigation.navigate('LoginPopStack');
                }, 500);
            } else {
                console.log('option else')
            }
        }else{
            await dispatch(ActionCreator.toggleFastDealBookmark(!isViewFastDeal));
            return;
        }
    }
    return (
        <Stack.Navigator
            initialRouteName={'TodayFastDealScreen'}
            screenOptions={{
                headerStyle: {shadowColor: 'transparent',elevation: 0,shadowOpacity: 0,borderBottomWidth: 0},
                headerLeft: (props) => (
                    <TouchableOpacity onPress= {()=> navigation.goBack(null)} style={CommonStyle.stackHeaderLeftWrap}>
                        <Image source={BACK_BUTTON_IMAGE} style={CommonStyle.backButtonWrap} />
                    </TouchableOpacity>
                ),
                
                headerTitle : (props) => (
                    <View style={CommonStyle.stackHeaderCenterWrap}>
                        <CustomTextB style={CommonStyle.stackHeaderCenterText}>{navTitle}</CustomTextB>
                    </View>
                ),
                headerRight : (props) => (
                    <TouchableOpacity onPress= {()=> toggleBookMark()} style={[CommonStyle.stackHeaderRightWrap,{flexDirection:'row',alignItems:'center'}]}>
                        <Image source={isViewFastDeal ? NONFAVORITE_IMAGE : FAVORITE_IMAGE} style={CommonStyle.starButtonWrap} />
                        <CustomTextR style={CommonStyle.stackHeaderRightText}>{" "}관심매물</CustomTextR>
                    </TouchableOpacity>
                ),
            }}
            
        >
        
        <Stack.Screen name="TodayFastDealScreen" >
            {props => <TodayFastDealScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const TodayFastRentStack = ({navigation,route}) => {
    //console.log(';ProductListStack',route)    
    let navTitle = '오늘의 급전세';
    const dispatch = useDispatch();
    const reduxData = useSelector(state => state);
    const {userToken,isViewFastDeal} = reduxData.GlabalStatus;
    const toggleBookMark = async() => {
       
        if ( CommonUtil.isEmpty(userToken)) {
            let aletTitle = DEFAULT_CONSTANTS.appName;
            let alertMessage = '로그인이 필요합니다.\n로그인 하시겠습니까?';
            let alertbuttons = [
                {text: '확인', onPress: () => console.log(1)},
                {text: '취소', onPress: () => console.log(2)},
            ]
            let returnCode = await CommonFunction.showAsyncAlert(aletTitle, alertMessage, alertbuttons)

            if (returnCode === 0) {
                await dispatch(ActionCreator.saveNonUserToken({}));
                setTimeout(() => {
                    //navigation.popToTop();
                    navigation.navigate('LoginPopStack');
                }, 500);
            } else {
                console.log('option else')
            }
        }else{
            await dispatch(ActionCreator.toggleFastDealBookmark(!isViewFastDeal));
            return;
        }
    }
    return (
        <Stack.Navigator
            initialRouteName={'TodayFastRentScreen'}
            screenOptions={{
                headerStyle: {shadowColor: 'transparent',elevation: 0,shadowOpacity: 0,borderBottomWidth: 0},
                headerLeft: (props) => (
                    <TouchableOpacity onPress= {()=> navigation.goBack(null)} style={CommonStyle.stackHeaderLeftWrap}>
                        <Image source={BACK_BUTTON_IMAGE} style={CommonStyle.backButtonWrap} />
                    </TouchableOpacity>
                ),
                
                headerTitle : (props) => (
                    <View style={CommonStyle.stackHeaderCenterWrap}>
                        <CustomTextB style={CommonStyle.stackHeaderCenterText}>{navTitle}</CustomTextB>
                    </View>
                ),
                headerRight : (props) => (
                    <TouchableOpacity onPress= {()=> toggleBookMark()} style={[CommonStyle.stackHeaderRightWrap,{flexDirection:'row',alignItems:'center'}]}>
                        <Image source={isViewFastDeal ? NONFAVORITE_IMAGE : FAVORITE_IMAGE} style={CommonStyle.starButtonWrap} />
                        <CustomTextR style={CommonStyle.stackHeaderRightText}>{" "}관심매물</CustomTextR>
                    </TouchableOpacity>
                ),
            }}
            
        >
        
        <Stack.Screen name="TodayFastRentScreen" >
            {props => <TodayFastRentScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const AgentListStack = ({navigation,route}) => {
    //console.log(';ProductListStack',route)    
    let navTitle = '착한 중개인';
    const dispatch = useDispatch();
    const reduxData = useSelector(state => state);
    const {userToken,isViewMyAgent} = reduxData.GlabalStatus;
    const toggleBookMark = async() => {
       
        if ( CommonUtil.isEmpty(userToken)) {
            let aletTitle = DEFAULT_CONSTANTS.appName;
            let alertMessage = '로그인이 필요합니다.\n로그인 하시겠습니까?';
            let alertbuttons = [
                {text: '확인', onPress: () => console.log(1)},
                {text: '취소', onPress: () => console.log(2)},
            ]
            let returnCode = await CommonFunction.showAsyncAlert(aletTitle, alertMessage, alertbuttons)

            if (returnCode === 0) {
                await dispatch(ActionCreator.saveNonUserToken({}));
                setTimeout(() => {
                    //navigation.popToTop();
                    navigation.navigate('LoginPopStack');
                }, 500);
            } else {
                console.log('option else')
            }
        }else{
            await dispatch(ActionCreator.toggleViewFiltermyAgent(!isViewMyAgent));
            return;
        }
    }

    return (
        <Stack.Navigator
            initialRouteName={'AgentListSceen'}
            screenOptions={{
                headerStyle: {shadowColor: 'transparent',elevation: 0,shadowOpacity: 0,borderBottomWidth: 0},
                headerLeft: (props) => (
                    <TouchableOpacity onPress= {()=> navigation.goBack()} style={CommonStyle.stackHeaderLeftWrap}>
                        <Image source={BACK_BUTTON_IMAGE} style={CommonStyle.backButtonWrap} />
                    </TouchableOpacity>
                ),
                
                headerTitle : (props) => (
                    <View style={CommonStyle.stackHeaderCenterWrap}>
                        <CustomTextB style={CommonStyle.stackHeaderCenterText}>{navTitle}</CustomTextB>
                    </View>
                ),
                headerRight : (props) => (
                    <TouchableOpacity onPress= {()=> toggleBookMark()} style={[CommonStyle.stackHeaderRightWrap,{flexDirection:'row',alignItems:'center'}]}>
                        <Image source={isViewMyAgent ? NONFAVORITE_IMAGE : FAVORITE_IMAGE} style={CommonStyle.starButtonWrap} />
                        <CustomTextR style={CommonStyle.stackHeaderRightText}>{" "}관심중개인</CustomTextR>
                    </TouchableOpacity>
                ),
            }}
            
        >
        
        <Stack.Screen name="AgentListSceen" >
            {props => <AgentListSceen {...props} extraData={route} />}
        </Stack.Screen>           
        </Stack.Navigator>
    );
};


const AgentDetailStack = ({navigation,route}) => {
    //console.log(';ProductListStack',route)    
    const navTitle = CommonUtil.isEmpty(route.params.screenData.company_name) ? '착한 중개인' : route.params.screenData.company_name;
    const estate_agent_pk = route.params.screenData.estate_agent_pk;
    const dispatch = useDispatch();
    const reduxData = useSelector(state => state);
    const {userToken,isAgentBookMark} = reduxData.GlabalStatus;
     
    const addBookMark = async(type) => {
       
        if ( CommonUtil.isEmpty(userToken)) {
            let aletTitle = DEFAULT_CONSTANTS.appName;
            let alertMessage = '로그인이 필요합니다.\n로그인 하시겠습니까?';
            let alertbuttons = [
                {text: '확인', onPress: () => console.log(1)},
                {text: '취소', onPress: () => console.log(2)},
            ]
            let returnCode = await CommonFunction.showAsyncAlert(aletTitle, alertMessage, alertbuttons)

            if (returnCode === 0) {
                await dispatch(ActionCreator.saveNonUserToken({}));
                setTimeout(() => {
                    //navigation.popToTop();
                    navigation.navigate('LoginPopStack');
                }, 500);
            } else {
                console.log('option else')
            }
        }else{
            let defaultArray = isAgentBookMark;
            let isInclude =  await defaultArray.indexOf(estate_agent_pk);
            if ( isInclude == -1 ) {  
                await defaultArray.push(estate_agent_pk);  
                let returnCode = {code:9998};        
                try {
                    returnCode = await apiObject.API_updateBookmark({
                        locale: "ko",class_type : 'Agent' ,target_pk : estate_agent_pk, is_mode : 'regist',member_pk : userToken.member_pk
                    }); 
                    //console.log('returnCode',returnCode);
                    if ( returnCode.code === '0000') {
                        CommonFunction.fn_call_toast('관심부동산으로 등록되었습니다',2000);
                        await dispatch(ActionCreator.toggleAgentBookmark(defaultArray.filter((element) => element !== null)));
                        
                    }else{
                        CommonFunction.fn_call_toast('관심부동산 등록에 실패하였습니다.',2000);
                    }
                    
                }catch(e){
                    CommonFunction.fn_call_toast('관심부동산 등록에 실패하였습니다.',2000);
                }
                
                
            }else{
                let newdefaultArray = defaultArray.filter((element) => element !== estate_agent_pk);
                let returnCode = {code:9998};        
                try {
                    returnCode = await apiObject.API_updateBookmark({
                        locale: "ko",class_type : 'Agent' ,target_pk : estate_agent_pk, is_mode : 'remove',member_pk : userToken.member_pk
                    }); 
                    if ( returnCode.code === '0000') {
                        CommonFunction.fn_call_toast('관심부동산에서 제거하였습니다',2000);
                        await dispatch(ActionCreator.toggleAgentBookmark(newdefaultArray));
                    }else{
                        CommonFunction.fn_call_toast('관심부동산 해제에 실패하였습니다.',2000);
                    }
                }catch(e){
                    CommonFunction.fn_call_toast('관심부동산 해제에 실패하였습니다.',2000);
                }
            }
            return true; 
        }
    }

    return (
        <Stack.Navigator
            initialRouteName={'AgentDetailScreen'}
            screenOptions={{
                headerStyle: {shadowColor: 'transparent',elevation: 0,shadowOpacity: 0,borderBottomWidth: 0},
                headerLeft: (props) => (
                    <TouchableOpacity onPress= {()=> navigation.goBack()} style={CommonStyle.stackHeaderLeftWrap}>
                        <Image source={BACK_BUTTON_IMAGE} style={CommonStyle.backButtonWrap} />
                    </TouchableOpacity>
                ),
                
                headerTitle : (props) => (
                    <View style={CommonStyle.stackHeaderCenterWrap}>
                        <CustomTextB style={CommonStyle.stackHeaderCenterText}>{navTitle}</CustomTextB>
                    </View>
                ),
                headerRight : (props) => (
                    <TouchableOpacity onPress= {()=> addBookMark('Agent')} style={[CommonStyle.stackHeaderRightWrap,{flexDirection:'row',alignItems:'center'}]}>
                        <Image source={ isAgentBookMark.includes(estate_agent_pk) ? FAVORITE_IMAGE : NONFAVORITE_IMAGE} style={{width:CommonUtil.dpToSize(25),height:CommonUtil.dpToSize(25)}} />                        
                    </TouchableOpacity>
                ),
            }}
        >
        <Stack.Screen name="AgentDetailScreen" >
            {props => <AgentDetailScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const NaverMapStack = ({navigation,route}) => {
    //console.log(';NoticeListStack',route)        
    return (
        <Stack.Navigator
            initialRouteName={'IntroNaverScreen'}
            screenOptions={{          
                headerShown: false
            }}

        >
        
        <Stack.Screen name="IntroNaverScreen" >
            {props => <IntroNaverScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};


export { ApartDetailStack,StoryDetailStack,StoryRegistStack,TodayFastDealStack,TodayFastRentStack,SearchFormStack,SearchFormStack2,SetupCondtionStack,SetupYearStack,SetupHeiboStack,SetupHouseholdStack,NaverMapStack,AgentListStack,AgentDetailStack } ;