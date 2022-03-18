import types from '../types';

const defaultState = {
    nonUserToken: {uuid:1},
    userToken: {},
    userFCMToken: null,
    mapCondition : {
        stime : 0,
        condition : {}
    },
    mapSubCondition : {
        year : {},
        heibo : {},
        household : {}
    },
    isViewFastDeal : false,
    isApartBookMark : [],
    isViewMyAgent : false,
    isAgentBookMark : [],
    mainMapViewTarget : {
        maemul : true,
        agent : false
    },
    isReloadMode :  false,
    mainMapViewType : 'sido',
    rootStack : 'Tabs01Stack',
    userBaseData: {
        userData: {},
        isPush : false
    },
    toggleSearchForm : false,
    toggleMyArticle : false,
    showChatToastMessage : true,
    showMapToastMessage : true,
}

export default StatusReducer = (state = defaultState, action) => {
    switch (action.type) {
        case types.GLOBAL_STATUS_NONUSER_TOKEN:
            return {
            ...state,
            nonUserToken : action.return_userNonToken
        }; 
        case types.GLOBAL_STATUS_USER_TOKEN:
            return {
            ...state,
            userToken : action.return_userToken
        }; 
        case types.GLOBAL_STATUS_SHOW_CHAT_TOAST:
            return {
            ...state,
            showChatToastMessage : action.return_showChatToastMessage
        }; 
        case types.GLOBAL_STATUS_SHOW_MAP_TOAST:
            return {
            ...state,
            showMapToastMessage : action.return_showMapToastMessage
        }; 
        case types.GLOBAL_STATUS_USER_BASE_DATA:
            return {
            ...state,
            userBaseData : action.payload
        }; 
        case types.GLOBAL_STATUS_USER_BASE_DATA2:
            return {
            ...state,
            userBaseData : action.return_userBaseData
        };  
        case types.GLOBAL_STATUS_USER_FCM_TOKEN:
            return {
            ...state,
            userFCMToken : action.return_userFCMToken
        };  
        case types.GLOBAL_STATUS_MAP_CONDITION:
            return {
            ...state,
            mapCondition : action.return_mapCondition
        }; 
        case types.GLOBAL_STATUS_MAP_SUB_CONDITION:
            return {
            ...state,
            mapSubCondition : action.return_mapSubCondition
        }; 
        case types.GLOBAL_STATUS_TOGGLE_VIEW_FAST_DEAL:
            return {
            ...state,
            isViewFastDeal : action.return_isViewFastDeal
        }; 
        case types.GLOBAL_STATUS_TOGGLE_APART_BOOKMARK:
            return {
            ...state,
            isApartBookMark : action.return_isApartBookMark
        }; 
        case types.GLOBAL_STATUS_TOGGLE_VIEW_MYAGENT:
            return {
            ...state,
            isViewMyAgent : action.return_isViewMyAgent
        }; 
        case types.GLOBAL_STATUS_TOGGLE_AGENT_BOOKMARK:
            return {
            ...state,
            isAgentBookMark : action.return_isAgentBookMark
        }; 
        case types.GLOBAL_STATUS_MAIN_MAP_SHOW:
            return {
            ...state,
            mainMapViewTarget : action.return_mainMapViewTarget
        }; 
        case types.GLOBAL_STATUS_MAIN_MAP_TYPE:
            return {
            ...state,
            mainMapViewType : action.return_mainMapViewType
        }; 
        case types.GLOBAL_STATUS_IS_RELOAD_MODE:
            return {
            ...state,
            isReloadMode : action.return_isReloadMode
        };  
        case types.GLOBAL_STATUS_ROOT_STACK:
            return {
            ...state,
            rootStack : action.return_rootStack
        }; 
        case types.GLOBAL_STATUS_TOGGLE_SEARCH_FORM:
            return {
            ...state,
            toggleSearchForm : action.return_toggleSearchForm
        }; 
        case types.GLOBAL_STATUS_TOGGLE_MY_ARTICLE:
            return {
            ...state,
            toggleMyArticle : action.return_toggleMyArticle
        }; 
        default:
            return state;
    }
};
