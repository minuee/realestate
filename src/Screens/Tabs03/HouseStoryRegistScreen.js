import React, { Component,useCallback, useState } from 'react';
import {SafeAreaView,ScrollView,TextInput,KeyboardAvoidingView, Platform, TouchableOpacity, View,StyleSheet,Image,Dimensions,PixelRatio,Text,BackHandler,Alert} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import 'moment/locale/ko'
import  moment  from  "moment";
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
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
import  * as SpamWords   from '../../Constants/FilterWords';
import Loader from '../../Utils/Loader';
import TextTicker from '../../Utils/TextTicker';
const ICON_CLIP = require('../../../assets/icons/icon_clip.png');
const ICON_ADD_IMAGE = require('../../../assets/icons/btn_add_img.png');
const ICON_DEL_IMAGE = require('../../../assets/icons/btn_del_img.png');

import { apiObject } from "../../Apis/Api";
import { Storage } from "@psyrenpark/storage";
class HouseStoryRegistScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading : false,
            formTitle : '',
            formContents : '',
            attachFileSize : 0,
            arrayImageUpload : false,
            photoarray: [],
        }
    }
    resetForm = () => {
        this.setState({
            loading : false,
            formTitle : '',
            formContents : '',
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
    
   
    registStory = async() => {
        if ( this.state.formTitle.length < 5 ) { 
            CommonFunction.fn_call_toast('제목을 5자이상 입력해주세요',2000);
            return false;
        }else if ( this.state.formContents.length < 10 ) { 
            CommonFunction.fn_call_toast('내용을 최소 10자이상 입력해주세요',2000);
            return false;
        }else{
            Alert.alert(
                DEFAULT_CONSTANTS.appName,      
                "하우스 이야기를 등록하시겠습니까?",
                [
                    {text: '네', onPress: () => this.actionRegist()},
                    {text: '아니오', onPress: () => console.log('Cancle')},
                    
                ],
                { cancelable: true }
            )       
        }
    }

    actionRegist = async() => {
        this.setState({moreLoading:true})
        let image_url_1  = "";
        let image_url_2  = "";
        let image_url_3  = "";
        let image_url_4  = "";
        if ( !CommonUtil.isEmpty(this.state.photoarray[0]) ) {
            image_url_1 =  await this.awsimageupload(this.state.photoarray[0],1);   
        }
        if ( !CommonUtil.isEmpty(this.state.photoarray[1]) ) {
            image_url_2 =  await this.awsimageupload(this.state.photoarray[1],2);   
        }
        if ( !CommonUtil.isEmpty(this.state.photoarray[2]) ) {
            image_url_3 =  await this.awsimageupload(this.state.photoarray[2],3);   
        }
        if ( !CommonUtil.isEmpty(this.state.photoarray[3]) ) {
            image_url_4 =  await this.awsimageupload(this.state.photoarray[3],4);   
        }
        let formTitle = await CommonFunction.isForbiddenWord( this.state.formTitle, SpamWords.FilterWords.badWords); 
        let formContents = await CommonFunction.isForbiddenWord( this.state.formContents, SpamWords.FilterWords.badWords); 
        let returnCode = {code:9998};        
        try {
            returnCode = await apiObject.API_HouseStoryRegist({
                locale: "ko",                
                formTitle : formTitle,
                formContents : formContents,
                image_1 : image_url_1,
                image_2 : image_url_2,
                image_3 : image_url_3,
                image_4 : image_url_4,
            }); 
            //console.log('returnCode',returnCode);
            if ( returnCode.code === '0000') {
                this.setState({moreLoading:false})
                CommonFunction.fn_call_toast('정상적으로 등록되었습니다',1500);
                this.props._updateisReloadMode(true);
                setTimeout(
                    () => {            
                        this.props.navigation.goBack(null);
                    },1500
                )
            }else{
                this.setState({moreLoading:false})
                CommonFunction.fn_call_toast('등록에 실패하였습니다.',2000);
            }            
        }catch(e){
            console.log('eeeee',e);
            this.setState({moreLoading:false})
            CommonFunction.fn_call_toast('등록에 실패하였습니다2.',2000);
        }
    }

    awsimageupload = async(item,idx) => {
        //console.log('awsimageupload',item);
        const result = await fetch(item.uri);
        const blob = await result.blob();
        let nowTimeStamp = moment()+840 * 60 * 1000;  // 서울
        let imgtype = await CommonFunction.getImageType(item.type)
        let newfilename = 'story/' + nowTimeStamp + '_' + idx + '.' +　imgtype;
        try {
            let returnData = await Storage.put({
                key: newfilename, // "test.jpg",
                object: blob,
                config: {
                    contentType: item.type // "image/jpeg",
                }
            })
            if ( CommonUtil.isEmpty(returnData.key)) {
                CommonFunction.fn_call_toast('이미지 업로드중 오류가 발생하였습니다. 잠시후 다시 이용해주세요',2000);
                return null;
            }else{
                //console.log('returnData.key',returnData.key);
                this.setState({
                    newimageUrl : newfilename
                });
                return newfilename;
            }
            
        } catch (error) {
            //  실패
            CommonFunction.fn_call_toast('이미지 업로드중 오류가 발생하였습니다. 잠시후 다시 이용해주세요',2000);
            this.setState({loading:false})
            return null;
        }
    }

    removeAttachImage = async(idx) => {
        //console.log('removeAttachImage()', 'target = ' + JSON.stringify(this.state.photoarray[idx]))

        let selectedFilterList = await this.state.photoarray.filter((info,index) => index !== idx);
        this.setState({
            photoarray: selectedFilterList,
            attachFileSize: this.state.attachFileSize - this.state.photoarray[idx].fileSize,
        })
    }

    localcheckfile = () => {
        const options = {
            noData: true,
            title : '이미지 선택',
            takePhotoButtonTitle : '카메라 찍기',
            chooseFromLibraryButtonTitle:'이미지 선택',
            cancelButtonTitle : '취소',
            maxWidth: 1024,
            maxHeight: 1024,
            allowsEditing: true,
            noData: true
        }
        launchImageLibrary(options, response => {
            try {
                if( response.type.indexOf('image') != -1) {
                    if (response.uri) {
                        //console.log('response.uri', response)
                        if ( parseInt((response.fileSize)/1024/1024) > 5 ) {
                            CommonFunction.fn_call_toast('이미지 용량이 50MB를 초과하였습니다',2000)
                            return;
                        }else{
                            //console.log('localcheckfile()', 'response = ' + JSON.stringify(response))

                            let fileName = response.fileName;
                            if ( CommonUtil.isEmpty(fileName)) {
                                let spotCount = response.path.split('.').length-1;
                                let pathExplode = response.path.split('.') 
                                fileName = Platform.OS + moment().unix() + '.'+pathExplode[spotCount];
                            }
                            this.state.photoarray.push({
                                type : response.type === undefined ? 'image/jpeg' :  response.type,
                                uri : response.uri, 
                                width : response.width, 
                                height : response.height, 
                                size:response.fileSize,
                                fileName
                            });
                            this.setState({
                                attachFileSize :  this.state.attachFileSize+response.fileSize
                            })
                            this.ScrollView2.scrollToEnd({ animated: true});
                           
                        }
                    }
                }else{
                    CommonFunction.fn_call_toast('정상적인 이미지 파일이 아닙니다.',2000)
                    return;
                }
            }catch(e){
                //console.log("eerorr ", e)        
            }
        })
    }

    renderImageUpload (){    
       
        return (
            <View style={{flex:1,flexGrow:1,flexDirection:'row'}}>
                {
                this.state.photoarray.map((data, index) => {
                    return (                
                        <View style={styles.imageOuterWrap} key={index}>
                            <TouchableOpacity 
                                onPress={() => this.removeAttachImage(index)}
                                style={styles.imageDataWarp}
                            >
                                <Image
                                    source={ICON_DEL_IMAGE}
                                    resizeMode='contain'
                                    style={{ width: 24, height: 24 }}
                                />
                            </TouchableOpacity>
                            <Image
                                source={{ uri: data.uri }}
                                resizeMode='cover'
                                style={{ width: "100%", height: '100%' }}
                            />                        
                        </View>
                    )}
                )
                }
                {this.state.photoarray.length < 4 &&
                    <TouchableOpacity 
                        onPress={() => this.localcheckfile()}
                        style={styles.imageOuterWrap2}>
                        <Image
                            source={ICON_ADD_IMAGE}
                            resizeMode='contain'
                            style={{width:'100%',height:'100%'}}
                        />
                    </TouchableOpacity>
                }
            </View>
        )
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
                            placeholder={'제목을 입력해주세요'}
                            placeholderTextColor={DEFAULT_COLOR.base_color_999}                           
                            style={[styles.inputBlank,CommonStyle.defaultOneWayForm]}
                            value={this.state.formTitle}
                            onChangeText={text=>this.setState({formTitle:text})}
                            multiline={false}
                            clearButtonMode='always'
                        />
                    </View> 

                    <View style={{paddingHorizontal:20}}>
                        <TextInput         
                            placeholder={'내용을 입력해주세요'}
                            placeholderTextColor={DEFAULT_COLOR.base_color_999}                           
                            style={[styles.inputBlank2,styles.textInputStyle]}
                            value={this.state.formContents}
                            onChangeText={text=>this.setState({formContents:text})}
                            multiline={true}
                            clearButtonMode='always'
                        />
                    </View>
                    <View style={{paddingHorizontal:20,flexDirection:'row',flexGrow:1,alignItems:'center'}}>
                        <Image source={ICON_CLIP} style={CommonStyle.defaultIconImage20} />
                        <CustomTextR style={CommonStyle.titleText}>첨부파일(최대4개)</CustomTextR>
                        
                    </View>
                    <View style={{marginHorizontal:15,paddingVertical:10,marginTop:5}}>
                        <ScrollView 
                            horizontal={true}
                            ref={(ref) => {
                                this.ScrollView2 = ref;
                            }}
                            nestedScrollEnabled={true}
                        >
                            {this.renderImageUpload()}
                        </ScrollView>
                        <View style={{flexGrow:1,flexDirection:'row',marginTop:20, marginBottom:15}}>
                            <View style={{justifyContent:'center',width: (SCREEN_WIDTH - 16 - 8) / 4 * 3}}>
                                <View style={{height:3,width:'100%',backgroundColor:DEFAULT_COLOR.input_bg_color}}>
                                    <View style={{
                                        height:3,
                                        width:(
                                            this.state.attachFileSize > 0
                                                ? parseInt(this.state.attachFileSize/1024/1024)
                                                : 0
                                        ) / 50 * 100 + '%',
                                        backgroundColor: DEFAULT_COLOR.input_border_color
                                    }}
                                    >
                                    </View>
                                </View>
                            </View>
                            <View style={{flexDirection: 'row',justifyContent:'center',paddingRight: 8, width: (SCREEN_WIDTH - 30) / 4 * 1,
                            }}>
                                <CustomTextM style={styles.imageText}>
                                    {this.state.attachFileSize > 0 ? (this.state.attachFileSize/1024/1024).toFixed(1) : 0}/
                                </CustomTextM>
                                <CustomTextM style={styles.imageText}>
                                    50MB
                                </CustomTextM>
                            </View>                                
                        </View>
                        
                    </View>                     
                    { this.state.moreLoading &&
                        <View style={CommonStyle.moreWrap}>
                            <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} />
                        </View>
                    }
                    </ScrollView>
                    <TouchableOpacity style={styles.middleDataWarp2}>
                        <TouchableOpacity 
                            onPress={()=>this.registStory()}
                            style={styles.buttonWrapOn }
                        >
                            <CustomTextM style={[CommonStyle.textSize17,CommonStyle.fontColorWhite]}>작성완료</CustomTextM>
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
    
    textInputStyle : {
        minHeight:200,maxHeight:SCREEN_HEIGHT*0.5,width:'100%',paddingTop: 5,paddingBottom: 5,paddingLeft: 5,paddingRight: 5,textAlignVertical: 'top',textAlign:'left',fontSize: PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize13)
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
    cellDefaultWrap : {
        paddingHorizontal:5,flexDirection:'row'
    },
    cellDefaultWrap5 : {
        paddingHorizontal:5,flexDirection:'row',marginTop:5
    },
    cellDefaultWrap15 : {
        paddingHorizontal:5,flexDirection:'row',marginTop:15
    },
    cellDefaultRowWrap :{
        paddingHorizontal:5,paddingVertical:10,marginTop:15,flexDirection:'row'
    },
    imageOuterWrap : {
        flex: 1,width: (SCREEN_WIDTH) / 4 - 8,height: (SCREEN_WIDTH - 16 - 8) / 4 - 8,justifyContent: 'flex-end',alignItems: 'flex-end', marginRight: 8,borderWidth: 1,borderColor: '#ccc',overflow: 'hidden',
    },
    imageOuterWrap2 : {
        flex: 1,width: (SCREEN_WIDTH) / 4 - 8,height: (SCREEN_WIDTH - 16 - 8) / 4 - 8,justifyContent: 'flex-end',alignItems: 'flex-end'
    },
    imageDataWarp : {position: 'absolute',width: 24,height: 24,zIndex: 2,borderColor: '#ccc',backgroundColor: 'transparent'
    },
    imageText : {
        color:DEFAULT_COLOR.base_color_666,fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.body_12),lineHeight: DEFAULT_TEXT.body_12 * 1.42
    },
    CheckBoxWrap : {
        flex:1,flexDirection:'row',alignItems:'center'
    },
});

function mapStateToProps(state) {
    return {
        userToken : state.GlabalStatus.userToken
    };
}

function mapDispatchToProps(dispatch) {
    return {        
        _updateisReloadMode:(bool)=> {
            dispatch(ActionCreator.updateisReloadMode(bool))
        },
    };
}


export default connect(mapStateToProps,mapDispatchToProps)(HouseStoryRegistScreen);