let App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 授权登录
   */
  authorLogin: function (e) {
    let _this = this;
    if (e.detail.errMsg !== 'getUserInfo:ok') {
      return false;
    }
    wx.showLoading({ title: "正在登录", mask: true });
    // 执行微信登录
    wx.login({
      success: function (res) {
        // 发送用户信息
        App._post_form('user/login'
          , {
            code: res.code,
            user_info: e.detail.rawData,
            encrypted_data: e.detail.encryptedData,
            iv: e.detail.iv,
            signature: e.detail.signature
          }
          , function (result) {
            // 记录token user_id
            wx.setStorageSync('token', result.data.token);
            wx.setStorageSync('user_id', result.data.user_id);
            App.getUserDetail()
            // 跳转回原页面
            console.log(wx.getStorageSync('currentPage').route,"currentPage");
            let route = wx.getStorageSync('currentPage').route;
            if (route == 'pages/index/index') {
              wx.redirectTo({
                url: '../index/index',
              })
            } else {
              _this.navigateBack();
            }
          }
          , false
          , function () {
            wx.hideLoading();
          });
      }
    });
  },
  /**
     * 获取当前用户信息
     */
  // getUserDetail: function () {
  //   let _this = this;
  //   App._get('user.index/detail', {}, function (result) {
  //     App.globalData.userInfo = result.data.userInfo
  //     App.globalData.orderCount = result.data.orderCount
  //     console.log(App.globalData.userInfo, "App.globalData.userInfo")
  //     if (App.globalData.userInfo.store_cert == 1) {
  //       App.globalData.tab_bar[2].is_show = true
  //     }
  //   });
  // },
  /**
   * 授权成功 跳转回原页面
   */
  navigateBack: function () {
    wx.navigateBack();
    // let currentPage = wx.getStorageSync('currentPage');
    // wx.redirectTo({
    //   url: '/' + currentPage.route + '?' + App.urlEncode(currentPage.options)
    // });
  },

})