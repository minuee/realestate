import React, { Component,useCallback, useState } from 'react';
import {TouchableOpacity, View,StyleSheet,Image,Dimensions,PixelRatio,Text,ImageBackground,ActivityIndicator,Animated,Alert} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import {useSelector,useDispatch} from 'react-redux';
import {Circle, Marker, Path, Polyline, Polygon,Align,MapType} from "react-native-nmap";
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
import { Platform } from 'react-native';

const areaMinusMaker = require('../../../assets/icons/naver_marker_minus.png');
const areaPlusMaker = require('../../../assets/icons/naver_marker_plus.png');
const areaDefaultMaker = require('../../../assets/icons/naver_marker_zero.png');

const iosCaption = {
    textSize: 13,
    color: '#ffffff',
    haloColor : '#000000',
    align:Align.Center
}
const androidCaption = {
    textSize: 14,
    haloColor: '#555555',
    color : '#ffffff',
    offset:0,
    align:Align.Center
}
const strCaption = Platform.OS === 'ios' ? iosCaption : androidCaption;   


const NaverMapMarker = ( props )=>{
    console.log('NaverMapMarker',props)
    return (
        <View style={{flex:1}}></View>
    )
    /*
    if ( props.price_rate2 == 100  ) {
        return 
            <>
            <Marker 
                coordinate={{latitude: props.apart_lat, longitude: props.apart_lon}}
                image={areaDefaultMaker}
                height={CommonUtil.dpToSize(95)}
                width={CommonUtil.dpToSize(100)}
                caption={{
                    ...strCaption,                    
                    text:'-\n\n'+props.name+"\n"+props.trade_avg_title+'억\n\n'
                }}
            />
            </>
    }else if (props.price_rate2 > 100 ) {
        return
            <>
            <Marker 
                key={index}                             
                coordinate={{latitude: props.apart_lat, longitude: props.apart_lon}}
                image={areaPlusMaker}
                height={CommonUtil.dpToSize(95)}
                width={CommonUtil.dpToSize(100)}
                //isHideCollidedCaptions={true}
                caption={{
                    ...strCaption,
                    //text:'plus'
                    text:'+\n\n'+props.name+"\n"+props.trade_avg_title+'억\n\n'
                }}                            
                //subCaption={{text:marker.price_rate2,textSize:15}}
            />
            </>
    }else{
        return 
            <>
            <Marker 
                key={index}                             
                coordinate={{latitude: props.apart_lat, longitude: props.apart_lon}}
                image={areaMinusMaker}
                height={CommonUtil.dpToSize(95)}
                width={CommonUtil.dpToSize(100)}
                //isHideCollidedCaptions={true}
                caption={{
                    ...strCaption,
                    //text:'plus'
                    text:'-\n\n'+props.name+"\n"+props.trade_avg_title+'억\n\n'
                }}                            
                //subCaption={{text:marker.price_rate2,textSize:15}}
            />
        </>
    }
    */
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
    agentNameWrap : {
        margin:0,padding:0,justifyContent:'flex-start',alignItems:'center',
        ...Platform.select({
            ios: {
                marginTop:CommonUtil.dpToSize(20)
            },
            android: {                
                marginTop:CommonUtil.dpToSize(20)
           }
        })
        
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
        height:50,width:86*1.14,left:8,top:30,backgroundColor:'#000',borderTopLeftRadius:15,borderTopRightRadius:15
    },
    markerAgentWrap : {
        height:CommonUtil.dpToSize(81) ,width:CommonUtil.dpToSize(72),alignItems:'center',justifyContent:'flex-start',paddingHorizontal:10
    },
    markerBackRedWrap : {
        flex: 1,position: 'relative', height:70,width:100,aspectRatio:2,bottom:-40,
    },
    markerBackRedImageStyle : {
        resizeMode: 'cover',position: 'absolute',top: 0,bottom: '50%',
    },
    zoomIn : {
        position:'absolute',top:(SCREEN_HEIGHT/2)-20,right:10,width:30,backgroundColor:'#ff0000'
    },
    zoomOut : {
        position:'absolute',top:(SCREEN_HEIGHT/2)+20,right:10,width:30,backgroundColor:'#ff0000'
    },
    mapTextWrap : {
        flex: 1,width:100,justifyContent:'flex-start',alignItems:'center',paddingTop:5
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

export default NaverMapMarker;