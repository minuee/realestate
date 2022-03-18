import React, { Component } from 'react';
import {SafeAreaView,Alert,View,StyleSheet,BackHandler,Dimensions,TouchableOpacity,StatusBar,TextInput,KeyboardAvoidingView,ScrollView,Platform} from 'react-native';
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

export default class SignInStep03AScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            thisUUID : null,
            formKind : 'Z',
            loading : true,
            moreLoading :false,
            showdupid : false,
            showdupid_text : '',
            showdupname: false,
            showdupname_text : '',
            showcheckpass :false,
            formMemberType : 'N',
            formUserId : 'test@sample.co.kr',
            formCompanyName : 'test111',
            formCeoName : '',
            formPasswd : '123456',
            formPasswd2 :'123456',
            formAddress : '',
            formTel : '',
            formProfile : '',
            isStatus : 'use',
            dupCheckUID : false,
            dupCheckNickname :false
        }
    }

    async UNSAFE_componentWillMount() {
        //console.log('SignInStep03AScreen',this.props.extraData.params);
        if ( CommonUtil.isEmpty(this.props.extraData.params.screenData)) {
            CommonFunction.fn_call_toast('잘못된 접근입니다',1500);
            setTimeout(() => {
                this.props.navigation.goBack(null);
            }, 1500);
        }else{
            const { formEmail,formKind,formProfileImage,formpw,formUserName } = this.props.extraData.params.screenData;            
            this.setState({
                formPasswd : formpw,
                formPasswd2 : formpw,
                formUserId : formEmail,
                formCeoName : formUserName,
                formCompanyName : formUserName,
                formProfileImage,
                formKind : CommonUtil.isEmpty(formKind) ? 'Z' : formKind,
                loading:false
            })      
        }
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

    movesignup = (nav) => {
        CommonFunction.fn_call_toast('감사합니다. 정상적으로 가입되었습니다.',1000);
        this.timeout = setTimeout(
            () => {
                this.props.navigation.popToTop()
            },
            1000
        ); 
        
    }

    registUser = async() => {
        await this.setState({showcheckpass:false})
        if ( CommonUtil.isEmpty(this.state.formUserId)) {
            CommonFunction.fn_call_toast('아이디를 입력해주세요',2000);
            return false;
        }else if ( this.state.dupCheckUID === false) {
            CommonFunction.fn_call_toast('아이디 중복확인을 체크해주세요',2000);
            return false;
        }else if ( CommonFunction.ValidateEmail(this.state.formUserId) === false) {
            CommonFunction.fn_call_toast('정확한 이메일을 입력해주세요',2000);
            return false;
        }else if ( CommonUtil.isEmpty(this.state.formCompanyName)) {
            CommonFunction.fn_call_toast('닉네임를 입력해주세요',2000);
            return false;
        }else if ( this.state.dupCheckNickname === false) {
            CommonFunction.fn_call_toast('닉네임 중복확인을 체크해주세요',2000);
            return false;
        }else if ( this.state.formPasswd.length < 6 || this.state.formPasswd2.length < 6) {
            CommonFunction.fn_call_toast('비밀번호를 6자리이상 입력해주세요',2000);
            return false;
        }else if ( this.state.formPasswd != this.state.formPasswd2) {
            //console.log("this.state.formPasswd:",this.state.formPasswd);
            //console.log("this.state.formPasswd:",this.state.formPasswd2);
            this.setState({showcheckpass:true})
            CommonFunction.fn_call_toast('비밀번호가 일치하지 않습니다.',2000);
            return false;
        }else if ( CommonFunction.checkKor(this.state.formPasswd)) {
            CommonFunction.fn_call_toast('비밀번호는 영문대소,숫자,특수문자로만 가능합니다.',2000);
            return false;            
        }else{
            Alert.alert(
                DEFAULT_CONSTANTS.appName,
                '회원가입을 신청하시겠습니까?',
                [
                  {text: '네', onPress: () => this.registComplete()},
                  {text: '아니오', onPress: () => console.log('no')},
                ],
                {cancelable: false},
              );
        }
    }

    registComplete = async() => {
        await this.setState({loading : true});
        let md5Tel = "";
        if ( !CommonUtil.isEmpty(this.state.formTel)) md5Tel = CommonFunction.fn_dataEncode(this.state.formTel.replace("-",""));
        let md5formpw = "";
        if ( !CommonUtil.isEmpty(this.state.formTel)) md5formpw = CommonFunction.fn_dataEncode(this.state.formPasswd);
        let md5Email = "";
        if ( !CommonUtil.isEmpty(this.state.formUserId)) md5Email = CommonFunction.fn_dataEncode(this.state.formUserId);
        //console.log("decrypt:",this.state);
  
        Auth.signUpProcess(
            {
                email: this.state.formUserId.trim().toLowerCase(),
                password: this.state.formPasswd,
                authType: AuthType.EMAIL,
                lang: "ko", // 가입시 유저 선택 언어
                cognitoRegComm: {
                    // 서버에서 회원가입시 처리할 필요 파라미터를 첨부한다.
                    join_type: this.state.formKind,//F:Facebook, N:Naver, K:Kakao, A:Apple,G:Google,T:Twitter, I:Instrgram,Z:동네선수
                    user_type : this.state.formMemberType,
                    uid : md5Email,                    
                    passwd : md5formpw,
                    name : this.state.formCompanyName,
                    nickname : this.state.formCompanyName,
                    company_name : this.state.formCompanyName,
                    address : this.state.formAddress,
                    telephone : md5Tel,
                    business_code :  this.state.formBusinessCode,
                    profile_url :  this.state.formKind === 'Z' ? '' : this.state.formProfile,
                    use_agree_date : new Date(),
                    private_agree_date :  new Date(),
                    market_agree_date :  new Date(),
                    is_status : this.state.isStatus,
                    zipcode : '',
                    latitude : '',
                    longitude : '',
                    srate : 10,
                    erate : 50,
                    //sns가입시
                    sns_id : this.state.formKind === 'Z' ? '' : md5Email,
                    sns_email : this.state.formKind === 'Z' ? '' : md5Email,
                    sns_image : this.state.formKind === 'Z' ? '' : this.state.formProfile
                },
            },            
            async (data) => {
                //console.log("data:",data);
                this.setState({loading : false});
                this.movesignup()
            },
            (error) => {
                // 회원가입 실패
                //console.log("error1111:",error);
                //console.log('test -> error.code', error.code);
                //console.log('test -> error.name', error.name);
                //console.log('test -> error.message', error.message);
                this.setState({loading : false});
                if ( error.code == 'InvalidParameterException') {
                    //CommonFunction.fn_call_toast('이미 가입된 이력이 있습니다. 아이디 찾기등을 확인바랍니다.',2000);
                    CommonFunction.fn_call_toast('이 이메일은 더이상 사용하실 수 없습니다.',2000);
                    setTimeout(() => {
                        this.props.navigation.popToTop();
                    }, 2000);
                }else if ( error.code == 'UsernameExistsException') { 
                    //CommonFunction.fn_call_toast('이미 가입된 이력이 있습니다. 로그인 진행해 주세요.',2000);
                    CommonFunction.fn_call_toast('이 이메일은 더이상 사용하실 수 없습니다.',2000);
                    setTimeout(() => {
                        this.props.navigation.popToTop();
                    }, 2000);
                }else{
                    CommonFunction.fn_call_toast('시스템 오류가 발생하였습니다.',2000);
                }
            }
        );
        
    }

    checkDup = async(mode) => {
        if ( mode === 'id') {
            //console.log('fdfdf',CommonFunction.ValidateEmail(this.state.formUserId))
            if ( CommonFunction.ValidateEmail(this.state.formUserId)) {
                if ( !CommonUtil.isEmpty(this.state.formUserId)) {
                    this.setState({moreLoading:true})
                    let returnCode = {code:9998};
                    try {
                        returnCode = await apiObject.API_checkDupUserId({
                            locale: "ko",
                            member_id : CommonFunction.fn_dataEncode(this.state.formUserId.toLowerCase())
                        }); 
                        //console.log('returnCode',returnCode);
                        if ( returnCode.code === '0000') {
                            this.setState({moreLoading:false,dupCheckUID:true,showdupid:true,showdupid_text:'사용가능한 아이디입니다.'})
                        }else{                        
                            //this.setState({moreLoading:false,dupCheckUID:false,showdupid :true,showdupid_text:'이미 사용중인 아이디입니다.'})
                            this.setState({moreLoading:false,dupCheckUID:false,showdupid :true,showdupid_text:'이 이메일은 더이상 사용하실 수 없습니다.'})
                            return false;
                        }
                        
                    }catch(e){
                        //console.log('returnCode error1',e)
                        this.setState({moreLoading:false})
                        CommonFunction.fn_call_toast('로그인중 오류가 발생하였습니다.');
                        return false;
                        
                    }
                }
            }else{
                CommonFunction.fn_call_toast('정확한 이메일을 입력해주세요',2000);
                return false;
            }
        }else{
            if ( !CommonUtil.isEmpty(this.state.formCompanyName)) {
                this.setState({moreLoading:true})
                let returnCode = {code:9998};
                try {
                    returnCode = await apiObject.API_checkDupUserName({
                        locale: "ko",
                        member_name : this.state.formCompanyName
                    }); 
                    //console.log('returnCode',returnCode);
                    if ( returnCode.code === '0000') {
                        this.setState({moreLoading:false,dupCheckNickname:true,showdupname:true,showdupname_text:'사용가능한 닉네임입니다.'})
                    }else{                        
                        this.setState({moreLoading:false,dupCheckNickname:false,showdupname :true,showdupname_text:'이미 사용중인 닉네임입니다.'})
                        return false;
                    }
                    
                }catch(e){
                    //console.log('returnCode error1',e)
                    this.setState({moreLoading:false})
                    CommonFunction.fn_call_toast('로그인중 오류가 발생하였습니다.');
                    return false;
                    
                }
            }
        }
    }

    setpasswd = async( mode , text ) => {
        if( mode === 1 ) {
            this.setState({formPasswd:text})
        }else{
            this.setState({formPasswd2:text})
        }
        if ( this.state.formPasswd !== this.state.formPasswd2 ) {
            this.setState({showcheckpass:true})
        }else{
            this.setState({showcheckpass:false})
        }
    }

    setEmailAddress = (val) => {
        let dataval = val.trim();
        //console.log('dataval',dataval);
        this.setState({
            formUserId : dataval.toLowerCase(),
            upCheckUID:false,
            showdupid:false,
            showdupid_text:''
        })
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
                
                <View style={styles.commonFlex}>
                    <View style={{flex:1,paddingTop:50}}>
                        <CustomTextL style={[CommonStyle.textSize25,CommonStyle.fontColorDefault]}>
                            아이디와 닉네임등을
                        </CustomTextL>
                        <CustomTextL style={[CommonStyle.textSize25,CommonStyle.fontColorDefault]}>
                            입력해주세요
                        </CustomTextL>
                    </View>
                </View>            
                <View style={styles.commonFlex2}>         
                    <View style={styles.middleTitleWarp}>
                        <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor777]}>아이디</CustomTextR>
                    </View>
                    <View style={styles.middleDataWarp}>
                        <View style={styles.middleDataLeftWarp}>
                            <TextInput   
                                editable={this.state.formKind === 'Z' ? true : false}       
                                maxLength={40}
                                keyboardType={'email-address'}
                                placeholder={'이메일을 입력해주세요'}
                                placeholderTextColor={DEFAULT_COLOR.base_color_666}                           
                                style={[styles.inputBlank,CommonStyle.defaultOneWayForm]}
                                value={this.state.formUserId}
                                //onChangeText={text=>this.setEmailAddress(text)}
                                onChangeText={text=>this.setState({formUserId:text.toLowerCase().trim(),dupCheckUID:false,showdupid:false,showdupid_text:''})}
                                multiline={false}
                                clearButtonMode='always'
                            />
                        </View> 
                        <TouchableOpacity style={styles.middleDataRightWarp} onPress={()=>this.checkDup('id')}>
                            <CustomTextL style={[CommonStyle.textSize13,CommonStyle.fontColorBase]}>
                                {this.state.formUserId != '' ? '중복확인' : ''}
                            </CustomTextL>
                        </TouchableOpacity>                       
                    </View>
                    
                    <View style={styles.middleBottomWarp}>
                    {this.state.showdupid &&
                        <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColorRed]}>{this.state.showdupid_text}</CustomTextR>
                    }
                    </View>
                    
                    <View style={styles.middleTitleWarp}>
                        <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor777]}>닉네임</CustomTextR>
                    </View>
                    <View style={styles.middleDataWarp}>
                        <View style={styles.middleDataLeftWarp}>
                            <TextInput                                          
                                placeholder={'닉네임을 입력해주세요'}
                                placeholderTextColor={DEFAULT_COLOR.base_color_666}                           
                                style={[styles.inputBlank,CommonStyle.defaultOneWayForm]}
                                value={this.state.formCompanyName}
                                onChangeText={text=>this.setState({formCompanyName:text.trim(),dupCheckNickname:false,showdupname:false,showdupname_text:''})}
                                multiline={false}
                                clearButtonMode='always'
                            />
                        </View>
                        <TouchableOpacity style={styles.middleDataRightWarp} onPress={()=>this.checkDup('name')}>
                            <CustomTextL style={[CommonStyle.textSize13,CommonStyle.fontColorBase]}>
                                {this.state.formCompanyName != '' ? '중복확인' : ''}
                            </CustomTextL>
                        </TouchableOpacity> 
                    </View> 
                    
                    <View style={styles.middleBottomWarp}>
                        {this.state.showdupname &&
                        <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColorRed]}>{this.state.showdupname_text}</CustomTextR>
                        }
                    </View>
                    {this.state.formKind === 'Z' &&
                    <>
                    <View style={styles.middleTitleWarp}>
                        <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor777]}>비밀번호(대소문자구분주의)</CustomTextR>
                    </View>
                    <View style={styles.middleDataWarp}>
                        <View style={{flex:1}}>
                            <TextInput  
                                secureTextEntry={true}
                                placeholder={'비밀번호를 6자리이상 입력해주세요'}
                                placeholderTextColor={DEFAULT_COLOR.base_color_666}                           
                                style={[styles.inputBlank,CommonStyle.defaultOneWayForm]}
                                value={this.state.formPasswd}
                                onChangeText={text=>this.setState({formPasswd:text.trim()})}
                                //onChangeText={text=>this.setpasswd(1,text)}
                                multiline={false}
                                clearButtonMode='always'
                            />
                        </View>
                    </View>
                    <View style={styles.middleBottomWarp}></View> 
                    <View style={styles.middleTitleWarp}>
                        <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor777]}>비밀번호 확인(대소문자구분주의)</CustomTextR>
                    </View>
                    <View style={styles.middleDataWarp}>
                        <View style={{flex:1}}>
                            <TextInput
                                secureTextEntry={true}
                                placeholder={'비밀번호를 6자리이상 입력해주세요'}
                                placeholderTextColor={DEFAULT_COLOR.base_color_666}                           
                                style={[styles.inputBlank,CommonStyle.defaultOneWayForm]}
                                value={this.state.formPasswd2}
                                onChangeText={text=>this.setState({formPasswd2:text.trim()})}
                                //onChangeText={text=>this.setpasswd(2,text)}
                                multiline={false}
                                clearButtonMode='always'
                            />
                        </View>
                    </View> 
                    <View style={styles.middleBottomWarp}>
                        {this.state.showcheckpass &&
                            <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColorRed]}>비밀번호가 맞지않습니다.</CustomTextR>
                        }
                    </View>
                    </>
                }
                </View>
                { this.state.moreLoading &&
                    <View style={CommonStyle.moreWrap}>
                        <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} />
                    </View>
                }          
                </ScrollView>
                
                <TouchableOpacity style={styles.middleDataWarp2}>
                    <TouchableOpacity 
                        onPress={()=>this.registUser()}
                        style={CommonUtil.isEmpty(this.state.formMemberType) ? styles.buttonWrapOff : styles.buttonWrapOn }
                    >
                        <CustomTextM style={[CommonStyle.textSize17,CommonStyle.fontColorWhite]}>가입완료</CustomTextM>
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


