import React, { Component,useEffect } from 'react';
import {StatusBar,SafeAreaView,ScrollView,PermissionsAndroid, Platform, TouchableOpacity, View,StyleSheet,Image,Dimensions,PixelRatio,Text,BackHandler} from 'react-native';
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
import Loader from '../../Utils/Loader';

import { apiObject } from "../../Apis/Api";
const DefaultPaginate = 10;

class NoticeScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading : false,
            moreLoading : false,
            totalCount : 0,            
            ismore :  false,
            currentPage : 1,
            isback : false,
            resultData : []
        }
    }

    moreDataUpdate = async( baseData , addData) => {   
        let newArray = await baseData.concat(addData.data.notiList);
        this.setState({            
            moreLoading : false,
            loading : false,
            resultData : newArray,
            ismore : parseInt(addData.lastPage) > 1 ? true : false
        })
    }

    getInformation = async ( currentpage,morePage = false) => {
        this.setState({moreLoading : true})
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_getMyNofitication({
                locale: "ko",
                page : currentpage,
                paginate  : DefaultPaginate 
            }); 
            //console.log('returnCode',returnCode);
            if ( returnCode.code === '0000') {
                this.setState({currentPage : returnCode.currentPage})
                if ( morePage ) {
                    this.moreDataUpdate(this.state.resultData,returnCode )
                }else{
                    this.setState({
                        totalCount : returnCode.total,                        
                        resultData : CommonUtil.isEmpty(returnCode.data.notiList) ? [] : returnCode.data.notiList,
                        ismore : parseInt(returnCode.lastPage) > 1 ? true : false,
                        moreLoading:false,loading:false
                    })
                }
            }
            
        }catch(e){
            //console.log('returnCode error1',e);
            this.setState({loading:false,moreLoading:false})
        }
    }

    async UNSAFE_componentWillMount() {
        await this.getInformation(1,false);
        this.props.navigation.addListener('focus', () => {               
            if ( this.state.isback === false) {                
                this.setState({isback:false});
                this.getInformation(this.state.currentPage,false);
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

    shouldComponentUpdate(nextProps, nextState) {
        const vitalStateChange = nextState.loading !== this.state.loading;
        const vitalStateChange2 = nextState.moreLoading !== this.state.moreLoading;
         return vitalStateChange || vitalStateChange2;
    }
    updateRead = async(item) => {
        //console.log('updateReaditem',item);
        if ( !CommonUtil.isEmpty(item.nofi_check_pk) && item.is_check === false ) {
            let returnCode = {code:9998};        
            try {
                returnCode = await apiObject.API_updateNotiReadCheck({
                    locale: "ko",nofi_check_pk : item.nofi_check_pk
                });                 
            }catch(e){
                
            }
        }else{
            //console.log('item.is_check',item.is_check);
        }
    }
    moveNavigation = (item) => {
        //console.log('item',item);
        
        this.updateRead(item);        
        if ( !CommonUtil.isEmpty(item.complex_no)) {
            this.setState({isback:true})
            this.props.navigation.navigate('ApartDetailStack',{
                screenData : {
                    apart_code : item.complex_no,
                    articlename : item.complex_name
                }
            })
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
                        <View style={ styles.contentDataCoverWrap }>
                            {
                            this.state.resultData.length === 0 ?
                            <View style={styles.dataRowWrap}>
                                <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                    수신된 알림이 없습니다.
                                </CustomTextR>
                            </View>
                            :
                            this.state.resultData.map((item,index) => (
                                <TouchableOpacity 
                                    key={index}
                                    onPress={()=>this.moveNavigation(item)} 
                                    style={styles.contentDataWrap}
                                >
                                    <View style={styles.dataRowWrap}>
                                        <View style={styles.rowRightWrap} >
                                            <CustomTextR style={[CommonStyle.textSize13,item.is_check ?CommonStyle.fontColorccc : CommonStyle.fontColor000]} numberOfLines={2} ellipsizeMode={'tail'}>
                                                {item.title}
                                            </CustomTextR>
                                            <View style={styles.rowDescripWrap}>
                                                <View style={styles.rowDescripLeftWrap}>
                                                    <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]}>
                                                        {CommonFunction.convertUnixToDateToday(item.reg_date)}
                                                    </CustomTextR>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                            ))}
                        </View>
                        {this.state.ismore &&
                        <View style={CommonStyle.moreButtonWrap}>
                            <TouchableOpacity 
                                onPress={() => this.getInformation(parseInt(this.state.currentPage)+1,true)}
                                style={CommonStyle.moreButton}
                            >
                            <CustomTextL style={CommonStyle.moreText}>더보기</CustomTextL>
                            </TouchableOpacity>
                        </View>
                        }
                        <View style={CommonStyle.blankArea}></View>
                        { this.state.moreLoading &&
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
    headerSortWrap : {
        flex:1,height :40,borderBottomColor:'#000',borderBottomWidth:1,marginBottom:20,flexDirection:'row'
    },
    headerSortData : {
        flexDirection:'row',alignItems:'center',paddingRight:10
    },
    contentDataCoverWrap : {
        flex:1,paddingHorizontal:20
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
        flex:3,flexDirection:'row',alignItems:'center'
    },
    rowDescripRightWrap : {
        flex:1,flexDirection:'row',alignItems:'center',justifyContent:'flex-end'
    },
    dotWrap :{ 
        width:5,height:5,paddingHorizontal:5
    },
    markWrap : {
        width:10,height:10,paddingRight:15
    }
   
});


function mapStateToProps(state) {
    return {
        userToken : state.GlabalStatus.userToken
    };
}

export default connect(mapStateToProps,null)(NoticeScreen);
