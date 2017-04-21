import {
    AsyncStorage,
    Alert
} from 'react-native';

import mess from '../proto/msg';
import { writeFile } from './FileUtils';
import ByteBuffer from 'byte-buffer';
import { HTTP_URL, WS_URL } from '../constants/Urls';
import * as IMConst from '../constants/IMs';
import RNFetchBlob from 'react-native-fetch-blob';

const queryString = require('query-string');

export function request(component, url, params, method = 'GET', headers = {}, body = null, resolveSlef = true) {
    return new Promise(async function (resolve, reject) {
        console.log('request start')
        console.log(url);
        console.log(body);
        const stringified = queryString.stringify(params);
        let response = await fetch(`${HTTP_URL}${url}?${stringified}`, method !== 'GET' ? {
            method: method,
            headers: headers,
            body: body,
            timeout: 10000
        } : 'GET');
        if (response.status == 200 || response.status == 201 || response.status == 304) {
            let responseJson = await response.json();
            //let { navigator } = component.props;
            if (responseJson.result === 'ok') {
                resolve(responseJson.data);
            } else {
                if (resolveSlef) {
                    /*switch (responseJson.status) {
                        case 106:
                            await SplashScreen.close({
                                animationType: SplashScreen.animationType.scale,
                                duration: 850,
                                delay: 500,
                            });
                            console.log('sync返回106', responseJson);
                            await CustomSync.removeKey('sessionID');
                            global.sessionID = null;
                            if (navigator) {
                                navigator.resetTo({
                                    name: 'Register',
                                    component: Register,
                                    params: {
                                        navigator: navigator
                                    }
                                })
                            }
                            if (global.sessionID) {
                                Alert.alert('', '登录过期，请登录');
                            } else {
                                Alert.alert('', '请注册并登录TheBlue');
                            }
                            break;
                        case 804:
                            Alert.alert('您的现金券不足', null, [
                                {
                                    text: '前往充值', onPress: () => {
                                        if (navigator) {
                                            navigator.resetTo({
                                                name: 'Recharge',
                                                component: Recharge,
                                                params: {
                                                    navigator: navigator
                                                }
                                            })
                                        }
                                    }
                                },
                                { text: '残忍拒绝', onPress: () => console.log('custom refuse recharge') },
                            ]);
                            break;
                        default:
                            console.log(responseJson);
                            Alert.alert('', global.errorcode[responseJson.status].msg);
                            break;
                    }*/
                }
                reject(responseJson);
                Alert.alert(responseJson.msg);
            }
        } else {
            reject(response.status);
            Alert.alert('', '网络中断，请稍后重新连接');
            return;
        }
    })
}

export function requestBlob(url, params) {
    return new Promise(function (resolve, reject) {
        let noNullParams = {};
        for(let key of Object.keys(params)) {
            if(params[key] !== null && params[key] !== undefined) {
                noNullParams[key] = params[key];
            }
        }
        const stringified = queryString.stringify(noNullParams);
        const request_url = `${HTTP_URL}${url}?${stringified}`;
        console.log('requestBlob url = ' + request_url);
        RNFetchBlob.fetch('GET', request_url)
            .then(res => {
                let json = res.json();
                if (json.result === 'ok') {
                    console.log('fetch success url = ' + request_url);
                    resolve(json.data);
                } else {
                    console.warn('fetch failed url = ' + request_url);
                    reject(json.msg);
                }
            })
            .catch(err => {
                console.warn('fetch failed url = ' + request_url);
                reject('网络中断，请稍后重新连接');
            })
    })
}

export function uploadImage(type, default_avatar, token, image_uri) {
    return new Promise(function (resolve, reject) {
        RNFetchBlob.fetch('POST', `${HTTP_URL}uploadimage`, {
            'Headers': {
                type,
                default_avatar,
                token
            }
        }, RNFetchBlob.wrap(image_uri))
            .then(res => {
                let json = res.json();
                if (json.result === 'ok') {
                    console.log('server uploadimage success');
                    resolve(true);
                } else {
                    console.warn('server reject uploadimage json = ', json);
                    reject(json);
                }
            })
            .catch(err => {
                console.warn('blob throw err = ', err);
                reject(err);
            })
    })
}

/*
 *  websocket
 */

var chatMessages = {};
var notifications = [];
var registerComponent = null;
var ws = null;
var packageIndex = 0;

export function getTargetMessage(targetUserId, targetNickName, sex = 0) {
    if (!chatMessages[targetUserId]) {
        chatMessages[targetUserId] = {};
        chatMessages[targetUserId].chatList = new Array();
        chatMessages[targetUserId].missedMessage = 0;
        chatMessages[targetUserId].targetId = targetUserId;
        chatMessages[targetUserId].targetNickname = targetNickName;
        chatMessages[targetUserId].sex = sex;
        chatMessages[targetUserId].chatList.unshift(
            {
                _id: Math.round(Math.random() * 1000000),
                text: "天知，地知，你知，我... ...出于对用户的隐私性负责，TheBlue不会保存您和" + targetNickName + "任何聊天记录如有重要信息，记得自行保存哟~",
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: 'Blue',
                },
            }
        );
    }
    return chatMessages[targetUserId];
}

pushMissMessage = (message) => {
    let messageObject = getTargetMessage(message.userId.toString(), message.nickName, message.sex);
    messageObject.chatList.unshift(JSON.parse(message.content));
    messageObject.missedMessage++;
}

export function setRegisterComponent(component) {
    registerComponent = component;
}

export function packageSend(data, packageId) {
    if (ws == null) {
        console.warn('websocket is null');
        return;
    }

    // 填充包头
    var buff = new ByteBuffer(8 + data.length);

    buff.writeUnsignedInt(packageId, ByteBuffer.LITTLE_ENDIAN);                           // ReqAuthentication 的包号
    buff.writeUnsignedShort(packageIndex, ByteBuffer.LITTLE_ENDIAN);               // 中华说这个是客户端包序列种子,每发送一次需要++
    buff.writeUnsignedShort(data.length, ByteBuffer.LITTLE_ENDIAN);                       // 后续长度
    buff.write(data);                                                                     // 写入二进制序列

    packageIndex++;

    var buffers = new Uint8Array(buff.buffer);
    // 发送 buffers
    ws.send(buffers);
}

export function initWebSocket(ssid) {
    return new Promise(function (resolve, reject) {
        ws = new WebSocket(WS_URL);
        packageIndex = 1;

        ws.onopen = () => {
            console.log("I openend the connection without troubles!");
            let auth = mess.imdef.ReqAuthentication.create({});
            console.log('connect ssid = ' + ssid)
            auth.sessionId = ssid;              // 从登录传下来的 ssid //target 497910e26814567da50bd6651cbe9828
            let data = mess.imdef.ReqAuthentication.encode(auth).finish();    // 生成二进制序列, 返回的是 Uint8Array

            console.log("encode data:");
            console.log(data);

            packageSend(data, 1067621048);
        };

        ws.onmessage = (e) => {
            console.log('recv message');
            console.log(e.data);        // e.data 的类型是  ArrayBuffer

            var buffers = new ByteBuffer(e.data);
            let pid = buffers.readUnsignedInt(ByteBuffer.LITTLE_ENDIAN);   // 读取包号
            let seq = buffers.readUnsignedShort(ByteBuffer.LITTLE_ENDIAN); // 读取种子号
            let len = buffers.readUnsignedShort(ByteBuffer.LITTLE_ENDIAN); // 读取序列长度

            console.log('pid = ' + pid + ' , seq = ' + seq + ' , len = ' + len);

            if (len > 0) {
                var buff = buffers.read(len);
                var data = new Uint8Array(buff.buffer);
            }
            let message = null;
            switch (pid) {
                case IMConst.ACKAUTHENTICATION:  // imdef.AckAuthentication
                    message = mess.imdef.AckAuthentication.decode(data);
                    global.ws = ws;
                    setInterval(_startHeartbeat, 30000);
                    resolve();
                    break;
                case IMConst.ACKSENDCHATMSG:    // imdef.AckSendChatMsg
                    if (registerComponent && registerComponent.onAckSendChatMsg) {
                        message = mess.imdef.AckSendChatMsg.decode(data);
                        registerComponent.onAckSendChatMsg(message);
                    }
                    console.log('AckSendChatMsg', message);
                    break;
                case IMConst.ACKHEARTBEAT:     // imdef.AckHeartbeat
                    break;
                case IMConst.RECEIVECHATMSG:    // imdef.ReceiveChatMsg
                    message = mess.imdef.ReceiveChatMsg.decode(data);
                    if (registerComponent && registerComponent.onReceiveChatMsg) {
                        registerComponent.onReceiveChatMsg(message);
                    }
                    console.log(message);
                    pushMissMessage(message);
                    let content = JSON.parse(message.content);
                    alertWithType('custom', message.nickName, content.text);
                    break;
                case IMConst.RECEIVEOFFLINECHATMSG:     // imdef.ReceiveOfflineChatMsg
                    let messages = mess.imdef.ReceiveOfflineChatMsg.decode(data);
                    if (messages && messages.length > 0) {
                        messages.map(message => {
                            pushMissMessage(message);
                        })
                    }
                    break;
                case IMConst.NOTIFICATION:    // imdef.Notification
                    /*
                    活动中抽奖 1
                    购买产品 2
                    现金券变化 3
                    
                    游记被评论 100
                    游记被浏览 101
                    游记被收藏 102
                    游记被点赞 103
                    游记被打赏 104
                    游记被举报 105
                    游记有更新 106
                    
                    Notification param
                        noticeType
                        content
                        parameters
                        createTime
                     */
                    let notification = mess.imdef.Notification.decode(data);
                    if (notification.noticeType == 3) {
                        notification.title = '现金券变化了';
                        notification.content = '您现金券变化了，你目前的代金券数量为:' + notification.parameters;
                    }
                    if (!notifications) {
                        notifications = [];
                    }
                    notifications.push(notification);
                    writeFile('custom_notifications', 'json', notifications);
                    if (registerComponent && registerComponent.onReceiveNotification) {
                        registerComponent.onReceiveNotification(notification);
                    }
                    alertWithType('info', '通知', notification.content);
                    break;
                case IMConst.RECEIVEOFFLINENOTIFICATION:    // imdef.ReceiveOfflineNotification
                    let notifications = mess.imdef.ReceiveOfflineNotification.decode(data);
                    if (!notifications) {
                        notifications = [];
                    }
                    notifications.map(notification => { notifications.push(notification) });
                    writeFile('custom_notifications', 'json', notifications);
                    break;
            }
        };

        ws.onerror = (e) => {
            console.log("There has been an error", e);
            reject(e);
        };

        ws.onclose = (e) => {
            console.log("I'm closing it");
            console.log(e.code, e.reason);
            reject(e);
        };
    });
}

_startHeartbeat = () => {
    var auth = mess.imdef.ReqHeartbeat.create({});
    var data = mess.imdef.ReqHeartbeat.encode(auth).finish();
    packageSend(data, 2424756646);
}