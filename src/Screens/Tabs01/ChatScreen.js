import React, { Component } from 'react';
import {SafeAreaView, ActivityIndicator, View, StyleSheet ,Image,PixelRatio,Dimensions,Alert,TouchableHighlight,TouchableOpacity,LogBox,BackHandler,NativeModules} from 'react-native';
LogBox.ignoreLogs(['Animated.event now requires a second argument for options']);
import {GiftedChat,Bubble,Send,SystemMessage,InputToolbar} from 'react-native-gifted-chat';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import {connect} from 'react-redux';
import ActionCreator from '../../Ducks/Actions/MainActions';
import 'moment/locale/ko'
import  moment  from  "moment";
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import { Overlay } from 'react-native-elements';
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
import  * as SpamWords   from '../../Constants/FilterWords';
import TextTicker from '../../Utils/TextTicker';
import PopLayerDeclaration from './PopLayerDeclaration';
const SampleRoomIdx = 1;
const ICON_ATTACH = require('../../../assets/icons/icon_attach.png')
const DEFAULT_PROFILE_IMAGE =  require('../../../assets/icons/default_profile.png')
const ICON_SINGO = require('../../../assets/icons/icon_report.png');
import { apiObject } from "../../Apis/Chat";
import { Storage } from "@psyrenpark/storage";
class ChatScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading : true,
            moreLoading :false,
            popLayerView : false,
            lastMessageIdx : 0,
            messages : [],
            myinfo : {
                uid : null, 
                email : null,
                uname : null
            },
            userData :{},
            attachFileSize : 0,
            thumbnail_img : null,
            newImage : {},
            roomIdx :0,
            targetMember : 0,
            targetName : ''
        }
    }
    
    closePopView = () => {
        this.setState({popLayerView:false})
    }
    closePopLayer = () => {
        this.setState({popLayerView:false})
    }

    setMyInfo = async(extraData) => {        
        this.setState({
            myinfo : {
                uid : extraData.member_pk, 
                email : extraData.uid, 
                uname : extraData.user_name, 
                imgurl : CommonUtil.isEmpty(extraData.profile) ? DEFAULT_PROFILE_IMAGE: extraData.profile
            }
        })
    }

    setMessages = async(data) => {
        let messagesOrigin = await this.state.messages.filter((item) => item.isNew == undefined);
        await data.forEach(function(element){ 
            
            if ( element.class_type === 'image') {
                messagesOrigin.push({
                    createdAt: element.reg_date*1000,
                    _id:element.message_pk,
                    system: CommonUtil.isEmpty(element.is_system)?false:element.is_system,
                    text : '',
                    image:DEFAULT_CONSTANTS.imageBaseUrl + element.message,                    
                    user: {
                        _id: parseInt(element.member_pk),
                        name : element.user_name,
                        avatar: element.profile
                    }
                })
            }else{
                messagesOrigin.push({
                    createdAt: element.reg_date*1000,
                    _id:element.message_pk,
                    image:'',
                    system: CommonUtil.isEmpty(element.is_system)?false:element.is_system,
                    text:element.message,                    
                    user: {
                        _id: parseInt(element.member_pk),
                        name : element.user_name,
                        avatar: element.profile
                    }
                })
            }
        })
        this.setState({
            lastMessageIdx : data[0].message_pk,
            messages : messagesOrigin.sort((a, b) => (a.createdAt > b.createdAt) ? -1 : 1),
            loading :false
        })
    }

    getInformation = async (roomIdx,member_pk,lastMessageIdx = 0 ) => {        
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_getChatMessage({
                locale: "ko", roomIdx,member_pk,lastMessageIdx
            });             
            if ( returnCode.code === '0000') {                     
                if ( returnCode.data.length > 0 ){
                    this.setMessages(returnCode.data)
                }
            }else{
                this.setState({loading:false}) 
            }
        }catch(e){
            this.setState({loading:false})
        }
    }

    registMessage = async (roomIdx, memberIdx,classType,message) => {
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_insertMessage({
                locale: "ko", 
                roomIdx : roomIdx,
                memberIdx : memberIdx,
                classType : classType,
                message : message,
                targetMember : this.state.targetMember
            });
            if ( returnCode.code === '0000') {
                return returnCode;
            }else{
                return returnCode;
            }
        }catch(e){
            return returnCode;
        }
    }

    removeMessage = async (tarket_pk) => {
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_removeMessage({
                locale: "ko", 
                tarket_pk
            });
            if ( returnCode.code === '0000') {
                CommonFunction.fn_call_toast('메시지 삭제되었습니다.',2000)
            }else{
                CommonFunction.fn_call_toast('메시지 삭제가 실패하였습니다.',2000)
            }
        }catch(e){
            CommonFunction.fn_call_toast('메시지 삭제가 실패하였습니다.',2000)
        }
    }

    async UNSAFE_componentWillMount() {
        if ( CommonUtil.isEmpty(this.props.extraData.params.roomIdx)) {
            CommonFunction.fn_call_toast('잘못된 접근입니다',1500);
            setTimeout(() => {
                this.props.navigation.goBack(null);
            }, 1500);
        }else{
            await this.setMyInfo(this.props.extraData.params.screenData);
            this.setState({
                userData : this.props.extraData.params.screenData,
                roomIdx :this.props.extraData.params.roomIdx,
                targetMember : this.props.extraData.params.target_member,
                targetName : this.props.extraData.params.uname
            })
            await this.getInformation(this.props.extraData.params.roomIdx,this.props.userToken.member_pk);
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
    handleChoosePhoto = async(photoarray) => {   
        this.setState({moreLoading:true})
        const imgurl = await this.awsimageupload(photoarray);
        if ( !CommonUtil.isEmpty(imgurl)) {
            let apiResult = await this.registMessage(
                this.state.roomIdx,parseInt(this.state.userData.member_pk) ,'image',imgurl
            );
            if ( apiResult.code !== '0000') {
                CommonFunction.fn_call_toast('메시지 전송이 제대로 되지 않았습니다',2000)
            }
            let messagesOrigin = this.state.messages;
            const uid = parseInt(this.state.userData.member_pk);
            const email = this.state.userData.uid;
            const uname = this.state.userData.user_name;        
            let uuid = moment().unix();        
            messagesOrigin.push({
                createdAt: new Date().getTime(),
                _id:uuid,
                text : '',
                image : DEFAULT_CONSTANTS.imageBaseUrl + imgurl,            
                user: {
                    _id: uid,
                    email: email,
                    name : uname
                }
            });
            this.setState({
                moreLoading :false,
                messages : messagesOrigin.sort((a, b) => ( parseInt(a._id) > parseInt(b._id)) ? -1 : 1)
            })
        }else{
            return;
        }
    }
    localcheckfile = () => {
        const options = {
            noData: true,
            title : '이미지 선택',
            takePhotoButtonTitle : '카메라 찍기',
            chooseFromLibraryButtonTitle:'이미지 선택',
            cancelButtonTitle : '취소',
            maxWidth: 512,
            maxHeight: 512,
            allowsEditing: true,
            noData: true
        }
        launchImageLibrary(options, response => {
            try {
                if( response.type.indexOf('image') != -1) {
                    if (response.uri) {
                        if ( parseInt((response.fileSize)/1024/1024) > 5 ) {
                            CommonFunction.fn_call_toast('이미지 용량이 50MB를 초과하였습니다',2000)
                            return;
                        }else{
                            let fileName = response.fileName;
                            if ( CommonUtil.isEmpty(fileName)) {
                                let spotCount = response.uri.split('.').length-1;
                                let pathExplode = response.uri.split('.') 
                                fileName = Platform.OS + moment().unix() + '.'+pathExplode[spotCount];
                            }
                            this.handleChoosePhoto({
                                type : response.type === undefined ? 'jpg' :  response.type,
                                uri : response.uri, 
                                height:response.height,
                                width:response.width,
                                fileSize:response.fileSize,
                                fileName:fileName
                            })
                        }
                    }
                }else{
                    CommonFunction.fn_call_toast('정상적인 이미지 파일이 아닙니다.',2000)
                    return;
                }
            }catch(e){
            }
        })
    }

    awsimageupload = async(item) => {
        const result = await fetch(item.uri);
        const blob = await result.blob();
        let nowTimeStamp = moment()+840 * 60 * 1000;  // 서울
        let imgtype = await CommonFunction.getImageType(item.type)
        let newfilename = 'chat/' + nowTimeStamp + '_' + this.state.roomIdx + '.' +　imgtype;
        try {
            let returnData = await Storage.put({
                key: newfilename, // "test.jpg",
                object: blob,
                config: {
                    contentType: item.type // "image/jpeg",
                }
            })
            if ( CommonUtil.isEmpty(returnData.key)) {
                CommonFunction.fn_call_toast('이미지 업로드중 오류가 발생하였습니다. 잠시후 다시 이용해주세요',2000);
                return null;
            }else{
                this.setState({newimageUrl : newfilename});
                return newfilename;
            }            
        } catch (error) {
            CommonFunction.fn_call_toast('이미지 업로드중 오류가 발생하였습니다. 잠시후 다시 이용해주세요',2000);
            this.setState({loading:false})
            return null;
        }
    }

    handleSend = async(tmpmessages) => {
        let messagesOrigin = this.state.messages;
        const roomIdx = this.state.roomIdx;
        const uid = parseInt(this.state.userData.member_pk);
        const email = this.state.userData.uid;
        const uname = this.state.userData.user_name;     
        const textOrigin = tmpmessages[0].text;
        let uuid = moment().unix();
        let text = await CommonFunction.isForbiddenWord( textOrigin, SpamWords.FilterWords.badWords); 
        messagesOrigin.push({
            isNew : true,
            createdAt: new Date().getTime(),
            _id:uuid,
            text,
            user: {
                _id: uid,
                email: email,
                name : uname,
                //avatar: 'https://icons.iconarchive.com/icons/mag1cwind0w/o-sunny-day/128/osd-sun-icon.png',
            }
        });
        
        let apiResult = await this.registMessage(
            roomIdx, uid,'text',text
        );
        if ( apiResult.code !== '0000') {
            CommonFunction.fn_call_toast('메시지 전송이 제대로 되지 않았습니다',2000)
        }else{
            this.setState({
                messages : messagesOrigin.sort((a, b) => ( parseInt(a._id) > parseInt(b._id)) ? -1 : 1)
            })
        }
    }
 
    renderBubble(props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{right: {backgroundColor: DEFAULT_COLOR.base_color}}}
                textStyle={{right: {color: '#fff'}}}
            />
        );
    }

    renderLoading() {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size='large' color={DEFAULT_COLOR.base_color} />
            </View>
        )
    }
    
    scrollToBottomComponent = () =>{
        return (
            <View style={styles.bottomComponentContainer}>
                <Button
                    type={'clear'}
                    onPress={() => this.giftedChatRef.scrollToBottom()}
                    icon={<Icon name="arrowdown" size={25} color={DEFAULT_COLOR.base_color} />}
                    title={""}
                />
            </View>
        )
    }

    renderSystemMessage(props) {
        return (
            <SystemMessage
                {...props}
                wrapperStyle={styles.systemMessageWrapper}
                textStyle={styles.systemMessageText}
            />
        );
    }

    renderSend(props) {
        return (
            <Send {...props}>
                <View style={styles.sendingContainer}>
                    <CustomTextR style={[CommonStyle.textSize15,CommonStyle.fontColorWhite]}>전송</CustomTextR>
                </View>
            </Send>
        );
    }
  
    renderAccessory(props){
        return (
            <TouchableHighlight style={styles.accessoryContainer} onPress={()=>this.localcheckfile()}>
                <Image source={ICON_ATTACH} style={{width:CommonUtil.dpToSize(30),height:CommonUtil.dpToSize(30)}} />
            </TouchableHighlight>
        )
    }
    renderInputToolbar(props) {
        return <InputToolbar {...props} containerStyle={styles.inputToolbarStyle} />;
    }

    moveDetail = (nav) => {
        this.props.navigation.navigate(nav,{
            screenTitle:'유저신고'
        })
    }

    onDelete = (tmessage) => {
        const oneHourTerm = moment(new Date()).subtract(60,"minutes").unix();
        if ( parseInt(tmessage.user._id) === parseInt(this.props.userToken.member_pk) ) {
            if ( parseInt(tmessage.createdAt) >  parseInt(oneHourTerm*1000)) {
                this.removeMessage(tmessage._id);
                this.setState(previousState =>
                    ({ messages: previousState.messages.filter(message => message._id !== tmessage._id) })
                )
            }else{
                CommonFunction.fn_call_toast('등록후 1시간이내에만 삭제가 가능합니다.',2000);
                return;
            }
        }else{
            CommonFunction.fn_call_toast('자신의 글만 삭제가 가능합니다.',2000)
            return;
        }
    }

    onLongPress = (context, message) => {
        const options = ['메시지 삭제', '취소'];
        const cancelButtonIndex = options.length - 1;
        context.actionSheet().showActionSheetWithOptions({
            options,
            cancelButtonIndex
        }, (buttonIndex) => {
            switch (buttonIndex) {
                case 0:
                    this.onDelete(message)
                    break;
                case 1 :
                    break;
            }
        });
    }

    refreshScreen = () => {        
        this.getInformation(this.state.roomIdx,this.props.userToken.member_pk,this.state.lastMessageIdx)
        this.giftedChatRef.scrollToBottom()
    }

    render() {
        if ( this.state.loading ) {
            return (
                <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} />
            )
        }else {
        return (
            <SafeAreaView style={{flex:1}}>
                <TouchableOpacity 
                    onPress={()=>this.refreshScreen()}
                    style={styles.fixedWrap}
                >
                    <Icon name="reload1" size={CommonUtil.dpToSize(17)} color="#ccc" />
                </TouchableOpacity>
                <View style={styles.headerWrap}>
                    <View style={styles.tickerWrap}>
                        <TextTicker
                            marqueeOnMount={true} 
                            style={{fontFamily: DEFAULT_CONSTANTS.defaultFontFamilyRegular,fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize13),color:'#999',lineHeight: DEFAULT_TEXT.fontSize13 * 1.42,}}
                            shouldAnimateTreshold={10}
                            duration={8000}
                            loop
                            bounce
                            repeatSpacer={100}
                            marqueeDelay={2000}
                        >
                            상대방에게 불쾌감을 주거나 모욕적인 말들은 삼가해주세요
                        </TextTicker>
                    </View>
                    <TouchableOpacity
                        onPress={()=>this.setState({popLayerView:true})}
                        style={{flex:1,justifyContent:'center',alignItems:'center'}}
                    >
                        <Image source={ICON_SINGO} style={{width:35,height:35}} />
                    </TouchableOpacity>
                </View>
                
                <GiftedChat
                    ref={reftarget => this.giftedChatRef = reftarget}
                    listViewProps={{
                        style: {backgroundColor: '#fff',},
                    }}
                    messages={this.state.messages}
                    user={{
                        _id: parseInt(this.state.userData.member_pk),
                    }}
                    placeholder='텍스트를 입력해주세요'
                    placeholderStyle={{paddingTop:10}}
                    alwaysShowSend
                    showUserAvatar={false}
                    scrollToBottom
                    onLongPress={this.onLongPress}
                    onSend={(text)=>this.handleSend(text)}
                    renderUsernameOnMessage={true}
                    renderBubble={this.renderBubble}
                    renderLoading={this.renderLoading}
                    renderSend={this.renderSend}
                    scrollToBottomComponent={()=>this.scrollToBottomComponent()}
                    renderInputToolbar={this.renderInputToolbar}
                    renderSystemMessage={this.renderSystemMessage}
                    renderActions={()=>this.renderAccessory()}
                    locale={'dayjs/locale/kr'}
                    dateFormat={'l'}
                />
                {
                this.state.popLayerView && (
                    <>
                        <Overlay
                            isVisible={this.state.popLayerView}
                            windowBackgroundColor="rgba(0, 0, 0, 0.8)"
                            overlayBackgroundColor="tranparent"
                            containerStyle={{borderRadius:30}}
                        >
                            <View style={{width:SCREEN_WIDTH*0.6,height:SCREEN_HEIGHT*0.4,backgroundColor:'transparent'}}>
                                <PopLayerDeclaration screenState={{
                                    roomIdx : this.state.roomIdx,
                                    class_type : 'chat',
                                    member_pk : this.state.userData.member_pk,
                                    target_member :  this.state.targetMember,
                                    targetName : this.state.targetName,
                                    closePopView : this.closePopView.bind(this)
                                }} />
                            </View>
                        </Overlay>
                    </>
                )}
                { 
                    this.state.moreLoading &&
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
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    fixedWrap : {
        position:'absolute',right:15,top:50,width:30,height:30,backgroundColor:'transparent',zIndex:100000,
        justifyContent: 'center',alignItems: 'center',borderWidth:1,borderColor:'#ccc',borderRadius:5
    },
    headerWrap : {
        height:40,borderBottomColor:'#ccc',flexDirection:'row'
    }, 
    tickerWrap : {
        flex:5,paddingTop:10,paddingLeft:10
    }, 
 
    sendingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        height:30,width:60,marginRight:15,
        marginBottom:Platform.OS === 'ios' ? 5 :10,
        borderRadius:10,
        backgroundColor:DEFAULT_COLOR.base_color
    },
    accessoryContainer: {
        position:'absolute',left:-30,top:10,
        justifyContent: 'center',
        alignItems: 'center',
        height:30,width:30
        
    },
    inputToolbarStyle : {
        paddingLeft:40,
    },  
    bottomComponentContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    systemMessageWrapper: {
        backgroundColor: '#6646ee',
        borderRadius: 4,
        padding: 5
    },
    systemMessageText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: 'bold'
    },
    
});


function mapStateToProps(state) {
    return {
        userToken : state.GlabalStatus.userToken
    };
}
function mapDispatchToProps(dispatch) {
    return {        
        _saveUserToken:(str)=> {
            dispatch(ActionCreator.saveUserToken(str))
        }
    };
}

export default connect(mapStateToProps,mapDispatchToProps)(ChatScreen);