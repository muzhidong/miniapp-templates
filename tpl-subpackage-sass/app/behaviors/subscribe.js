/*
 * @Author: Liu Xiaodong
 * @Date: 2020-06-18 16:54:45
 * @LastEditTime: 2021-03-25 17:00:40
 * @Description: 订阅
 */

import {
  API,
  APPID,
  Storage,
} from '../module';

export const subscribe = Behavior({

  data: {
    _mainSwitch: true,
    _itemSettings: null,
    _subscribeTmpls: [],
  },

  methods: {
    // 同步检查是否勾选了总是
    _checkIsTickAlwaysSync() {

      let self = this;
      return new Promise((resolve, reject) => {
        wx.getSetting({
          withSubscriptions: true,
          success(res) {
            let {
              mainSwitch, //true表示允许订阅消息
              itemSettings, // undefined表示没有勾选总是
            } = res.subscriptionsSetting || {};
            console.log(mainSwitch, itemSettings);
            self.setData({
              _mainSwitch: mainSwitch,
              _itemSettings: itemSettings || '',
            }, () => {
              resolve(res.subscriptionsSetting || {});
            })
          },
          fail() {
            reject(false);
          }
        })
      });

    },

    // 同步获取模板信息
    // 目前各模板的对应类型值：服务完成15、税务申报 16、个税17、增值税 18（暂不上）
    // 不传scene 默认显示15、16、17
    // scene 1  只显示15、16
    _getTmplsSync(scene) {

      let self = this;
      return new Promise((resolve, reject) => {
        API.getSubscribeTemplates({
          appid: APPID,
        }).success((res) => {
          res.data = res.data.filter(item => {
            switch(scene){
              case 1:
                return ['15','16'].includes(item.type);
              default:
                return ['15', '16', '17'].includes(item.type);
            }
          });
          self.setData({
            _subscribeTmpls: res.data,
          }, () => {
            resolve(res.data);
          });
        }).error((err) => {
          reject(false);
        });
      });

    },

    // 发送订阅结果
    _sendSubscribeResult(result, khXxId = '') {

      // result结构： {kcqUoPiIy2Y7j-MU29bDLCfyZ2idW7M7IG2knRU4I7Q: "reject", errMsg: "requestSubscribeMessage:ok"}
      let tmplIdsArr = Object.keys(result);
      let acceptTmplIdsArr = [];
      Object.values(result).filter((value, index) => {
        if (value === 'accept') {
          acceptTmplIdsArr.push(tmplIdsArr[index]);
          return;
        }
      });

      let typeArr = [],type;
      for (let templateId of acceptTmplIdsArr) {
        type = this.data._subscribeTmpls.filter(item => {
          return item.templateId === templateId;
        }).map((item) => {
          return Number(item.type);
        });
        typeArr = typeArr.concat(type);
      }

      if (typeArr.length > 0) {
        let {
          openId = ''
        } = Storage.get('header');
        API.sendSubscribe({
          ftspMinigramSubscribeVO: JSON.stringify({
            listTemplateType: typeArr,
            receiveUserId: openId,
            openId,
            khKhxxId: khXxId,
          }),
        }).success((res) => {
          console.log('发送订阅成功');
        });
      }
    },

  }
})
