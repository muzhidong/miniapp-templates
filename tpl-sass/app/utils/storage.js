/**
 * 本地存储，提供set\get\remove\removeAll四种操作，默认同步。
 */
exports.Storage = {
  /**
   * @method set
   * @description 添加键值对到本地
   * @param {string} key  键
   * @param {*} value 值
   * @param {boolean|function} success 操作是否同步|成功回调
   * @param {function} fail 失败回调
   * @param {function} complete 完成回调
   * @param {function} sync 同步标志，默认为true 
   */
  set: function(key, value, success = null, fail = null, complete = null, sync = true) {
    if (typeof success === "boolean") {
      sync = success;
      success = null;
      fail = null;
      complete = null;
    }
    if (sync) {
      try {
        wx.setStorageSync(key, value);
        success && success();
      } catch (error) {
        fail && fail(error);
      } finally {
        complete && complete();
      }
    } else {
      const obj = {
        key: key,
        data: value,
        success: function() {
          success && success();
        },
        fail: function() {
          fail && fail();
        },
        complete: function() {
          complete && complete();
        },
      };
      wx.setStorage(obj);
    }
  },

  /**
   * @method get
   * @description 从本地获取键值对
   * @param {string} key  键
   * @param {boolean|function} success 操作是否同步|成功回调
   * @param {function} fail 失败回调
   * @param {function} complete 完成回调
   * @param {function} sync 同步标志，默认为true 
   */
  get: function(key, success = null, fail = null, complete = null, sync = true) {
    if (typeof success === "boolean") {
      sync = success;
      success = null;
      fail = null;
      complete = null;
    }
    if (sync) {
      let value = '';
      try {
        value = wx.getStorageSync(key);
        success && success(value);
      } catch (error) {
        fail && fail(error);
      } finally {
        complete && complete();
      }
      return value;
    } else {
      const obj = {
        key: key,
        success: function() {
          success && success();
        },
        fail: function() {
          fail && fail();
        },
        complete: function() {
          complete && complete();
        },
      };
      wx.getStorage(obj);
    }
  },

  /**
   * @method remove
   * @description 删除某个键值对
   * @param {string} key  键
   * @param {boolean|function} success 操作是否同步|成功回调
   * @param {function} fail 失败回调
   * @param {function} complete 完成回调
   * @param {function} sync 同步标志，默认为true 
   */
  remove: function(key, success = null, fail = null, complete = null, sync = true) {
    if (typeof success === "boolean") {
      sync = success;
      success = null;
      fail = null;
      complete = null;
    }
    if (sync) {
      try {
        wx.removeStorageSync(key);
        success && success();
      } catch (error) {
        fail && fail(error);
      } finally {
        complete && complete();
      }
    } else {
      const obj = {
        key: key,
        success: function(res) {
          success && success(res);
        },
        fail: function() {
          fail && fail();
        },
        complete: function() {
          complete && complete();
        },
      };
      wx.removeStorage(obj);
    }
  },

  /**
   * @method removeAll
   * @description 删除本地所有的键值对
   * @param {boolean|function} success 操作是否同步|成功回调
   * @param {function} fail 失败回调
   * @param {function} complete 完成回调
   * @param {function} sync 同步标志，默认为true 
   */
  removeAll: function(success = null, fail = null, complete = null, sync = true) {
    if (typeof success === "boolean") {
      sync = success;
      success = null;
      fail = null;
      complete = null;
    }
    if (sync) {
      try {
        wx.clearStorageSync();
        success && success();
      } catch (error) {
        fail && fail(error);
      } finally {
        complete && complete();
      }
    } else {
      const obj = {
        success: function(res) {
          success && success(res);
        },
        fail: function() {
          fail && fail();
        },
        complete: function() {
          complete && complete();
        }
      };
      wx.clearStorage(obj);
    }
  },
};
