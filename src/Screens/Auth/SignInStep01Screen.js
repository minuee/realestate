import React, { Component } from 'react';
import {SafeAreaView,Image,View,StyleSheet,PixelRatio,Dimensions,TouchableOpacity,StatusBar,BackHandler,KeyboardAvoidingView,ScrollView,Platform} from 'react-native';

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
import Loader from '../../Utils/Loader';
import CheckConnection from '../../Components/CheckConnection';

const BUTTON_CHECK_OFF =  require('../../../assets/icons/btn_check_off.png')
const BUTTON_CHECK_ON =  require('../../../assets/icons/btn_check_on.png')
const ICON_CHECK_OFF =  require('../../../assets/icons/icon_check_off.png')
const ICON_CHECK_ON =  require('../../../assets/icons/icon_check_on.png')
const ARROW_RIGHT =  require('../../../assets/icons/arrow_right_gray.png')

export default class SignInStep01Screen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            thisUUID : null,
            loading : true,
            isActive : false,
            allCheck :false,
            agree1Check :false,
            agree2Check :false,
            agree3Check :false,
            formKind : 'Z',
            formEmail : null,            
            formProfileImage : null,
            formpw : null,
            formUserName : null
        }
    }

    async UNSAFE_componentWillMount() {
        
        if ( !CommonUtil.isEmpty(this.props.extraData)) {
            if ( !CommonUtil.isEmpty(this.props.extraData.params)) {
                const { formEmail,formKind,formProfileImage,formpw,formUserName } = this.props.extraData.params.screenData;
                this.setState({
                    formEmail,formProfileImage,formpw,formUserName,
                    formKind : CommonUtil.isEmpty(formKind) ? 'Z' : formKind,
                    loading:false
                })        
            }else{
                this.setState({
                    formKind : 'Z',loading:false
                })    
            }
        }else{            
            this.setState({
                formKind : 'Z',loading:false
            })        
            
        }
    }
   
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }
    handleBackPress = () => {
        this.props.navigation.goBack(null)
        return true;  // Do nothing when back button is pressed
    }

    allCheck = async() => {
        const nowStatus = this.state.allCheck;
        if ( nowStatus ) { //모두해제
            this.setState({
                agree1Check :false,
                agree2Check :false,
                agree3Check :false,
                isActive : false
            })
        }else{//모두선택
            this.setState({
                agree1Check :true,
                agree2Check :true,
                agree3Check :true,
                isActive : true
            })
        }
        this.setState({
            allCheck : !nowStatus
        })
    }

    agreeCheck = async(mode,bool) => {
        switch(mode) {
            case 1 : this.setState({agree1Check : !bool});break;
            case 2 : this.setState({agree2Check : !bool});break;
            case 3 : this.setState({agree3Check : !bool});break;
            default : console.log('nothing');break;
        }
        setTimeout(
            () => {            
                if ( this.state.agree1Check && this.state.agree2Check ) {
                    this.setState({isActive:true})
                }else{
                    this.setState({isActive:false})
                }
            },100
        )

        
    }

    nextNavigation = (nav) => {
        this.props.navigation.navigate(nav);   
    }
    nexStep = (nav) => {
        if ( this.state.isActive ) {
            this.props.navigation.navigate(nav, {
                screenData : this.state
            });
        }else{
            CommonFunction.fn_call_toast('이용약관 및 수집 및 이용동의를 해주세요',2000)
        }
    }

    render() {
       
        return(
            <SafeAreaView style={ styles.container }>
                <CheckConnection />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    indicatorStyle={'white'}
                    scrollEventThrottle={16}
                    keyboardDismissMode={'on-drag'}      
                    style={{width:'100%'}}
                >
                { Platform.OS == 'android' && <StatusBar backgroundColor={'#fff'} translucent={false}  barStyle="dark-content" />}
                
                <View style={styles.commonFlex}>
                    <View style={{flex:1,paddingTop:50}}>
                        <CustomTextL style={[CommonStyle.textSize25,CommonStyle.fontColorDefault]}>
                            회원가입을 위한
                        </CustomTextL>
                        <CustomTextL style={[CommonStyle.textSize25,CommonStyle.fontColorDefault]}>
                            약관에 동의해주세요
                        </CustomTextL>
                    </View>
                </View>            
                <View style={styles.commonFlex2}>
                    <TouchableOpacity style={{paddingHorizontal:5}} onPress={()=>this.allCheck()}>
                        <Image source={this.state.allCheck ? BUTTON_CHECK_ON :  BUTTON_CHECK_OFF} style={CommonStyle.defaultIconImage30} />
                    </TouchableOpacity>
                    <View style={{paddingHorizontal:5}} >
                        <CustomTextB style={[CommonStyle.textSize16,CommonStyle.fontColorDefault]}>
                            전체동의
                        </CustomTextB>
                    </View>
                    
                </View> 
                <View style={styles.commonFlex3}>
                    <TouchableOpacity style={{paddingHorizontal:5}} onPress={()=>this.agreeCheck(1,this.state.agree1Check)}>
                        <Image source={this.state.agree1Check ? ICON_CHECK_ON :ICON_CHECK_OFF} style={CommonStyle.defaultIconImage30} />
                    </TouchableOpacity>
                    <View style={{paddingHorizontal:5}} >
                        <CustomTextR style={[CommonStyle.textSize15,CommonStyle.fontColor999]}>
                            (필수)서비스 이용약관 동의
                        </CustomTextR>
                    </View>
                    <TouchableOpacity style={styles.arrowWrap} onPress={()=>this.nextNavigation('UseYakwanStack')}>
                        <Image source={ARROW_RIGHT} style={CommonStyle.defaultIconImage30} />
                    </TouchableOpacity>
                </View>
                <View style={styles.commonFlex3}>
                    <TouchableOpacity style={{paddingHorizontal:5}} onPress={()=>this.agreeCheck(2,this.state.agree2Check)}>
                        <Image source={this.state.agree2Check ? ICON_CHECK_ON :ICON_CHECK_OFF} style={CommonStyle.defaultIconImage30} />
                    </TouchableOpacity>
                    <View style={{paddingHorizontal:5}} >
                        <CustomTextR style={[CommonStyle.textSize15,CommonStyle.fontColor999]}>
                            (필수)개인정보 수집 및 이용동의
                        </CustomTextR>
                    </View>
                    <TouchableOpacity style={styles.arrowWrap} onPress={()=>this.nextNavigation('PrivateYakwanStack')}>
                        <Image source={ARROW_RIGHT} style={CommonStyle.defaultIconImage30} />
                    </TouchableOpacity>
                </View>
                <View style={styles.commonFlex3}>
                    <TouchableOpacity style={{paddingHorizontal:5}} onPress={()=>this.agreeCheck(3,this.state.agree3Check)}>
                        <Image source={this.state.agree3Check ? ICON_CHECK_ON :ICON_CHECK_OFF} style={CommonStyle.defaultIconImage30} />
                    </TouchableOpacity>
                    <View style={{paddingHorizontal:5}} >
                        <CustomTextR style={[CommonStyle.textSize15,CommonStyle.fontColor999]}>
                            (선택)마케팅정보수신동의
                        </CustomTextR>
                    </View>
                    <TouchableOpacity style={styles.arrowWrap} onPress={()=>this.nextNavigation('MarketingStack')}>
                        <Image source={ARROW_RIGHT} style={CommonStyle.defaultIconImage30} />
                    </TouchableOpacity>
                </View> 
                
                               
                </ScrollView>
                <TouchableOpacity style={styles.middleDataWarp2}>
                    <TouchableOpacity 
                        onPress={()=>this.nexStep('SignInStep02Stack')}
                        style={this.state.isActive ? styles.buttonWrapOn : styles.buttonWrapOff }
                    >
                        <CustomTextM style={[CommonStyle.textSize17,CommonStyle.fontColorWhite]}>다음</CustomTextM>
                    </TouchableOpacity>
                </TouchableOpacity>
            </SafeAreaView>
        );
        
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor : "#fff",
    },
    IndicatorContainer : {
        flex: 1,
        width:'100%',
        backgroundColor : "#fff",
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    commonFlex : {
        flex:0.5,paddingHorizontal:30,paddingVertical:20
    },
    commonFlex2 : {
        flex:0.5,paddingHorizontal:30,paddingVertical:10,flexDirection:'row',alignItems:'center',marginTop:50
    },
    commonFlex3 : {
        flex:0.5,paddingHorizontal:30,paddingVertical:5,flexDirection:'row',alignItems:'center'
    },
    middleDataWarp : {
        flex:1,
        justifyContent:'center',
        marginVertical:5
    },
    dataInputWrap : {
        flex:1,height:55
    },
    middleDataWarp2 : {
        flex:1,
        justifyContent:'center',
        paddingTop:10,paddingBottom:20,paddingHorizontal:10
    },
    buttonWrapOn : {
        backgroundColor:DEFAULT_COLOR.base_color,padding:10,justifyContent:'center',alignItems:'center',borderRadius:25,marginHorizontal:20
    },
    buttonWrapOff : {
        backgroundColor:'#cfcfcf',padding:10,justifyContent:'center',alignItems:'center',borderRadius:25,marginHorizontal:20
    },
    titleWrap : {
        flex:1,justifyContent:'flex-end',height:45,paddingLeft:20
    },
    memoryWrap : {
        flex:1,flexDirection:'row',flexGrow:1,justifyContent:'center',paddingLeft:20,paddingVertical:10
    },
    memoryRightWrap : {
        flex:1
    },
    titleText : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize16),color:DEFAULT_COLOR.base_color_666
    },
    titleText2 : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize14),color:DEFAULT_COLOR.base_color_666
    },
    arrowWrap : {
        position:'absolute',right:0,top:0,width:50,height:'100%',
    }
});


