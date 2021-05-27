/*
 * @Author: Liu Xiaodong
 * @Date: 2020-06-04 14:51:59
 * @LastEditTime: 2021-03-22 11:35:47
 * @Description: 实时监控
 */
let log = wx.getRealtimeLogManager ? wx.getRealtimeLogManager() : null;

exports.Monitor = {

  info() {
    if (!log) return
    log.info.apply(log, arguments)
  },

  warn() {
    if (!log) return
    log.warn.apply(log, arguments)
  },

  error() {
    if (!log) return
    log.error.apply(log, arguments)
  },

  addFilterMsg(msg) {
    if (!log || !log.addFilterMsg) return
    if (typeof msg !== 'string') return
    log.addFilterMsg(msg)
  }

}
