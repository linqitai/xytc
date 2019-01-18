let App = getApp();
var couponList = [];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav_select: false, // 快捷导航
    options: {}, // 当前页面参数

    address: null, // 默认收货地址
    exist_address: false, // 是否存在收货地址
    goods: {}, // 商品信息
    distribution_time : null, //配送时间
    pay_type:{},
    disabled: false,
    post_pay_type :10,
    post_dis_type :0,
    hasError: false,
    couponOptions: [],
    couponIndex: 0,
    couponId: '',
    error: '',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options,"options")
    // 当前页面参数
    this.data.options = options;
    console.log(options);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 获取当前订单信息
    this.getOrderData();

  },
  bindCouponPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      couponIndex: e.detail.value,
      couponId: couponList[e.detail.value].id
    })
    console.log(this.data.couponId,"couponId")
  },
  /**
   * 获取优惠券列表
   */
  getCouponList() {
    var _this = this;
    // _this.data.order_total_price
    App._get('coupon/lists', {
      money: this.data.order_total_price
    }, function (result) {
      console.log(result,"conponResult")
      couponList = result.data.data;
      var couponOptions = [];
      for (var i = 0; i < couponList.length;i++) {
        couponOptions.push(`满${couponList[i].invest_money}减${couponList[i].money}`)
      }
      _this.setData({
        couponOptions: couponOptions,
        couponId: couponList[0].id
      })
      console.log(_this.data.couponId,"getCouponList couponId")
    });
  },
  /**
   * 获取当前订单信息
   */
  getOrderData: function() {
    let _this = this,
      options = _this.data.options;

    // 获取订单信息回调方法
    let callback = function(result) {
      if (result.code !== 1) {
        App.showError(result.msg);
        return false;
      }
      // 显示错误信息
      if (result.data.has_error) {
        _this.data.hasError = true;
        _this.data.error = result.data.error_msg;
        App.showError(_this.data.error);
      }
      _this.setData(result.data);
      _this.getCouponList();
    };

    // 立即购买
    if (options.order_type === 'buyNow') {
      App._get('order/buyNow', {
        goods_id: options.goods_id,
        goods_num: options.goods_num,
        goods_sku_id: options.goods_sku_id,
        pay_type: options.pay_type,
        dis_type: options.dis_type,
        coupon_id:_this.data.couponId
      }, function(result) {
        callback(result);
      });
    }

    // 购物车结算
    else if (options.order_type === 'cart') {
      App._get('order/cart', {

        }, function(result) {
        callback(result);
      });
    }

  },
  radioChange: function (e) {
    this.setData({
      post_pay_type: e.detail.value
    })
  },
  bindPickerChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      post_dis_type: e.detail.value,

    })
  },
  /**
   * 选择收货地址
   */
  selectAddress: function() {
    wx.setStorageSync('operate', 'add');
    wx.setStorageSync('_from', 'flow')
    wx.navigateTo({
      url: '../address/' + (this.data.exist_address ? 'index?from=flow' : 'create')
    });
  },

  /**
   * 订单提交
   */
  submitOrder: function() {
    let _this = this,
      options = _this.data.options,
      post_pay_type = _this.data.post_pay_type,
      post_dis_type = _this.data.post_dis_type;
    if (_this.data.disabled) {
      return false;
    }
    if (_this.data.hasError) {
      App.showError(_this.data.error);
      return false;
    }

    // 订单创建成功后回调--微信支付
    let callback = function(result) {
      if (result.code === -10) {
        App.showError(result.msg, function() {
          // 跳转到未付款订单
          wx.redirectTo({
            url: '../order/index?type=payment',
          });
        });
        return false;
      }

      //条件为线上支付 
      if(post_pay_type==10){
        // 发起微信支付
        wx.requestPayment({
          timeStamp: result.data.payment.timeStamp,
          nonceStr: result.data.payment.nonceStr,
          package: 'prepay_id=' + result.data.payment.prepay_id,
          signType: 'MD5',
          paySign: result.data.payment.paySign,
          success: function (res) {
            // 跳转到订单详情
            wx.redirectTo({
              url: '../order/detail?order_id=' + result.data.order_id,
            });
          },
          fail: function () {
            App.showError('订单未支付', function () {
              // 跳转到未付款订单
              wx.redirectTo({
                url: '../order/index?type=payment',
              });
            });
          },
        });
      }else{
        wx.redirectTo({
          url: '../order/detail?order_id=' + result.data.order_id,
        });
      }
      
    };

    // 按钮禁用, 防止二次提交
    _this.data.disabled = true;

    // 显示loading
    wx.showLoading({
      title: '正在处理...'
    });

    // 创建订单-立即购买
    if (options.order_type === 'buyNow') {
      App._post_form('order/buyNow', {
        goods_id: options.goods_id,
        goods_num: options.goods_num,
        goods_sku_id: options.goods_sku_id,
        pay_type: post_pay_type,
        dis_type: post_dis_type,
      }, function(result) {
        // success
        console.log('success');
        callback(result);
      }, function(result) {
        // fail
        console.log('fail');
      }, function() {
        // complete
        console.log('complete');
        // 解除按钮禁用
        _this.data.disabled = false;
      });
    }

    // 创建订单-购物车结算
    else if (options.order_type === 'cart') {
      App._post_form('order/cart', {
        pay_type: post_pay_type,
        dis_type: post_dis_type,
      }, function(result) {
        // success
        console.log('success');
        callback(result);
      }, function(result) {
        // fail
        console.log('fail');
      }, function() {
        // complete
        console.log('complete');
        // 解除按钮禁用
        _this.data.disabled = false;
      });
    }

  },

  /**
   * 快捷导航 显示/隐藏
   */
  commonNav: function() {
    this.setData({
      nav_select: !this.data.nav_select
    });
  },

  /**
   * 快捷导航跳转
   */
  nav: function(e) {
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

