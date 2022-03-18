import types from '../types';
import { apiObject } from "../../Apis/Member";

export function saveNonUserToken(token) {
    return {
        type: types.GLOBAL_STATUS_NONUSER_TOKEN,
        return_userNonToken : token,
    };
}

export function saveUserToken(token) {
    return {
        type: types.GLOBAL_STATUS_USER_TOKEN,
        return_userToken : token,
    };
}

export function saveUserFCMToken(token) {
    return {
        type: types.GLOBAL_STATUS_USER_FCM_TOKEN,
        return_userFCMToken : token,
    };
}

export function setupMapCondition(obj) {
    return {
        type: types.GLOBAL_STATUS_MAP_CONDITION,
        return_mapCondition : obj,
    };
}

export function setupMapSubCondition(obj) {
    return {
        type: types.GLOBAL_STATUS_MAP_SUB_CONDITION,
        return_mapSubCondition : obj,
    };
}
export function toggleFastDealBookmark(bool) {
    return {
        type: types.GLOBAL_STATUS_TOGGLE_VIEW_FAST_DEAL,
        return_isViewFastDeal : bool,
    };
}

export function toggleApartDetailBookmark(arr) {
    return {
        type: types.GLOBAL_STATUS_TOGGLE_APART_BOOKMARK,
        return_isApartBookMark : arr,
    };
}

export function toggleViewFiltermyAgent(bool) {
    return {
        type: types.GLOBAL_STATUS_TOGGLE_VIEW_MYAGENT,
        return_isViewMyAgent : bool,
    };
}

export function actionToggleMyArticle(bool) {
    return {
        type: types.GLOBAL_STATUS_TOGGLE_MY_ARTICLE,
        return_toggleMyArticle : bool,
    };
}

export function actionToggleSearchForm(bool) {
    return {
        type: types.GLOBAL_STATUS_TOGGLE_SEARCH_FORM,
        return_toggleSearchForm : bool,
    };
}

export function toggleAgentBookmark(arr) {
    return {
        type: types.GLOBAL_STATUS_TOGGLE_AGENT_BOOKMARK,
        return_isAgentBookMark : arr,
    };
}

export function toggleMainMapOpenTarget(str) {
    return {
        type: types.GLOBAL_STATUS_MAIN_MAP_SHOW,
        return_mainMapViewTarget : str,
    };
}

export function updateMainMapType(str) {
    return {
        type: types.GLOBAL_STATUS_MAIN_MAP_TYPE,
        return_mainMapViewType : str,
    };
}

export function updateisReloadMode(bool) {
    return {
        type: types.GLOBAL_STATUS_IS_RELOAD_MODE,
        return_isReloadMode : bool,
    };
}

export function saveRootStack(str) {
    return {
        type: types.GLOBAL_STATUS_ROOT_STACK,
        return_rootStack : str,
    };
}

export function updateUserBaseDataDirect(data) {
    return {
        type: types.GLOBAL_STATUS_USER_BASE_DATA2,
        userBaseData : data,
    };
}

export const updateUserBaseData = (member_pk) => {
    return async (dispatch) => {
        let returnCode = {code:9998};
        if ( member_pk ) {
            console.log('updateUserBaseData',member_pk)
            try {
                returnCode = await apiObject.API_memberDetail({
                    locale: "ko",
                    member_pk
                });                
                if ( returnCode.code === '0000') {
                    dispatch({
                        type: types.GLOBAL_STATUS_USER_BASE_DATA,    
                        payload : {
                            userData: returnCode.data,
                            isPush : returnCode.data.is_notification
                        }
                    });
                }
            }catch(e){
                console.log('eeeee',e)
            }
        }
       
    }
};

export function updateShowChatToastMessage(bool) {
    return {
        type: types.GLOBAL_STATUS_SHOW_CHAT_TOAST,
        showChatToastMessage : bool,
    };
}
export function updateShowMapToastMessage(bool) {
    return {
        type: types.GLOBAL_STATUS_SHOW_MAP_TOAST,
        showMapToastMessage : bool,
    };
}
