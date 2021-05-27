/*
 * @Author: Liu Xiaodong
 * @Date: 2020-03-30 09:18:52
 * @LastEditTime: 2021-03-01 16:37:31
 * @Description: 统一分享
 */
import {
  PATH,
  Storage,
  LOG_CODES,
  LOG_TYPES,
} from '../module';

let app;

export const share = Behavior({

  lifetimes: {
    attached() {
      wx.showShareMenu();
      app = getApp();
    },
  },

  methods: {

    onShareAppMessage() {

      // 记录转发埋点
      app.saveLog(this.route, LOG_TYPES.OPEN_PAGE, LOG_CODES.SHARE);

      return {
        title: '',
        path: '',
        imageUrl: '',
      }
    },

  },
})
