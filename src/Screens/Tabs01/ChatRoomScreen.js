import React, { Component,useEffect } from 'react';
import {BackHandler,SafeAreaView,ScrollView, Alert, TouchableOpacity, View,StyleSheet,Image,Dimensions,PixelRatio,Text,Animated,ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import {connect} from 'react-redux';
import ActionCreator from '../../Ducks/Actions/MainActions';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import 'moment/locale/ko'
import  moment  from  "moment";
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
const DEFAULT_PROFILE_IMAGE =  require('../../../assets/icons/default_profile.png')
const ICON_COMMOM_DOT = require('../../../assets/icons/icon_dot.png');
import { apiObject } from "../../Apis/Member";

class ChatRoomScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : true,
            moreLoading : false,            
            contentData : []
        }
    }
    
    getInformation = async ( tokendata) => {
        const { member_pk,user_type} = tokendata;
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_chatRoomList({
                locale: "ko",
                member_pk,user_type
            });
            if ( returnCode.code === '0000') {
                //console.log('getInformation',returnCode.data)
                this.setState({
                    loading:false,
                    moreLoading :false,
                    userData : tokendata,
                    contentData: returnCode.data
                })
            }
        }catch(e){
            this.setState({
                loading:false,
                moreLoading :false,
                userData : tokendata
            })
        }
    }

    async UNSAFE_componentWillMount() {
        console.log('showChatToastMessage',this.props.showChatToastMessage)
        if ( !CommonUtil.isEmpty(this.props.userToken)) {            
            this.getInformation(this.props.userToken);
            this.props._updateUserBaseData(this.props.userToken.member_pk);
        }else{
            this.setState({loading:false})
            let aletTitle = DEFAULT_CONSTANTS.appName;
            let alertMessage = '로그인이 필요합니다.\n로그인 하시겠습니까?';
            let alertbuttons = [
                {text: '네', onPress: () => console.log(1)},
                {text: '아니오', onPress: () => console.log(2)},
            ]
            let returnCode = await CommonFunction.showAsyncAlert(aletTitle, alertMessage, alertbuttons)

            if (returnCode === 0) {
                await this.props._saveNonUserToken({});
                setTimeout(() => {
                    this.props.navigation.navigate('LoginPopStack');
                }, 500);
            } else {
                console.log('option else')
            }
        }
        
        this.props.navigation.addListener('focus', () => {              
            if ( !CommonUtil.isEmpty(this.props.userToken)) {
                this.setState({moreLoading:true})
                this.getInformation(this.props.userToken);
                this.props._updateUserBaseData(this.props.userToken.member_pk);
            }
        })
    }
    componentDidMount() {
        if ( this.props.showChatToastMessage) {     
            setTimeout(() => {
                this.setState({moreLoading:true});
                this.props._updateShowChatToastMessage(false)
                this.setState({moreLoading:false});      
            },3000)          
            
        }
        
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
    
    moveNavigation = (item) => {
        let profileImage = null;
        if ( !CommonUtil.isEmpty(item.profile_url) ) {
            if ( item.profile_url.includes('http') ) {
                profileImage = item.profile_url
            }else{
                profileImage = DEFAULT_CONSTANTS.imageBaseUrl + item.profile_url
            }
        }
        this.props.navigation.navigate('ChatStack', { 
            screenData: this.state.userData,
            user_type : this.state.userData.user_type,
            thread: item,
            roomIdx :item.chatroom_pk,
            uname : item.user_name,
            uid : this.state.userData.member_pk,
            email : CommonFunction.fn_dataDecode(this.state.userData.uid),
            address : item.address,
            tel : CommonFunction.fn_dataDecode(item.telephone),
            imgurl : profileImage,
            imgurl_type : CommonUtil.isEmpty(profileImage)? 'in': 'url',
            target_member : item.member_pk,
        })
    }

    handleDelete = (item) => {
        Alert.alert(
            DEFAULT_CONSTANTS.appName,      
            "정말로 채팅방을 나가시겠습니까?",
            [
                {text: '네', onPress: () => this.handleDeleteAction(item)},
                {text: '아니오', onPress: () => console.log('Cancle')}
            ],
            { cancelable: true }
        ) 
    }

    handleDeleteAction = async(item) => {
        this.setState({moreLoading : true})
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_removeChatRoom({
                locale: "ko",
                roomIdx : item.chatroom_pk
            });
            if ( returnCode.code === '0000') {
                CommonFunction.fn_call_toast('정상적으로 삭제되었습니다.',1500);
                const newData = await this.state.contentData.filter((info) => info.chatroom_pk !== item.chatroom_pk);
                setTimeout(() => {
                    this.setState({moreLoading :false,contentData:newData})
                }, 1500);
            }else{
                this.setState({moreLoading :false})
                CommonFunction.fn_call_toast('일시적으로 오류가 발생하였습니다. 잠시뒤에 다시 이용해주세요.',2000)
            }
        }catch(e){
            CommonFunction.fn_call_toast('일시적으로 오류가 발생하였습니다. 잠시뒤에 다시 이용해주세요.',2000)
            this.setState({moreLoading :false})
        }
    }
    
    renderListView = (item) => {
        console.log('renderListView',item)
        const RightSwipe = (progress, dragX) => {
            const scale = dragX.interpolate({
                inputRange: [-100, 0],
                outputRange: [0.7, 0],
              extrapolate: 'clamp',
            });
            return (
              <TouchableOpacity onPress={()=>this.handleDelete(item)}>
                <View style={styles.deleteBoxWrap}>
                  <Animated.Text style={{color:'#fff',fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize17),transform: [{scale: scale}]}}>채팅</Animated.Text>
                  <Animated.Text style={{color:'#fff',fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize17),transform: [{scale: scale}]}}>나가기</Animated.Text>
                </View>
              </TouchableOpacity>
            );
        }
        let profileImage = DEFAULT_PROFILE_IMAGE;
        if ( !CommonUtil.isEmpty(item.profile_url) ) {
            if ( item.profile_url.includes('http') ) {
                profileImage = {uri:item.profile_url}
            }else{
                profileImage = {uri:DEFAULT_CONSTANTS.imageBaseUrl + item.profile_url}
            }
        }
           
        return (
            <Swipeable renderRightActions={RightSwipe}>
                <TouchableOpacity onPress={()=>this.moveNavigation(item)} style={[styles.dataRowWrap,{flexDirection:'row'}]}>
                    <View style={styles.rowLeftWrap}>
                        <View style={styles.imageWrap}>
                            <Image 
                                source={profileImage} 
                                resizeMode={'cover'}
                                style={[CommonStyle.defaultIconImage55,{borderRadius:28}]} 
                            />
                        </View>                        
                    </View>
                    <View style={styles.rowRightWrap} >
                        <View style={styles.rowDescripWrap2}>
                            <View style={{flex:1}}>
                                <CustomTextB style={[CommonStyle.textSize14,CommonStyle.fontColor000]} numberOfLines={2} ellipsizeMode={'tail'}>{item.user_name}</CustomTextB>
                            </View>
                            <View style={{flex:1,alignItems:'flex-end'}}>
                                <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor999]} numberOfLines={2} ellipsizeMode={'tail'}>{CommonUtil.isEmpty(item.last_date) ? '-' : CommonFunction.compareTime(item.last_date,moment().unix(),CommonFunction.convertUnixToDate(item.last_date,'YYYY-MM-DD'))}</CustomTextR>
                                { item.unread_count > 0 &&
                                    <View style={styles.chatTextWrap}>
                                        <CustomTextB style={styles.chatText}>{item.unread_count}</CustomTextB>
                                    </View>                                
                                }
                            </View>
                        </View>
                        <View style={styles.rowDescripWrap}>
                            <View style={styles.rowDescripLeftWrap}>
                                <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]} numberOfLines={1} ellipsizeMode={'tail'}>
                                    {item.address}{" / "}
                                    {CommonFunction.fn_dataDecode(item.telephone)}
                                </CustomTextR> 
                            </View>
                        </View>
                        <View style={styles.rowDescripWrap2}>
                            <View style={styles.rowDescripLeftWrap}>
                                <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColor999]} numberOfLines={1} ellipsizeMode={'tail'}>
                                    {item.last_message.includes('chat/') ? '이미지' : item.last_message}{"  "}
                                </CustomTextR>                                
                                
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Swipeable>
        )
        
    }
    render() {
        
        if ( this.state.loading ) {
            return (
                <ActivityIndicator size="small" color={DEFAULT_COLOR.base_color} style={{paddingTop:100}} />
            )
        }else {
            if ( !CommonUtil.isEmpty(this.props.userToken)) {
                return(
                    <SafeAreaView style={ styles.container }>
                        {this.props.showChatToastMessage &&
                            <View style={styles.fixedTopInfo}>
                                <CustomTextR style={[CommonStyle.textSize15,CommonStyle.fontColorWhite,{zIndex:55}]}>
                                실시간 채팅은 아니지만
                                </CustomTextR>
                                <CustomTextR style={[CommonStyle.textSize15,CommonStyle.fontColorWhite,{zIndex:55}]}>
                                메세지가 도착하면 앱알람이 울립니다.
                                </CustomTextR>
                                <View style={styles.comonBack} />
                            </View>
                            }
                            {this.props.showChatToastMessage &&
                            <View style={styles.fixedBottomInfo}>
                                <CustomTextR style={[CommonStyle.textSize15,CommonStyle.fontColorWhite,{zIndex:55}]}>
                                채팅방을 왼쪽으로 밀면 채팅방 나가기
                                </CustomTextR>
                                <View style={styles.comonBack2} />
                            </View>
                            }
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
                                    this.state.contentData.length == 0 ?
                                    <View style={[styles.contentDataWrap,{justifyContent:'center',alignItems:'center',paddingVertical:50}]}>
                                        <CustomTextR style={[CommonStyle.textSize14,CommonStyle.fontColor000]}>
                                            채팅 가능한 방이 없습니다.
                                        </CustomTextR>
                                    </View>
                                    :                            
                                    this.state.contentData.map((item,index) => (
                                        <View key={index}style={styles.contentDataWrap}>
                                            {this.renderListView(item)}
                                        </View>
                                    ))
                                }
                            </View>
                        </ScrollView>
                        { 
                            this.state.moreLoading &&
                            <View style={CommonStyle.moreWrap}>
                                <ActivityIndicator size="small" color={DEFAULT_COLOR.base_color} />
                            </View>
                        }
                    </SafeAreaView>
                );
            }else{
                return (
                    <View style={{flex:1,justifyContent:'flex-start',alignItems:'center',paddingTop:100}}>
                        <CustomTextR style={[CommonStyle.textSize14,CommonStyle.fontColor000]}>
                            대화 목록이 없습니다.
                        </CustomTextR>
                        <CustomTextR style={[CommonStyle.textSize14,CommonStyle.fontColor000]}>
                            로그인후 채팅을 시작하세요
                        </CustomTextR>
                    </View>
                )
            }
        }
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,backgroundColor : "#fff",
       
    },
    fixedTopInfo : {
        position:'absolute',top:SCREEN_HEIGHT*0.1,
        left:30,width:SCREEN_WIDTH-60,
        height:70,
        alignItems:'center',
        justifyContent:'center',
        zIndex:99,
        overflow:'hidden'
    },
    comonBack : {
        position:'absolute',top:0,left:0,width:'100%',
        backgroundColor:'#000',
        height:70,
        borderRadius:10,
        opacity:0.7
    },
    fixedBottomInfo : {
        position:'absolute',bottom:SCREEN_HEIGHT*0.05,
        left:30,width:SCREEN_WIDTH-60,
        height:50,
        alignItems:'center',
        justifyContent:'center',
        zIndex:99,
        overflow:'hidden'
    },
    comonBack2 : {
        position:'absolute',top:0,left:0,width:'100%',
        backgroundColor:'#000',
        height:50,
        borderRadius:10,
        opacity:0.7
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
        flex:1,marginHorizontal:20
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
    imageWrap : {
        width:56,height:56,marginTop:5
    },
    rowRightWrap : {
        flex:5,paddingLeft:10,justifyContent:'flex-start'
    },
    rowDescripWrap2 : {
        flexDirection:'row',alignItems:'center',marginTop:5,flexDirection:'row'
    },
    rowDescripWrap : {
        flexDirection:'row',alignItems:'center',marginTop:0
    },
    rowDescripLeftWrap : {
        flex:3,justifyContent:'center'
    },
    rowDescripRightWrap : {
        flex:1,flexDirection:'row',alignItems:'center',justifyContent:'flex-end'
    },
    dotWrap :{ 
        width:5,height:5,paddingHorizontal:5
    },
    markWrap : {
        width:10,height:10,paddingRight:15
    },
    deleteBoxWrap : {
        backgroundColor:DEFAULT_COLOR.base_color,
        justifyContent:'center',alignItems:'center',
        width:100,height:'100%'
    },
    chatTextWrap : {
        position:'absolute',top:25,right:7,width:20,height:20,backgroundColor:'#ff0000',borderRadius:10,justifyContent:'center',alignItems:'center',zIndex:2,overflow:'hidden'
    },
    chatText : {
        fontSize : DEFAULT_TEXT.fontSize9,        
        margin : 0,padding:0,
        color:'#ffffff'
    },
});


function mapStateToProps(state) {
    return {
        userToken : state.GlabalStatus.userToken,
        showChatToastMessage : state.GlabalStatus.showChatToastMessage,
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
        _updateUserBaseData:(pk)=> {
            dispatch(ActionCreator.updateUserBaseData(pk))
        },
        _updateShowChatToastMessage:(bool)=> {
            dispatch(ActionCreator.updateShowChatToastMessage(bool))
        }
        
    };
}


export default connect(mapStateToProps,mapDispatchToProps)(ChatRoomScreen);