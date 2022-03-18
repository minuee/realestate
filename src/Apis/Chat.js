const { Api } = require("@psyrenpark/api");

const userType = "cust"; // admin - cust
const projectName = "gp" + userType;
const projectEnv = "prod";

const v1Api = `${projectName}-${projectEnv}-api-v1`;
const v1Cdn = `${projectName}-${projectEnv}-cdn-v1`;
const v1NoneAuth = `${projectName}-${projectEnv}-noneauth-v1`;
const v1Cms = `${projectName}-${projectEnv}-cms-v1`;

exports.apiObject = {
    API_getChatMessage: ({ locale , roomIdx ,member_pk ,lastMessageIdx }) => {
        const apiName = v1Cdn;
        let path = "/chat/message/" + roomIdx + '?member_pk=' + member_pk;
        if ( lastMessageIdx > 0  ) {
            path = "/chat/messagemore/" + roomIdx + '?member_pk=' + member_pk+ '&lastMessageIdx=' + lastMessageIdx;
        }
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

    // 메시지등록
    API_insertMessage: ({
        locale,
        roomIdx ,
        memberIdx,
        classType,
        message,
        targetMember}) => {   
        const apiName = v1Cdn;
        const path = "/chat/message2/" + roomIdx;
        let myInit = {
            headers: {},
            body: {                
                class_type : classType,
                member_pk : parseInt(memberIdx),
                target_pk : parseInt(targetMember),
                message : message
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

    // 메시지등록
    API_removeMessage: ({locale,tarket_pk}) => {   
        const apiName = v1Api;
        const path = "/chat/remove_msg/" + tarket_pk;
        let myInit = {
            headers: {},        
            queryStringParameters: {},
        };
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

    API_registChatRoom : ({ locale , agent_member ,user_member,last_message,last_date }) => {
        const apiName = v1Api;
        const path = "/chat/makeroom/";
        const myInit = {
            headers: {},
            body: {                
                agent_member : agent_member.toString(),
                user_member : parseInt(user_member),
                last_message,
                last_date
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