import React from 'react';
import {
    Platform
} from 'react-native';
import RNFS from 'react-native-fs';

export function readFile(fileName, fileType) {
    return new Promise(async function (resolve, reject) {
        const url = RNFS.DocumentDirectoryPath;
        const path = url + '/' + fileName + '.' + fileType;
        let isExist = await RNFS.exists(path);
        if (!isExist) {
            if (fileType === 'json') {
                resolve(null);
            } else {
                resolve('');
            }
        } else {
            let content = await RNFS.readFile(path, 'utf8');
            if (fileType === 'json') {
                resolve(JSON.parse(content));
            } else {
                resolve(content);
            }
        }
    })
}

export function readImage(imagePath) {
    return new Promise(async function (resolve, reject) {
        let isExist = await RNFS.exists(imagePath);
        if (!isExist) {
            resolve(null);
        } else {
            let content = RNFS.readFile(imagePath, 'base64');
            resolve(content);
        }
    })
}

export function writeFile(fileName, fileType, fileContent) {
    return new Promise(async function (resolve, reject) {
        const url = RNFS.DocumentDirectoryPath;
        const path = url + '/' + fileName + '.' + fileType;
        let isExist = await RNFS.exists(path);
        let success = false;
        if (!isExist) {
            if (fileType === 'json') {
                success = await RNFS.writeFile(path, JSON.stringify(fileContent), 'utf8');
            } else if (fileType === 'txt') {
                success = await RNFS.writeFile(path, fileContent, 'utf8');
            }
        } else {
            let content = await RNFS.readFile(path, 'utf8');
            if (fileType === 'json') {
                let contentJson = JSON.parse(content);
                if (contentJson && contentJson instanceof Array) {
                    if (fileContent instanceof Array) {
                        fileContent.map(item => { contentJson.push(item) });
                    }
                    else {
                        contentJson.push(fileContent);
                    }
                }
                success = await RNFS.writeFile(path, JSON.stringify(contentJson), 'utf8');
            }
            else if (fileType === 'txt') {
                success = await RNFS.appendFile(path, fileContent, 'utf8');
            }
        }
        resolve(success);
    })
}

export function deleteFile(fileName, fileType) {
    const url = RNFS.DocumentDirectoryPath;
    const path = url + '/' + fileName + '.' + fileType;
    return RNFS.unlink(path);
}