import React, { Component } from 'react';
import {TouchableOpacity,Image,PixelRatio,View,Platform} from 'react-native';
import {useSelector,useDispatch} from 'react-redux';
import ActionCreator from '../Ducks/Actions/MainActions';
const Stack = createStackNavigator();
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
const DEFAULT_PROFILE_IMAGE =  require('../../assets/icons/default_profile.png')
import ChatRoomScreen from './Tabs01/ChatRoomScreen';
import ChatScreen from './Tabs01/ChatScreen';
import DeclarationScreen from './Tabs01/DeclarationScreen';

import UserDefaultDetailScreen from './Tabs01/UserDefaultDetailScreen';
import UserAgentDetailScreen from './Tabs01/UserAgentDetailScreen';
import NoticeListScreen from './Tabs01/NoticeListScreen';
import NoticeDetailScreen from './Tabs01/NoticeDetailScreen';
import RequestScreen from './Tabs01/RequestScreen';
import SettleScreen from './Tabs01/SettleScreen';
import SettleAgentScreen from './Tabs01/SettleAgentScreen';


import InAppScreen from './Tabs01/InAppScreen';
import AgentShopScreen from './Tabs01/AgentShopScreen';
import UseYakwanScreen from './Tabs01/UseYakwanScreen';
import PrivateYakwanScreen from './Tabs01/PrivateYakwanScreen';
import MyPWModifyScreen from './Tabs01/MyPWModifyScreen';


const MyPWModifyStack = ({navigation,route}) => {
    //console.log(';ProductListStack',route)    
    let navTitle = '비밀번호 변경';
    return (
        <Stack.Navigator
            initialRouteName={'MyPWModifyScreen'}
            screenOptions={{
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
        
        <Stack.Screen name="MyPWModifyScreen" >
            {props => <MyPWModifyScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const DeclarationStack = ({navigation,route}) => {
    //console.log(';ProductListStack',route)    
    let navTitle = '유저 신고';
    return (
        <Stack.Navigator
            initialRouteName={'DeclarationScreen'}
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
        <Stack.Screen name="DeclarationScreen" >
            {props => <DeclarationScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const ChatRoomStack = ({navigation,route}) => {
    //console.log(';ProductListStack',route)    
    let navTitle = '채팅룸';
    return (
        <Stack.Navigator
            initialRouteName={'ChatRoomScreen'}
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
        
        <Stack.Screen name="ChatRoomScreen" >
            {props => <ChatRoomScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const ChatStack = ({navigation,route}) => {
    //console.log(';ProductListStack',route.params)
    let navTitle = CommonUtil.isEmpty(route.params.uname) ? '개별채팅룸' : route.params.uname;
    let subnavTitle =  route.params.address + " | " + route.params.tel;
    let inNotProfile = CommonUtil.isEmpty(route.params.imgurl) ? true : false
    console.log(';route.params.imgurl',route.params.imgurl)
    return (
        <Stack.Navigator
            initialRouteName={'ChatScreen'}
            screenOptions={{
                headerStyle: {shadowColor: 'transparent',elevation: 0,shadowOpacity: 0,borderBottomWidth: 0},
                headerLeft: (props) => (
                    <View style={{flex:2,flexGrow:1,paddingLeft:20,flexDirection:'row',alignItems:'center'}}>
                         <Image 
                            source={inNotProfile ? DEFAULT_PROFILE_IMAGE :  {uri:route.params.imgurl}} 
                            style={[CommonStyle.backButtonWrap,{borderRadius:20}]} 
                            resizeMode={'cover'} 
                        />
                         <View style={{paddingLeft:10}}>
                            <CustomTextB style={[CommonStyle.textSize13,CommonStyle.fontColor000]}>{navTitle}</CustomTextB>
                            {
                            (!CommonUtil.isEmpty(route.params.address) && route.params.user_type === 'A') &&
                            <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>{subnavTitle}</CustomTextR>
                            }
                         </View>
                        
                    </View>
                ),
                
                headerTitle : (props) => (
                    <View style={{flex:0.2,flexGrow:1}} />
                ),
                headerRight : (props) => (
                    <TouchableOpacity onPress= {()=> navigation.goBack()} style={CommonStyle.stackHeaderRightWrap}>
                        <Image source={CLOSE_BUTTON_IMAGE} style={CommonStyle.backButtonWrap} />
                    </TouchableOpacity> 
                ), 
            }}
            
        >
        
        <Stack.Screen name="ChatScreen" >
            {props => <ChatScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const UserDefaultDetailStack = ({navigation,route}) => {
    //console.log(';ProductListStack',route)    
    let navTitle = '계정관리(일반)';
    return (
        <Stack.Navigator
            initialRouteName={'UserDefaultDetailScreen'}
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
        
        <Stack.Screen name="UserDefaultDetailScreen" >
            {props => <UserDefaultDetailScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};


const UserAgentDetailStack = ({navigation,route}) => {
    //console.log(';ProductListStack',route)    
    let navTitle = '계정관리(중개인)';
    return (
        <Stack.Navigator
            initialRouteName={'UserAgentDetailScreen'}
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
        
        <Stack.Screen name="UserAgentDetailScreen" >
            {props => <UserAgentDetailScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const NoticeListStack = ({navigation,route}) => {
    //console.log(';NoticeListStack',route)    
    let navTitle = '알림';
    return (
        <Stack.Navigator
            initialRouteName={'NoticeListScreen'}
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
        
        <Stack.Screen name="NoticeListScreen" >
            {props => <NoticeListScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};
const NoticeDetailStack = ({navigation,route}) => {
    //console.log(';NoticeListStack',route)    
    let navTitle = '알림상세';
    return (
        <Stack.Navigator
            initialRouteName={'NoticeDetailScreen'}
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
        
        <Stack.Screen name="NoticeDetailScreen" >
            {props => <NoticeDetailScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const RequestStack = ({navigation,route}) => {
    //console.log(';NoticeListStack',route)    
    let navTitle = '고객센터 문의하기';
    return (
        <Stack.Navigator
            initialRouteName={'RequestScreen'}
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
        
        <Stack.Screen name="RequestScreen" >
            {props => <RequestScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};
const SettleStack = ({navigation,route}) => {
   
    return (
        <Stack.Navigator
            initialRouteName={'SettleScreen'}
            screenOptions={{          
                headerShown: false
            }}
        >
        
        <Stack.Screen name="SettleScreen" >
            {props => <SettleScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );

};

const SettleAgentStack = ({navigation,route}) => {
    //console.log(';NoticeListStack',route)       
    return (
        <Stack.Navigator
            initialRouteName={'SettleAgentScreen'}
            screenOptions={{          
                headerShown: false
            }}
        >
        
        <Stack.Screen name="SettleAgentScreen" >
            {props => <SettleAgentScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const AgentShopStack = ({navigation,route}) => {
    //console.log(';NoticeListStack',route)        
    return (
        <Stack.Navigator
            initialRouteName={'AgentShopScreen'}
            screenOptions={{          
                headerShown: false
            }}
        >
        
        <Stack.Screen name="AgentShopScreen" >
            {props => <AgentShopScreen {...props} extraData={route} />}
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

export {ChatRoomStack,ChatStack,UserDefaultDetailStack,UserAgentDetailStack,NoticeListStack,NoticeDetailStack ,RequestStack,SettleStack,SettleAgentStack,AgentShopStack,UseYakwanStack,PrivateYakwanStack,DeclarationStack,MyPWModifyStack} ;