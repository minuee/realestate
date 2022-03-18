import React, { Component } from 'react';
import {ScrollView,View,StyleSheet,Dimensions,PixelRatio,BackHandler} from 'react-native';

//공통상수 필요에 의해서 사용
import  * as getDEFAULT_CONSTANTS   from '../../Constants';
import CommonStyle from '../../Style/CommonStyle';
const DEFAULT_CONSTANTS = getDEFAULT_CONSTANTS.DEFAULT_CONSTANTS;
const DEFAULT_TEXT = getDEFAULT_CONSTANTS.DEFAULT_TEXT;
const DEFAULT_COLOR = getDEFAULT_CONSTANTS.DEFAULT_COLOR;
const {height: SCREEN_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('window');
import {CustomTextR,CustomTextL, CustomTextB, CustomTextM, TextRobotoM,TextRobotoR} from '../../Components/CustomText';
import Loader from '../../Utils/LoaderSimple';

import HTMLConvert from '../../Utils/HtmlConvert/HTMLConvert';
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

import { apiObject } from "../../Apis/index";

export default class PrivateYakwanScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading : true,
            contents : '<p>loading...</p>'
        }
    }

    getInformation = async () => {
        let returnCode = {code:9998};
        try {
            returnCode = await apiObject.API_getYakwanData({
                locale: "ko", roomIdx : 1
            }); 
            //console.log('returnCode',returnCode.data);
            if ( returnCode.code === '0000') {
                this.setState({
                    contents :returnCode.data.private_stipulation,loading:false
                })
                
            }
        }catch(e){
            //console.log('returnCode error1',e)
            this.setState({loading:false})
        }
        
    }

    async UNSAFE_componentWillMount() {
        await this.getInformation();

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

    render() {
        if ( this.state.loading ) {
            return (
                <Loader screenState={{isLoading:this.state.loading,color:DEFAULT_COLOR.base_color}} /> 
            )
        }else {        
            return(
                <View style={ styles.container }>
                    
                    <View style={{backgroundColor:'#fff',height:20}} />                        
                        <View style={{marginVertical:15,marginHorizontal:15,borderWidth:1,borderColor:'#ccc',height:SCREEN_HEIGHT*0.8}}>
                            <ScrollView
                                ref={(ref) => {
                                    this.ScrollView = ref;
                                }}
                                showsVerticalScrollIndicator={false}
                                indicatorStyle={'white'}
                                scrollEventThrottle={16}
                                keyboardDismissMode={'on-drag'}
                                style={{width:'100%'}}
                            >
                            <View style={{alignItems:'flex-start',minHeight:SCREEN_HEIGHT*0.2,padding:10}}>
                                <HTMLConvert 
                                    {...DEFAULT_PROPS}
                                    html={this.state.contents || '<p>loading...</p>'}
                                />
                            </View>
                            <View style={CommonStyle.blankArea}></View>
                            </ScrollView>
                        </View>
                   
                </View>
            );
        }
    }
}



const styles = StyleSheet.create({
    container: {  
        flex:1,            
        backgroundColor : "#fff",
    },
    IndicatorContainer : {
        flex: 1,
        width:'100%',
        backgroundColor : "#fff",
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    
});
