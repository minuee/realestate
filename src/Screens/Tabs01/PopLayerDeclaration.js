import React, { Component } from 'react';
import {SafeAreaView,Alert,View,StyleSheet,Text,Dimensions,PixelRatio,Image,TextInput, TouchableOpacity,ImageBackground
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import {connect} from 'react-redux';
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
import { TouchableNativeFeedbackBase } from 'react-native';

const BUTTON_CLOSE = require('../../../assets/icons/btn_close.png');
const CHECK_BOX_ON = require('../../../assets/icons/circle_check_on.png');
const CHECK_BOX_OFF = require('../../../assets/icons/circle_check_off.png');
const BackgroundImageOn = require('../../../assets/icons/back_join_agent.png');
const ICON_CHECK = require('../../../assets/icons/icon_shape.png');

import { apiObject } from "../../Apis/Member";

 class PopLayerDeclaration extends Component {
    constructor(props) {
        super(props);
        this.state = {
            memberIdx : 0,//this.props.userToken.memberidx,
            selectedBox : null,
            targetIdx : 0 
        }
    }

   
    async UNSAFE_componentWillMount() {
        //console.log('UNSAFE_componentWillMount returnCode',this.props.screenState);
        this.setState({
            roomIdx : this.props.screenState.roomIdx,
            class_type : CommonUtil.isEmpty(this.props.screenState.class_type) ? 'chat' : this.props.screenState.class_type,
            member_pk : this.props.screenState.member_pk,
            target_member :  this.props.screenState.target_member,
            targetName:  this.props.screenState.targetName
        })
        
       
    }
    componentDidMount() {
        
        setTimeout(() => {
            this.setState({loading:false})
        }, 500);
    }
    checkedBox = (val) => {
        this.setState({selectedBox : val})
    }
    
    setDeclaration = async(val) => {
        if ( !CommonUtil.isEmpty(val)) {
            Alert.alert(
                DEFAULT_CONSTANTS.appName,      
                this.state.targetName + "님을 신고하시겠습니까?",
                [
                    {text: '네', onPress: () => this.actionDeclaration()},
                    {text: '아니오', onPress: () => console.log('Cancle')},
                    
                ],
                { cancelable: true }
            )            
        }else{
            CommonFunction.fn_call_toast('신고사유를 선택해주세요',2000);
            return false;
        }
    }

    actionDeclaration =  async() => {
        
        this.setState({moreLoading:true})
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_registDeclaration({
                locale: "ko",
                room_pk : this.state.roomIdx,
                class_type : this.state.class_type,
                member_pk : this.state.member_pk,
                target_member :  this.state.target_member,
                declaration_type : this.state.selectedBox
            }); 
            //console.log('ChatRoomScreen returnCode',returnCode);
            if ( returnCode.code === '0000') {
                CommonFunction.fn_call_toast('정상적으로 신고되었습니다.',2000)
                setTimeout(() => {
                    this.setState({moreLoading:false})
                    this.props.screenState.closePopView();
                }, 1500);
            }else{
                CommonFunction.fn_call_toast('오류가 발생하였습니다. 잠시후에 다시 이용해주십시요',1500)
                setTimeout(() => {
                    this.setState({moreLoading:false})                    
                }, 1000);  
            }
            
        }catch(e){
            //console.log('returnCode error1',e);
            CommonFunction.fn_call_toast('오류가 발생하였습니다. 잠시후에 다시 이용해주십시요',1500)
                setTimeout(() => {
                    this.setState({moreLoading:false})                    
                }, 1000); 
        }
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
                        <CustomTextM style={[CommonStyle.textSize20,CommonStyle.fontColor000]}>신고사유</CustomTextM>
                    </View>
                </View>   
                <View style={styles.dataCoverWarp}>
                    <TouchableOpacity style={styles.dataTextWarp} onPress={()=> this.checkedBox('A')}>
                        <Image source={this.state.selectedBox === 'A' ? CHECK_BOX_ON : CHECK_BOX_OFF} style={CommonStyle.defaultIconImage} />
                        <CustomTextR style={[CommonStyle.textSize15,CommonStyle.fontColor000]}>{"  "}영리목적/홍보성</CustomTextR>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dataTextWarp} onPress={()=> this.checkedBox('B')}>
                        <Image source={this.state.selectedBox === 'B' ? CHECK_BOX_ON : CHECK_BOX_OFF} style={CommonStyle.defaultIconImage} />
                        <CustomTextR style={[CommonStyle.textSize15,CommonStyle.fontColor000]}>{"  "}음란성/선정성</CustomTextR>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dataTextWarp} onPress={()=> this.checkedBox('C')}>
                        <Image source={this.state.selectedBox === 'C' ? CHECK_BOX_ON : CHECK_BOX_OFF} style={CommonStyle.defaultIconImage} />
                        <CustomTextR style={[CommonStyle.textSize15,CommonStyle.fontColor000]}>{"  "}개인정보노출</CustomTextR>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dataTextWarp} onPress={()=> this.checkedBox('Z')}>
                        <Image source={this.state.selectedBox === 'Z' ? CHECK_BOX_ON : CHECK_BOX_OFF} style={CommonStyle.defaultIconImage} />
                        <CustomTextR style={[CommonStyle.textSize15,CommonStyle.fontColor000]}>{"  "}기타</CustomTextR>
                    </TouchableOpacity>
                </View>
                
                <TouchableOpacity
                    hitSlop={{left:10,right:5,top:10,bottom:10}}        
                    onPress={()=>this.setDeclaration(this.state.selectedBox)}               
                    style={styles.bottomWrap}
                >
                    <ImageBackground
                        source={BackgroundImageOn}
                        resizeMode={'contain'}
                        style={styles.markerBackRedWrap }
                    >
                        <View style={styles.textWrap}>
                            <CustomTextB style={[CommonStyle.textSize18,CommonStyle.fontColorWhite]}>신고하기</CustomTextB>
                        </View>
                         
                    </ImageBackground>
                </TouchableOpacity>                 
                { this.state.moreLoading &&
                    <View style={CommonStyle.moreWrap}>
                        <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} />
                    </View>
                }
                
            </View>
        );
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,        
       
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
        flex:2,justifyContent:'center',marginVertical:20,marginHorizontal:30
    },
    dataTextWarp : {
        height:30,flexDirection:'row',alignItems:'center'
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
        width:226*0.9,height:65*0.9
    },
    textWrap : {
        flex:1,justifyContent:'center',alignItems:'center',paddingBottom:5
    }
});



function mapStateToProps(state) {
    return {
        userToken : state.GlabalStatus.userToken
    };
}

export default connect(mapStateToProps, null)(PopLayerDeclaration);