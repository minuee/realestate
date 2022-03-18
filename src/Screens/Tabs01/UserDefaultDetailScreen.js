import React, { Component,useCallback, useState } from 'react';
import {Alert,ScrollView,KeyboardAvoidingView, Platform, TouchableOpacity, View,StyleSheet,Image,Dimensions,PixelRatio,Text,BackHandler,Animated} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import 'moment/locale/ko'
import  moment  from  "moment";
import ImagePicker from 'react-native-image-crop-picker';
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

const DEFAULT_PROFILE_IMAGE =  require('../../../assets/icons/default_profile.png')
const SETUP_ICON_IMAGE =  require('../../../assets/icons/icon_setup.png')

import { apiObject } from "../../Apis/Member";
import { Storage } from "@psyrenpark/storage";

class UserDefaultDetailScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading : true,
            moreLoading :false,
            formUserID : null,
            formNickName : null,
            isNewImage : false,
            newimageUrl : null,
            image : {},
            thumbnail_img : '',
            attachFileSize : 0,
            photoarray : null,
            userData : {},
        }
    }

    getInformation = async ( member_pk ) => {
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_memberDetail({
                locale: "ko",
                member_pk
            }); 
            console.log('returnCode',returnCode.data);
            if ( returnCode.code === '0000') {
                const userData = returnCode.data;
                this.setState({
                    loading:false,
                    userData:  userData,
                    thumbnail_img : !CommonUtil.isEmpty(userData.profile_url) ? userData.profile_url : null,
                    formUserID : !CommonUtil.isEmpty(userData.uid) ? CommonFunction.fn_dataDecode(userData.uid) : null,
                    formNickName : !CommonUtil.isEmpty(userData.nickname) ? userData.nickname : null,
                })
            }
            
        }catch(e){
            //console.log('returnCode error1',e);
            this.setState({loading:false})
        }
    }
  
    async UNSAFE_componentWillMount() {
        console.log('this.props.userToken',this.props.userToken)  
        await this.getInformation(this.props.userToken.member_pk);    
        this.props.navigation.addListener('focus', () => {            
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
   
    setupUpdateData = async() => {

        Alert.alert(
            DEFAULT_CONSTANTS.appName,
            '정보를 수정하시겠습니까?',
            [
              {text: '네', onPress: () => this.actionUpdate()},
              {text: '아니오', onPress: () => console.log('no')},
            ],
            {cancelable: false},
          );
    }

    actionUpdate = async() => {
        this.setState({moreLoading:true})
        const photoarray = this.state.photoarray;
        //console.log('photoarray',photoarray);
        let imageurl = this.state.thumbnail_img;
        if (!CommonUtil.isEmpty(photoarray) && this.state.isNewImage) {
            imageurl =  await this.awsimageupload(photoarray);            
        }

        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_updateMemberInfo({
                locale: "ko",
                member_pk :  this.props.userToken.member_pk,
                area_code : !CommonUtil.isEmpty(this.state.userData.area_code) ? this.state.userData.area_code : "",
                company_name : !CommonUtil.isEmpty(this.state.userData.company_name) ? this.state.userData.company_name : "",
                address: !CommonUtil.isEmpty(this.state.userData.address) ? this.state.userData.address : "",
                telephone: !CommonUtil.isEmpty(this.state.userData.telephone) ? this.state.userData.telephone : "",
                business_code : !CommonUtil.isEmpty(this.state.userData.business_code) ? this.state.userData.business_code : "",
                profile : !CommonUtil.isEmpty(imageurl) ? imageurl : ''
            }); 
            //console.log('UserDefaultDetailScreen returnCode',returnCode);
            if ( returnCode.code === '0000') {
                this.setState({
                    moreLoading:false,
                    contentData: returnCode.data
                })
                CommonFunction.fn_call_toast('정상적으로 수정되었습니다.',2000)
                return false;
            }else{
                CommonFunction.fn_call_toast('업데이트에 실패하였습니다',2000);
                return false;
            }
            
        }catch(e){
            //console.log('returnCode error1',e);
            CommonFunction.fn_call_toast('업데이트에 실패하였습니다',2000);
            this.setState({moreLoading:false})
        }

    }

    changeProfile = async(cropit, circular = false, mediaType = 'photo') => {
        
        ImagePicker.openPicker({
            width: 900,
            height: 900,
            multiple:false,
            cropping: true,
            cropperCircleOverlay: circular,
            sortOrder: 'none',
            compressImageMaxWidth: 1000,
            compressImageMaxHeight: 1000,
            compressImageQuality: 1,
            compressVideoPreset: 'MediumQuality',
            includeExif: true,
            cropperStatusBarColor: 'white',
            cropperToolbarColor: 'white',
            cropperActiveWidgetColor: 'white',
            cropperToolbarWidgetColor: '#3498DB',
            loadingLabelText:'처리중...',
            forceJpg:true
        })
          .then((response) => {
                try {
                    if( response.mime.indexOf('image') != -1) {
                        if (response.path) {
                            //console.log('response.uri', response)
                            if ( parseInt((response.size)/1024/1024) > 6 ) {
                                CommonFunction.fn_call_toast('이미지는 5mb이하로 올려주세요',2000)
                                return;
                            }else{                          
                                this.setState({
                                    isNewImage : true,
                                    thumbnail_img : response.path,
                                    attachFileSize :  response.size,
                                    photoarray : {
                                        type : response.mime === undefined ? 'jpg' :  response.mime,
                                        uri : response.path, 
                                        height:response.height,
                                        width:response.width,
                                        fileSize:response.size,
                                        fileName:response.filename
                                    }
                                })
                            }
                        }
                    }else{
                        CommonFunction.fn_call_toast('정상적인 이미지 파일이 아닙니다.')
                        return;
                    }
                }catch(e){
                    //console.log("eerorr ", e) ;
                    CommonFunction.fn_call_toast('오류가 발생하였습니다. 다시 시도해주세요')
                    return;
                }
            })
           
          .catch((e) => {
            //console.log(e);
            CommonFunction.fn_call_toast('이미지 선택을 취소하였습니다.',2000)
            //Alert.alert(e.message ? e.message : e);
          });
    }

    awsimageupload = async(item) => {
        //console.log('awsimageupload',item);
        const result = await fetch(item.uri);
        const blob = await result.blob();
        let nowTimeStamp = moment()+840 * 60 * 1000;  // 서울
        let imgtype = await CommonFunction.getImageType(item.type)
        let newfilename = 'profile/' + nowTimeStamp + '_' + this.state.userData.member_pk + '.' +　imgtype;
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
                //console.log('returnData.key',returnData.key);
                this.setState({
                    newimageUrl : newfilename
                });
                return newfilename;
            }
            
        } catch (error) {
            //  실패
            CommonFunction.fn_call_toast('이미지 업로드중 오류가 발생하였습니다. 잠시후 다시 이용해주세요',2000);
            this.setState({loading:false})
            return null;
        }
    }

    renderProfileImage = () => {
        if ( !CommonUtil.isEmpty(this.state.thumbnail_img)) {
            if ( this.state.isNewImage ) {
                return (
                    <Image
                        source={{uri:this.state.thumbnail_img}}
                        resizeMode={"cover"}
                        style={[CommonStyle.defaultImage97,{borderRadius:45}]}
                    />
                )
            }else{
                if ( this.state.thumbnail_img.includes('http')) {
                    return (
                        <Image
                            source={{uri:this.state.userData.profile_url}}
                            resizeMode={"cover"}
                            style={[CommonStyle.defaultImage97,{borderRadius:45}]}
                        />
                    )
                }else{
                    return (
                        <Image
                            source={{uri:DEFAULT_CONSTANTS.imageBaseUrl + this.state.thumbnail_img}}
                            resizeMode={"cover"}
                            style={[CommonStyle.defaultImage97,{borderRadius:45}]}
                        />
                    )

                }
            }
        }else {
            return (
                <Image source={DEFAULT_PROFILE_IMAGE} resizeMode={'contain'} style={CommonStyle.defaultImage97} />
            )
        }
           
    }
    
    render() {
        if ( this.state.loading ) {
            return (
                <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} />
            )
        }else {
            return(
                <View style={ styles.container }>
                    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? "padding" : 'height'}  enabled> 
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        indicatorStyle={'white'}
                        scrollEventThrottle={16}
                        keyboardDismissMode={'on-drag'}      
                        style={{width:'100%'}}
                    >
                    <View style={styles.dataCoverWrap} >
                        <View style={styles.profileImageWrap} >
                            {this.renderProfileImage()}
                            <TouchableOpacity style={styles.setupIconWrap} onPress={()=>this.changeProfile()}>
                                <Image source={SETUP_ICON_IMAGE} resizeMode={'contain'} style={CommonStyle.defaultIconImage30} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <View style={styles.commonFlex}>
                        <View style={styles.middleTitleWarp}>
                            <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColorccc]}>아이디</CustomTextR>
                        </View>
                        <View style={styles.middleDataWarp2}>
                            <CustomTextR style={[CommonStyle.textSize15,CommonStyle.fontColor999]}>{this.state.formUserID}</CustomTextR>                                                  
                        </View>
                        <View style={styles.middleTitleWarp}>
                            <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColorccc]}>닉네임</CustomTextR>
                        </View>
                        <View style={styles.middleDataWarp2}>
                            <CustomTextR style={[CommonStyle.textSize15,CommonStyle.fontColor999]}>{this.state.formNickName}</CustomTextR>                                                  
                        </View>                        
                    </View>
                    {this.state.userData.join_type === 'Z' &&
                    <View style={styles.commonFlex2}>
                        <TouchableOpacity style={styles.middleTitleWarp} onPress={()=>this.props.navigation.navigate('MyPWModifyStack')}>
                            <CustomTextB style={[CommonStyle.textSize13,CommonStyle.fontColorBase]}>비밀번호 변경</CustomTextB>
                        </TouchableOpacity>
                    </View>
                    }
                    </ScrollView>
                    <TouchableOpacity style={styles.bottomButtonWarp}>
                        <TouchableOpacity 
                            onPress={()=>this.setupUpdateData()}
                            style={styles.buttonWrapOn }
                        >
                            <CustomTextM style={[CommonStyle.textSize17,CommonStyle.fontColorWhite]}>설정완료</CustomTextM>
                        </TouchableOpacity>
                    </TouchableOpacity>     
                    { this.state.moreLoading &&
                        <View style={CommonStyle.moreWrap}>
                            <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} />
                        </View>
                    }
                    </KeyboardAvoidingView>               
                </View>
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
    dataCoverWrap : {
        flex:1,paddingHorizontal:20,paddingVertical:15,alignItems:'center',justifyContent:'center'
    },
    profileImageWrap : {
        flex:1,width:SCREEN_WIDTH/4,height:SCREEN_WIDTH/4
    },
    setupIconWrap : {
        position:'absolute',right:0,bottom:5
    },
    bottomButtonWarp : {
        height:120,
        justifyContent:'center',
        paddingTop:10,paddingBottom:20,paddingHorizontal:20
    },
    buttonWrapOn : {
        backgroundColor:DEFAULT_COLOR.base_color,padding:10,justifyContent:'center',alignItems:'center',borderRadius:25
    },
    commonFlex : {
        flex:1,paddingHorizontal:20,marginTop:30
    },
    commonFlex2 : {
        flex:1,paddingHorizontal:20
    },
    middleTitleWarp : {
        flex:1,
        justifyContent:'center',
        paddingHorizontal:10
    },
    middleDataWarp : {
        flex:1,
        justifyContent:'center',
        marginVertical:5
    },
    dataInputWrap : {
        flex:1,height:55
    },
    middleDataWarp2 : {
        flex:1,
        justifyContent:'center',
        paddingTop:10,paddingBottom:20,paddingHorizontal:10
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
        },
        _saveNonUserToken:(str)=> {
            dispatch(ActionCreator.saveNonUserToken(str))
        }
    };
}


export default connect(mapStateToProps,mapDispatchToProps)(UserDefaultDetailScreen);