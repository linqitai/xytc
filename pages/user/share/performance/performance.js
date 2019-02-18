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
    last_page: 1,
    begin_time: '',
    end_time: '',
    salesman_id: '',
    time_type:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options,'options')
    var that = this;
    if (options.salesman_id){
      that.setData({
        salesman_id: options.salesman_id
      })
    }
    if (options.time_type) {
      that.setData({
        begin_time: options.begin_time,
        end_time: options.end_time
      })
    }
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
  bindBeginDateChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      begin_time: e.detail.value
    })
    if (this.data.end_time) {
      listArr = [];
      this.getList();
    }
  },
  bindEndDateChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      end_time: e.detail.value
    })
    if (this.data.begin_time) {
      listArr = [];
      this.getList();
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },
  scroll(e) {
    // console.log(e.detail)
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
      begin_time: _this.data.begin_time,
      end_time: _this.data.end_time,
      salesman_id: _this.data.salesman_id,
      page: _this.data.page
    }
    App._get('user.index/sales_list', prams, function (result) {
      if(result.code == 1) {
        var list = result.data.list.data
        for (var i = 0; i < list.length; i++) {
          listArr.push(list[i])
        }
        _this.setData({
          list: listArr,
          last_page: result.data.list.last_page
        })
        console.log(_this.data.page, _this.data.last_page)
        if (_this.data.page == _this.data.last_page) {
          _this.setData({
            isLastPage: true
          })
        }
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