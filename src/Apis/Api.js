const { Api } = require("@psyrenpark/api");

const userType = "cust"; // admin - cust
const projectName = "gp" + userType;
const projectEnv = "prod";

const v1Api = `${projectName}-${projectEnv}-api-v1`;
const v1Cdn = `${projectName}-${projectEnv}-cdn-v1`;
const v1NoneAuth = `${projectName}-${projectEnv}-noneauth-v1`;
const v1Cms = `${projectName}-${projectEnv}-cms-v1`;

import CommonUtil from '../Utils/CommonUtil';
exports.apiObject = {
    API_ApartStoryRegist: ({locale,member_pk,formComplexno,formTitle,formContents}) => {   
        const apiName = v1Api;
        const path = "/story/apart";
        let myInit = {
            headers: {},
            body: {          
                complexno : formComplexno,                
                title : formTitle,
                contents : formContents
            },            
            queryStringParameters: {},
        };
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

    API_HouseStoryRegist: ({locale,formTitle,formContents,image_1,image_2,image_3,image_4}) => {   
        const apiName = v1Api;
        const path = "/story/estate";
        let myInit = {
            headers: {},
            body: {           
                title : formTitle,
                contents : formContents,
                image_1,image_2,image_3,image_4
            },            
            queryStringParameters: {},
        };
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

    API_NewHouseStoryRegist: ({locale,formBoardType='Free',formIsNotice=false,formTitle,formContents,image_1,image_2,image_3,image_4}) => {   
        const apiName = v1Api;
        const path = "/story/estate/newregist";
        let myInit = {
            headers: {},
            body: {           
                board_type : formBoardType,
                is_notice : formIsNotice,
                title : formTitle,
                contents : formContents,
                image_1,image_2,image_3,image_4
            },            
            queryStringParameters: {},
        };

        console.log('API_HouseStoryRegist',myInit)
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

    API_HouseStoryModify: ({locale,target_pk,formTitle,formContents,image_1,image_2,image_3,image_4}) => {   
        const apiName = v1Api;
        const path = "/story/estate/" + target_pk;
        let myInit = {
            headers: {},
            body: {
                title : formTitle,
                contents : formContents,
                image_1,image_2,image_3,image_4
            },            
            queryStringParameters: {},
        };
        let returnVal = Api.put(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    },
    API_NewHouseStoryModify: ({locale,target_pk,formBoardType,formIsNotice,formTitle,formContents,image_1,image_2,image_3,image_4}) => {   
        const apiName = v1Api;
        const path = "/story/estate/newupdate/" + target_pk;
        let myInit = {
            headers: {},
            body: {           
                board_type : formBoardType,
                is_notice : formIsNotice,
                title : formTitle,
                contents : formContents,
                image_1,image_2,image_3,image_4
            },            
            queryStringParameters: {},
        };
        let returnVal = Api.put(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    },
    API_registInquiry: ({locale,email,formTitle,formContents}) => {   
        const apiName = v1Api;
        const path = "/member/inquiry";
        let myInit = {
            headers: {},
            body: {          
                title : formTitle,
                contents : formContents
            },            
            queryStringParameters: {},
        };
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
    API_getMyNofitication :  ({ locale , page = 1, paginate = 10 }) => {
        const apiName = v1Api;
        const path = '/noti/list?page=' + page + '&paginate=' + paginate; 
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
    API_updateNotiReadCheck: ({locale,nofi_check_pk}) => {   
        const apiName = v1Api;
        const path = "/noti/read/" + nofi_check_pk;
        let myInit = {
            headers: {},            
            queryStringParameters: {},
        };
        let returnVal = Api.patch(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    },

    API_agentListData : ({ locale , area_sido = 'All',area_sido_sub = 'All',page = 1, paginate = 10 ,sort_item = 'reg_date',member_pk ,isBookMark,search_keyword = '' }) => {
        let search_keyword2 = ""; 
        if ( !CommonUtil.isEmpty(search_keyword)) {
            search_keyword2 = encodeURI(search_keyword.trim())
        }
        const apiName = v1Cdn;
        const path = '/agent/list_all?page=' + page + '&paginate=' + paginate+ '&sort_item=' + sort_item+ '&area_sido=' + area_sido+ '&area_sido_sub=' + area_sido_sub+ '&member_pk=' + member_pk+ '&is_bookmark=' + isBookMark + '&search_keyword=' + search_keyword2 ; 
        console.log('path.code',path)
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        return Api.get(apiName, path, myInit);
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
    
};