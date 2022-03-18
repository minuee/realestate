import React, { Component,useCallback, useState } from 'react';
import {Linking,Alert,SafeAreaView, Platform, TouchableOpacity, View,StyleSheet,Image as NativeImage,Dimensions,BackHandler,TextInput,ScrollView,ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import 'moment/locale/ko'
import  moment  from  "moment";
import { Overlay } from 'react-native-elements';
import {connect} from 'react-redux';
import ActionCreator from '../../Ducks/Actions/MainActions';
import Image from 'react-native-image-progress';
//공통상수 필요에 의해서 사용
import  * as getDEFAULT_CONSTANTS   from '../../Constants';
import CommonStyle from '../../Style/CommonStyle';
const DEFAULT_CONSTANTS = getDEFAULT_CONSTANTS.DEFAULT_CONSTANTS;
const DEFAULT_TEXT = getDEFAULT_CONSTANTS.DEFAULT_TEXT;
const DEFAULT_COLOR = getDEFAULT_CONSTANTS.DEFAULT_COLOR;
const {height: SCREEN_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('window');
import {CustomTextR,CustomTextL, CustomTextB, CustomTextM, TextRobotoM,TextRobotoR} from '../../Components/CustomText';
import  * as SpamWords   from '../../Constants/FilterWords';
import CommonFunction from '../../Utils/CommonFunction';
import CommonUtil from '../../Utils/CommonUtil';
import Loader from '../../Utils/Loader';
import Progress from 'react-native-progress/Bar';
import ScalableImage from '../../Utils/ScalableImage';
import 'react-native-gesture-handler';
import Menu, {MenuItem, MenuDivider} from 'react-native-material-menu';

const ICON_CALENDAR_IMAGE =  require('../../../assets/icons/icon_calendar.png')
const ICON_DOC_IMAGE =  require('../../../assets/icons/icon_doc.png')
const BUTTON_CALL_IMAGE =  require('../../../assets/icons/icon_call.png');
const BUTTON_CHAT_IMAGE =  require('../../../assets/icons/icon_chat.png');
const BUTTON_REVIEW_IMAGE =  require('../../../assets/icons/btn_review.png')
const BUTTON_STAR_IMAGE =  require('../../../assets/icons/btn_star.png')
const BUTTON_STAR_IMAGE2 =  require('../../../assets/icons/icon_favorite.png')
const SAMPLE_IMAGE = require('../../../assets/images/sample04.png');
const ICON_STAR_IMAGE  = require('../../../assets/icons/icon_favorite.png');
const ICON_MENU_IMAGE  = require('../../../assets/icons/icon_hamburg.png');
const ICON_PENCIL = require('../../../assets/icons/icon_pencil_gray.png');
const DEFAULT_PROFILE_IMAGE =  require('../../../assets/icons/default_profile.png')
const DefaultPaginate = 10;

import { apiObject } from "../../Apis/Member";
import { apiObject as CdnapiObject } from "../../Apis/Cdn";
import { apiObject as MainapiObject } from "../../Apis/Main";
import { apiObject as ChatapiObject } from "../../Apis/Chat";
import PopLayerVote from './PopLayerVote';

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
                        <NativeImage source={ICON_MENU_IMAGE} style={CommonStyle.starButtonWrap} />
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

 class AgentDetailScreen extends Component {
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
            closePopLayer : this.closePopLayer.bind(this),
        }
        this.myInput = [];
    }
    closePopLayer = async(isUpdate = null) => {
        this.setState({popLayerView:false})
        if ( isUpdate) {
            this.setState({moreLoading:true})
            await this.API_getAgentDetail(this.state.estate_agent_pk);
            this.setState({moreLoading:false})
        }
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
                if ( CommonUtil.isEmpty(returnCode.data) ) {
                    CommonFunction.fn_call_toast('중개인정보가 없습니다.',2000);
                    setTimeout(
                        () => {            
                            this.props.navigation.goBack(null);
                        },1500
                    )
                }else{
                    this.setState({
                        totalCount : returnCode.total,
                        loading:false,
                        agentData : CommonUtil.isEmpty(returnCode.data) ? [] : returnCode.data,    
                        thumbnail_img : !CommonUtil.isEmpty(returnCode.data.img_url) ? returnCode.data.img_url : null,                  
                    })
                }
                
            }
        }catch(e){
            this.setState({loading:false,})
        }
    }

    async UNSAFE_componentWillMount() {
        if ( CommonUtil.isEmpty(this.props.extraData.params.screenData.estate_agent_pk)) {
            CommonFunction.fn_call_toast('잘못된 접근입니다',1500);
            setTimeout(
                () => {            
                    this.props.navigation.goBack(null);
                },1500
            )
        }else{
            await this.getInformation(1,false,this.props.extraData.params.screenData.estate_agent_pk);
            await this.API_getAgentDetail(this.props.extraData.params.screenData.estate_agent_pk);
            this.setState({
                screenData : this.props.extraData.params.screenData,
                agent_member_pk : this.props.extraData.params.screenData.member_pk,
                estate_agent_pk : this.props.extraData.params.screenData.estate_agent_pk,
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
        return true;
    }
    
    callShop = (tel) => {
        if ( !CommonUtil.isEmpty(tel)) {
            let number = CommonFunction.fn_dataDecode(tel);
            let phoneNumber = '';
            if (Platform.OS === 'android') { phoneNumber = `tel:${number}`; }
            else {phoneNumber = `telprompt:${number}`; }
            Linking.openURL(phoneNumber);
        }else{
            CommonFunction.fn_call_toast('연락처 정보가 존재하지 않습니다.',2000)
            return true;
        }
    }  
  
    loginCheck = async() => {
        if ( CommonUtil.isEmpty(this.props.userToken)) {
            this.textinputs.blur();
            CommonFunction.checkLogin(this.props);
        }   
    }
    logoutAction = () => {
        this.props.navigation.navigate('LoginPopStack');               
    }

    openReviewForm = () => {
        if ( CommonUtil.isEmpty(this.props.userToken)) {
            Alert.alert(
                DEFAULT_CONSTANTS.appName,      
                "로그인이 필요합니다. 로그인하시겠습니까?",
                [
                    {text: '네', onPress: () => this.logoutAction()},
                    {text: '아니오', onPress: () => console.log('Cancle')}
                ],
                { cancelable: true }
            ) 
        }else{
            if ( this.props.userToken.user_type === 'A') {
                CommonFunction.fn_call_toast('중개인간에는 리뷰를 작성할수 없습니다.',2000)
            }else{
                this.setState({showReviewForm:true})
            }
        }
    }
    voteAction = () => {
        if ( CommonUtil.isEmpty(this.props.userToken)) {
            Alert.alert(
                DEFAULT_CONSTANTS.appName,      
                "로그인이 필요합니다. 로그인하시겠습니까?",
                [
                    {text: '네', onPress: () => this.logoutAction()},
                    {text: '아니오', onPress: () => console.log('Cancle')}
                ],
                { cancelable: true }
            ) 
        }else{
            if ( this.props.userToken.user_type === 'A') {
                CommonFunction.fn_call_toast('중개인간에는 별점을 줄수 없습니다.',2000)
            }else{
                this.setState({popLayerView : true,showReviewForm:false})
            }
        }
    }

    registReview = async() => {
        if ( !CommonUtil.isEmpty(this.state.reviewContents)) {
            Alert.alert(
                DEFAULT_CONSTANTS.appName,      
                "리뷰를 등록하시겠습니까?",
                [
                    {text: '네', onPress: () => this.actioRegistReview(this.state.reviewContents)},
                    {text: '아니오', onPress: () => console.log('Cancle')},  
                ],
                { cancelable: true }
            ) 
        }else{
            CommonFunction.fn_call_toast('리뷰를 입력해주세요',2000);
            return false;
        }
    }
    actioRegistReview = async(contents) => {
        this.setState({moreLoading:true})
        let text = await CommonFunction.isForbiddenWord( contents, SpamWords.FilterWords.badWords); 
        let returnCode = {code:9998};        
        try {
            returnCode = await MainapiObject.API_registReplyStory({
                locale: "ko",
                class_type : 'Agent',
                contents:text,
                target_pk : this.state.estate_agent_pk
            });
            if ( returnCode.code === '0000') {
                this.setState({showReviewForm:false})
                this.getInformation(1,false,this.state.member_pk)
            }else{
                CommonFunction.fn_call_toast('정상적으로 등록되지 않았습니다.',2000)
                this.setState({moreLoading:false})
            }
        }catch(e){            
            this.setState({moreLoading:false})
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

    makeChat = async() => {
        if ( !CommonUtil.isEmpty(this.props.userToken)) {
            if ( this.props.userToken.user_type === 'A') {
                CommonFunction.fn_call_toast('중개인간에는 채팅할수 없습니다.',2000)
            }else{
                Alert.alert(
                    DEFAULT_CONSTANTS.appName,      
                    this.state.agentData.company_name + "과(와)의 채팅방을 만드시겠습니까?",
                    [
                        {text: '네', onPress: () => this.actionmakeChat()},
                        {text: '아니오', onPress: () => console.log('Cancle')},  
                    ],
                    { cancelable: true }
                )
            }
        }else{
            Alert.alert(
                DEFAULT_CONSTANTS.appName,
                "로그인이 필요합니다. 로그인하시겠습니까?",
                [
                    {text: '네', onPress: () => this.logoutAction()},
                    {text: '아니오', onPress: () => console.log('Cancle')}
                ],
                { cancelable: true }
            )
        }
    }

    actionmakeChat = async(item,contents) => {
        if ( this.state.agentData.member_pk === this.props.userToken.member_pk ) {
            CommonFunction.fn_call_toast('자신과는 채팅방을 만들수 없습니다.',2000);
            return;
        }else{
            this.setState({moreLoading:true})
            let returnCode = {code:9998};        
            try {
                returnCode = await ChatapiObject.API_registChatRoom({
                    locale: "ko",                
                    agent_member : this.state.agentData.member_pk,
                    user_member : this.props.userToken.member_pk,
                    last_message : "방이 개설되었습니다",
                    last_date : moment().unix()
                }); 
                
                if ( returnCode.code === '0000') {               
                    const { company_name,address,telephone,img_url,member_pk } = this.state.agentData; 
                    if ( !CommonUtil.isEmpty(returnCode.data)) {
                        await this.setState({moreLoading:false})   
                        this.props.navigation.navigate('ChatStack', { 
                            screenData: this.props.userToken,
                            user_type : this.props.userToken.user_type,
                            thread: this.state.agentData,
                            roomIdx :returnCode.data.chatroom_pk,
                            uname : company_name,
                            uid : this.props.userToken.member_pk,
                            email : CommonFunction.fn_dataDecode(this.props.userToken.uid),
                            address : address,
                            tel : CommonFunction.fn_dataDecode(telephone),
                            imgurl : CommonUtil.isEmpty(img_url)?null: DEFAULT_CONSTANTS.imageBaseUrl + img_url,
                            target_member : member_pk
                        })
                    }else{
                        CommonFunction.fn_call_toast('일시적으로 오류가 발생하엿습니다. 다시 이용해주세요',2000)
                        this.setState({moreLoading:false})   
                    }
                }else{
                    CommonFunction.fn_call_toast('정상적으로 등록되지 않았습니다.',2000)
                    this.setState({moreLoading:false})
                }
            }catch(e){
                this.setState({moreLoading:false})
            }
        }
    }

    render() {
        if ( this.state.loading ) {
            return (
                <ActivityIndicator size="large" color={DEFAULT_COLOR.base_color} style={{paddingTop:100}}/>
            )
        }else {
            return(
                <SafeAreaView style={ styles.container }>
                    <View style={styles.dataCoverWrap}>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            indicatorStyle={'white'}
                            scrollEventThrottle={16}
                            keyboardDismissMode={'on-drag'}      
                            style={{width:'100%'}}
                        >
                            <View style={{flex:1,minHeight:SCREEN_WIDTH/4*3,justifyContent:'flex-end'}}>
                                { 
                                    !CommonUtil.isEmpty(this.state.thumbnail_img) ?
                                    <Image
                                        source={{uri:DEFAULT_CONSTANTS.imageBaseUrl + this.state.thumbnail_img}}
                                        resizeMode={"cover"}
                                        style={{width:SCREEN_WIDTH,height:SCREEN_WIDTH/4*3}}
                                        indicator={Progress.Pie}
                                        indicatorProps={{size: 80,borderWidth: 0,color: DEFAULT_COLOR.base_color,unfilledColor:'#fff'}}
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
                                    <CustomTextB style={[CommonStyle.textSize16,CommonStyle.fontColor000]}>
                                        {this.state.agentData.company_name}
                                    </CustomTextB>
                                </View>
                                <View style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'flex-end'}}>
                                    <NativeImage source={ICON_STAR_IMAGE} style={CommonStyle.starButtonWrap} />
                                    <TextRobotoR style={[CommonStyle.textSize14,CommonStyle.fontColor222]}>
                                        {" "}{this.state.agentData?.star_point.toFixed(1)}</TextRobotoR>
                                </View>
                            </View>
                            <View style={{flex:1,paddingHorizontal:20,paddingVertical:10}}>
                                <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor222]}>{this.state.agentData.address}</CustomTextR>
                            </View>
                            <View style={styles.optionWrap}>
                                <View style={styles.optionLeftWrap}>
                                    <NativeImage source={ICON_CALENDAR_IMAGE} style={{width:CommonUtil.dpToSize(14),height:CommonUtil.dpToSize(14)}} />
                                    <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor000]}>{" "}운영시간</CustomTextR>
                                </View>
                                <View style={styles.optionRightWrap}>
                                    <CustomTextL style={[CommonStyle.textSize12,CommonStyle.fontColor000]}>
                                        {" "}{this.state.agentData.operation_time}
                                    </CustomTextL>
                                </View>
                                
                            </View>
                            <View style={styles.optionWrap}>
                                <View style={styles.optionLeftWrap}>
                                    <NativeImage source={ICON_DOC_IMAGE} style={{width:CommonUtil.dpToSize(14),height:CommonUtil.dpToSize(14)}} />
                                    <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor000]}>{" "}매장소개</CustomTextR>
                                </View>
                                <View style={styles.optionRightWrap}>
                                    <CustomTextL style={[CommonStyle.textSize12,CommonStyle.fontColor000]}>
                                     {" "}{this.state.agentData.introduction}
                                     </CustomTextL>
                                </View>
                            </View>
                            <View style={styles.optionWrap2}>
                                <TouchableOpacity style={styles.optionDataWrap} onPress={()=>this.callShop(this.state.agentData.telephone)}>
                                    <NativeImage source={BUTTON_CALL_IMAGE} style={{width:CommonUtil.dpToSize(30),height:CommonUtil.dpToSize(30)}} />
                                    <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor000]}>전화걸기</CustomTextR>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.optionDataWrap} onPress={()=>this.makeChat()}>
                                    <NativeImage source={BUTTON_CHAT_IMAGE} style={{width:CommonUtil.dpToSize(30),height:CommonUtil.dpToSize(30)}} />
                                    <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor000]}>채팅하기</CustomTextR>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.optionDataWrap} onPress={()=>this.voteAction()}>
                                    <NativeImage source={this.state.agentData.rating_pk > 0 ? BUTTON_STAR_IMAGE2 : BUTTON_STAR_IMAGE} style={{width:CommonUtil.dpToSize(30),height:CommonUtil.dpToSize(30)}} />
                                    <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor000]}>별점주기</CustomTextR>
                                </TouchableOpacity>
                                { this.state.showReviewForm ?
                                <TouchableOpacity style={styles.optionDataWrap} onPress={()=>this.setState({showReviewForm:false})}>
                                    <NativeImage source={BUTTON_REVIEW_IMAGE} style={{width:CommonUtil.dpToSize(30),height:CommonUtil.dpToSize(30)}} />
                                    <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor000]}>리뷰작성 취소</CustomTextR>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity style={styles.optionDataWrap} onPress={()=>this.openReviewForm()}>
                                    <NativeImage source={BUTTON_REVIEW_IMAGE} style={{width:CommonUtil.dpToSize(30),height:CommonUtil.dpToSize(30)}} />
                                    <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor000]}>리뷰작성</CustomTextR>
                                </TouchableOpacity>
                                }
                            </View>

                            {
                                this.state.showReviewForm &&
                                <View style={ styles.contentDataCoverWrap }>
                                    <View style={[styles.rowRightWrap,{flexDirection:'row'}]} >
                                        <View style={{flex:1}} >
                                            <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor000]}>
                                                리뷰작성
                                            </CustomTextR>
                                        </View>
                                        <View style={{flex:3,alignItems:'flex-end',justifyContent:'center'}} >
                                            <CustomTextR style={[CommonStyle.textSize8,CommonStyle.fontColor999]}>
                                                *리뷰작성시 욕설, 비방글이 포함되지 않도록 주의해 주세요!
                                            </CustomTextR>
                                        </View>
                                    </View>
                                    <View style={styles.rowInputWrap} >
                                        <View style={{flex:5,justifyContent:'center',alignItems:'center'}}>
                                            <TextInput          
                                                placeholder={'리뷰을 입력해주세요'}
                                                placeholderTextColor={DEFAULT_COLOR.base_color_999}                           
                                                style={[styles.inputBlank,CommonStyle.defaultOneWayForm,{height:100}]}
                                                value={this.state.reviewContents}
                                                onChangeText={text=>this.setState({reviewContents:text})}                                            
                                                multiline={true}
                                                clearButtonMode='always'
                                                onFocus={()=>this.loginCheck()}
                                                ref={(ref) => {
                                                    this.textinputs = ref;
                                                }}
                                            />
                                        </View>
                                        <TouchableOpacity 
                                            onPress={()=>this.registReview()}
                                            style={{width:50,justifyContent:'center',alignItems:'center'}}
                                        >
                                            <NativeImage source={ICON_PENCIL} style={CommonStyle.defaultIconImage15} />
                                        </TouchableOpacity>
                                    </View>
                                </View>   
                            }
                            <View style={{flex:1,height:15,backgroundColor:'#e5e6e8',marginTop:30}} />
                        
                            <View style={ styles.contentDataCoverWrap }>
                                {this.state.replyData.map((item,index) => (
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
                                                { 
                                                    ( this.state.agentData.member_pk === this.state.userData.member_pk  && item.childs.length === 0 ) &&
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
                                                    <NativeImage source={ICON_PENCIL} style={CommonStyle.defaultIconImage15} />
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
                            <View style={CommonStyle.blankArea}></View>
                            { 
                                this.state.moreLoading &&
                                <View style={CommonStyle.moreWrap}>
                                    <ActivityIndicator size="large" color={DEFAULT_COLOR.base_color} style={{paddingTop:100}}/>
                                </View>
                            }
                        </ScrollView>
                    </View>
                    {
                        this.state.popLayerView && (
                        <View >
                            <Overlay
                                isVisible={this.state.popLayerView}
                                windowBackgroundColor="rgba(0, 0, 0, 0.8)"
                                overlayBackgroundColor="tranparent"
                                containerStyle={{}}
                            >
                                <View style={{width:SCREEN_WIDTH*0.8,height:SCREEN_HEIGHT*0.3,backgroundColor:'transparent'}}>
                                    <PopLayerVote screenState={this.state} />
                                </View>
                                
                            </Overlay>
                        </View>
                    )}
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
    fixedHeaderWrap : {
        position:'absolute',top:0,left:0,width:SCREEN_WIDTH,
        height:DEFAULT_CONSTANTS.BottomHeight+30,
        paddingTop:DEFAULT_CONSTANTS.BottomHeight,        
        justifyContent:'flex-end',paddingHorizontal:20,zIndex:9999
    },
    fixedHeader : {
        flex:1,flexDirection:'row'
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
    },
    inputContainerStyle : {
        borderWidth:0,borderColor:'#fff'
    },
    inputStyle : {
        borderWidth:0,borderColor:'#fff',borderBottomWidth:0.5,borderBottomColor:'#ccc'
    },
    bottomButtonWarp : {
        height:120,
        justifyContent:'center',
        paddingTop:10,paddingBottom:20,paddingHorizontal:20
    },
    buttonWrapOn : {
        backgroundColor:DEFAULT_COLOR.base_color,padding:10,justifyContent:'center',alignItems:'center',borderRadius:25
    },
    contentDataCoverWrap : {
        flex:1,marginHorizontal:20
    },
    contentDataWrap : {
        flex:1,
    },
    optionWrap : {
        flex:1,paddingHorizontal:20,paddingVertical:5,flexDirection:'row',alignItems:'flex-start',justifyContent:'center'
    },
    optionLeftWrap : {
        flex:1,flexDirection:'row',alignItems:'center'
    },
    optionRightWrap : {
        flex:3.2,flexDirection:'row',minHeight:70
    },
    optionWrap2 : {
        flex:1,paddingHorizontal:20,paddingVertical:20,flexDirection:'row',justifyContent:'space-evenly'
    },
    optionDataWrap : {
        flex:1,justifyContent:'center',alignItems:'center',
    },
    dataRowWrap : {
        flex:1,paddingVertical :10,borderBottomWidth:1,borderBottomColor:'#f3f3f3'
    },
    rowLeftWrap : {
        flex:1
    },
    rowRightWrap : {
        flex:5,paddingLeft:0,justifyContent:'flex-start'
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
        },
    };
}


export default connect(mapStateToProps,mapDispatchToProps)(AgentDetailScreen);