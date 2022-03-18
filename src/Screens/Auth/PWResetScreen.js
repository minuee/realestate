import React, { Component } from 'react';
import {SafeAreaView,BackHandler,View,StyleSheet,PixelRatio,Dimensions,TouchableOpacity,StatusBar,TextInput,KeyboardAvoidingView,ScrollView,Platform} from 'react-native';
import CountDown from './CountDown';
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
import { Auth, CurrentAuthUiState, AuthType } from "@psyrenpark/auth";
import { apiObject } from "../../Apis/Member";
export default class PWResetScreen extends Component {


    constructor(props) {
        super(props);
        this.state = {
            timeLimit : 60 * 5,
            isAutoWrong : false,
            loading : true,
            moreLoading :false,
            formUserId : '',
            isCountDown : false,
            isNotSocial : false,
            isAuthChecking : false,
            isStep : 1,
            isAuthCodeMatch :false,
            authCheckingResultText: '',
            showdupid_text : '',
            isCheckPasswd : false,
            formPasswd : null,
            formPasswd2 :null,
        }
    }

    async UNSAFE_componentWillMount() {
        
    }
   
    componentDidMount() {    
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
        this.timeout = setTimeout(
            () => {
            this.setState({loading:false});
            },
            1000
        ); 
    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }
    handleBackPress = () => {
        this.props.navigation.goBack(null)
        return true;  // Do nothing when back button is pressed
    }

    sendAuthCode = async() => {
        //console.log('this.state.formUserId',this.state.formUserId);
        if ( !CommonUtil.isEmpty(this.state.formUserId) && this.state.isStep === 1 ) {
            if ( this.state.moreLoading === false ) {
                this.setState({moreLoading:true})
                Auth.forgotPasswordProcess(
                    {
                    email: this.state.formUserId,
                    authType: AuthType.EMAIL,
                    },
                    async (data) => {
                        //console.log('data',data);
                        // 성공처리 및 인증 메일 발송됨
                        // 패스워드 분실 2단계로 이동
                        CommonFunction.fn_call_toast('인증번호가 메일로 발송되었습니다.',2000);
                        this.setState({
                            isCountDown:true,
                            isAuthChecking:true,
                            moreLoading:false,
                            valNumber : 1,
                            timeLimit : 60 * 5
                        })    
                    },
                    (error) => {
                        // 실패처리,
                        console.log('error',error);
                        CommonFunction.fn_call_toast('에러가 발생하였습니다. 잠시후 다시 이용해주세요.',2000);
                        this.setState({                            
                            moreLoading:false
                        })    
                    },
                    null
                );
            
            }
        }else{
            CommonFunction.fn_call_toast('이메일정보를 입력해주세요!',2000);
        }
    }

    changePasswd = async() => {
        if ( !CommonUtil.isEmpty(this.state.formAuthCode)) {
            if ( this.state.formPasswd !== this.state.formPasswd2 ) {
                CommonFunction.fn_call_toast('비밀번호가 일치하지 않습니다!',2000);
                return;
            }else{
                Auth.confirmForgotPasswordProcess(
                    {
                    // 만약 화면 이동을 하였다면 이 변수는 이전화면에서 가져와야할 필요가 있다. (라우팅 porps,redux, context등을 이용)
                        email: this.state.formUserId,
                        code: this.state.formAuthCode,
                        newPassword: this.state.formPasswd, //새로 지정할 newPassword 이다.
                        authType: AuthType.EMAIL,
                    },
                    async (data) => {
                        // 성공처리 및 패스워드 변경
                        // 성공하면 자동으로 로그인 되니
                        // 바로 메인으로 이동하면됨
                        //console.log('data',data);
                        this.setState({isCountDown:false,timeLimit : 60 * 5,formAuthCode:null,isAuthChecking:false})
                        CommonFunction.fn_call_toast('정상적으로 변경되었습니다.',1500);      
                        this.timeout = setTimeout(
                            () => {
                                this.props.navigation.goBack(null);
                            },
                            1500
                        );                   
                    },
                    (error) => {
                        //console.log('error',error);
                        this.setState({
                            authCheckingResultText : '잘못된 인증코드입니다',
                            isCountDown:false,
                            isAuthCodeMatch :false,
                            timeLimit : 60 * 5,formAuthCode:null,isAuthChecking:false,isAutoWrong:true
                        })
                        CommonFunction.fn_call_toast('잘못된 인증코드입니다.',2000)
                    },
                    null
                );
            }
        }
    }

    resetCountdown = async() => {
        this.setState({isCountDown:false,timeLimit : 60 * 5,formAuthCode:null,isAuthChecking:false})
        CommonFunction.fn_call_toast('인증코드가 만료되었습니다. 다시 진행해주십시요',2000)
    }

    checkEmailCode = async() => {
        console.log('111',CommonFunction.fn_dataEncode('minuee4747@gmail.com'));
        if ( CommonFunction.ValidateEmail(this.state.formUserId) === false ) {
            CommonFunction.fn_call_toast('정확한 이메일을 입력해주세요',2000);
            return false;
        }else{
            this.setState({moreLoading:true})
            let returnCode = {code:9998};
            try {
                returnCode = await apiObject.API_checkEmailType({
                    locale: "ko",
                    email : CommonFunction.fn_dataEncode(this.state.formUserId.trim())
                }); 
                console.log('returnCode',returnCode);
                if ( returnCode.code === '0000') {
                    if ( CommonUtil.isEmpty(returnCode.data)) {
                        CommonFunction.fn_call_toast('가입되지 않은 이메일주소입니다.',2000);
                        return false;
                    }else {
                        if ( returnCode.data.join_type === 'Z') {
                            CommonFunction.fn_call_toast('인증코드발송을 진행해 주세요.',2000);
                            this.setState({moreLoading:false,isNotSocial:true,showdupid_text:'인증코드발송을 진행해 주세요'})
                        }else{
                            CommonFunction.fn_call_toast('SNS계정으로 가입한 계정은 비밀번호 수정이 불가합니다.',2000);
                            this.setState({moreLoading:false,isNotSocial:false,showdupid_text:'SNS계정으로 가입한 계정은 비밀번호 수정이 불가합니다.'})
                        }
                    }
                }else{    
                    this.setState({moreLoading:false})                                    
                    return false;
                }
                
            }catch(e){
                console.log('returnCode error1',e)
                this.setState({moreLoading:false})
                CommonFunction.fn_call_toast('오류가 발생하였습니다.');
                return false;
                
            }
        }
    }

    renderButton = () => {
        if ( this.state.isCountDown === false && this.state.isNotSocial === true ) {
            return (
                <TouchableOpacity 
                    hitSlop={{left:10,right:10,top:10,bottom:10}}
                    onPress={() => this.sendAuthCode()}
                    style={styles.middleDataRightWarp}
                >
                    <CustomTextL style={[CommonStyle.textSize12,CommonStyle.fontColorBase]}>
                        인증코드발송
                    </CustomTextL>
                </TouchableOpacity>
            )
        }else if (this.state.isCountDown === false && this.state.isNotSocial === false ) {
            return (
                <TouchableOpacity 
                    hitSlop={{left:10,right:10,top:10,bottom:10}}
                    onPress={() => this.checkEmailCode()}
                    style={styles.middleDataRightWarp}
                >
                    <CustomTextL style={[CommonStyle.textSize12,CommonStyle.fontColorBase]}>
                        이메일체크
                    </CustomTextL>
                </TouchableOpacity>   
            )
        }else{
            return null
        }
    }
    render() {
        if ( this.state.loading ) {
            return (
                <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} /> 
            )
        }else {
        return(
            <SafeAreaView style={ styles.container }>
                <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? "padding" : 'height'}  enabled> 
                <CheckConnection />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    indicatorStyle={'white'}
                    scrollEventThrottle={16}
                    keyboardDismissMode={'on-drag'}      
                    style={{width:'100%'}}
                >
                { Platform.OS == 'android' && <StatusBar backgroundColor={'#fff'} translucent={false}  barStyle="dark-content" />}
                      
                <View style={styles.commonFlex2}>         
                    <View style={styles.middleTitleWarp}>
                        <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor777]}>아이디(이메일)</CustomTextR>
                    </View>
                    <View style={styles.middleDataWarp}>
                        <View style={styles.middleDataLeftWarp}>
                            <TextInput
                                keyboardType={'email-address'}
                                maxLength={40}
                                placeholder={'이메일을 입력해주세요'}
                                placeholderTextColor={DEFAULT_COLOR.base_color_666}                           
                                style={[styles.inputBlank,CommonStyle.defaultOneWayForm]}
                                value={this.state.formUserId}
                                onChangeText={text=>this.setState({formUserId:text.toLowerCase(),isNotSocial:false,showdupid_text:null})}
                                multiline={false}
                                clearButtonMode='always'
                            />
                        </View> 
                        {this.renderButton()}
                    </View>
                    <View style={styles.middleBottomWarp}>
                        { CommonUtil.isEmpty(this.state.showdupid_text) ?
                        <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor999]}>
                            이메일체크이후 이메일주소로 인증코드가 전송됩니다.{"\n"}
                            소셜로그인은 비밀번호를 변경하실수 없습니다.
                        </CustomTextR>
                        :
                        <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColorRed]}>
                            {this.state.showdupid_text}
                        </CustomTextR>
                        }
                    </View>
                    {   this.state.isCountDown &&
                    <View style={styles.middleTitleWarp}>
                        <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor777]}>인증코드</CustomTextR>
                    </View>
                    }
                    {   this.state.isCountDown &&
                    <View style={styles.middleDataWarp}>
                        <View style={styles.middleDataLeftWarp}>
                            <TextInput                                          
                                placeholder={'이메일에 인증코드을 입력해주세요'}
                                placeholderTextColor={DEFAULT_COLOR.base_color_666}                           
                                style={[styles.inputBlank,CommonStyle.defaultOneWayForm]}
                                value={this.state.formAuthCode}
                                onChangeText={text=>this.setState({formAuthCode:text})}
                                multiline={false}
                                clearButtonMode='always'
                            />
                        </View>
                        <View style={styles.middleDataRightWarp}>
                        
                                <CountDown
                                    until={this.state.timeLimit}
                                    size={12}
                                    onFinish={() => this.resetCountdown()}
                                    isActive={this.state.isCountDown}
                                    digitStyle={{backgroundColor: 'transparents'}}
                                    digitTxtStyle={{color: DEFAULT_COLOR.base_color}}
                                    separatorStyle={{color: DEFAULT_COLOR.base_color}}
                                    timeToShow={['M', 'S']}
                                    timeLabels={{m: 'M', s: 'SS'}}
                            />
                        
                        </View> 
                    </View> 
                    }
                    {!CommonUtil.isEmpty(this.state.authCheckingResultText) &&
                    <View style={styles.middleBottomWarp}>
                        <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColorRed]}>
                            {this.state.authCheckingResultText}
                        </CustomTextR>
                    </View>
                    }
                </View>
                { this.state.isAuthChecking &&
                <View style={styles.commonFlex2}>
                    
                    <View style={styles.middleTitleWarp}>
                        <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor777]}>비밀번호</CustomTextR>
                    </View>
                    <View style={styles.middleDataWarp}>
                        <View style={{flex:1}}>
                            <TextInput  
                                secureTextEntry={true}
                                placeholder={'비밀번호를 입력해주세요'}
                                placeholderTextColor={DEFAULT_COLOR.base_color_666}                           
                                style={[styles.inputBlank,CommonStyle.defaultOneWayForm]}
                                value={this.state.formPasswd}
                                onChangeText={text=>this.setState({formPasswd:text})}
                                multiline={false}
                                clearButtonMode='always'
                            />
                        </View>
                    </View>
                    <View style={styles.middleBottomWarp}></View> 
                    <View style={styles.middleTitleWarp}>
                        <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor777]}>비밀번호 확인</CustomTextR>
                    </View>
                    <View style={styles.middleDataWarp}>
                        <View style={{flex:1}}>
                            <TextInput
                                secureTextEntry={true}
                                placeholder={'비밀번호를 입력해주세요'}
                                placeholderTextColor={DEFAULT_COLOR.base_color_666}                           
                                style={[styles.inputBlank,CommonStyle.defaultOneWayForm]}
                                value={this.state.formPasswd2}
                                onChangeText={text=>this.setState({formPasswd2:text})}
                                multiline={false}
                                clearButtonMode='always'
                            />
                        </View>
                    </View> 
                    {this.state.isCheckPasswd &&
                    <View style={styles.middleBottomWarp}>
                        <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColorRed]}>비밀번호가 맞지않습니다.</CustomTextR>
                    </View>
                    }
                    <View style={styles.middleBottomWarp}></View> 
                    <View style={styles.middleTitleWarp}>
                        <CustomTextR style={[CommonStyle.textSize14,CommonStyle.fontColor777]}>
                            인증번호와 함께 새로운 비밀번호를 입력해 주세요
                        </CustomTextR>
                    </View>
                    <View style={styles.middleBottomWarp}></View> 
                </View>
                }
                { this.state.moreLoading &&
                    <View style={CommonStyle.moreWrap}>
                        <Loader screenState={{isLoading:this.state.moreLoading,color:DEFAULT_COLOR.base_color}} />
                    </View>
                }       
                </ScrollView>
                <TouchableOpacity style={styles.middleDataWarp2}>
                    <TouchableOpacity 
                        onPress={()=>this.changePasswd()}
                        style={CommonUtil.isEmpty(this.state.formAuthCode) ? styles.buttonWrapOff : styles.buttonWrapOn }
                    >
                        <CustomTextM style={[CommonStyle.textSize17,CommonStyle.fontColorWhite]}>변경</CustomTextM>
                    </TouchableOpacity>
                </TouchableOpacity>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
        }
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
        flex:1,paddingHorizontal:30,paddingVertical:10
    },
    commonFlex3 : {
        flex:0.5,paddingHorizontal:30,paddingVertical:5,flexDirection:'row',alignItems:'center'
    },
    middleDataWarp : {
        flex:1,justifyContent:'center',flexDirection:'row',borderBottomColor:'#e6e6e6',borderBottomWidth:1
    },
    middleDataLeftWarp : {
        flex:3
    },
    middleDataRightWarp : {
        flex:1,justifyContent:'center',alignItems:'flex-end'
    },
    dataInputWrap : {
        flex:1,height:55
    },
    middleBottomWarp : {
        flex:1,
        justifyContent:'center',
        paddingHorizontal:5,marginBottom:20,marginTop:5
    },
    middleDataWarp2 : {
        height:100,
        justifyContent:'center',
        paddingTop:10,paddingBottom:20,paddingHorizontal:10
    },
    buttonWrapOn : {
        backgroundColor:DEFAULT_COLOR.base_color,padding:10,justifyContent:'center',alignItems:'center',borderRadius:25,marginHorizontal:20
    },
    buttonWrapOff : {
        backgroundColor:'#cfcfcf',padding:10,justifyContent:'center',alignItems:'center',borderRadius:25,marginHorizontal:20
    },
    dataCoverWarp : {
        flex:2,justifyContent:'center',alignItems:'center',margin:20
    },
    dataTextWarp : {
        height:30,flexDirection:'row',alignItems:'center'
    },
    middleTitleWarp : {
        flex:1,
        justifyContent:'center',
        paddingHorizontal:5
    },

    inputContainerStyle : {
        borderWidth:0,borderColor:'#fff'
    },
    inputStyle : {
        fontSize:DEFAULT_TEXT.fontSize13,color:'#666',marginHorizontal:10
    }
});


