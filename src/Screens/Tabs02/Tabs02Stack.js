import React from 'react';
import {SafeAreaView,Image,View,Alert,TouchableOpacity,Dimensions,Platform,TouchableHighlight} from 'react-native';
import {createStackNavigator, HeaderTitle} from '@react-navigation/stack';
import {useSelector,useDispatch} from 'react-redux';
import ActionCreator from '../../Ducks/Actions/MainActions';

const Stack = createStackNavigator();
const BACK_BUTTON_IMAGE = require('../../../assets/icons/back_icon.png');
const LOGO_IMAGE = require('../../../assets/icons/top_logo.png');
const USER_IMAGE_OFF = require('../../../assets/icons/icon_user_off.png');
const USER_IMAGE_ON = require('../../../assets/icons/icon_user_on.png');
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

//import IntroScreen from './IntroScreen'; 
import IntroNaverScreen from './IntroNaverScreen2'; 


const Tabs02Stack = ({navigation,route}) => {
    const dispatch = useDispatch();
    const reduxData = useSelector(state => state);
    const {userToken,userCartCount} = reduxData.GlabalStatus;

    const loginAlert = async() => {
       
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
                navigation.popToTop();
            }, 500);
        } else {
            console.log('option else')
        }
    }
    return (
      <Stack.Navigator 
        initialRouteName="IntroNaverScreen" 
        screenOptions={{          
            headerShown: false
        }}
      >
          <Stack.Screen name="IntroNaverScreen">
                {props => <IntroNaverScreen {...props} extraData={route} />}
          </Stack.Screen>     
      </Stack.Navigator>
    );
};

export default Tabs02Stack;
