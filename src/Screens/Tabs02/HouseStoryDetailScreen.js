import React, { Component,useEffect } from 'react';
import {Alert,SafeAreaView,ScrollView,TouchableOpacity, View,StyleSheet,Image,Dimensions,RefreshControl,Text,TextInput} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import { Overlay } from 'react-native-elements';
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
import CheckConnection from '../../Components/CheckConnection';
import PopLayerDeclaration from '../Tabs01/PopLayerDeclaration';
import 'react-native-gesture-handler';
import Menu, {MenuItem, MenuDivider} from 'react-native-material-menu';

const ICON_WRITER = require('../../../assets/icons/icon_writer.png');
const ICON_PENCIL = require('../../../assets/icons/icon_pencil_gray.png');
const ICON_MENU_IMAGE  = require('../../../assets/icons/icon_hamburg.png');
const ICON_LIKE  = require('../../../assets/icons/icon_good.png');
const ICON_SINGO = require('../../../assets/icons/icon_report.png');
import { apiObject } from "../../Apis/Main";
const DefaultPaginate = 10;
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
            sort_item : 'reg_date',
            screenData : {},
            apart_code : null,
            resultData : [],
            userData : {},
            target_content : null
        }
        this.myInput = [];
    }

    closePopView = () => {
        this.setState({popLayerView:false})
    }
    openPopView = (item) => {
        if ( CommonUtil.isEmpty(this.props.userToken)) {
            this.textinputs.blur();
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
            this.setState({popLayerView:true,target_content:item})
        } 
       
    }

    refreshingData = async() => {
        this.getInformation(1,false);
    }
    moreDataUpdate = async( baseData , addData) => {     
        
        let resultDataArray = [];
        if ( !CommonUtil.isEmpty(addData.data.apartStoryList) && addData.data.apartStoryList.length > 0 ) {
            await addData.data.apartStoryList.forEach(function(element,index,array){   
                resultDataArray.push({showMoreReply : false,...element});    
            });
        }
        let newArray = await baseData.concat(resultDataArray);
        this.setState({            
            moreLoading : false,
            loading : false,
            resultData : newArray,
            ismore : parseInt(addData.currentPage) < parseInt(addData.lastPage) ? true : false
        })
    }

    getInformation = async ( currentpage,morePage = false, apart_code = null) => {
        this.setState({moreLoading : true})
        let apart_code2 = CommonUtil.isEmpty(apart_code) ? this.state.apart_code : apart_code;
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_getApartStory({
                locale: "ko",
                complexno : apart_code2,
                page : currentpage,
                paginate  : DefaultPaginate,               
                sort_item : this.state.sort_item,
                sort_type : 'DESC'
            }); 
            if ( returnCode.code === '0000') {
                this.setState({currentPage : returnCode.currentPage})
                if ( morePage ) {
                    this.moreDataUpdate(this.state.resultData,returnCode )
                }else{
                    let resultDataArray = [];
                    if ( !CommonUtil.isEmpty(returnCode.data.apartStoryList) && returnCode.data.apartStoryList.length > 0 ) {
                        await returnCode.data.apartStoryList.forEach(function(element,index,array){   
                            resultDataArray.push({showMoreReply : false,...element});    
                        });
                    }
                    this.setState({
                        replyContents:null,
                        totalCount : returnCode.total,                        
                        resultData : resultDataArray,
                        ismore : parseInt(returnCode.currentPage)  < parseInt(returnCode.lastPage) ? true : false,
                        moreLoading:false,loading:false
                    })
                }
            }            
        }catch(e){
            this.setState({loading:false,moreLoading:false})
        }
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
            await this.getInformation(1,false,this.props.extraData.params.apart_code);
            this.setState({
                apart_code : this.props.extraData.params.apart_code,
                screenData : this.props.extraData.params.screenData,
                userData : CommonUtil.isEmpty(this.props.userToken) ? {} : this.props.userToken
            })
            this.props.navigation.addListener('focus', () => {   
                this.getInformation(1,false,this.state.apart_code);
            })
        }        
    }
    componentDidMount() {
    }
    componentWillUnmount(){
    }
    moveNavigation = (item) => {
        this.props.navigation.navigate('HouseDetailStack',{
            screenData : item,
        })
    }

    loginCheck = async(idx) => {
        if ( CommonUtil.isEmpty(this.props.userToken)) {
            this.myInput[idx].blur();
            CommonFunction.checkLogin(this.props);
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

    updateLike = async(item,idx) => {
        if ( CommonUtil.isEmpty(this.props.userToken)) {
            CommonFunction.fn_call_toast('로그인이 필요합니다.',2000);
            return false;
        }else{
            this.setState({moreLoading:true})
            let returnCode = {code:9998};            
            try {
                returnCode = await apiObject.API_updateStoryLike({
                    locale: "ko",
                    class_type : 'Apart',
                    target_pk : item.apart_story_pk
                });
                if ( returnCode.code === '0000') {    
                    this.state.resultData[idx].likeCount =  returnCode.data.likeCount;
                    this.setState({moreLoading:false})
                }else{
                    this.setState({moreLoading:false})
                }
            }catch(e){
                this.setState({moreLoading:false})
            }
        }
    }

    removeStory = async(item) => {
        Alert.alert(
            DEFAULT_CONSTANTS.appName,      
            "정말로 삭제하시겠습니까?",
            [
                {text: '네', onPress: () => this.removeActionStory(item)},
                {text: '아니오', onPress: () => console.log('Cancle')},  
            ],
            { cancelable: true }
        ) 
    }
    
    removeActionStory = async(item) => {
        this.setState({moreLoading:true})
        let returnCode = {code:9998};
        const apartStroy = await this.state.resultData.filter((info) =>  info.apart_story_pk != item.apart_story_pk);
        try {
            returnCode = await apiObject.API_removeApartStory({
                locale: "ko",
                apart_story_pk : item.apart_story_pk
            });
            if ( returnCode.code === '0000') {
                CommonFunction.fn_call_toast('정상적으로 삭제되었습니다.',2000)
                this.setState({moreLoading:false,resultData:apartStroy})
            }else{
                CommonFunction.fn_call_toast('삭제가 정상적으로 처리되지 않았습니다.',2000)
                this.setState({moreLoading:false})
            }
        }catch(e){
            this.setState({moreLoading:false})
        }
    }

    removeReply = async(item,idx,subidx) => {
        Alert.alert(
            DEFAULT_CONSTANTS.appName,      
            "정말로 삭제하시겠습니까?",
            [
                {text: '네', onPress: () => this.removeActionReply(item,idx,subidx)},
                {text: '아니오', onPress: () => console.log('Cancle')},  
            ],
            { cancelable: true }
        ) 
    }
    
    removeActionReply = async(item,idx,subidx) => {
        this.setState({moreLoading:true})
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_removeReplyStory({
                locale: "ko",
                target_pk : item.reply_pk
            });
            if ( returnCode.code === '0000') {
                CommonFunction.fn_call_toast('정상적으로 삭제되었습니다.',2000);
                const replyData = this.state.resultData[idx].filter((info)=> info.reply_pk != item.reply_pk);
                this.state.resultData[idx] = replyData;
                this.setState({moreLoading:false,resultData:apartStroy})
            }else{
                CommonFunction.fn_call_toast('삭제가 정상적으로 처리되지 않았습니다.',2000)
                this.setState({moreLoading:false})
            }
        }catch(e){
            this.setState({moreLoading:false})
        }
    }

    replyComment = async(text,stateProp,idx) => {        
        this.setState({[stateProp]: text})        
    }

    registReply = async(item,idx) => {
        const comment = this.state['myInput_' + idx];
        if ( !CommonUtil.isEmpty(comment)) {
            Alert.alert(
                DEFAULT_CONSTANTS.appName,      
                "댓글을 등록하시겠습니까?",
                [
                    {text: '네', onPress: () => this.actioRegistReply(item,comment,idx)},
                    {text: '아니오', onPress: () => console.log('Cancle')},  
                ],
                { cancelable: true }
            ) 
        }else{
            CommonFunction.fn_call_toast('댓글을 입력해주세요',2000);
            return false;
        }
    }
    actioRegistReply = async(item,contents,idx) => {
        this.state['myInput_' + idx].value = null;
        
        this.setState({moreLoading:true})
        let returnCode = {code:9998};      
        let text = await CommonFunction.isForbiddenWord( contents, SpamWords.FilterWords.badWords);   
        try {
            returnCode = await apiObject.API_registReplyStory({
                locale: "ko",
                class_type : 'Apart',
                contents:text,
                target_pk : item.apart_story_pk
            });
            if ( returnCode.code === '0000') {
                this.myInput[idx].clear();
                this.myInput[idx].blur();
                this.openReplyMore(idx); 
                this.getInformation(1,false,this.state.apart_code)                
            }else{
                CommonFunction.fn_call_toast('정상적으로 등록되지 않았습니다.',2000)
                this.setState({moreLoading:false})
            }
        }catch(e){
            this.setState({moreLoading:false})
        }
    }

    openReplyMore = (idx) => {
        if ( this.state.resultData[idx].showMoreReply ) {
            this.state.resultData[idx].showMoreReply = false;
        }else{
            this.state.resultData[idx].showMoreReply = true;
        }        
        this.setState({moreLoading:false});
    }
    logoutAction = () => {
        this.props.navigation.navigate('LoginPopStack');
    }

    orderChange = async(mode) => {
        if ( mode !== this.state.sort_item ) {
            await this.setState({sort_item : mode})
            await this.getInformation(1,false)
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
                    {
                    this.state.popLayerView && (
                        <View >
                            <Overlay
                                isVisible={this.state.popLayerView}
                                windowBackgroundColor="rgba(0, 0, 0, 0.8)"
                                overlayBackgroundColor="tranparent"
                                containerStyle={{borderRadius:30}}
                            >
                                <View style={{width:SCREEN_WIDTH*0.6,height:SCREEN_HEIGHT*0.4,backgroundColor:'transparent'}}>
                                    <PopLayerDeclaration screenState={{
                                        roomIdx : this.state.target_content.apart_story_pk,
                                        class_type : 'apartstory',
                                        member_pk : this.state.userData.member_pk,
                                        target_member :  this.state.target_content.member_pk,
                                        targetName : this.state.target_content.member.name,
                                        closePopView : this.closePopView.bind(this)
                                    }} />
                                </View>
                                
                            </Overlay>
                        </View>
                        )
                    }   
                    <View style={ styles.dataCoverWrap }>
                        <TouchableOpacity style={styles.headerSortData} onPress={()=>this.orderChange('reg_date')}>
                            <CustomTextR style={[CommonStyle.textSize11,this.state.sort_item === 'reg_date' ? CommonStyle.fontColor222 :  CommonStyle.fontColor999]}>등록순{" "}</CustomTextR>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerSortData}  onPress={()=>this.orderChange('replyCountLiteral')}>
                            <CustomTextR style={[CommonStyle.textSize11,this.state.sort_item === 'replyCountLiteral' ? CommonStyle.fontColor222 :  CommonStyle.fontColor999]}>댓글순{" "}</CustomTextR>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerSortData}  onPress={()=>this.orderChange('likeCountLiteral')}>
                            <CustomTextR style={[CommonStyle.textSize11,this.state.sort_item === 'likeCountLiteral' ? CommonStyle.fontColor222 :  CommonStyle.fontColor999]}>좋아요순{" "}</CustomTextR>
                        </TouchableOpacity>
                    </View>              
                    <ScrollView
                        ref={(ref) => {
                            this.ScrollView = ref;
                        }}
                        showsVerticalScrollIndicator={false}
                        indicatorStyle={'white'}
                        scrollEventThrottle={16}
                        keyboardDismissMode={'on-drag'}
                        //onScroll={e => this.handleOnScroll(e)}
                        style={{width:'100%',backgroundColor:'#fff'}}
                        refreshControl={
                            <RefreshControl
                              refreshing={false}
                              onRefresh={this.refreshingData}
                            />
                        }
                    >
                        <View style={ styles.contentDataCoverWrap }>
                            {
                            this.state.resultData.length === 0 ?
                            <View style={styles.defaultWrap}>
                                <CustomTextR style={[CommonStyle.textSize13,CommonStyle.fontColor555]}>
                                    등록된 글이 없습니다.
                                </CustomTextR>
                            </View>
                            :
                            this.state.resultData.map((item,index) => (
                            <View key={index} style={styles.contentDataWrap}>
                                <View style={styles.dataRowWrap}>
                                    {this.state.userData.member_pk === item.member_pk &&
                                    <TouchableOpacity style={styles.fixedMenuWrap}>                                            
                                        <CustomMenu
                                            menutext="Menu"
                                            menustyle={{width:40,height:50,marginRight:20,alignItems:'flex-end'}}
                                            textStyle={{color: 'red'}}                                                
                                            isIcon={true}
                                            onPress={()=>this.removeStory(item)}
                                        />
                                    </TouchableOpacity>
                                    }
                                    {this.props.userToken.member_pk !== item.member_pk &&
                                    <TouchableOpacity 
                                        //onPress={()=>this.moveDetail('DeclarationStack')}
                                        onPress={()=>this.openPopView(item)}
                                        style={styles.fixedMenuWrap}
                                    >
                                        <Image source={ICON_SINGO} style={{width:CommonUtil.dpToSize(20),height:CommonUtil.dpToSize(20)}} />
                                    </TouchableOpacity>
                                    }
                                    <View style={styles.rowRightWrap} >
                                        <View style={styles.rowDescripWrap}>
                                            <View style={styles.rowDescripLeftWrap}>
                                                <Image source={ICON_WRITER} style={{width:CommonUtil.dpToSize(18),height:CommonUtil.dpToSize(18)}} />
                                                <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor222]}>
                                                {!CommonUtil.isEmpty(item.member) ? item.member.name : '익명'}       
                                                </CustomTextR>
                                            </View>                                            
                                        </View>
                                        <View style={styles.rowDescripWrap}>
                                            <CustomTextM style={[CommonStyle.textSize13,CommonStyle.fontColor000]} >{item.contents}</CustomTextM>
                                        </View>
                                        <View style={styles.rowDescripWrap}>
                                            <View style={styles.rowDescripLeftWrap}>
                                                <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                                {CommonFunction.convertUnixToDateToday(item.reg_date)}
                                                </CustomTextR>
                                            </View>
                                            <TouchableOpacity 
                                                onPress={()=>this.updateLike(item,index)}
                                                style={styles.rowDescripRightWrap}
                                            >
                                                <Image source={ICON_LIKE} style={{width:12,height:12,marginRight:5}} />
                                                <TextRobotoR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                                    {item.likeCount}
                                                </TextRobotoR>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.dataRowWrap2}>
                                    { (item.replyCount > 1  )?
                                    <TouchableOpacity style={styles.rowRightWrap} onPress={()=> this.openReplyMore(index)}>
                                        <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor999]}>
                                            {item.showMoreReply ? '댓글 ' +(item.replyCount) +'개 감추기'  : '댓글 ' +(item.replyCount) +'개 전부보기' }
                                        </CustomTextR>
                                    </TouchableOpacity>
                                    :
                                    <View style={styles.rowRightWrap} >
                                        <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor999]}>
                                            댓글 {item.replyCount}개
                                        </CustomTextR>
                                    </View>
                                    }
                                    {
                                    item.replyCount > 0 ?
                                    (item.replyCount === 1 || item.showMoreReply === false  )?                                       
                                    <View style={styles.contentDataWrap2}>
                                        <View style={styles.dataRowWrap3}>
                                            {item.replyList[0].member_pk === item.member_pk &&
                                            <TouchableOpacity style={styles.fixedMenuWrap}>                                            
                                                <CustomMenu
                                                    menutext="Menu"
                                                    menustyle={{width:40,height:50,marginRight:20,alignItems:'flex-end'}}
                                                    textStyle={{color: 'red'}}                                                
                                                    isIcon={true}
                                                    onPress={()=>this.removeReply(item.replyList[0],index,0)}
                                                />
                                            </TouchableOpacity>
                                            }
                                            {
                                                this.state.userData.member_pk === item.member_pk &&
                                                <TouchableOpacity onPress={()=>this.userBlock(item)} style={styles.fixedMenuWrap2}>
                                                    <Image source={ICON_SINGO} style={{width:CommonUtil.dpToSize(20),height:CommonUtil.dpToSize(20)}} />
                                                </TouchableOpacity>
                                            }
                                            <View style={styles.rowRightWrap} >
                                                <View style={styles.rowDescripWrap}>
                                                    <View style={styles.rowDescripLeftWrap}>
                                                        <Image source={ICON_WRITER} style={{width:CommonUtil.dpToSize(18),height:CommonUtil.dpToSize(18)}} />
                                                        <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor222]}>
                                                            {item.replyList[0].member.name}
                                                        </CustomTextR>
                                                    </View>                                            
                                                </View>
                                                <View style={styles.rowDescripWrap}>
                                                    <CustomTextM style={[CommonStyle.textSize13,CommonStyle.fontColor000]} >{item.replyList[0].contents}</CustomTextM>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                    :
                                    item.replyList.map((item2,index2) => (                                        
                                        <View key={index2} style={styles.contentDataWrap2}>
                                            <View style={styles.dataRowWrap3}>
                                                {item2.member_pk === item.member_pk &&
                                                <TouchableOpacity style={styles.fixedMenuWrap}>                                            
                                                    <CustomMenu
                                                        menutext="Menu"
                                                        menustyle={{width:40,height:50,marginRight:20,alignItems:'flex-end'}}
                                                        textStyle={{color: 'red'}}                                                
                                                        isIcon={true}
                                                        onPress={()=>this.removeReply(item2,index,index2)}
                                                    />
                                                </TouchableOpacity>
                                                }
                                                {
                                                    this.state.userData.member_pk === item2.member_pk &&
                                                    <TouchableOpacity onPress={()=>this.userBlock(item2)} style={styles.fixedMenuWrap2}>
                                                        <Image source={ICON_SINGO} style={{width:CommonUtil.dpToSize(20),height:CommonUtil.dpToSize(20)}} />
                                                    </TouchableOpacity>
                                                }
                                                <View style={styles.rowRightWrap} >
                                                    <View style={styles.rowDescripWrap}>
                                                        <View style={styles.rowDescripLeftWrap}>
                                                            <Image source={ICON_WRITER} style={CommonStyle.defaultIconImage20} />
                                                            <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor222]}>
                                                            {item2.member.name}    
                                                            </CustomTextR>
                                                        </View>                                            
                                                    </View>
                                                    <View style={styles.rowDescripWrap}>
                                                        <CustomTextM style={[CommonStyle.textSize13,CommonStyle.fontColor000]} >{item2.contents}</CustomTextM>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    ))
                                    :
                                    null
                                    }
                                    {
                                        this.state.ismore &&
                                        <View style={CommonStyle.moreButtonWrap}>
                                            <TouchableOpacity 
                                                onPress={() => this.getInformation( parseInt(this.state.currentPage)+1,true)}
                                                style={CommonStyle.moreButton}
                                            >
                                            <CustomTextL style={CommonStyle.moreText}>더보기</CustomTextL>
                                            </TouchableOpacity>
                                        </View>
                                    }
                                    <View style={styles.rowInputWrap} >
                                        <View style={{flex:5,justifyContent:'center',alignItems:'center'}}>
                                            <TextInput          
                                                placeholder={'댓글을 입력해주세요'}
                                                placeholderTextColor={DEFAULT_COLOR.base_color_999}                           
                                                style={[styles.inputBlank,CommonStyle.defaultOneWayForm]}
                                                onChangeText={text=>this.replyComment(text,'myInput_'+index,index)}
                                                multiline={false}
                                                clearButtonMode='always'
                                                onFocus={()=>this.loginCheck(index)}
                                                ref={(input) => {this.myInput[index]=input}}
                                            />
                                        </View>
                                        <TouchableOpacity onPress={()=>this.registReply(item,index)} style={{width:50,justifyContent:'center',alignItems:'center'}}>
                                            <Image source={ICON_PENCIL} style={CommonStyle.defaultIconImage15} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            ))}
                        </View>
                        <View style={CommonStyle.blankArea}></View>
                        { 
                            this.state.moreLoading &&
                            <View style={CommonStyle.moreWrap}>
                                <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} />
                            </View>
                        }
                    </ScrollView>
                </SafeAreaView>
            );
        }
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,backgroundColor : "#fff"
    },
    IndicatorContainer : {
        flex: 1,
        width:'100%',
        backgroundColor : "#fff",
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchWakuWrap : {
        flexDirection:'row',marginLeft:20,height:60,marginVertical:10
    },
    
    boxWrapOn : {
        minWidth:60,borderWidth:1,borderColor:DEFAULT_COLOR.base_color,borderRadius:10,justifyContent:'center',alignItems:'center', marginRight:10
    },
    boxWrapOff : {
        minWidth:60,borderWidth:1,borderColor:DEFAULT_COLOR.input_border_color,borderRadius:10,justifyContent:'center',alignItems:'center', marginRight:10
    },
    inputBlank : {
        borderWidth:0,borderColor:DEFAULT_COLOR.input_border_color,borderRadius:5,backgroundColor:'#fff'
    },
    dataCoverWrap : {
        height:40,marginHorizontal:20,flexDirection:'row',marginBottom:10,paddingBottom:5,
        borderBottomColor:'#999',borderBottomWidth:1
    },
    headerSortData : {
        flexDirection:'row',alignItems:'center',paddingRight:10
    },
    contentDataCoverWrap : {
        flex:1,marginHorizontal:20
    },
    defaultResultWrap : {
        flex:1,paddingHorizontal:20,marginTop:10
    },
    defaultWrap : {
        paddingVertical:20
    },
    boxWrap : {
        flex:1,flexDirection:'row',        
        borderBottomWidth:1,borderBottomColor:DEFAULT_COLOR.input_border_color,
        paddingHorizontal:10,paddingVertical:5
    },
    mainWrap : {
        flex:1,
    },
    tdTitleWrap : {
        paddingVertical:5,borderBottomColor:'#000',borderBottomWidth:1,flexDirection:'row'
    },
    tdTitleFlex1 : {
        flex:1,justifyContent:'center',alignItems:'center'
    },
    tdTitleFlex2 : {
        flex:2,alignItems:'center',flexDirection:'row'
    },
    dataTitleWrap : {
        paddingVertical:5,borderBottomColor:'#e6e6e6',borderBottomWidth:1,flexDirection:'row'
    },
    contentDataWrap2 : {
        flex:1,backgroundColor:'#f7f7f7',paddingHorizontal:5,marginVertical:5
    },
    dataRowWrap3 : {
        flex:1,padding :5
    },
    contentDataWrap : {
        flex:1,borderBottomColor:'#999',borderBottomWidth:1,marginBottom:10
    },
    dataRowWrap : {
        flex:1,paddingVertical :10,borderBottomWidth:1,borderBottomColor:'#f3f3f3'
    },
    dataRowWrap2 : {
        flex:1,marginVertical :10
    },
    rowLeftWrap : {
        flex:1
    },
    rowRightWrap : {
        flex:5,justifyContent:'flex-start'
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
    rowInputWrap : {
        flex:1,flexDirection:'row',borderWidth:0.5,borderColor:'#ccc',borderRadius:5,marginTop:10,justifyContent:'center',alignItems:'center'
    },
    dotWrap :{ 
        width:5,height:5,paddingHorizontal:5
    },
    markWrap : {
        width:10,height:10,paddingRight:15
    },
    fixedMenuWrap : {
        position:'absolute',right:0,top:10,width:20,height:20,zIndex:5
    },
    fixedMenuWrap2 : {
        position:'absolute',right:25,top:10,width:20,height:20,zIndex:5
    },
    inputContainerStyle : {
        borderWidth:0,borderColor:'#fff',height:20,paddingTop:20
    },
    inputStyle : {
        
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
        },
    };
}


export default connect(mapStateToProps,mapDispatchToProps)(HouseStoryDetailScreen);