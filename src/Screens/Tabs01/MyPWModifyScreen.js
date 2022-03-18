import React, { Component } from 'react';
import {SafeAreaView,Image,View,StyleSheet,PixelRatio,Dimensions,TouchableOpacity,BackHandler} from 'react-native';
import {connect} from 'react-redux';
import {Input,Overlay} from 'react-native-elements';
import ActionCreator from '../../Ducks/Actions/MainActions';
import AsyncStorage from '@react-native-community/async-storage';
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
import { Auth, CurrentAuthUiState, AuthType } from "@psyrenpark/auth";
const ICON_KEY = require('../../../assets/icons/icon_key.png');

class MyPWModifyScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading : true,            
            formNowPassword : null,
            formNewPassword : null,
            formNewPassword2 : null,
            isResult : false,
            isResultMsg : "",
            member_pk : 0
        }
    }   

    UNSAFE_componentWillMount() {
        this.setState({member_pk : this.props.userToken.member_pk})
    }

    componentDidMount() {      
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton); 
        setTimeout(
            () => {            
                this.setState({loading:false})
            },500
        )
    }

    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);          
    }

    handleBackButton = () => {      
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);                 
        this.props.navigation.goBack(null);                
        return true;
    };

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
                    this.props.navigation.popToTop();
                }, 1000);
            },
            (error) => {
                CommonFunction.fn_call_toast('로그아웃이 실패하였습니다.',2000)
            },
            null
        );
    }

    resetAuthCode = async() => {
        if ( !CommonUtil.isEmpty(this.state.formNewPassword) && !CommonUtil.isEmpty(this.state.formNewPassword2) ) {
            if ( this.state.formNewPassword ===  this.state.formNewPassword2 ) {
                const userid = CommonFunction.fn_dataDecode(this.props.userToken.uid)
                Auth.changePasswordProcess(
                    {
                      // 만약 화면 이동을 하였다면 이 변수는 이전화면에서 가져와야할 필요가 있다. (라우팅 porps,redux, context등을 이용)
                      email: userid,
                      oldPassword: this.state.formNowPassword,
                      newPassword: this.state.formNewPassword,
                      authType: AuthType.EMAIL,
                    },
                    async (data) => {
                        //console.log('data',data)
                        // 성공처리
                        // 정상적으로 패스워드 변경
                        // 로그아웃 시켜 로그인 화면으로 이동시키는 편이 좋음
                        CommonFunction.fn_call_toast('정상적으로 변경되었습니다. 다시로그인해주세요',1500);
                        setTimeout(() => {
                            this.logoutAction();               
                        }, 1500); 
                        return true;
                    },
                    (error) => {
                        // 실패처리
                        //console.log('error',error)
                        if ( error.toString().includes('SamePasswordException')) {
                            CommonFunction.fn_call_toast('이전과 같은 비밀번호입니다. 새로운 비밀번호롤 변경해주세요',2000);
                            return true;  
                        }else if ( error.code === 'NotAuthorizedException' ) {
                            CommonFunction.fn_call_toast('현재 비밀번호가 맞지 않습니다.',2000);
                            return true;              
                        }else{
                            CommonFunction.fn_call_toast('일시적 오류가 발생하였습니다. 다시 시도해 주세요',2000);
                            return true;              
                        }
                    },
                    null
                  );                
            }else{
                this.setState({isResult :  true,isResultMsg : "비밀번호가 일치하지 않습니다."})
            }
        }
    }

    render() {
        return(
            <SafeAreaView style={ styles.container }>               
                <View style={styles.middleWarp}>
                    <View style={styles.middleDataWarp}>
                        <View style={styles.boxWrap}>
                            <View style={styles.imageWrap}>
                                <Image
                                    source={ICON_KEY}
                                    resizeMode={"contain"}
                                    style={CommonStyle.defaultIconImage20}
                                />
                            </View>
                            <View style={styles.formBoxWrap}>
                                <Input   
                                    secureTextEntry={true}
                                    value={this.state.formNowPassword}
                                    placeholder="현재 비밀번호"
                                    placeholderTextColor={DEFAULT_COLOR.base_color_666}                            
                                    inputContainerStyle={styles.inputContainerStyle}
                                    inputStyle={styles.inputStyle}
                                    clearButtonMode={'always'}
                                    onChangeText={value => this.setState({formNowPassword:value,isResult:false})}
                                />  
                            </View>
                        </View>
                        <View style={styles.boxWrap}>
                            <View style={styles.imageWrap}>
                                <Image
                                    source={ICON_KEY}
                                    resizeMode={"contain"}
                                    style={CommonStyle.defaultIconImage20}
                                />
                            </View>
                            <View style={styles.formBoxWrap}>
                                <Input   
                                    secureTextEntry={true}
                                    value={this.state.formNewPassword}
                                    placeholder="새 비밀번호"
                                    placeholderTextColor={DEFAULT_COLOR.base_color_666}                            
                                    inputContainerStyle={styles.inputContainerStyle}
                                    inputStyle={styles.inputStyle}
                                    clearButtonMode={'always'}
                                    onChangeText={value => this.setState({formNewPassword:value,isResult:false})}
                                />  
                            </View>
                        </View>
                        <View style={styles.boxWrap}>
                            <View style={styles.imageWrap}>
                                <Image
                                    source={ICON_KEY}
                                    resizeMode={"contain"}
                                    style={CommonStyle.defaultIconImage20}
                                />
                            </View>
                            <View style={styles.formBoxWrap}>
                                <Input   
                                    secureTextEntry={true}
                                    value={this.state.formNewPassword2}
                                    placeholder="새 비밀번호 확인"
                                    placeholderTextColor={DEFAULT_COLOR.base_color_666}                            
                                    inputContainerStyle={styles.inputContainerStyle}
                                    inputStyle={styles.inputStyle}
                                    clearButtonMode={'always'}
                                    onChangeText={value => this.setState({formNewPassword2:value,isResult:false})}
                                />  
                            </View>
                            
                        </View>
                        { 
                            !CommonUtil.isEmpty(this.state.isResultMsg) &&
                            <View style={{paddingHorizontal:10}}>
                                <CustomTextR style={{fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize13),color:'#c53915'}}>{this.state.isResultMsg}</CustomTextR>
                            </View>
                        }
                        {
                            ( !CommonUtil.isEmpty(this.state.formNowPassword) && !CommonUtil.isEmpty(this.state.formNewPassword) && !CommonUtil.isEmpty(this.state.formNewPassword2)) &&
                            <View style={{paddingHorizontal:10}}>
                                <CustomTextR style={{fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize16),color:'#c53915'}}>{this.state.isResultMsg}</CustomTextR>
                            </View>
                        }
                        <TouchableOpacity 
                            onPress={()=>this.resetAuthCode()}
                            style={(!CommonUtil.isEmpty(this.state.formNowPassword) && !CommonUtil.isEmpty(this.state.formNewPassword) && !CommonUtil.isEmpty(this.state.formNewPassword2) ) ? styles.buttonWrapOn : styles.buttonWrapOff }
                        >
                            <CustomTextM style={{fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize17),color:'#fff'}}>변경하기</CustomTextM>
                        </TouchableOpacity>
                    </View>
                </View>
                { 
                    this.state.moreLoading &&
                    <View style={CommonStyle.moreWrap}>
                        <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} />
                    </View>
                }
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
    middleWarp : {
        flex:1,        
        justifyContent:'center',        
        marginHorizontal:30,marginBottom:10,
        marginTop:30
    },
    middleDataWarp : {
        flex:1,
        justifyContent:'flex-start',
    },
    middleDataWarp2 : {
        flex:2,
        justifyContent:'flex-start',
    },
    titleWrap : {
        flex:1,justifyContent:'flex-end',paddingLeft:20
    },
    titleText : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize16),color:DEFAULT_COLOR.base_color_666
    },
    inputContainerStyle : {
        backgroundColor:'#fff',margin:0,padding:0,height:45
    },
    inputStyle :{ 
        margin:0,paddingLeft: 10,color: DEFAULT_COLOR.base_color_666,fontSize: PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize16)
    },
    buttonWrapOn : {
        backgroundColor:'#0059a9',padding:10,marginHorizontal:15,justifyContent:'center',alignItems:'center',borderRadius:25,marginTop:50
    },
    buttonWrapOff : {
        backgroundColor:'#ccc2e6',padding:10,marginHorizontal:15,justifyContent:'center',alignItems:'center',borderRadius:25,marginTop:50
    },
    forgetenWrap : {
        flex:1,justifyContent:'flex-start',alignItems:'center',marginHorizontal:30
    },
    forgetenText : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize16),color:'#0059a9'
    },
    boxWrap : {
        flexDirection:'row',height:50,alignItems:'center',marginTop:20
    },
    imageWrap : {
        alignItems:'center',paddingBottom:20
    },
    formBoxWrap : {
        flex:2,paddingLeft:10
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
        }
    };
}


export default connect(mapStateToProps,mapDispatchToProps)(MyPWModifyScreen);