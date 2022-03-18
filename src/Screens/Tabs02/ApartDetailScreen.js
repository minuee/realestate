import React, { Component,useEffect } from 'react';
import {Alert,SafeAreaView,ScrollView,TouchableOpacity, View,StyleSheet,Image,Dimensions,ActivityIndicator,Text,TextInput,Linking,BackHandler} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import {connect} from 'react-redux';
import ActionCreator from '../../Ducks/Actions/MainActions';
import { Overlay } from 'react-native-elements';
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
import CheckConnection from '../../Components/CheckConnection';
import PopLayerDeclaration from '../Tabs01/PopLayerDeclaration';
import { apiObject } from "../../Apis/Main";
const DefaultPaginate = 3;

import 'react-native-gesture-handler';
import Menu, {MenuItem, MenuDivider} from 'react-native-material-menu';

const ICON_WRITER = require('../../../assets/icons/icon_writer.png');
const ICON_PENCIL = require('../../../assets/icons/icon_pencil_gray.png');
const ICON_MENU_IMAGE  = require('../../../assets/icons/icon_hamburg.png');
const ICON_LIKE  = require('../../../assets/icons/icon_good.png');
const ICON_SINGO = require('../../../assets/icons/icon_report.png');
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
class ApartDetailScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading : true,
            moreLoading : false,
            ismore :  false,
            popLayerView : false,
            currentpage : 1,
            apart_code : null,
            articleList : [],
            totalCount : 0,
            resultData : [],
            userData : {}
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
    logoutAction = () => {
        this.props.navigation.navigate('LoginPopStack');
    }
    API_getArticles = async(apart_data) => {
        let returnCode = {code:9998};        
        try {
            let mapCondition = null;
            let mapConditionData = null;
            if ( !CommonUtil.isEmpty(this.props.userToken)) {
                mapCondition = CommonUtil.isEmpty(this.props.mapCondition) ? null : this.props.mapCondition;
                mapConditionData = CommonUtil.isEmpty(mapCondition.condition) ? null : mapCondition.condition ;
            }
            returnCode = await apiObject.API_mapsArticleDetail({
                locale: "ko", apart_code : apart_data.apart_code, 
                saleRate: CommonUtil.isEmpty(mapConditionData) ? null : mapConditionData.saleRate
            });
            if ( returnCode.code === '0000') {
                this.setState({
                    articleList : returnCode.data,
                    loading:false
                })
            }else{
                this.setState({loading:false})
            }            
        }catch(e){
            this.setState({loading:false})
        }
    }

    API_getApartStory = async(apart_code) => {
        let returnCode = {code:9998};        
        try {
            returnCode = await apiObject.API_getApartStory({
                locale: "ko",
                complexno : apart_code,
                page : 1,
                paginate  : DefaultPaginate 
            });
            if ( returnCode.code === '0000') {
                this.setState({
                    totalCount : returnCode.total,
                    moreLoading:false,
                    resultData : CommonUtil.isEmpty(returnCode.data.apartStoryList) ? [] : returnCode.data.apartStoryList,                    
                })
            }
        }catch(e){
            this.setState({moreLoading:false,})
        }
    }

    async UNSAFE_componentWillMount() {
        if ( CommonUtil.isEmpty(this.props.extraData.params.screenData.apart_code)) {
            CommonFunction.fn_call_toast('잘못된 접근입니다',1500);
            setTimeout(
                () => {            
                    this.props.navigation.goBack(null);
                },1500
            )
        }else{
            await this.API_getApartStory(this.props.extraData.params.screenData.apart_code);
            await this.API_getArticles(this.props.extraData.params.screenData);            
            this.setState({
                screenData : this.props.extraData.params.screenData,
                apart_code : this.props.extraData.params.screenData.apart_code,
                userData : CommonUtil.isEmpty(this.props.userToken) ? {} : this.props.userToken
            })
            this.props.navigation.addListener('focus', () => {   
                this.API_getApartStory(this.state.apart_code);
            })
            this.props.navigation.addListener('blur', () => {
                BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
                this.setState({loading:false,moreLoading:false})
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
    moveNavigation = (item) => {
        
    }
    moveDetail = async() => {
        const items = this.state.screenData;
        const apart_code = this.state.apart_code;
        this.props.navigation.navigate('StoryDetailStack',{
            screenData : items,
            apart_code : apart_code
        })
    }
    moveArticle = async(mode,val) => {
    }
    
    loginCheck = async(idx) => {
        if ( CommonUtil.isEmpty(this.props.userToken)) {
            this.myInput[idx].blur();
            CommonFunction.checkLogin(this.props);
        }
    }

    replyComment = async(text,stateProp,idx) => {
        this.setState({[stateProp]: text})        
    }


    registReply = async(item,idx) => {
        const comment = this.state['myInput_' + idx];
        if ( !CommonUtil.isEmpty(item)) {
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
        this.setState({moreLoading:true})
        let returnCode = {code:9998};        
        try {
            returnCode = await apiObject.API_registReplyStory({
                locale: "ko",
                class_type : 'Apart',
                contents,
                target_pk : item.apart_story_pk
            });
            if ( returnCode.code === '0000') {           
                this.myInput[idx].clear();     
                this.API_getApartStory(this.state.apart_code)
            }else{
                CommonFunction.fn_call_toast('정상적으로 등록되지 않았습니다.',2000)
                this.setState({moreLoading:false})
            }
        }catch(e){            
            this.setState({moreLoading:false})
        }
    }

    openReplyMore = (idx) => {
        this.state.resultData[idx].showMoreReply = true;
        this.setState({moreLoading:false});
    }

    moveOutlink = (mode = null ,item) => {
        if ( !CommonUtil.isEmpty(item)) {
            Linking.openURL(item)
        }else{
            CommonFunction.fn_call_toast('해당 물건을 홈페이지 정보가 없습니다.',2000)
        }
    }

    render() {
        if ( this.state.loading ) {
            return (
                <ActivityIndicator size="large" color={DEFAULT_COLOR.base_color} style={{paddingTop:100}} />
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
                    >
                        <View style={styles.defaultResultWrap}> 
                            <View style={styles.tdTitleWrap}>
                                <View style={styles.tdTitleFlex1}>
                                    <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor222]}>타입</CustomTextR>
                                </View>
                                <View style={styles.tdTitleFlex1}>
                                    <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor222]}>매매</CustomTextR>
                                </View>
                                <View style={styles.tdTitleFlex1}>
                                    <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor222]}>급매매</CustomTextR>
                                </View>
                                <View style={styles.tdTitleFlex1}>
                                    <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor222]}>전세</CustomTextR>
                                </View>
                                <View style={styles.tdTitleFlex1}>
                                    <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor222]}>급전세</CustomTextR>
                                </View>
                            </View>
                            <View style={{flex:1}}>
                                <View style={{flex:1}}>
                                {
                                    this.state.articleList.length === 0 ?
                                    <View style={styles.defaultWrap}>
                                        <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor555]}>매물 정보가 없습니다.</CustomTextR>
                                    </View>
                                    :
                                    this.state.articleList.map((item, index) => {  
                                    return (
                                        <TouchableOpacity key={index} onPress={()=>this.moveNavigation(item)} style={styles.dataTitleWrap}>
                                            <View style={styles.tdTitleFlex1}>
                                                <CustomTextR style={[CommonStyle.textSize14,CommonStyle.fontColor222]} numberOfLines={1} ellipsizeMode={'tail'}>{item.areaname}</CustomTextR>
                                                {item.heibo > 0 &&
                                                <CustomTextR style={[CommonStyle.textSize8,CommonStyle.fontColor999]} numberOfLines={1} ellipsizeMode={'tail'}>(구:{item.heibo}평)</CustomTextR>
                                                }
                                            </View>
                                            <View style={styles.tdTitleFlex1}>
                                                {
                                                item.trade_avg_price > 0 ?
                                                <CustomTextL style={[CommonStyle.textSize10,CommonStyle.fontColor000]}>
                                                    <TextRobotoM style={[CommonStyle.textSize15,CommonStyle.fontColor000]}>
                                                        {CommonFunction.convertMillionComma(item.trade_avg_price)}
                                                    </TextRobotoM>억
                                                </CustomTextL>
                                                :
                                                <TextRobotoM style={[CommonStyle.textSize15,CommonStyle.fontColor000]}>-</TextRobotoM>
                                                }
                                            </View>
                                            <TouchableOpacity 
                                                onPress={()=>this.moveOutlink('fastDeal',item.fast_deal.homepage)} style={styles.tdTitleFlex1}
                                            >
                                                {
                                                CommonUtil.isEmpty(item.fast_deal) ?
                                                <TextRobotoM style={[CommonStyle.textSize15,CommonStyle.fontColor000]}>-</TextRobotoM>
                                                :
                                                <CustomTextL style={[CommonStyle.textSize10,CommonStyle.fontColorBase]}>
                                                    <TextRobotoM style={[CommonStyle.textSize15,CommonStyle.fontColorBase]}>
                                                        {CommonFunction.convertMillionComma(item.fast_deal.trade_fast_deal)}
                                                    </TextRobotoM>억
                                                </CustomTextL>
                                                }
                                            </TouchableOpacity>
                                            <View style={styles.tdTitleFlex1}>
                                                {
                                                ( item.rent_avg_price == 0 || CommonUtil.isEmpty(item.rent_avg_price) ) ?
                                                <TextRobotoM style={[CommonStyle.textSize15,CommonStyle.fontColor000]}>-</TextRobotoM>
                                                :
                                                <CustomTextL style={[CommonStyle.textSize10,CommonStyle.fontColor000]}>
                                                    <TextRobotoM style={[CommonStyle.textSize15,CommonStyle.fontColor000]}>
                                                        {CommonFunction.convertMillionComma(item.rent_avg_price)}
                                                    </TextRobotoM>억
                                                </CustomTextL>
                                                }
                                            </View>
                                            <TouchableOpacity 
                                                onPress={()=>this.moveOutlink('fastRend',item.fast_rent.homepage)} style={styles.tdTitleFlex1}
                                            >
                                                {
                                                CommonUtil.isEmpty(item.fast_rent) ?
                                                <TextRobotoM style={[CommonStyle.textSize15,CommonStyle.fontColor000]}>-</TextRobotoM>
                                                :
                                                <CustomTextL style={[CommonStyle.textSize10,CommonStyle.fontColorBase]}>
                                                    <TextRobotoM style={[CommonStyle.textSize15,CommonStyle.fontColorBase]}>
                                                        {CommonFunction.convertMillionComma(item.fast_rent.trade_fast_rent)}
                                                    </TextRobotoM>억
                                                </CustomTextL>
                                                }
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    )})
                                }  
                                </View>
                                <View style={{flex:1,alignItems:'flex-end',paddingVertical:5}}>
                                    <CustomTextL style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                        * 급매매/급전세 선택시 매물을 바로 볼수 있습니다.
                                    </CustomTextL>
                                </View> 
                            </View>                            
                        </View>
                        <View style={{flex:1,height:15,backgroundColor:'#e5e6e8',marginTop:30}} />
                        
                        <View style={ styles.dataCoverWrap }>
                            <View style={{flex:3,}} >
                                <CustomTextB style={[CommonStyle.textSize13,CommonStyle.fontColorBase]}>
                                    아파트 이야기
                                </CustomTextB>
                            </View>
                            <TouchableOpacity style={{flex:1,alignItems:'flex-end'}} onPress={()=>this.moveDetail()}>
                                <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor555]}>
                                    전체보기
                                </CustomTextR>
                            </TouchableOpacity>
                        </View>
                        <View style={ styles.contentDataCoverWrap }>
                            {
                            this.state.resultData.length === 0 ?
                            <View style={styles.defaultWrap}>
                                <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor555]}>
                                    첫글을 남겨주세요
                                </CustomTextR>
                            </View>
                            :
                            this.state.resultData.map((item,index) => (
                            <View key={index} style={styles.contentDataWrap}>
                                <View style={styles.dataRowWrap}>                                   
                                    <View style={styles.rowRightWrap} >
                                        <View style={styles.rowDescripWrap}>
                                            <View style={styles.rowDescripLeftWrap}>
                                                <Image source={ICON_WRITER} style={CommonStyle.defaultIconImage20} />
                                                <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor222]}>
                                                    {!CommonUtil.isEmpty(item.member) ? item.member.name : '익명'}
                                                </CustomTextR>
                                            </View>
                                            {this.props.userToken.member_pk !== item.member_pk &&
                                            <TouchableOpacity
                                                onPress={()=>this.openPopView(item)}
                                                style={styles.fixedMenuWrap}
                                            >
                                                <Image source={ICON_SINGO} style={{width:CommonUtil.dpToSize(20),height:CommonUtil.dpToSize(20)}} />
                                            </TouchableOpacity>
                                            }
                                        </View>
                                        <View style={styles.rowDescripWrap}>
                                            <CustomTextM style={[CommonStyle.textSize13,CommonStyle.fontColor000]} numberOfLines={3} ellipsizeMode={'tail'}>{item.contents}</CustomTextM>
                                        </View>
                                        <View style={styles.rowDescripWrap}>
                                            <View style={styles.rowDescripLeftWrap}>
                                                <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                                    {CommonFunction.convertUnixToDateToday(item.reg_date)}
                                                </CustomTextR>
                                            </View>
                                            <View style={styles.rowDescripRightWrap}>
                                                <Image source={ICON_LIKE} style={{width:CommonUtil.dpToSize(12),height:CommonUtil.dpToSize(12),marginRight:5}} />
                                                <View style={{paddingTop:2}}>
                                                    <TextRobotoR style={[CommonStyle.textSize12,CommonStyle.fontColor999]}>
                                                        {item.likeCount}
                                                    </TextRobotoR>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.dataRowWrap2}>
                                    {
                                        item.replyCount > 1 ?
                                        <TouchableOpacity style={styles.rowRightWrap} onPress={()=> this.openReplyMore(index)}>
                                            <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor999]}>
                                                {item.showMoreReply ? '댓글 ' +(item.replyCount) +'개'  : '댓글 ' +(item.replyCount-1) +'개 더보기' }
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
                                    (item.replyCount === 1 || CommonUtil.isEmpty(item.showMoreReply))?                                       
                                    <View style={styles.contentDataWrap2}>
                                        <View style={styles.dataRowWrap3}>
                                            <View style={styles.rowRightWrap} >
                                                <View style={styles.rowDescripWrap}>
                                                    <View style={styles.rowDescripLeftWrap}>
                                                        <Image source={ICON_WRITER} style={CommonStyle.defaultIconImage20} />
                                                        <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor222]}>
                                                            {item.replyList[0].member.name}
                                                        </CustomTextR>
                                                        <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColorccc]}>
                                                            {"   "}{CommonFunction.convertUnixToDateToday(item.replyList[0].reg_date)}
                                                        </CustomTextR>
                                                    </View>                                            
                                                </View>
                                                <View style={styles.rowDescripWrap}>
                                                    <CustomTextM style={[CommonStyle.textSize13,CommonStyle.fontColor000]} numberOfLines={3} ellipsizeMode={'tail'}>{item.replyList[0].contents}</CustomTextM>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                    :
                                    item.replyList.map((item2,index2) => (                                        
                                        <View key={index2} style={styles.contentDataWrap2}>
                                            <View style={styles.dataRowWrap3}>
                                                <View style={styles.rowRightWrap} >
                                                    <View style={styles.rowDescripWrap}>
                                                        <View style={styles.rowDescripLeftWrap}>
                                                            <Image source={ICON_WRITER} style={CommonStyle.defaultIconImage20} />
                                                            <CustomTextR style={[CommonStyle.textSize11,CommonStyle.fontColor222]}>
                                                                {item2.member.name}
                                                            </CustomTextR>
                                                            <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColorccc]}>
                                                                {"   "}{CommonFunction.convertUnixToDateToday(item2.reg_date)}
                                                            </CustomTextR>
                                                        </View>                                            
                                                    </View>
                                                    <View style={styles.rowDescripWrap}>
                                                        <CustomTextM style={[CommonStyle.textSize13,CommonStyle.fontColor000]} numberOfLines={3} ellipsizeMode={'tail'}>{item2.contents}</CustomTextM>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    ))
                                    :
                                    null
                                    }
                                    <View style={styles.rowInputWrap} >
                                        <View style={{flex:5,justifyContent:'center',alignItems:'center'}}>
                                            <TextInput          
                                                placeholder={'댓글을 입력해주세요'}
                                                placeholderTextColor={DEFAULT_COLOR.base_color_999}                           
                                                style={[styles.inputBlank,CommonStyle.defaultOneWayForm]}
                                                value={this.state.formTitle}
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
                                <ActivityIndicator size="large" color={DEFAULT_COLOR.base_color} />
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
        flex:1,margin:20,flexDirection:'row',
        paddingBottom:10,borderBottomColor:'#999',borderBottomWidth:1
    },
    contentDataCoverWrap : {
        flex:1,marginHorizontal:20
    },
    defaultResultWrap : {
        flex:1,paddingHorizontal:20,marginTop:10
    },
    defaultWrap : {
        padding:20
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
    contentDataWrap : {
        flex:1,borderBottomColor:'#000',borderBottomWidth:1,marginBottom:10
    },
    dataRowWrap : {
        flex:1,paddingVertical :10,borderBottomWidth:1,borderBottomColor:'#f3f3f3'
    },
    dataRowWrap2 : {
        flex:1,marginVertical :10
    },
    dataRowWrap3 : {
        flex:1,padding :5
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
        position:'absolute',right:0,top:10,width:20,height:50
    },
    inputContainerStyle : {
        borderWidth:0,borderColor:'#fff',height:20,paddingTop:20
    },
    inputStyle : {
        
    }
});

function mapStateToProps(state) {
    return {
        userToken : state.GlabalStatus.userToken,
        mapCondition : state.GlabalStatus.mapCondition,
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


export default connect(mapStateToProps,mapDispatchToProps)(ApartDetailScreen);