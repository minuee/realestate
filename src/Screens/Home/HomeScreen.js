import React, { Component } from 'react';
import {SafeAreaView,Image,View,StyleSheet,PixelRatio,Dimensions,TouchableOpacity,StatusBar,Linking,KeyboardAvoidingView,ScrollView,Platform,Text} from 'react-native';
import {connect} from 'react-redux';
import ActionCreator from '../../Ducks/Actions/MainActions';
import * as NetInfo from "@react-native-community/netinfo";
import SplashScreen from 'react-native-splash-screen';
import AsyncStorage from '@react-native-community/async-storage';
import { Tooltip } from 'react-native-elements';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
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
import CustomAlert from '../../Components/CustomAlert';
import Loader from '../../Utils/Loader';
import CheckConnection from '../../Components/CheckConnection';

const ICOM_SEARCH_LIST = require('../../../assets/icons/icon_search_list.png');
const ICOM_SEARCH_MAP = require('../../../assets/icons/icon_search_map.png');

class SignupScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading : true,
            moreLoading :false
        }
    }

	getInformation = async ( member_pk ) => {
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_memberDetail({
                locale: "ko",
                member_pk
            });
            if ( returnCode.code === '0000') {
                this.setState({
                    loading:false,
					moreLoading:false,
                    userData: returnCode.data,
                    isPush : returnCode.data.is_notification
                })
            }
        }catch(e){
            this.setState({loading:false,moreLoading:false})
        }
    }
    
    async UNSAFE_componentWillMount() {
		//console.log('this.props.userToken.member_pk',this.props.userToken.member_pk);
		SplashScreen.hide();

		const saveUserToken = await AsyncStorage.getItem('saveUserToken');
        if(!CommonUtil.isEmpty(saveUserToken) ) {            
            this.props._saveUserToken(JSON.parse(saveUserToken));
        }

		if ( !CommonUtil.isEmpty(this.props.userToken.member_pk)) {
			//await this.getInformation(this.props.userToken.member_pk,this.props.userToken.user_type);			
		}
		this.props.navigation.addListener('focus', () => {
			
		 })
        this.props.navigation.addListener('blur', () => {
           this.setState({loading:false,moreLoading:false});
        })
    }

	componentDidMount() {
		this.setState({loading:false,moreLoading:false});   		
    }
    
	logoutAction = async() => {
		this.props.navigation.navigate('SignInStack');
    }
    joinAction = () => {
		this.props.navigation.navigate('SignInStep01Stack');
    }

	moveAgentList = async(startStack) => {
		console.log('startStackn',startStack)
		await this.props._saveRootStack(startStack);
       
		setTimeout(() => {
			this.props.navigation.navigate('MainHomeStack');
		}, 500);
    }

	renderTooltip = () => {
        return (<View style={{width:'100%',padding:5,alignItems:'center'}}>
            <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColorWhite]}>SNS간편가입은 로그인을 클릭 </CustomTextR>
        </View>)
    }

     
    render() {
        if ( this.state.loading ) {
            return (
                <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} /> 
            )
        }else {
			return(
				<SafeAreaView style={ styles.container }>
					<CheckConnection />
							
					{ Platform.OS == 'android' && <StatusBar backgroundColor={'#fff'} translucent={false}  barStyle="dark-content" />}
					<View style={{flex:1,justifyContent:'flex-end'}}>
						{
						CommonUtil.isEmpty(this.props.userToken) &&
						<View style={styles.topMenuWrap}>
							<TouchableOpacity 
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
								style={styles.infoWrap} 
							>
							<Tooltip popover={this.renderTooltip('')} width={SCREEN_WIDTH*0.7} height={50} backgroundColor={DEFAULT_COLOR.base_color} skipAndroidStatusBar={false}>
								<Icon name="questioncircleo" size={PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15)} color="#555" />
							</Tooltip>
							</TouchableOpacity>
							<TouchableOpacity 
								hitSlop={{left:10,right:10,bottom:10,top:10}}
								style={{padding:5}} onPress={()=> this.logoutAction()}
							>
								<CustomTextM style={[CommonStyle.textSize12,CommonStyle.fontColorDefault]}>로그인</CustomTextM>
							</TouchableOpacity>
							<TouchableOpacity 
								hitSlop={{left:10,right:10,bottom:10,top:10}}
								style={{padding:5}} onPress={()=> this.joinAction()}
							>
								<CustomTextM style={[CommonStyle.textSize12,CommonStyle.fontColorDefault]}>회원가입</CustomTextM>
							</TouchableOpacity>							
						</View>
						}
						<View style={{flex:1,justifyContent:'center',alignItems:'center',}}>
							<View style={{height:30}}></View>
							<CustomTextM style={[CommonStyle.textSize14,CommonStyle.fontColorDefault]}>
								부동산 중개수수료를 협의해주는
							</CustomTextM>
							<View style={{paddingVertical:10}}>
								<Image 
									source={require('../../../assets/icons/title_logo.png')} resizeMode={"contain"}
									style={{width:CommonUtil.dpToSize(175),height:CommonUtil.dpToSize(35)}} 
								/>
							</View>
						</View>

					</View>
					<View style={{flex:1.5,justifyContent:'center',alignItems:'center'}}>
						<View style={styles.dataTextWarp}>
							<TouchableOpacity style={styles.dataTextLeftWrap} onPress={()=> this.moveAgentList('Tabs02NewStack')}>
								<Image source={ICOM_SEARCH_LIST} resizeMode={'contain'} style={{width:CommonUtil.dpToSize(50),height:CommonUtil.dpToSize(53)}} />
								<View style={{paddingTop:10,justifyContent:'center',alignItems:'center'}}>
									<CustomTextM style={[CommonStyle.textSize15,CommonStyle.fontColor000]}>목록으로 보기</CustomTextM>
								</View>
							</TouchableOpacity>
							<TouchableOpacity 
								style={styles.dataTextRightWrap} 
								onPress={()=> this.moveAgentList('Tabs02Stack')}
								//onPress={()=>CommonFunction.fn_call_toast('준비중입니다.',2000)}
							>
								<Image source={ICOM_SEARCH_MAP} resizeMode={'contain'} style={{width:CommonUtil.dpToSize(56),height:CommonUtil.dpToSize(53)}} />
								<View style={{paddingTop:10,justifyContent:'center',alignItems:'center'}}>
									<CustomTextM style={[CommonStyle.textSize15,CommonStyle.fontColor000]}>내 주변 지도로 보기</CustomTextM>
								</View>
								
							</TouchableOpacity>
						</View>					
					</View>
					<View style={{flex:1.5,justifyContent:'flex-start',alignItems:'center'}}>
						<CustomTextM style={[CommonStyle.textSize14,CommonStyle.fontColorDefault]}>
							잠깐!
						</CustomTextM>
						<CustomTextM style={[CommonStyle.textSize14,CommonStyle.fontColorDefault]}>
							아직도 부동산 중개수수료 다 주시나요?
						</CustomTextM>
						<CustomTextM style={[CommonStyle.textSize14,CommonStyle.fontColorDefault]}>
							수수료를 협의해주는 전국의 착한 중개인들을
						</CustomTextM>
						<CustomTextM style={[CommonStyle.textSize14,CommonStyle.fontColorDefault]}>
							지금 바로 만나보세요.
						</CustomTextM>
					</View>
					{ this.state.moreLoading &&
						<View style={CommonStyle.moreWrap}>
							<Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} />
						</View>
					}
				</SafeAreaView>
			);
        }
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor : "#ffffff",
    },
    IndicatorContainer : {
        flex: 1,
        width:'100%',
        backgroundColor : "#fff",
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    topMenuWrap : {
        position:'absolute',right:20,top:20,width:SCREEN_WIDTH*0.8,height:30,		
		alignItems:'center',justifyContent:'flex-end',flexDirection:'row', backgroundColor : "#fff",
		zIndex:5
    },
	dataTextWarp : {
        flex:1,flexDirection:'row',alignItems:'center',paddingHorizontal:30
    },
	dataTextLeftWrap : {		
        flex:1,width:SCREEN_WIDTH*0.4,height:SCREEN_WIDTH*0.4,
		justifyContent:'center',alignItems:'center',marginRight:5,
		borderRadius:10,borderWidth:1,borderColor:DEFAULT_COLOR.base_color
    },
    dataTextRightWrap : {		
        flex:1,width:SCREEN_WIDTH*0.4,height:SCREEN_WIDTH*0.4,
		justifyContent:'center',alignItems:'center',marginLeft:5,
		borderRadius:10,borderWidth:1,borderColor:DEFAULT_COLOR.base_color
    },
	infoWrap : {
        justifyContent:'center',alignItems:'center', zIndex:10
    },
});


function mapStateToProps(state) {
    return {
        userToken : state.GlabalStatus.userToken,
        userNonToken : state.GlabalStatus.userNonToken,
		userBaseData : state.GlabalStatus.userBaseData
    };
}

function mapDispatchToProps(dispatch) {
    return {        
        _saveUserToken:(str)=> {
            dispatch(ActionCreator.saveUserToken(str))
        },
        _saveNonUserToken:(str)=> {
            dispatch(ActionCreator.saveNonUserToken(str))
        },
		_saveRootStack:(str)=> {
            dispatch(ActionCreator.saveRootStack(str))
        },
		_updateUserBaseData:(pk)=> {
            dispatch(ActionCreator.updateUserBaseData(pk))
        }
    };
}

export default connect(mapStateToProps,mapDispatchToProps)(SignupScreen);