import React from 'react';
import {createStackNavigator,SafeAreaView} from '@react-navigation/stack';
const Stack = createStackNavigator();

import SignUpScreen from './SignUpScreen'; //로그인페이지
import HomeScreen from '../Home/HomeScreen'; //로그인페이지
import {LoginPopStack,SignInStack,SignInStep01Stack,SignInStep02Stack,SignInStep03AStack,SignInStep03BStack,UseYakwanStack,PrivateYakwanStack,MarketingStack,PWResetStack} from './AuthRouteStack'; //로그인페이지


const AuthStack = ({navigation,route,rootState}) => {
    
    return (
        <Stack.Navigator initialRouteName="HomeScreen" screenOptions={{headerShown: false}}>
            <Stack.Screen name="HomeScreen" >
                {props => <HomeScreen {...props} extraData={route} rootState={rootState} />}
            </Stack.Screen>
            <Stack.Screen name="SignInStack"  >
                {props => <SignInStack {...props} extraData={route} rootState={rootState} />}
            </Stack.Screen> 
            <Stack.Screen name="LoginPopStack"  >
                {props => <LoginPopStack {...props} extraData={route} rootState={rootState} />}
            </Stack.Screen> 
            <Stack.Screen name="SignUpScreen" >
                {props => <SignUpScreen {...props} extraData={route} rootState={rootState} />}
            </Stack.Screen> 
            <Stack.Screen name="SignInStep01Stack"  >
                {props => <SignInStep01Stack {...props} extraData={route} rootState={rootState} />}
            </Stack.Screen> 
            <Stack.Screen name="SignInStep02Stack"  >
                {props => <SignInStep02Stack {...props} extraData={route} rootState={rootState} />}
            </Stack.Screen> 
            <Stack.Screen name="SignInStep03AStack"  >
                {props => <SignInStep03AStack {...props} extraData={route} rootState={rootState} />}
            </Stack.Screen> 
            <Stack.Screen name="SignInStep03BStack"  >
                {props => <SignInStep03BStack {...props} extraData={route} rootState={rootState} />}
            </Stack.Screen> 
            <Stack.Screen name="UseYakwanStack"  >
                {props => <UseYakwanStack {...props} extraData={route} rootState={rootState} />}
            </Stack.Screen> 
            <Stack.Screen name="PrivateYakwanStack"  >
                {props => <PrivateYakwanStack {...props} extraData={route} rootState={rootState} />}
            </Stack.Screen> 
            <Stack.Screen name="MarketingStack"  >
                {props => <MarketingStack {...props} extraData={route} rootState={rootState} />}
            </Stack.Screen> 
            <Stack.Screen name="PWResetStack"  >
                {props => <PWResetStack {...props} extraData={route} rootState={rootState} />}
            </Stack.Screen> 

        </Stack.Navigator>
    );
};

export default AuthStack;