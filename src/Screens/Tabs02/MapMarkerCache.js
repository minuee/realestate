import React, { Component,useCallback, useState } from 'react';
import {TouchableOpacity, View,StyleSheet,Image,Dimensions,PixelRatio,Text,ImageBackground,ActivityIndicator,Animated,Alert} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import {useSelector,useDispatch} from 'react-redux';
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
import FastImage from 'react-native-fast-image';

const areamarker = require('../../../assets/icons/marker_default2.png');
const housemarker = require('../../../assets/icons/marker_apart.png');
const agentMaker = require('../../../assets/icons/marker_agent.png');
const markerBackRed2 = require('../../../assets/icons/marker_back_red2.png');
const markerBackBlue2 = require('../../../assets/icons/marker_back_blue2.png');

const MapMarker = ( props)=>{
    //console.log('CommonPaging',props);

    const reduxData = useSelector(state => state);
    const {mainMapViewTarget,userToken,mapCondition} = reduxData.GlabalStatus;
    
    let nowRealEstedGubun = 'C';
    if ( !CommonUtil.isEmpty(userToken)) {
        if ( !CommonUtil.isEmpty(mapCondition.condition.realEstedGubun)) {
            nowRealEstedGubun = mapCondition.condition.realEstedGubun;
        }
        ///급매매 : A ,  급전세 : B, 매매 : C,  전세 : D
    }
    if ( props.gubun === 'article') {        
        if ( props.sub_gubun === 'agent') {
            if ( mainMapViewTarget.agent ) {
            //console.log('agentagentagentagentagent',props)
                return <>
                <View style={{margin:0,padding:0}}>
                    <ImageBackground
                        //source={agentMaker}                        
                        //resizeMode='cover'
                        //style={styles.markerAgentWrap}
                        source={{uri:DEFAULT_CONSTANTS.imageBaseUrl + 'icon/marker_agent.png'}}                    
                        resizeMode={FastImage.resizeMode.cover}
                        style={styles.markerAgentWrap }
                    >
                    <View style={{justifyContent:'center',alignItems:'center',paddingTop:props.company_name.length > 5 ? 5 : 10}}>
                        <CustomTextB style={[CommonStyle.textSize12,CommonStyle.fontColorWhite,{lineHeight:15}]}>
                            {props.company_name}
                        </CustomTextB>
                    </View>
                    </ImageBackground>
                </View>
                </>
            }else{
                return null
            }
        }else{
            if ( mainMapViewTarget.maemul ) {
            return <>
                <View style={{flex:1}}>
                    {
                    ( !CommonUtil.isEmpty(props.fast_deal) && !CommonUtil.isEmpty(userToken) ) &&
                    props.fast_deal.fast_deal_pk !== '0'  &&
                    <View style={styles.houseBackBlackWrap}>
                        <View style={styles.mapArticleWrap}>
                            <View style={styles.mapArticleTitleWrap}>
                                <CustomTextM style={[CommonStyle.textSize12,CommonStyle.fontColorWhite]}>
                                    { nowRealEstedGubun === 'B' ? '전세' : '급매'}
                                </CustomTextM>
                            </View>
                            <View style={styles.mapArticleDataWrap}>
                                <TextRobotoM style={[CommonStyle.textSize12,CommonStyle.fontColorWhite]}>
                                    {CommonFunction.convertMillionComma(props.fast_deal.trade_fast_deal)}<CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColorWhite]}>억</CustomTextR>
                                </TextRobotoM>
                            </View>
                        </View>
                    </View>
                    }   
                    <ImageBackground
                        //source={housemarker}
                        source={{uri:DEFAULT_CONSTANTS.imageBaseUrl + 'icon/marker_apart.png'}}
                        //resizeMode='cover'
                        resizeMode={FastImage.resizeMode.cover}
                        style={styles.houseDefaultWrap }
                        onLoad={props.stopTrackingViewChanges}
                        fadeDuration={0}
                    >
                        <View 
                            //onPress={()=>props.onPressAction(props)}
                            style={styles.mapArticleMarkerWrap}
                        >
                            <View style={styles.mapArticleMarkerTitleWrap}>
                                <TextRobotoM style={[CommonStyle.textSize12,CommonStyle.fontColor000]}>
                                    {props.trade_avg_title}<CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor000]}>억</CustomTextR>
                                </TextRobotoM>
                            </View>
                            <View style={styles.mapArticleMarkerDataWrap}>
                                <TextRobotoM style={[CommonStyle.textSize12,CommonStyle.fontColorWhite]}>
                                {props.rent_avg_price > 0 ? props.rent_avg_title+'억' : '-'}
                                </TextRobotoM>
                            </View>
                        </View>
                    </ImageBackground>
                </View>
            </>
            }else{
                return null
            }
        }
        
    
    }else {    
        if ( mainMapViewTarget.maemul ) {    
        return <>
            <View style={{flex:1}}>
                <FastImage
                    //source={props.price_rate2 > 100 ? markerBackRed2 : markerBackBlue2}
                    source={props.price_rate2 > 100 ? {uri:DEFAULT_CONSTANTS.imageBaseUrl + 'icon/marker_back_red2.png'} : {uri:DEFAULT_CONSTANTS.imageBaseUrl + 'icon/marker_back_blue2.png'} }
                    //style={styles.markerBackRedWrap }
                    resizeMode={FastImage.resizeMode.cover}
                    style={styles.markerBackRedImageStyle}
                    //style={styles.markerBackRedWrap }
                    
                >
                    <View style={styles.mapTextWrap}>
                        {
                        props.price_rate2 > 100 
                        ?
                        <TextRobotoM style={[CommonStyle.textSize14,CommonStyle.fontColorRed]}>{'+' + (props.price_rate2-100).toFixed(2)}</TextRobotoM>
                        :
                        props.price_rate2 < 100 
                        ?
                        <TextRobotoM style={[CommonStyle.textSize14,CommonStyle.fontColorBlue]}>{parseFloat(props.price_rate2-100).toFixed(2)}</TextRobotoM>
                        :
                        <TextRobotoM style={[CommonStyle.textSize15,CommonStyle.fontColor000]}>{"-"}</TextRobotoM>
                        }
                    </View>
                </FastImage>
                <FastImage
                    //source={areamarker}
                    source={{uri:DEFAULT_CONSTANTS.imageBaseUrl + 'icon/marker_default2.png'}}
                    //resizeMode='contain'
                    resizeMode={FastImage.resizeMode.contain}
                    style={styles.markerDefaultWrap }
                    onLoad={props.stopTrackingViewChanges}
                    fadeDuration={0}
                >
                    <View style={styles.cityNameWrap}>
                        <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColorWhite]}>
                            {props.name}
                        </CustomTextR>
                        <TextRobotoM style={[CommonStyle.textSize12,CommonStyle.fontColorWhite]}>
                            {props.trade_avg_title}<CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColorWhite]}>억</CustomTextR>
                        </TextRobotoM>
                    </View>
                </FastImage>
            </View>
        </>
        }else{
            return null
        }
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    IndicatorContainer : {
        flex: 1,
        width:'100%',
        backgroundColor : "#fff",
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    /* slider */
    sliderRoot :{    
        alignItems: 'stretch',padding: 5,flex: 1,
    },
    slider : {},
    fixedHeaderWrap : {
        position:'absolute',top:0,left:0,width:SCREEN_WIDTH,
        height:DEFAULT_CONSTANTS.BottomHeight+30,
        //borderBottomColor:'#ccc', borderBottomWidth:1,
        paddingTop:DEFAULT_CONSTANTS.BottomHeight-10,
        justifyContent:'flex-end',paddingHorizontal:20,
        backgroundColor:'transparent',zIndex:99
    },
    horizontalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal:20
    },
    
    valueText: {width: 50,color: '#000',fontSize: 20,},
    /* slider */
    fixedHeader : {
        flex:1,flexDirection:'row'
    },
    fixedHeaderLeft : {
        flex:1,justifyContent:'center',zIndex:5
    },
    fixedHeaderCenter : {
        flex:2,alignItems:'center',justifyContent:'flex-end',paddingBottom:10
    },
    fixedHeaderRight : {
        flex:1,justifyContent:'center',alignItems:'flex-end',flex:1,justifyContent:'center',zIndex:5
    },
    showButtonWrap : {
        position:'absolute',left:10,bottom:10, height:CommonUtil.dpToSize(45*3), width:80,backgroundColor:'transparent',zIndex:99
    },
    showButton : {
        flex:1,justifyContent:'center',paddingBottom:10
    },
    showButtonWrap2 : {
        position:'absolute',right:20,bottom:10, height:45, width:45,backgroundColor:'transparent',zIndex:99
    },
    tooltipWrap : {
        justifyContent:'center',alignItems:'center',position:'absolute',right:0,top :0, bottom:0,width:20
    },
    markerDefaultWrap : {
        height:50,width:100,aspectRatio:2,alignItems:'center',justifyContent:'center'
    },
    houseDefaultWrap : {
        height:47*1.4,width:86*1.4,alignItems:'center',justifyContent:'center'
    },
    houseBackImageStyle : {
        resizeMode: 'cover',position: 'absolute',top: -20,bottom: '50%',
    },
    houseBackBlackWrap : {
        height:50,width:86*1.13,left:8,top:30,backgroundColor:'#000',borderTopLeftRadius:15,borderTopRightRadius:15
    },
    markerAgentWrap : {
        height:CommonUtil.dpToSize(81) ,width:CommonUtil.dpToSize(72),alignItems:'center',justifyContent:'flex-start',paddingTop:15,paddingHorizontal:10
    },
    markerBackRedWrap : {
        ...Platform.select({
            ios: {                
            },
            android: {  
                flex: 1,position: 'relative', height:70,width:100,aspectRatio:2,bottom:-40,
           }
        })
       
    },
    markerBackRedImageStyle : {
        position: 'absolute',
        ...Platform.select({
            ios: {
                top: -30,
                bottom:0
            },
            android: {  flex: 1,position: 'relative', height:70,width:100,aspectRatio:1.43,bottom:-40,
           }
        })
        
    },
    zoomIn : {
        position:'absolute',top:(SCREEN_HEIGHT/2)-20,right:10,width:30,backgroundColor:'#ff0000'
    },
    zoomOut : {
        position:'absolute',top:(SCREEN_HEIGHT/2)+20,right:10,width:30,backgroundColor:'#ff0000'
    },
    mapTextWrap : {
        flex: 1,width:100,justifyContent:'flex-start',alignItems:'center',paddingTop:8
    },
    cityNameWrap  : {
        flex: 1,justifyContent:'flex-start',alignItems:'center',paddingTop:3
    },
    mapArticleWrap : {
        flex: 1,width:100,justifyContent:'center',alignItems:'flex-start',flexDirection:'row',paddingTop:2
    },
    mapArticleTitleWrap :{
        flex: 1,justifyContent:'center',alignItems:'center',paddingTop:Platform.OS === 'ios' ? 0 : 2
    },
    mapArticleDataWrap : {
        flex: 1,justifyContent:'center',alignItems:'flex-end',paddingRight:10,paddingTop:Platform.OS === 'ios' ? 0 : 4
    },
    mapArticleMarkerWrap : {
        flex: 1,justifyContent:'center',alignItems:'flex-start',flexDirection:'row',paddingTop:15
    },
    mapArticleMarkerTitleWrap : {
        flex: 1,justifyContent:'center',alignItems:'center',paddingLeft:5
    },
    mapArticleMarkerDataWrap : {
        flex: 1,justifyContent:'center',alignItems:'center',paddingRight:10
    },
    fixedTodayLinkWrap : {
        position:'absolute',top:DEFAULT_CONSTANTS.BottomHeight+30,left:0,width:SCREEN_WIDTH,
        height:40,justifyContent:'center',alignItems:'center',backgroundColor:'transparent',zIndex:9,
        ...Platform.select({
            ios: {
              shadowColor: "#ccc",
              shadowOpacity: 0.5,
              shadowRadius: 2,
              shadowOffset: {
                height: 0,
                width: 0.1
             }
           },
            android: {
              //elevation: 1
           }
         })
    },
    fixedTodayLink : {
        width:SCREEN_WIDTH*0.5,justifyContent:'center',alignItems:'center',backgroundColor:'#fff',borderRadius:18,flexDirection:'row',paddingVertical:Platform.OS === 'ios' ? 10 : 5
    },
    map: {
        width: null,
        height: '100%',
        width : '100%',
        flex: 1,        
    },
});

export default MapMarker;