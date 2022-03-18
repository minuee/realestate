import React, { Component } from 'react';
import {SafeAreaView,Alert,View,StyleSheet,Text,Dimensions,PixelRatio,Image,TextInput, TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import { Rating} from 'react-native-elements';
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
import { apiObject } from "../../Apis/Member";

 class PopLayerVote extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : true,
            memberIdx : 0,//this.props.userToken.memberidx,
            score01 : 0,
            rating_pk : 0,
            targetIdx : 0 
        }
    }

   
    async UNSAFE_componentWillMount() {
        const { agentData  } = this.props.screenState;  
        this.setState({
            rating_pk : agentData.rating_pk,
            score01 : agentData.my_star_point,
            targetIdx : agentData.estate_agent_pk,
        })
       
    }
    componentDidMount() {
        
        setTimeout(() => {
            this.setState({loading:false})
        }, 500);
    }

    
    ratingCompleted = (rating) =>  {  
        //console.log('rating',rating)      
        this.setState({score01:rating});
    }
    
    registPoint = async(score01) => {
        if ( score01 > 0 ) { 
            Alert.alert(
                DEFAULT_CONSTANTS.appName,      
                "별점을 등록하시겠습니까?",
                [
                    {text: '네', onPress: () => this. actionRegistPoint()},
                    {text: '아니오', onPress: () => console.log('Cancle')},  
                ],
                { cancelable: true }
            ) 
        }else{
            Alert.alert(
                DEFAULT_CONSTANTS.appName,      
                "별점을 평가해주세요",
                [
                    {text: '네', onPress: () => console.log('Cancle')},  
                ],
                { cancelable: true }
            ) 
        }

    }

    actionRegistPoint = async() => {
        this.setState({moreLoading:true})
        let returnCode = {code:9998};
        const member_pk = CommonUtil.isEmpty(this.props.userToken) ? {member_pk:null} : this.props.userToken.member_pk;
        try {
            returnCode = await apiObject.API_AgentVotePoint({
                locale: "ko",
                target_pk : this.state.targetIdx,
                star_point : this.state.score01
            }); 
            //console.log('returnCode',returnCode);
            if ( returnCode.code === '0000') {
                this.setState({moreLoading:false})
                CommonFunction.fn_call_toast('이용해주셔서 감사합니다.',1500)
                setTimeout(() => {
                    this.props.screenState.closePopLayer(true)
                }, 1500);
                
            }else{
                CommonFunction.fn_call_toast('일시적으로 오류가 발생하였습니다.',2000)
                this.setState({moreLoading:false})
            }
        }catch(e){
            //console.log('returnCode error1',e);
            CommonFunction.fn_call_toast('일시적으로 오류가 발생하였습니다.',2000)
            this.setState({moreLoading:false})
        }
    }

    render() {
        return(
            <View style={ styles.container }>
                <View style={{flex:1, margin:10}}>
                    <View style={{paddingVertical:5,justifyContent:'center',alignItems:'center'}}>
                        <CustomTextB style={[CommonStyle.textSize16,CommonStyle.fontColor000]}>별점주기</CustomTextB>
                    </View>
                    <View style={{paddingVertical:5,justifyContent:'center',alignItems:'center'}}>
                        {this.state.rating_pk > 0 ?
                        <CustomTextM style={{fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15),color:'#494949'}}>아래처럼 별점을 주셨습니다.</CustomTextM>
                        :
                        <CustomTextM style={{fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15),color:'#494949'}}>별표를 탭하여 평가해주세요.</CustomTextM>
                        }
                    </View>
                </View>   
                <View style={{flex:2,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                    
                    <Rating
                        //type={'custom'}
                        fractions={1}
                        imageSize={CommonUtil.dpToSize(30)}                            
                        startingValue={this.state.score01}
                        showRating={this.state.rating_pk > 0 ? false : true}
                        onFinishRating={this.ratingCompleted}
                        readonly={this.state.rating_pk > 0 ? true : false}
                        //tintColor={DEFAULT_COLOR.base_color}
                        //ratingBackgroundColor={DEFAULT_COLOR.base_color}
                        //ratingColor={DEFAULT_COLOR.base_color}
                        //ratingTextColor={DEFAULT_COLOR.base_color}
                    />
                    {this.state.rating_pk > 0 &&
                        <View style={{paddingLeft:10}}>
                            <TextRobotoR style={[CommonStyle.textSize16,CommonStyle.fontColor000]}>({this.state.score01.toFixed(1)})</TextRobotoR>
                        </View>
                    }
                    
                </View>
                {this.state.rating_pk > 0 ? 
                <View style={styles.bottomWrap}>
                    <TouchableOpacity                                     
                        onPress={()=> this.props.screenState.closePopLayer(null)}
                        hitSlop={{left:10,right:5,top:10,bottom:10}}                       
                        style={styles.bottomDataWrap}
                    >
                        <CustomTextB style={[CommonStyle.textSize16,CommonStyle.fontColor000]}>확인</CustomTextB>
                    </TouchableOpacity>
                </View>
                :
                <View style={styles.bottomWrap}>
                    <TouchableOpacity                                     
                        onPress={()=> this.registPoint(this.state.score01)}
                        hitSlop={{left:10,right:5,top:10,bottom:10}}                       
                        style={styles.bottomDataWrap}
                    >
                        <CustomTextB style={[CommonStyle.textSize16,CommonStyle.fontColor000]}>확인</CustomTextB>
                    </TouchableOpacity>
                    <TouchableOpacity                                     
                        onPress={()=> this.props.screenState.closePopLayer(null)}
                        hitSlop={{left:10,right:5,top:10,bottom:10}}
                        style={styles.bottomDataWrap}
                    >
                        <CustomTextB style={[CommonStyle.textSize16,CommonStyle.fontColor999]}>취소</CustomTextB>
                    </TouchableOpacity>

                </View>
                }           
                
                { this.state.moreLoading &&
                    <View style={CommonStyle.moreWrap}>
                        <Loader screenState={{isLoading:this.state.moreLoading,color:DEFAULT_COLOR.base_color}} />
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
        flex:1,flexDirection:'row',paddingVertical:5,justifyContent:'center',alignItems:'center',borderTopWidth:1,borderTopColor:'#ccc'
    },
    bottomDataWrap : {
        flex:1,justifyContent:'center',alignItems:'center'
    }
});



function mapStateToProps(state) {
    return {
        userToken : state.GlabalStatus.userToken
    };
}

export default connect(mapStateToProps, null)(PopLayerVote);