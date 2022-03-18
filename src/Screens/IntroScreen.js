import React from 'react';
import {createStackNavigator,SafeAreaView} from '@react-navigation/stack';
import {useSelector,useDispatch} from 'react-redux';
import ActionCreator from '../Ducks/Actions/MainActions';
const Stack = createStackNavigator();
import CommonUtil from '../Utils/CommonUtil';
//import MainScreen from './MainScreen'; 
import MainScreen from './MainNewScreen'; 
import SampleScreen from '../Utils/SampleScreen'; 

import { ChatRoomStack,ChatStack,UserDefaultDetailStack,UserAgentDetailStack,NoticeListStack,NoticeDetailStack,RequestStack,SettleStack,SettleAgentStack,AgentShopStack,UseYakwanStack ,PrivateYakwanStack,DeclarationStack,MyPWModifyStack}  from './Tabs01RouteStack';
import { TodayFastRentStack,TodayFastDealStack,SearchFormStack,SearchFormStack2,SetupCondtionStack,SetupYearStack,SetupHeiboStack,SetupHouseholdStack,ApartDetailStack,StoryDetailStack,StoryRegistStack,NaverMapStack,AgentListStack,AgentDetailStack }  from './Tabs02RouteStack';
import { NewHouseStoryDetailStack,NewHouseStoryModifyStack,NewHouseStoryRegistStack,HouseStoryRegistStack,HouseStoryModifyStack,HouseStoryDetailStack }  from './Tabs03RouteStack';

import { LoginPopStack } from '../Screens/Auth/AuthRouteStack';

const MainStack = ({navigation,route,rootState}) => {
    
    const rootStateTmp = rootState;
    return (
        <Stack.Navigator 
            initialRouteName="MainScreen" 
            screenOptions={{headerShown: false}}
        >
            {/*<Stack.Screen name="MainScreen" component={MainScreen} options={{ headerShown: false, }} />*/}
            <Stack.Screen name="MainScreen" options={{ headerShown: false, }}>
                {props => <MainScreen {...props} extraData={route} rootState={rootStateTmp} />}
            </Stack.Screen>

            <Stack.Screen name="SampleScreen" >
                {props => <SampleScreen {...props} extraData={route} />}
            </Stack.Screen>
            <Stack.Screen name="NewHouseStoryDetailStack" >
                {props => <NewHouseStoryDetailStack {...props} extraData={route} />}
            </Stack.Screen> 
            <Stack.Screen name="NewHouseStoryModifyStack" >
                {props => <NewHouseStoryModifyStack {...props} extraData={route} />}
            </Stack.Screen> 
            <Stack.Screen name="NewHouseStoryRegistStack" >
                {props => <NewHouseStoryRegistStack {...props} extraData={route}  />}
            </Stack.Screen> 
            <Stack.Screen name="LoginPopStack" >
                {props => <LoginPopStack {...props} extraData={route} rootState={rootStateTmp} />}
            </Stack.Screen> 

            <Stack.Screen name="MyPWModifyStack" >
                {props => <MyPWModifyStack {...props} extraData={route} />}
            </Stack.Screen> 
            <Stack.Screen name="DeclarationStack" >
                {props => <DeclarationStack {...props} extraData={route} />}
            </Stack.Screen> 
            <Stack.Screen name="UseYakwanStack" >
                {props => <UseYakwanStack {...props} extraData={route} />}
            </Stack.Screen> 
            <Stack.Screen name="PrivateYakwanStack" >
                {props => <PrivateYakwanStack {...props} extraData={route} />}
            </Stack.Screen> 
            <Stack.Screen name="AgentShopStack" >
                {props => <AgentShopStack {...props} extraData={route} />}
            </Stack.Screen> 
            <Stack.Screen name="SettleStack" >
                {props => <SettleStack {...props} extraData={route} />}
            </Stack.Screen>
            <Stack.Screen name="SettleAgentStack" >
                {props => <SettleAgentStack {...props} extraData={route} />}
            </Stack.Screen> 
            <Stack.Screen name="RequestStack" >
                {props => <RequestStack {...props} extraData={route} />}
            </Stack.Screen> 
            <Stack.Screen name="NoticeListStack" >
                {props => <NoticeListStack {...props} extraData={route} />}
            </Stack.Screen> 
            <Stack.Screen name="NoticeDetailStack" >
                {props => <NoticeDetailStack {...props} extraData={route} />}
            </Stack.Screen> 
            <Stack.Screen name="UserAgentDetailStack" >
                {props => <UserAgentDetailStack {...props} extraData={route} />}
            </Stack.Screen> 
            <Stack.Screen name="UserDefaultDetailStack" >
                {props => <UserDefaultDetailStack {...props} extraData={route} />}
            </Stack.Screen> 
            <Stack.Screen name="ChatRoomStack" >
                {props => <ChatRoomStack {...props} extraData={route} />}
            </Stack.Screen> 
            <Stack.Screen name="ChatStack" >
                {props => <ChatStack {...props} extraData={route} />}
            </Stack.Screen>        
            <Stack.Screen name="ApartDetailStack" >
            {props => <ApartDetailStack {...props} extraData={route} />}
            </Stack.Screen>
            <Stack.Screen name="StoryDetailStack" >
            {props => <StoryDetailStack {...props} extraData={route} />}
            </Stack.Screen>
            <Stack.Screen name="StoryRegistStack" >
            {props => <StoryRegistStack {...props} extraData={route} />}
            </Stack.Screen>
            <Stack.Screen name="TodayFastDealStack" >
            {props => <TodayFastDealStack {...props} extraData={route} />}
            </Stack.Screen> 
            <Stack.Screen name="TodayFastRentStack" >
            {props => <TodayFastRentStack {...props} extraData={route} />}
            </Stack.Screen> 
            <Stack.Screen name="SearchFormStack" >
            {props => <SearchFormStack {...props} extraData={route} />}
            </Stack.Screen> 
            <Stack.Screen name="SearchFormStack2" >
            {props => <SearchFormStack2 {...props} extraData={route} />}
            </Stack.Screen> 
            <Stack.Screen name="SetupCondtionStack" >
            {props => <SetupCondtionStack {...props} extraData={route} />}
            </Stack.Screen> 
            <Stack.Screen name="SetupYearStack" >
            {props => <SetupYearStack {...props} extraData={route} />}
            </Stack.Screen> 
            <Stack.Screen name="AgentListStack" >
            {props => <AgentListStack {...props} extraData={route} />}
            </Stack.Screen>
            <Stack.Screen name="AgentDetailStack" >
            {props => <AgentDetailStack {...props} extraData={route} />}
            </Stack.Screen>

            <Stack.Screen name="SetupHeiboStack" >
            {props => <SetupHeiboStack {...props} extraData={route} />}
            </Stack.Screen> 
            <Stack.Screen name="SetupHouseholdStack" >
            {props => <SetupHouseholdStack {...props} extraData={route} />}
            </Stack.Screen> 
            <Stack.Screen name="NaverMapStack" >
            {props => <NaverMapStack {...props} extraData={route} />}
            </Stack.Screen>
            <Stack.Screen name="HouseStoryRegistStack" >
            {props => <HouseStoryRegistStack {...props} extraData={route} />}
            </Stack.Screen> 
            <Stack.Screen name="HouseStoryModifyStack" >
            {props => <HouseStoryModifyStack {...props} extraData={route} />}
            </Stack.Screen> 
            <Stack.Screen name="HouseStoryDetailStack" >
            {props => <HouseStoryDetailStack {...props} extraData={route} />}
            </Stack.Screen> 
            
        </Stack.Navigator>
    );
};

export default MainStack;
