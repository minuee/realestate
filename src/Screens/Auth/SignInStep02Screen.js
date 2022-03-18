import React, { Component } from 'react';
import {SafeAreaView,Image,View,StyleSheet,BackHandler,Dimensions,TouchableOpacity,StatusBar,Linking,KeyboardAvoidingView,ScrollView,Platform} from 'react-native';

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

const MEMBER_TYPE_A_OFF =  require('../../../assets/icons/member_type_a_off.png')
const MEMBER_TYPE_A_ON =  require('../../../assets/icons/member_type_a_on.png')
const MEMBER_TYPE_B_OFF =  require('../../../assets/icons/member_type_b_off.png')
const MEMBER_TYPE_B_ON =  require('../../../assets/icons/member_type_b_on.png')


export default class SignInStep02Screen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            thisUUID : null,
            loading : true,
            formMemberType : null,
            formKind : 'Z',
            formEmail : null,            
            formProfileImage : null,
            formpw : null,
            formUserName : null
        }
    }

    async UNSAFE_componentWillMount() {
        //console.log('SignInStep02Screen',this.props.extraData.params);
        if ( CommonUtil.isEmpty(this.props.extraData.params.screenData)) {
            CommonFunction.fn_call_toast('잘못된 접근입니다',1500);
            setTimeout(() => {
                this.props.navigation.goBack(null);
            }, 1500);
        }else{
            const { formEmail,formKind,formProfileImage,formpw,formUserName } = this.props.extraData.params.screenData;
            this.setState({
                formEmail,formProfileImage,formpw,formUserName,
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
    selectMemberType = async(type) => {
        this.setState({
            formMemberType : type
        })
    }
    nextNavigation = (nav) => {
        if ( CommonUtil.isEmpty(this.state.formMemberType) ) {
            CommonFunction.fn_call_toast('회원가입 유형을 선택해주세요',2000);return;
        }else{
            if ( this.state.formMemberType === 'N') {
                this.props.navigation.navigate('SignInStep03AStack',{
                    screenData : this.state
                });
            }else {
                this.props.navigation.navigate('SignInStep03BStack',{
                    screenData : this.state
                });
            }
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
                            회원가입 유형을
                        </CustomTextL>
                        <CustomTextL style={[CommonStyle.textSize25,CommonStyle.fontColorDefault]}>
                            선택해주세요
                        </CustomTextL>
                    </View>
                </View>            
                <View style={styles.dataCoverWarp}>         
                    <View style={styles.dataTextWarp2}>
                        <TouchableOpacity style={styles.dataTextLeftWarp} onPress={()=> this.selectMemberType('N')}>
                            <Image source={this.state.formMemberType === 'N' ? MEMBER_TYPE_A_ON : MEMBER_TYPE_A_OFF} style={styles.imageWrap} />
                            <CustomTextR style={[CommonStyle.textSize13,CommonStyle.fontColor000]}>일반사용자</CustomTextR>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.dataTextRightWarp} onPress={()=> this.selectMemberType('A')}>
                            <Image source={this.state.formMemberType === 'A' ? MEMBER_TYPE_B_ON : MEMBER_TYPE_B_OFF} style={styles.imageWrap} />
                            <CustomTextR style={[CommonStyle.textSize13,CommonStyle.fontColor000]}>착한중개인</CustomTextR>
                            <CustomTextR style={[CommonStyle.textSize13,CommonStyle.fontColor000]}>(부동산중개업소)</CustomTextR>
                        </TouchableOpacity>
                        
                    </View>
                </View>
                               
                </ScrollView>
                <TouchableOpacity style={styles.middleDataWarp2}>
                    <TouchableOpacity 
                        onPress={()=>this.nextNavigation()}
                        style={CommonUtil.isEmpty(this.state.formMemberType) ? styles.buttonWrapOff : styles.buttonWrapOn }
                    >
                        <CustomTextM style={[CommonStyle.textSize17,CommonStyle.fontColorWhite]}>다음</CustomTextM>
                    </TouchableOpacity>
                </TouchableOpacity>
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
    dataCoverWarp : {
        flex:2,justifyContent:'center',alignItems:'center',margin:20
    },
    dataTextWarp : {
        height:30,flexDirection:'row',alignItems:'center'
    },
    dataTextWarp2 : {
        flex:1,flexDirection:'row',alignItems:'center',paddingTop:20
    },
    dataTextLeftWarp : {
        flex:1,justifyContent:'center',alignItems:'center',borderRightWidth:1,borderRightColor:'#ccc',paddingVertical:10,zIndex:5
    },
    dataTextRightWarp : {
        flex:1,justifyContent:'center',alignItems:'center',paddingVertical:10,zIndex:5
    },   
    imageWrap : {
        width:51*1.3,height:53*1.3,marginBottom:10
    } 
});


