import React, { Component } from 'react';
import {ScrollView,View,StyleSheet,Platform,Image,PixelRatio} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
Icon.loadFont();
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {connect} from 'react-redux';
import ActionCreator from '../Ducks/Actions/MainActions';
const Tab = createBottomTabNavigator();
import AsyncStorage from '@react-native-community/async-storage';
//공통상수
import  * as getDEFAULT_CONSTANTS   from '../Constants';
const DEFAULT_CONSTANTS = getDEFAULT_CONSTANTS.DEFAULT_CONSTANTS;
const DEFAULT_TEXT = getDEFAULT_CONSTANTS.DEFAULT_TEXT;
const DEFAULT_COLOR = getDEFAULT_CONSTANTS.DEFAULT_COLOR;
import CommonUtil from '../Utils/CommonUtil';

//Tabs 01
import Tabs01NewStack from './TabsN01/IntroStack'; 
//Tabs 01
import Tabs02Stack from './Tabs02/Tabs02Stack'; 
//Tabs 03
import Tabs01Stack from './Tabs01/Tabs01Stack'; 
//Tabs 02
import Tabs02NewStack from './TabsN02/IntroStack'; 
//Tabs 04
import Tabs04NewStack from './TabsN04/IntroStack'; 

import { CustomTextR,CustomTextB } from '../Components/CustomText';


const NewTab01ON = require('../../assets/tabs/tabs01_on.png');
const NewTab01OFF = require('../../assets/tabs/tabs01_off.png');
const NewTab02ON = require('../../assets/tabs/tabs02_on.png');
const NewTab02OFF = require('../../assets/tabs/tabs02_off.png');
const NewTab03ON = require('../../assets/tabs/tabs03_on.png');
const NewTab03OFF = require('../../assets/tabs/tabs03_off.png');
const NewTab04ON = require('../../assets/tabs/tabs04_on.png');
const NewTab04OFF = require('../../assets/tabs/tabs04_off.png');
const NewTab05ON = require('../../assets/tabs/tabs05_on.png');
const NewTab05OFF = require('../../assets/tabs/tabs05_off.png');

class MainNewScreen extends React.PureComponent {

    constructor(props) {
        super(props);        
        this.state = {
            initialRouteName : 'Tabs01NewStack'
        }

        //console.log('MainNewScreen',this.props.userBaseData)
    }

    async UNSAFE_componentWillMount() {
        const saveUserToken = await AsyncStorage.getItem('saveUserToken');
        if(!CommonUtil.isEmpty(saveUserToken) ) {            
            this.props._saveUserToken(JSON.parse(saveUserToken));
        }

        
    }

    CustomTabsLabel = (str,tcolor = '#fff' ) => {                    
        return (
            <CustomTextR style={[styles.labelText,{color:tcolor}]}>{str}</CustomTextR>
        )
    }

    render() {
        return(
            <Tab.Navigator
                initialRouteName={this.props.rootStack}
                tabBarOptions={{
                    activeTintColor: DEFAULT_COLOR.base_color,
                    activeBackgroundColor: '#ffffff',
                    inactiveBackgroundColor: '#ffffff',
                    inactiveTintColor:  '#979797',
                    showLabel: false,
                    style:{minHeight:Platform.OS === 'android' ? 60 : 50}
                }}
            >
                <Tab.Screen
                    name="Tabs01NewStack"                  
                    options={(navigation) => ({
                        tabBarLabel: ({color})=>this.CustomTabsLabel('게시판',color),
                        tabBarIcon: ({color}) => 
                        <Image 
                        source={color === DEFAULT_COLOR.base_color ? NewTab01ON : NewTab01OFF}
                            style={Platform.OS === 'ios' ? styles.tabsWrapiOS2 : styles.tabsWrapAndroid2}
                        />,
                    })}
                >
                    {props => <Tabs01NewStack {...props} screenState={this.state} screenProps={this.props} />}
                </Tab.Screen>
                <Tab.Screen
                    name="Tabs02NewStack"
                    component={Tabs02NewStack}
                    options={{    
                        tabBarLabel: ({color})=>this.CustomTabsLabel('목록찾기',color),
                        tabBarIcon: ({color}) => (
                            <View style={styles.tabBaseWrap}>
                                <Image 
                                    source={color === DEFAULT_COLOR.base_color ? NewTab02ON : NewTab02OFF}
                                    resizeMode={'contain'}
                                    style={Platform.OS === 'ios' ? styles.tabsWrapiOS2 : styles.tabsWrapAndroid2}
                                />
                            </View>
                        ),
                    }}
                />
                <Tab.Screen
                    name="Tabs02Stack"
                    component={Tabs02Stack}                    
                    options={{                        
                        tabBarLabel: ({color})=>this.CustomTabsLabel('주변찾기',color),
                        tabBarIcon: ({color}) => (
                            <View style={styles.tabBaseWrap}>
                                <Image 
                                    source={color === DEFAULT_COLOR.base_color ? NewTab03ON : NewTab03OFF }
                                    resizeMode={'contain'}
                                    style={Platform.OS === 'ios' ? styles.tabsWrapiOS2 : styles.tabsWrapAndroid2}
                                />
                            </View>
                        )
                    }}
                />
                <Tab.Screen
                    name="Tabs04NewStack"
                    component={Tabs04NewStack}                    
                    options={{                        
                        tabBarLabel: ({color})=>this.CustomTabsLabel('채팅',color),
                        tabBarIcon: ({color}) => (
                            <View style={styles.tabBaseWrap}>
                                <Image 
                                    source={color === DEFAULT_COLOR.base_color ? NewTab04ON : NewTab04OFF}
                                    resizeMode={'contain'}
                                    style={Platform.OS === 'ios' ? styles.tabsWrapiOS2 : styles.tabsWrapAndroid2}
                                />
                                { 
                                    !CommonUtil.isEmpty(this.props.userBaseData?.userData) ?
                                    this.props.userBaseData.userData.unread_count > 0 &&
                                    <View style={styles.chatTextWrap}>
                                        <CustomTextB style={styles.chatText}>
                                            {this.props.userBaseData.userData.unread_count}
                                        </CustomTextB>
                                    </View>
                                :
                                    null
                                }
                            </View>
                        )
                    }}
                />
                <Tab.Screen
                    name="Tabs01Stack"
                    component={Tabs01Stack}                    
                    options={{                        
                        tabBarLabel: ({color})=>this.CustomTabsLabel('내정보',color),
                        tabBarIcon: ({color}) => (
                            <View style={styles.tabBaseWrap}>
                                <Image 
                                    source={color === DEFAULT_COLOR.base_color ? NewTab05ON : NewTab05OFF}
                                    resizeMode={'contain'}
                                    style={Platform.OS === 'ios' ? styles.tabsWrapiOS2 : styles.tabsWrapAndroid2}
                                />
                            </View>
                        )
                    }}
                />
            </Tab.Navigator>
        );
    }
    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    chatText : {
        fontSize : DEFAULT_TEXT.fontSize9,        
        margin : 0,padding:0,
        color:'#ffffff'
    },
    labelText : { 
        fontSize : DEFAULT_TEXT.fontSize13,        
        margin : 0,padding:0,
        paddingTop:2,
        ...Platform.select({
            ios : {
                marginTop:-5,
                marginBottom:5
            },
            android : {
                marginTop:-17,
                marginBottom:0
            }
        })
    },
    tabBaseWrap : {
        flex:1,justifyContent:'center',alignItems:'center'
    },
    chatTextWrap : {
        position:'absolute',top:0,right:-5,width:16,height:16,backgroundColor:'#ff0000',borderRadius:8,justifyContent:'center',alignItems:'center',zIndex:2,overflow:'hidden'
    },
    tabsWrapAndroid : {
        width:CommonUtil.dpToSize(30),height:CommonUtil.dpToSize(30)
    },
    tabsWrapiOS : {
        width:CommonUtil.dpToSize(30),height:CommonUtil.dpToSize(30)
    },
    tabsWrapAndroid2 : {
        width:CommonUtil.dpToSize(72*0.9),height:CommonUtil.dpToSize(55*0.9)
    },
    tabsWrapiOS2 : {
        width:CommonUtil.dpToSize(72*0.85),height:CommonUtil.dpToSize(55*0.85)
    }
});


function mapStateToProps(state) {
    return {
        userToken : state.GlabalStatus.userToken,
        rootStack : state.GlabalStatus.rootStack,
        userBaseData : state.GlabalStatus.userBaseData
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
        
    };
}


export default connect(mapStateToProps,mapDispatchToProps)(MainNewScreen);