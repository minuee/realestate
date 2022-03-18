import React, { Component,useCallback, useState } from 'react';
import {StatusBar,ScrollView,PermissionsAndroid, Platform, TouchableOpacity, View,StyleSheet,Image,Dimensions,PixelRatio,Text,ImageBackground,Animated,TextInput} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import 'moment/locale/ko'
import  moment  from  "moment";
import {connect} from 'react-redux';
import ActionCreator from '../../Ducks/Actions/MainActions';
import AsyncStorage from '@react-native-community/async-storage';
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

let mockData1 = [];
let mockData2 = [];
const baseYear = 2000;
const currentDate =  moment().format('YYYY');
for ( let i = baseYear ; i <= parseInt(currentDate) ; i++ ) {
    if ( i > baseYear ) {
        mockData2.push({id : i , item : i.toString()  });
    }
    mockData1.push({id : i , item : i.toString()  });
    
}
class SetupYearScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading : false,
            startYears : mockData1,
            endYears : mockData2,
            selectedDataFrom  : null,
            selectedDataTo : null
        }
    }

 
    async UNSAFE_componentWillMount() {
        if ( !CommonUtil.isEmpty(this.props.mapSubCondition.year) ) {            
            let sYear = mockData1.filter((info) =>  info.item === this.props.mapSubCondition.year.sYear);
           
            let eYear = mockData1.filter((info) =>  info.item === this.props.mapSubCondition.year.eYear);   
            console.log('eYear', eYear);        
            this.setState({
                selectedDataFrom : sYear.length > 0 ? sYear[0].item : [],
                selectedDataTo : eYear.length > 0 ? eYear[0].item : [],
            })
        }
    }
    componentDidMount() {
    }


    componentWillUnmount(){
        
    }

  
    onChangeFrom =  async(val) =>{
        //console.log('valll', val);
        //return (val) => this.setState({selectedDataFrom:val,selectedDataTo:''})
        let newmockData2 = [];
        for ( let i = parseInt(val.id+1) ; i <= parseInt(currentDate) ; i++ ) {
            newmockData2.push({id : i , item : i.toString()  });
            
        }
        this.setState({
            selectedDataFrom:val,
            selectedDataTo:'',
            endYears :  newmockData2
        })
    }

    onChangeTo =  async(val) =>{
        console.log('valll', val);
    
        this.setState({
            selectedDataTo:val
        })
    }

    setupSearchCondition = async() => {
        console.log('`111',this.state.selectedDataFrom)
        console.log('`222',this.state.selectedDataTo);

        const selectedDataFrom = this.state.selectedDataFrom;
        const selectedDataTo = this.state.selectedDataTo;
        if ( !CommonUtil.isEmpty(selectedDataFrom) && !CommonUtil.isEmpty(selectedDataTo) ) {     
            if ( CommonFunction.isNumeric(selectedDataFrom) && CommonFunction.isNumeric(selectedDataTo) )  {
                if ( selectedDataFrom > selectedDataTo) {
                    let mapSubCondition = this.props.mapSubCondition;        
                    this.props._setupMapSubCondition({
                        ...mapSubCondition,
                        year : {
                            sYear : selectedDataTo,
                            eYear : selectedDataFrom
                        }
                    })
                    await  AsyncStorage.setItem('mapSubCondition',
                        JSON.stringify({
                        ...mapSubCondition,
                        year : {
                            sYear : selectedDataTo,
                            eYear : selectedDataFrom
                        }
                        })
                    );  
                }else{
                    let mapSubCondition = this.props.mapSubCondition;        
                    this.props._setupMapSubCondition({
                        ...mapSubCondition,
                        year : {
                            sYear : selectedDataFrom,
                            eYear : selectedDataTo
                        }
                    })
                    await  AsyncStorage.setItem('mapSubCondition',
                        JSON.stringify({
                        ...mapSubCondition,
                        year : {
                            sYear : selectedDataFrom,
                            eYear : selectedDataTo
                        }
                        })
                    ); 
                }
                setTimeout(() => {
                    //console.log('mapSubCondition',this.props.mapSubCondition)
                    this.props.navigation.goBack(null);
                }, 1000);
            }else{
                CommonFunction.fn_call_toast('정확한 숫자만 입력해주세요',2000)
            }
        }else{
            CommonFunction.fn_call_toast('연식을 선택해주세요',2000)
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
                    { Platform.OS == 'android' &&  <StatusBar translucent backgroundColor="transparent" />}
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        indicatorStyle={'white'}
                    >
                    
                    <View style={styles.modalDataCoverWrap} >
                        <View style={styles.modalDataWrap} >
                            <View style={{flex:1}} >
                                <TextInput   
                                    maxLength={4}
                                    keyboardType={'number-pad'}
                                    placeholder={'연식입력'}
                                    placeholderTextColor={DEFAULT_COLOR.base_color_666}                           
                                    style={[styles.inputBlank,CommonStyle.defaultOneWayForm]}
                                    value={this.state.selectedDataFrom}
                                    onChangeText={text=>this.setState({selectedDataFrom:text})}
                                    multiline={false}
                                    clearButtonMode='always'
                                />
                            </View>
                            <View style={{flex:0.5,alignItems:'center'}} >
                            <CustomTextR style={[CommonStyle.textSize13,CommonStyle.fontColorccc]}>~</CustomTextR>
                            </View>

                            <View style={{flex:1}} >
                                <TextInput   
                                    maxLength={4}
                                    keyboardType={'number-pad'}
                                    placeholder={'연식입력'}
                                    placeholderTextColor={DEFAULT_COLOR.base_color_666}                           
                                    style={[styles.inputBlank,CommonStyle.defaultOneWayForm]}
                                    value={this.state.selectedDataTo}
                                    onChangeText={text=>this.setState({selectedDataTo:text})}
                                    multiline={false}
                                    clearButtonMode='always'
                                />
                            </View>
                           
                        </View>
                    </View>
                    </ScrollView>
                    <View style={styles.middleDataWarp2}>
                        { (!CommonUtil.isEmpty(this.state.selectedDataFrom) && !CommonUtil.isEmpty(this.state.selectedDataTo) ) ?
                        <TouchableOpacity 
                            onPress={()=>this.setupSearchCondition()}
                            style={styles.buttonWrapOn }
                        >
                            <CustomTextM style={[CommonStyle.textSize17,CommonStyle.fontColorWhite]}>조건저장</CustomTextM>
                        </TouchableOpacity>
                        :
                        <View style={styles.buttonWrapOff }>
                            <CustomTextM style={[CommonStyle.textSize17,CommonStyle.fontColorWhite]}>조건저장</CustomTextM>
                        </View>
                        }
                    </View>                    
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
    /* slider */
    sliderRoot :{    
        alignItems: 'stretch',padding: 5,flex: 1,
    },
    slider : {},
    fixedHeaderWrap : {
        position:'absolute',top:0,left:0,width:SCREEN_WIDTH,
        height:DEFAULT_CONSTANTS.BottomHeight+30,
        //borderBottomColor:'#ccc', borderBottomWidth:1,
        paddingTop:DEFAULT_CONSTANTS.BottomHeight-10,
        justifyContent:'flex-end',paddingHorizontal:20,
        backgroundColor:'transparent',zIndex:9999
    },
    horizontalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal:20
    },
    
    valueText: {width: 50,color: '#000',fontSize: 20,},
    inputBlank : {
        borderWidth:1,borderColor:DEFAULT_COLOR.input_border_color,borderRadius:5
    },

    /**** Modal  *******/
    modalContainer: {   
        zIndex : 10,     
        position :'absolute',
        left:0,
        //top : BASE_HEIGHY,
        width:SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        paddingTop: Platform.OS ==='ios' ? 50 : 10,
        backgroundColor: '#fff'
    },
    modalTitleWrap : {
        paddingHorizontal:20,paddingVertical:15,flexDirection:'row'
    },
    modalLeftWrap : {
        flex:1,justifyContent:'center'
    },
    
    modalRightWrap : {
        flex:1,justifyContent:'center',alignItems:'flex-end'
    },
    modalDataCoverWrap : {
        flex:1,paddingHorizontal:20,paddingVertical:15,
    },
    modalDataTitleWrap : {
        paddingVertical:15
    },
    modalTitleLinkWrap : {
        marginTop:10,paddingVertical:10,flexDirection:'row',borderBottomColor:'#ccc',borderBottomWidth:1
    },
    modalTitleLinkLeft : {flex:5},
    modalTitleLinkRight : {flex:1,alignItems:'flex-end'},
    modalDataWrap : {
        flex:1,paddingVertical:10,flexDirection:'row'
    },

    modalDataEachWrapOn : {
        flex:1,justifyContent:'center',alignItems:'center',marginHorizontal:5,borderColor:DEFAULT_COLOR.base_color,borderWidth:1,borderRadius:20,paddingVertical:5
    },
    modalDataEachWrapOff : {
        flex:1,justifyContent:'center',alignItems:'center',marginHorizontal:5,borderColor:'#ddd',borderWidth:1,borderRadius:20,paddingVertical:5
    },
    checkboxIcon : {
        width : PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize22),height:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize22)
    },
    menuTitleText : {
        fontSize:PixelRatio.roundToNearestPixel(DEFAULT_TEXT.fontSize15)
    },
    bottomWrap : {
        height:60,justifyContent:'center',alignItems:'center',flexDirection:'row'
    },
    bottomDataWrap : {
        width:80,backgroundColor:'#e1e1e1',justifyContent:'center',alignItems:'center',padding:5,marginRight:5
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
        backgroundColor:'#ccc',padding:10,justifyContent:'center',alignItems:'center',borderRadius:25
    },
});

function mapStateToProps(state) {
    return {
        userToken : state.GlabalStatus.userToken,
        mapSubCondition : state.GlabalStatus.mapSubCondition,
    };
}

function mapDispatchToProps(dispatch) {
    return {        
        _saveUserToken:(str)=> {
            dispatch(ActionCreator.saveUserToken(str))
        },
        _setupMapSubCondition:(str)=> {
            dispatch(ActionCreator.setupMapSubCondition(str))
        }
    };
}


export default connect(mapStateToProps,mapDispatchToProps)(SetupYearScreen);