import {Dimensions, Platform} from 'react-native';
const  isIphoneX = () => {
    const dimen = Dimensions.get('window');
    return (
      Platform.OS === 'ios' &&
      !Platform.isPad &&
      !Platform.isTVOS &&
      ((dimen.height === 812 || dimen.height === 844 || dimen.width === 812) || (dimen.height === 896 || dimen.width === 896))
    );
}

const DEFAULT_CONSTANTS = {
    appID : 'goodagent',
    appName : '착한부동산',    
    AppStoreVersion : '1.3.0',
    logoImage : '',
    androidPackageName : 'com.realestateagent',
    iosBundleId : 'kr.co.goodagent',
    iosAppStoreID : 1572593725,
    fcmCommonTopic : 'realestate',
    CommonSaltKey : 'goodagenteda40baa4fHynnm4W1',
    defaultFontFamily : 'NotoSansKR-Regular',         // default,
    defaultFontFamilyDemiLight : 'NotoSansKR-Thin',         // Demi Light,
    defaultFontFamilyLight : 'NotoSansKR-Light',         // Light,
    defaultFontFamilyRegular : 'NotoSansKR-Regular',  // Regular
    defaultFontFamilyMedium : 'NotoSansKR-Medium',  // Medium
    defaultFontFamilyBold : 'NotoSansKR-Bold',    // Bold

    robotoFontFamilyLight : 'Roboto-Light',         // Light,
    robotoFontFamilyRegular : 'Roboto-Regular',  // Medium
    robotoFontFamilyMedium : 'Roboto-Medium',  // Regular
    robotoFontFamilyBold : 'Roboto-Bold',    // Bold, Extra Bold

    
    BottomHeight : isIphoneX() ? 70 : 50,

    iosAppSharePassword : 'a8d2d3c3f3a94ecb8176d47b69925c19',
    DEFAULT_FAST_DEAL_COST : 10000,
    DEFAULT_AGENT_USE_COST : 20000,
    imageBaseUrl : 'https://gp-prod-file.s3.ap-northeast-2.amazonaws.com/public/',
    kakaoApiKey : 'KakaoAK 05dceba30de39d5c09de4c4160b8b94a',
    //iamport 
    iamPortAPIDomain : 'https://api.iamport.kr',
    iamPortAPIKey : '3607954518520262',
    iamPortAPISecrentKey : 'BhkwwiVPZ1DUz4rJX0X3eDhGHXFlVyXwQi3mAYbzZOtyTViQWfUaTbQA9wW55UCVcFhMEtmEiQccLv3H',

    isMasterMember : ['364']
}

export { DEFAULT_CONSTANTS }

/* 단위 sp */
const DEFAULT_TEXT = {
    head_large : 23,
    head_medium : 20,
    head_small : 15,
    body_14 : 14,
    body_13 : 13,
    body_12 : 12,
    fontSize30:31,
    fontSize29:30,
    fontSize28:29,
    fontSize27:28,
    fontSize26:27,
    fontSize25:26,
    fontSize24:25,    
    fontSize23:24,
    fontSize22:23,
    fontSize21:22,
    fontSize20:21,
    fontSize19:20,
    fontSize18:19,
    fontSize17:18,
    fontSize16:17,
    fontSize15:16,
    fontSize14:15,
    fontSize13:14,
    fontSize12:13, 
    fontSize11:12,
    fontSize10:11,
    fontSize9:10,
    fontSize8:9,
    fontSize7:8,
    fontSize6:7,
    fontSize5:6,
}

export { DEFAULT_TEXT }

const DEFAULT_COLOR = {
    subject_language : '#d50032',
    subject_teacher : '#00abc7',
    base_color : '#00b65f',
    base_background_color : '#f5faff',
    default_bg_color : '#f5f6f8',
    base_color_fff : '#fff',
    base_color_000 : '#000',
    base_color_222 : '#222',
    base_color_444 : '#444',
    base_color_666 : '#666',
    base_color_888:'#888',
    base_color_bbb:'#bbb',
    base_color_ccc:'#ccc',
    input_bg_color2 : '#e5e6e9',
    input_border_color2 : '#eaebee',
    input_bg_color : '#f5f7f8',    
    input_border_color : '#eeeff1',
    myclass_base: '#0e3a48',
}

export { DEFAULT_COLOR }
