import React, { Component } from 'react';
import {Alert,View,TouchableOpacity,StyleSheet,Dimensions,Animated,Image,PixelRatio,Linking} from "react-native";
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-community/async-storage';
import 'moment/locale/ko'
import  moment  from  "moment";
import {CheckBox} from 'react-native-elements';
//공통상수 필요에 의해서 사용
import  * as getDEFAULT_CONSTANTS   from '../Constants';
import CommonStyle from '../Style/CommonStyle';
const DEFAULT_CONSTANTS = getDEFAULT_CONSTANTS.DEFAULT_CONSTANTS;
const DEFAULT_TEXT = getDEFAULT_CONSTANTS.DEFAULT_TEXT;
const DEFAULT_COLOR = getDEFAULT_CONSTANTS.DEFAULT_COLOR;
const {height: SCREEN_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('window');
import {CustomTextR,CustomTextL, CustomTextB, CustomTextM, TextRobotoB,TextRobotoM,TextRobotoR} from '../Components/CustomText';
import CommonFunction from '../Utils/CommonFunction';
import CommonUtil from '../Utils/CommonUtil';
import Loader from '../Utils/Loader';
import { ScrollView } from 'react-native';
const HEADER_CLOSE_IMAGE = require('../../assets/icons/btn_close.png');
const CHECKNOX_OFF = require('../../assets/icons/circle_check_off.png');
const CHECKNOX_ON = require('../../assets/icons/circle_check_on.png');
const Tomorrow = moment(Tomorrow).add(1, 'day').format('YYYY-MM-DD');

export default class PopupScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : true,
            isVisible : true,
            autoplay : false,
            isLoop : true,
            showPopupLayer : false,
            popLayerList : []
        }
    }

    UNSAFE_componentWillMount() {        
      console.log('SCREEN_HEIGHT',SCREEN_HEIGHT)
    }

    componentDidMount() {
        setTimeout(
            () => {            
                this.setState({loading:false})
            },500
        )
    }
    UNSAFE_componentWillUnmount(){
    }

    closePopUp = () => {
        this.setState({isVisible : false})
        this.props.screenState.closePopUp();
    }
    checkItem = async(bool) => {      
      if ( bool ) {
          const ExpireDate = Date.parse(new Date(Tomorrow + 'T00:10:00'));
          const ExpireDate2 = ExpireDate/1000;
          console.log("ExpireDate",ExpireDate2)
          try {
              await AsyncStorage.setItem('isNoticePop1', ExpireDate2.toString());
          } catch (e) {
              console.log(e);
          }
      }else{
          await AsyncStorage.removeItem('isNoticePop1');
      }
      this.setState({showPopupLayer:bool})
  }
  
  
  animatedHeight = new Animated.Value(SCREEN_HEIGHT < 600 ? SCREEN_HEIGHT*0.8 : SCREEN_HEIGHT*0.7 );
  render() {
      if ( this.state.loading ) {
          return (
              <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} /> 
          )
      }else {  
        return (
            <Modal 
                onBackdropPress={()=>this.closePopUp()}
                animationType="slide"
                transparent={true}
                onRequestClose={() => this.closePopUp()}
                style={{justifyContent: 'flex-end',margin: 0}}
                useNativeDriver={true}
                animationInTiming={300}
                animationOutTiming={300}
                hideModalContentWhileAnimating                    
                isVisible={this.state.isVisible}
            >
                <View style={styles.modalBackground}>
                    <Animated.View style={[styles.modalContainer,{ height: this.animatedHeight }]}>                        
                        <TouchableOpacity 
                              hitSlop={{left:10,right:10,bottom:10,top:10}}
                              style={styles.modalTop}
                              onPress={()=>this.closePopUp()}
                          > 
                          <Image source={HEADER_CLOSE_IMAGE} style={CommonStyle.defaultIconImage30} />
                        </TouchableOpacity>
                        <View style={{flex:1,overflow:'hidden'}}>
                          <ScrollView>
                            <View style={{paddingTop:30,alignItems:'center'}}>
                              <Image 
                                source={require('../../assets/icons/title_notice.png')} 
                                style={{width:CommonUtil.dpToSize(94.5*1.1),height:CommonUtil.dpToSize(23.5*1.1)}} />
                            </View>
                            <View style={{paddingTop:20,paddingHorizontal:20}}>
                              <CustomTextM style={{color:'#000000'}}>
                                많은 분들이 불편해하셨던 지도를 업데이트 하는 작업을 하고 있습니다.
                              </CustomTextM>
                            </View>
                            <View style={styles.lineHang}>
                              <CustomTextM style={{color:'#000000'}}>                                
                                이 과정에서 <CustomTextR style={{color:'#ff0000'}}>(오늘의 급매물)</CustomTextR>서비스를{"\n"} 
                                <CustomTextR style={{color:'#ff0000'}}>잠시 중단</CustomTextR>하오니 이용에 참고바랍니다.
                              </CustomTextM>
                            </View>
                            <View style={styles.lineHang}>
                              <CustomTextB style={{color:'#000000',fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize14)}}>소요기간 : <CustomTextB style={{color:'#ff0000'}}>약 2주 </CustomTextB></CustomTextB>
                            </View>
                            <View style={styles.lineHang}>
                              <CustomTextM style={{color:'#000000'}}>
                                부동산 실시간 시세와 착한중개인 서비스는 정상이용 가능합니다.
                              </CustomTextM>
                            </View>
                          </ScrollView>
                        </View>
                        <View style={styles.checkBoxWrap}>                            
                            <CheckBox 
                                containerStyle={{padding:0,margin:0}}   
                                iconType={'FontAwesome'}
                                checkedIcon={<Image source={CHECKNOX_ON} resizeMode='contain' style={styles.checkboxIcon} />}
                                uncheckedIcon={<Image source={CHECKNOX_OFF} resizeMode='contain' style={styles.checkboxIcon} />}
                                checkedColor={DEFAULT_COLOR.base_color}                          
                                checked={this.state.showPopupLayer}
                                onPress={() => this.checkItem(!this.state.showPopupLayer)}
                            />
                            <CustomTextR style={styles.menuText}>다시보지않기</CustomTextR>
                        </View>
                    </Animated.View>
                    
                </View>
            </Modal>
        );
      }
    }
}

const styles = StyleSheet.create({
    modalBackground: {
        zIndex:1,
        flex: 1,
        justifyContent: "center",
        alignItems:'center',
        backgroundColor: "rgba(0,0,0,0.3)",
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT
    },
    checkboxIcon : {
      width : CommonUtil.dpToSize(20),
      height : CommonUtil.dpToSize(20)
    },
    lineHang : {
      paddingHorizontal:20,
      ...Platform.select({
        ios: {
          paddingTop:8
        },
        android: {
          paddingTop:0
        }
    })
    },
    modalTop : {
        zIndex:10,
        position:'absolute',
        right:10,
        top:10,
        height:40,
        width:40,
        justifyContent:'center',
        alignItems:'center'
    },
    modalTail : {
        zIndex:10,
        height:70,
        justifyContent:'center',
        alignItems:'center',
        paddingLeft:10,
        //backgroundColor:'#ff0000'
    },
    checkBoxWrap : {
        position: 'absolute',
        flexDirection:'row',
        alignItems:'center',
        bottom: 0,
        left : 10,
        //paddingBottom:5,
        width:SCREEN_WIDTH*0.8,
        height:50,
        zIndex:15
    },
    moveButton  : {
        paddingVertical:10,
        width : SCREEN_WIDTH*0.7,
        backgroundColor:DEFAULT_COLOR.base_color,
        justifyContent:'center',
        alignItems:'center'
    },
    modalContainer: {   
        //top : BASE_HEIGHY,
        width:SCREEN_WIDTH*0.8,
        height: SCREEN_HEIGHT > 700 ? SCREEN_HEIGHT*0.55 : SCREEN_HEIGHT*0.65,
        borderRadius:10,
        paddingTop: 16,
        backgroundColor: '#fff'
    },
    paginationStyle: {
        position: 'absolute',
        top: 10,
        right: 15,
        backgroundColor:'#555',
        paddingHorizontal:10,
        paddingVertical:3,
        borderRadius:12,
        zIndex:20
    },
    renderWrapStyle: {
        position:'absolute',
        height: SCREEN_HEIGHT > 700 ? SCREEN_HEIGHT*0.55 : SCREEN_HEIGHT*0.65,
        width:SCREEN_WIDTH*0.9,
        top:0,
        left: 0,
        flexDirection:'row',
    },
    imageWarp : {
        flex:1,
        backgroundColor:'transparent'
    },
    contentStyle: {
        position:'absolute',
        left:0,
        bottom:0,
        width:SCREEN_WIDTH*0.9,
        paddingHorizontal:20,
        height:100,
        zIndex:15,
        backgroundColor:'transparent'
        
    },
    menuText : {
        color: '#555',fontSize: PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize14)
    },
    menuText2 : {
        fontSize: PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize14)
    },
    paginationText: {
        color: '#fff',fontSize: PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize13)
    },
    paginationText2: {
        color: '#ccc',
        fontSize: PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize13)
    }

});