import React, { Component,useCallback, useState } from 'react';
import {StatusBar,ActivityIndicator,Text,SafeAreaView, Platform, TouchableOpacity, View,StyleSheet,Image,Dimensions,PixelRatio,TextInput,ScrollView,KeyboardAvoidingView,Alert,BackHandler} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import Modal from 'react-native-modal';
import { Overlay } from 'react-native-elements';
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
import  * as SpamWords   from '../../Constants/FilterWords';
import 'react-native-gesture-handler';
import Menu, {MenuItem, MenuDivider} from 'react-native-material-menu';
import Swiper from '../../Utils/Swiper';
import ImageViewer from 'react-native-image-zoom-viewer';
import Loader from '../../Utils/Loader';
//HTML 
import HTMLConvert from '../../Utils/HtmlConvert/HTMLConvert';
const currentDate =  moment().format('YYYY.MM.DD HH:MM');

import { apiObject } from "../../Apis/Cdn";
import { apiObject as MainapiObject } from "../../Apis/Main";
import { apiObject as ChatapiObject } from "../../Apis/Chat";
const CUSTOM_STYLES = {
    fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15),color:'#494949'
};
const CUSTOM_RENDERERS = {};
const IMAGES_MAX_WIDTH = SCREEN_WIDTH - 50;
const DEFAULT_PROPS = {
    htmlStyles: CUSTOM_STYLES,
    renderers: CUSTOM_RENDERERS,
    imagesMaxWidth: IMAGES_MAX_WIDTH,
    onLinkPress: (evt, href) => { Linking.openURL(href); },
    debug: true
};
const DefaultPaginate = 10;
const ICON_PENCIL = require('../../../assets/icons/icon_pencil_gray.png');
const BACK_BUTTON_IMAGE = require('../../../assets/icons/back_icon2.png');
const BACK_BUTTON_IMAGE2 = require('../../../assets/icons/back_icon_white.png');
const SAMPLE_IMAGE = require('../../../assets/images/sample04.png');
const ICON_MENU_IMAGE  = require('../../../assets/icons/icon_hamburg.png');
const ICON_HEART_IMAGE =  require('../../../assets/icons/icon_heart.png')
const ICON_HEART2_IMAGE =  require('../../../assets/icons/icon_heart2.png')
const ICON_WRITER = require('../../../assets/icons/icon_writer.png');
const ICON_COMMOM_DOT = require('../../../assets/icons/icon_dot.png');
const ICON_SINGO = require('../../../assets/icons/icon_report.png');
const BUTTON_CHAT_IMAGE =  require('../../../assets/icons/icon_chat.png');

import PopLayerDeclaration from '../Tabs01/PopLayerDeclaration';
const TopCustomMenu = (props) => {
    let _menu = null;
    return (
        <View style={props.menustyle}>
            <Menu
                ref={(tref) => (_menu = tref)}
                button={
                props.isIcon ? (
                    <TouchableOpacity
                        onPress={() => _menu.show()} hitSlop={{left:20,right:20,bottom:10,top:10}}
                        style={{zIndex:50,alignItems:'flex-end',justifyContent:'center'}}
                    >
                        <Image source={ICON_MENU_IMAGE} style={CommonStyle.defaultIconImage30} />
                    </TouchableOpacity>
                ) : (
                    <Text onPress={() => _menu.show()} style={props.textStyle}>{props.menutext}</Text>
                )}
            >
                <MenuItem onPress={() => {props.onPressModify();_menu.hide()}}>글수정</MenuItem> 
                <MenuItem onPress={() => {props.onPressRemove();}}>글삭제</MenuItem>
            </Menu>
        </View>
    );
  };

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
                    <Image source={ICON_MENU_IMAGE} style={CommonStyle.defaultIconImage30} />
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

class HouseStoryDetailScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading : true,
            moreLoading : false,
            popLayerView : false,
            totalCount : 0,
            ismore :  false,
            currentPage : 1,
            imageIndex: 0,
            thisImages : [],
            isImageViewVisible: false,
            isLike : false,
            estate_story_pk : 0,
            screenData : {},
            resultData : {},
            userData : {member_pk:null},
            agentData : null,
            thumbnail_img : null,
            replyData : [],
            imageArray : [],
            replyContents: null,
            componentTitle : '자유게시판'
        }
        this.myInput = [];
        this.replyInput = null;
    }

    closePopView = () => {
        this.setState({popLayerView:false})
    }
    openPopView = () => {
        if ( CommonUtil.isEmpty(this.props.userToken)) {
            this.textInput.blur();
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
            this.setState({popLayerView:true})
        } 
       
    }
    getDetailInformation = async (item) => {        
        const estate_story_pk  = item.estate_story_pk;
        const board_type  = item.board_type;
        const regist_member_pk  = item.member_pk;
        let navTitle = '자유게시판'
        switch(board_type) {
            case 'Dialog' : navTitle = '가입인사';break;
            case 'Realestate' : navTitle = '부동산뉴스';break;
            case 'Deal' : navTitle = '급매물게시판';break;
            case 'Owner' : navTitle = '재파게시판';break;
            default : navTitle = '자유게시판';break;
        }
        this.setState({moreLoading : true})
        let returnCode = {code:9998};        
        try {
            returnCode = await apiObject.API_getDetailEstatestory({
                estate_story_pk,
                board_type,
                regist_member_pk,
                member_pk : CommonUtil.isEmpty(this.props.userToken) ? 0 : this.props.userToken.member_pk
                
            });
            console.log('ddddd',returnCode.data)
            if ( returnCode.code === '0000') {
               
                let imageArrayTmp = [];
                if ( !CommonUtil.isEmpty(returnCode.data.estateStory.image_1) ) {
                    imageArrayTmp.push({
                        url : DEFAULT_CONSTANTS.imageBaseUrl + returnCode.data.estateStory.image_1,
                        title : returnCode.data.estateStory.title
                    })
                }
                if ( !CommonUtil.isEmpty(returnCode.data.estateStory.image_2) ) {
                    imageArrayTmp.push({
                        url : DEFAULT_CONSTANTS.imageBaseUrl + returnCode.data.estateStory.image_2,
                        title : returnCode.data.estateStory.title
                    })
                }
                if ( !CommonUtil.isEmpty(returnCode.data.estateStory.image_3) ) {
                    imageArrayTmp.push({
                        url : DEFAULT_CONSTANTS.imageBaseUrl + returnCode.data.estateStory.image_3,
                        title : returnCode.data.estateStory.title
                    })
                }
                if ( !CommonUtil.isEmpty(returnCode.data.estateStory.image_4) ) {
                    imageArrayTmp.push({
                        url : DEFAULT_CONSTANTS.imageBaseUrl + returnCode.data.estateStory.image_4,
                        title : returnCode.data.estateStory.title
                    })
                }
                if ( returnCode.data.estateStory.board_type === 'Deal') {
                    this.setState({      
                        componentTitle : navTitle,              
                        resultData : CommonUtil.isEmpty(returnCode.data.estateStory) ? {} : returnCode.data.estateStory,
                        isLike : CommonUtil.isEmpty(returnCode.data.estateStory) ? false : returnCode.data.estateStory.likeYn,
                        image_1 : CommonUtil.isEmpty(returnCode.data.estateStory.image_1) ? null : returnCode.data.estateStory.image_1,
                        image_2 : CommonUtil.isEmpty(returnCode.data.estateStory.image_2) ? null : returnCode.data.estateStory.image_2,
                        image_3 : CommonUtil.isEmpty(returnCode.data.estateStory.image_3) ? null : returnCode.data.estateStory.image_3,
                        image_4 : CommonUtil.isEmpty(returnCode.data.estateStory.image_4) ? null : returnCode.data.estateStory.image_4,
                        imageArray : imageArrayTmp,
                        agentData : returnCode.data.estateStory.member,    
                        thumbnail_img : !CommonUtil.isEmpty(returnCode.data.agentData.img_url) ? returnCode.data.agentData.img_url : null, 
                        loading:false,
                        moreLoading:false,
                        estate_story_pk : estate_story_pk,
                        screenData : returnCode.data,                
                        userData : CommonUtil.isEmpty(this.props.userToken) ? {member_pk:null} : this.props.userToken
                    })
                }else{
                    this.setState({      
                        componentTitle : navTitle,              
                        resultData : CommonUtil.isEmpty(returnCode.data.estateStory) ? {} : returnCode.data.estateStory,
                        isLike : CommonUtil.isEmpty(returnCode.data.estateStory) ? false : returnCode.data.estateStory.likeYn,
                        image_1 : CommonUtil.isEmpty(returnCode.data.estateStory.image_1) ? null : returnCode.data.estateStory.image_1,
                        image_2 : CommonUtil.isEmpty(returnCode.data.estateStory.image_2) ? null : returnCode.data.estateStory.image_2,
                        image_3 : CommonUtil.isEmpty(returnCode.data.estateStory.image_3) ? null : returnCode.data.estateStory.image_3,
                        image_4 : CommonUtil.isEmpty(returnCode.data.estateStory.image_4) ? null : returnCode.data.estateStory.image_4,
                        imageArray : imageArrayTmp,
                        loading:false,
                        moreLoading:false,
                        estate_story_pk : estate_story_pk,
                        screenData : returnCode.data,                
                        userData : CommonUtil.isEmpty(this.props.userToken) ? {member_pk:null} : this.props.userToken
                    })
                }
                
            }
            
        }catch(e){
            CommonFunction.fn_call_toast('일시적 오류가 발생하였습니다.잠시뒤 이용해주세요',1500);
            setTimeout(
                () => {            
                    this.props.navigation.goBack(null);
                },1500
            )
        }
    }

    moreDataUpdate = async( baseData , addData) => {     
        let newArray = await baseData.concat(addData.data.replyList);
        this.setState({            
            moreLoading : false,
            replyData : newArray,
            currentPage : addData.currentPage,
            ismore : parseInt(addData.currentPage) < parseInt(addData.lastPage) ? true : false
        })
    }

    getInformation = async ( currentpage,morePage = false, target_pk) => {
        this.setState({moreLoading : true})
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_getReplyList({
                locale: "ko",
                page : currentpage,
                paginate  : DefaultPaginate,
                class_type : 'House',
                target_pk
            });
            if ( returnCode.code === '0000') {
                if ( morePage ) {
                    this.moreDataUpdate(this.state.replyData,returnCode )
                }else{
                    this.setState({
                        totalCount : returnCode.total,       
                        currentPage : returnCode.currentPage,                 
                        replyData : CommonUtil.isEmpty(returnCode.data.replyList) ? [] : returnCode.data.replyList,
                        ismore : parseInt(returnCode.currentPage)  < parseInt(returnCode.lastPage) ? true : false,
                        moreLoading:false
                    })
                }
            }            
        }catch(e){
            this.setState({moreLoading:false})
        }
    }    

    async UNSAFE_componentWillMount() {
        if ( CommonUtil.isEmpty(this.props.extraData.params.screenData.estate_story_pk)) {
            CommonFunction.fn_call_toast('잘못된 접근입니다',1500);
            setTimeout(
                () => {            
                    this.props.navigation.goBack(null);
                },1500
            )
        }else{
            await this.getInformation(1,false,this.props.extraData.params.screenData.estate_story_pk);
            await this.getDetailInformation(this.props.extraData.params.screenData);            
            
            this.props.navigation.addListener('focus', () => {
               
                if ( this.props.isReloadMode ) {
                    //this.props._updateisReloadMode(false);
                    this.getDetailInformation(this.state.estate_story_pk);
                }

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

    modifyContent = async() => {
        setTimeout(
            () => {            
                this.props.navigation.navigate('NewHouseStoryModifyStack',{
                    screenData : this.state.resultData,
                    estate_story_pk : this.state.estate_story_pk
                })
            },500
        )
    }

    removeContent = async() => {     
        Alert.alert(
            DEFAULT_CONSTANTS.appName,      
            "정말로 삭제하시겠습니까?",
            [
                {text: '네', onPress: () => this.removeActionStory()},
                {text: '아니오', onPress: () => console.log('Cancle')},  
            ],
            { cancelable: true }
        )    
    }

    removeActionStory = async() => {
        this.setState({moreLoading:true})
        let returnCode = {code:9998};        
        try {
            returnCode = await MainapiObject.API_removeHouseStory({
                locale: "ko",
                target_pk : this.state.estate_story_pk
            });
            if ( returnCode.code === '0000') {
                CommonFunction.fn_call_toast('정상적으로 삭제되었습니다.',1500);
                this.props._updateisReloadMode(true);
                setTimeout(
                    () => {            
                        this.props.navigation.goBack(null);
                    },1500
                )
                this.setState({moreLoading:false,})
            }else{
                CommonFunction.fn_call_toast('삭제가 정상적으로 처리되지 않았습니다.',2000)
                this.setState({moreLoading:false})
            }
        }catch(e){
            this.setState({moreLoading:false})
        }
    }

    renderPagination = (index, total, context) => {
        return (
            <View style={styles.paginationStyle}>
                <TextRobotoR style={styles.paginationText2}>
                <TextRobotoR style={styles.paginationText}>{index + 1}</TextRobotoR>/{total}
                </TextRobotoR>
            </View>
        )
    }
    setImages = async(data) => {
        let selectedFilterCodeList = [];   
        await data.forEach(function(element,index,array){            
            selectedFilterCodeList.push({url:element.url,freeHeight:true});
        });
        return selectedFilterCodeList;
    }

    setImageGallery = async( data, idx ) => {
        if ( data.length > 0 ) {
            let returnArray = await this.setImages(data)
            this.setState({
                imageIndex: idx-1,
                thisImages : returnArray
            })
            this.setState({isImageViewVisible: true})
        }
    }

    logoutAction = () => {
        this.props.navigation.navigate('LoginPopStack');
    }
    loginCheck = async() => {
        if ( CommonUtil.isEmpty(this.props.userToken)) {
            this.textInput.blur();
            Alert.alert(
                DEFAULT_CONSTANTS.appName,      
                "로그인이 필요합니다. 로그인하시겠습니까?",
                [
                    {text: '네', onPress: () => this.logoutAction()},
                    {text: '아니오', onPress: () => console.log('Cancle')},
                ],
                { cancelable: true }
            ) 
        }   
    }

    updateLike = async(estate_story_pk,bool) => {
        if ( CommonUtil.isEmpty(this.props.userToken)) {
            this.textInput.blur();
            Alert.alert(
                DEFAULT_CONSTANTS.appName,      
                "로그인이 필요합니다. 로그인하시겠습니까?",
                [
                    {text: '네', onPress: () => this.logoutAction()},
                    {text: '아니오', onPress: () => console.log('Cancle')},
                ],
                { cancelable: true }
            ) 
        }else{
            this.setState({moreLoading:true})
            let returnCode = {code:9998};            
            try {
                returnCode = await MainapiObject.API_updateStoryLike({
                    locale: "ko",
                    class_type : 'House',
                    target_pk : estate_story_pk
                });                
                if ( returnCode.code === '0000') {                        
                    this.setState({moreLoading:false,isLike:!bool})
                }else{
                    this.setState({moreLoading:false})
                }
            }catch(e){
                this.setState({moreLoading:false})
            }
        }
    }

    userBlock = async(item) => {
        Alert.alert(
            DEFAULT_CONSTANTS.appName,      
            item.member.name + "님을 차단하시겠습니다. 해당유저는 댓글작성에 제한이 됩니다.",
            [
                {text: '네', onPress: () => this.actiouserBlock(item)},
                {text: '아니오', onPress: () => console.log('Cancle')},  
            ],
            { cancelable: true }
        ) 
    }
    actiouserBlock = async(item) => {

        this.setState({moreLoading:true})
        let returnCode = {code:9998};        
        try {
            returnCode = await MainapiObject.API_registblockUser({
                locale: "ko",
                target_pk : item.member.member_pk
            });
            if ( returnCode.code === '0000') {                
                CommonFunction.fn_call_toast('정상적으로 차단되었습니다.',2000)
                this.setState({moreLoading:false})
            }else{
                CommonFunction.fn_call_toast('정상적으로 등록되지 않았습니다.',2000)
                this.setState({moreLoading:false})
            }
        }catch(e){
            this.setState({moreLoading:false})
        }
    }

    registReply = async() => {
        if ( !CommonUtil.isEmpty(this.state.replyContents)) {
            Alert.alert(
                DEFAULT_CONSTANTS.appName,      
                "댓글을 등록하시겠습니까?",
                [
                    {text: '네', onPress: () => this.actioRegistReply(this.state.replyContents)},
                    {text: '아니오', onPress: () => console.log('Cancle')},  
                ],
                { cancelable: true }
            ) 
        }else{
            CommonFunction.fn_call_toast('댓글을 입력해주세요',2000);
            return false;
        }
    }
    actioRegistReply = async(contents) => {
        if ( this.state.moreLoading === false ) {
            this.setState({moreLoading:true})
            let text = await CommonFunction.isForbiddenWord( contents, SpamWords.FilterWords.badWords); 
            let returnCode = {code:9998};        
            try {
                returnCode = await MainapiObject.API_registReplyStory({
                    locale: "ko",
                    class_type : 'House',
                    contents:text.trim(),
                    target_pk : this.state.estate_story_pk
                });
                if ( returnCode.code === '0000') {   
                    this.textInput.clear();
                    this.textInput.blur();
                    //this.setState({replyContents:null})                  
                    this.getInformation(1,false,this.state.estate_story_pk)
                }else{
                    CommonFunction.fn_call_toast('정상적으로 등록되지 않았습니다.',2000)
                    this.setState({moreLoading:false})
                }
            }catch(e){
                this.setState({moreLoading:false})
            }
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

    registAnswerReply = async(item,stateProp,idx) => {
        
        const comment = this.state['myInput_' + idx];
        //console.log('comment',item)
        if ( !CommonUtil.isEmpty(comment)) {
            Alert.alert(
                DEFAULT_CONSTANTS.appName,      
                "답글을 등록하시겠습니까?",
                [
                    {text: '네', onPress: () => this.actionRegistAnswerReply(item,comment,idx)},
                    {text: '아니오', onPress: () => console.log('Cancle')},  
                ],
                { cancelable: true }
            ) 
        }else{
            CommonFunction.fn_call_toast('답글을 입력해주세요',2000);
            return false;
        }
    }
    actionRegistAnswerReply = async(item,contents,idx) => {
        this.setState({moreLoading:true})
        let text = await CommonFunction.isForbiddenWord( contents, SpamWords.FilterWords.badWords); 
        let returnCode = {code:9998};        
        try {
            returnCode = await MainapiObject.API_registReplyStory({
                locale: "ko",
                class_type : 'House',
                contents : text,
                target_pk : this.state.estate_story_pk,
                parent_reply_pk : item.reply_pk,
            }); 
            //console.log('returnCode',returnCode);
            if ( returnCode.code === '0000') {         
                //this.setState({[stateProp]: null})   
                this.myInput[idx].clear();
                this.myInput[idx].blur(); 
                this.getInformation(1,false,this.state.estate_story_pk)
                
            }else{
                CommonFunction.fn_call_toast('정상적으로 등록되지 않았습니다.',2000)
                this.setState({moreLoading:false})
            }
        }catch(e){
            //console.log('returnCode error1',e);
            CommonFunction.fn_call_toast('정상적으로 등록되지 않았습니다.',2000)
            this.setState({moreLoading:false})
        }
    }

    makeChat = async() => {
        if ( !CommonUtil.isEmpty(this.state.agentData)) {
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
    }

    logoutAction = () => {
        this.props.navigation.navigate('LoginPopStack');       
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
                console.log('returnCode',returnCode);
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
                console.log('eeeee',e);
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
            const ImageFooter = ({ imageIndex, imagesCount }) => (
                <View style={styles.footerRoot}>
                  <Text style={styles.footerText}>{`${imageIndex + 1} / ${imagesCount}`}</Text>
                </View>
            );
            return(
                <SafeAreaView style={ styles.container }>
                    { Platform.OS == 'android' &&  <StatusBar backgroundColor={'#fff'} translucent={false} barStyle="dark-content" />}
                    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? "padding" : 'height'}  enabled> 
                    {this.state.popLayerView && (
                    <View >
                        <Overlay
                            isVisible={this.state.popLayerView}
                            windowBackgroundColor="rgba(0, 0, 0, 0.8)"
                            overlayBackgroundColor="tranparent"
                            containerStyle={{borderRadius:30}}
                        >
                            <View style={{width:SCREEN_WIDTH*0.6,height:SCREEN_HEIGHT*0.4,backgroundColor:'transparent'}}>
                                <PopLayerDeclaration screenState={{
                                    roomIdx : this.state.estate_story_pk,
                                    class_type : 'housestory',
                                    member_pk : this.state.userData.member_pk,
                                    target_member :  this.state.resultData.member_pk,
                                    targetName : this.state.resultData.member.name,
                                    closePopView : this.closePopView.bind(this)
                                }} />
                            </View>
                        </Overlay>
                    </View>
                    )}
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
                                <CustomTextB style={CommonStyle.stackHeaderCenterText}>{this.state.componentTitle}</CustomTextB>
                            </View>
                            <View style={styles.fixedHeaderRight}>
                                <TouchableOpacity 
                                    hitSlop={{left:10,right:10,top:10,bottom:10}}
                                    style={{marginRight:this.state.userData.member_pk === this.state.resultData.member_pk ? 25 : -20,width:40,}}
                                    onPress={()=>this.updateLike(this.state.estate_story_pk,this.state.isLike)}
                                >
                                    <Image source={this.state.isLike ? ICON_HEART_IMAGE : ICON_HEART2_IMAGE} style={{width:CommonUtil.dpToSize(30),height:CommonUtil.dpToSize(30)}} />
                                </TouchableOpacity>
                                {this.state.userData.member_pk === this.state.resultData.member_pk ?
                                <View style={Platform.OS === 'ios' ? styles.topFixedMenuWrapiOS : styles.topFixedMenuWrapAndroid}>
                                    <TouchableOpacity style={styles.headerMenuWrap} onPress={()=>this.removeContent()}>
                                        <CustomTextM style={styles.headerMenuText}>글삭제</CustomTextM>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.headerMenuWrap} onPress={()=>this.modifyContent()}>
                                        <CustomTextM style={styles.headerMenuText}>글수정</CustomTextM>
                                    </TouchableOpacity>
                                    {/* <TopCustomMenu
                                        menutext=""
                                        menustyle={{width:40,height:50,marginRight:0}}
                                        textStyle={{color: '#fff'}}                                                
                                        isIcon={true}
                                        onPressModify={()=>this.modifyContent()}
                                        onPressRemove={()=>this.removeContent()}
                                    /> */}
                                </View>
                                :
                                null
                                    /* <View style={Platform.OS === 'ios' ? styles.topFixedMenuWrapiOS : styles.topFixedMenuWrapAndroid2}>
                                    <Image source={ICON_MENU_IMAGE} style={{width:CommonUtil.dpToSize(30),height:CommonUtil.dpToSize(30)}} />
                                </View> */
                                }
                            </View>
                            
                        </View>
                    </View>   
                    {!CommonUtil.isEmpty(this.state.agentData) &&  
                    <View style={styles.chatWrap}>
                        <TouchableOpacity onPress={()=>this.makeChat()}>
                            <Image source={BUTTON_CHAT_IMAGE} style={{width:CommonUtil.dpToSize(30*2),height:CommonUtil.dpToSize(30*2)}} />
                        </TouchableOpacity>
                    </View>  
                    }
                    <View style={styles.dataCoverWrap}>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            indicatorStyle={'white'}
                            scrollEventThrottle={16}
                            keyboardDismissMode={'on-drag'}      
                            style={{width:'100%'}}
                        >
                            {!CommonUtil.isEmpty(this.state.image_1) &&
                            <View style={{flex:1,backgroundColor:'transparent'}}>
                                <Swiper
                                    style={[{margin:0,padding:0,backgroundColor:'transparent',height:SCREEN_WIDTH/4*3}]}
                                    renderPagination={this.renderPagination}
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                    loop={true}
                                    autoplay={false}
                                >
                                    {!CommonUtil.isEmpty(this.state.image_1) &&
                                    <TouchableOpacity onPress={() => this.setImageGallery(this.state.imageArray, 1)}>  
                                        <Image
                                            style={{width:'100%',aspectRatio:1}}
                                            source={{uri:DEFAULT_CONSTANTS.imageBaseUrl + this.state.image_1}}
                                            resizeMode={'cover'}
                                        />
                                    </TouchableOpacity>
                                    }
                                    {!CommonUtil.isEmpty(this.state.image_2) &&
                                    <TouchableOpacity onPress={() => this.setImageGallery(this.state.imageArray, 2)}>  
                                        <Image
                                            style={{ width:SCREEN_WIDTH,height:SCREEN_WIDTH/4*3}}
                                            source={{uri:DEFAULT_CONSTANTS.imageBaseUrl + this.state.image_2}}
                                            resizeMode={'cover'}
                                        />
                                    </TouchableOpacity>
                                    }
                                    {!CommonUtil.isEmpty(this.state.image_3) &&
                                    <TouchableOpacity onPress={() => this.setImageGallery(this.state.imageArray, 3)}>  
                                        <Image
                                            style={{ width:SCREEN_WIDTH,height:SCREEN_WIDTH/4*3}}
                                            source={{uri:DEFAULT_CONSTANTS.imageBaseUrl + this.state.image_3}}
                                            resizeMode={'cover'}
                                        />
                                    </TouchableOpacity>
                                    }
                                    {!CommonUtil.isEmpty(this.state.image_4) &&
                                    <TouchableOpacity onPress={() => this.setImageGallery(this.state.imageArray, 4)}>  
                                        <Image
                                            style={{ width:SCREEN_WIDTH,height:SCREEN_WIDTH/4*3}}
                                            source={{uri:DEFAULT_CONSTANTS.imageBaseUrl + this.state.image_4}}
                                            resizeMode={'cover'}
                                        />
                                    </TouchableOpacity>
                                    }
                                </Swiper>
                            </View>
                            }
                            <View style={{flex:1,padding:20}}>
                                <CustomTextB style={[CommonStyle.textSize16,CommonStyle.fontColor000]}>{this.state.resultData.title}</CustomTextB>
                            </View>
                            <View style={styles.rowDescripWrap2}>
                                <View style={styles.rowDescripLeftWrap}>
                                    <Image source={ICON_WRITER} style={{width:CommonUtil.dpToSize(18),height:CommonUtil.dpToSize(18)}} />
                                    <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor000]}>
                                    {this.state.resultData.member.name}                    
                                    </CustomTextR>
                                    <Image source={ICON_COMMOM_DOT} resizeMode={'contain'} style={styles.dotWrap} />
                                    <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor999]}>
                                    {CommonFunction.convertUnixToDateToday2(this.state.resultData.reg_date)}                   
                                    </CustomTextR>
                                    <Image source={ICON_COMMOM_DOT} resizeMode={'contain'} style={styles.dotWrap} />
                                    <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor999]}>
                                        조회 {CommonFunction.currencyFormat(this.state.resultData.viewCount)} 
                                    </CustomTextR>
                                    <TouchableOpacity 
                                        //onPress={()=>this.moveDetail('DeclarationStack')}
                                        onPress={()=>this.openPopView()}
                                        style={{flex:1,justifyContent:'center',alignItems:'flex-end'}}>
                                        <Image source={ICON_SINGO} style={{width:CommonUtil.dpToSize(20),height:CommonUtil.dpToSize(20)}} />
                                    </TouchableOpacity>
                                </View>                                            
                            </View>
                            <View style={styles.dataRowWrap2}/>
                            <View style={styles.rowDescripWrap2}>
                                <View style={{paddingTop:10,alignItems:'flex-start',minHeight:SCREEN_HEIGHT*0.2}}>
                                    <HTMLConvert 
                                        {...DEFAULT_PROPS}
                                        html={this.state.resultData.contents}
                                    />
                                </View>
                            </View>
                            <View style={styles.replyTitleWrap} >
                                <CustomTextR style={[CommonStyle.textSize13,CommonStyle.fontColor000]}>
                                    댓글 {this.state.totalCount}개
                                </CustomTextR>
                            </View>
                            <View style={ styles.contentDataCoverWrap }>
                                {this.state.replyData.map((item,index) => (
                                <View key={index} style={styles.contentDataWrap}>
                                    <View style={styles.dataRowWrap}>
                                        {this.state.userData.member_pk === item.member_pk &&
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
                                                        {!CommonUtil.isEmpty(item.member) ? item.member.name : '익명'}
                                                    </CustomTextR>
                                                </View>                                                
                                            </View>
                                            <View style={{paddingTop:5}}>
                                                <CustomTextR style={[CommonStyle.textSize13,CommonStyle.fontColor000]}>{item.contents}</CustomTextR>
                                            </View>
                                            <View style={styles.rowDescripWrap}>
                                                <View style={styles.rowDescripLeftWrap}>
                                                    <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                                        {CommonFunction.convertUnixToDateToday2(item.reg_date)}                
                                                    </CustomTextR>
                                                </View>
                                                { ( this.state.resultData.member_pk === this.state.userData.member_pk  && item.childs.length === 0 ) &&
                                                <TouchableOpacity style={styles.rowDescripRightWrap} 
                                                    onPress={()=>this.openReplyMore(index,item.showMoreReply)}
                                                >
                                                    <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                                        { item.showMoreReply ? '답글쓰기 취소' :'답글쓰기'}
                                                    </CustomTextR>
                                                </TouchableOpacity>
                                                }
                                                
                                                {this.state.userData.member_pk === this.state.resultData.member_pk &&
                                                <TouchableOpacity style={styles.rowDescripRightWrap} 
                                                    onPress={()=>this.removeReply(item)}
                                                >
                                                    <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                                        댓글삭제
                                                    </CustomTextR>
                                                </TouchableOpacity>
                                                }
                                                {this.state.userData.member_pk === this.state.resultData.member_pk &&
                                                <TouchableOpacity style={styles.rowDescripRightWrap} 
                                                    onPress={()=>this.userBlock(item)}
                                                >
                                                    <Image source={ICON_SINGO} style={{width:CommonUtil.dpToSize(20),height:CommonUtil.dpToSize(20)}} />
                                                </TouchableOpacity>
                                                }
                                            </View>
                                            { item.childs.length > 0 && 
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
                                                            <CustomTextM style={[CommonStyle.textSize13,CommonStyle.fontColor555]}>{item.childs[0].contents}</CustomTextM>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                            }
                                        </View>
                                        {item.showMoreReply && 
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
                                                onPress={()=>this.registAnswerReply(item,'myInput_'+index,index)}
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
                            {this.state.ismore &&
                            <View style={CommonStyle.moreButtonWrap}>
                                <TouchableOpacity 
                                    onPress={() => this.getInformation(parseInt(this.state.currentPage)+1,true,this.state.estate_story_pk)}
                                    style={CommonStyle.moreButton}
                                >
                                <CustomTextL style={CommonStyle.moreText}>더보기</CustomTextL>
                                </TouchableOpacity>
                            </View>
                            }  
                            <View style={{backgroundColor:'#ccc',marginVertical:20,height:1}} />        
                            <View style={ styles.contentDataCoverWrap }>
                                <View style={[styles.rowRightWrap,{flexDirection:'row'}]} >
                                    <View style={{flex:1}} >
                                        <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor000]}>
                                            댓글작성
                                        </CustomTextR>
                                    </View>
                                    <View style={{flex:3,alignItems:'flex-end',justifyContent:'center'}} >
                                        <CustomTextR style={[CommonStyle.textSize8,CommonStyle.fontColor999]}>
                                            *댓글작성시 욕설, 비방글이 포함되지 않도록 주의해 주세요!
                                        </CustomTextR>
                                    </View>
                                </View>
                                <View style={styles.rowInputWrap} >
                                    <View style={{flex:5,justifyContent:'center',alignItems:'center'}}>
                                        <TextInput     
                                            ref={(input) => {this.replyInput}}     
                                            placeholder={'댓글을 입력해주세요'}
                                            placeholderTextColor={DEFAULT_COLOR.base_color_999}                           
                                            style={[styles.inputBlank,CommonStyle.defaultOneWayForm]}
                                            value={this.state.replyContents}
                                            onChangeText={text=>this.setState({replyContents:text})}                                            
                                            multiline={false}
                                            clearButtonMode='always'
                                            onFocus={()=>this.loginCheck()}
                                            ref={input => { this.textInput = input }}
                                        />
                                    </View>
                                    <TouchableOpacity 
                                        onPress={()=>this.registReply()}
                                        style={{width:50,justifyContent:'center',alignItems:'center'}}
                                    >
                                        <Image source={ICON_PENCIL} style={CommonStyle.defaultIconImage15} />
                                    </TouchableOpacity>
                                </View>
                            </View>    
                                              
                            <View style={CommonStyle.blankArea}></View>
                            { this.state.moreLoading &&
                                <View style={CommonStyle.moreWrap}>
                                    <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} />
                                </View>
                            }
                            
                        </ScrollView>
                    </View>
                    </KeyboardAvoidingView>
                    <Modal 
                        visible={this.state.isImageViewVisible} transparent={true}
                        onRequestClose={() => this.setState({ isImageViewVisible: false })}
                        style={{margin:0,padding:0}}
                    >
                        <ImageViewer      
                            //glideAlways
                            imageUrls={this.state.thisImages}
                            index={this.state.imageIndex}
                            enableSwipeDown={true}
                            useNativeDriver={true}
                            saveToLocalByLongPress={true}
                            //controls={true}
                            //animationType="fade"
                            //visible={this.state.isImageViewVisible}
                            //renderFooter={this.renderFooter}
                            renderIndicator={this.renderIndicator}
                            onSwipeDown={() => this.setState({ isImageViewVisible: false })}
                            renderFooter={(currentIndex) => (
                                <ImageFooter imageIndex={currentIndex} imagesCount={this.state.thisImages.length} />
                            )}
                        />
                    </Modal>
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
    chatWrap : {
        position:'absolute',right:0,width:70,height:70,zIndex:100,      
        ...Platform.select({
            ios: {
                bottom: 20
            },
            android: {
                bottom: 20
            },
            default: {
                bottom: 20
            }
        })  
    },
    fixedHeaderWrap : {
        position:'absolute',top:0,left:0,width:SCREEN_WIDTH,
        justifyContent:'center',paddingHorizontal:20,zIndex:99,
        ...Platform.select({
            ios: {
                height: DEFAULT_CONSTANTS.BottomHeight
            },
            android: {
                height: DEFAULT_CONSTANTS.BottomHeight,marginTop : 5
            },
            default: {
                height: DEFAULT_CONSTANTS.BottomHeight
            }
        })
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
    topFixedMenuWrapiOS : {
        position:'absolute',right:-5,bottom:0,width:35,height:50
    },
    topFixedMenuWrapAndroid : {
        position:'absolute',right:-5,top:0,width:40,height:50,justifyContent:'center',backgroundColor:'transparent',zIndex:100
    },
    topFixedMenuWrapAndroid2 : {
        position:'absolute',right:-10,top:0,width:40,height:50,justifyContent:'center',backgroundColor:'transparent',zIndex:100
    },
    valueText: {width: 50,color: '#000',fontSize: 20,}, 
    dataCoverWrap : {
        flex:1,
        ...Platform.select({
            ios: {
                marginTop: DEFAULT_CONSTANTS.BottomHeight
            },
            android: {
                marginTop: DEFAULT_CONSTANTS.BottomHeight
            },
            default: {
                marginTop: DEFAULT_CONSTANTS.BottomHeight
            }
        })
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
    dataRowWrap : {
        flex:1,paddingVertical :10,borderBottomWidth:1,borderBottomColor:'#f3f3f3'
    },
    dataRowWrap2 : {
        flex:1,paddingVertical :10,borderBottomWidth:1,borderBottomColor:'#f3f3f3',marginHorizontal:20
    },
    rowLeftWrap : {
        flex:1
    },
    contentDataWrap2 : {
        flex:1,backgroundColor:'#f7f7f7',paddingHorizontal:5,marginVertical:5
    },
    dataRowWrap3 : {
        flex:1,padding :5
    },
    rowRightWrap : {
        flex:5,justifyContent:'flex-start'
    },
    rowDescripWrap : {
        flexDirection:'row',alignItems:'center',marginTop:5
    },
    rowDescripWrap2 : {
        flexDirection:'row',alignItems:'center',marginTop:5,marginHorizontal:20
    },
    rowDescripLeftWrap : {
        flex:1,flexDirection:'row',alignItems:'center'
    },
    rowDescripRightWrap : {
        flex:0.5,maxWidth:50,flexDirection:'row',alignItems:'center',justifyContent:'flex-end'
    },
    replyTitleWrap : {
        flex:1,backgroundColor:'#f6f6f6',marginTop:30,paddingHorizontal:20,paddingVertical:15
    },
    dotWrap :{ 
        width:5,height:5,paddingHorizontal:10
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
    paginationStyle: {
        position: 'absolute',
        flexDirection:'row',
        bottom: 15,
        right: 15,
        backgroundColor:'#555',
        paddingHorizontal:10,
        paddingVertical:3,
        borderRadius:12
    },
    paginationText: {
        color: '#fff',fontSize: PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize13)
    },
    paginationText2: {
        color: '#ccc',
        fontSize: PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize13)
    },
    headerMenuWrap : {
        alignItems:'center',justifyContent:'center'
    },
    headerMenuText : {
        color: '#000',
        ...Platform.select({
            ios: {
                fontSize: PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize11)
            },
            android: {
                fontSize: PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize13)
            },
            default: {
                fontSize: PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize11)
            }
        })
        
        
    },
    footerRoot: {
        height: 64,
        paddingHorizontal:50,
        backgroundColor: "#00000077",
        alignItems: "center",
        justifyContent: "center"
    },
    footerText: {
        fontSize: 17,
        color: "#FFF"
    }
});


function mapStateToProps(state) {
    return {
        userToken : state.GlabalStatus.userToken,
        isReloadMode : state.GlabalStatus.isReloadMode,
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
        _updateisReloadMode:(bool)=> {
            dispatch(ActionCreator.updateisReloadMode(bool))
        },
    };
}


export default connect(mapStateToProps,mapDispatchToProps)(HouseStoryDetailScreen);