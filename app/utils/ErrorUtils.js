import { removeKey } from './SyncUtils';

export function errorMsgResolve(msg, routes, curSceneName) {
    if(routes === null) {
        return;
    }

    switch(msg) {
        case '登录失败':
            removeKey('sessionID');
            if(curSceneName !== 'login') {
                routes.login();
            }
        break;
        default:
            console.error(msg);
    }
}