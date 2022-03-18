const { Api } = require("@psyrenpark/api");

const userType = "cust"; // admin - cust
const projectName = "gp" + userType;
const projectEnv = "prod";

const v1Api = `${projectName}-${projectEnv}-api-v1`;
const v1Cdn = `${projectName}-${projectEnv}-cdn-v1`;
const v1NoneAuth = `${projectName}-${projectEnv}-noneauth-v1`;
const v1Cms = `${projectName}-${projectEnv}-cms-v1`;

exports.apiObject = {
    getTest: ({ locale  }) => {
        return Api.getAxios().get("https://www.google.com");
    },

    getAdminMyInfo: ({ locale }) => {
        const apiName = v1Api;
        const path = "/admins/my-info";
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        return Api.get(apiName, path, myInit );
    },

    getCodeType: ({ locale }) => {
        //console.log('locale',locale)
        const apiName = v1Cdn;
        const path = "/code-types";
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        return Api.get(apiName, path, myInit);
    },

    API_getYakwanData: ({ locale  }) => {
        //console.log('locale',locale)
        const apiName = v1Cdn;
        const path = "/common/yakwan/1";
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        return Api.get(apiName, path, myInit);
    },

    getTestStory: ({ locale }) => {
        //console.log('locale',locale)
        const apiName = v1Cdn;
        const path = "/story";
        const myInit = {
            headers: {},
            queryStringParameters: {},
        };
        return Api.get(apiName, path, myInit);
    },

    
};