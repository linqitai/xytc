let App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 获取帮助列表
    this.getData();
  },

  /**
   * 获取帮助列表
   */
  getData: function () {
    let _this = this;
    App._get('user.index/expand_index', {}, function (result) {
      // _this.setData(result.data);
      // console.log(result,"result")
      if (result.code == 1) {
        _this.setData(result.data.data);
        // console.log(_this.data,"data")
      }
    });
  },

})