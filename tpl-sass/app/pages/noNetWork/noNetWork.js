
Component({

  /**
   * 组件的初始数据
   */
  data: {
    // 刷新操作是否在处理中
    isProcessing: false
  },

  /**
   * 组件的方法列表
   */
  methods: {

    refresh() {

      if (this.data.isProcessing) return;

      this.setData({
        isProcessing: true
      },()=>{
        // TODO: 补充刷新操作
        // ...
        
        // 恢复
        this._reset();
      });

    },

    _reset(){
      this.setData({
        isProcessing: false,
      })
    },

  }
});
