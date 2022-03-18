import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {useSelector,useDispatch} from 'react-redux';
import ActionCreator from '../Ducks/Actions/MainActions';
//공통상수 필요에 의해서 사용
import  * as getDEFAULT_CONSTANTS   from '../Constants';
const DEFAULT_CONSTANTS = getDEFAULT_CONSTANTS.DEFAULT_CONSTANTS;
const DEFAULT_TEXT = getDEFAULT_CONSTANTS.DEFAULT_TEXT;
const DEFAULT_COLOR = getDEFAULT_CONSTANTS.DEFAULT_COLOR;
import CommonUtil from '../Utils/CommonUtil';
import CommonFunction from '../Utils/CommonFunction';
import {CustomTextB} from '../Components/CustomText';
/* 로그인 홈 */
import MainHomeStack from '../Screens/IntroScreen';
import AuthStack from '../Screens/Auth/IntroScreen';
import NewHomeStack from '../Screens/Auth/NewIntroScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const AuthScreenStack = ({navigation,route,rootState}) => {
   
    return (
        <Stack.Navigator
            initialRouteName="AuthStack"
            screenOptions={{headerShown: false}}
        >
        <Stack.Screen name="AuthStack" >
          {props => <AuthStack {...props} extraData={route} rootState={rootState} />} 
        </Stack.Screen>
      </Stack.Navigator>
    );
};

const HomeScreenStack = ({navigation,route,rootState}) => {
    return (
        <Stack.Navigator
            initialRouteName="NewHomeStack"
            screenOptions={{headerShown: false}}
        >
        <Stack.Screen name="NewHomeStack" >
          {props => <NewHomeStack {...props} extraData={route} rootState={rootState} />} 
        </Stack.Screen>
        <Stack.Screen name="MainHomeStack" >
          {props => <MainHomeStack {...props} extraData={route} rootState={rootState} />} 
        </Stack.Screen>
        
      </Stack.Navigator>
    );
};

export default function Navigation(props) {
    //const {userToken} = useContext(UserTokenContext);
    //const dispatch = useDispatch();
    //const userToken = useSelector((store) => store);
    //const reduxData = useSelector(state => state);
    //const {userToken,nonUserToken} = reduxData.GlabalStatus;
    
    
    /* if ( CommonUtil.isEmpty(nonUserToken) ) {
        return (      
            <NavigationContainer >
                <AuthScreenStack rootState={props.screenState} />
            </NavigationContainer>
        );
    }else{
        return (    
            <NavigationContainer >
                <HomeScreenStack rootState={props.screenState} />
            </NavigationContainer>
        )
    } */

    return (    
        <NavigationContainer >
            <HomeScreenStack rootState={props.screenState} />
        </NavigationContainer>
    )
    
}

