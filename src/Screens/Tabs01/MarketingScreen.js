import React, { Component } from 'react';
import {ScrollView,View,StyleSheet,Dimensions,PixelRatio,BackHandler} from 'react-native';

//공통상수 필요에 의해서 사용
import  * as getDEFAULT_CONSTANTS   from '../../Constants';
const DEFAULT_CONSTANTS = getDEFAULT_CONSTANTS.DEFAULT_CONSTANTS;
const DEFAULT_TEXT = getDEFAULT_CONSTANTS.DEFAULT_TEXT;
const DEFAULT_COLOR = getDEFAULT_CONSTANTS.DEFAULT_COLOR;
const {height: SCREEN_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('window');
import {CustomTextR,CustomTextL, CustomTextB, CustomTextM, TextRobotoM,TextRobotoR} from '../../Components/CustomText';
import Loader from '../../Utils/Loader';

export default class MarketingScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading : false
        }
    }

    UNSAFE_componentWillMount() {
      
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

    handleBackButton = () => {        
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);  
        this.props.navigation.goBack(null);                
        return true;
    };
   
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
                            
                            <CustomTextR style={{fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize14),color:'#808080'}}>
                            제 1장
착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. {"\n"}착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. {"\n"}착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. 착한부동산 이용약관 내용입니다. {"\n"}
君を忘れない　曲がりくねった道を行く{"\n"}
産まれたての太陽と　夢を渡る黄色い砂{"\n"}
二度と戻れない　くすぐり合って転げた日{"\n"}
きっと　想像した以上に　騒がしい未来が僕を待ってる{"\n"}{"\n"}

"愛してる"の響きだけで　強くなれる気がしたよ{"\n"}
ささやかな喜びを　つぶれるほど抱きしめて{"\n"}{"\n"}

こぼれそうな思い　汚れた手で書き上げた{"\n"}
あの手紙はすぐにでも　捨てて欲しいと言ったのに{"\n"}
少しだけ眠い　冷たい水でこじあけて{"\n"}
今　せかされるように　飛ばされるように　通り過ぎてく{"\n"}{"\n"}

"愛してる"の響きだけで　強くなれる気がしたよ{"\n"}
いつかまた　この場所で　君とめぐり会いたい{"\n"}{"\n"}

どんなに歩いても　たどりつけない　心の雪でぬれた頬{"\n"}
悪魔のふりして　切り裂いた歌を　春の風に舞う花びらに変えて{"\n"}{"\n"}

君を忘れない　曲がりくねった道を行く{"\n"}
きっと　想像した以上に　騒がしい未来が僕を待ってる{"\n"}{"\n"}

"愛してる"の響きだけで　強くなれる気がしたよ{"\n"}
ささやかな喜びをつぶれるほど抱きしめて{"\n"}
ズルしても真面目にも生きてゆける気がしたよ{"\n"}
いつかまた　この場所で　君とめぐり会いたい.
                            </CustomTextR>
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
