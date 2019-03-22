let App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataType: 'all',
    list: [],
    orderCount:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.type,"options")
    console.log(wx.getStorageSync('type'),"wx.getStorageSync('type')")
    this.setData({ dataType: options.type || wx.getStorageSync('type') || 'all' });
    // 获取订单列表
    this.getOrderList(this.data.dataType || wx.getStorageSync('type'));
    if (options.type) {
      wx.setStorageSync('type', options.type)
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },
  onUnload: function () {
    console.log("----------------onUnLoad----------------")
    wx.redirectTo({
      url: '../user/index'
    })
  },
  /**
   * 获取订单列表
   */
  getOrderList: function (dataType) {
    let _this = this;
    App._get('user.order/lists', { dataType }, function (result) {
      console.log(result.data.orderCount,"result.data.orderCount")
      _this.setData({
        list: result.data.list.data,
        orderCount: result.data.orderCount
      });
      result.data.list.data.length && wx.pageScrollTo({
        scrollTop: 0
      });
    });
  },

  /**
   * 切换标签
   */
  bindHeaderTap: function (e) {
    let type = e.target.dataset.type
    wx.setStorageSync('type', type)
    console.log(type,"type")
    this.setData({ dataType: type });
    // 获取订单列表
    this.getOrderList(type);
  },

  /**
   * 取消订单
   */
  cancelOrder: function (e) {
    let _this = this;
    let order_id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "提示",
      content: "确认取消订单？",
      success: function (o) {
        if (o.confirm) {
          App._post_form('user.order/cancel', { order_id }, function (result) {
            _this.getOrderList(_this.data.dataType);
          });
        }
      }
    });
  },

  /**
   * 确认收货
   */
  receipt: function (e) {
    let _this = this;
    let order_id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "提示",
      content: "是否确认收货？",
      success: function (o) {
        if (o.confirm) {
          App._post_form('user.order/receipt', { order_id }, function (result) {
            _this.getOrderList(_this.data.dataType);
          });
        }
      }
    });
  },
  /**
   * 发起货到付款
   */
  offlinePay(e){
    let _this = this;
    let order_id = e.currentTarget.dataset.id;
    App.showModel("是否将订单改为货到付款？",function(res){
      if (res.confirm) {
        App._post_form('user.order/update_offline', { order_id }, function (result) {
          console.log(result)
          if (result.code == 1) {
            App.showSuccess(result.msg, function () {
              _this.getOrderList(_this.data.dataType);
            })
          }
        });
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    })
  },
  /**
   * 发起付款
   */
  payOrder: function (e) {
    let _this = this;
    let order_id = e.currentTarget.dataset.id;

    // 显示loading
    wx.showLoading({ title: '正在处理...', });
    App._post_form('user.order/pay', { order_id }, function (result) {
      if (result.code === -10) {
        App.showError(result.msg);
        return false;
      }
      // 发起微信支付
      wx.requestPayment({
        timeStamp: result.data.timeStamp,
        nonceStr: result.data.nonceStr,
        package: 'prepay_id=' + result.data.prepay_id,
        signType: 'MD5',
        paySign: result.data.paySign,
        success: function (res) {
          // 跳转到已付款订单
          wx.navigateTo({
            url: '../order/detail?order_id=' + order_id
          });
        },
        fail: function () {
          App.showError('订单未支付');
        },
      });
    });
  },

  /**
   * 跳转订单详情页
   */
  detail: function (e) {
    let order_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../order/detail?order_id=' + order_id
    });
  },

  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  }


});