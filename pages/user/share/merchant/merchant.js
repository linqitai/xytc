let App = getApp();
var listArr = []
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    page: 1,
    windowHeight: '',
    isLastPage: false,
    last_page:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //设置scroll-view高度
    wx.getSystemInfo({
      success: function (res) {
        console.log(res, "res")
        that.setData({
          windowHeight: res.windowHeight
        });
      }
    });
    // 获取当前订单信息
    listArr = []
    this.getList();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },
  scroll(e) {
    // console.log(e.detail)
  },
  toPerformance(e) {
    var salesman_id = e.currentTarget.dataset.salesman_id
    console.log(salesman_id,"salesman_id")
    wx.navigateTo({
      url: '../performance/performance?salesman_id=' + salesman_id
    })
  },
  scrollToBottom() {
    console.log('scrollToBottom')
    var _this = this;
    console.log(_this.data.isLastPage, "_this.data.isLastPage")
    if (_this.data.isLastPage == false) {
      _this.setData({
        page: _this.data.page + 1
      })
      _this.getList();
    }
    if (_this.data.page == _this.data.last_page && _this.data.isLastPage == false) {
      _this.data.isLastPage = true;
      // App.toast("数据已经加载完毕")
      return;
    }
  },
  getList() {
    var _this = this;
    var prams = {
      page: _this.data.page
    }
    App._get('user.index/store_list', prams, function (result) {
      var list = result.data.lists.data
      for (var i = 0; i < list.length; i++) {
        listArr.push(list[i])
      }
      _this.setData({
        list: listArr,
        last_page: result.data.lists.last_page
      })
      console.log(_this.data.page, _this.data.last_page)
      if (_this.data.page == _this.data.last_page){
        _this.setData({
          isLastPage:true
        })
      }
    });
  },
  toUseBtn() {
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
  }
});