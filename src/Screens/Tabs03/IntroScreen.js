import React, { Component,useEffect } from 'react';
import {StatusBar,SafeAreaView,ScrollView,ActivityIndicator, Platform, TouchableOpacity, View,StyleSheet,Image,Dimensions,PixelRatio,Text,RefreshControl} from 'react-native';
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
import CheckConnection from '../../Components/CheckConnection';
import { apiObject } from "../../Apis/Cdn";

const ICON_COMMOM_DOT = require('../../../assets/icons/icon_dot.png');
const ICON_COMMOM_GOOD = require('../../../assets/icons/icon_good.png');
const ICON_COMMOM_REPLY = require('../../../assets/icons/icon_comment.png');
const DefaultPaginate = 20;
const currentDate =  moment().format('YYYY-MM-DD  23:59:59');
const startDate =  moment().subtract(365, 'd').format('YYYY-MM-DD  00:00:01');
const minDate =  moment().subtract(365*1, 'd').format('YYYY-MM-DD  H:m:s');

class IntroScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isback : false,
            loading : true,
            showTopButton :false,
            moreLoading : false,
            totalCount : 0,
            ismore :  false,
            currentPage : 1,
            sort_item : 'reg_date',
            resultData : []
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

    getInformation = async ( currentpage,morePage = false) => {
       
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
                sort_type : 'DESC'
            }); 
            console.log('returnCode',returnCode);
            if ( returnCode.code === '0000') {
                this.setState({})
                if ( morePage ) {
                    this.moreDataUpdate(this.state.resultData,returnCode )
                }else{
                    this.setState({
                        totalCount : returnCode.total,                        
                        currentPage : returnCode.currentPage,
                        resultData : CommonUtil.isEmpty(returnCode.data.storyList) ? [] : returnCode.data.storyList,
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
            //console.log('focus',this.state.isback)           
            if ( this.state.isback === false || this.props.isReloadMode) {                
                this.setState({isback:false});
                this.props._updateisReloadMode(false);
                this.getInformation(this.state.currentPage,false);
            }
        })
    }

    componentDidMount() {
    }
    componentWillUnmount(){
    }
    /*
    shouldComponentUpdate(nextProps, nextState) {
        const vitalStateChange = nextState.loading !== this.state.loading;
        const vitalStateChange2 = nextState.moreLoading !== this.state.moreLoading;
         return vitalStateChange || vitalStateChange2;
    }
    */
    refreshingData = async() => {
        this.getInformation(1,false);
    }

    moveNavigation = (item) => {
        this.setState({isback:true})
        this.props.navigation.navigate('HouseStoryDetailStack',{
            screenData : item
        })
    }

    orderChange = async(mode) => {
        if ( mode !== this.state.sort_item ) {
            await this.setState({sort_item : mode})
            await this.getInformation(1,false)
        }
    }

    upButtonHandler = () => {        
        this.ScrollView.scrollTo({ x: 0,  animated: true });
    };

    handleOnScroll (event) {             
        //console.log('event.nativeEvent.contentOffset.y',event.nativeEvent.contentOffset.y)
        if ( event.nativeEvent.contentOffset.y >= SCREEN_HEIGHT*0.8 ) {
            this.setState({showTopButton : true,moreLoading:false}) 
        }else{
            this.setState({showTopButton : false,moreLoading:false}) 
        }
    }
    
    renderListView = (item) => {
        let memberName = "익명";
        if(!CommonUtil.isEmpty(item.member) ) {
           if ( !CommonUtil.isEmpty(item.member.name) ) {
                memberName = item.member.name;
           }
        }
        if (CommonUtil.isEmpty(item.image_1)) {
            return (
                <View style={styles.dataRowWrap}>
                    <View style={styles.rowRightWrap2} >
                        <CustomTextR style={[CommonStyle.textSize13,CommonStyle.fontColor000]} numberOfLines={2} ellipsizeMode={'tail'}>
                            {item.title}
                        </CustomTextR>
                        <View style={styles.rowDescripWrap}>
                            <View style={styles.rowDescripLeftWrap}>
                                <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                    {memberName.length > 7 ? memberName.substring(0,6) + '...' : memberName}
                                </CustomTextR>
                                <Image source={ICON_COMMOM_DOT} resizeMode={'contain'} style={styles.dotWrap} />
                                <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                    {CommonFunction.convertUnixToDateToday(item.reg_date)}                 
                                </CustomTextR>
                                <Image source={ICON_COMMOM_DOT} resizeMode={'contain'} style={styles.dotWrap} />
                                <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                주간조회 {item.viewWeekCount}                     
                                </CustomTextR>
                            </View>
                            
                            <View style={styles.rowDescripRightWrap}>
                                <Image source={ICON_COMMOM_GOOD} resizeMode={'contain'} style={styles.markWrap} />
                                <TextRobotoR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                    {item.likeWeekCount}({item.likeCount})                   
                                </TextRobotoR>
                                <Image source={ICON_COMMOM_REPLY} resizeMode={'contain'} style={styles.markWrap} />
                                <TextRobotoR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                    {item.replyWeekCount}({item.replyCount})                         
                                </TextRobotoR>
                            </View>
                        </View>
                    </View>
                </View>
            )
        }else{
            return (
                <View style={[styles.dataRowWrap,{flexDirection:'row'}]}>                
                    <View style={styles.rowLeftWrap}>
                        <Image source={{uri : DEFAULT_CONSTANTS.imageBaseUrl + item.image_1}} style={CommonStyle.defaultIconImage55} />
                    </View>
                    <View style={styles.rowRightWrap} >
                        <CustomTextR style={[CommonStyle.textSize13,CommonStyle.fontColor000]} numberOfLines={2} ellipsizeMode={'tail'}>
                            {item.title}
                        </CustomTextR>
                        <View style={styles.rowDescripWrap}>
                            <View style={styles.rowDescripLeftWrap}>
                                <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                    {memberName.length > 7 ? memberName.substring(0,6) + '...' : memberName}            
                                </CustomTextR>
                                <Image source={ICON_COMMOM_DOT} resizeMode={'contain'} style={styles.dotWrap} />
                                <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                    {CommonFunction.convertUnixToDateToday2(item.reg_date)}
                                </CustomTextR>
                                <Image source={ICON_COMMOM_DOT} resizeMode={'contain'} style={styles.dotWrap} />
                                <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                    주간조회 {item.viewWeekCount}
                                </CustomTextR>
                            </View>
                        </View>
                        <View style={styles.rowDescripWrap}>
                            <View style={styles.rowDescripRightWrap}>
                                
                                <Image source={ICON_COMMOM_GOOD} resizeMode={'contain'} style={styles.markWrap} />
                                <TextRobotoR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                    {item.likeWeekCount}({item.likeCount})
                                </TextRobotoR>
                                <Image source={ICON_COMMOM_REPLY} resizeMode={'contain'} style={styles.markWrap} />
                                <TextRobotoR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                    {item.replyWeekCount}({item.replyCount})
                                </TextRobotoR>
                            </View>
                        </View>
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
                    <CheckConnection isFull={true} />
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
                        <TouchableOpacity style={styles.headerSortData} onPress={()=>this.orderChange('likeWeekCount')}>
                            <CustomTextR style={[CommonStyle.textSize11,this.state.sort_item === 'likeWeekCount' ? CommonStyle.fontColor222 :  CommonStyle.fontColor999]}>좋아요순{" "}</CustomTextR>
                            {/*<Image source={ICON_SORT_TOP} style={{width:12,height:7}} />*/}
                        </TouchableOpacity>

                        <View style={styles.headerSortData2}>
                        <Image source={ICON_COMMOM_REPLY} resizeMode={'contain'} style={styles.markWrap} />
                            <CustomTextL style={[CommonStyle.textSize11,CommonStyle.fontColor222]}>{CommonFunction.currencyFormat(this.state.totalCount)}</CustomTextL>
                        
                        </View>
                    </View>
                    { this.state.showTopButton &&
                        <TouchableOpacity 
                            style={styles.fixedUpButton}
                            onPress={e => this.upButtonHandler()}
                        >
                            <Icon name="up" size={CommonUtil.dpToSize(25)} color="#555" />
                        </TouchableOpacity>
                    }
                    <ScrollView
                        ref={(ref) => {
                            this.ScrollView = ref;
                        }}
                        showsVerticalScrollIndicator={false}
                        indicatorStyle={'white'}
                        scrollEventThrottle={16}
                        keyboardDismissMode={'on-drag'}
                        onScroll={e => this.handleOnScroll(e)}
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
                                    {this.renderListView(item)}
                                </TouchableOpacity>

                            ))}
                        </View>
                        {this.state.ismore &&
                        <View style={CommonStyle.moreButtonWrap}>
                            <TouchableOpacity 
                                onPress={() => this.getInformation(this.state.currentPage+1,true)}
                                style={CommonStyle.moreButton}
                            >
                            <CustomTextL style={CommonStyle.moreText}>더보기</CustomTextL>
                            </TouchableOpacity>
                        </View>
                        }
                        { this.state.moreLoading &&
                            <View style={CommonStyle.moreWrap}>
                                <ActivityIndicator size="large" color={DEFAULT_COLOR.base_color} style={{paddingTop:100}}/>
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
        flex: 1,backgroundColor : "#fff",
        paddingHorizontal:20
    },
    fixedUpButton : {
        position:'absolute',bottom:20,right:20,width:50,height:50,borderColor:'#ccc',borderWidth:1,borderRadius:25,alignItems:'center',justifyContent:'center',zIndex:100
    },
    IndicatorContainer : {
        flex: 1,
        width:'100%',
        backgroundColor : "#fff",
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerSortWrap : {
        height :40,borderBottomColor:'#555',borderBottomWidth:0.5,marginBottom:10,flexDirection:'row'
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
        flex:1,paddingVertical :10,borderBottomWidth:1,borderBottomColor:'#f3f3f3'
    },
    emptyRowWrap : {
        flex:1,paddingVertical :10,
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
        isReloadMode : state.GlabalStatus.isReloadMode
    };
}
function mapDispatchToProps(dispatch) {
    return {        
        _updateisReloadMode:(bool)=> {
            dispatch(ActionCreator.updateisReloadMode(bool))
        },
    };
}

export default connect(mapStateToProps,mapDispatchToProps)(IntroScreen);
