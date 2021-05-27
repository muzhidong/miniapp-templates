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

    ([success, fail, complete, sync] = checkParams(success, fail, complete, sync));

    if (sync) {
      handleSyncCode(() => {
        wx.setStorageSync(key, value);
      }, success, fail, complete)
    } else {
      const obj = getOpts({
        key,
        data: value,
        success,
        fail,
        complete,
      })
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

    ([success, fail, complete, sync] = checkParams(success, fail, complete, sync));

    if (sync) {
      let value;
      try {
        value = wx.getStorageSync(key);
        success && success(value);
      } catch (error) {
        value = error;
        fail && fail(error);
      } finally {
        complete && complete();
      }
      return value;
    } else {
      const obj = {
        key: key,
        success: function(res) {
          success && success(res.data);
        },
        fail: function(err) {
          fail && fail(err);
        },
        complete: function(res) {
          complete && complete(res);
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

    ([success, fail, complete, sync] = checkParams(success, fail, complete, sync));

    if (sync) {
      handleSyncCode(() => {
        wx.removeStorageSync(key);
      }, success, fail, complete)
    } else {
      const obj = getOpts({
        key,
        success,
        fail,
        complete,
      });
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

    ([success, fail, complete, sync] = checkParams(success, fail, complete, sync));

    if (sync) {
      handleSyncCode(() => {
        wx.clearStorageSync();
      }, success, fail, complete)
    } else {
      const obj = getOpts({
        success,
        fail,
        complete,
      });
      wx.clearStorage(obj);
    }
  },
};

function getOpts(extra = {}) {
  return {
    success: function(res) {
      success && success(res);
    },
    fail: function(err) {
      fail && fail(err);
    },
    complete: function(res) {
      complete && complete(res);
    },
    ...extra,
  }
}

function handleSyncCode(func, success, fail, complete) {
  try {
    func && func();
    success && success();
  } catch (error) {
    fail && fail(error);
  } finally {
    complete && complete();
  }
}

function checkParams(success, fail, complete, sync) {

  if (typeof success === "boolean") {
    return [null, null, null, success];
  } else {
    return [success, fail, complete, sync];
  }

}
