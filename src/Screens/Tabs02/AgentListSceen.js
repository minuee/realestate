import React, { Component } from 'react';
import {Alert,SafeAreaView,ScrollView,TouchableOpacity, View,StyleSheet,Image,Dimensions,ActivityIndicator,RefreshControl,BackHandler} from 'react-native';
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

const BTN_NEXT = require('../../../assets/icons/btn_next.png');
const ICON_FOVORITE = require('../../../assets/icons/icon_favorite.png');
const ICON_NONFOVORITE = require('../../../assets/icons/icon_nonfavorite.png');

import { apiObject } from "../../Apis/Api";
const DefaultPaginate = 10;

class AgentListScreen extends  Component {
    constructor(props) {
        super(props);

        this.state = {
            isback :false,
            loading : false,            
            moreLoading : true,
            ismore :  false,
            currentpage : 1,
            resultCategoryData : [],
            resultSubCategoryData : [],
            resultData : [],
            resultSubData : [],
            selectedCategory : 'All',
            selectedSubCategory : 'All',
            sort_item : 'reg_date',
            isViewMyAgent:false
            
        }
    }


    moreDataUpdate = async( baseData , addData) => {    
       
        let newArray = await baseData.concat(addData.data.articleList);
        let defaultArray = this.props.isAgentBookMark;        
        await addData.data.articleList.forEach(function(value){
            if ( !CommonUtil.isEmpty(value.favorite_pk)) {
                defaultArray.push(value.estate_agent_pk);
            }
        });        
        this.props._toggleAgentBookmark(defaultArray) 
        this.setState({            
            moreLoading : false,
            loading : false,
            resultData : newArray,
            currentPage : addData.currentPage,
            ismore : parseInt(addData.currentPage) < parseInt(addData.lastPage) ? true : false
        })
    }

    getInformation = async ( currentpage,morePage = false,selectedCategory='All',isBookMark=false) => {
        console.log('this.state.selectedSubCategory',this.state.selectedSubCategory) 
        this.setState({moreLoading : true})
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_agentListData({
                locale: "ko",
                area_sido : selectedCategory,
                area_sido_sub : this.state.selectedSubCategory,
                page : currentpage,
                paginate  : DefaultPaginate,
                sort_item : this.state.sort_item,
                member_pk : CommonUtil.isEmpty(this.props.userToken) ? null : this.props.userToken.member_pk,
                isBookMark : CommonUtil.isEmpty(this.props.userToken) ? false : isBookMark,
            });
            //console.log('returnCode',returnCode.data)
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
                        tmpResultCategoryData.push(
                            {sido_count:selectedTotalAmount, area_code : 'All', cortarname : '전체'},
                            ...returnCode.data.areaData
                        )
                        let defaultArray = [];
                        await returnCode.data.articleList.forEach(function(value){
                            if ( !CommonUtil.isEmpty(value.favorite_pk)) {
                                defaultArray.push(value.estate_agent_pk);
                            }
                        });
                        
                        this.props._toggleAgentBookmark(defaultArray)
                    }
                    let tmpResultSubCategoryData = [];
                    if ( !CommonUtil.isEmpty(returnCode.data.areaSubData)) {
                        let initialValue2 = 0;  
                        let selectedTotalAmount2 = await returnCode.data.areaSubData.reduce(function(acc,cur) {
                            return acc+parseInt(cur.sigungu_count)
                        },initialValue2);  
                        
                        if ( selectedTotalAmount2 === 0 ) {
                            tmpResultSubCategoryData.push(
                                {sigungu_count:0, sigungu : 'All'}
                            )
                        }else{
                            tmpResultSubCategoryData.push(
                                {sigungu_count:selectedTotalAmount2, sigungu : 'All'},
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
            }            
        }catch(e){
            console.log('returnCode error333',e);
            this.setState({loading:false,moreLoading:false})
        }
    }

    async UNSAFE_componentWillMount() {        
        await this.getInformation(1,false,'All',this.props.isViewMyAgent);
        if ( !CommonUtil.isEmpty(this.props.userToken)) {             
            this.props._updateUserBaseData(this.props.userToken.member_pk);
        }
        this.props.navigation.addListener('focus', () => {               
            if ( this.state.isback === false) {                
                this.setState({isback:false});
                this.getInformation(this.state.currentPage,false);
            }
            if ( !CommonUtil.isEmpty(this.props.userToken)) {             
                this.props._updateUserBaseData(this.props.userToken.member_pk);
            }
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
        const nextisViewMyAgent = nextProps.isViewMyAgent;
        const nowisViewMyAgent = this.state.isViewMyAgent;
        if ( nextisViewMyAgent !== nowisViewMyAgent && !this.state.moreLoading ) {            
            this.setState({
                isViewMyAgent:nextisViewMyAgent,page:1,totalCount:0,resultData :[],resultCategoryData : [],sort_item:'reg_date',selectedCategory:'All'
            })
            setTimeout(() => {
                this.getInformation(1,false,this.state.selectedCategory,nextisViewMyAgent)
            }, 100);
            return false;
        }else{
            return true;
        }
    }
        
    upButtonHandler = () => {        
        this.scrollView.scrollTo({ x: 0,  animated: true });
    };
    moveNavigation = async(item) => {        
        this.setState({isback:true})
        this.props.navigation.navigate('AgentDetailStack',{
            screenData : item
        })
    }

    resortingData = async(sort_item) => {
        await this.setState({sort_item:sort_item});
        if ( this.state.resultCategoryData.length > 0 ) {
            this.getInformation(1,false,this.state.selectedCategory,this.props.isViewMyAgent)
        }
    }
    
    filterAreaData = async(item) => {
        await this.setState({selectedCategory : item.area_code, selectedSubCategory:'All'});
        this.getInformation(1,false,this.state.selectedCategory,this.props.isViewMyAgent)
    }
    filterSubAreaData = async(item) => {
        if ( item.area_depth2_code !== this.state.selectedSubCategory ) {
            await this.setState({selectedSubCategory : item.sigungu})
            setTimeout(() => {
                this.getInformation(1,false,this.state.selectedCategory,this.props.isViewMyAgent);
                this.upButtonHandler();
            }, 100);
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
                    
                    {
                        this.state.resultCategoryData.length > 0 ?               
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
                                        style={this.state.selectedCategory === item.area_code ?  styles.boxWrapOn : styles.boxWrapOff} key={index}
                                        onPress={()=>this.filterAreaData(item)}
                                    >
                                        <TextRobotoM style={[CommonStyle.textSize13,this.state.selectedCategory === item.area_code ?CommonStyle.fontColorBase: CommonStyle.fontColor555]}>{item.cortarname}</TextRobotoM>
                                        <TextRobotoM style={[CommonStyle.textSize14,this.state.selectedCategory === item.area_code ?CommonStyle.fontColorBase: CommonStyle.fontColor555]}>{item.sido_count}</TextRobotoM>
                                    </TouchableOpacity>
                                )
                                })
                            }
                            </ScrollView>
                        </View>
                        :
                        <View style={styles.searchWakuWrap}>
                            <View style={styles.boxWrapOff}>
                                <TextRobotoM style={[CommonStyle.textSize12,CommonStyle.fontColor555]}>전체 0</TextRobotoM>
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
                                    style={this.state.selectedSubCategory === item.sigungu ?  styles.boxWrapOn : styles.boxWrapOff} key={index}
                                    onPress={()=>this.filterSubAreaData(item)}
                                >
                                    <TextRobotoM style={[CommonStyle.textSize12,this.state.selectedSubCategory === item.sigungu ?CommonStyle.fontColorBase: CommonStyle.fontColor555]}>{item.sigungu === 'All' ? '전체' : item.sigungu}</TextRobotoM>
                                    <TextRobotoM style={[CommonStyle.textSize13,this.state.selectedSubCategory === item.sigungu ?CommonStyle.fontColorBase: CommonStyle.fontColor555]}>{CommonFunction.currencyFormat(parseInt(item.sigungu_count))}</TextRobotoM>
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
                        style={{width:'100%',backgroundColor:'#fff'}}
                    >
                        <View style={styles.defaultResultWrap}> 
                            <View style={styles.tdTitleWrap}>
                                <TouchableOpacity style={styles.headerSortData} onPress={()=>this.resortingData('reg_date')}>
                                    <CustomTextR style={[CommonStyle.textSize11,this.state.sort_item === 'reg_date' ? CommonStyle.fontColor222 : CommonStyle.fontColorccc]}>등록일순{" "}</CustomTextR>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.headerSortData} onPress={()=>this.resortingData('star_popint')}>
                                    <CustomTextR style={[CommonStyle.textSize11,this.state.sort_item === 'star_popint' ? CommonStyle.fontColor222 : CommonStyle.fontColorccc]}>평점순{" "}</CustomTextR>
                                </TouchableOpacity>
                            </View>
                            <View style={{flex:1}}>
                                {
                                    this.state.resultData.length === 0 ?
                                    <View style={styles.defaultWrap}>
                                        <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor555]}>착한 중개인 정보가 없습니다.</CustomTextR>
                                    </View>
                                    :
                                    this.state.resultData.map((item, index) => {  
                                    let isBookMark = this.props.isAgentBookMark.includes(item.estate_agent_pk) 
                                    return (
                                        <TouchableOpacity key={index} onPress={()=>this.moveNavigation(item)} style={styles.dataTitleWrap}>
                                            <View style={styles.tdTitleFlex05}>
                                                <Image source={ isBookMark ? ICON_FOVORITE : ICON_NONFOVORITE} style={{width:CommonUtil.dpToSize(20),height:CommonUtil.dpToSize(20)}} />
                                            </View>
                                            <View style={styles.tdTitleFlex5}>
                                                <View style={{paddingLeft:5,alignItems:'center'}}>
                                                    <CustomTextM style={[CommonStyle.textSize15,CommonStyle.fontColor000]} numberOfLines={1} ellipsizeMode={'tail'}>
                                                        {item.company_name}{" "}
                                                        <CustomTextL style={[CommonStyle.textSize12,CommonStyle.fontColor999]}>
                                                        {item.address} {/* | {CommonFunction.fn_dataDecode(item.telephone)} | 평점 {item.star_point.toFixed(1)} */}
                                                    </CustomTextL>
                                                    </CustomTextM>
                                                    
                                                </View>
                                            </View>
                                            <View style={styles.tdTitleFlex1}>
                                                <Image source={BTN_NEXT} style={{width:CommonUtil.dpToSize(40),height:CommonUtil.dpToSize(40)}} />
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
                                    onPress={() => this.getInformation(this.state.currentPage+1,true,this.state.selectedCategory,this.props.isAgentBookMark)}
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
                                <ActivityIndicator size="large" color={DEFAULT_COLOR.base_color}/>
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
    tdTitleFlex05 : {
        flex:0.5,alignItems:'center',paddingTop:10
    },
    tdTitleFlex1 : {
        flex:1,justifyContent:'center',alignItems:'center'
    },
    tdTitleFlex5 : {
        flex:5,alignItems:'center',flexDirection:'row'
    },
    dataTitleWrap : {
        paddingVertical:15,borderBottomColor:'#e6e6e6',borderBottomWidth:1,flexDirection:'row'
    },
    headerSortData : {
        flexDirection:'row',alignItems:'center',paddingRight:10
    },
    searchWakuWrap2 : {
        flexDirection:'row',marginLeft:20,height:60,marginVertical:5
    },
});

function mapStateToProps(state) {
    return {
        userToken : state.GlabalStatus.userToken,
        isViewMyAgent : state.GlabalStatus.isViewMyAgent,
        isAgentBookMark : state.GlabalStatus.isAgentBookMark,
    };
}


function mapDispatchToProps(dispatch) {
    return {        
        _toggleAgentBookmark:(bool)=> {
            dispatch(ActionCreator.toggleAgentBookmark(bool))
        },
        _updateUserBaseData:(pk)=> {
            dispatch(ActionCreator.updateUserBaseData(pk))
        }
    };
}


export default connect(mapStateToProps,mapDispatchToProps)(AgentListScreen);