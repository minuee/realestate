import React, { Component,useCallback, useState } from 'react';
import {Alert,ScrollView,KeyboardAvoidingView, Platform, TouchableOpacity, View,StyleSheet,Image,Dimensions,PixelRatio,BackHandler,Animated} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import 'moment/locale/ko'
import  moment  from  "moment";
import {Input} from 'react-native-elements';
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
import {CustomTextR,CustomTextL, CustomTextB, CustomTextM, TextRobotoM,TextRobotoR,DropBoxIcon} from '../../Components/CustomText';
import CommonFunction from '../../Utils/CommonFunction';
import CommonUtil from '../../Utils/CommonUtil';
import Loader from '../../Utils/Loader';
import * as Codes from '../../Constants/Codes';
import SelectType from "../../Utils/SelectType";
import DaumPostcode from '../../Utils/DaumPostCode';
const DEFAULT_PROFILE_IMAGE =  require('../../../assets/icons/default_profile.png')
const SETUP_ICON_IMAGE =  require('../../../assets/icons/icon_setup.png')

import { apiObject } from "../../Apis/Member";
import { Storage } from "@psyrenpark/storage";
class UserAgentDetailScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading : true,
            showModalDaum : false,
            formUserID : null,
            formBusinessName : null,
            formCeoName : null,
            formAddress : null,
            formZipcode : null,
            formLatitude : 0,
            formLongitude : 0,
            formTel : null,
            formBusinessCode : null,
            isNewImage : false,
            image : {},
            thumbnail_img : null,
            userData : {},
            areaCode :[]
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
                const userData = returnCode.data;
                let areaData = [];
                await Codes.COMMON_CODE_AREA.forEach(function(element){ 
                    areaData.push({...element, checked : element.code === userData.area_code ? true : false })
                })
                this.setState({
                    loading:false,
                    userData:  userData,
                    thumbnail_img : !CommonUtil.isEmpty(userData.profile_url) ? userData.profile_url : null,
                    formUserID : !CommonUtil.isEmpty(userData.uid) ? CommonFunction.fn_dataDecode(userData.uid) : null,
                    formCeoName : !CommonUtil.isEmpty(userData.name) ? userData.name : null,
                    formBusinessName : !CommonUtil.isEmpty(userData.company_name) ? userData.company_name : null,
                    formAddress : !CommonUtil.isEmpty(userData.address) ? userData.address : null,
                    formZipcode : !CommonUtil.isEmpty(userData.zipcode) ? userData.zipcode : null,
                    formLatitude : !CommonUtil.isEmpty(userData.latitude) ? userData.latitude : null,
                    formLongitude : !CommonUtil.isEmpty(userData.longitude) ? userData.longitude : null,
                    formTel : !CommonUtil.isEmpty(userData.telephone) ? CommonFunction.fn_dataDecode(userData.telephone) : null,
                    formBusinessCode : !CommonUtil.isEmpty(userData.business_code) ? userData.business_code : null,
                    areaCode : areaData
                })
            }
        }catch(e){
            this.setState({loading:false})
        }
    }
  
    async UNSAFE_componentWillMount() {        
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
        if ( CommonUtil.isEmpty(this.state.formCeoName)) {
            CommonFunction.fn_call_toast('아이디를 입력해주세요',2000);
            return false;
        }else if ( CommonUtil.isEmpty(this.state.formAddress)) {
            CommonFunction.fn_call_toast('주소를 입력해주세요',2000);
            return false;
        }else if ( CommonUtil.isEmpty(this.state.formLatitude)) {
            CommonFunction.fn_call_toast('정확한 주소를 입력해주세요',2000);
            return false;
        }else if ( CommonUtil.isEmpty(this.state.formTel)) {
            CommonFunction.fn_call_toast('전화번호를 입력해주세요',2000);
            return false;
        }else if ( CommonUtil.isEmpty(this.state.formBusinessCode)) {
            CommonFunction.fn_call_toast('사업자등록번호를 입력해주세요',2000);
            return false;
        }else{
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
    }

    actionUpdate = async() => {
        this.setState({moreLoading:true})
        const photoarray = this.state.photoarray;
        let imageurl = this.state.thumbnail_img;
        if (!CommonUtil.isEmpty(photoarray) && this.state.isNewImage) {
            imageurl =  await this.awsimageupload(photoarray);            
        }
        if ( this.state.isNewImage && CommonUtil.isEmpty(imageurl) ) {
            return;
        }else{
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
                    profile : !CommonUtil.isEmpty(imageurl) ? imageurl : '',
                    zipcode : this.state.formZipcode,
                    latitude : this.state.formLatitude,
                    longitude : this.state.formLongitude
                });
                if ( returnCode.code === '0000') {
                    this.setState({moreLoading:false,contentData: returnCode.data})
                    CommonFunction.fn_call_toast('정상적으로 수정되었습니다.',2000)
                    return false;
                }else{
                    CommonFunction.fn_call_toast('업데이트에 실패하였습니다',2000);
                    this.setState({moreLoading:false})
                    return false;
                }                
            }catch(e){
                CommonFunction.fn_call_toast('업데이트에 실패하였습니다',2000);
                this.setState({moreLoading:false})
            }
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
        }).then((response) => {
            try {
                if( response.mime.indexOf('image') != -1) {
                    if (response.path) {
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
                CommonFunction.fn_call_toast('오류가 발생하였습니다. 다시 시도해주세요')
                return;
            }
        }).catch((e) => {
            CommonFunction.fn_call_toast('이미지 선택을 취소하였습니다.',2000)
        });
    }
    awsimageupload = async(item) => {        
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
                this.setState({newimageUrl : newfilename});
                return newfilename;
            }
            
        } catch (error) {
            //  실패
            console.log('error',error)
            CommonFunction.fn_call_toast('이미지 업로드중 오류가 발생하였습니다. 잠시후 다시 이용해주세요',2000);
            this.setState({loading:false})
            return null;
        }
    }

    animatedHeight = new Animated.Value(SCREEN_HEIGHT * 0.6);
    closeModalDaum = () => {
        this.setState({ showModalDaum: false });      
    }

    showModalDaum = () => {
        this.setState({showModalDaum: true})
    }
    
    setAddress = (data) => {
        this.setState({
            formZipcode : data.zonecode,
            formAddress : data.address,
            formLatitude : null,
            formLongitude : null
        });
        if ( !CommonUtil.isEmpty(data.address)) {
            this.convertAddressToLoaction(data.address)
        }else{
            CommonFunction.fn_call_toast('정확한 주소를 입력해주세요!',2000);
            return false;
        }
        this.closeModalDaum();
    }

    convertAddressToLoaction = async( address = null) => {        
        let toastMessage = "";
        this.setState({moreLoading:true})
        await CommonUtil.callAPI( 'http://dapi.kakao.com/v2/local/search/address.json?query=' +  address,{
            method: 'GET', 
            headers: new Headers({
                Accept: 'application/json',                
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': 'KakaoAK 05dceba30de39d5c09de4c4160b8b94a'
            }), 
                body:null
        },10000).then(response => {
            if ( CommonUtil.isEmpty(response.documents[0].address.x) || CommonUtil.isEmpty(response.documents[0].address.y) ){
                toastMessage = '정확한 주소를 다시 입력해주세요';
                CommonFunction.fn_call_toast(toastMessage,2000);
                this.setState({moreLoading:false})
            }else if ( !CommonUtil.isEmpty(response.documents[0].address.x) && !CommonUtil.isEmpty(response.documents[0].address.y) ){
                this.setState({
                    formLatitude : parseFloat(response.documents[0].address.y),
                    formLongitude : parseFloat(response.documents[0].address.x),
                    moreLoading:false                   
                })
            }else{
                toastMessage = response.message;
                CommonFunction.fn_call_toast(toastMessage,2000);
                this.setState({moreLoading:false})
            }
        })
        .catch(err => {            
            toastMessage = '정확한 주소를 다시 입력해주세요2';
            CommonFunction.fn_call_toast(toastMessage,2000);
            setTimeout(() => {
                this.setState({moreLoading:false})
            }, 2000)
        });
        
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
                    <KeyboardAvoidingView style={{paddingVertical:10}} behavior={Platform.OS === 'ios' ? "padding" : 'height'}  enabled> 
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
                                <Image source={SETUP_ICON_IMAGE} resizeMode={'contain'} style={{width:CommonUtil.dpToSize(30),height:CommonUtil.dpToSize(30)}} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <View style={styles.commonFlex}>
                        <View style={styles.middleTitleWarp}>
                            <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor777]}>아이디</CustomTextR>
                        </View>
                        <View style={styles.middleDataWarp2}>
                            <CustomTextR style={[CommonStyle.textSize15,CommonStyle.fontColor999]}>{this.state.formUserID}</CustomTextR>
                        </View>
                        <View style={styles.middleTitleWarp}>
                            <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor777]}>사업자명</CustomTextR>
                        </View>
                        <View style={styles.middleDataWarp2}>
                            <CustomTextR style={[CommonStyle.textSize15,CommonStyle.fontColor999]}>{this.state.formBusinessName}</CustomTextR>
                        </View> 
                        <View style={styles.middleTitleWarp}>
                            <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor777]}>대표자 이름</CustomTextR>
                        </View>
                        <View style={styles.middleDataWarp}>
                            <View style={{flex:1,paddingLeft:10}}>
                                <CustomTextR style={[CommonStyle.textSize15,CommonStyle.fontColor999]}>{this.state.formCeoName}</CustomTextR>
                            </View>
                                {/*
                                <Input                                   
                                    value={this.state.formCeoName}
                                    placeholder="대표자 이름을 입력하세요"
                                    placeholderTextColor={DEFAULT_COLOR.base_color_999}                            
                                    inputContainerStyle={styles.inputContainerStyle}
                                    inputStyle={styles.inputStyle}
                                    clearButtonMode={'always'}
                                    onChangeText={value => this.setState({formCeoName:value})}
                                />
                                */}
                        </View>  
                        {/*
                        <View style={styles.middleTitleWarp}>
                            <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor777]}>지역구</CustomTextR>
                        </View>
                        <View style={[styles.middleDataWarp,{marginBottom:15}]}>
                            <View style={{flex:1,justifyContent: 'center',alignItems: 'center',borderBottomColor:'#999',borderBottomWidth:1,marginHorizontal:10}}>
                                <DropBoxIcon />
                                <SelectType
                                    isSelectSingle
                                    style={{borderWidth:0}}
                                    selectedTitleStyle={{
                                        color: DEFAULT_COLOR.base_color_666,
                                        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize17),
                                        lineHeight: DEFAULT_TEXT.fontSize14 * 1.42,
                                    }}
                                    colorTheme={DEFAULT_COLOR.base_color_666}
                                    popupTitle="지역구선택"
                                    title={'지역구선택'}
                                    showSearchBox={false}
                                    cancelButtonText="취소"
                                    selectButtonText="선택"
                                    data={this.state.areaCode}
                                    onSelect={data => {
                                        this.selectFilter(data)
                                    }}
                                    onRemoveItem={data => {
                                        this.state.areaCode[0].checked = true;
                                    }}
                                    initHeight={SCREEN_HEIGHT * 0.7}
                                />
                            </View>
                        </View> 
                        */}
                        <View style={[styles.middleTitleWarp,{flexDirection:'row',marginTop:20}]}>
                            <View style={{flex:1}}>
                                <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor777]}>주소</CustomTextR>
                            </View>
                            <View style={{flex:5,alignItems:'flex-end'}}>
                                {/* CommonUtil.isEmpty(this.state.formLatitude)
                                ?
                                <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColorRed]}>정확한 주소를 선택하여 입력해주세요</CustomTextR>
                                :
                                <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColorRed]}>정상적인 주소입니다.</CustomTextR>
                                */}
                            </View>
                        </View>
                        
                        <View style={styles.middleDataWarp}>
                            <View style={{flex:1,paddingLeft:10,marginBottom:10}}>
                            <CustomTextR style={[CommonStyle.textSize15,CommonStyle.fontColor999]}>{this.state.formAddress}</CustomTextR>
                            </View>

                            {/*
                            <TouchableOpacity 
                                style={{flex:1,paddingHorizontal:10,paddingVertical:15}} 
                                onPress={()=>this.showModalDaum()}>                           
                                <CustomTextR style={[CommonStyle.textSize12,CommonStyle.base_color_666]}>
                                    {CommonUtil.isEmpty(this.state.formAddress) ? '클릭하여 주소를 입력해주세요' : this.state.formAddress}
                                </CustomTextR>
                            </TouchableOpacity>
                            */}
                        </View>   
                       
                        {/*
                        <View style={styles.middleTitleWarp}>
                            <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColorccc]}>주소</CustomTextR>
                        </View>
                        <View style={[styles.middleDataWarp,{flexDirection:'row'}]}>
                            <View style={{flex:5}}>
                                <Input
                                    disabled={true}
                                    value={this.state.formAddress}
                                    placeholder="주소를 입력하세요"
                                    placeholderTextColor={DEFAULT_COLOR.base_color_999}                            
                                    inputContainerStyle={styles.inputContainerStyle}
                                    inputStyle={styles.inputStyle}
                                    clearButtonMode={'always'}
                                    onChangeText={value => this.setState({formAddress:value})}
                                />
                            </View>
                            <TouchableOpacity 
                                onPress={()=>this.showModalDaum()}
                                style={{flex:1,height:40,backgroundColor:'#808080',paddingHorizontal:5,marginRight:10,justifyContent:'center',alignItems:'center',borderRadius:5}}
                            >
                                <CustomTextM style={{fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize13),color:'#fff'}}>주소검색</CustomTextM>
                            </TouchableOpacity>
                        </View>   
                        {CommonUtil.isEmpty(this.state.formLatitude) ?
                        <View style={{flex:1,justifyContent:'center',paddingHorizontal:10,top:-20}}>
                            <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColorRed]}>정상적인 주소를 입력해 주세요.</CustomTextR>
                        </View>
                        :
                        <View style={{flex:1,justifyContent:'center',paddingHorizontal:10,top:-20}}>
                            <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColorRed]}>정상적인 주소입니다.</CustomTextR>
                        </View>
                        }
                        */}
                        <View style={styles.middleTitleWarp}>
                            <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor777]}>전화번호</CustomTextR>
                        </View>
                        <View style={styles.middleDataWarp}>
                            <View style={{flex:1,paddingLeft:10,marginBottom:10}}>
                                <CustomTextR style={[CommonStyle.textSize15,CommonStyle.fontColor999]}>{this.state.formTel}</CustomTextR>
                                {/*
                                <Input      
                                    keyboardType={'number-pad'}                               
                                    value={this.state.formTel}
                                    placeholder="전화번호를 입력하세요"
                                    placeholderTextColor={DEFAULT_COLOR.base_color_999}                            
                                    inputContainerStyle={styles.inputContainerStyle}
                                    inputStyle={styles.inputStyle}
                                    clearButtonMode={'always'}
                                    onChangeText={value => this.setState({m:value})}
                                />
                                */}
                            </View>
                        </View>   
                        <View style={styles.middleTitleWarp}>
                            <CustomTextR style={[CommonStyle.textSize12,CommonStyle.fontColor777]}>사업자 등록번호</CustomTextR>
                        </View>
                        <View style={styles.middleDataWarp}>
                            <View style={{flex:1,paddingLeft:10,marginBottom:10}}>
                                <CustomTextR style={[CommonStyle.textSize15,CommonStyle.fontColor999]}>{this.state.formBusinessCode}</CustomTextR>
                                {/*
                                <Input             
                                    keyboardType={'number-pad'}                      
                                    value={this.state.formBusinessCode}
                                    placeholder="사업자 등록번호를 입력하세요"
                                    placeholderTextColor={DEFAULT_COLOR.base_color_999}                            
                                    inputContainerStyle={styles.inputContainerStyle}
                                    inputStyle={styles.inputStyle}
                                    clearButtonMode={'always'}
                                    onChangeText={value => this.setState({formBusinessCode:value})}
                                />
                                */}
                            </View>
                        </View> 
                    </View>
                    {
                        this.state.userData.join_type === 'Z' &&
                        <View style={styles.commonFlex2}>
                            <TouchableOpacity style={styles.middleTitleWarp} onPress={()=>this.props.navigation.navigate('MyPWModifyStack')}>
                                <CustomTextB style={[CommonStyle.textSize13,CommonStyle.fontColorBase]}>비밀번호 변경</CustomTextB>
                            </TouchableOpacity>
                        </View>
                    }
                    <View style={styles.bottomButtonWarp}>
                        <TouchableOpacity 
                            onPress={()=>this.setupUpdateData()}
                            style={styles.buttonWrapOn }
                        >
                            <CustomTextM style={[CommonStyle.textSize17,CommonStyle.fontColorWhite]}>설정완료</CustomTextM>
                        </TouchableOpacity>
                    </View>  
                    <View style={CommonStyle.blankArea}></View>
                    { 
                        this.state.moreLoading &&
                        <View style={CommonStyle.moreWrap}>
                            <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} />
                        </View>
                    }
                    </ScrollView>
                    <Modal
                        onBackdropPress={this.closeModalDaum}
                        style={{justifyContent: 'flex-end',margin: 0}}
                        useNativeDriver={true}
                        animationInTiming={300}
                        animationOutTiming={300}
                        hideModalContentWhileAnimating
                        isVisible={this.state.showModalDaum}>
                        <Animated.View style={[styles.modalContainer,{ height: this.animatedHeight }]}>
                            <View style={styles.postcodeWrapper}>
                                <CustomTextR style={styles.requestTitleText2}>
                                    우편번호 찾기
                                </CustomTextR>
                                <TouchableOpacity 
                                    onPress= {()=> this.closeModalDaum()}
                                    style={{position:'absolute',top:0,right:15,width:30,height:30}}>
                                    <Icon name="close" size={30} color="#555" />
                                </TouchableOpacity>
                            </View>
                            <View style={{flex:1}}>
                                <DaumPostcode                                 
                                    jsOptions={{ animated: true }}
                                    onSelected={(data) => this.setAddress(data)}
                                />
                            </View>
                        </Animated.View>
                    </Modal> 
                       
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
    inputContainerStyle : {
        
    },
    inputStyle : {
        
    },
    middleBottomWarp : {
        flex:1,
        justifyContent:'center',
        marginHorizontal:10,marginBottom:15,borderBottomColor:DEFAULT_COLOR.base_color_666,borderBottomWidth:1
    },
    /**** Modal  *******/
    modalContainer: {   
        zIndex : 10,     
        position :'absolute',
        left:0,
        //top : BASE_HEIGHY,
        width:SCREEN_WIDTH,
        height: SCREEN_HEIGHT-200,
        paddingTop: 16,
        backgroundColor: '#fff'
    },
    postcodeWrapper : {
        paddingTop:5,paddingBottom:10,alignItems:'center',justifyContent:'center',borderBottomColor:'#ccc',borderBottomWidth:1
    },
    inputBlank : {
        borderWidth:1,borderColor:DEFAULT_COLOR.input_border_color,borderRadius:5
    },
    inputDisable : {
        borderWidth:1,borderColor:'#fff',borderRadius:5,backgroundColor:'#f7f7f7'
    },
    inputAble : {
        borderWidth:1,borderColor:'#fff',borderRadius:5,backgroundColor:DEFAULT_COLOR.input_bg_color
    },
    inputHelpText : {color: '#28a5ce', fontSize: PixelRatio.roundToNearestPixel(10), fontWeight: '500', letterSpacing: -0.5}
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


export default connect(mapStateToProps,mapDispatchToProps)(UserAgentDetailScreen);