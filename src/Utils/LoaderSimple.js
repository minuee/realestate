import React, { Component } from 'react';
import {StyleSheet,View,Modal,Image,Dimensions,ActivityIndicator} from 'react-native';
//공통상수
import  * as getDEFAULT_CONSTANTS   from '../Constants';
const DEFAULT_CONSTANTS = getDEFAULT_CONSTANTS.DEFAULT_CONSTANTS;
const DEFAULT_TEXT = getDEFAULT_CONSTANTS.DEFAULT_TEXT;
const DEFAULT_COLOR = getDEFAULT_CONSTANTS.DEFAULT_COLOR;
export default class LoaderSimple extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: this.props.screenState.isLoading
        }
    }

    static getDerivedStateFromProps(nextProps) {
        return {
            isLoading: nextProps.isLoading
        };
    }

    render() {
        return (
          <View style={styles.activityIndicatorWrapper}>
            <ActivityIndicator size="large" animating={this.state.loading} color={this.props.screenState.color} />
          </View>
        )
    }
}

const styles = StyleSheet.create({

  activityIndicatorWrapper: {
    //backgroundColor: '#fff',
    //height: 150,
    //width: 150,
    paddingTop:100,
    backgroundColor:'transparent',
    //borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around'
  }
});

