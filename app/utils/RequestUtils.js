import {
    AsyncStorage,
    Alert
} from 'react-native';

import { writeFile } from './FileUtils';
import { HTTP_URL } from '../constants/Urls';
import RNFetchBlob from 'react-native-fetch-blob';

const queryString = require('query-string');

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
