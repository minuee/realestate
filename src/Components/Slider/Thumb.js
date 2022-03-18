import React, { memo } from 'react';
import { View, StyleSheet,Image } from 'react-native';
//공통상수 필요에 의해서 사용
import  * as getDEFAULT_CONSTANTS   from '../../Constants';
const DEFAULT_CONSTANTS = getDEFAULT_CONSTANTS.DEFAULT_CONSTANTS;
const DEFAULT_TEXT = getDEFAULT_CONSTANTS.DEFAULT_TEXT;
const DEFAULT_COLOR = getDEFAULT_CONSTANTS.DEFAULT_COLOR;
const THUMB_RADIUS = 24;

const Thumb = () => {
  return (
    <View style={styles.root}>
        <Image 
            source={require('../../../assets/icons/icon_ball.png')} 
            resizeMode={"contain"} 
            style={{width:THUMB_RADIUS * 2,height:THUMB_RADIUS * 2}} 
        />
    </View>

  );
};

const styles = StyleSheet.create({
  root: {
    width: THUMB_RADIUS * 2,
    height: THUMB_RADIUS * 2,
    //borderRadius: THUMB_RADIUS,
    //borderWidth: 2,
    //borderColor: DEFAULT_COLOR.base_color,
    //backgroundColor: '#ffffff',
  },
});

export default memo(Thumb);
