import React, { Component,useCallback, useState } from 'react';
import {KeyboardAvoidingView,StatusBar,Alert,SafeAreaView, Platform, TouchableOpacity, View,StyleSheet,Image,Dimensions,PixelRatio,TextInput,ScrollView,BackHandler} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import 'moment/locale/ko'
import  moment  from  "moment";
import ImagePicker from 'react-native-image-crop-picker';
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
import ScalableImage from '../../Utils/ScalableImage';
import 'react-native-gesture-handler';
import Menu, {MenuItem, MenuDivider} from 'react-native-material-menu';

const BACK_BUTTON_IMAGE = require('../../../assets/icons/back_icon2.png');
const BACK_BUTTON_IMAGE2 = require('../../../assets/icons/back_icon_white.png');
const SAMPLE_IMAGE = require('../../../assets/images/sample04.png');
const ICON_STAR_IMAGE  = require('../../../assets/icons/icon_favorite.png');
const ICON_MENU_IMAGE  = require('../../../assets/icons/icon_hamburg.png');
const ICON_PENCIL = require('../../../assets/icons/icon_pencil_gray.png');
const ICON_PHOPO_IMAGE = require('../../../assets/icons/icon_photo.png');
const ICON_COMMOM_DOT = require('../../../assets/icons/icon_dot.png');
const DefaultPaginate = 10;
import { Storage } from "@psyrenpark/storage";
import { apiObject } from "../../Apis/Member";
import { apiObject as CdnapiObject } from "../../Apis/Cdn";
import { apiObject as MainapiObject } from "../../Apis/Main";
import { TouchableWithoutFeedbackBase } from 'react-native';

const CustomMenu = (props) => {
    let _menu = null;
    return (
        <View style={props.menustyle}>
            <Menu
                ref={(tref) => (_menu = tref)}
                button={
                props.isIcon ? (
                    <TouchableOpacity 
                        onPress={() => _menu.show()} hitSlop={{left:20,right:20,bottom:10,top:10}}
                        style={{marginRight:20,zIndex:5555,alignItems:'flex-end'}}
                    >
                        <Image source={ICON_MENU_IMAGE} style={CommonStyle.starButtonWrap} />
                    </TouchableOpacity>
                ) : (
                    <Text onPress={() => _menu.show()} style={props.textStyle}>{props.menutext}</Text>
                )}
            >
                <MenuItem onPress={() => {props.onPress()}}>삭제</MenuItem>                
                <MenuDivider />                
            </Menu>
        </View>
    );
  };

class AgentShopScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading : true,
            moreLoading : false,
            showReviewForm :false,
            totalCount : 0,
            ismore :  false,
            currentPage : 1,
            userData : {member_pk:null},
            popLayerView :false,
            agentData : {},
            replyData : [],
            replyContents: null,

            isNewImage : false,
            newimageUrl : null,
            image : {},
            thumbnail_img : '',
            attachFileSize : 0,
            photoarray : null,
        }

        this.myInput = [];
    }
 
    moreDataUpdate = async( baseData , addData) => {     
        let newArray = await baseData.concat(addData.data.replyList);
        this.setState({            
            moreLoading : false,
            replyData : newArray,
            ismore : parseInt(this.state.currentPage) < parseInt(addData.lastPage) ? true : false
        })
    }

    getInformation = async ( currentpage,morePage = false, target_pk) => {
        this.setState({moreLoading : true})
        let returnCode = {code:9998};
        try {
            returnCode = await CdnapiObject.API_getReplyList({
                locale: "ko",
                page : currentpage,
                paginate  : DefaultPaginate,
                class_type : 'Agent',
                target_pk
            });
            if ( returnCode.code === '0000') {
                this.setState({currentPage : returnCode.currentPage})
                if ( morePage ) {
                    this.moreDataUpdate(this.state.replyData,returnCode )
                }else{
                    this.setState({
                        totalCount : returnCode.total,                        
                        replyData : CommonUtil.isEmpty(returnCode.data.replyList) ? [] : returnCode.data.replyList,
                        ismore : parseInt(this.state.currentPage)  < parseInt(returnCode.lastPage) ? true : false,
                        moreLoading:false
                    })
                }
            }            
        }catch(e){            
            this.setState({moreLoading:false})
        }
    }

    API_getAgentDetail = async(estate_agent_pk) => {
        let returnCode = {code:9998};        
        const member_pk = CommonUtil.isEmpty(this.props.userToken) ? {member_pk:null} : this.props.userToken.member_pk;
        try {
            returnCode = await apiObject.API_AgentDetail2({
                locale: "ko",
                estate_agent_pk : estate_agent_pk,
                member_pk : member_pk
            });
            if ( returnCode.code === '0000') {
                this.setState({
                    totalCount : returnCode.total,
                    loading:false,
                    agentData : CommonUtil.isEmpty(returnCode.data) ? [] : returnCode.data,      
                    thumbnail_img : !CommonUtil.isEmpty(returnCode.data.img_url) ? returnCode.data.img_url : null,   
                    formOperation_time :!CommonUtil.isEmpty(returnCode.data.operation_time) ? returnCode.data.operation_time : null,   
                    formIntroduction : !CommonUtil.isEmpty(returnCode.data.introduction) ? returnCode.data.introduction : null,          
                })
            }
        }catch(e){
            this.setState({loading:false})
        }
    }
  
    async UNSAFE_componentWillMount() {
        if ( CommonUtil.isEmpty(this.props.userToken.estate_agent_pk)) {
            CommonFunction.fn_call_toast('잘못된 접근입니다',1500);
            setTimeout(
                () => {            
                    this.props.navigation.goBack(null);
                },1500
            )
        }else{
            await this.getInformation(1,false,this.props.userToken.estate_agent_pk);
            await this.API_getAgentDetail(this.props.userToken.estate_agent_pk);
            this.setState({
                agent_member_pk : this.props.userToken.member_pk,
                estate_agent_pk : this.props.userToken.estate_agent_pk,
                userData : CommonUtil.isEmpty(this.props.userToken) ? {member_pk:null} : this.props.userToken
            })
            this.props.navigation.addListener('focus', () => {   
                this.API_getAgentDetail(this.state.estate_agent_pk);
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

    changeProfile = async(cropit, circular = false, mediaType = 'photo') => {
        
        ImagePicker.openPicker({
            width: 1200,
            height: 900,
            multiple:false,
            cropping: true,
            cropperCircleOverlay: circular,
            sortOrder: 'none',
            compressImageMaxWidth: 1000,
            compressImageMaxHeight: 1000,
            compressImageQuality: 1,
            compressVideoPreset: 'MediumQuality',
            includeExif: true,
            cropperStatusBarColor: 'white',
            cropperToolbarColor: 'white',
            cropperActiveWidgetColor: 'white',
            cropperToolbarWidgetColor: '#3498DB',
            loadingLabelText:'처리중...',
            forceJpg:true
        })
          .then((response) => {
            try {
                if( response.mime.indexOf('image') != -1) {
                    if (response.path) {
                        if ( parseInt((response.size)/1024/1024) > 6 ) {
                            CommonFunction.fn_call_toast('이미지는 5mb이하로 올려주세요',2000)
                            return;
                        }else{                          
                            this.setState({
                                isNewImage : true,
                                thumbnail_img : response.path,
                                attachFileSize :  response.size,
                                photoarray : {
                                    type : response.mime === undefined ? 'jpg' :  response.mime,
                                    uri : response.path, 
                                    height:response.height,
                                    width:response.width,
                                    fileSize:response.size,
                                    fileName:response.filename
                                }
                            })
                        }
                    }
                }else{
                    CommonFunction.fn_call_toast('정상적인 이미지 파일이 아닙니다.')
                    return;
                }
            }catch(e){
                CommonFunction.fn_call_toast('오류가 발생하였습니다. 다시 시도해주세요')
                return;
            }
        }) 
        .catch((e) => {
        CommonFunction.fn_call_toast('이미지 선택을 취소하였습니다.',2000)        
        });
    }

    requestApproval = async(isBool = false) => {
        Alert.alert(
            DEFAULT_CONSTANTS.appName,
            isBool ? '착한중개인 승인을 재요청하시겠습니까?' : '착한중개인 승인을 요청하시겠습니까?',
            [
              {text: '네', onPress: () => this.actionRequestApproval()},
              {text: '아니오', onPress: () => console.log('no')},
            ],
            {cancelable: false},
        );
    }

    actionRequestApproval = async() => {
        this.setState({moreLoading:true})        
        const estate_agent_pk = parseInt(this.props.userToken.estate_agent_pk);        
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_AgentRequestUpdate({
                locale: "ko",
                estate_agent_pk
            });
            if ( returnCode.code === '0000') {      
                CommonFunction.fn_call_toast('정상적으로 신청되었습니다.',1500);                
                setTimeout(() => {
                    this.setState({moreLoading :false})
                    this.props.navigation.goBack(null)
                }, 1500);
            }else{
                CommonFunction.fn_call_toast('승인신청중 오류가 발생하였습니다. 관리자에게 문의하세요',2000);
                this.setState({moreLoading:false})
            }            
        }catch(e){            
            CommonFunction.fn_call_toast('승인신청중 오류가 발생하였습니다.. 관리자에게 문의하세요',2000);
            this.setState({moreLoading:false})
        }
    }

    setupUpdateData = async() => {
        Alert.alert(
            DEFAULT_CONSTANTS.appName,
            '정보를 수정하시겠습니까?',
            [
              {text: '네', onPress: () => this.actionSetupUpdateData()},
              {text: '아니오', onPress: () => console.log('no')},
            ],
            {cancelable: false},
          );
    }

    actionSetupUpdateData = async() => {
        this.setState({moreLoading:true})
        const photoarray = this.state.photoarray;
        let imageurl = this.state.thumbnail_img;
        if (!CommonUtil.isEmpty(photoarray) && this.state.isNewImage) {
            imageurl =  await this.awsimageupload(photoarray);            
        }
        const member_pk = this.props.userToken.member_pk;
        const estate_agent_pk = parseInt(this.props.userToken.estate_agent_pk);
        const formOperation_time = CommonUtil.isEmpty(this.state.formOperation_time) ? "" : this.state.formOperation_time;
        const formIntroduction = CommonUtil.isEmpty(this.state.formIntroduction) ? "" : this.state.formIntroduction;       
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_AgentUpdate({
                locale: "ko",
                member_pk,estate_agent_pk,
                formOperation_time,
                formIntroduction,
                imageUrl : imageurl
            }); 
            //console.log('returnCode',returnCode)
            if ( returnCode.code === '0000') {       
                CommonFunction.fn_call_toast('수정되었습니다.',2000);         
                this.setState({moreLoading:false})
            }else{
                CommonFunction.fn_call_toast('업데이트에 실패하였습니다. 관리자에게 문의하세요',2000);
                this.setState({moreLoading:false})
            }            
        }catch(e){
            console.log('eeee',e)
            CommonFunction.fn_call_toast('업데이트에 실패하였습니다. 관리자에게 문의하세요',2000);
            this.setState({moreLoading:false})
        }
    }

    awsimageupload = async(item) => {
        const result = await fetch(item.uri);
        const blob = await result.blob();
        let nowTimeStamp = moment()+840 * 60 * 1000;  // 서울
        let imgtype = await CommonFunction.getImageType(item.type)
        let newfilename = 'agent/' + nowTimeStamp + '_' + this.props.userToken.estate_agent_pk + '.' +　imgtype;
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

    removeReply = async(item,idx = null ) => {        
        Alert.alert(
            DEFAULT_CONSTANTS.appName,
            "정말로 삭제하시겠습니까?",
            [
                {text: '네', onPress: () => this.removeActionReplyStory(item,idx)},
                {text: '아니오', onPress: () => console.log('Cancle')},  
            ],
            { cancelable: true }
        ) 
    }
    
    removeActionReplyStory = async(item,idx) => {
        this.setState({moreLoading:true})
        let returnCode = {code:9998};
        try {
            returnCode = await MainapiObject.API_removeReplyStory({
                locale: "ko",
                target_pk : item.reply_pk
            });
            if ( returnCode.code === '0000') {
                CommonFunction.fn_call_toast('정상적으로 삭제되었습니다.',2000)
                if ( idx === null ) {
                    const replyStroy = await this.state.replyData.filter((info) =>  info.reply_pk != item.reply_pk);
                    this.setState({moreLoading:false,replyData:replyStroy})
                }else{
                    this.state.replyData[idx].childs = [];
                    this.setState({moreLoading:false})
                }
            }else{
                CommonFunction.fn_call_toast('삭제가 정상적으로 처리되지 않았습니다.',2000)
                this.setState({moreLoading:false})
            }
        }catch(e){
            CommonFunction.fn_call_toast('삭제가 정상적으로 처리되지 않았습니다.',2000)
            this.setState({moreLoading:false})
        }
    }

    openReplyMore = (idx,bool) => {
        if ( CommonUtil.isEmpty(bool) || bool === false ) {
            this.state.replyData[idx].showMoreReply = true;
        }else{
            this.state.replyData[idx].showMoreReply = false;
        }
        this.setState({moreLoading:false});
    }

    replyAnwserComment = async(text,stateProp,idx) => {        
        this.setState({[stateProp]: text})        
    }

    registAnswerReply = async(item,idx) => {        
        const comment = this.state['myInput_' + idx];
        if ( !CommonUtil.isEmpty(comment)) {
            Alert.alert(
                DEFAULT_CONSTANTS.appName,      
                "답글을 등록하시겠습니까?",
                [
                    {text: '네', onPress: () => this.actionRegistAnswerReply(item,comment)},
                    {text: '아니오', onPress: () => console.log('Cancle')},  
                ],
                { cancelable: true }
            ) 
        }else{
            CommonFunction.fn_call_toast('답글을 입력해주세요',2000);
            return false;
        }
    }
    actionRegistAnswerReply = async(item,contents) => {
        this.setState({moreLoading:true})
        let text = await CommonFunction.isForbiddenWord( contents, SpamWords.FilterWords.badWords); 
        let returnCode = {code:9998};        
        try {
            returnCode = await MainapiObject.API_registReplyStory({
                locale: "ko",
                class_type : 'Agent',
                contents : text,
                target_pk : this.state.estate_agent_pk,
                parent_reply_pk : item.reply_pk,
            }); 
            if ( returnCode.code === '0000') {                
                this.getInformation(1,false,this.state.estate_story_pk)
            }else{
                CommonFunction.fn_call_toast('정상적으로 등록되지 않았습니다.',2000)
                this.setState({moreLoading:false})
            }
        }catch(e){
            this.setState({moreLoading:false})
        }
    }

    renderButton = () => {
        if ( this.state.agentData?.is_status === 'wait') {
            return (
                <View style={styles.bottomButtonWarp2}>
                    <TouchableOpacity 
                        onPress={()=>this.setupUpdateData()}
                        style={styles.buttonWrapOn }
                    >
                        <CustomTextM style={[CommonStyle.textSize17,CommonStyle.fontColorWhite]}>설정완료</CustomTextM>
                    </TouchableOpacity>
                    <View style={{flex:0.1}} />
                    <TouchableOpacity 
                        onPress={()=>this.requestApproval()}
                        style={styles.buttonWrapOn2 }
                    >
                        <CustomTextM style={[CommonStyle.textSize17,CommonStyle.fontColorWhite]}>승인신청</CustomTextM>
                    </TouchableOpacity>
                </View> 
                
            )
        }else if ( this.state.agentData?.is_status === 'request') {
            return (
                <View style={styles.bottomButtonWarp2}>
                    <TouchableOpacity 
                        onPress={()=>this.setupUpdateData()}
                        style={styles.buttonWrapOn }
                    >
                        <CustomTextM style={[CommonStyle.textSize17,CommonStyle.fontColorWhite]}>설정완료</CustomTextM>
                    </TouchableOpacity>
                    <View style={{flex:0.1}} />
                    <View style={styles.buttonWrapOn3 }>
                        <CustomTextM style={[CommonStyle.textSize17,CommonStyle.fontColorWhite]}>승인진행중</CustomTextM>
                    </View>
                </View>
            )
        }else if ( this.state.agentData?.is_status === 'reject') {
            return (
                <View style={styles.bottomButtonWarp2}>
                    <TouchableOpacity 
                        onPress={()=>this.setupUpdateData()}
                        style={styles.buttonWrapOn }
                    >
                        <CustomTextM style={[CommonStyle.textSize17,CommonStyle.fontColorWhite]}>설정완료</CustomTextM>
                    </TouchableOpacity>
                    <View style={{flex:0.1}} />
                    <TouchableOpacity 
                        onPress={()=>this.requestApproval(1)}
                        style={styles.buttonWrapOn }
                    >
                        <CustomTextM style={[CommonStyle.textSize17,CommonStyle.fontColorWhite]}>재승인신청</CustomTextM>
                    </TouchableOpacity>
                </View>
            )
        }else {
            return (
                <View style={styles.bottomButtonWarp2}>
                    <TouchableOpacity onPress={()=>this.setupUpdateData()} style={styles.buttonWrapOn}>
                        <CustomTextM style={[CommonStyle.textSize17,CommonStyle.fontColorWhite]}>설정완료</CustomTextM>
                    </TouchableOpacity>
                </View> 
            )
        }
    }

    render() {
        if ( this.state.loading ) {
            return (
                <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} />
            )
        }else {
            const { estate_agent_pk,introducion,opration_time,reqeust_date,status} = this.state.agentData;
            return(
                <View style={ styles.container }>
                    {  Platform.OS == 'android' &&  <StatusBar translucent backgroundColor={'transparent'} />}
                    <KeyboardAvoidingView style={{height:'100%'}} behavior={Platform.OS === 'ios' ? "padding" : 'height'}  enabled>
                    <View style={styles.fixedHeaderWrap}>
                        <View style={styles.fixedHeader}>
                            <TouchableOpacity 
                                hitSlop={{left:10,right:10,top:10,bottom:10}}                                 
                                onPress={()=>this.props.navigation.goBack(null)} 
                                style={styles.fixedHeaderLeft}
                                >
                                <Image source={this.state.isIng ? BACK_BUTTON_IMAGE2 : BACK_BUTTON_IMAGE} style={CommonStyle.defaultIconImage30} />
                            </TouchableOpacity>
                            <View style={styles.fixedHeaderCenter}>
                                <CustomTextB style={CommonStyle.stackHeaderCenterText}>{this.state.agentData.company_name}</CustomTextB>
                            </View>
                            <TouchableOpacity style={styles.fixedHeaderRight} onPress={()=>this.changeProfile()}>
                                <Image source={ICON_PHOPO_IMAGE} style={CommonStyle.starButtonWrap} />
                                <CustomTextR style={[CommonStyle.textSize13,CommonStyle.fontColorBase]}>{" "}사진등록</CustomTextR>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.dataCoverWrap}>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            indicatorStyle={'white'}
                            scrollEventThrottle={16}
                            keyboardDismissMode={'on-drag'}      
                            style={{width:'100%'}}
                        >
                            <View style={{flex:1,justifyContent:'flex-end'}}>
                                 { 
                                    !CommonUtil.isEmpty(this.state.thumbnail_img) ?
                                    <Image
                                        source={this.state.isNewImage ? {uri:this.state.thumbnail_img} : {uri:DEFAULT_CONSTANTS.imageBaseUrl + this.state.thumbnail_img}}
                                        resizeMode={"contain"}
                                        style={{width:SCREEN_WIDTH,height:SCREEN_WIDTH/4*3}}
                                    />
                                    :
                                    <ScalableImage
                                        source={SAMPLE_IMAGE}
                                        width={SCREEN_WIDTH}
                                        indicatorProps={{size: 80,borderWidth: 0,color: DEFAULT_COLOR.base_color,unfilledColor:'#fff'}}
                                    /> 
                                }
                            </View>
                            <View style={{flex:1,padding:20,flexDirection:'row'}}>
                                <View style={{flex:5}}>
                                    <CustomTextB style={[CommonStyle.textSize16,CommonStyle.fontColor000]}>{this.state.agentData.company_name}</CustomTextB>
                                </View>
                                <View style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'flex-end'}}>
                                    <Image source={ICON_STAR_IMAGE} style={CommonStyle.starButtonWrap} />
                                    <TextRobotoR style={[CommonStyle.textSize14,CommonStyle.fontColor222]}>{" "}{this.state.agentData.star_point.toFixed(1)}</TextRobotoR>
                                </View>
                            </View>
                            <View style={{flex:1,paddingHorizontal:20,paddingVertical:5,flexDirection:'row'}}>
                                <View style={{flex:5}}>
                                    <CustomTextL style={[CommonStyle.textSize16,CommonStyle.fontColor222]}>
                                    {this.state.agentData.address}
                                    </CustomTextL>
                                </View>
                            </View>
                            <View style={{flex:1,paddingHorizontal:20,paddingVertical:5,flexDirection:'row'}}>
                                <View style={{flex:5}}>
                                    <CustomTextL style={[CommonStyle.textSize16,CommonStyle.fontColor555]}>운영시간</CustomTextL>
                                </View>
                            </View>
                            <View style={{flex:1,paddingHorizontal:10}}>                
                                 <TextInput          
                                    placeholder="운영시간, 휴무일등을 입력하세요"
                                    placeholderTextColor={DEFAULT_COLOR.base_color_999}                           
                                    style={[styles.inputBlank,CommonStyle.defaultOneWayForm,{fontSize: PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15),paddingLeft:10}]}
                                    value={this.state.formOperation_time}
                                    onChangeText={text=>this.setState({formOperation_time:text})}
                                    multiline={false}
                                    clearButtonMode='always'
                                />
                            </View>
                            <View style={{flex:1,paddingHorizontal:20,paddingVertical:5,flexDirection:'row'}}>
                                <View style={{flex:5,alignItems:'flex-start'}}>
                                    <CustomTextL style={[CommonStyle.textSize16,CommonStyle.fontColor555]}>매장소개</CustomTextL>
                                </View>
                            </View>
                            <View style={{flex:1,paddingHorizontal:20}}>
                                <TextInput         
                                    placeholder={'매장소개를 입력하세요'}
                                    placeholderTextColor={DEFAULT_COLOR.base_color_999}                           
                                    style={[
                                        styles.inputStyle,
                                        {
                                            minHeight:50,maxHeight:100,width:'100%',paddingTop: 5,paddingBottom: 5,paddingLeft: 0,paddingRight: 0,textAlignVertical: 'top',textAlign:'left',fontSize: PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15),color:DEFAULT_COLOR.base_color_999
                                        }]}
                                    inputStyle={styles.inputStyle}
                                    value={this.state.formIntroduction}
                                    onChangeText={text=>this.setState({formIntroduction:text})}
                                    multiline={true}
                                    clearButtonMode='always'
                                />
                            </View>
                            <View style={styles.barStyle} />
                            <View style={ styles.contentDataCoverWrap }>
                                {
                                this.state.replyData.length === 0 ?
                                <View style={styles.emptyRowWrap}>
                                    <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                        등록된 리뷰가 없습니다.
                                    </CustomTextR>
                                </View>
                                :
                                this.state.replyData.map((item,index) => (
                                <View key={index} style={styles.contentDataWrap}>
                                    <View style={styles.dataRowWrap}>
                                        {
                                            this.state.userData.member_pk === item.member_pk &&
                                            <TouchableOpacity style={styles.fixedMenuWrap}>                                            
                                                <CustomMenu
                                                    menutext="Menu"
                                                    menustyle={{width:40,height:50,marginRight:20,alignItems:'flex-end'}}
                                                    textStyle={{color: 'red'}}                                                
                                                    isIcon={true}
                                                    onPress={()=>this.removeReply(item)}
                                                />
                                            </TouchableOpacity>
                                        }
                                        <View style={styles.rowRightWrap} >
                                            <View style={styles.rowDescripWrap}>
                                                <View style={styles.rowDescripLeftWrap}>
                                                    <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                                        {item.member.name}                           
                                                    </CustomTextR>
                                                </View>                                                
                                            </View>
                                            <View style={{paddingTop:5}}>
                                                <CustomTextR style={[CommonStyle.textSize13,CommonStyle.fontColor000]} numberOfLines={3} ellipsizeMode={'tail'}>{item.contents}</CustomTextR>
                                            </View>
                                            <View style={styles.rowDescripWrap}>
                                                <View style={styles.rowDescripLeftWrap}>
                                                    <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                                        {CommonFunction.convertUnixToDateToday2(item.reg_date)}                
                                                    </CustomTextR>
                                                </View>
                                                { ( this.state.agentData.member_pk === this.state.userData.member_pk  && item.childs.length === 0 ) &&
                                                <TouchableOpacity style={styles.rowDescripRightWrap} 
                                                    onPress={()=>this.openReplyMore(index,item.showMoreReply)}
                                                >
                                                    <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                                        { item.showMoreReply ? '답글쓰기 취소' :'답글쓰기'}
                                                    </CustomTextR>
                                                </TouchableOpacity>
                                                }
                                            </View>
                                            { 
                                                item.childs.length > 0 && 
                                                <View style={styles.contentDataWrap2}>
                                                    <View style={styles.dataRowWrap3}>
                                                        {item.childs[0].member_pk === this.state.userData.member_pk &&
                                                        <TouchableOpacity style={styles.fixedMenuWrap}>                                            
                                                            <CustomMenu
                                                                menutext="Menu"
                                                                menustyle={{width:40,height:50,marginRight:20,alignItems:'flex-end'}}
                                                                textStyle={{color: 'red'}}                                                
                                                                isIcon={true}
                                                                onPress={()=>this.removeReply(item.childs[0],index,0)}
                                                            />
                                                        </TouchableOpacity>
                                                        }
                                                        <View style={styles.rowRightWrap} >
                                                            <View style={styles.rowDescripWrap}>
                                                                <View style={styles.rowDescripLeftWrap}>
                                                                    <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor222]}>
                                                                        답글 : {item.childs[0].member.name}
                                                                    </CustomTextR>
                                                                </View>                                            
                                                            </View>
                                                            <View style={styles.rowDescripWrap}>
                                                                <CustomTextM style={[CommonStyle.textSize13,CommonStyle.fontColor000]} numberOfLines={3} ellipsizeMode={'tail'}>{item.childs[0].contents}</CustomTextM>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                            }
                                        </View>
                                        {
                                            item.showMoreReply && 
                                            <View style={styles.rowInputWrap} >
                                                <View style={{flex:5,justifyContent:'center',alignItems:'center'}}>
                                                    <TextInput          
                                                        placeholder={'답글을 입력해주세요'}
                                                        placeholderTextColor={DEFAULT_COLOR.base_color_999}                           
                                                        style={[styles.inputBlank,CommonStyle.defaultOneWayForm]}
                                                        onChangeText={text=>this.replyAnwserComment(text,'myInput_'+index,index)}
                                                        multiline={false}
                                                        clearButtonMode='always'
                                                        ref={(input) => {this.myInput[index]=input}}
                                                    />
                                                </View>
                                                <TouchableOpacity 
                                                    onPress={()=>this.registAnswerReply(item,index)}
                                                    style={{width:50,justifyContent:'center',alignItems:'center'}}
                                                >
                                                    <Image source={ICON_PENCIL} style={CommonStyle.defaultIconImage15} />
                                                </TouchableOpacity>
                                            </View>
                                        }
                                    </View>
                                </View>
                                ))}
                            </View>
                            {
                                this.state.ismore &&
                                <View style={CommonStyle.moreButtonWrap}>
                                    <TouchableOpacity 
                                        onPress={() => this.getInformation(this.state.currentPage+1,true,this.state.estate_agent_pk)}
                                        style={CommonStyle.moreButton}
                                    >
                                    <CustomTextL style={CommonStyle.moreText}>더보기</CustomTextL>
                                    </TouchableOpacity>
                                </View>
                            }
                            <View style={styles.inforWrap}>
                                <View style={styles.inforLeftWrap}>
                                    <Image source={ICON_COMMOM_DOT} resizeMode={'contain'} style={styles.dotWrap} />
                                </View>
                                <View style={styles.infoRightWrap}>
                                    <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColorccc]}>승인이후 착한중개인 서비스를 신청하세요.{"\n"}[마이페이지]-[결제관리]</CustomTextR>
                                </View>
                            </View>    
                            {
                                this.state.agentData?.is_status === 'reject' &&
                                <View style={styles.inforWrap}>
                                    <View style={styles.inforLeftWrap}>
                                        <Image source={ICON_COMMOM_DOT} resizeMode={'contain'} style={styles.dotWrap} />
                                    </View>
                                    <View style={styles.infoRightWrap}>
                                        <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColorRed]}>신청이 거절되었습니다.</CustomTextR>
                                    </View>
                                </View>   
                            }        
                            <View style={CommonStyle.blankArea}></View>             
                            {this.renderButton()}
                            
                            { 
                                this.state.moreLoading &&
                                <View style={CommonStyle.moreWrap}>
                                    <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} />
                                </View>
                            }
                        </ScrollView>
                    </View>
                    </KeyboardAvoidingView>
                </View>
            );
        }
    }
}


const styles = StyleSheet.create({
    container: {
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
    inputBlank : {
        borderBottomWidth:0,borderBottomColor:DEFAULT_COLOR.input_border_color,borderRadius:5,backgroundColor:'#fff'
    },
    fixedHeaderWrap : {
        //position:'absolute',top:0,left:0,
        width:SCREEN_WIDTH,
        height:100,
        //borderBottomColor:'#ccc', borderBottomWidth:1,
        //paddingTop:DEFAULT_CONSTANTS.BottomHeight,        
        alignItems:'center',paddingHorizontal:20,zIndex:9999
    },
    fixedHeader : {
        flex:1,flexDirection:'row',alignItems:'flex-end',paddingBottom:20
    },
    fixedHeaderLeft : {
        flex:1,justifyContent:'center'
    },
    fixedHeaderCenter : {
        flex:2,alignItems:'center',justifyContent:'center'
    },
    fixedHeaderRight : {
        flex:1,justifyContent:'flex-end',alignItems:'center',flexDirection:'row'
    },
    valueText: {width: 50,color: '#000',fontSize: 20,}, 
    dataCoverWrap : {
        flex:1,
        height:SCREEN_HEIGHT-100
    },
    inputContainerStyle : {
        borderWidth:0,borderColor:'#fff'
    },
    inputStyle : {
        borderWidth:0,borderColor:'#fff',borderBottomWidth:0.5,borderBottomColor:'#ccc'
    },
    barStyle : { 
        flex:1,height:5,backgroundColor:'#e5e6e8',marginTop:30
    },
    emptyRowWrap : {
        flex:1,paddingVertical :10,
    },
    bottomButtonWarp : {
        height:120,
        justifyContent:'center',
        paddingTop:10,paddingBottom:20,paddingHorizontal:20
    },
    bottomButtonWarp2 : {
        height:100,
        flexDirection:'row',
        alignItems:'center',
        paddingBottom:20,paddingHorizontal:20
    },
    buttonWrapOn : {
        flex:1,backgroundColor:DEFAULT_COLOR.base_color,padding:10,justifyContent:'center',alignItems:'center',borderRadius:25
    },
    buttonWrapOn2 : {
        flex:1,backgroundColor:'#555',padding:10,justifyContent:'center',alignItems:'center',borderRadius:25
    },
    buttonWrapOn3 : {
        flex:1,backgroundColor:'#ccc',padding:10,justifyContent:'center',alignItems:'center',borderRadius:25
    },
    contentDataCoverWrap : {
        flex:1,marginHorizontal:20
    },
    contentDataWrap : {
        flex:1,
    },
    dataRowWrap : {
        flex:1,paddingVertical :10,borderBottomWidth:1,borderBottomColor:'#f3f3f3'
    },
    rowLeftWrap : {
        flex:1
    },
    rowRightWrap : {
        flex:5,paddingLeft:10,justifyContent:'flex-start'
    },
    rowDescripWrap : {
        flexDirection:'row',alignItems:'center',marginTop:5
    },
    rowDescripLeftWrap : {
        flex:1,flexDirection:'row',alignItems:'center'
    },
    rowDescripRightWrap : {
        flex:1,flexDirection:'row',alignItems:'center',justifyContent:'flex-end'
    },
    dotWrap :{ 
        width:5,height:5,paddingHorizontal:5
    },
    contentDataWrap2 : {
        flex:1,backgroundColor:'#f7f7f7',paddingHorizontal:5,marginVertical:5
    },
    dataRowWrap3 : {
        flex:1,padding :5
    },
    markWrap : {
        width:10,height:10,paddingRight:15
    },
    fixedMenuWrap : {
        position:'absolute',right:0,top:10,width:20,height:50
    },
    rowInputWrap : {
        flex:1,flexDirection:'row',borderWidth:0.5,borderColor:'#ccc',borderRadius:5,marginTop:10,justifyContent:'center',alignItems:'center',backgroundColor:'#f7f7f7'
    },
    inforWrap : {
        flexDirection:'row',paddingHorizontal:20,marginVertical:10
    },
    inforLeftWrap : {
        width:15,justifyContent:'flex-start',alignItems:'center',paddingTop:7
    },
    infoRightWrap : {
        flex:5,justifyContent:'center', paddingLeft:5
    },
    
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


export default connect(mapStateToProps,mapDispatchToProps)(AgentShopScreen);