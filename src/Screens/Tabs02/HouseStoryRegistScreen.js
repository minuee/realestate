import React, { Component,useCallback, useState } from 'react';
import {SafeAreaView,ScrollView,TextInput,KeyboardAvoidingView, Platform, TouchableOpacity, View,StyleSheet,Image,Dimensions,PixelRatio,Text,Alert,Animated} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import 'moment/locale/ko'
import  moment  from  "moment";
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
import TextTicker from '../../Utils/TextTicker';
import { apiObject } from "../../Apis/Api";
import  * as SpamWords   from '../../Constants/FilterWords';
class HouseStoryRegistScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading : false,
            formTitle : null,
            formContents : '',
            screenData : {},
            apart_code : null,
        }
    }
    resetForm = () => {
        this.setState({
            loading : false,
            formTitle : null,
            formContents : null,
        })
    }
 
    async UNSAFE_componentWillMount() {
        if ( CommonUtil.isEmpty(this.props.extraData.params.apart_code)) {
            CommonFunction.fn_call_toast('잘못된 접근입니다',1500);
            setTimeout(
                () => {            
                    this.props.navigation.goBack(null);
                },1500
            )
        }else{
            this.setState({
                screenData : this.props.extraData.params.screenData,
                apart_code : this.props.extraData.params.apart_code,
            })
        }
        this.props.navigation.addListener('focus', () => {  
            this.resetForm();              
        })
        this.props.navigation.addListener('blur', () => {
        })
    }
    componentDidMount() {
    }
    componentWillUnmount(){
    }
    
    registStory = async() => {
        if ( this.state.formContents.length > 10 ) { 
            Alert.alert(
                DEFAULT_CONSTANTS.appName,      
                "아파트이야기를 등록하시겠습니까?",
                [
                    {text: '네', onPress: () => this.actionRegist()},
                    {text: '아니오', onPress: () => console.log('Cancle')}
                ],
                { cancelable: true }
            ) 
        }else{
            CommonFunction.fn_call_toast('최소 10자이상 입력해주세요',2000);
            return false;
        }
    }

    actionRegist = async() => {
        let returnCode = {code:9998};      
        let formContents = await CommonFunction.isForbiddenWord( this.state.formContents, SpamWords.FilterWords.badWords);   
        try {
            returnCode = await apiObject.API_ApartStoryRegist({
                locale: "ko",formComplexno : this.state.apart_code,                 
                formTitle : this.props.userToken.name + '님이 작성한 글입니다',
                 formContents : formContents
            }); 
            console.log('returnCode',returnCode);
            if ( returnCode.code === '0000') {
                CommonFunction.fn_call_toast('정상적으로 등록되었습니다',2000);
                this.props.navigation.goBack(null);
            }else{
                CommonFunction.fn_call_toast('등록에 실패하였습니다.',2000);
            }
            
        }catch(e){
            CommonFunction.fn_call_toast('등록에 실패하였습니다.',2000);
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
                    <View style={{flex:1,maxHeight:40,paddingHorizontal:20,paddingVertical:10}}>
                        <TextTicker
                            marqueeOnMount={true} 
                            style={{fontFamily: DEFAULT_CONSTANTS.defaultFontFamilyRegular,fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize13),color:'#999',lineHeight: DEFAULT_TEXT.fontSize13 * 1.42,}}
                            shouldAnimateTreshold={10}
                            duration={8000}
                            loop
                            bounce
                            repeatSpacer={100}
                            marqueeDelay={2000}
                        >
                            주제에 맞는 글만 작성해주세요.부적할한 콘텐츠는 통보없이 삭제될수 있습니다.
                        </TextTicker>
                    </View>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        indicatorStyle={'white'}
                    >
                    <View style={{paddingHorizontal:20}}>
                        <TextInput         
                            placeholder={'내용을 입력해주세요'}
                            placeholderTextColor={DEFAULT_COLOR.base_color_666}                           
                            style={[
                                styles.inputBlank2,
                                {
                                    minHeight:SCREEN_HEIGHT*0.5,maxHeight:SCREEN_HEIGHT*0.6,width:'100%',paddingTop: 15,paddingBottom: 5,paddingLeft: 5,paddingRight: 5,textAlignVertical: 'top',textAlign:'left',fontSize: PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize13)
                                }]}
                            value={this.state.formContents}
                            onChangeText={text=>this.setState({formContents:text})}
                            multiline={true}
                            clearButtonMode='always'
                        />
                    </View>
                    <View style={CommonStyle.blankArea}></View>
                        { 
                            this.state.moreLoading &&
                            <View style={CommonStyle.moreWrap}>
                                <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} />
                            </View>
                        }
                    </ScrollView>
                    </KeyboardAvoidingView>   
                    <TouchableOpacity style={styles.middleDataWarp2}>
                        <TouchableOpacity onPress={()=>this.registStory()} style={styles.buttonWrapOn}>
                            <CustomTextM style={[CommonStyle.textSize17,CommonStyle.fontColorWhite]}>작성완료</CustomTextM>
                        </TouchableOpacity>
                    </TouchableOpacity>
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
        userToken : state.GlabalStatus.userToken,
    };
}

export default connect(mapStateToProps,null)(HouseStoryRegistScreen);