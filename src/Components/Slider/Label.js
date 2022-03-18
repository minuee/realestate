import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
//공통상수 필요에 의해서 사용
import  * as getDEFAULT_CONSTANTS   from '../../Constants';
const DEFAULT_CONSTANTS = getDEFAULT_CONSTANTS.DEFAULT_CONSTANTS;
const DEFAULT_TEXT = getDEFAULT_CONSTANTS.DEFAULT_TEXT;
const DEFAULT_COLOR = getDEFAULT_CONSTANTS.DEFAULT_COLOR;
const Label = ({ text, ...restProps }) => {
    return (
        <View style={styles.root} {...restProps}>
            <Text style={styles.text}>{text}{restProps.unit}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: DEFAULT_COLOR.base_color,
    borderRadius: 4,
  },
  text: {
    fontSize: 16,
    color: '#fff',
  },
});

export default memo(Label);
