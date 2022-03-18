import React, { Component } from 'react';
import {SafeAreaView,PixelRatio,View,StyleSheet,Alert,Dimensions,TouchableOpacity,StatusBar,TextInput,KeyboardAvoidingView,ScrollView,Platform,Animated,BackHandler} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import {Input} from 'react-native-elements';
//공통상수 필요에 의해서 사용
import  * as getDEFAULT_CONSTANTS   from '../../Constants';
import CommonStyle from '../../Style/CommonStyle';
const DEFAULT_CONSTANTS = getDEFAULT_CONSTANTS.DEFAULT_CONSTANTS;
const DEFAULT_TEXT = getDEFAULT_CONSTANTS.DEFAULT_TEXT;
const DEFAULT_COLOR = getDEFAULT_CONSTANTS.DEFAULT_COLOR;
const {height: SCREEN_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('window');
import {CustomTextR,CustomTextL, CustomTextB, CustomTextM, TextRobotoM,TextRobotoR,DropBoxIcon} from '../../Components/CustomText';
import CommonFunction from '../../Utils/CommonFunction';
import CommonUtil from '../../Utils/CommonUtil';
import Loader from '../../Utils/Loader';
import CheckConnection from '../../Components/CheckConnection';
import SelectType from "../../Utils/SelectType";
import * as Codes from '../../Constants/Codes';
import DaumPostcode from '../../Utils/DaumPostCode';

import { Auth, CurrentAuthUiState, AuthType } from "@psyrenpark/auth";
import { apiObject } from "../../Apis/Member";

export default class SignInStep03BScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            thisUUID : null,
            showModalDaum : false,
            formKind : 'Z',
            loading : true,
            moreLoading :false,
            showdupid : false,
            showdupid_text : '',
            showdupname: false,
            showdupname_text : '',
            showcheckpass :false,
            formMemberType : 'A',
            formUserId : '',
            formCompanyName : '',
            formCeoName : '',
            formPasswd : '',
            formPasswd2 :'',
            formAreaCode : '1100000000',
            formAddress : '',
            formZipcode : null,
            formLatitude : null,
            formLongitude : null,
            formBusinessCode : '',
            formTel : '',
            formProfile : null,
            isStatus : 'use',
            dupCheckUID : false,
            areaCode : []
        }
    }

    async UNSAFE_componentWillMount() {
        //console.log('Codes',Codes.COMMON_CODE_AREA)  ;
        //console.log('SignInStep03BScreen',this.props.extraData.params);
        if ( CommonUtil.isEmpty(this.props.extraData.params.screenData)) {
            CommonFunction.fn_call_toast('잘못된 접근입니다',1500);
            setTimeout(() => {
                this.props.navigation.goBack(null);
            }, 1500);
        }else{
            const { formEmail,formKind,formProfileImage,formpw,formUserName,formMemberType } = this.props.extraData.params.screenData;
            this.setState({
                areaCode : Codes.COMMON_CODE_AREA,
                formPasswd : formpw,
                formPasswd2 : formpw,
                formUserId : formEmail,
                formCeoName : formUserName,
                formCompanyName : formUserName,
                formProfile : formProfileImage,                
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
    animatedHeight = new Animated.Value(SCREEN_HEIGHT * 0.6);
    closeModalDaum = () => {
        this.setState({ showModalDaum: false });      
    }

    showModalDaum = () => {
        this.setState({showModalDaum: true})
    }

    //우편번호 정리
    setAddress = (data) => {
        //console.log('address', data);
        this.setState({
            formZipcode : data.zonecode,
            formAddress : data.address,
            formLatitude : null,
            formLongitude : null
        });
        if ( !CommonUtil.isEmpty(data.address)) {
            this.convertAddressToLoaction(data.address)
        }else{
            CommonFunction.fn_call_toast('정확한 주소를 입력해주세요!',2000);
            return false;
        }
        this.closeModalDaum();
    }

    convertAddressToLoaction = async( address = null) => {
        //console.log('convertAddressToLoaction', address);
        let toastMessage = "";
        this.setState({moreLoading:true})
        await CommonUtil.callAPI( 'http://dapi.kakao.com/v2/local/search/address.json?query=' +  address,{
            method: 'GET', 
            headers: new Headers({
                Accept: 'application/json',                
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': 'KakaoAK 05dceba30de39d5c09de4c4160b8b94a'
            }), 
                body:null
        },10000
        ).then(response => {
            //console.log('response',response);
            if ( CommonUtil.isEmpty(response.documents[0].address.x) || CommonUtil.isEmpty(response.documents[0].address.y) ){
                toastMessage = '정확한 주소를 다시 입력해주세요';
                CommonFunction.fn_call_toast(toastMessage,2000);
                this.setState({moreLoading:false})
            }else if ( !CommonUtil.isEmpty(response.documents[0].address.x) && !CommonUtil.isEmpty(response.documents[0].address.y) ){
                this.setState({
                    formLatitude : parseFloat(response.documents[0].address.y),
                    formLongitude : parseFloat(response.documents[0].address.x),
                    moreLoading:false                   
                })
            }else{
                toastMessage = response.message;
                CommonFunction.fn_call_toast(toastMessage,2000);
                this.setState({moreLoading:false})
            }
        })
        .catch(err => {
            //console.log('errerrerrerr',err);
            toastMessage = '정확한 주소를 다시 입력해주세요2';
            CommonFunction.fn_call_toast(toastMessage,2000);
            setTimeout(() => {
                this.setState({moreLoading:false})
            }, 2000)
        });
        
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
        
        if ( CommonUtil.isEmpty(this.state.formUserId)) {
            CommonFunction.fn_call_toast('아이디를 입력해주세요',2000);
            return false;
        }else if ( this.state.dupCheckUID === false) {
            CommonFunction.fn_call_toast('아이디 중복확인을 체크해주세요',2000);
            return false;
        }else if ( CommonFunction.ValidateEmail(this.state.formUserId) === false) {
            CommonFunction.fn_call_toast('정확한 이메일을 입력해주세요',2000);
            return false;
        }else if ( this.state.formPasswd.length < 6 || this.state.formPasswd2.length < 6) {
            CommonFunction.fn_call_toast('비밀번호를 6자리이상 입력해주세요',2000);
            return false;
        }else if ( this.state.formPasswd != this.state.formPasswd2) {
            CommonFunction.fn_call_toast('비밀번호가 일치하지 않습니다.',2000);
            return false;
        }else if ( CommonFunction.checkKor(this.state.formPasswd)) {
            CommonFunction.fn_call_toast('비밀번호는 영문대소,숫자,특수문자로만 가능합니다.',2000);
            return false;  
        }else if ( CommonUtil.isEmpty(this.state.formLatitude)) {
            CommonFunction.fn_call_toast('정확한 주소를 입력해주세요',2000);
            return false;
        }else if ( CommonUtil.isEmpty(this.state.formCompanyName)) {
            CommonFunction.fn_call_toast('사업자명을 입력해주세요',2000);
            return false;
        }else if ( CommonUtil.isEmpty(this.state.formBusinessCode)) {
            CommonFunction.fn_call_toast('사업자등록번호를 입력해주세요',2000);
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
            )
        }
    }

    registComplete = async() => {
        await this.setState({moreLoading : true});
        let md5Tel = "";
        if ( !CommonUtil.isEmpty(this.state.formTel)) md5Tel = CommonFunction.fn_dataEncode(this.state.formTel);
        let md5formpw = "";
        if ( !CommonUtil.isEmpty(this.state.formPasswd)) md5formpw = CommonFunction.fn_dataEncode(this.state.formPasswd);
        let md5Email = "";
        if ( !CommonUtil.isEmpty(this.state.formUserId)) md5Email = CommonFunction.fn_dataEncode(this.state.formUserId);
        //console.log("md5Telmd5Telmd5Tel:",md5Tel);      
       
        Auth.signUpProcess(
            {
                email: this.state.formUserId.toLowerCase(),
                password: this.state.formPasswd,
                authType: AuthType.EMAIL,
                lang: "ko", // 가입시 유저 선택 언어
                cognitoRegComm: {
                    // 서버에서 회원가입시 처리할 필요 파라미터를 첨부한다.
                    join_type: this.state.formKind,//F:Facebook, N:Naver, K:Kakao, A:Apple,G:Google,T:Twitter, I:Instrgram,Z:동네선수
                    user_type : this.state.formMemberType,
                    uid : md5Email,                    
                    passwd : md5formpw,
                    name : this.state.formCeoName,
                    nickname : this.state.formCompanyName,
                    company_name : this.state.formCompanyName,
                    area_code :  CommonUtil.isEmpty(this.state.formAreaCode) ? '1100000000' : this.state.formAreaCode,
                    address : this.state.formAddress,
                    telephone : md5Tel,
                    business_code :  this.state.formBusinessCode,
                    profile_url :  this.state.formKind === 'Z' ? '' : this.state.formProfile,
                    use_agree_date : new Date(),
                    private_agree_date :  new Date(),
                    market_agree_date :  new Date(),
                    is_status : this.state.isStatus,
                    zipcode : this.state.formZipcode,
                    latitude : this.state.formLatitude,
                    longitude : this.state.formLongitude,
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
                this.setState({moreLoading : false});
                this.movesignup()
            },
            (error) => {
                // 회원가입 실패
                //console.log("error1111:",error);
                this.setState({moreLoading : false});
                if ( error.code == 'InvalidParameterException') {
                    CommonFunction.fn_call_toast('이 이메일은 더이상 사용하실 수 없습니다.',2000);
                }else if ( error.code == 'UsernameExistsException') { 
                    CommonFunction.fn_call_toast('이 이메일은 더이상 사용하실 수 없습니다.',2000);
                    
                }else{
                    CommonFunction.fn_call_toast('시스템 오류가 발생하였습니다.',2000);
                }
            }
        );
        
    }

    checkDup = async() => {
        console.log('this.state.formUserId',CommonFunction.ValidateEmail(this.state.formUserId));
        if ( CommonFunction.ValidateEmail(this.state.formUserId)) {
            if ( !CommonUtil.isEmpty(this.state.formUserId)) {            
                this.setState({moreLoading:true})
                let returnCode = {code:9998};
                try {
                    returnCode = await apiObject.API_checkDupUserId({
                        locale: "ko",
                        member_id : CommonFunction.fn_dataEncode(this.state.formUserId)
                    }); 
                    //console.log('returnCode',returnCode);
                    if ( returnCode.code === '0000') {
                        this.setState({moreLoading:false,dupCheckUID:true,showdupid:true,showdupid_text:'사용가능한 아이디입니다.'})
                    }else{                        
                        this.setState({moreLoading:false,dupCheckUID:false,showdupid :true,showdupid_text:'이 이메일은 더이상 사용하실 수 없습니다.'})
                        return false;
                    }
                    
                }catch(e){
                    //console.log('returnCode error1',e)
                    this.setState({moreLoading:false})
                    CommonFunction.fn_call_toast('로그인중 오류가 발생하였습니다.',2000);
                    return false;
                    
                }
            }
        }else{
            CommonFunction.fn_call_toast('정확한 이메일을 입력해주세요',2000);
            return false;
        }
    }

    selectFilter = (filt) => {     
        //console.log('selectFilter',filt)
        this.setState({formAreaCode : this.state.areaCode[filt-1].code});
    }

    setEmailAddress = (val) => {
        let dataval = val.trim();
        //console.log('dataval',dataval);
        this.setState({
            formUserID:dataval.toLowerCase(),
            upCheckUID:false,
            showdupid:false,
            showdupid_text:''
        })
    }


    setTelphone = (val) => {
        const val2 = CommonFunction.replaceAll(val,"-","")
        const val22 = CommonFunction.replaceAll(val2,".","")
        this.setState({formTel:val22.trim()})
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
                            아이디와 기본정보등을
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
                                onChangeText={text=>this.setState({formUserId:text.toLowerCase().trim(),dupCheckUID:false,showdupid:false,showdupid_text:''})}
                                multiline={false}
                                clearButtonMode='always'
                            />
                        </View> 
                        <TouchableOpacity style={styles.middleDataRightWarp} onPress={()=>this.checkDup()}>
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
                    <View style={styles.middleTitleWarp}>
                        <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor777]}>사업자명</CustomTextR>
                    </View>
                    <View style={styles.middleDataWarp}>
                        <View style={{flex:1}}>
                            <TextInput                                          
                                placeholder={'사업자명을 입력해주세요'}
                                placeholderTextColor={DEFAULT_COLOR.base_color_666}                           
                                style={[styles.inputBlank,CommonStyle.defaultOneWayForm]}
                                value={this.state.formCompanyName}
                                onChangeText={text=>this.setState({formCompanyName:text.trim()})}
                                multiline={false}
                                clearButtonMode='always'
                            />
                        </View>
                    </View> 
                    <View style={styles.middleBottomWarp} />

                    <View style={styles.middleTitleWarp}>
                        <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor777]}>대표자이름</CustomTextR>
                    </View>
                    <View style={styles.middleDataWarp}>
                        <View style={{flex:1}}>
                            <TextInput                                          
                                placeholder={'대표자이름을 입력해주세요'}
                                placeholderTextColor={DEFAULT_COLOR.base_color_666}                           
                                style={[styles.inputBlank,CommonStyle.defaultOneWayForm]}
                                value={this.state.formCeoName}
                                onChangeText={text=>this.setState({formCeoName:text.trim()})}
                                multiline={false}
                                clearButtonMode='always'
                            />
                        </View>
                    </View> 
                    
                    <View style={styles.middleBottomWarp} />
                    <View style={styles.middleTitleWarp}>
                        <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor777]}>지역구</CustomTextR>
                    </View>
                    <View style={styles.middleDataWarp}>
                        <View style={{flex:1,justifyContent: 'center',alignItems: 'center',marginHorizontal:10}}>
                            <DropBoxIcon />
                            <SelectType
                                isSelectSingle
                                style={{borderWidth:0}}
                                selectedTitleStyle={{
                                    color: DEFAULT_COLOR.base_color_666,
                                    fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize14),
                                    lineHeight: DEFAULT_TEXT.fontSize14 * 1.42,
                                }}
                                colorTheme={DEFAULT_COLOR.base_color_666}
                                popupTitle="지역구선택"
                                title={'지역구선택'}
                                showSearchBox={false}
                                cancelButtonText="취소"
                                selectButtonText="선택"
                                data={this.state.areaCode}
                                onSelect={data => {
                                    this.selectFilter(data)
                                }}
                                onRemoveItem={data => {
                                    this.state.areaCode[0].checked = true;
                                }}
                                initHeight={SCREEN_HEIGHT * 0.7}
                            />
                        </View>
                    </View> 
                    <View style={styles.middleBottomWarp} />
                    <View style={[styles.middleTitleWarp,{flexDirection:'row'}]}>
                        <View style={{flex:1}}>
                            <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor777]}>주소</CustomTextR>
                        </View>
                        <View style={{flex:5,alignItems:'flex-end'}}>
                            { CommonUtil.isEmpty(this.state.formLatitude)
                            ?
                            <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColorRed]}>정확한 주소를 선택하여 입력해주세요</CustomTextR>
                            :
                            <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColorRed]}>정상적인 주소입니다.</CustomTextR>
                            }
                        </View>
                    </View>
                    <View style={styles.middleDataWarp}>
                        <TouchableOpacity 
                            style={{flex:1,paddingHorizontal:10,paddingVertical:15}} 
                            onPress={()=>this.showModalDaum()}>                           
                            <CustomTextR style={[CommonStyle.textSize12,CommonStyle.base_color_666]}>
                                {CommonUtil.isEmpty(this.state.formAddress) ? '클릭하여 주소를 입력해주세요' : this.state.formAddress}
                            </CustomTextR>
                        </TouchableOpacity>
                    </View>                      
                    <View style={styles.middleBottomWarp} />
                    <View style={styles.middleTitleWarp}>
                        <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor777]}>전화번호</CustomTextR>
                    </View>
                    <View style={styles.middleDataWarp}>
                        <View style={{flex:1}}>
                            <TextInput   
                                keyboardType={'number-pad'}
                                placeholder={'전화번호를 입력해주세요'}
                                placeholderTextColor={DEFAULT_COLOR.base_color_666}                           
                                style={[styles.inputBlank,CommonStyle.defaultOneWayForm]}
                                value={this.state.formTel}
                                //onChangeText={text=>this.setState({formTel:text.trim()})}
                                onChangeText={text=>this.setTelphone(text)}
                                maxLength={12}
                                multiline={false}
                                clearButtonMode='always'
                            />
                        </View>
                    </View> 
                    <View style={styles.middleBottomWarp} />
                    <View style={styles.middleTitleWarp}>
                        <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor777]}>사업자등록번호</CustomTextR>
                    </View>
                    <View style={styles.middleDataWarp}>
                        <View style={{flex:1}}>
                            <TextInput 
                                keyboardType={'number-pad'} 
                                maxLength={10} 
                                placeholder={'사업자등록번호를 입력해주세요'}
                                placeholderTextColor={DEFAULT_COLOR.base_color_666}                           
                                style={[styles.inputBlank,CommonStyle.defaultOneWayForm]}
                                value={this.state.formBusinessCode}
                                onChangeText={text=>this.setState({formBusinessCode:text.trim()})}
                                multiline={false}
                                clearButtonMode='always'
                            />
                        </View>
                    </View> 
                    <View style={styles.middleBottomWarp} />
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

                <Modal
                    onBackdropPress={this.closeModalDaum}
                    style={{justifyContent: 'flex-end',margin: 0}}
                    useNativeDriver={true}
                    animationInTiming={300}
                    animationOutTiming={300}
                    hideModalContentWhileAnimating
                    isVisible={this.state.showModalDaum}>
                    <Animated.View style={[styles.modalContainer,{ height: this.animatedHeight }]}>
                        <View style={styles.postcodeWrapper}>
                            <CustomTextR style={styles.requestTitleText2}>
                                우편번호 찾기
                            </CustomTextR>
                            <TouchableOpacity 
                                onPress= {()=> this.closeModalDaum()}
                                style={{position:'absolute',top:0,right:15,width:30,height:30}}>
                                <Icon name="close" size={30} color="#555" />
                            </TouchableOpacity>
                        </View>
                        <View style={{flex:1}}>
                            <DaumPostcode                                 
                                jsOptions={{ animated: true }}
                                onSelected={(data) => this.setAddress(data)}
                            />
                        </View>
                    </Animated.View>
                </Modal>
                
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
    },
    /**** Modal  *******/
    modalContainer: {   
        zIndex : 10,     
        position :'absolute',
        left:0,
        //top : BASE_HEIGHY,
        width:SCREEN_WIDTH,
        height: SCREEN_HEIGHT-200,
        paddingTop: 16,
        backgroundColor: '#fff'
    },
    postcodeWrapper : {
        paddingTop:5,paddingBottom:10,alignItems:'center',justifyContent:'center',borderBottomColor:'#ccc',borderBottomWidth:1
    },
    inputBlank : {
        //borderWidth:1,borderColor:DEFAULT_COLOR.input_border_color,borderRadius:5
    },
    inputDisable : {
        borderWidth:1,borderColor:'#fff',borderRadius:5,backgroundColor:'#f7f7f7'
    },
    inputAble : {
        borderWidth:1,borderColor:'#fff',borderRadius:5,backgroundColor:DEFAULT_COLOR.input_bg_color
    },
    inputHelpText : {color: '#28a5ce', fontSize: PixelRatio.roundToNearestPixel(10), fontWeight: '500', letterSpacing: -0.5}
});


