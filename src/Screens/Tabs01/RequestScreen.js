import React, { Component,useCallback, useState } from 'react';
import {SafeAreaView,ScrollView,TextInput,KeyboardAvoidingView, Platform, TouchableOpacity, View,StyleSheet,Image,Dimensions,PixelRatio,BackHandler,Alert,Animated} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import {connect} from 'react-redux';
import ActionCreator from '../../Ducks/Actions/MainActions';
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
import { apiObject } from "../../Apis/Api";

const ICON_COMMOM_DOT = require('../../../assets/icons/icon_dot.png');
class RequestScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            moreLoading : false,
            formTitle : null,
            formContents : null,
        }
    }
    resetForm = () => {
        this.setState({
            loading : false,
            moreLoading:false,
            formTitle : null,
            formContents : null,
        })
    }
 
    async UNSAFE_componentWillMount() {
        this.props.navigation.addListener('focus', () => {
            this.resetForm();              
        })

        this.props.navigation.addListener('blur', () => {
        })
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

    setupSearchCondition = async() => {
        if ( CommonUtil.isEmpty(this.state.formTitle)) {
            CommonFunction.fn_call_toast('제목을 입력해주세요',2000);
            return false;
        }else if ( CommonUtil.isEmpty(this.state.formContents)) {
            CommonFunction.fn_call_toast('문의내용을 입력해주세요',2000);
            return false;
        }else{
            Alert.alert(
                DEFAULT_CONSTANTS.appName,      
                "문의하기를 등록하시겠습니까?",
                [
                    {text: '네', onPress: () => this.actionDeclaration()},
                    {text: '아니오', onPress: () => console.log('Cancle')},
                ],
                { cancelable: true }
            )            
        }
    }

    actionDeclaration =  async() => {
        
        this.setState({moreLoading:true})
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_registInquiry({
                locale: "ko",                
                formTitle :  this.state.formTitle,
                formContents : this.state.formContents
            });
            if ( returnCode.code === '0000') {
                CommonFunction.fn_call_toast('정상적으로 등록되었습니다.',1500);
                this.resetForm();
                setTimeout(() => {
                    this.props.navigation.goBack(null);
                }, 1500);
            }else{
                CommonFunction.fn_call_toast('오류가 발생하였습니다. 잠시후에 다시 이용해주십시요',1500)
                setTimeout(() => {
                    this.setState({moreLoading:false})                    
                }, 1000);  
            }
            
        }catch(e){
            CommonFunction.fn_call_toast('오류가 발생하였습니다. 잠시후에 다시 이용해주십시요',1500)
                setTimeout(() => {
                    this.setState({moreLoading:false}) 
            }, 1000); 
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
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        indicatorStyle={'white'}
                    >
                    <View style={{padding:20}}>
                        <TextInput          
                            placeholder={'제목을 입력해주세요'}
                            placeholderTextColor={DEFAULT_COLOR.base_color_666}                           
                            style={[styles.inputBlank,CommonStyle.defaultOneWayForm]}
                            value={this.state.formTitle}
                            onChangeText={text=>this.setState({formTitle:text})}
                            multiline={false}
                            clearButtonMode='always'
                        />
                    </View>
                    <View style={{paddingHorizontal:20}}>
                        <TextInput         
                            placeholder={'문의내용을 입력해주세요'}
                            placeholderTextColor={DEFAULT_COLOR.base_color_666}                           
                            style={[
                                styles.inputBlank2,
                                {
                                    height:SCREEN_HEIGHT*0.45,width:'100%',paddingTop: 5,paddingBottom: 5,paddingLeft: 5,paddingRight: 5,textAlignVertical: 'top',textAlign:'left',fontSize: PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize13)
                                }]}
                            value={this.state.formContents}
                            onChangeText={text=>this.setState({formContents:text})}
                            multiline={true}
                            clearButtonMode='always'
                        />
                    </View>
                    <View style={styles.inforWrap}>
                        <View style={styles.inforLeftWrap}>
                            <Image source={ICON_COMMOM_DOT} resizeMode={'contain'} style={styles.dotWrap} />
                        </View>
                        <View style={styles.infoRightWrap}>
                            <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColorccc]}>문의하신 내용의 답변은 이메일로 발송 됩니다.</CustomTextR>
                        </View>
                    </View>
                    <View style={styles.inforWrap}>
                        <View style={styles.inforLeftWrap}>
                            <Image source={ICON_COMMOM_DOT} resizeMode={'contain'} style={styles.dotWrap} />
                        </View>
                        <View style={styles.infoRightWrap}>
                            <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColorccc]}>카카오톡 문의는 채널검색에서 "착한 부동산"을 추가하고 문의하시기 바랍니다.</CustomTextR>
                        </View>
                    </View>    
                    <View style={styles.inforWrap}>
                        <View style={styles.inforLeftWrap}>
                            <Image source={ICON_COMMOM_DOT} resizeMode={'contain'} style={styles.dotWrap} />
                        </View>
                        <View style={styles.infoRightWrap}>
                            <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColorccc]}>탈퇴 원할 시 이메일 주소 전체를 적어서 보내주세요.</CustomTextR>
                        </View>
                    </View>
                                   
                    <View style={CommonStyle.blankArea}></View>
                        { 
                            this.state.moreLoading &&
                            <View style={CommonStyle.moreWrap}>
                                <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} />
                            </View>
                        }
                    </ScrollView>
                    <TouchableOpacity style={styles.middleDataWarp2}>
                        <TouchableOpacity 
                            onPress={()=>this.setupSearchCondition()}
                            style={styles.buttonWrapOn }
                        >
                            <CustomTextM style={[CommonStyle.textSize17,CommonStyle.fontColorWhite]}>작성완료</CustomTextM>
                        </TouchableOpacity>
                    </TouchableOpacity> 
                    { 
                        this.state.moreLoading &&
                        <View style={CommonStyle.moreWrap}>
                            <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} />
                        </View>
                    }
                </KeyboardAvoidingView>               
                </SafeAreaView>
            );
        }
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,backgroundColor : "#fff",
    },
    IndicatorContainer : {
        flex: 1,
        width:'100%',
        backgroundColor : "#fff",
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inforWrap : {
        flexDirection:'row',paddingHorizontal:20,marginVertical:2
    },
    inforLeftWrap : {
        width:15,justifyContent:'flex-start',alignItems:'center',paddingTop:7
    },
    infoRightWrap : {
        flex:5,justifyContent:'center', paddingLeft:5
    },
    dotWrap :{ 
        width:5,height:5,paddingHorizontal:5
    },
    middleDataWarp2 : {
        height:120,
        justifyContent:'center',
        paddingTop:10,paddingBottom:20,paddingHorizontal:20
    },
    buttonWrapOn : {
        backgroundColor:DEFAULT_COLOR.base_color,padding:10,justifyContent:'center',alignItems:'center',borderRadius:25
    },
    inputBlank : {
        borderBottomWidth:1,borderBottomColor:DEFAULT_COLOR.input_border_color,borderRadius:5,backgroundColor:'#fff'
    },
    inputBlank2 : {
        borderWidth:0,borderBottomColor:DEFAULT_COLOR.input_border_color,borderRadius:5,backgroundColor:'#fff'
    },
});



function mapStateToProps(state) {
    return {
        userToken : state.GlabalStatus.userToken
    };
}

export default connect(mapStateToProps,null)(RequestScreen);

