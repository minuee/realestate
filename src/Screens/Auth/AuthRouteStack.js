import React, { Component } from 'react';
import {TouchableOpacity,Image,PixelRatio,View,StyleSheet} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
const Stack = createStackNavigator();
//공통상수
import  * as getDEFAULT_CONSTANTS   from '../../Constants';
import CommonStyle from '../../Style/CommonStyle';
const DEFAULT_CONSTANTS = getDEFAULT_CONSTANTS.DEFAULT_CONSTANTS;
const DEFAULT_TEXT = getDEFAULT_CONSTANTS.DEFAULT_TEXT;
const DEFAULT_COLOR = getDEFAULT_CONSTANTS.DEFAULT_COLOR;
import {CustomTextB,CustomTextL} from '../../Components/CustomText';
const BACK_BUTTON_IMAGE = require('../../../assets/icons/back_icon2.png');
const CLOSE_BUTTON_IMAGE = require('../../../assets/icons/btn_close.png');

import LoginPopScreen from './LoginPopScreen';
import LoginScreen from './LoginScreen';
import SignInStep01Screen from './SignInStep01Screen';
import SignInStep02Screen from './SignInStep02Screen';
import SignInStep03AScreen from './SignInStep03AScreen';
import SignInStep03BScreen from './SignInStep03BScreen';
import UseYakwanScreen from '../Tabs01/UseYakwanScreen';
import PrivateYakwanScreen from '../Tabs01/PrivateYakwanScreen';
import MarketingScreen from '../Tabs01/MarketingScreen';
import PWResetScreen from './PWResetScreen';


const LoginPopStack = ({navigation,route, rootState}) => {
    //console.log('LoginPopStack',rootState)    
    let navTitle = '로그인';
    return (
        <Stack.Navigator
            initialRouteName={'LoginPopScreen'}
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
        
        <Stack.Screen name="LoginPopScreen" >
            {props => <LoginPopScreen {...props} extraData={route} rootState={rootState} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const PWResetStack = ({navigation,route,rootState}) => {
    const navTitle = "비밀번호 찾기";
    return (
        <Stack.Navigator
            initialRouteName={'PWResetScreen'}
            screenOptions={{
                headerStyle: {shadowColor: 'transparent',elevation: 0,shadowOpacity: 0,borderBottomWidth: 0},
                headerLeft: (props) => (
                    <View onPress= {()=> navigation.goBack()} style={CommonStyle.stackHeaderLeftWrap} />
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
        
        <Stack.Screen name="PWResetScreen" >
            {props => <PWResetScreen {...props} extraData={route} rootState={rootState} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const SignInStack = ({navigation,route,rootState}) => {
    return (
        <Stack.Navigator
            initialRouteName={'LoginScreen'}
            screenOptions={{
                headerStyle: {shadowColor: 'transparent',elevation: 0,shadowOpacity: 0,borderBottomWidth: 0},
                headerLeft: (props) => (
                    <TouchableOpacity onPress= {()=> navigation.goBack()} style={CommonStyle.stackHeaderLeftWrap}>
                        <Image source={BACK_BUTTON_IMAGE} style={CommonStyle.backButtonWrap} />
                    </TouchableOpacity>
                ),
                headerTitle : (props) => (
                    <View style={CommonStyle.stackHeaderCenterWrap2}/>
                ),
                headerRight : (props) => (
                    <View style={CommonStyle.stackHeaderRightWrap2} >
                         <View style={CommonStyle.stackHeadeSpecialWrap}>
                            <View style={CommonStyle.stackHeadeSpecialLeft2}>
                                <CustomTextL style={[CommonStyle.textSize12,CommonStyle.fontColorBase]}>로그인</CustomTextL>
                            </View>
                            {/* <View style={CommonStyle.stackHeadeSpecialRight2}>
                                <CustomTextB style={[CommonStyle.textSize12,CommonStyle.fontColorDefault]}>회원가입</CustomTextB>
                            </View> */}
                        </View>
                    </View>)    
            }}
            
        >
        
        <Stack.Screen name="LoginScreen" >
            {props => <LoginScreen {...props} extraData={route} rootState={rootState} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const SignInStep01Stack = ({navigation,route,rootState}) => {
    return (
        <Stack.Navigator
            initialRouteName={'SignInStep01Screen'}
            screenOptions={{
                headerStyle: {shadowColor: 'transparent',elevation: 0,shadowOpacity: 0,borderBottomWidth: 0},
                headerLeft: (props) => (
                    <TouchableOpacity onPress= {()=> navigation.goBack()} style={CommonStyle.stackHeaderLeftWrap}>
                        <Image source={BACK_BUTTON_IMAGE} style={CommonStyle.backButtonWrap} />
                    </TouchableOpacity>
                ),
                
                headerTitle : (props) => (
                    <View style={CommonStyle.stackHeaderCenterWrap2}/>
                ),
                headerRight : (props) => (
                    <View style={CommonStyle.stackHeaderRightWrap2} >
                         <View style={CommonStyle.stackHeadeSpecialWrap}>
                            {/* <View style={CommonStyle.stackHeadeSpecialLeft}>
                                <CustomTextL style={[CommonStyle.textSize12,CommonStyle.fontColorDefault]}>로그인</CustomTextL>
                            </View> */}
                            <View style={CommonStyle.stackHeadeSpecialRight}>
                                <CustomTextB style={[CommonStyle.textSize12,CommonStyle.fontColorBase]}>회원가입</CustomTextB>
                            </View>
                            
                        </View>
                    </View>)                    
            }}
            
        >
        
        <Stack.Screen name="SignInStep01Screen" >
            {props => <SignInStep01Screen {...props} extraData={route} rootState={rootState} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const SignInStep02Stack = ({navigation,route,rootState}) => {
    return (
        <Stack.Navigator
            initialRouteName={'SignInStep02Screen'}
            screenOptions={{
                headerStyle: {shadowColor: 'transparent',elevation: 0,shadowOpacity: 0,borderBottomWidth: 0},
                headerLeft: (props) => (
                    <TouchableOpacity onPress= {()=> navigation.goBack()} style={CommonStyle.stackHeaderLeftWrap}>
                        <Image source={BACK_BUTTON_IMAGE} style={CommonStyle.backButtonWrap} />
                    </TouchableOpacity>
                ),
                
                headerTitle : (props) => (
                    <View style={CommonStyle.stackHeaderCenterWrap2}/>
                ),
                headerRight : (props) => (
                    <View style={CommonStyle.stackHeaderRightWrap2} >
                        <View style={CommonStyle.stackHeadeSpecialWrap}>
                            {/* <View style={CommonStyle.stackHeadeSpecialLeft}>
                                <CustomTextL style={[CommonStyle.textSize12,CommonStyle.fontColorDefault]}>로그인</CustomTextL>
                            </View> */}
                            <View style={CommonStyle.stackHeadeSpecialRight}>
                                <CustomTextB style={[CommonStyle.textSize12,CommonStyle.fontColorBase]}>회원가입</CustomTextB>
                            </View>
                            
                        </View>
                    </View>)                    
            }}
            
        >
        
        <Stack.Screen name="SignInStep02Screen" >
            {props => <SignInStep02Screen {...props} extraData={route} rootState={rootState} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};


const SignInStep03AStack = ({navigation,route,rootState}) => {
    return (
        <Stack.Navigator
            initialRouteName={'SignInStep03AScreen'}
            screenOptions={{
                headerStyle: {shadowColor: 'transparent',elevation: 0,shadowOpacity: 0,borderBottomWidth: 0},
                headerLeft: (props) => (
                    <TouchableOpacity onPress= {()=> navigation.goBack()} style={CommonStyle.stackHeaderLeftWrap}>
                        <Image source={BACK_BUTTON_IMAGE} style={CommonStyle.backButtonWrap} />
                    </TouchableOpacity>
                ),
                headerTitle : (props) => (
                    <View style={CommonStyle.stackHeaderCenterWrap2}/>
                ),
                headerRight : (props) => (
                    <View style={CommonStyle.stackHeaderRightWrap2} >
                        <View style={CommonStyle.stackHeadeSpecialWrap}>
                            {/* <View style={CommonStyle.stackHeadeSpecialLeft}>
                                <CustomTextL style={[CommonStyle.textSize12,CommonStyle.fontColorDefault]}>로그인</CustomTextL>
                            </View> */}
                            <View style={CommonStyle.stackHeadeSpecialRight}>
                                <CustomTextB style={[CommonStyle.textSize12,CommonStyle.fontColorBase]}>회원가입</CustomTextB>
                            </View>
                            
                        </View>
                    </View>)                    
            }}
        >
        <Stack.Screen name="SignInStep03AScreen" >
            {props => <SignInStep03AScreen {...props} extraData={route} rootState={rootState} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};


const SignInStep03BStack = ({navigation,route,rootState}) => {
    return (
        <Stack.Navigator
            initialRouteName={'SignInStep03BScreen'}
            screenOptions={{
                headerStyle: {shadowColor: 'transparent',elevation: 0,shadowOpacity: 0,borderBottomWidth: 0},
                headerLeft: (props) => (
                    <TouchableOpacity onPress= {()=> navigation.goBack()} style={CommonStyle.stackHeaderLeftWrap}>
                       <Image source={BACK_BUTTON_IMAGE} style={CommonStyle.backButtonWrap} />
                    </TouchableOpacity>
                ),
                headerTitle : (props) => (
                    <View style={CommonStyle.stackHeaderCenterWrap2}/>
                ),
                headerRight : (props) => (
                    <View style={CommonStyle.stackHeaderRightWrap2} >
                        <View style={CommonStyle.stackHeadeSpecialWrap}>
                            {/* <View style={CommonStyle.stackHeadeSpecialLeft}>
                                <CustomTextL style={[CommonStyle.textSize12,CommonStyle.fontColorDefault]}>로그인</CustomTextL>
                            </View> */}
                            <View style={CommonStyle.stackHeadeSpecialRight}>
                                <CustomTextB style={[CommonStyle.textSize12,CommonStyle.fontColorBase]}>회원가입</CustomTextB>
                            </View>
                            
                        </View>
                    </View>)                    
            }}
        >
        <Stack.Screen name="SignInStep03BScreen" >
            {props => <SignInStep03BScreen {...props} extraData={route} rootState={rootState} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};


const UseYakwanStack = ({navigation,route}) => {
    //console.log(';NoticeListStack',route)    
    let navTitle = '서비스 이용약관';
    return (
        <Stack.Navigator
            initialRouteName={'UseYakwanScreen'}
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
        
        <Stack.Screen name="UseYakwanScreen" >
            {props => <UseYakwanScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const PrivateYakwanStack = ({navigation,route}) => {
    //console.log(';NoticeListStack',route)    
    let navTitle = '개인정보 취급방침';
    return (
        <Stack.Navigator
            initialRouteName={'PrivateYakwanScreen'}
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
        
        <Stack.Screen name="PrivateYakwanScreen" >
            {props => <PrivateYakwanScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};


const MarketingStack = ({navigation,route}) => {
    //console.log(';NoticeListStack',route)    
    let navTitle = '마케팅 정보';
    return (
        <Stack.Navigator
            initialRouteName={'MarketingScreen'}
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
        
        <Stack.Screen name="MarketingScreen" >
            {props => <MarketingScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

export { SignInStack,LoginPopStack,SignInStep01Stack,SignInStep02Stack,SignInStep03AStack,SignInStep03BStack,UseYakwanStack,PrivateYakwanStack,MarketingStack,PWResetStack} ;