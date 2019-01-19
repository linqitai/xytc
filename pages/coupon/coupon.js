let App = getApp();
var couponList = []
Page({

  /**
   * 页面的初始数据
   */
  data: {
    couponList: [],
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
    // 获取当前订单信息
    this.getList();
  },
  getList() {

  },
  getList() {
    var _this = this;
    App._get('coupon/lists', {
      money: 0
    }, function (result) {
      console.log(result, "conponResult")
      
      couponList = result.data.data
      for(var i=0;i<couponList.length;i++) {
        var time = couponList[i].add_time.text;
        console.log(time.split(' ')[0],"time.split(' ')[0]")
        couponList[i].add_time.date = time.split(' ')[0]
      }
      _this.setData({
        couponList: couponList
      })
    });
  },
  toUseBtn(){
    console.log("you click me")
    wx.switchTab({
      url: '/pages/category/index',
    })
  },
  /**
   * 快捷导航 显示/隐藏
   */
  commonNav: function () {
    this.setData({
      nav_select: !this.data.nav_select
    });
  },

  /**
   * 快捷导航跳转
   */
  nav: function (e) {
    let url = '';
    switch (e.currentTarget.dataset.index) {
      case 'home':
        url = '../index/index';
        break;
      case 'fenlei':
        url = '../category/index';
        break;
      case 'cart':
        url = '../flow/index';
        break;
      case 'profile':
        url = '../user/index';
        break;
    }
    wx.switchTab({
      url
    });
  }
});