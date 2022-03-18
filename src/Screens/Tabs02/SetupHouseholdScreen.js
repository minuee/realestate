import React, { Component,useCallback, useState } from 'react';
import {StatusBar,ScrollView,PermissionsAndroid, Platform, TouchableOpacity, View,StyleSheet,Image,Dimensions,PixelRatio,Text,ImageBackground,Animated} from 'react-native';
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

import Slider from 'rn-range-slider';
import Thumb from '../../Components/Slider/Thumb';
import Rail from '../../Components/Slider/Rail';
import RailSelected from '../../Components/Slider/RailSelected';
import Notch from '../../Components/Slider/Notch';
import Label from '../../Components/Slider/Label';
const SliderScreen = (props) => {
    const dataLow = CommonUtil.isEmpty(props.screenProps.mapSubCondition.tmphousehold) ? 0 : props.screenProps.mapSubCondition.tmphousehold.shousehold;
    const dataHigh = CommonUtil.isEmpty(props.screenProps.mapSubCondition.tmphousehold) ? 5000 : props.screenProps.mapSubCondition.tmphousehold.ehousehold;
    const [low, setLow] = useState(0);
    const [high, setHigh] = useState(5000);
    const renderThumb = useCallback(() => <Thumb/>, []);
    const renderRail = useCallback(() => <Rail/>, []);
    const renderRailSelected = useCallback(() => <RailSelected/>, []);
    const renderLabel = useCallback(value => <Label text={value} unit={''} />, []);
    const renderNotch = useCallback(() => <Notch/>, []);
    const handleValueChange = useCallback((low, high) => {
        setLow(low);
        setHigh(high);
        props.screenState.setData(low,high)
    }, []);
    
    return <>
        <View style={styles.sliderRoot}>
            <View style={styles.horizontalContainer}>
                <CustomTextM style={[CommonStyle.textSize20,CommonStyle.fontColor222]}>{low}</CustomTextM>
                <CustomTextM style={[CommonStyle.textSize20,CommonStyle.fontColor222]}>{" ~ "}</CustomTextM>
                <CustomTextM style={[CommonStyle.textSize20,CommonStyle.fontColor222]}>{high === low ? '이상' : high }</CustomTextM>
            </View>
            <Slider
                style={styles.slider}
                min={0}
                max={5000}
                low={dataLow}
                high={dataHigh}
                step={100}
                floatingLabel={true}
                allowLabelOverflow={true}
                disableRange={false}        
                renderThumb={renderThumb}
                renderRail={renderRail}
                renderRailSelected={renderRailSelected}
                renderLabel={renderLabel}
                renderNotch={renderNotch}
                onValueChanged={handleValueChange}
            />
        </View>
        </>
}


class SetupHouseholdScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading : false,
            householdOption : [
                {id : 1, title : '전체'},
                {id : 2, title : '100세대~'},
                {id : 3, title : '500세대~'},
                {id : 4, title : '1000세대~'},
                {id : 5, title : '3000세대~'},
                {id : 6, title : '5000세대~'}
            ],
            selectedHousehold : null,
            selectedDataFrom  : 0,
            selectedDataTo : 100000
            
        }
    }

    setData = async(low = 0, hight = 100000 ) => {
        let mapSubCondition = this.props.mapSubCondition;      
        this.props._setupMapSubCondition({
            ...mapSubCondition,
            tmphousehold : {
                shousehold : low,
                ehousehold : hight
            }
        })
        this.setState({
            selectedDataFrom : low,
            selectedDataTo : hight
        })
    }
    copyObjectData = async(data) => {
        let mapSubCondition = this.props.mapSubCondition;        
        this.props._setupMapSubCondition({
            ...mapSubCondition,
            tmphousehold : {
                shousehold : data.shousehold,
                ehousehold : data.ehousehold
            }
        })
    }

    async UNSAFE_componentWillMount() {
        if ( !CommonUtil.isEmpty(this.props.mapSubCondition.household) ) {
            await this.copyObjectData(this.props.mapSubCondition.household)
            this.setState({
                selectedDataFrom : this.props.mapSubCondition.household.shousehold,
                selectedDataTo : this.props.mapSubCondition.household.ehousehold
            })
        }
    }
    componentDidMount() {      
    }
    componentWillUnmount(){
    }    

    setupSearchCondition = async() => {
        const selectedDataFrom = this.state.selectedDataFrom;
        const selectedDataTo = this.state.selectedDataTo;
        if ( !CommonUtil.isEmpty(selectedDataFrom) && !CommonUtil.isEmpty(selectedDataTo) ) {
            let mapSubCondition = this.props.mapSubCondition;        
            this.props._setupMapSubCondition({
                ...mapSubCondition,
                household : {
                    shousehold : selectedDataFrom,
                    ehousehold : selectedDataTo
                }
            })
            await  AsyncStorage.setItem('mapSubCondition',
                JSON.stringify({
                    ...mapSubCondition,
                    household : {
                        shousehold : selectedDataFrom,
                        ehousehold : selectedDataTo
                    }
                })
            ); 
            setTimeout(() => {
                this.props.navigation.goBack(null);
            }, 1000);
        }
    }

    checkRealEstedGubun = async (item) => {
        let selectedDataFrom = 0;
        let selectedDataTo = 100000;
        switch(item.id) {
            case 2 :  selectedDataFrom = 100,selectedDataTo = 499; break;
            case 3 :  selectedDataFrom = 500,selectedDataTo = 999; break;
            case 4 :  selectedDataFrom = 1000,selectedDataTo = 2999; break;
            case 5 :  selectedDataFrom = 3000,selectedDataTo = 4999; break;
            case 6 :  selectedDataFrom = 5000,selectedDataTo = 100000; break;
            default :  selectedDataFrom = 0,selectedDataTo = 100000; break;
        }
        await this.setData(selectedDataFrom,selectedDataTo);
        this.setState({
            selectedHousehold : item.id,
            selectedDataFrom : selectedDataFrom,
            selectedDataTo : selectedDataTo
        })
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
                    <View style={styles.modalDataCoverWrap}>
                        <View style={styles.modalDataWrap}>
                            <SliderScreen 
                                screenState={{setData : this.setData.bind(this)}} 
                                screenProps={this.props}
                            />
                        </View>
                        <View style={styles.modalDataWrap2} >
                            {
                                this.state.householdOption.map((item,index) => (
                                <TouchableOpacity 
                                    key={index}
                                    onPress={()=>this.checkRealEstedGubun(item)} 
                                    style={this.state.selectedHousehold === item.id ? styles.modalDataEachWrapOn : styles.modalDataEachWrapOff}
                                >
                                    <CustomTextR style={[CommonStyle.textSize13,this.state.selectedHousehold === item.id  ? CommonStyle.fontColorBase: CommonStyle.fontColorccc]}>{item.title}</CustomTextR>
                                </TouchableOpacity>
                                
                                ))
                            }
                        </View>
                    </View>
                    </ScrollView>
                    <TouchableOpacity style={styles.middleDataWarp2}>
                        <TouchableOpacity 
                            onPress={()=>this.setupSearchCondition()}
                            style={styles.buttonWrapOn }
                        >
                            <CustomTextM style={[CommonStyle.textSize17,CommonStyle.fontColorWhite]}>조건저장</CustomTextM>
                        </TouchableOpacity>
                    </TouchableOpacity>                    
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
        flexGrow:1,
        paddingHorizontal:20
    },
    
    valueText: {width: 50,color: '#000',fontSize: 20,},
    

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
        flex:1,paddingVertical:10,flexDirection:'row',justifyContent:'space-between'
    },
    modalDataWrap2 : {
        flex:1,paddingVertical:10,flexDirection:'row',flexWrap:'wrap'
    },
    modalDataEachWrapOn : {
        width:100,justifyContent:'center',alignItems:'center',marginHorizontal:5,borderColor:DEFAULT_COLOR.base_color,borderWidth:1,borderRadius:20,paddingVertical:10,marginBottom:10
    },
    modalDataEachWrapOff : {
        width:100,justifyContent:'center',alignItems:'center',marginHorizontal:5,borderColor:'#ddd',borderWidth:1,borderRadius:20,paddingVertical:10,marginBottom:10
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


export default connect(mapStateToProps,mapDispatchToProps)(SetupHouseholdScreen);