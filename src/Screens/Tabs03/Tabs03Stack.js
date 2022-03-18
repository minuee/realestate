import React from 'react';
import {SafeAreaView,Image,View,Alert,TouchableOpacity,Dimensions,Platform,TouchableHighlight} from 'react-native';
import {createStackNavigator, HeaderTitle,CardStyleInterpolators} from '@react-navigation/stack';
import {useSelector,useDispatch} from 'react-redux';
import ActionCreator from '../../Ducks/Actions/MainActions';
const Stack = createStackNavigator();
const Write_BUTTON_IMAGE = require('../../../assets/icons/icon_pencil.png');
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
import IntroScreen from './IntroScreen'; 

const Tabs03Stack = ({navigation,route}) => {
    const dispatch = useDispatch();
    const reduxData = useSelector(state => state);
    const {userToken,userCartCount} = reduxData.GlabalStatus;

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
                    navigation.navigate('LoginPopStack');
                }, 500);
                
            } else {
                console.log('option else')
            }
        }else{
            navigation.navigate('HouseStoryRegistStack');
        }
    }
    return (
      <Stack.Navigator 
        initialRouteName="IntroScreen" 
        screenOptions={{
            headerStyle: {shadowColor: 'transparent',elevation: 0,shadowOpacity: 0,borderBottomWidth: 0},
            headerLeft: (props) => (
                <View style={CommonStyle.stackHeaderLeftWrap} />
            ),
            
            headerTitle : (props) => (
                <View style={CommonStyle.stackHeaderCenterWrap}>
                    <CustomTextB style={CommonStyle.stackHeaderCenterText}>부동산 이야기</CustomTextB>
                </View>
            ),
            headerRight : (props) => (
                <TouchableOpacity onPress= {()=> loginAlert()} style={[CommonStyle.stackHeaderRightWrap,{flexDirection:'row',alignItems:'center'}]}>
                    <Image source={Write_BUTTON_IMAGE} style={{width:CommonUtil.dpToSize(12),height:CommonUtil.dpToSize(12)}} />
                    <CustomTextB style={[CommonStyle.textSize12,CommonStyle.fontColorBase]}>{" "}글작성</CustomTextB>
                </TouchableOpacity> 
            ), 
        }}
      >
          <Stack.Screen name="IntroScreen" options={{headerShown: true}}>
                {props => <IntroScreen {...props} extraData={route} />}
          </Stack.Screen>     
      </Stack.Navigator>
    );
};

export default Tabs03Stack;
