let _isShowToast = false;
let _loadingCount = 0;
let _lastLoadingParams = null;
let timer = null;

/**
 *
 * @param {
 *  timeout: 超时时间
 *  loadingInterval: loading的间隔，在这个间隔内不会重复显示
 * } options
 */
export function loadingAndToastFix (options) {

  const defaultOptions = { killLoadingTimeout: 10000, loadingInterval: 800 };
  const _options = Object.assign({}, defaultOptions, options);

  const { killLoadingTimeout, loadingInterval } = _options;

  const { showLoading, hideLoading, showToast, hideToast } = wx;

  Object.defineProperty(wx, 'showLoading', {
    configurable: true,
    enumerable: true,
    writable: true,
    value(...param) {

      _loadingCount++;

      // 如果正在显示toast，就不显示loading了
      if (_isShowToast) return;

      _lastLoadingParams = param;
      showLoading.apply(this, param);

      // 避免超时无法关闭loading
      timer && clearTimeout(timer);
      timer = setTimeout(() => {
        if (_loadingCount > 0) {
          _loadingCount = 0;
          hideLoading();
        }
      }, killLoadingTimeout);

    }
  });

  Object.defineProperty(wx, 'hideLoading', {
    configurable: true,
    enumerable: true,
    writable: true,
    value(...param) {

      _loadingCount--;

      if (_loadingCount < 0) {
        _loadingCount = 0;
        return;
      }
      
      _loadingCount = 0;
      // if (!_isShowToast) {
        // setTimeout(() => {
          // timer && clearTimeout(timer);
          hideLoading()
        // }, loadingInterval);
      // }

    }
  });

  Object.defineProperty(wx, 'showToast', {
    configurable: true,
    enumerable: true,
    writable: true,
    value(...param) {

      _isShowToast = true;

      showToast.apply(this, param);
      setTimeout(() => {
        _isShowToast = false;
        // hideToast();
      }, param.duration || 1500);

    }
  });

  Object.defineProperty(wx, 'hideToast', {
    configurable: true,
    enumerable: true,
    writable: true,
    value() {

      _isShowToast = false;
      hideToast.apply(this, param);

      if (_loadingCount > 0) {
        showLoading(_lastLoadingParams);
      }

    }
  })

}
