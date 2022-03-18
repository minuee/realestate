const { Api } = require("@psyrenpark/api");

const userType = "cust"; // admin - cust
const projectName = "gp" + userType;
const projectEnv = "prod";

const v1Api = `${projectName}-${projectEnv}-api-v1`;
const v1Cdn = `${projectName}-${projectEnv}-cdn-v1`;
const v1NoneAuth = `${projectName}-${projectEnv}-noneauth-v1`;
const v1Cms = `${projectName}-${projectEnv}-cms-v1`;

exports.apiObject = {
    API_getEstatestory :  ({locale,page = 1,paginate = 10,term_start,term_end,sort_item,sort_type,board_type,search_word,filter_pk}) => {
        const apiName = v1Cdn;
        const path = '/story/estate/newlist?page='+page+'&paginate='+paginate+'&term_start='+term_start+'&term_end='+term_end+'&sort_item='+sort_item+'&sort_type='+sort_type+'&board_type='+board_type+'&search_word='+search_word+'&filter_pk='+filter_pk; 
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        return Api.get(apiName, path, myInit);
    },
    
    API_getDetailEstatestory :  ({ 
        locale , estate_story_pk,board_type,regist_member_pk,member_pk=null
    }) => {
        const apiName = v1Cdn;
        const path = '/story/estate/newdetail/'+estate_story_pk+'?board_type='+board_type+'&regist_member_pk='+regist_member_pk+'&member_pk='+member_pk; 
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        console.log('API_getDetailEstatestory',path)
        return Api.get(apiName, path, myInit);
    },
    API_getReplyList :  ({ locale , page = 1, paginate = 10, class_type,target_pk }) => {
        const apiName = v1Cdn;
        const path = '/reply/list?page='+page+'&paginate='+paginate+'&class_type='+class_type+'&target_pk='+target_pk; 
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
};