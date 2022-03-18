

import React, { Component } from 'react';
import {SafeAreaView,ScrollView,View,StyleSheet,Text,Dimensions} from 'react-native';
import MapView  from "react-native-map-clustering";
const {height: SCREEN_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('window');

export default  class ClusteringScreen extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return(
            <MapView {...this.props} >
                {this.props.children}
            </MapView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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