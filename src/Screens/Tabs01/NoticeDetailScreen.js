import React, { Component } from 'react';
import {SafeAreaView,ScrollView,View,StyleSheet,Text,Dimensions,PixelRatio,TouchableOpacity,Animated,Alert,BackHandler} from 'react-native';
import 'moment/locale/ko'
import  moment  from  "moment";
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

//HTML 
import HTMLConvert from '../../Utils/HtmlConvert/HTMLConvert';
const currentDate =  moment().format('YYYY.MM.DD HH:MM');

const CUSTOM_STYLES = {
    fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15),color:'#494949'
};
const CUSTOM_RENDERERS = {};
const IMAGES_MAX_WIDTH = SCREEN_WIDTH - 50;
const DEFAULT_PROPS = {
    htmlStyles: CUSTOM_STYLES,
    renderers: CUSTOM_RENDERERS,
    imagesMaxWidth: IMAGES_MAX_WIDTH,
    onLinkPress: (evt, href) => { Linking.openURL(href); },
    debug: true
};


export default class NoticeDetailScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading : true,
            notice_pk : 0,
            noticeData : {
                title : " 1111",
                content : 'dddd',
                start_dt : 1618967887
            }
        }
    }

    
    async UNSAFE_componentWillMount() {
        
        this.props.navigation.addListener('focus', () => {  
        
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
    
    fn_onChangeToggle = (bool) => {
        this.setState({switchOn1 : bool})
    }

    updateNotice = () => {
        this.props._fn_ToggleNoticeDetail(false)
        this.props.navigation.navigate('NoticeModifyStack',{
            screenData:this.state.noticeData
        })
    }

    deleteNotice = (mode) => {
        Alert.alert(
            "공지사항 삭제",      
            "정말로 삭제하시겠습니까?",
            [
                {text: 'OK', onPress: () => this.removeNotice()},
                {text: 'CANCEL', onPress: () => console.log('Cancle')},
                
            ],
            { cancelable: true }
        )  
    }

    
    render() {
        if ( this.state.loading ) {
            return (
                <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} /> 
            )
        }else {  
            return(
                <SafeAreaView style={styles.container}>
                    <ScrollView
                        ref={(ref) => {
                            this.ScrollView = ref;
                        }}
                        showsVerticalScrollIndicator={false}
                        indicatorStyle={'white'}
                        scrollEventThrottle={16}
                        keyboardDismissMode={'on-drag'}
                        style={{width:'100%',flex:1}}
                    >
                    <View style={styles.defaultWrap2}>
                        <View style={styles.boxWrap}>
                            <CustomTextR style={styles.menuTitleText}>{this.state.noticeData.title}</CustomTextR>
                            <CustomTextL style={styles.menuTitleText2}>
                                {CommonFunction.convertUnixToDate(this.state.noticeData.start_dt,"YYYY.MM.DD H:m")}
                            </CustomTextL>
                        </View>
                    </View>
                    <View style={styles.defaultWrap}>
                        <View style={styles.boxWrap}>
                            <View style={{alignItems:'flex-start',minHeight:SCREEN_HEIGHT*0.2}}>
                                <HTMLConvert 
                                    {...DEFAULT_PROPS}
                                    html={this.state.noticeData.content}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={CommonStyle.blankArea}></View>
                    { this.state.moreLoading &&
                        <View style={CommonStyle.moreWrap}>
                            <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} />
                        </View>
                    }
                    </ScrollView>
                    
                </SafeAreaView>
            );
        }
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        //backgroundColor : "#fff",
    },
    IndicatorContainer : {
        flex: 1,
        width:'100%',
        backgroundColor : "#fff",
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    defaultWrap:{
        flex:1,borderTopWidth:1,borderTopColor:DEFAULT_COLOR.input_border_color,backgroundColor : "#fff",justifyContent:'center'
    },
    defaultWrap2:{
        flex:1,borderBottomWidth:1,borderBottomColor:DEFAULT_COLOR.input_border_color,backgroundColor : "#fff",justifyContent:'center'
    },
    thumbnailWrap : {
        paddingHorizontal:0,marginVertical:20,justifyContent:'center',alignItems:'center',overflow:'hidden'
    },
    menuTitleText : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15),paddingRight:10
    },
    menuTitleText2 : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize13),paddingRight:10,color:'#343434'
    },
    termText4 : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15),paddingRight:10,color:'#343434'
    },
    ballStyle : {
        width: 28,height: 28,borderRadius: 14,backgroundColor:'#fff',
        
    },
    boxWrap : {
        paddingHorizontal:20,paddingVertical:10
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
});

