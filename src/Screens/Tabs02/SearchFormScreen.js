import React, { Component,useEffect } from 'react';
import {Alert,SafeAreaView,ScrollView,TouchableOpacity, View,StyleSheet,Image,Dimensions,PixelRatio,ActivityIndicator,TextInput,Linking,BackHandler} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import 'moment/locale/ko'
import  moment  from  "moment";
import AsyncStorage from '@react-native-community/async-storage';
import {connect} from 'react-redux';
import ActionCreator from '../../Ducks/Actions/MainActions';
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
import Loader from '../../Utils/Loader';
import CheckConnection from '../../Components/CheckConnection';
import ScalableImage from '../../Utils/ScalableImage';
const ICON_SORT_BOTTOM = require('../../../assets/icons/btn_search.png');
const BTN_NEXT = require('../../../assets/icons/btn_next.png');
const ICON_FOVORITE = require('../../../assets/icons/icon_favorite.png');
const ICON_NONFOVORITE = require('../../../assets/icons/icon_nonfavorite.png');
import { apiObject } from "../../Apis/Main";
const DefaultPaginate = 10;

class SearchFormScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : true,
            isFocus : true,
            moreLoading : false,
            totalCount : 0,
            noticeList : [],
            ismore :  false,
            currentPage : 1,
            isResult: false,
            resultData : [],
            searchKeyword : '',
            myKeywordHistory : []
        }
    }

    async UNSAFE_componentWillMount() {
        let myKeywordHistory = await AsyncStorage.getItem('MyKeywordHistory');
        if ( !CommonUtil.isEmpty(myKeywordHistory)) {
            let newReturnArray = await JSON.parse(myKeywordHistory).sort(function(a, b) { // 숫자 오름차순
                return a.time > b.time ? -1 : a.time < b.time ? 1 : 0;
            }); 
            this.setState({
                myKeywordHistory : newReturnArray,
                loading:false
            })
        }else{
            this.setState({loading:false})
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
  
    moveNavigation = async(item) => {
        this.props.navigation.navigate('ApartDetailStack',{
            screenData : item
        })
    }
    moveOutlink = (item) => {
        if ( !CommonUtil.isEmpty(item)) {
            Linking.openURL(item)
        }else{
            CommonFunction.fn_call_toast('해당 물건을 홈페이지 정보가 없습니다.',2000)
        }
    }
    getSearchResult = async() => {
        if ( CommonUtil.isEmpty(this.state.searchKeyword))  {
            CommonFunction.fn_call_toast('검색어를 입력해주세요',2000);
            return false;
        }else{
            let searchKeyword = this.state.searchKeyword;
            const timeStampNow =  moment().unix();
            this.setState({moreLoading:true})
            let returnArray = this.state.myKeywordHistory;
            let isIndexOf = await returnArray.findIndex(                
                info => ( info.keyword === searchKeyword )
            );
            let newReturnArray = [];
            if ( isIndexOf != -1 ) {
                await returnArray.forEach(function(element,index,array){         
                    newReturnArray.push({
                        keyword : element.keyword,
                        time : element.keyword === searchKeyword ? timeStampNow  : element.time,
                        id : element.id
                    })
                }); 
            }else{
                newReturnArray = returnArray;
                await returnArray.push({
                    keyword : searchKeyword,
                    time : timeStampNow,
                    id : newReturnArray.length
                })
            }            
            let newReturnArray2 = await newReturnArray.sort(function(a, b) { // 숫자 오름차순
                return a.time > b.time ? -1 : a.time < b.time ? 1 : 0;
            });   
            await AsyncStorage.setItem('MyKeywordHistory', JSON.stringify(newReturnArray2));            
            this.getInformation(1,false,searchKeyword) 
            this.setState({
                isResult : true,                
                myKeywordHistory : newReturnArray2
            })
            
        }
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
            resultData : newArray,
            currentPage : addData.currentPage,
            ismore : parseInt(addData.currentPage) < parseInt(addData.lastPage) ? true : false
        })
    }

    getInformation = async ( currentpage,morePage = false,searchKeyword) => {
        this.setState({moreLoading : true})
        let returnCode = {code:9998};
        try {
            let mapCondition = null;
            let mapConditionData = null;
            if ( !CommonUtil.isEmpty(this.props.userToken)) {
                mapCondition = CommonUtil.isEmpty(this.props.mapCondition) ? null : this.props.mapCondition;
                mapConditionData = CommonUtil.isEmpty(mapCondition.condition) ? null : mapCondition.condition ;
            }
            returnCode = await apiObject.API_fastDealData({
                locale: "ko",
                Sdate :  '',
                area_sido : '',
                totalPage :  this.state.totalCount,
                page : currentpage,
                paginate  : DefaultPaginate,
                member_pk : CommonUtil.isEmpty(this.props.userToken) ? null : this.props.userToken.member_pk,
                isBookMark : false,
                search_keyword : searchKeyword,
                saleRate: CommonUtil.isEmpty(mapConditionData) ? null : mapConditionData.saleRate
            });
            if ( returnCode.code === '0000') {
                if ( morePage ) {
                    this.moreDataUpdate(this.state.resultData,returnCode )
                }else{
                    let defaultArray = [];
                    await returnCode.data.articleList.forEach(function(value){
                        if ( !CommonUtil.isEmpty(value.favorite_pk)) {
                            defaultArray.push(value.apart_code);
                        }
                    });
                    this.props._toggleApartDetailBookmark(defaultArray)
                    this.setState({
                        totalCount : returnCode.total,
                        currentPage : returnCode.currentPage,
                        resultData : CommonUtil.isEmpty(returnCode.data.articleList) ? [] : returnCode.data.articleList,
                        ismore : parseInt(returnCode.currentPage)  < parseInt(returnCode.lastPage) ? true : false,
                        moreLoading:false,loading:false
                    })
                }
            }
        }catch(e){
            this.setState({loading:false,moreLoading:false})
        }
    }
    reSearchData = async(keyword) => {
        this.setState({searchKeyword:keyword.toString()});
    }

    removeKeyword = async(item) => {
        Alert.alert(
            DEFAULT_CONSTANTS.appName,
            item.keyword + '을(를) 검색이력에서 삭제하시겠습니까?',
            [
              {text: '네', onPress: () => this.actionRemove(item)},
              {text: '아니오', onPress: () => console.log('no')},
            ],
            {cancelable: false},
          );
    }
    actionRemove = async(item) => {
        this.setState({moreLoading:true})
        let returnArray = await this.state.myKeywordHistory.filter((info) => info.id !== item.id); 
        await AsyncStorage.setItem('MyKeywordHistory', JSON.stringify(returnArray));
        setTimeout(
            () => {            
                this.setState({moreLoading:false,myKeywordHistory : returnArray})
            },500
        )
    }
    clearInputText = field => {
        this.setState({[field]: '',isResult:false});
    };

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
                <ActivityIndicator size="large" color={DEFAULT_COLOR.base_color} style={{paddingTop:100}} />
            )
        }else {
            return(
                <SafeAreaView style={ styles.container }>
                    <CheckConnection />
                    <View style={styles.searchWakuWrap}>
                        <View style={styles.headerSortData }>
                            <View style={{flex:5}}>
                                <TextInput          
                                    placeholder={'검색어를 입력해주세요'}
                                    placeholderTextColor={DEFAULT_COLOR.base_color_999}
                                    style={[styles.inputBlank,CommonStyle.defaultOneWayForm]}
                                    value={this.state.searchKeyword}
                                    onChangeText={value => this.setState({searchKeyword:value,isResult:false})}
                                    multiline={false}
                                    clearButtonMode='always'
                                    onFocus={()=>this.setState({isFocus:false})}
                                    onBlur={()=>this.setState({isFocus:true})}
                                />
                            </View>
                            <TouchableOpacity 
                                hitSlop={{left:10,right:10,bottom:10,top:10}}
                                style={{flex:1,alignItems:'flex-end'}}
                                onPress={()=>this.getSearchResult()} 
                            >
                                <Image source={ICON_SORT_BOTTOM} style={{width:CommonUtil.dpToSize(30),height:CommonUtil.dpToSize(30)}} />
                            </TouchableOpacity>
                            {
                                ( Platform.OS === 'android' && this.state.searchKeyword !== '' ) && (
                                <TouchableOpacity 
                                    hitSlop={{left:10,right:10,bottom:10,top:10}}
                                    style={{position: 'absolute', right: 60,top:15}} 
                                    onPress={() => this.clearInputText('searchKeyword')}
                                >
                                    <Image source={require('../../../assets/icons/btn_remove.png')} resizeMode={'contain'} style={CommonStyle.defaultIconImage20} />
                                </TouchableOpacity>
                                )
                            }                            
                        </View>
                    </View>
                    { 
                    (this.state.isResult && !CommonUtil.isEmpty(this.state.searchKeyword)) ?
                    <View style={styles.defaultResultWrap}> 
                        <View style={styles.titleWrap}>
                            <CustomTextR style={styles.defaultText}>검색결과 {this.state.resultData.length}건</CustomTextR>
                        </View>
                        <View style={styles.mainWrap}>
                            <View style={styles.defaultResultWrap2}> 
                                <View style={styles.tdTitleWrap}>
                                    <View style={styles.tdTitleFlex22}>
                                        <TouchableOpacity 
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            style={styles.infoWrap} 
                                        >
                                            <Tooltip popover={this.renderTooltip('')} width={SCREEN_WIDTH*0.8} height={100} backgroundColor="#f7f7f7" skipAndroidStatusBar={true}>
                                                <Icon name="infocirlceo" size={13} color="#555" />
                                            </Tooltip>
                                        </TouchableOpacity>
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
                                    <ScrollView
                                        ref={(ref) => {
                                            this.ScrollView = ref;
                                        }}
                                        showsVerticalScrollIndicator={false}
                                        indicatorStyle={'white'}
                                        scrollEventThrottle={16}
                                        keyboardDismissMode={'on-drag'}
                                        //onScroll={e => this.handleOnScroll(e)}
                                        style={{width:'100%',flex:1,backgroundColor:'#fff'}}
                                    >
                                    {
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
                                                    {!CommonUtil.isEmpty(this.props.userToken) &&
                                                    <CustomTextL style={[CommonStyle.textSize12,CommonStyle.fontColorBase]}>
                                                        <TextRobotoM style={[CommonStyle.textSize17,CommonStyle.fontColorBase]}>{CommonFunction.convertMillionComma(item.fast_deal.trade_fast_deal)}</TextRobotoM>억
                                                    </CustomTextL>
                                                    }
                                                </View>
                                                <View style={styles.tdTitleFlex05}>
                                                    {
                                                        !CommonUtil.isEmpty(this.props.userToken) &&
                                                        !CommonUtil.isEmpty(item.fast_deal.homepage) &&
                                                        <TouchableOpacity onPress={()=>this.moveOutlink(item.fast_deal.homepage)}>
                                                            <Image source={BTN_NEXT} style={CommonStyle.defaultImage40} />
                                                        </TouchableOpacity>
                                                    }
                                                </View>
                                            </TouchableOpacity>
                                        )})
                                    }   
                                    </ScrollView>
                                </View>
                            </View>
                        </View>
                    </View>
                    :
                    <View style={styles.defaultResultWrap}> 
                        <View style={styles.mainWrap}>
                            {
                                this.state.myKeywordHistory.length === 0 ?
                                <View style={styles.defaultWrap}>
                                    <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor555]}>최근 검색한 정보가 없습니다.</CustomTextR>
                                </View>
                                :
                                this.state.myKeywordHistory.map((item, index) => {  
                                return (
                                    <TouchableOpacity 
                                        style={styles.boxWrap2} key={index}
                                        onPress={()=>this.reSearchData(item.keyword)}
                                    >
                                        <View style={styles.keywordLeftWrap}>
                                            <CustomTextR style={CommonStyle.dataText}>{item.keyword}</CustomTextR> 
                                        </View>
                                        <TouchableOpacity 
                                            style={styles.keywordRightWrap}
                                            onPress={()=>this.removeKeyword(item)}
                                        >
                                            <Image
                                                source={require('../../../assets/icons/btn_close2.png')}
                                                resizeMode={"contain"}
                                                style={CommonStyle.defaultIconImage30}
                                            />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                )
                                })
                            }  
                        </View>
                    </View>
                    }                   
                    { 
                        this.state.moreLoading &&
                        <View style={CommonStyle.moreWrap}>
                            <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} />
                        </View>
                    }
                    { 
                        this.state.isFocus &&
                        <View style={styles.searchWakuWrap2}>
                            <ScalableImage
                                source={require('../../../assets/images/banner_sample01.png')}
                                width={SCREEN_WIDTH-20}                            
                                indicatorProps={{size: 80,borderWidth: 0,color: DEFAULT_COLOR.base_color,unfilledColor:'#fff'}}
                            /> 
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
    searchWakuWrap :{marginBottom:10,height:50},
    searchWakuWrap2 :{ paddingHorizontal:10,justifyContent:'center',alignItems:'center'},
    headerSortData : {
        borderBottomColor:'#000',borderBottomWidth:1,marginBottom:20,flexDirection:'row',
        marginHorizontal:20,paddingVertical:5
    },
    inputBlank : {
        borderWidth:0,borderColor:DEFAULT_COLOR.input_border_color,borderRadius:5,backgroundColor:'#fff'
    },
 
    defaultResultWrap : {
        flex:1,paddingHorizontal:20
    },
    defaultResultWrap2 : {
        flex:1,paddingHorizontal:0,marginTop:10
    },
    mainWrap : {
        flex:1,
    },
    titleWrap : {        
        marginHorizontal:0,paddingTop:10,paddingBottom:5,borderBottomColor:'#979797',borderBottomWidth:0.3
    },
    boxWrap : {
       flex:1,flexDirection:'row',
       borderTopWidth:1.5,borderTopColor:DEFAULT_COLOR.input_border_color,
       borderBottomWidth:1.5,borderBottomColor:DEFAULT_COLOR.input_border_color,
    },
    boxWrap2 : {
        flexDirection:'row',        
        borderBottomWidth:1,borderBottomColor:DEFAULT_COLOR.input_border_color,
        paddingHorizontal:10,paddingVertical:5
    },
    keywordLeftWrap : {
        flex:5,justifyContent:'center'
    },
    keywordRightWrap : {
        flex:1,alignItems:'flex-end',justifyContent:'center',paddingRight:5
    },
    boxText : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize14),color:'#000'
    },
    boxDataWrap1 : {
        flex:1,flexDirection:'row',flexGrow:1,justifyContent:'center',alignItems:'center',paddingVertical:10
    },
    boxDataWrap2 : {
        flex:1,flexDirection:'row',flexGrow:1,justifyContent:'flex-end',paddingRight:10,alignItems:'center',paddingVertical:10
    },
    boxDataWrap3 : {
        flex:1,justifyContent:'flex-end',paddingRight:30,alignItems:'flex-end',paddingVertical:10
    },
    dataText3 : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize12),color:'#7f7f7f'
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


export default connect(mapStateToProps,mapDispatchToProps)(SearchFormScreen);