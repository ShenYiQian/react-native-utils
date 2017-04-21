import {
    AsyncStorage,
} from 'react-native';

/*
 *  storage
 */
export function setStringForKey(key, str) {
    return AsyncStorage.setItem(key, str);
}

export function getStringForKey(key) {
    return AsyncStorage.getItem(key)
        .then((value) => {
            if (value !== null) {
                return value;
            }
            else {
                return null;
            }
        }
        )
        .catch((err) => {
            throw err;
        }
        )
}

export function setObjectForKey(key, obj) {
    return AsyncStorage.setItem(key, JSON.stringify(obj));
}

export function getObjectForKey(key) {
    return AsyncStorage.getItem(key)
        .then((value) => {
            if (value !== null) {
                return JSON.parse(value);
            }
            else {
                return null;
            }
        }
        )
        .catch((err) => {
            throw err;
        }
        )
}

export function removeKey(key) {
    return AsyncStorage.removeItem(key);
}