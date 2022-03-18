const { Api } = require("@psyrenpark/api");

const userType = "cust"; // admin - cust
const projectName = "gp" + userType;
const projectEnv = "prod";

const v1Api = `${projectName}-${projectEnv}-api-v1`;
const v1Cdn = `${projectName}-${projectEnv}-cdn-v1`;
const v1NoneAuth = `${projectName}-${projectEnv}-noneauth-v1`;
const v1Cms = `${projectName}-${projectEnv}-cms-v1`;

exports.apiObject = {

    
    API_getUserInfo : ({ locale,member_uuid }) => {
        const apiName = v1Cdn;
        const path = "/member/userinfo/" + member_uuid;
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        let returnVal =  Api.get(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    }, 

    API_SaveUserToken : ({ locale,member_uuid,fcm_token,os_type = 'android' }) => {
        const apiName = v1Cdn;
        const path = "/member/update/token/" + member_uuid;
        const myInit = {
            headers: {},
            body: {                
                fcm_token,os_type
            },       
            queryStringParameters: {},
        };
        //console.log('myInit',path,myInit)
        let returnVal =  Api.patch(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    }, 

    API_insertError : ({ locale,class_type,error,user_id }) => {
        const apiName = v1Cdn;
        const path = "/common/insert_error";
        const myInit = {
            headers: {},
            body: {                
                class_type,
                error_data : error,
                user_id
            },       
            queryStringParameters: {},
        };
        //console.log('myInit',path,myInit)
        let returnVal =  Api.post(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    }, 

    API_checkEmailType : ({ locale,email }) => {
        const apiName = v1Cdn;
        const path = "/member/check/mail/"+ encodeURIComponent(email);
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        let returnVal =  Api.get(apiName, path, myInit);
        //console.log('path2',path);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    }, 

    API_checkDupUserId : ({ locale,member_id}) => {
        const apiName = v1Cdn;
        const path = "/member/dupcheck/uid/" + encodeURIComponent(member_id);
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        let returnVal =  Api.get(apiName, path, myInit);
        //console.log('path2',path);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    }, 

    API_checkDupUserName : ({ locale,member_name }) => {
        const apiName = v1Cdn;
        const path = "/member/dupcheck/nickname/" + member_name;
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        
        let returnVal =  Api.get(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    },
    API_memberDetail : ({ locale,member_pk }) => {
        const apiName = v1Cdn;
        const path = "/member/detail/" + member_pk;
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        let returnVal =  Api.get(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    }, 

    API_AgentDetail : ({ locale,member_pk }) => {
        const apiName = v1Cdn;
        const path = "/member/agent/" + member_pk;
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        let returnVal =  Api.get(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    }, 

    API_AgentDetail2 : ({ locale,estate_agent_pk,member_pk}) => {
        const apiName = v1Cdn;
        const path = "/agent/detail/" + estate_agent_pk + '?member_pk='+member_pk;
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        console.log('returnCode.data',path)
        let returnVal =  Api.get(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }

        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    }, 

    API_updateMemberInfo : ({locale,member_pk,area_code,company_name,address=null,telephone=null,business_code=null,profile=null,zipcode=null,latitude=0,longitude=0}) => {   
        //console.log('roomIdx',roomIdx)     
        const apiName = v1Cdn;
        const path = "/member/info/" + member_pk;
        let myInit = {
            headers: {},
            body: {
                profile_url : profile,
                area_code,
                company_name,
                address,
                telephone,
                business_code,
                zipcode,latitude,longitude                
            },            
            queryStringParameters: {},
        };
        //console.log('myInit222222',myInit)
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

    API_AgentRequestUpdate : ({locale,estate_agent_pk}) => {   
        //console.log('roomIdx',roomIdx)     
        const apiName = v1Api;
        const path = "/member/agent/confirm/" + estate_agent_pk;
        let myInit = {
            headers: {},
            body: {},            
            queryStringParameters: {},
        };
        console.log('API_AgentRequestUpdate',path)     
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

    API_AgentUpdate : ({locale,member_pk,estate_agent_pk,formOperation_time,formIntroduction,imageUrl}) => {   
        //console.log('roomIdx',roomIdx)     
        const apiName = v1Cdn;
        const path = "/member/agent/" + member_pk;
        let myInit = {
            headers: {},
            body: {
                estate_agent_pk,      
                introduction : formIntroduction,                
                img_url : imageUrl,
                operation_time : formOperation_time
            },            
            queryStringParameters: {},
        };
        //console.log('API_AgentUpdate myInit',myInit)        
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

    API_AgentVotePoint : ({locale,target_pk,star_point}) => {      
        const apiName = v1Api;
        const path = "/agent/star/" + target_pk;
        let myInit = {
            headers: {},
            body: {          
                star_point : star_point.toString()
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

    API_chatRoomList : ({ locale,member_pk,user_type='N' }) => {
        //console.log('locale',locale)
        const apiName = v1Cdn;
        const path = "/member/chatroom/" + member_pk + '?member_type='+user_type;
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        let returnVal =  Api.get(apiName, path, myInit);
        //console.log('path',path)
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    }, 
    API_removeChatRoom : ({ locale,roomIdx,user_type='N' }) => {
        //console.log('locale',locale)
        const apiName = v1Api;
        const path = "/chat/remove/" + roomIdx;
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        //console.log('path',path)
        let returnVal =  Api.del(apiName, path, myInit);
        if ( returnVal ) {
            return returnVal;
        }

        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    }, 

    API_checkAgentService : ({locale}) => {   
        //console.log('roomIdx',roomIdx)     
        const apiName = v1Api;
        const path = "/settlement/agentcheck";
        let myInit = {
            headers: {},   
            queryStringParameters: {},
        };
        //console.log('myInit',myInit)
        
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
    API_checkMyService : ({locale}) => {   
        //console.log('roomIdx',roomIdx)     
        const apiName = v1Api;
        const path = "/settlement/mycheck";
        let myInit = {
            headers: {},   
            queryStringParameters: {},
        };
        //console.log('myInit',myInit)
        
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
    //구독 또는 무료서비스 해지신청
    API_expireService : ({locale,expire_type,end_date,target_pk}) => {   
        //console.log('roomIdx',roomIdx)     
        const apiName = v1Api;
        const path = "/settlement/expire/" + target_pk;
        let myInit = {
            headers: {},   
            body : {
                end_date,
                expire_type
            },
            queryStringParameters: {},
        };
        //console.log('path',path)
        
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


    API_registUserSubscriptions : ({locale,class_type,receipt,receiptInfo ,cost,is_status}) => {   
        //console.log('roomIdx',roomIdx)     
        const apiName = v1Api;
        const path = "/settlement/request/dealalarm";
        let myInit = {
            headers: {},   
            body : {
                class_type,receipt,
                receipt_info : JSON.stringify(receiptInfo)
                ,cost,is_status
            },
            queryStringParameters: {},
        };
        console.log('myInit',myInit)        
        let returnVal = Api.post(apiName, path, myInit);
        console.log('returnVal',returnVal)      
        if ( returnVal ) {
            return returnVal;
        }
        setTimeout(() => {
            if ( CommonUtil.isEmpty(returnVal)) {
                return {code : '9998' , msg : 'Timeout'}
            }
        }, 5000)
    },

    API_requestFreeService : ({locale}) => {   
        //console.log('roomIdx',roomIdx)     
        const apiName = v1Api;
        const path = "/settlement/request/free";
        let myInit = {
            headers: {},   
            queryStringParameters: {},
        };
        //console.log('myInit',myInit)
        
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
    
    API_registDeclaration : ({locale,room_pk,class_type,member_pk,target_member,declaration_type}) => {   
        //console.log('roomIdx',roomIdx)     
        const apiName = v1Cdn;
        const path = "/chat/declaration";
        let myInit = {
            headers: {},
            body: {          
                room_pk : class_type === 'chat' ?  parseInt(room_pk) : room_pk,
                class_type,
                reg_member : parseInt(member_pk),
                target_member : parseInt(target_member),
                reason_type : declaration_type
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

    API_updateNotification: ({locale,is_notification}) => {   
        //console.log('roomIdx',roomIdx)     
        const apiName = v1Api;
        const path = "/member/notification";
        let myInit = {
            headers: {},
            body: {          
                is_notification
            }, 
            queryStringParameters: {},
        };
        //console.log('path',path)        
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
    API_updateFastDealRate: ({locale,member_pk,sSaleRate,eSaleRate}) => {   
        //console.log('roomIdx',roomIdx)     
        const apiName = v1Api;
        const path = "/member/setrate/"+member_pk;
        let myInit = {
            headers: {},
            body: {          
                sSaleRate,
                eSaleRate
            }, 
            queryStringParameters: {},
        };
        //console.log('path',path)        
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
};