import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, View, ScrollView, TouchableOpacity,Dimensions,Image} from 'react-native';
//공통상수 필요에 의해서 사용
import  * as getDEFAULT_CONSTANTS   from '../Constants';
import CommonStyle from '../Style/CommonStyle';
const DEFAULT_CONSTANTS = getDEFAULT_CONSTANTS.DEFAULT_CONSTANTS;
const DEFAULT_TEXT = getDEFAULT_CONSTANTS.DEFAULT_TEXT;
const DEFAULT_COLOR = getDEFAULT_CONSTANTS.DEFAULT_COLOR;
const {height: SCREEN_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('window');
import {CustomTextR,CustomTextL, CustomTextB, CustomTextM, TextRobotoM,TextRobotoR} from '../Components/CustomText';
import CommonFunction from '../Utils/CommonFunction';
import CommonUtil from '../Utils/CommonUtil';

const BTN_FIRST = require('../../assets/icons2/btn_first.png');
const BTN_PREV = require('../../assets/icons2/btn_prev.png');
const BTN_NEXT = require('../../assets/icons2/btn_next.png');
const BTN_LAST = require('../../assets/icons2/btn_last.png');

const Pagination = (props) => {    
	const { totalCount,currentPage,ismore,DefaultPaginate,onPageChange} = props.screenState;
	const pageCount = Math.ceil(totalCount / DefaultPaginate);
	console.log('pageCount',pageCount)
	if (pageCount === 1) return null; // 1페이지 뿐이라면 페이지 수를 보여주지 않음
	const pages = CommonFunction.getRange(pageCount,1);	
    const [pageIndex, setPageIndex] = useState(0);
    useEffect(() => {        
    }, []);

    return (
        <View style={{...styles.container}}>
            <View style={styles.commneBtnWrap}>
				<TouchableOpacity style={styles.commneBtn} onPress={()=>onPageChange(1)}  >
					<Image source={BTN_FIRST} resizeMode={'contain'} style={styles.fixedIcon} />
				</TouchableOpacity>
				<TouchableOpacity style={styles.commneBtn} onPress={()=>onPageChange(currentPage-1)}  >
					<Image source={BTN_PREV} resizeMode={'contain'} style={styles.fixedIcon} />
				</TouchableOpacity>
			</View>
			<View style={{flex: pages.length > 4 ? 3 : 2,flexDirection:'row',justifyContent:'space-between',}}>
				{
				pages.map((item, index) => {  
					if ( currentPage < 4 && index < 5 ) {
						console.log('AAAA')
						return (					
						<TouchableOpacity 
							key={index} 
							onPress={()=>onPageChange(item)}  
							style={currentPage === item ? styles.commnePageCheckBtn : styles.commnePageBtn}>
							<CustomTextB style={[CommonStyle.textSize12,currentPage === item ? CommonStyle.fontColorWhite: CommonStyle.fontColor555]}>{item}</CustomTextB>
						</TouchableOpacity>
						)
					}else if ( currentPage >= 4 && index >= currentPage-2 && index <= currentPage+2 ) {						
						if ( index === currentPage-2 ) {
							console.log('BBBBB')
							return (					
								<View key={index} style={styles.commnePageBtn}>
									<CustomTextB style={[CommonStyle.textSize12,CommonStyle.fontColor555]}>...</CustomTextB>
								</View>
								)
						}else if ( index === currentPage+2 ) {
							console.log('CCCCCC')
							return (					
								<View key={index} style={styles.commnePageBtn}>
									<CustomTextB style={[CommonStyle.textSize12,CommonStyle.fontColor555]}>...</CustomTextB>
								</View>
							)
						}else{
							console.log('DDDDDD')
							return (					
								<TouchableOpacity 
									key={index} 
									onPress={()=>onPageChange(item)}  
									style={currentPage === item ? styles.commnePageCheckBtn : styles.commnePageBtn}>
									<CustomTextB style={[CommonStyle.textSize12,currentPage === item ? CommonStyle.fontColorWhite: CommonStyle.fontColor555]}>{item}</CustomTextB>
								</TouchableOpacity>
							)
						}
					}else if ( currentPage > (pageCount-4)  && currentPage > 10 ) {
						if ( index+1 === (pageCount-4)) {
							console.log('EEEEE')
							return (
								<View key={index}>
									<View style={styles.commnePageBtn}>
										<CustomTextB style={[CommonStyle.textSize12,CommonStyle.fontColor555]}>...</CustomTextB>
									</View>
									<TouchableOpacity 									
										onPress={()=>onPageChange(item)}  
										style={currentPage === item ? styles.commnePageCheckBtn : styles.commnePageBtn}>
										<CustomTextB style={[CommonStyle.textSize12,currentPage === item ? CommonStyle.fontColorWhite: CommonStyle.fontColor555]}>{item}</CustomTextB>
									</TouchableOpacity>
								</View>
							)
						}else{
							console.log('FFFFF')
							return (					
							<TouchableOpacity 
								key={index} 
								onPress={()=>onPageChange(item)}  
								style={currentPage === item ? styles.commnePageCheckBtn : styles.commnePageBtn}>
								<CustomTextB style={[CommonStyle.textSize12,currentPage === item ? CommonStyle.fontColorWhite: CommonStyle.fontColor555]}>{item}</CustomTextB>
							</TouchableOpacity>
							)
						}
					}else{						
						return null;
					}
				})
				}
			</View>
			<View style={styles.commneBtnWrap} >
				<TouchableOpacity style={styles.commneBtn} onPress={()=>onPageChange(currentPage+1)}>
					<Image source={BTN_NEXT} resizeMode={'contain'} style={styles.fixedIcon} />
				</TouchableOpacity>
				<TouchableOpacity style={styles.commneBtn} onPress={()=>onPageChange(pageCount)}  >
					<Image source={BTN_LAST} resizeMode={'contain'} style={styles.fixedIcon} />
				</TouchableOpacity>
			</View>
        </View>
    );
};

export default Pagination;

const styles = StyleSheet.create({
    container: {
        flex:1,
		flexDirection:'row',
		justifyContent:'space-between',
		marginTop:15
    },
	commneBtnWrap : {
		flex:1,justifyContent:'center',alignItems:'center',flexDirection:'row'
	},
	commneBtn : {
		justifyContent:'center',alignItems:'center'
	},
	commnePageCheckBtn : {
		paddingVertical:5,paddingHorizontal:10,justifyContent:'center',alignItems:'center',borderColor:DEFAULT_COLOR.base_color,borderWidth:1,borderRadius:5,backgroundColor:DEFAULT_COLOR.base_color
	},
	commnePageBtn : { 
		paddingVertical:5,paddingHorizontal:10,justifyContent:'center',alignItems:'center',borderColor:'#ccc',borderWidth:1,borderRadius:5,
	},
	fixedIcon : {
        width:CommonUtil.dpToSize(20),height:CommonUtil.dpToSize(20)
    },
});