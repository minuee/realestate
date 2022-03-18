import {StyleSheet, Dimensions,PixelRatio} from 'react-native';

const {width: SCREEN_WIDTH,height : SCREEN_HEIGHT} = Dimensions.get("window");
//공통상수
import  * as getDEFAULT_CONSTANTS   from '../Constants';
import CommonUtil from '../Utils/CommonUtil';
const DEFAULT_CONSTANTS = getDEFAULT_CONSTANTS.DEFAULT_CONSTANTS;
const DEFAULT_TEXT = getDEFAULT_CONSTANTS.DEFAULT_TEXT;
const DEFAULT_COLOR = getDEFAULT_CONSTANTS.DEFAULT_COLOR;

const CommonStyles = StyleSheet.create({    
    fontColorDefault : { color : '#222'},
    fontColorBase : { color :DEFAULT_COLOR.base_color},
    fontColorWhite : {color : '#fff'},
    fontColorRed : { color : '#ff0000'},
    fontColorBlue : { color : '#1140fc'},
    fontColor000 : { color : '#000000'},
    fontColor222 : { color : '#222222'},
    fontColor555 : { color : '#555555'},
    fontColor777 : { color : '#777777'},
    fontColor999 : { color : '#999999'},
    fontColorccc : { color : '#ccc'},
    
    textSize5 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize5),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize5)*1.5},
    textSize6 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize6),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize6)*1.5},
    textSize7 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize7),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize7)*1.5},
    textSize8 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize8),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize8)*1.5},
    textSize9 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize9),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize9)*1.5},
    textSize10 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize10),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize10)*1.5},
    textSize11 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize11),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize11)*1.5},
    textSize12 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize12),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize12)*1.5},
    textSize13 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize13),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize13)*1.5},
    textSize14 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize14),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize14)*1.5},
    textSize15 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15)*1.5},
    textSize16 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize16),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize16)*1.5},
    textSize17 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize17),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize17)*1.5},
    textSize18 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize18),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize18)*1.5},
    textSize19 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize19),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize19)*1.5},
    textSize20 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize20),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize20)*1.5},
    textSize21 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize21),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize21)*1.5},
    textSize22 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize22),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize22)*1.5},
    textSize23 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize23),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize23)*1.5},
    textSize24 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize24),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize24)*1.5},
    textSize25 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize25),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize25)*1.5},
    textSize26 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize26),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize26)*1.5},
    textSize27 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize27),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize27)*1.5},
    textSize28 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize28),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize28)*1.5},
    textSize29 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize29),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize29)*1.5},
    textSize30 : {fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize30),lineHeight:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize30)*1.5},
    
    fontStrike : {
        textDecorationLine: 'line-through', textDecorationStyle: 'solid'
    },
    //stack form
    backButtonWrap : {
        width:CommonUtil.dpToSize(27),height:CommonUtil.dpToSize(27)
    },
    starButtonWrap : {
        width: PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize20), height: PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize20)
    },
    stackHeaderCenterWrap : {
        flex:1,flexGrow:1,justifyContent:'center',alignItems:'center',
    },
    stackHeaderCenterWrap2 : {
        flex:0.5,flexGrow:1,justifyContent:'center',alignItems:'center',
    },
    stackHeaderLeftWrap2 : {
        flex:2,flexGrow:1,paddingHorizontal:25,backgroundColor:'#ff0000'
    },
    stackHeaderCenterText : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15),color:DEFAULT_COLOR.base_color_000
    },
    stackHeaderCenterTextWhite : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15),color:'#fff'
    },
    ststackHeaderInsideWrapa : {
        flex:1,minWidth:'100%',justifyContent:'center',alignItems:'center'
    },
    stackHeaderLeftWrap : {
        flex:1,flexGrow:1,paddingLeft:25,justifyContent:'center',alignItems:'center'
    },
    stackHeaderRightWrap : {
        flex:1,flexGrow:1,justifyContent:'center',paddingRight:15
    },
    stackHeaderRightWrap2 : {
        flex:1,flexGrow:1
    },
    stackHeaderRightText : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize13),color:'#555'
    },
    stackHeadeSpecialWrap : {
        flex:1,flexDirection:'row',justifyContent:'center',alignItems:'center',paddingRight:20
    },
    stackHeadeSpecialLeft : {
        padding:5
    },
    stackHeadeSpecialRight :{ 
        marginLeft:5,paddingVertical:3,borderBottomColor:DEFAULT_COLOR.base_color,borderBottomWidth:2
    },
    stackHeadeSpecialLeft2 : {        
        marginLeft:5,paddingVertical:3,borderBottomColor:DEFAULT_COLOR.base_color,borderBottomWidth:2
    },
    stackHeadeSpecialRight2 :{ 
        padding:5
    },
    //stack form2 
    subHeaderLeftWrap : {
        flex:1,flexGrow:1,paddingLeft:20,justifyContent:'center',alignItems:'center'
    },
    subHeaderCenterWrap : {
        flex:1,flexGrow:1,justifyContent:'center',alignItems:'center',width:SCREEN_WIDTH*0.6
    },
    subHeaderRightWrap : {
        flex:1,flexGrow:1,justifyContent:'center',alignItems:'center',paddingHorizontal:20,zIndex:100
    },
    subImageWrap : {
        width:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize25),height:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize25)
    },
    //해더 탭스
    headerTapsWrap : {
        marginTop:10,paddingHorizontal:15,flexDirection:'row',width:SCREEN_WIDTH,borderBottomColor:'#ccc',borderBottomWidth:0.5
    },
    headerTabpWidth : {
        flex:1,maxWidth:100,alignItems:'center',paddingVertical:10
    },
    headerTabsBottomLine : {
        position:'absolute',bottom:0,left:0,height:2,width:'100%',backgroundColor:DEFAULT_COLOR.base_color,zIndex:10
    },

    //etc 
    checkboxIcon : {
        width : PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize22),height:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize22)
    },
    fullWidthImage : {
        width:'95%',aspectRatio:1
    },
    fullWidthImage100 : {
        width:'100%',aspectRatio:1
    },
    fullWidthHeightImage : {
        width:'95%',aspectRatio:1,height:'100%'
        
    },
    emptyWrap : {
        flex:1,justifyContent:'center',alignItems:'center',paddingVertical:20,backgroundColor:'#fff',
    },
    //검색폼
    searchFormWrap : {
       backgroundColor:'#f7f7f7',paddingVertical:10,paddingHorizontal:10,flexDirection:'row',height:45
    },
    searchinputContainer : {
        borderWidth:1,
        borderColor:'#fff',
        borderRadius:0,backgroundColor:'#fff',margin:0,padding:0,height:45
    },
    searchinput : {
        margin:0,paddingLeft: 10,color: '#a4a4a4',fontSize: PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize17)
    },
    searchLeftIcon : {
        justifyContent:'center',alignItems:'center'
    },
    searchrightIconContainer : {
        backgroundColor:'#ccc',height:45
    },
    searchrightIconContainerOn : {
        backgroundColor:DEFAULT_COLOR.base_color,height:45
    },
    cartWrap : {
        position:'absolute',right:15,top:5,width:16,height:16,borderRadius:8,backgroundColor:'#555',justifyContent:'center',alignItems:'center',zIndex:2,overflow:'hidden',opacity:0.8
    },
    cartBigWrap : {
        position:'absolute',right:10,top:5,width:26,height:16,borderRadius:8,backgroundColor:'#ccc',justifyContent:'center',alignItems:'center',zIndex:2,overflow:'hidden'
    },
    cartCountText : {
        fontSize:10,color:'#fff'
    },
    //테이블
    blankWrap : {
        flex:1,    
        paddingVertical:50,
        justifyContent:'center',
        alignItems:'center'
    },
    nullDataWrap :{ 
        marginHorizontal:15,paddingVertical:25,borderTopWidth:1,borderTopColor:'#ccc',borderBottomWidth:1,borderBottomColor:'#ccc'
    },
    
    //more button
    moreButtonWrap : {
        flex:1,marginTop:10,justifyContent:'center',alignItems:'center',marginBottom:20
    },
    moreButton : {
        paddingVertical:5,paddingHorizontal:15,justifyContent:'center',alignItems:'center',
        borderWidth:1,borderColor:'#ccc',borderRadius:5,backgroundColor:DEFAULT_COLOR.input_bg_color
    },
 
    moreText : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize13)
    },

    //select form
    selectBoxText  : {
        color:DEFAULT_COLOR.base_color_666,fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize13),lineHeight: DEFAULT_TEXT.fontSize20 * 1,
    },
    unSelectedBox : {
        borderRadius:5,borderWidth:1,borderColor:DEFAULT_COLOR.input_border_color,paddingVertical:5,paddingHorizontal:10,backgroundColor:'#fff'
    },

    selectBackground : {
        backgroundColor:'#f8f8f8'
    },
    defaultBackground : {
        backgroundColor:'#f8f8f8'
    },

    //defautll form
    defaultOneWayForm : {
        height:40 ,width:'100%',paddingLeft: 5,textAlignVertical: 'center',textAlign:'left',fontSize: PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize13)
    },
    defaultOneWayFormAlignRight : {
        height:40,width:'100%',paddingRight: 5,textAlignVertical: 'center',textAlign:'right',fontSize: PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize13)
    },
    inputBlank : {
        borderWidth:1,borderColor:DEFAULT_COLOR.input_border_color,borderRadius:5,backgroundColor:'#fff'
    },
    blankArea : {
        flex:1,height:100,backgroundColor:'#fff'
    },
    moreWrap : {
        //flex:1,paddingVertical:10,alignItems:'center',justifyContent:'center'
        position:'absolute',left:0,top:0,width:SCREEN_WIDTH,height:SCREEN_HEIGHT,
        justifyContent:'flex-start',alignItems:'center',paddingTop:150
    },
    moreFullWrap : {
        flex:1,paddingVertical:10,alignItems:'center',justifyContent:'center',borderWidth:2,borderColor:'#ff0000'
    },
    defaultIconImage : {
        width:PixelRatio.roundToNearestPixel(25),height:PixelRatio.roundToNearestPixel(25)
    },
    defaultIconImage15 : {
        width:PixelRatio.roundToNearestPixel(15),height:PixelRatio.roundToNearestPixel(15)
    },
    defaultIconImage20 : {
        width:PixelRatio.roundToNearestPixel(20),height:PixelRatio.roundToNearestPixel(20)
    },
    defaultIconImage30 : {
        width:PixelRatio.roundToNearestPixel(30),height:PixelRatio.roundToNearestPixel(30)
    },
    defaultImage40 : {
        width:PixelRatio.roundToNearestPixel(40),height:PixelRatio.roundToNearestPixel(40)
    },
    defaultIconImage40 : {
        width:PixelRatio.roundToNearestPixel(40),height:PixelRatio.roundToNearestPixel(40)
    },
    defaultIconImage55 : {
        width:PixelRatio.roundToNearestPixel(55),height:PixelRatio.roundToNearestPixel(55)
    },
    defaultIconImage60 : {
        width:PixelRatio.roundToNearestPixel(60),height:PixelRatio.roundToNearestPixel(60)
    },
    defaultIconImage70 : {
        width:PixelRatio.roundToNearestPixel(70),height:PixelRatio.roundToNearestPixel(70)
    },
    defaultImage97 : {
        width:PixelRatio.roundToNearestPixel(97),height:PixelRatio.roundToNearestPixel(97)
    },
    defaultNoImage : {
        width:PixelRatio.roundToNearestPixel(55),height:PixelRatio.roundToNearestPixel(55)
    },
    scaleImage45 : {
        width:CommonUtil.dpToSize(45),height:CommonUtil.dpToSize(45)
    },
    
    termLineWrap : {
        flex:1,
        paddingVertical:5,
        backgroundColor:'#f5f6f8'
    },
    termLineWrap80 : {
        flex:1,
        paddingVertical:40,
        backgroundColor:'#f5f6f8'
    },
    //screen footer common 
    scrollFooterWrap : {
        position:'absolute',right:0,bottom:0,width:SCREEN_WIDTH,height:DEFAULT_CONSTANTS.BottomHeight,justifyContent:'center',alignItems:'center',flexDirection:'row'
    },
    scrollFooterLeftWrap : {
        flex:1,height:DEFAULT_CONSTANTS.BottomHeight,backgroundColor:DEFAULT_COLOR.base_color,justifyContent:'center',alignItems:'center'
    },
    scrollFooterRightWrap : {
        flex:1,height:DEFAULT_CONSTANTS.BottomHeight,backgroundColor:'#ccc',justifyContent:'center',alignItems:'center'
    },
    scrollFooterText : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15),color:'#fff'
    },
    scrollFooterText20 : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize20),color:'#fff'
    },
    bottomButtonWrap : {
        position:'absolute',right:0,bottom:0,width:SCREEN_WIDTH,height:DEFAULT_CONSTANTS.BottomHeight,backgroundColor:DEFAULT_COLOR.base_color,justifyContent:'center',alignItems:'center',flexDirection:'row',borderTopWidth:1, borderTopColor:DEFAULT_COLOR.base_color
    },
    bottomLeftBox : {
        flex:1,backgroundColor:DEFAULT_COLOR.base_color,justifyContent:'center',alignItems:'center'
    },
    bottomRightBox : {
        flex:1,backgroundColor:'#fff',justifyContent:'center',alignItems:'center',height:'100%'
    },
    bottomMenuOnText : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15),color:DEFAULT_COLOR.base_color
    },
    baseColorText : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15),color:DEFAULT_COLOR.base_color
    },
    bottomMenuOffText : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15),color:'#fff'
    },
})

export default CommonStyles;