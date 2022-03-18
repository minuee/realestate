import React, { Component } from 'react';
import {Alert,SafeAreaView,ScrollView,TouchableOpacity, View,StyleSheet,Image,Dimensions,ActivityIndicator,RefreshControl,BackHandler,TextInput} from 'react-native';
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
import CheckConnection from '../../Components/CheckConnection';
import { apiObject } from "../../Apis/Cdn";
import Pagination from '../../Components/Pagination';
const ICON_COMMOM_DOT = require('../../../assets/icons/icon_dot.png');
const ICON_COMMOM_GOOD = require('../../../assets/icons/icon_good.png');
const ICON_COMMOM_REPLY = require('../../../assets/icons/icon_comment.png');
const ICON_SORT_BOTTOM = require('../../../assets/icons/btn_search.png');
const ICON_MY_ARTICLE = require('../../../assets/icons/btn_navi_my.png');
const ICON_MY_ARTICLE_CANCEL = require('../../../assets/icons/icon_deposit_cancel.png');

const DefaultPaginate = 20;
const currentDate =  moment().format('YYYY-MM-DD  23:59:59');
const startDate =  moment().subtract(365, 'd').format('YYYY-MM-DD  00:00:01');
const minDate =  moment().subtract(365*1, 'd').format('YYYY-MM-DD  H:m:s');
const boardList = [
    {id:1,code:'All',name1:'전체',name2:''},
    {id:2,code:'Dialog',name1:'가입',name2:'인사'},
    {id:3,code:'Free',name1:'자유',name2:'게시판'},
    {id:4,code:'Realestate',name1:'부동산',name2:'뉴스'},
    {id:5,code:'Deal',name1:'급매물',name2:'게시판'},
    {id:6,code:'Owner',name1:'재파',name2:'게시판'}
];

class AgentListScreen extends  Component {
    constructor(props) {
        super(props);
        this.state = {   
            searchKeyword : '',
            isback : false,         
            loading : true,
            showTopButton :false,
            moreLoading : false,
            totalCount : 0,
            ismore :  false,
            currentPage : 1,
            sort_item : 'reg_date',
            resultData : [],
            noticeList : [],
            selectedCategory :'All',
            isMyArticle:false,
            toggleMyArticle :  false
        }
    }

    moreDataUpdate = async( baseData , addData) => {     
        let newArray = await baseData.concat(addData.data.storyList);
        this.setState({            
            moreLoading : false,
            loading : false,
            resultData : newArray,
            currentPage : addData.currentPage,
            ismore : parseInt(addData.currentPage) < parseInt(addData.lastPage) ? true : false
        })
    }

    getInformation = async ( currentpage,morePage = false,board_type = 'All') => {
       
        this.setState({moreLoading : true})
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_getEstatestory({
                locale: "ko",
                page : currentpage,
                paginate  : DefaultPaginate ,
                term_start : startDate,
                term_end : currentDate,
                sort_item : this.state.sort_item,
                sort_type : 'DESC',
                board_type ,
                search_word : this.state.searchKeyword,
                filter_pk : this.state.isMyArticle ? this.props.userToken.member_pk : ''
            });
            //console.log('getInformation',returnCode.data.storyList[0])
            if ( returnCode.code === '0000') {
                this.setState({})
                if ( morePage ) {
                    this.moreDataUpdate(this.state.resultData,returnCode )
                }else{
                    this.setState({
                        totalCount : returnCode.total,                        
                        currentPage : returnCode.currentPage,
                        resultData : CommonUtil.isEmpty(returnCode.data.storyList) ? [] : returnCode.data.storyList,
                        noticeList : CommonUtil.isEmpty(returnCode.notice_list) ? [] : returnCode.notice_list,
                        ismore : parseInt(returnCode.currentPage)  < parseInt(returnCode.lastPage) ? true : false,
                        moreLoading:false,loading:false
                    })
                }
            }
            
        }catch(e){
            console.log('returnCode error2',e);
            this.setState({loading:false,moreLoading:false})
        }
    }

    async UNSAFE_componentWillMount() {   
        await this.getInformation(1,false);
        this.props.navigation.addListener('focus', () => {
            //console.log('dddd333',this.props.isReloadMode)
            if ( this.props.isReloadMode) {                
                this.props._updateisReloadMode(false);
                this.getInformation(this.state.currentPage,false,this.state.selectedCategory);
            }
        })
    }
    componentDidMount() {        
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);        
    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    shouldComponentUpdate(nextProps, nextState){        
        const nexttoggleMyArticle = nextProps.toggleMyArticle;
        const nowtoggleMyArticle = this.state.toggleMyArticle;
        console.log('nexttoggleMyArticle', nexttoggleMyArticle)
        console.log('nowtoggleMyArticle', nowtoggleMyArticle)
        if ( nexttoggleMyArticle !== nowtoggleMyArticle && !this.state.moreLoading ) {
            this.setState({
                moreLoading:true,
                toggleMyArticle : nexttoggleMyArticle,
                isMyArticle:nexttoggleMyArticle
            })
            setTimeout(() => {
                this.getInformation(1,false,this.state.selectedCategory);
            }, 100);
            return false;
        }else{
            return true;
        }  
    }
    

    handleBackPress = () => {
        this.props.navigation.goBack(null)
        return true;  // Do nothing when back button is pressed
    }

    upButtonHandler = () => {        
        this.scrollView.scrollTo({ x: 0,  animated: true });
    };

    moveNavigation = (item) => {
        console.log('moveNavigation error2',item);
        this.setState({isback:true})
        this.props.navigation.navigate('NewHouseStoryDetailStack',{
            screenData : item
        })
    }

    filterOnlyMyArticle = async(bool) => {        
        await this.setState({isMyArticle:!bool})
        setTimeout(() => {
            this.getInformation(1,false,this.state.selectedCategory);
            this.upButtonHandler();
        this.upButtonHandler();
        }, 100);  
    }
    filterAreaData = async(item) => {
        
        if ( item.code !== this.state.selectedCategory ) {
            await this.setState({selectedCategory : item.code})
            setTimeout(() => {
                this.getInformation(1,false,item.code);
            this.upButtonHandler();
            }, 100);            
        }
    }

    orderChange = async(mode) => {
        if ( mode !== this.state.sort_item ) {
            await this.setState({sort_item : mode})
            await this.getInformation(1,false,this.state.selectedCategory)
        }
    }

    onPageChange = async(page) => {      
        console.log('onPageChange',page)  
        if ( page > 0 && page <= this.state.totalCount && page != this.state.currentPage ) {
            await this.getInformation(page,false,this.state.selectedCategory)
            this.upButtonHandler();
        }
    }

    getSearchResult = async() => {
        await this.getInformation(1,false,this.state.selectedCategory)
        this.upButtonHandler();
        //this.props._actionToggleSearchForm(false);
    }

    clearInputText = field => {
        this.setState({[field]: '',isResult:false});
    };
    handleOnScroll (event) {             
        //console.log('event.nativeEvent.contentOffset.y',event.nativeEvent.contentOffset.y)
        if ( event.nativeEvent.contentOffset.y >= SCREEN_HEIGHT*0.8 ) {
            this.setState({showTopButton : true,moreLoading:false}) 
        }else{
            this.setState({showTopButton : false,moreLoading:false}) 
        }
    }

    renderListView = (item,is_notice) => {
        let memberName = "익명";
        if(!CommonUtil.isEmpty(item.member) ) {
           if ( !CommonUtil.isEmpty(item.member.name) ) {
                memberName = item.member.name;
           }
        }
        if (CommonUtil.isEmpty(item.image_1)) {
            return (
                <View style={is_notice ? styles.noticedataRowWrap : styles.dataRowWrap}>
                    <View style={styles.rowRightWrap2} >
                        <CustomTextR style={[CommonStyle.textSize13,CommonStyle.fontColor000]} numberOfLines={2} ellipsizeMode={'tail'}>
                            {is_notice ? '[공지]' : ''}{item.title}
                        </CustomTextR>
                        <View style={styles.rowDescripWrap}>
                            <View style={styles.rowDescripLeftWrap}>
                                { !is_notice &&
                                <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                    [{CommonFunction.convertBoardType(item.board_type)}] {memberName.length > 7 ? memberName.substring(0,6) + '...' : memberName}
                                </CustomTextR>
                                }
                                { !is_notice &&
                                    <Image source={ICON_COMMOM_DOT} resizeMode={'contain'} style={styles.dotWrap} />
                                }
                                <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                    {CommonFunction.convertUnixToDateToday(item.reg_date)}                 
                                </CustomTextR>
                                {/* <Image source={ICON_COMMOM_DOT} resizeMode={'contain'} style={styles.dotWrap} />
                                <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                주간조회 {item.viewWeekCount}                     
                                </CustomTextR> */}
                            </View>
                            { !is_notice &&
                            <View style={styles.rowDescripRightWrap}>
                                {/* <Image source={ICON_COMMOM_GOOD} resizeMode={'contain'} style={styles.markWrap} />
                                <TextRobotoR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                    {item.likeWeekCount}({item.likeCount})                   
                                </TextRobotoR> */}
                                <Image source={ICON_COMMOM_REPLY} resizeMode={'contain'} style={styles.markWrap} />
                                <TextRobotoR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                    {item.replyCount}
                                </TextRobotoR>
                            </View>
                            }                            
                        </View>
                    </View>
                </View>
            )
        }else{
            return (
                <View style={[is_notice ? styles.noticedataRowWrap : styles.dataRowWrap,{flexDirection:'row'}]}>                
                    <View style={styles.rowLeftWrap}>
                        <Image source={{uri : DEFAULT_CONSTANTS.imageBaseUrl + item.image_1}} style={CommonStyle.defaultIconImage55} />
                    </View>
                    <View style={styles.rowRightWrap} >
                        <CustomTextR style={[CommonStyle.textSize13,CommonStyle.fontColor000]} numberOfLines={2} ellipsizeMode={'tail'}>
                            {is_notice ? '[공지]' : ''}{item.title}
                        </CustomTextR>
                        <View style={styles.rowDescripWrap}>
                            <View style={styles.rowDescripLeftWrap}>
                                { !is_notice &&
                                <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                    [{CommonFunction.convertBoardType(item.board_type)}]{memberName.length > 7 ? memberName.substring(0,6) + '...' : memberName}            
                                </CustomTextR>
                                }
                                { !is_notice &&
                                <Image source={ICON_COMMOM_DOT} resizeMode={'contain'} style={styles.dotWrap} />
                                }
                                <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                    {CommonFunction.convertUnixToDateToday2(item.reg_date)}
                                </CustomTextR>
                                {/* <Image source={ICON_COMMOM_DOT} resizeMode={'contain'} style={styles.dotWrap} />
                                <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                    주간조회 {item.viewWeekCount}
                                </CustomTextR> */}
                            </View>
                        </View>
                        { !is_notice &&
                        <View style={styles.rowDescripWrap}>
                            <View style={styles.rowDescripRightWrap}>
                                
                                {/* <Image source={ICON_COMMOM_GOOD} resizeMode={'contain'} style={styles.markWrap} />
                                <TextRobotoR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                    {item.likeWeekCount}({item.likeCount})
                                </TextRobotoR> */}
                                <Image source={ICON_COMMOM_REPLY} resizeMode={'contain'} style={styles.markWrap} />
                                <TextRobotoR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                    {item.replyCount}
                                </TextRobotoR>
                            </View>
                        </View>
                        }
                    </View>
                </View>
            )
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
                   {/*  { !CommonUtil.isEmpty(this.props.userToken.member_pk) &&
                        <TouchableOpacity 
                            style={styles.fixedMyButton}
                            onPress={e => this.filterOnlyMyArticle(this.state.isMyArticle)}
                        >
                            {
                                this.state.isMyArticle ?
                                <Image source={ICON_MY_ARTICLE_CANCEL} resizeMode={'contain'} style={styles.fixedIcon} />
                                :
                                <Image source={ICON_MY_ARTICLE} resizeMode={'contain'} style={styles.fixedIcon} />
                            }
                        </TouchableOpacity>
                    } */}
                    { this.state.showTopButton &&
                        <TouchableOpacity 
                            style={styles.fixedUpButton}
                            onPress={e => this.upButtonHandler()}
                        >
                            <Icon name="up" size={CommonUtil.dpToSize(25)} color="#555" />
                        </TouchableOpacity>
                    }
                    <CheckConnection isFull={true} />
                    <View style={styles.searchWakuWrap}>
                        <ScrollView 
                            horizontal={true}
                            nestedScrollEnabled={true}
                            showsHorizontalScrollIndicator={false}
                        >
                            {
                            boardList.map((item, index) => {  
                                return (
                                    <TouchableOpacity 
                                        style={this.state.selectedCategory === item.code ?  styles.boxWrapOn : styles.boxWrapOff} key={index}
                                        onPress={()=>this.filterAreaData(item)}
                                    >
                                        {this.state.selectedCategory === item.code ?
                                        <CustomTextB style={[CommonStyle.textSize13,CommonStyle.fontColorBase]}>{item.name1}</CustomTextB>
                                        :
                                        <CustomTextR style={[CommonStyle.textSize13,CommonStyle.fontColor555]}>{item.name1}</CustomTextR>
                                        }
                                        { !CommonUtil.isEmpty(item.name2) && (
                                            this.state.selectedCategory === item.code ?
                                            <CustomTextB style={[CommonStyle.textSize13,CommonStyle.fontColorBase]}>{item.name2}</CustomTextB>
                                            :
                                            <CustomTextR style={[CommonStyle.textSize13,CommonStyle.fontColor555]}>{item.name2}</CustomTextR>
                                            )
                                        }
                                    </TouchableOpacity>
                                )
                            })
                            }
                        </ScrollView>
                    </View>
                    { 
                    this.props.toggleSearchForm ?
                    <View style={ styles.headerSearchrap }>
                        <View style={{flex:5}}>
                            <TextInput          
                                placeholder={'검색어를 입력해주세요'}
                                placeholderTextColor={DEFAULT_COLOR.base_color_999}
                                style={[styles.inputBlank,CommonStyle.defaultOneWayForm]}
                                value={this.state.searchKeyword}
                                onChangeText={value => this.setState({searchKeyword:value,isResult:false})}
                                multiline={false}
                                clearButtonMode='always'
                                //onFocus={()=>this.setState({isFocus:false})}
                                //onBlur={()=>this.setState({isFocus:true})}
                            />
                            
                        </View>
                        <TouchableOpacity 
                            hitSlop={{left:10,right:10,bottom:10,top:10}}
                            style={{flex:1,alignItems:'flex-end',justifyContent:'center'}}
                            onPress={()=>this.getSearchResult()} 
                        >
                            <Image source={ICON_SORT_BOTTOM} style={{width:CommonUtil.dpToSize(25),height:CommonUtil.dpToSize(25)}} />
                        </TouchableOpacity>
                        {( Platform.OS === 'android' && this.state.searchKeyword !== '' ) && (
                            <TouchableOpacity 
                                hitSlop={{left:10,right:10,bottom:10,top:10}}
                                style={{position: 'absolute', right: 70,top:15}} 
                                onPress={() => this.clearInputText('searchKeyword')}
                            >
                                <Image source={require('../../../assets/icons/btn_remove.png')} resizeMode={'contain'} style={CommonStyle.defaultIconImage20} />
                            </TouchableOpacity>
                            )
                        }
                    </View>
                    :
                    <View style={ styles.headerSortWrap }>
                        <TouchableOpacity style={styles.headerSortData} onPress={()=>this.orderChange('reg_date')}>
                            <CustomTextR style={[CommonStyle.textSize11,this.state.sort_item === 'reg_date' ? CommonStyle.fontColor222 :  CommonStyle.fontColor999]}>등록순{" "}</CustomTextR>
                            
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerSortData} onPress={()=>this.orderChange('viewWeekCount')}>
                            <CustomTextR style={[CommonStyle.textSize11,this.state.sort_item === 'viewWeekCount' ? CommonStyle.fontColor222 :  CommonStyle.fontColor999]}>인기순{" "}</CustomTextR>
                            
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerSortData} onPress={()=>this.orderChange('replyWeekCount')}>
                            <CustomTextR style={[CommonStyle.textSize11,this.state.sort_item === 'replyWeekCount' ? CommonStyle.fontColor222 :  CommonStyle.fontColor999]}>댓글순{" "}</CustomTextR>
                            
                        </TouchableOpacity>
                        {/* <TouchableOpacity style={styles.headerSortData} onPress={()=>this.orderChange('likeWeekCount')}>
                            <CustomTextR style={[CommonStyle.textSize11,this.state.sort_item === 'likeWeekCount' ? CommonStyle.fontColor222 :  CommonStyle.fontColor999]}>좋아요순{" "}</CustomTextR>
                        </TouchableOpacity> */}

                        <View style={styles.headerSortData2}>                        
                            <CustomTextL style={[CommonStyle.textSize11,CommonStyle.fontColor222]}>{this.state.currentPage}P/{CommonFunction.currencyFormat(this.state.totalCount)}개의 결과</CustomTextL>                        
                        </View>
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
                        { this.state.noticeList.length > 0 &&
                        <View style={ styles.contentDataCoverWrap }>                        
                            {
                            this.state.noticeList.map((item,index) => (
                                <TouchableOpacity 
                                    key={index}
                                    onPress={()=>this.moveNavigation(item)} 
                                    style={styles.contentDataWrap}
                                >
                                    {this.renderListView(item,true)}
                                </TouchableOpacity>

                            ))}
                        </View>
                        }
                        <View style={ styles.contentDataCoverWrap }>
                            {
                            this.state.resultData.length === 0 ?
                            <View style={styles.emptyRowWrap}>
                                <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                    등록된 글이 없습니다.
                                </CustomTextR>
                            </View>
                            :
                            this.state.resultData.map((item,index) => (
                                <TouchableOpacity 
                                    key={index}
                                    onPress={()=>this.moveNavigation(item)} 
                                    style={styles.contentDataWrap}
                                >
                                    {this.renderListView(item,false)}
                                </TouchableOpacity>

                            ))}
                        </View>
                        {
                            this.state.resultData.length >  0 &&
                            <Pagination 
                                screenState={{
                                    totalCount : this.state.totalCount,
                                    currentPage  : this.state.currentPage,
                                    ismore  : this.state.ismore,
                                    DefaultPaginate,
                                    onPageChange :  this.onPageChange.bind(this)
                                }}
                                screenProps={this.props} 
                            />
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
    fixedMyButton : {
        position:'absolute',bottom:0,right:10,width:50,height:50,alignItems:'center',justifyContent:'center',zIndex:100
    },
    fixedIcon : {
        width:CommonUtil.dpToSize(35),height:CommonUtil.dpToSize(35)
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
        borderWidth:1,borderColor:DEFAULT_COLOR.input_border_color,borderRadius:5,backgroundColor:'#fff'
    },
    headerSortWrap : {
        height :40,borderBottomColor:'#555',borderBottomWidth:0.5,marginBottom:10,flexDirection:'row',marginHorizontal:20
    },
    headerSearchrap : {
        height :50,borderBottomColor:'#555',flexDirection:'row',marginHorizontal:20
    },
    headerSortData : {
        flexDirection:'row',alignItems:'center',paddingRight:10
    },
    headerSortData2 : {
        flex:1,flexDirection:'row',alignItems:'center',justifyContent:'flex-end',
    },
    contentDataCoverWrap : {
        flex:1,
    },
    contentDataWrap : {
        flex:1,
    },
    dataRowWrap : {
        flex:1,paddingVertical :10,borderBottomWidth:1,borderBottomColor:'#f3f3f3',marginHorizontal:20
    },
    noticedataRowWrap : {
        flex:1,paddingVertical :10,borderBottomWidth:1,borderBottomColor:'#ccc',backgroundColor : '#f3f3f3',paddingHorizontal:20
    },
    emptyRowWrap : {
        flex:1,padding:20
    },
    rowLeftWrap : {
        flex:1
    },
    rowRightWrap : {
        flex:5,paddingLeft:10,justifyContent:'flex-start'
    },
    rowRightWrap2 : {
        flex:5,justifyContent:'flex-start'
    },
    rowDescripWrap : {
        flexDirection:'row',alignItems:'center',marginTop:5
    },
    rowDescripLeftWrap : {
        flex:3,flexDirection:'row',alignItems:'center'
    },
    rowDescripRightWrap : {
        flex:1,flexDirection:'row',alignItems:'center',justifyContent:'flex-end'
    },
    dotWrap :{ 
        width:5,height:5,paddingHorizontal:5
    },
    markWrap : {
        width:CommonUtil.dpToSize(10),height:CommonUtil.dpToSize(10),paddingRight:15
    }
});

function mapStateToProps(state) {
    return {
        userToken : state.GlabalStatus.userToken,
        isViewMyAgent : state.GlabalStatus.isViewMyAgent,
        isAgentBookMark : state.GlabalStatus.isAgentBookMark,
        isReloadMode : state.GlabalStatus.isReloadMode,
        toggleSearchForm : state.GlabalStatus.toggleSearchForm,
        toggleMyArticle : state.GlabalStatus.toggleMyArticle
    };
}

function mapDispatchToProps(dispatch) {
    return {        
        _toggleAgentBookmark:(bool)=> {
            dispatch(ActionCreator.toggleAgentBookmark(bool))
        },
        _updateisReloadMode:(bool)=> {
            dispatch(ActionCreator.updateisReloadMode(bool))
        },
        _actionToggleSearchForm:(bool)=> {
            dispatch(ActionCreator.actionToggleSearchForm(bool))
        }
    };
}

export default connect(mapStateToProps,mapDispatchToProps)(AgentListScreen);