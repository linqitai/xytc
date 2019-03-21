let App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    orderCount: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setStorageSync('_from', '');
    console.log(App.globalData.tab_bar,"App.globalData.tab_bar")
    this.setData({
      active: App.setActive(2), // 如果是商户，tab-bar会多一个批发，那么active动态+1
      tab_bar: App.globalData.tab_bar
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this;
    _this.getUserDetail();
  },

  /**
   * 获取当前用户信息
   */
  getUserDetail: function () {
    let _this = this;
    App._get('user.index/detail', {}, function (result) {
      _this.setData(result.data);
      App.globalData.userInfo = result.data.userInfo
      App.globalData.orderCount = result.data.orderCount
      if (App.globalData.userInfo.store_cert == 1) {
        App.globalData.tab_bar[2].is_show = true
      }
    });
  },


})