import React, { Component } from 'react';
import {SafeAreaView,ScrollView,View,StyleSheet,Text,Dimensions,PixelRatio,Image,TextInput, TouchableOpacity,ImageBackground
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
//공통상수
import  * as getDEFAULT_CONSTANTS   from '../../Constants';
import CommonStyle from '../../Style/CommonStyle';
const DEFAULT_CONSTANTS = getDEFAULT_CONSTANTS.DEFAULT_CONSTANTS;
const DEFAULT_TEXT = getDEFAULT_CONSTANTS.DEFAULT_TEXT;
const DEFAULT_COLOR = getDEFAULT_CONSTANTS.DEFAULT_COLOR;
const {height: SCREEN_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('window');
import {CustomTextR,CustomTextL, CustomTextB, CustomTextM, TextRobotoM,TextRobotoR} from '../../Components/CustomText';
import Loader from '../../Utils/Loader';
import CommonUtil from '../../Utils/CommonUtil';
import CommonFunction from '../../Utils/CommonFunction';

const BUTTON_CLOSE = require('../../../assets/icons/btn_close.png');
const TITLE_AGENT = require('../../../assets/icons/title_agent.png');
const ICOM_SEARCH_MAP = require('../../../assets/icons/icon_search_map.png');
const ICOM_SEARCH_LIST = require('../../../assets/icons/icon_search_list.png');
const BackgroundImageOn = require('../../../assets/icons/back_join_agent.png');
const ICON_CHECK = require('../../../assets/icons/icon_shape.png');


export default class PopLayerAgent extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    
    render() {
        return(
            <View style={ styles.container }>
                <View style={{flex:1}}>
                    <TouchableOpacity 
                        onPress={()=> this.props.screenState.closePopView()}
                        style={{position:'absolute',right:0,top:0,width:40,height:40,zIndex:5}}
                    >
                        <Image source={BUTTON_CLOSE} style={CommonStyle.defaultIconImage40} />
                    </TouchableOpacity>
                    <View style={{flex:1,paddingBottom:10,justifyContent:'flex-end',alignItems:'center'}}>
                        <Image source={TITLE_AGENT} style={{width:129*1.5,height:18*1.5}} />
                    </View>
                </View>   
                <View style={styles.dataCoverWarp}>
                    <View style={styles.dataTextWarp}>
                        <Image source={ICON_CHECK} style={CommonStyle.defaultIconImage15} />
                        <CustomTextB style={[CommonStyle.textSize13,CommonStyle.fontColor000]}>{"  "}부동산중개 수수료 협의가능 업체</CustomTextB>
                    </View>
                    <View style={styles.dataTextWarp}>
                        <Image source={ICON_CHECK} style={CommonStyle.defaultIconImage15} />
                        <CustomTextB style={[CommonStyle.textSize13,CommonStyle.fontColor000]}>{"  "}방문전 톡으로 간단히 협의가능</CustomTextB>
                    </View>
                    <View style={styles.dataTextWarp2}>
                        <TouchableOpacity style={styles.dataTextLeftWarp} onPress={()=> this.props.screenState.moveAgentList()}>
                            <Image source={ICOM_SEARCH_LIST} style={{width:CommonUtil.dpToSize(55),height:CommonUtil.dpToSize(53)}} />
                            <View style={{paddingTop:10,justifyContent:'center',alignItems:'center'}}>
                                <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor000]}>목록으로 찾기</CustomTextR>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.dataTextRightWarp} 
                            onPress={()=> this.props.screenState.closePopLayer()}
                            //onPress={()=>CommonFunction.fn_call_toast('준비중입니다.',2000)}
                        >
                            <Image source={ICOM_SEARCH_MAP} style={{width:CommonUtil.dpToSize(55),height:CommonUtil.dpToSize(53)}} />
                            <View style={{paddingTop:10,justifyContent:'center',alignItems:'center'}}>
                                <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor000]}>지도로 찾기</CustomTextR>
                            </View>
                            
                        </TouchableOpacity>
                        
                    </View>
                </View>
                <TouchableOpacity
                    hitSlop={{left:10,right:5,top:10,bottom:10}}                       
                    style={styles.bottomWrap}
                    onPress={()=> this.props.screenState.closePopLayer('join')}
                >
                    <ImageBackground
                        source={BackgroundImageOn}
                        resizeMode={'contain'}
                        style={styles.markerBackRedWrap }
                    >
                        <View style={styles.textWrap}>
                            <CustomTextB style={[CommonStyle.textSize14,CommonStyle.fontColorWhite]}>착한중개인 가입하기</CustomTextB>
                        </View>
                    </ImageBackground>
                </TouchableOpacity>
            </View>
        );
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,        
        borderRadius:CommonUtil.dpToSize(12),
        overflow:'hidden'
    },
   
   
    IndicatorContainer : {
        flex: 1,
        width:'100%',
        //backgroundColor : "#fff",
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputBlankNull : {
        borderWidth:1,borderColor:'#fff'
    },
    inputBlank : {
        borderWidth:1,borderColor:DEFAULT_COLOR.input_border_color,borderRadius:5
    },
    boxWrap2 : {
        paddingHorizontal:15
    },
    dataCoverWarp : {
        flex:2,justifyContent:'center',alignItems:'center',marginVertical:20
    },
    dataTextWarp : {
        height:30,flexDirection:'row',alignItems:'center'
    },
    dataTextWarp2 : {
        flex:3,flexDirection:'row',alignItems:'center',marginTop:40
    },
    dataTextLeftWarp : {
        flex:1,justifyContent:'center',alignItems:'center',borderRightWidth:1,borderRightColor:'#ccc',paddingVertical:10,zIndex:5
    },
    dataTextRightWarp : {
        flex:1,justifyContent:'center',alignItems:'center',paddingVertical:10,zIndex:5
    },
    selectedWrap2 : {
        paddingHorizontal:15,backgroundColor:'#000',opacity:0.4,flexDirection:'row'
    },
    menuOnBox : {
        flex:1,backgroundColor:DEFAULT_COLOR.base_color,justifyContent:'center',alignItems:'center'
    },
    menuOffBox : {
        flex:1,backgroundColor:'#fff',justifyContent:'center',alignItems:'center',height:'100%'
    },
    menuOnText : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15),color:'#fff'
    },  
    menuOffText : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15),color:DEFAULT_COLOR.base_color
    },
    bottomWrap : {
        flex:1,paddingVertical:5,justifyContent:'center',alignItems:'center'
    },
    markerBackRedWrap : {
        width:CommonUtil.dpToSize(210),height:CommonUtil.dpToSize(50)
    },
    textWrap : {
        flex:1,justifyContent:'center',alignItems:'center',paddingBottom:5
    }
});