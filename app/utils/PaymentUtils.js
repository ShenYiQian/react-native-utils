import React from 'react';
import {
  Alert,
  NativeModules
} from 'react-native';
import { pay } from 'react-native-alipay';
const { InAppUtils } = NativeModules

export function iapPay(productId, callBack) {
  InAppUtils.loadProducts([productId], (error, products) {
    if (error) {
      Alert.alert(error);
      return;
    }
    InAppUtils.purchaseProduct(productId, (error, response) {
      if (error) {
        Alert.alert(error);
        return;
      }
      if (response && response.transactionReceipt) {
        InAppUtils.receiptData((error, receiptData) {
          if (error) {
            Alert.alert(error);
            return;
          }
          callBack(receiptData);
        });
      }
    });
  });
}

export function AlipayByUrl(urlType, params, alipayUrl = '') {
  return new Promise(async function (resolve, reject) {
    try {
      let result = {};
      if (alipayUrl.length <= 0) {
        let response = await fetch(global.httpURL + urlType, {
          method: 'POST',
          mode: "no-cors",
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params
        })
        let responseJson = await response.json();
        result.status = 0;
        result.response = responseJson;
        if (responseJson.status !== 1) {
          reject(result);
          return;
        }
        alipayUrl = responseJson.url;
      }
      console.log('payment', alipayUrl);
      const pay_result = await pay(alipayUrl, true);
      if (pay_result.resultStatus === '9000') {
        result.status = 1;
        result.msg = '支付成功';
      } else if (pay_result.resultStatus === '8000') {
        Alert.alert('提示', '支付结果确认中,请稍后查看您的账户确认支付结果');
        result.status = 0;
        result.msg = '支付结果确认中,请稍后查看您的账户确认支付结果';
      } else if (pay_result.resultStatus !== '6001') {
        // 如果用户不是主动取消
        Alert.alert('提示', '支付失败');
        result.status = 0;
        result.msg = '支付失败';
      }
      resolve(result);
    } catch (err) {
      console.log(err);
      result.status = 0;
      result.msg = '支付失败';
      reject(result);
    }
  });
}