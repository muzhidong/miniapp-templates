/*
 * @Author: Liu Xiaodong
 * @Date: 2020-09-08 14:55:26
 * @LastEditTime: 2020-10-28 09:19:30
 * @Description: 登录异常页
 */
// pages/exception/exception.js
import {
  PATH,
  log,
  share,
} from '../../module';

Component({

  options: {
    addGlobalClass: true,
    pureDataPattern: new RegExp('^_'),
  },

  behaviors: [log, share],

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    toIndex() {
      wx.redirectTo({
        url: PATH.INDEX,
      });
    }
  }
})