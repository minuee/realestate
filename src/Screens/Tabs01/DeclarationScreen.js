import React, { Component,useCallback, useState } from 'react';
import {SafeAreaView,ScrollView,TextInput,KeyboardAvoidingView, Platform, TouchableOpacity, View,StyleSheet,Image,Dimensions,PixelRatio,BackHandler,ImageBackground,Animated} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import 'moment/locale/ko'
import  moment  from  "moment";
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import SelectBox from 'react-native-multi-selectbox';
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
const ICON_CLIP = require('../../../assets/icons/icon_clip.png');
const ICON_ADD_IMAGE = require('../../../assets/icons/btn_add_img.png');
const ICON_DEL_IMAGE = require('../../../assets/icons/btn_del_img.png');
const reasons  = [
    {id:1,item:'욕설/비방'},
    {id:2,item:'음란성(불법촬영물)'},
    {id:3,item:'사진도용'},
    {id:4,item:'허위정보'},
    {id:5,item:'기타'}
]
export default  class DeclarationScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading : false,
            formTitle : null,
            formContents : null,
            attachFileSize : 0,
            arrayImageUpload : false,
            photoarray: [],
            selectedData : ''
        }
    }
    resetForm = () => {
        this.setState({
            loading : false,
            formTitle : null,
            formContents : null,
        })
    }
 
    async UNSAFE_componentWillMount() {
        this.props.navigation.addListener('focus', () => {  
            this.resetForm();              
        })
        this.props.navigation.addListener('blur', () => {
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
    
    setupSearchCondition = async() => {
    }
    
    removeAttachImage = async(idx) => {
        let selectedFilterList = await this.state.photoarray.filter((info,index) => index !== idx);
        this.setState({
            photoarray: selectedFilterList,
            attachFileSize: this.state.attachFileSize - this.state.photoarray[idx].fileSize,
        })
    }

    localcheckfile = () => {
        const options = {
            noData: true,
            title : '이미지 선택',
            takePhotoButtonTitle : '카메라 찍기',
            chooseFromLibraryButtonTitle:'이미지 선택',
            cancelButtonTitle : '취소',
            maxWidth: 1024,
            maxHeight: 1024,
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
                                let spotCount = response.path.split('.').length-1;
                                let pathExplode = response.path.split('.') 
                                fileName = Platform.OS + moment().unix() + '.'+pathExplode[spotCount];
                            }
                            this.state.photoarray.push({
                                type : response.type === undefined ? 'image/jpeg' :  response.type,
                                uri : response.uri, 
                                size:response.fileSize,
                                name:fileName
                            });
                            this.setState({
                                attachFileSize :  this.state.attachFileSize+response.fileSize
                            })
                            this.ScrollView2.scrollToEnd({ animated: true});
                           
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

    renderImageUpload (){
        return (
            <View style={{flex:1,flexGrow:1,flexDirection:'row'}}>
                {
                    this.state.photoarray.map((data, index) => {
                    return (                
                        <View style={styles.imageOuterWrap} key={index}>
                            <TouchableOpacity 
                                onPress={() => this.removeAttachImage(index)}
                                style={styles.imageDataWarp}
                            >
                                <Image
                                    source={ICON_DEL_IMAGE}
                                    resizeMode='contain'
                                    style={{ width: 24, height: 24 }}
                                />
                            </TouchableOpacity>
                            <Image
                                source={{ uri: data.uri }}
                                resizeMode='cover'
                                style={{ width: "100%", height: '100%' }}
                            />                        
                        </View>
                    )}
                    )
                }
                {
                    this.state.photoarray.length < 4 &&
                    <TouchableOpacity 
                        onPress={() => this.localcheckfile()}
                        style={styles.imageOuterWrap2}>
                        <Image
                            source={ICON_ADD_IMAGE}
                            resizeMode='contain'
                            style={{width:'100%',height:'100%'}}
                        />
                    </TouchableOpacity>
                }
            </View>
        )
    }

    onChangeFrom =  async(val) =>{
        this.setState({selectedData:val})
    }

    render() {
        if ( this.state.loading ) {
            return (
                <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} />
            )
        }else {
            return(
                <SafeAreaView style={ styles.container }>
                    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? "padding" : 'height'}  enabled> 
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        indicatorStyle={'white'}
                    >
                    <View style={{marginHorizontal:20,paddingVertical:10,borderBottomColor:'#ccc',borderBottomWidth:1,marginVertical:10,flexDirection:'row'}}>
                        <CustomTextR style={[CommonStyle.textSize13,CommonStyle.fontColor000]}>신고대상</CustomTextR>
                        <View style={{flex:1,justifyContent:'center',paddingLeft:20}} >
                        <CustomTextR style={CommonStyle.titleText}>닉네임</CustomTextR>
                        </View>
                    </View> 
                    <View style={{marginHorizontal:20,paddingBottom:10,borderBottomColor:'#ccc',borderBottomWidth:1,marginVertical:10,flexDirection:'row'}}>
                        <CustomTextR style={CommonStyle.titleText}>신고사유</CustomTextR>
                        <View style={{flex:1,alignItems:'center',paddingLeft:20}} >
                            <SelectBox
                                label=""
                                labelStyle={{height:0}}
                                options={reasons}
                                value={this.state.selectedData}
                                onChange={(val) => this.onChangeFrom(val)}
                                hideInputFilter={true}
                                containerStyle={{top:-5,borderColor:'#fff'}}
                                inputPlaceholder={"신고사유"}
                                arrowIconColor={"#ccc"}
                                selectedItemStyle={[CommonStyle.textSize30,CommonStyle.fontColor000]}
                            />
                        </View>
                    </View>
                    <View style={{paddingHorizontal:20}}>
                        <CustomTextR style={[CommonStyle.textSize10,CommonStyle.fontColorRed]}>*허위신고시 이용중지 및 회원탈퇴 처리되니 신중하게 신고부탁드립니다.</CustomTextR>
                        <TextInput         
                            placeholder={'신고내용을 입력해주세요'}
                            placeholderTextColor={DEFAULT_COLOR.base_color_666}                           
                            style={[styles.inputBlank2,styles.textInputStyle]}
                            value={this.state.formContents}
                            onChangeText={text=>this.setState({formContents:text})}
                            multiline={true}
                            clearButtonMode='always'
                        />
                    </View>
                    <View style={{paddingHorizontal:20,flexDirection:'row',flexGrow:1,alignItems:'center'}}>
                        <Image source={ICON_CLIP} style={CommonStyle.defaultIconImage20} />
                        <CustomTextR style={CommonStyle.titleText}>사진첨부파일(최대4개)</CustomTextR>
                    </View>
                    <View style={{marginHorizontal:15,paddingVertical:10,marginTop:5}}>
                        <ScrollView 
                            horizontal={true}
                            ref={(ref) => {
                                this.ScrollView2 = ref;
                            }}
                            nestedScrollEnabled={true}
                        >
                            {this.renderImageUpload()}
                        </ScrollView>
                        <View style={{flexGrow:1,flexDirection:'row',marginTop:20, marginBottom:15}}>
                            <View style={{justifyContent:'center',width: (SCREEN_WIDTH - 16 - 8) / 4 * 3}}>
                                <View style={{height:3,width:'100%',backgroundColor:DEFAULT_COLOR.input_bg_color}}>
                                    <View 
                                        style={{height:3,width:(this.state.attachFileSize > 0 ? parseInt(this.state.attachFileSize/1024/1024):0) / 50 * 100 + '%',backgroundColor: DEFAULT_COLOR.input_border_color}}
                                    >
                                    </View>
                                </View>
                            </View>
                            <View style={{flexDirection: 'row',justifyContent:'center',paddingRight: 8, width: (SCREEN_WIDTH - 30) / 4 * 1,
                            }}>
                                <CustomTextM style={styles.imageText}>
                                    {this.state.attachFileSize > 0 ? (this.state.attachFileSize/1024/1024).toFixed(1) : 0}/
                                </CustomTextM>
                                <CustomTextM style={styles.imageText}>50MB</CustomTextM>
                            </View>
                        </View>
                    </View>                     
                    { 
                        this.state.moreLoading &&
                        <View style={CommonStyle.moreWrap}>
                            <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} />
                        </View>
                    }
                    </ScrollView>
                    <TouchableOpacity style={styles.middleDataWarp2}>
                        <TouchableOpacity onPress={()=>this.setupSearchCondition()} style={styles.buttonWrapOff}>
                            <CustomTextM style={[CommonStyle.textSize17,CommonStyle.fontColorWhite]}>신고하기</CustomTextM>
                        </TouchableOpacity>
                    </TouchableOpacity>     
                </KeyboardAvoidingView>               
                </SafeAreaView>
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
    
    textInputStyle : {
        minHeight:200,maxHeight:SCREEN_HEIGHT*0.6,width:'100%',paddingTop: 5,paddingBottom: 5,paddingLeft: 5,paddingRight: 5,textAlignVertical: 'top',textAlign:'left',fontSize: PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize13),marginTop:10
    },
    middleDataWarp2 : {
        height:120,
        justifyContent:'center',
        paddingTop:10,paddingBottom:20,paddingHorizontal:20
    },
    buttonWrapOn : {
        backgroundColor:DEFAULT_COLOR.base_color,padding:10,justifyContent:'center',alignItems:'center',borderRadius:25
    },
    buttonWrapOff : {
        backgroundColor:DEFAULT_COLOR.base_color_ccc,padding:10,justifyContent:'center',alignItems:'center',borderRadius:25
    },
    inputBlank : {
        borderBottomWidth:1,borderBottomColor:DEFAULT_COLOR.input_border_color,borderRadius:5,backgroundColor:'#fff'
    },
    inputBlank2 : {
        borderWidth:0,borderBottomColor:DEFAULT_COLOR.input_border_color,borderRadius:5,backgroundColor:'#fff'
    },
    cellDefaultWrap : {
        paddingHorizontal:5,flexDirection:'row'
    },
    cellDefaultWrap5 : {
        paddingHorizontal:5,flexDirection:'row',marginTop:5
    },
    cellDefaultWrap15 : {
        paddingHorizontal:5,flexDirection:'row',marginTop:15
    },
    cellDefaultRowWrap :{
        paddingHorizontal:5,paddingVertical:10,marginTop:15,flexDirection:'row'
    },
    imageOuterWrap : {
        flex: 1,width: (SCREEN_WIDTH) / 4 - 8,height: (SCREEN_WIDTH - 16 - 8) / 4 - 8,justifyContent: 'flex-end',alignItems: 'flex-end', marginRight: 8,borderWidth: 1,borderColor: '#ccc',overflow: 'hidden',
    },
    imageOuterWrap2 : {
        flex: 1,width: (SCREEN_WIDTH) / 4 - 8,height: (SCREEN_WIDTH - 16 - 8) / 4 - 8,justifyContent: 'flex-end',alignItems: 'flex-end'
    },
    imageDataWarp : {position: 'absolute',width: 24,height: 24,zIndex: 2,borderColor: '#ccc',backgroundColor: 'transparent'
    },
    imageText : {
        color:DEFAULT_COLOR.base_color_666,fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.body_12),lineHeight: DEFAULT_TEXT.body_12 * 1.42
    },
    CheckBoxWrap : {
        flex:1,flexDirection:'row',alignItems:'center'
    },
});