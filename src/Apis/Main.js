const { Api } = require("@psyrenpark/api");

const userType = "cust"; // admin - cust
const projectName = "gp" + userType;
const projectEnv = "prod";

const v1Api = `${projectName}-${projectEnv}-api-v1`; // 일반유저 인증용
const v1Cdn = `${projectName}-${projectEnv}-cdn-v1`; // 비회원 논인증 캐시용 
const v1NoneAuth = `${projectName}-${projectEnv}-noneauth-v1`; //비회원 논인증
const v1Cms = `${projectName}-${projectEnv}-cms-v1`; //관리자 인증용 

import CommonUtil from '../Utils/CommonUtil';

exports.apiObject = {
    API_mapsDefaultData : ({ locale ,priceLevel,realEstedGubun,realEstedOption,saleRate, heibo,household,year }) => {
        const apiName = v1Cdn;
        const sPriceLevel = CommonUtil.isEmpty(priceLevel) ? null : priceLevel.sPriceLevel;
        const ePriceLevel = CommonUtil.isEmpty(priceLevel) ? null : priceLevel.ePriceLevel;
         //A:급매매, B:급전세, C:매매, D:전세
         let isFastDeal = false;
         let isFastRent = false;
         let isDeal = false;
         let isRent = false;
         if ( !CommonUtil.isEmpty(realEstedGubun) ) {
             isFastDeal = realEstedGubun.includes('A') ? true :false;
             isFastRent = realEstedGubun.includes('B') ? true :false;
             isDeal = realEstedGubun.includes('C') ? true :false;
             isRent = realEstedGubun.includes('D') ? true :false;
         }
        //시세대비 저렴한 비율
        const sSaleRate = CommonUtil.isEmpty(saleRate) ? 10 : saleRate.sSaleRate;
        const eSaleRate = CommonUtil.isEmpty(saleRate) ? 50 : saleRate.eSaleRate;
        //평형
        const sHeibo = CommonUtil.isEmpty(heibo) ? null : heibo.sHeibo;
        const eHeibo = CommonUtil.isEmpty(heibo) ? null : heibo.eHeibo;
        //세대수
        const shousehold = CommonUtil.isEmpty(household) ? null : household.shousehold;
        const ehousehold = CommonUtil.isEmpty(household) ? null : household.ehousehold;
        //건축년도
        const sYear = CommonUtil.isEmpty(year) ? null : parseInt(year.sYear);
        const eYear = CommonUtil.isEmpty(year) ? null : parseInt(year.eYear);

        const path = "/maps/list?sPriceLevel="+sPriceLevel+'&ePriceLevel='+ePriceLevel+'&isFastDeal='+isFastDeal+'&isFastRent='+isFastRent+'&isDeal='+isDeal+'&isRent='+isRent+'&sSaleRate='+sSaleRate+'&eSaleRate='+eSaleRate+'&isFirstFloor='+realEstedOption+'&sHeibo='+sHeibo+'&eHeibo='+eHeibo+'&shousehold='+shousehold+'&ehousehold='+ehousehold+'&sYear='+sYear+'&eYear='+eYear;
        //console.log('path',path)
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        let returnVal = Api.get(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    }, 
    API_mapsArticleData : ({ locale , centerLen, centerLon, member_pk,priceLevel,realEstedGubun,realEstedOption,saleRate,heibo,household,year}) => {
        //console.log('realEstedGubun',realEstedGubun)
        const apiName = v1Cdn;
        const sPriceLevel = CommonUtil.isEmpty(priceLevel) ? null : priceLevel.sPriceLevel;
        const ePriceLevel = CommonUtil.isEmpty(priceLevel) ? null : priceLevel.ePriceLevel;
        //A:급매매, B:급전세, C:매매, D:전세
        let isFastDeal = false;
        let isFastRent = false;
        let isDeal = false;
        let isRent = false;
        if ( !CommonUtil.isEmpty(realEstedGubun) ) {
            isFastDeal = realEstedGubun.includes('A') ? true :false;
            isFastRent = realEstedGubun.includes('B') ? true :false;
            isDeal = realEstedGubun.includes('C') ? true :false;
            isRent = realEstedGubun.includes('D') ? true :false;
        }
        
        //시세대비 저렴한 비율
        const sSaleRate = CommonUtil.isEmpty(saleRate) ? null : saleRate.sSaleRate;
        const eSaleRate = CommonUtil.isEmpty(saleRate) ? null : saleRate.eSaleRate;
        //평형
        const sHeibo = CommonUtil.isEmpty(heibo) ? null : heibo.sHeibo;
        const eHeibo = CommonUtil.isEmpty(heibo) ? null : heibo.eHeibo;
        //세대수
        const shousehold = CommonUtil.isEmpty(household) ? null : household.shousehold;
        const ehousehold = CommonUtil.isEmpty(household) ? null : household.ehousehold;
        //건축년도
        const sYear = CommonUtil.isEmpty(year) ? null : parseInt(year.sYear);
        const eYear = CommonUtil.isEmpty(year) ? null : parseInt(year.eYear);

        const centerLen2 = centerLen.toFixed(6);
        const centerLon2 = centerLon.toFixed(6)

        const path = "/maps/article?centerlan="+ centerLen2 + '&centerlon='+ centerLon2 + '&member_pk='+ member_pk +"&sPriceLevel="+sPriceLevel+'&ePriceLevel='+ePriceLevel+'&isFastDeal='+isFastDeal+'&isFastRent='+isFastRent+'&isDeal='+isDeal+'&isRent='+isRent+'&sSaleRate='+sSaleRate+'&eSaleRate='+eSaleRate+'&isFirstFloor='+realEstedOption+'&sHeibo='+sHeibo+'&eHeibo='+eHeibo+'&shousehold='+shousehold+'&ehousehold='+ehousehold+'&sYear='+sYear+'&eYear='+eYear;
        //console.log('path',path)
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        let returnVal = Api.get(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    }, 

    API_mapsUrbanData : ({ locale , centerLen, centerLon, priceLevel,realEstedGubun,realEstedOption,saleRate,heibo,household,year }) => {
        //console.log('realEstedGubun',realEstedGubun)
        const apiName = v1Cdn;
        const sPriceLevel = CommonUtil.isEmpty(priceLevel) ? null : priceLevel.sPriceLevel;
        const ePriceLevel = CommonUtil.isEmpty(priceLevel) ? null : priceLevel.ePriceLevel;
        //A:급매매, B:급전세, C:매매, D:전세
        let isFastDeal = false;
        let isFastRent = false;
        let isDeal = false;
        let isRent = false;
        if ( !CommonUtil.isEmpty(realEstedGubun) ) {
            isFastDeal = realEstedGubun.includes('A') ? true :false;
            isFastRent = realEstedGubun.includes('B') ? true :false;
            isDeal = realEstedGubun.includes('C') ? true :false;
            isRent = realEstedGubun.includes('D') ? true :false;
        }
        
        //시세대비 저렴한 비율
        const sSaleRate = CommonUtil.isEmpty(saleRate) ? null : saleRate.sSaleRate;
        const eSaleRate = CommonUtil.isEmpty(saleRate) ? null : saleRate.eSaleRate;
        //평형
        const sHeibo = CommonUtil.isEmpty(heibo) ? null : heibo.sHeibo;
        const eHeibo = CommonUtil.isEmpty(heibo) ? null : heibo.eHeibo;
        //세대수
        const shousehold = CommonUtil.isEmpty(household) ? null : household.shousehold;
        const ehousehold = CommonUtil.isEmpty(household) ? null : household.ehousehold;
        //건축년도
        const sYear = CommonUtil.isEmpty(year) ? null : parseInt(year.sYear);
        const eYear = CommonUtil.isEmpty(year) ? null : parseInt(year.eYear);

        const centerLen2 = centerLen.toFixed(6);
        const centerLon2 = centerLon.toFixed(6)

        const path = "/maps/urban?centerlan="+ centerLen2 + '&centerlon='+ centerLon2+"&sPriceLevel="+sPriceLevel+'&ePriceLevel='+ePriceLevel+'&isFastDeal='+isFastDeal+'&isFastRent='+isFastRent+'&isDeal='+isDeal+'&isRent='+isRent+'&sSaleRate='+sSaleRate+'&eSaleRate='+eSaleRate+'&isFirstFloor='+realEstedOption+'&sHeibo='+sHeibo+'&eHeibo='+eHeibo+'&shousehold='+shousehold+'&ehousehold='+ehousehold+'&sYear='+sYear+'&eYear='+eYear;
        console.log('path',path)
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        let returnVal = Api.get(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    }, 

    API_mapsAgentData : ({ locale , centerLen, centerLon  }) => {

        const apiName = v1Cdn;        
        const centerLen2 = centerLen.toFixed(6);
        const centerLon2 = centerLon.toFixed(6)

        const path = "/maps/agent_all?centerlan="+ centerLen2 + '&centerlon='+ centerLon2;
        //console.log('path',path)
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        let returnVal = Api.get(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    }, 

    API_mapsArticleDetail : ({ locale , apart_code, saleRate = null }) => {
        //console.log('locale',locale)
        const apiName = v1Cdn;
        //시세대비 저렴한 비율
        const sSaleRate = CommonUtil.isEmpty(saleRate) ? null : saleRate.sSaleRate;
        const eSaleRate = CommonUtil.isEmpty(saleRate) ? null : saleRate.eSaleRate;
        const path = "/apart/article/"+ apart_code + '?sSaleRate=' + sSaleRate + '&eSaleRate=' + eSaleRate;
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        //console.log('path',path)
        let returnVal = Api.get(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    }, 
    API_fastDealData : ({ locale , Sdate,area_sido = 'All',area_sido_sub ='All',totalPage = 0,page = 1, paginate = 10 ,member_pk ,isBookMark,search_keyword = '' ,saleRate = null  }) => {
        //console.log('locale',locale)
        let search_keyword2 = ""; 
        if ( !CommonUtil.isEmpty(search_keyword)) {
            search_keyword2 = encodeURI(search_keyword.trim())
        }
        //시세대비 저렴한 비율
        const sSaleRate = CommonUtil.isEmpty(saleRate) ? null : saleRate.sSaleRate;
        const eSaleRate = CommonUtil.isEmpty(saleRate) ? null : saleRate.eSaleRate;
        const apiName = v1Cdn;
        const path = "/apart/fastdeal?sdate=" + Sdate + '&totalPage=' + totalPage + '&page=' + page + '&paginate=' + paginate+ '&area_sido=' + area_sido+ '&area_sido_sub=' + area_sido_sub + '&member_pk=' + member_pk+ '&is_bookmark=' + isBookMark + '&search_keyword=' + search_keyword2 + '&sSaleRate=' + sSaleRate + '&eSaleRate=' + eSaleRate ; 
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        console.log('path',path)
        let returnVal = Api.get(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    },

    API_fastRentData : ({ locale , Sdate,area_sido = 'All',area_sido_sub = 'All',totalPage = 0,page = 1, paginate = 10 ,member_pk ,isBookMark,search_keyword = '' ,saleRate = null  }) => {
        //console.log('locale',locale)
        let search_keyword2 = ""; 
        if ( !CommonUtil.isEmpty(search_keyword)) {
            search_keyword2 = encodeURI(search_keyword.trim())
        }
        //시세대비 저렴한 비율
        const sSaleRate = CommonUtil.isEmpty(saleRate) ? null : saleRate.sSaleRate;
        const eSaleRate = CommonUtil.isEmpty(saleRate) ? null : saleRate.eSaleRate;
        const apiName = v1Cdn;
        const path = "/apart/fastrent?sdate=" + Sdate + '&totalPage=' + totalPage + '&page=' + page + '&paginate=' + paginate+ '&area_sido=' + area_sido + '&area_sido_sub=' + area_sido_sub+ '&member_pk=' + member_pk+ '&is_bookmark=' + isBookMark + '&search_keyword=' + search_keyword2 + '&sSaleRate=' + sSaleRate + '&eSaleRate=' + eSaleRate ; 
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        //console.log('path',path)
        let returnVal = Api.get(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    },
    API_updateBookmark : ({locale,class_type,target_pk,is_mode, member_pk }) => {      
        const apiName = v1Cdn;
        const path = "/member/bookmark/apart/"+parseInt(member_pk);
        let myInit = {
            headers: {},
            body: {          
                class_type : class_type,      
                target_pk : target_pk,                
                is_mode : is_mode,
                member_pk : +parseInt(member_pk)
            },            
            queryStringParameters: {},
        };
        //console.log('myInit',myInit)
        
        let returnVal = Api.post(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
        
    },
    API_getApartStory :  ({ locale ,complexno,page=1, sort_item = 'reg_date', sort_type='DESC', paginate=10}) => {
        const apiName = v1Cdn;
        const path = '/story/apart/list?page='+page+'&paginate='+paginate+'&complexno='+complexno+'&sort_item='+sort_item+'&sort_type='+sort_type; 
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        console.log('path',path)   
        let returnVal = Api.get(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    },
    API_updateStoryLike : ({ locale ,class_type = 'Apart', target_pk}) => {
        const apiName = v1Api;
        const path = '/story/like';
        const myInit = {
            headers: {},
            body : {
                class_type : class_type,
                target_pk :  target_pk + "",
            },
            queryStringParameters: {},
        };
        //console.log('myInit',myInit)   
        let returnVal = Api.post(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    },
    
    API_registReplyStory : ({ locale ,class_type = 'Apart', target_pk, contents, parent_reply_pk = null}) => {
        const apiName = v1Api;
        const path = '/reply';
        const myInit = {
            headers: {},
            body : {
                class_type : class_type,
                target_pk :  parseInt(target_pk),
                contents,
                parent_reply_pk :  parent_reply_pk != null ? parseInt(parent_reply_pk) : null,
            },
            queryStringParameters: {},
        };
        //console.log('myInit',myInit)   
        let returnVal = Api.post(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    },

    API_removeReplyStory : ({ locale ,target_pk}) => {
        const apiName = v1Api;
        const path = '/reply/remove/'+target_pk;
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        //console.log('path',path)   
        let returnVal = Api.del(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    },
    API_registblockUser : ({ locale ,target_pk}) => {
        const apiName = v1Api;
        const path = '/member/blockuser/'+target_pk;
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        //console.log('path',path)   
        let returnVal = Api.post(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    },

    
    API_removeApartStory : ({ locale ,apart_story_pk}) => {
        const apiName = v1Api;
        const path = '/story/apart/remove/'+apart_story_pk;
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        //console.log('path',path)   
        let returnVal = Api.del(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    },

    API_removeHouseStory : ({ locale ,target_pk}) => {
        const apiName = v1Api;
        const path = '/story/estate/remove/'+target_pk;
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        //console.log('path',path)   
        let returnVal = Api.del(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    },
};
/*
http://3.36.228.110:3009/maps/article?centerlan=33.51069006745827&centerlon=126.525617103974447&member_pk=1&is_swagger=true&sPriceLevel=5&ePriceLevel=6&isFirstFloor=true
http://3.36.228.110:3009/maps/article?=centerlan=33.51069006745827&centerlon=126.52561710397447&member_pk=null&sPriceLevel=5&ePriceLevel=6&isFastDeal=true&isFastRent=false&isDeal=true&isRent=false&sSaleRate=10&eSaleRate=40&isFirstFloor=true
*/