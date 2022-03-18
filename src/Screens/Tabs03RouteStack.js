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

const BACK_BUTTON_IMAGE = require('../../assets/icons/back_icon2.png');


import HouseStoryRegistScreen from './Tabs03/HouseStoryRegistScreen';
import HouseStoryModifyScreen from './Tabs03/HouseStoryModifyScreen';
import HouseStoryDetailScreen from './Tabs03/HouseStoryDetailScreen';

import NewHouseStoryRegistScreen from './TabsN01/HouseStoryRegistScreen';
import NewHouseStoryModifyScreen from './TabsN01/HouseStoryModifyScreen';
import NewHouseStoryDetailScreen from './TabsN01/HouseStoryDetailScreen';

const NewHouseStoryDetailStack = ({navigation,route}) => {
    //console.log(';NewHouseStoryDetailStack',route.params.screenData.board_type)    
    let navTitle = '자유게시판';
    return (
        <Stack.Navigator
            initialRouteName={'NewHouseStoryDetailScreen'}
            screenOptions={{          
                headerShown: false
            }}
        >
        
        <Stack.Screen name="NewHouseStoryDetailScreen" >
            {props => <NewHouseStoryDetailScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};


const NewHouseStoryModifyStack = ({navigation,route}) => {    
    let navTitle = '글수정';
    return (
        <Stack.Navigator
            initialRouteName={'NewHouseStoryModifyScreen'}
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
        
        <Stack.Screen name="NewHouseStoryModifyScreen" >
            {props => <NewHouseStoryModifyScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const NewHouseStoryRegistStack = ({navigation,route}) => {    
    let navTitle = '글작성';
    return (
        <Stack.Navigator
            initialRouteName={'NewHouseStoryRegistScreen'}
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
        
        <Stack.Screen name="NewHouseStoryRegistScreen" >
            {props => <NewHouseStoryRegistScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const HouseStoryRegistStack = ({navigation,route}) => {
    //console.log(';ProductListStack',route)    
    let navTitle = '글작성';
    return (
        <Stack.Navigator
            initialRouteName={'HouseStoryRegistScreen'}
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
        
        <Stack.Screen name="HouseStoryRegistScreen" >
            {props => <HouseStoryRegistScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const HouseStoryModifyStack = ({navigation,route}) => {
    //console.log(';ProductListStack',route)    
    let navTitle = '글수정';
    return (
        <Stack.Navigator
            initialRouteName={'HouseStoryModifyScreen'}
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
        
        <Stack.Screen name="HouseStoryModifyScreen" >
            {props => <HouseStoryModifyScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};

const HouseStoryDetailStack = ({navigation,route}) => {
    //console.log(';ProductListStack',route)    
    let navTitle = '부동산 이야기';
    return (
        <Stack.Navigator
            initialRouteName={'HouseStoryDetailScreen'}
            screenOptions={{          
                headerShown: false
            }}
            
        >
        
        <Stack.Screen name="HouseStoryDetailScreen" >
            {props => <HouseStoryDetailScreen {...props} extraData={route} />}
        </Stack.Screen>         
        </Stack.Navigator>
    );
};


export {NewHouseStoryDetailStack,NewHouseStoryModifyStack,NewHouseStoryRegistStack,HouseStoryRegistStack,HouseStoryDetailStack,HouseStoryModifyStack} ;