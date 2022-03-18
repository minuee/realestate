import React, { Component,useEffect } from 'react';
import {Alert,SafeAreaView,ScrollView,TouchableOpacity, View,StyleSheet,Image,Dimensions,ActivityIndicator,BackHandler,Linking,Platform} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import {connect} from 'react-redux';
import ActionCreator from '../../Ducks/Actions/MainActions';
import 'moment/locale/ko'
import  moment  from  "moment";
import { Tooltip } from 'react-native-elements';
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

const BTN_NEXT = require('../../../assets/icons/btn_next.png');
const ICON_FOVORITE = require('../../../assets/icons/icon_favorite.png');
const ICON_NONFOVORITE = require('../../../assets/icons/icon_nonfavorite.png');
import { apiObject } from "../../Apis/Main";
const DefaultPaginate = 20;
class TodayFastDealScreen extends  React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            loading : false,
            moreLoading : false,
            totalCount : 0,
            noticeList : [],
            ismore :  false,
            currentPage : 1,
            resultCategoryData : [],
            resultSubCategoryData : [],
            resultData : [],
            resultSubData : [],
            selectedCategory : 'All',
            selectedSubCategory : 'All',
            isViewFastDeal:false
        }
        
        this.scrollView = React.createRef();
        this.scrollSubRef = React.createRef();
        
    }
    moreDataUpdate = async( baseData , addData) => {     
        let newArray = await baseData.concat(addData.data.articleList);
        let defaultArray = this.props.isApartBookMark;
        await addData.data.articleList.forEach(function(value){
            if ( !CommonUtil.isEmpty(value.favorite_pk)) {
                defaultArray.push(value.apart_code);
            }
        });
        this.props._toggleApartDetailBookmark(defaultArray) 
        this.setState({            
            moreLoading : false,
            loading : false,
            currentPage : addData.currentPage,
            resultData : newArray,
            ismore : parseInt(addData.currentPage) < parseInt(addData.lastPage) ? true : false
        })
    }

    getInformation = async ( currentpage,morePage = false,selectedCategory='All',isBookMark=false) => {
        this.setState({moreLoading : true})
        let returnCode = {code:9998};
        const mapCondition = CommonUtil.isEmpty(this.props.mapCondition) ? null : this.props.mapCondition;
        const mapConditionData = CommonUtil.isEmpty(mapCondition.condition) ? null : mapCondition.condition ;
        try {
            returnCode = await apiObject.API_fastDealData({
                locale: "ko",
                Sdate :  moment().format('YYYY-MM-DD'),
                area_sido : selectedCategory,
                area_sido_sub : this.state.selectedSubCategory,
                totalPage :  this.state.totalCount,
                page : currentpage,
                paginate  : DefaultPaginate,
                member_pk : CommonUtil.isEmpty(this.props.userToken) ? null : this.props.userToken.member_pk,
                isBookMark : CommonUtil.isEmpty(this.props.userToken) ? false : isBookMark,
                saleRate: CommonUtil.isEmpty(mapConditionData) ? null : mapConditionData.saleRate
            }); 
            if ( returnCode.code === '0000') {
                if ( morePage ) {
                    this.moreDataUpdate(this.state.resultData,returnCode )
                }else{
                    let tmpResultCategoryData = [];
                    if ( !CommonUtil.isEmpty(returnCode.data.areaData)) {
                        let initialValue = 0;  
                        let selectedTotalAmount = await returnCode.data.areaData.reduce(function(acc,cur) {
                            return acc+parseInt(cur.sido_count)
                        },initialValue);  
                        
                        if ( selectedTotalAmount === 0 ) {
                            tmpResultCategoryData.push(
                                {sido_count:0, area_depth1_code : 'All', depth1_cortarname : '전체'}
                            )
                        }else{
                            tmpResultCategoryData.push(
                                {sido_count:selectedTotalAmount, area_depth1_code : 'All', depth1_cortarname : '전체'},
                                ...returnCode.data.areaData
                            )
                        }                        
                        let defaultArray = [];
                        await returnCode.data.articleList.forEach(function(value){
                            if ( !CommonUtil.isEmpty(value.favorite_pk)) {
                                defaultArray.push(value.apart_code);
                            }
                        });
                        this.props._toggleApartDetailBookmark(defaultArray)
                    }else{
                        tmpResultCategoryData = this.state.resultCategoryData;
                    }
                    let tmpResultSubCategoryData = [];
                    if ( !CommonUtil.isEmpty(returnCode.data.areaSubData)) {
                        let initialValue2 = 0;  
                        let selectedTotalAmount2 = await returnCode.data.areaSubData.reduce(function(acc,cur) {
                            return acc+parseInt(cur.sido_count)
                        },initialValue2);  
                        
                        if ( selectedTotalAmount2 === 0 ) {
                            tmpResultSubCategoryData.push(
                                {sido_count:0, area_depth2_code : 'All', depth2_cortarname : '전체'}
                            )
                        }else{
                            tmpResultSubCategoryData.push(
                                {sido_count:selectedTotalAmount2, area_depth2_code : 'All', depth2_cortarname : '전체'},
                                ...returnCode.data.areaSubData
                            )
                        }
                    }else{
                        tmpResultSubCategoryData = this.state.resultSubCategoryData;
                    }

                    this.setState({
                        currentPage : returnCode.currentPage,
                        totalCount : returnCode.total,
                        resultCategoryData : tmpResultCategoryData,
                        resultSubCategoryData : tmpResultSubCategoryData,
                        resultData : CommonUtil.isEmpty(returnCode.data.articleList) ? [] : returnCode.data.articleList,
                        ismore : parseInt(returnCode.currentPage)  < parseInt(returnCode.lastPage) ? true : false,
                        moreLoading:false,loading:false
                    })
                }
            }else{
                this.setState({loading:false,moreLoading:false})
            }            
        }catch(e){
            this.setState({loading:false,moreLoading:false})
        }
    }

    async UNSAFE_componentWillMount() {
        await this.getInformation(1,false,'All',this.props.isViewFastDeal);    
        this.setState({
            isViewFastDeal : this.props.isViewFastDeal
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
        
    shouldComponentUpdate(nextProps, nextState){        
        const nextisViewFastDeal = nextProps.isViewFastDeal;
        const nowMisViewFastDeal = this.state.isViewFastDeal;
        if ( nextisViewFastDeal !== nowMisViewFastDeal && !this.state.moreLoading ) {
            this.setState({
                isViewFastDeal:nextisViewFastDeal,page:1,totalCount:0,
                resultSubData :[],resultData :[],resultCategoryData : [],resultSubCategoryData : [],
                selectedSubCategory:'All',selectedCategory:'All'
            })
            setTimeout(() => {
                this.getInformation(1,false,this.state.selectedCategory,nextisViewFastDeal)
            }, 100);
            return false;
        }else{
            return true;
        }  
    }
    
    moveNavigation = async(item) => {
        this.props.navigation.navigate('ApartDetailStack',{
            screenData : item
        })
    }

    moveOutlink = async(item) => {
        console.log('moveOutlink',item)
        if ( !CommonUtil.isEmpty(item)) {
            Linking.openURL(item)
        }else{
            CommonFunction.fn_call_toast('해당 물건을 홈페이지 정보가 없습니다.',2000)
        }
    }
    upButtonHandler = () => {        
        this.scrollView.scrollTo({ x: 0,  animated: true });
    };
    leftButtonHandler = () => {        
        this.scrollSubRef.scrollTo({ y: 0,  animated: true });
    };
    filterAreaData = async(item) => {
        
        if ( item.area_depth1_code !== this.state.selectedCategory ) {
            await this.setState({selectedCategory : item.area_depth1_code,selectedSubCategory:'All'})
            setTimeout(() => {
                this.getInformation(1,false,item.area_depth1_code,this.props.isViewFastDeal);
            this.upButtonHandler();
            }, 100);            
        }
    }

    filterSubAreaData = async(item) => {
        if ( item.area_depth2_code !== this.state.selectedSubCategory ) {
            await this.setState({selectedSubCategory : item.area_depth2_code})
            setTimeout(() => {
                this.getInformation(1,false,this.state.selectedCategory,this.props.isViewFastDeal);
                this.upButtonHandler();
            }, 100);
        }
    }
    renderTooltip = () => {
        return (<View style={{width:'100%',padding:5,alignItems:'flex-start'}}>
            <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor000]}>
                링크를 클릭하시면 정보사이트로 이동합니다.{"\n"}
                해당페이지는 해당관리 설정에 따라 없는{"\n"}페이지일수도 있습니다.
            </CustomTextR>
        </View>)
    }

    render() {
        
        if ( this.state.loading ) {
            return (
                <ActivityIndicator size="large" color={DEFAULT_COLOR.base_color} style={{paddingTop:100}}/>
            )
        }else {
            return(
                <SafeAreaView style={ styles.container }>
                    <CheckConnection />
                    { this.state.resultData.length > 0 ?
                    <View style={styles.searchWakuWrap}>
                        <ScrollView 
                            horizontal={true}
                            nestedScrollEnabled={true}
                            showsHorizontalScrollIndicator={false}
                        >
                        {   
                            this.state.resultCategoryData.map((item, index) => {  
                            return (
                                <TouchableOpacity 
                                    style={this.state.selectedCategory === item.area_depth1_code ?  styles.boxWrapOn : styles.boxWrapOff} key={index}
                                    onPress={()=>this.filterAreaData(item)}
                                >
                                    <CustomTextL style={[CommonStyle.textSize12,this.state.selectedCategory === item.area_depth1_code ?CommonStyle.fontColorBase: CommonStyle.fontColor555]}>{item.depth1_cortarname}</CustomTextL>
                                    <TextRobotoM style={[CommonStyle.textSize13,this.state.selectedCategory === item.area_depth1_code ?CommonStyle.fontColorBase: CommonStyle.fontColor555]}>{CommonFunction.currencyFormat(parseInt(item.sido_count))}</TextRobotoM>
                                </TouchableOpacity>
                            )
                            })
                        }
                        </ScrollView>                       
                    </View>
                    :
                    <View style={styles.searchWakuWrap}>
                        <View style={styles.boxWrapOff}>
                            <CustomTextL style={[CommonStyle.textSize12,CommonStyle.fontColor555]}>전체 0</CustomTextL>
                        </View>
                    </View>
                    }
                    { 
                    (this.state.resultSubCategoryData.length > 0 && this.state.selectedCategory !== 'All') &&
                    <View style={styles.searchWakuWrap2}>
                        <ScrollView                                                        
                            ref={(refs) => {this.scrollSubRef = refs}}
                            horizontal={true}
                            nestedScrollEnabled={true}
                            showsHorizontalScrollIndicator={false}
                            onContentSizeChange={() => {
                                // 여기다가 어떤 경우에 스크롤을 하면 될지에 대한 조건문을 추가하면 된다.
                                this.scrollSubRef.scrollTo({ y:0, animated: true })
                            }}
                        >
                        {   
                        this.state.resultSubCategoryData.map((item, index) => {  
                            return (
                                <TouchableOpacity 
                                    style={this.state.selectedSubCategory === item.area_depth2_code ?  styles.boxWrapOn : styles.boxWrapOff} key={index}
                                    onPress={()=>this.filterSubAreaData(item)}
                                >
                                    <CustomTextL style={[CommonStyle.textSize12,this.state.selectedSubCategory === item.area_depth2_code ?CommonStyle.fontColorBase: CommonStyle.fontColor555]}>{item.depth2_cortarname}</CustomTextL>
                                    <TextRobotoM style={[CommonStyle.textSize13,this.state.selectedSubCategory === item.area_depth2_code ?CommonStyle.fontColorBase: CommonStyle.fontColor555]}>{CommonFunction.currencyFormat(parseInt(item.sido_count))}</TextRobotoM>
                                </TouchableOpacity>
                            )
                            })
                        }
                        </ScrollView>                       
                    </View>                    
                    }
                    <ScrollView
                        ref={(ref) => {this.scrollView = ref;}}
                        showsVerticalScrollIndicator={false}
                        indicatorStyle={'white'}
                        scrollEventThrottle={16}
                        keyboardDismissMode={'on-drag'}
                        //onScroll={e => this.handleOnScroll(e)}
                        style={{width:'100%',backgroundColor:'#fff'}}
                    >
                        <View style={styles.defaultResultWrap}> 
                            <View style={styles.tdTitleWrap}>
                                <View style={styles.tdTitleFlex22}>
                                    {
                                    Platform.OS === 'ios' &&
                                        <TouchableOpacity 
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            style={styles.infoWrap} 
                                        >
                                            <Tooltip popover={this.renderTooltip()} width={SCREEN_WIDTH*0.8} height={100} backgroundColor="#f7f7f7" skipAndroidStatusBar={false}>
                                                <Icon name="infocirlceo" size={13} color="#555" />
                                            </Tooltip>
                                        </TouchableOpacity>
                                    }
                                    <CustomTextL style={[CommonStyle.textSize12,CommonStyle.fontColor222]}>  주소/아파트명</CustomTextL>
                                </View>
                                <View style={styles.tdTitleFlex1}>
                                <CustomTextL style={[CommonStyle.textSize12,CommonStyle.fontColor222]}>호가평균</CustomTextL>
                                </View>
                                <View style={styles.tdTitleFlex1}>
                                <CustomTextL style={[CommonStyle.textSize12,CommonStyle.fontColor222]}>급매물</CustomTextL>
                                </View>
                                <View style={styles.tdTitleFlex05}>
                                <CustomTextL style={[CommonStyle.textSize12,CommonStyle.fontColor222]}>링크</CustomTextL>
                                </View>
                            </View>
                            <View style={{flex:1}}>
                                {
                                    this.state.resultData.length === 0 ?
                                    <View style={styles.defaultWrap}>
                                        <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor555]}>급매물 정보가 없습니다.</CustomTextR>
                                    </View>
                                    :
                                    this.state.resultData.map((item, index) => {  
                                    let isBookMark = this.props.isApartBookMark.includes(item.apart_code)
                                    return (
                                        <TouchableOpacity key={index} onPress={()=>this.moveNavigation(item)} style={styles.dataTitleWrap}>
                                            <View style={styles.tdTitleFlex2}>
                                                <Image source={ isBookMark ? ICON_FOVORITE : ICON_NONFOVORITE} style={CommonStyle.defaultIconImage20} />
                                                <View style={{paddingLeft:5}}>
                                                <CustomTextL style={[CommonStyle.textSize12,CommonStyle.fontColor222]} numberOfLines={1} ellipsizeMode={'tail'}>{item.depth1_cortarname} {item.depth2_cortarname}</CustomTextL>
                                                <CustomTextL style={[CommonStyle.textSize10,CommonStyle.fontColor222]} numberOfLines={1} ellipsizeMode={'tail'}>{item.fast_deal.articlename}</CustomTextL>
                                                </View>
                                            </View>
                                            <View style={styles.tdTitleFlex1}>
                                                <CustomTextL style={[CommonStyle.textSize12,CommonStyle.fontColor222]}>
                                                    <TextRobotoM style={[CommonStyle.textSize17,CommonStyle.fontColor222]}>
                                                        {CommonFunction.convertMillionComma(!CommonUtil.isEmpty(item.fast_deal.trade_avg_price)?item.fast_deal.trade_avg_price:item.trade_avg_price)}
                                                    </TextRobotoM>억
                                                </CustomTextL>
                                            </View>
                                            <View style={styles.tdTitleFlex1}>
                                                <CustomTextL style={[CommonStyle.textSize12,CommonStyle.fontColorBase]}>
                                                    <TextRobotoM style={[CommonStyle.textSize17,CommonStyle.fontColorBase]}>{CommonFunction.convertMillionComma(item.fast_deal.trade_fast_deal)}</TextRobotoM>억
                                                </CustomTextL>
                                            </View>
                                            <View style={styles.tdTitleFlex05}>
                                                {
                                                    !CommonUtil.isEmpty(item.fast_deal.homepage) &&
                                                    <TouchableOpacity onPress={()=>this.moveOutlink(item.fast_deal.homepage)}>
                                                        <Image source={BTN_NEXT} style={CommonStyle.defaultImage40} />
                                                    </TouchableOpacity>
                                                }
                                            </View>
                                        </TouchableOpacity>
                                    )})
                                }   
                            </View>
                        </View>
                        {
                            this.state.ismore &&
                            <View style={CommonStyle.moreButtonWrap}>
                                <TouchableOpacity 
                                    onPress={() => this.getInformation(this.state.currentPage+1,true,this.state.selectedCategory,this.props.isViewFastDeal)}
                                    style={CommonStyle.moreButton}
                                >
                                <CustomTextL style={CommonStyle.moreText}>더보기</CustomTextL>
                                </TouchableOpacity>
                            </View>
                        }
                        <View style={CommonStyle.blankArea}></View>
                       
                    </ScrollView>
                    { 
                        this.state.moreLoading &&
                        <View style={CommonStyle.moreWrap}>
                            <ActivityIndicator size="large" color={DEFAULT_COLOR.base_color}/>
                        </View>
                    }
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
        flexDirection:'row',marginLeft:20,height:60,marginVertical:5
    },
    searchWakuWrap2 : {
        flexDirection:'row',marginLeft:20,height:60,marginVertical:5
    },
    boxWrapOn : {
        minWidth:60,borderWidth:1,borderColor:DEFAULT_COLOR.base_color,borderRadius:10,justifyContent:'center',alignItems:'center', marginRight:10,paddingHorizontal:5
    },
    boxWrapOff : {
        minWidth:60,borderWidth:1,borderColor:DEFAULT_COLOR.input_border_color,borderRadius:10,justifyContent:'center',alignItems:'center', marginRight:10,paddingHorizontal:5
    },
    inputBlank : {
        borderWidth:0,borderColor:DEFAULT_COLOR.input_border_color,borderRadius:5,backgroundColor:'#fff'
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
    tdTitleFlex05 : {
        flex:0.5,justifyContent:'center',alignItems:'center'
    },
    tdTitleFlex2 : {
        flex:2,alignItems:'center',flexDirection:'row',overflow:'hidden'
    },
    tdTitleFlex22 : {
        flex:2,alignItems:'center',flexDirection:'row',overflow:'hidden',justifyContent:'center'
    },
    dataTitleWrap : {
        paddingVertical:15,borderBottomColor:'#e6e6e6',borderBottomWidth:1,flexDirection:'row'
    },
   
});

function mapStateToProps(state) {
    return {
        userToken : state.GlabalStatus.userToken,
        isViewFastDeal : state.GlabalStatus.isViewFastDeal,
        isApartBookMark : state.GlabalStatus.isApartBookMark,
        mapCondition : state.GlabalStatus.mapCondition,
    };
}


function mapDispatchToProps(dispatch) {
    return {        
        _toggleApartDetailBookmark:(bool)=> {
            dispatch(ActionCreator.toggleApartDetailBookmark(bool))
        }
    };
}

export default connect(mapStateToProps,mapDispatchToProps)(TodayFastDealScreen);