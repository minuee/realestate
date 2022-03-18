import React, { Component } from 'react';
import {ActivityIndicator,SafeAreaView,ScrollView,View,StyleSheet,Alert,Dimensions,Linking, PixelRatio,Image,TouchableOpacity,ImageBackground, Platform} from 'react-native';
import {connect} from 'react-redux';
import ActionCreator from '../../Ducks/Actions/MainActions';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import AsyncStorage from '@react-native-community/async-storage';
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info'
import VersionCheck from "react-native-version-check";
import RNExitApp from 'react-native-exit-app';
//공통상수 필요에 의해서 사용
import  * as getDEFAULT_CONSTANTS   from '../../Constants';
import CommonStyle from '../../Style/CommonStyle';
const DEFAULT_CONSTANTS = getDEFAULT_CONSTANTS.DEFAULT_CONSTANTS;
const DEFAULT_TEXT = getDEFAULT_CONSTANTS.DEFAULT_TEXT;
const DEFAULT_COLOR = getDEFAULT_CONSTANTS.DEFAULT_COLOR;
const {height: SCREEN_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('window');
import {CustomTextR,CustomTextL, CustomTextB, CustomTextM, TextRobotoB,TextRobotoM,TextRobotoR} from '../../Components/CustomText';
import CustomAlert from '../../Components/CustomAlert';
import CommonFunction from '../../Utils/CommonFunction';
import CheckConnection from '../../Components/CheckConnection';
import CommonUtil from '../../Utils/CommonUtil';
import AppLink from '../../Utils/AppLink';
const DEFAULT_PROFILE_IMAGE =  require('../../../assets/icons/default_profile.png')
const BTN_NEXT_ARROW = require('../../../assets/icons/arrow_right.png');
const CHECKBOX_TOGGLE_ON = require('../../../assets/icons/toggle_on.png');
const CHECKBOX_TOGGLE_OFF = require('../../../assets/icons/toggle_off.png');
import { apiObject } from "../../Apis/Member";
import { Auth, CurrentAuthUiState, AuthType } from "@psyrenpark/auth";
const todays = new Date();
const topicTimes = todays.getHours();
class IntroScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : true,
            moreLoading:false,
            userData : {},
            isPush : true
        }
    }

    getInformation = async ( member_pk ) => {
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_memberDetail({
                locale: "ko",
                member_pk
            });            
            if ( returnCode.code === '0000') {
                this.setState({
                    loading:false,
                    userData: returnCode.data,
                    isPush : returnCode.data.is_notification
                })
                /* this.props._updateUserBaseDataDirect({
                    userData: returnCode.data,
                    isPush : returnCode.data.is_notification
                }) */
            }
        }catch(e){
            this.setState({loading:false})
        }
    }
  
    async UNSAFE_componentWillMount() {
        if ( !CommonUtil.isEmpty(this.props.userToken.member_pk)) {
            if ( this.props.userToken.member_pk !== undefined) {
                await this.getInformation(this.props.userToken.member_pk); 
            }else{
                CommonFunction.fn_call_toast('잘못된 접근입니다',1500)
                setTimeout(() => {
                   this.props.navigation.goBack(nuull)
                }, 1500);
            }
        }else{
            setTimeout(() => {
                this.setState({loading:false})
            }, 1000);
        }  
        this.props.navigation.addListener('focus', () => {   
            if ( !CommonUtil.isEmpty(this.props.userToken.member_pk)) {
                this.getInformation(this.props.userToken.member_pk);       
            }     
        })
    }

    componentDidMount() {
        console.log('Platform>>>', Platform.OS);
        console.log('DeviceInfo>>>', DeviceInfo.getVersion());
        //패키지명
        console.log('getPackageName>>>', VersionCheck.getPackageName());
        //현재 버전
        console.log('getCurrentVersion>>>', VersionCheck.getCurrentVersion());
        //현재 빌드번호
        console.log('getCurrentBuildNumber>>>', VersionCheck.getCurrentBuildNumber());
    }
    
    logoutAction = async() => {
        Auth.signOutProcess(
            {
              authType: AuthType.EMAIL,
            },
            async (data) => {
                this.props._saveNonUserToken({});
                this.props._saveUserToken({});
                await AsyncStorage.removeItem('autoLogin');
                await AsyncStorage.removeItem('saveUserToken');      
                setTimeout(() => {
                    //this.props.navigation.popToTop();
                    this.props.navigation.navigate('LoginPopStack');       
                }, 1000);
            },
            (error) => {
                // 실패처리,
                CommonFunction.fn_call_toast('로그아웃이 실패하였습니다.',2000)
            },
            null
        );
    }

    logout = () => {
        Alert.alert(
            DEFAULT_CONSTANTS.appName,      
            "로그아웃하시겠습니까?",
            [
                {text: '네', onPress: () => this.logoutAction()},
                {text: '아니오', onPress: () => console.log('Cancle')},
            ],
            { cancelable: true }
        ) 
    }
    moveUserDetail = () => {
        const nav =  this.state.userData.user_type === 'N' ? 'UserDefaultDetailStack' : 'UserAgentDetailStack';
        this.props.navigation.navigate(nav,{
            screenTitle:this.state.userData
        })
    }

    moveDetail = (nav,item) => {
        if (  nav === 'AgentShopStack'  ) {
            if ( this.state.userData.is_status === 'reject' ) {
                CommonFunction.fn_call_toast('착한 중개인 신청이 거절되었습니다. 승인요청을 진행하세요',1500);
                setTimeout(
                    () => {            
                        this.props.navigation.navigate(nav,{
                            screenTitle:item,screenData:this.state.userData
                        })
                    },1500
                )
                return; 
            }else{
                this.props.navigation.navigate(nav,{
                    screenTitle:item,screenData:this.state.userData
                })
            }
        }else if ( nav === 'ChatRoomStack' ) {
            if ( this.state.userData.user_type === 'A') {
                if ( this.state.userData.is_status === 'use' && this.state.userData.agent_status === 'approval') {
                    this.props.navigation.navigate(nav,{
                        screenTitle:item,screenData:this.state.userData,isFromMypage : true
                    })
                }else if ( this.state.userData.is_status === 'reject') {
                    CommonFunction.fn_call_toast('착한 중개인 신청이 거절되었습니다. 관리자에게 문의하세요',2000);
                    return;
                }else{
                    CommonFunction.fn_call_toast('승인대기중입니다. 승인후 이용하실 수 있습니다.',2000);
                    return;
                }
            }else{
                this.props.navigation.navigate(nav,{
                    screenTitle:item,screenData:this.state.userData,isFromMypage : true
                })
            }
        }else if ( nav === 'SettleStack' ) {
            if ( this.state.userData.user_type == 'A') {
                this.props.navigation.navigate('SettleAgentStack',{
                    screenTitle:item,screenData:this.state.userData
                })
            }else{
                this.props.navigation.navigate(nav,{
                    screenTitle:item,screenData:this.state.userData
                })
            }
        }else{
            this.props.navigation.navigate(nav,{
                screenTitle:item,screenData:this.state.userData
            })
        }
    }

    updatePushPermission = async(bool) => {
        this.setState({isPush : !bool,moreLoading:true})
        const fcmTopic = DEFAULT_CONSTANTS.fcmCommonTopic;
        const authStatus = await messaging().requestPermission();
        const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_updateNotification({
                locale: "ko",
                is_notification : !bool
            });
            if ( returnCode.code === '0000') {
                if (enabled) {
                    let timeTopic = 'realestate_2_5';
                    if ( topicTimes >= 5 && topicTimes < 8 ) {
                        timeTopic = 'realestate_5_8';
                    }else if ( topicTimes >= 8 && topicTimes < 9 ) {
                        timeTopic = 'realestate_8_11';
                    }else if ( topicTimes >= 10 && topicTimes < 14 ) {
                        timeTopic = 'realestate_11_14';
                    }else if ( topicTimes >= 14 && topicTimes < 17 ) {
                        timeTopic = 'realestate_14_17';
                    }else if ( topicTimes >= 17 && topicTimes < 20 ) {
                        timeTopic = 'realestate_17_20';
                    }else if ( topicTimes >= 20 && topicTimes < 23 ) {
                        timeTopic = 'realestate_20_23';
                    }else if ( topicTimes > 23 && topicTimes < 2 ) {
                        timeTopic = 'realestate_23_2';
                    }else{
                        timeTopic = 'realestate_2_5';
                    }
                    if ( bool === false ) {//푸시등록 토픽등록 
                        messaging().subscribeToTopic(timeTopic).then(() => {
                            //console.log('111',timeTopic)
                        }).catch(() => {
                            //console.log('222',timeTopic)
                        });
                    }else{
                        messaging().unsubscribeFromTopic(DEFAULT_CONSTANTS.fcmCommonTopic).then(() => {                            
                        }).catch(() => {});
                        messaging().unsubscribeFromTopic('realestate_2_5').then(() => {
                            //console.log('realestate_2_5 remove okay');
                        }).catch(() => {});
                        messaging().unsubscribeFromTopic('realestate_5_8').then(() => {
                            //console.log('realestate_5_8 remove okay');
                        }).catch(() => {});
                        messaging().unsubscribeFromTopic('realestate_8_11').then(() => {
                            //console.log('realestate_8_11 remove okay');
                        }).catch(() => {});
                        messaging().unsubscribeFromTopic('realestate_11_14').then(() => {
                            //console.log('realestate_11_14 remove okay');
                        }).catch(() => {});
                        messaging().unsubscribeFromTopic('realestate_14_17').then(() => {
                            //console.log('realestate_14_17 remove okay');
                        }).catch(() => {});
                        messaging().unsubscribeFromTopic('realestate_17_20').then(() => {
                            //console.log('realestate_17_20 remove okay');
                        }).catch(() => {});
                        messaging().unsubscribeFromTopic('realestate_20_23').then(() => {
                            //console.log('realestate_20_23 remove okay');
                        }).catch(() => {});
                    }
                }
                this.setState({
                    moreLoading:false
                })
            }
        }catch(e){
            this.setState({moreLoading:false})
        }
    }

    moveAppStore = async() => {
        const appStoreId = DEFAULT_CONSTANTS.iosAppStoreID;
        const playStoreId = DEFAULT_CONSTANTS.androidPackageName;
        if ( Platform.OS === 'ios') {
            AppLink.openInStore({ appStoreId}).then(() => {
                setTimeout(() => {
                    RNExitApp.exitApp()
                },1000)                
            })
            .catch((err) => {
                // handle error
            });
        }else{
            AppLink.openInStore({ playStoreId}).then(() => {
                RNExitApp.exitApp();
            })
            .catch((err) => {
            // handle error
            });
        }

        //openInStore(DEFAULT_CONSTANTS.appName,DEFAULT_CONSTANTS.iosAppStoreID,'en',DEFAULT_CONSTANTS.androidPackageName)
    }

    render() {
        if ( CommonUtil.isEmpty(this.props.userToken) ) {
            return(
                <SafeAreaView style={ styles.container }>
                    <View style={styles.nonUserWrap}>
                        <CustomTextR style={styles.menuTitleSubText}>로그인후 이용하실수 있습니다.</CustomTextR>   
                        <TouchableOpacity 
                            hitSlop={{left:10,right:10,bottom:10,top:10}}
                            style={styles.modalTail}
                            onPress={()=>this.logoutAction()}
                        > 
                            <View style={styles.moveButton}>
                                <CustomTextR style={{fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15),color:'#fff'}}>로그인</CustomTextR>
                            </View>
                        </TouchableOpacity> 
                    </View>
                    <View style={styles.nonUserlinkWrap} >  
                        <TouchableOpacity style={styles.boxSubWrap3} onPress={()=>this.moveDetail('UseYakwanStack','서비스 이용약관')}>
                            <View style={styles.boxLeftWrap}>
                                <View style={styles.navCommonLeftWrap}>
                                    <CustomTextR style={styles.menuTitleText}>서비스 이용약관</CustomTextR>                         
                                </View>
                                <View style={styles.navCommonRightWrap}>
                                    <Image
                                        source={BTN_NEXT_ARROW}
                                        resizeMode={"contain"}
                                        style={CommonStyle.defaultIconImage20}
                                    /> 
                                </View>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.boxSubWrap3} onPress={()=>this.moveDetail('PrivateYakwanStack','개인정보 취급방침')}>
                            <View style={styles.boxLeftWrap}>
                                <View style={{flex:5}}>
                                    <CustomTextR style={styles.menuTitleText}>개인정보 취급방침</CustomTextR>                         
                                </View>
                                <View style={styles.navCommonRightWrap}>
                                    <Image
                                        source={BTN_NEXT_ARROW}
                                        resizeMode={"contain"}
                                        style={CommonStyle.defaultIconImage20}
                                    /> 
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            )
        }else{
            if ( this.state.loading ) {
                return (
                    <SafeAreaView style={ styles.container }>
                        <CheckConnection />
                        <ActivityIndicator size="small" color={DEFAULT_COLOR.base_color} style={{paddingTop:100}} />
                    </SafeAreaView> 
                )
            }else {  
            return(
                <SafeAreaView style={ styles.container }>
                    <CheckConnection />
                    <ScrollView
                        ref={(ref) => {this.ScrollView = ref;}}
                        showsVerticalScrollIndicator={false}
                        indicatorStyle={'white'}
                        scrollEventThrottle={16}
                        keyboardDismissMode={'on-drag'}
                    >
                        <View style={styles.boxWrap}>
                            <View style={styles.boxLeftWrap}>
                                <View style={styles.profileImageWrap}>
                                { 
                                    !CommonUtil.isEmpty(this.state.userData.profile_url) ?
                                    this.state.userData.profile_url.includes('http') ?
                                    <Image
                                        source={{uri:this.state.userData.profile_url}}
                                        resizeMode={"cover"}
                                        style={[CommonStyle.defaultIconImage55,{borderRadius:28}]}
                                    />
                                    :
                                    <Image
                                        source={{uri:DEFAULT_CONSTANTS.imageBaseUrl + this.state.userData.profile_url}}
                                        resizeMode={"cover"}
                                        style={[CommonStyle.defaultIconImage55,{borderRadius:28}]}
                                    />  
                                    :
                                    <Image
                                        source={DEFAULT_PROFILE_IMAGE}
                                        resizeMode={"contain"}
                                        style={CommonStyle.defaultIconImage55}
                                    />  
                                }                     
                                </View>
                                <View style={styles.profileTextWrap}>
                                    <CustomTextR style={[CommonStyle.textSize16,CommonStyle.fontColor222]}>
                                        {this.state.userData.nickname}
                                    </CustomTextR>
                                    <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor999]}>
                                        {CommonFunction.fn_dataDecode(this.state.userData.uid)}
                                    </CustomTextR>
                                </View>    
                                <View style={styles.profileButtonWrap} >                                    
                                </View>                       
                            </View>
                            <TouchableOpacity style={styles.chatWrap} onPress={()=>this.moveDetail('ChatRoomStack','채팅룸')}>
                                <View style={styles.chatRowDefault}>
                                    <View style={styles.chartRowIconWrap}>
                                        <Image
                                            source={require('../../../assets/icons/icon_message.png')}
                                            resizeMode={"contain"}
                                            style={CommonStyle.defaultIconImage30}
                                        /> 
                                    </View>                      
                                </View>
                                <View style={styles.chatRowText}>
                                    <CustomTextB style={[CommonStyle.textSize13,CommonStyle.fontColorWhite]}>채팅하기</CustomTextB>                                    
                                </View> 
                                <View style={styles.chatRowDefault}>
                                    <View style={styles.unreadTextWrap}>
                                        <TextRobotoR style={[CommonStyle.textSize15,CommonStyle.fontColorBase]}>
                                            {CommonUtil.isEmpty(this.state.userData.unread_count) ? 0 : this.state.userData.unread_count}
                                        </TextRobotoR>
                                    </View>                      
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.linkWrap} >  
                            <TouchableOpacity style={styles.boxSubWrap} onPress={()=>this.moveUserDetail('UserAgentDetailStack','계정관리')}>
                                <View style={styles.boxLeftWrap}>
                                    <View style={styles.navCommonLeftWrap}>
                                        <CustomTextR style={styles.menuTitleText}>계정관리</CustomTextR>                         
                                    </View>
                                    <View style={styles.navCommonRightWrap}>
                                        <Image
                                            source={BTN_NEXT_ARROW}
                                            resizeMode={"contain"}
                                            style={CommonStyle.defaultIconImage20}
                                        /> 
                                    </View>
                                </View>
                            </TouchableOpacity>
                            {this.props.userToken.user_type === 'A' &&
                            <TouchableOpacity style={styles.boxSubWrap} onPress={()=>this.moveDetail('AgentShopStack','내 페이지 관리')}>
                                <View style={styles.boxLeftWrap}>
                                    <View style={styles.navCommonLeftWrap}>
                                        <CustomTextR style={styles.menuTitleText}>내 페이지 관리</CustomTextR>                         
                                    </View>
                                    <View style={styles.navCommonRightWrap}>
                                        <Image
                                            source={BTN_NEXT_ARROW}
                                            resizeMode={"contain"}
                                            style={CommonStyle.defaultIconImage20}
                                        /> 
                                    </View>
                                </View>
                            </TouchableOpacity>
                            }
                            {/* ( this.props.userToken.member_pk === '30636' || this.props.userToken.member_pk === '232' || this.props.userToken.member_pk === '1' || this.props.userToken.member_pk === '100'  || this.props.userToken.member_pk === '267' ) */}
                            { ( this.props.userToken.member_pk === '267' ||  this.props.userToken.member_pk === '1' || ( this.state.userData.user_type == 'A' && this.state.userData.agent_status == 'approval' ) ) && 
                            <TouchableOpacity style={styles.boxSubWrap} onPress={()=>this.moveDetail('SettleStack','결제관리')}>
                                <View style={styles.boxLeftWrap}>
                                    <View style={styles.navCommonLeftWrap}>
                                        <CustomTextR style={styles.menuTitleText}>결제관리</CustomTextR>                         
                                    </View>
                                    <View style={styles.navCommonRightWrap}>
                                        <Image
                                            source={BTN_NEXT_ARROW}
                                            resizeMode={"contain"}
                                            style={CommonStyle.defaultIconImage20}
                                        /> 
                                    </View>
                                </View>
                            </TouchableOpacity>
                            }
                            <View style={styles.boxSubWrap2}>
                                <View style={styles.boxLeftWrap}>
                                    <View style={styles.navCommonLeftWrap}>
                                        <CustomTextR style={styles.menuTitleText}>알림설정</CustomTextR>                         
                                    </View>
                                    <TouchableOpacity style={styles.navCommonRightWrap} onPress={()=>this.updatePushPermission(this.state.isPush)}>
                                        <Image
                                            source={this.state.isPush ? CHECKBOX_TOGGLE_ON : CHECKBOX_TOGGLE_OFF}
                                            resizeMode={"contain"}
                                            style={CommonStyle.defaultImage40}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.boxSubWrap} onPress={()=>this.moveDetail('UseYakwanStack','서비스 이용약관')}>
                                <View style={styles.boxLeftWrap}>
                                    <View style={styles.navCommonLeftWrap}>
                                        <CustomTextR style={styles.menuTitleText}>서비스 이용약관</CustomTextR>                         
                                    </View>
                                    <View style={styles.navCommonRightWrap}>
                                        <Image
                                            source={BTN_NEXT_ARROW}
                                            resizeMode={"contain"}
                                            style={CommonStyle.defaultIconImage20}
                                        /> 
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.boxSubWrap} onPress={()=>this.moveDetail('PrivateYakwanStack','개인정보 취급방침')}>
                                <View style={styles.boxLeftWrap}>
                                    <View style={{flex:5}}>
                                        <CustomTextR style={styles.menuTitleText}>개인정보 취급방침</CustomTextR>                         
                                    </View>
                                    <View style={styles.navCommonRightWrap}>
                                        <Image
                                            source={BTN_NEXT_ARROW}
                                            resizeMode={"contain"}
                                            style={CommonStyle.defaultIconImage20}
                                        /> 
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.boxSubWrap} onPress={()=>this.moveDetail('RequestStack','고객센터 문의하기')}>
                                <View style={styles.boxLeftWrap}>
                                    <View style={styles.navCommonLeftWrap}>
                                        <CustomTextR style={styles.menuTitleText}>고객센터 문의하기</CustomTextR>                         
                                    </View>
                                    <View style={styles.navCommonRightWrap}>
                                        <Image
                                            source={BTN_NEXT_ARROW}
                                            resizeMode={"contain"}
                                            style={CommonStyle.defaultIconImage20}
                                        /> 
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <View style={styles.boxSubWrap} onPress={()=>this.moveDetail('RequestStack','문의하기')}>
                                <View style={styles.boxLeftWrap}>
                                    <View style={styles.navCommonLeftWrap2}>
                                        <CustomTextR style={styles.menuTitleText}>앱 버전 </CustomTextR>
                                    </View>
                                    <View style={styles.navCommonRightWrap2}>
                                        <CustomTextR style={styles.menuTitleText}>{VersionCheck.getCurrentVersion()}</CustomTextR>
                                        { DEFAULT_CONSTANTS.AppStoreVersion != VersionCheck.getCurrentVersion() &&
                                        (
                                            <TouchableOpacity style={styles.miniBox} onPress={()=>this.moveAppStore()}>
                                                <CustomTextR style={styles.updateTitleText}>업데이트</CustomTextR>
                                            </TouchableOpacity>
                                        )
                                        
                                        }
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.boxSubWrap} onPress={()=>this.logout()}>
                                <View style={styles.boxLeftWrap}>
                                    <View style={styles.navCommonLeftWrap}>
                                        <CustomTextR style={styles.menuTitleText2}>로그아웃</CustomTextR>                         
                                    </View>
                                </View>
                            </TouchableOpacity>
                            {/*
                                this.props.userToken.member_pk == 1  && 
                                <TouchableOpacity 
                                    style={styles.boxSubWrap} 
                                    onPress={()=>{this.props.navigation.navigate('NaverMapStack')}}
                                >
                                    <View style={styles.boxLeftWrap}>
                                        <View style={styles.navCommonLeftWrap}>
                                            <CustomTextR style={styles.menuTitleText2}>네이버지도</CustomTextR>                         
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            */}
                        </View>
                    </ScrollView>    
                    { 
                        this.state.moreLoading &&
                        <View style={CommonStyle.moreWrap}>
                           <ActivityIndicator size="small" color={DEFAULT_COLOR.base_color}  />
                        </View>
                    }            
                </SafeAreaView>
            );
            }
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor : "#fff"
    },
    IndicatorContainer : {
        flex: 1,
        width:'100%',
        backgroundColor : "#fff",
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nonUserWrap : {
        flex:1,
        alignItems:'center',
        justifyContent:'flex-start',
        paddingTop:50,
    },
    nonUserlinkWrap : {
        flex:2,paddingHorizontal:20,justifyContent:'flex-end'
    },
    modalTail : {
        flex:1,
        alignItems:'center',
        justifyContent:'flex-start',
        paddingTop:20,
    },
    profileImageWrap : {
        width:70,justifyContent:'center',alignItems:'center'
    },
    profileTextWrap : {
        flex:3,justifyContent:'center',alignItems:'flex-start',paddingLeft:10
    },
    profileButtonWrap: {
        flex:1,justifyContent:'center',alignItems:'flex-end',paddingRight:10
    },
    chatRowDefault : {
        width:60,justifyContent:'center',alignItems:'flex-start'
    },
    chatRowText : {
        flex:3,justifyContent:'center',alignItems:'flex-start',paddingLeft:10
    },
    chartRowIconWrap : {
        width:60,height:60,justifyContent:'center',alignItems:'flex-end'
    },
    unreadTextWrap : {
        width:34,height:34,justifyContent:'center',alignItems:'center',backgroundColor:'#fff',borderRadius:17
    },
    navCommonLeftWrap : {
        flex:5
    },
    navCommonRightWrap : {
        flex:1,justifyContent:'center',alignItems:'flex-end'
    },
    navCommonLeftWrap2 : {
        flex:1
    },
    navCommonRightWrap2 : {
        flex:2,justifyContent:'flex-end',alignItems:'center',flexDirection:'row'
    },
    moveButton  : {
        paddingVertical:5,
        width : SCREEN_WIDTH*0.5,
        backgroundColor:DEFAULT_COLOR.base_color,
        justifyContent:'center',
        alignItems:'center'
    },
    mainTitleText : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15)
    },
    termLineWrap : {
        flex:1,
        paddingVertical:5,
        backgroundColor:'#f5f6f8'
    },
    boxWrap : {
        flex:1,
        paddingHorizontal:10,paddingVertical:15,       
        
    },
    linkWrap : {
        paddingHorizontal:20
    },
    boxSubWrap : {
        flex:1,
        flexDirection:'row',    
        flexGrow:1,    
        paddingHorizontal:0,paddingVertical:15,
        alignItems: 'center',        
        borderBottomWidth:1,
        borderBottomColor : DEFAULT_COLOR.input_border_color
    },
    boxSubWrap2 : {
        flex:1,
        flexDirection:'row',    
        flexGrow:1,    
        paddingHorizontal:0,paddingVertical:5,
        alignItems: 'center',        
        borderBottomWidth:1,
        borderBottomColor : DEFAULT_COLOR.input_border_color
    },
    boxSubWrap3 : {
        flex:1,
        flexDirection:'row',    
        flexGrow:1,    
        maxHeight:50,
        paddingHorizontal:0,paddingVertical:15,
        alignItems: 'center',        
        borderBottomWidth:1,
        borderBottomColor : DEFAULT_COLOR.input_border_color
    },
    boxLeftWrap : {
        flex:5,
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center'
    },
    chatWrap : {
        flex:1,
        marginHorizontal :10,
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
        backgroundColor:DEFAULT_COLOR.base_color,
        borderRadius:10,
        marginTop:20
    },
    boxRightWrap : {
        flex:1,        
        justifyContent:'center',
        alignItems:'flex-end'
    },
    menuTitleText : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15),paddingRight:10
    },
    menuTitleText2 : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15),color:'#ccc'
    },
    menuTitleSubText : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize13),paddingRight:10,color:'#666'
    },
    updateTitleText : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize12),color:'#555'
    },
    ballWarp : {
        marginTop: 0,width: 50,height: 15,borderRadius: 10,padding:5,borderWidth:0.5,borderColor:'#ebebeb',
        ...Platform.select({
            ios: {
              shadowColor: "#ccc",
              shadowOpacity: 0.5,
              shadowRadius: 2,
              shadowOffset: {
                height: 0,
                width: 0.1
             }
           },
            android: {
              elevation: 5
           }
         })
    },
    ballStyle : {
        width: 24,height: 24,borderRadius: 12,backgroundColor:'#fff',
        
    },
    miniBox : {
        borderRadius: 5,backgroundColor:'#fff',justifyContent:'center',alignItems:'center',
        borderWidth:1,borderColor:'#ddd',paddingHorizontal:5,paddingVertical:5
    }
});

function mapStateToProps(state) {
    return {
        userToken : state.GlabalStatus.userToken
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
        _updateUserBaseDataDirect:(data)=> {
            dispatch(ActionCreator.updateUserBaseDataDirect(data))
        }

        
    };
}


export default connect(mapStateToProps,mapDispatchToProps)(IntroScreen);