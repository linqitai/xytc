App({

  /**
   * 全局变量
   */
  globalData: {
    user_id: null,
    userInfo:'',
    cart1:0,
    cart2:0,
    is_pifa_selected:false,
    tab_bar:[
      {
        name:'首页',
        icon:'home',
        is_show:true
      },
      {
        name: '分类',
        icon: 'category',
        is_show: true
      },
      {
        name: '批发',
        icon: 'pifa',
        is_show: false
      },
      {
        name: '我的',
        icon: 'person',
        is_show: true
      }
    ]
  },
  mapKey:'4AFBZ-OADKJ-SAZFN-KYM6M-F6IV3-7ABJ7',
  api_root: '', // api地址
  siteInfo: require('siteinfo.js'),

  /**
   * 生命周期函数--监听小程序初始化
   */
  onLaunch: function() {
    // 设置api地址
    this.setApiRoot();
    this.getCart_num();
  },
  deal_number(order_total_price){
    if (order_total_price.indexOf(',') > -1) {
      let index = order_total_price.indexOf(',')
      let arr = order_total_price.split('')
      arr.splice(index, 1)
      return arr.join('')
    }else{
      return order_total_price
    }
  },
  /**
   * 获取购物车数量
   */
  getCart_num: function () {
    let _this = this;
    _this._get('index/get_num', {}, function (result) {
      console.log(result,"result:get_num")
      _this.globalData.cart1 = result.data.data.cart1
      _this.globalData.cart2 = result.data.data.cart2
      console.log(_this.globalData.cart1, _this.globalData.cart2,'cart12')
    });
  },
  /**
   * 获取当前用户信息
   */
  getUserDetail: function () {
    let _this = this;
    _this._get('user.index/detail', {}, function (result) {
      _this.globalData.userInfo = result.data.userInfo
      _this.globalData.orderCount = result.data.orderCount
      console.log(_this.globalData.userInfo,"_this.globalData.userInfo")
    });
  },
  setActive(active){
    let _this = this;
    if (_this.globalData.userInfo.store_cert==1){
      return active+1
    }else{
      return active
    }
  },
  //获取相册授权
  getPhotosAuth: function() {
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              console.log('writePhotosAlbum授权成功')
            }
          })
        }
      }
    })
  },
  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {
    console.log("onShow","getUserDetail")
    let _this = this;
    // 获取当前用户信息
    if (!_this.globalData.userInfo) {
      _this.getUserDetail();
    }else{
      if (_this.globalData.userInfo.store_cert==1){
        _this.globalData.tab_bar[2].is_show = true
      }
    }
    // 获取小程序基础信息
    // this.getWxappBase(function(wxapp) {
    //   // 设置navbar标题、颜色
    //   wx.setNavigationBarColor({
    //     frontColor: wxapp.navbar.top_text_color.text,
    //     backgroundColor: wxapp.navbar.top_background_color
    //   })
    // });
  },

  /**
   * 设置api地址
   */
  setApiRoot: function() {
    this.api_root = this.siteInfo.siteroot + 'index.php?s=/api/';
  },
  hasNull: function (params) {
    var keys = Object.keys(params);
    for (var i = 0; i < keys.length; i++) {
      console.log(params[keys[i]], "params[keys[i]]")
      var obj = params[keys[i]];
      if (obj === 0) {
        return false;
      }
      if (!obj || obj == '') {
        return true;
      }
    }
    return false;
  },
  /**
   * 获取小程序基础信息
   */
  getWxappBase: function(callback) {
    let App = this;
    App._get('wxapp/base', {}, function(result) {
      // 记录小程序基础信息
      wx.setStorageSync('wxapp', result.data.wxapp);
      callback && callback(result.data.wxapp);
    }, false, false);
  },

  /**
   * 执行用户登录
   */
  doLogin: function() {
    // 保存当前页面
    let pages = getCurrentPages();
    if (pages.length) {
      let currentPage = pages[pages.length - 1];
      "pages/login/login" != currentPage.route &&
        wx.setStorageSync("currentPage", currentPage);
    }
    // 跳转授权页面
    wx.navigateTo({
      url: "/pages/login/login"
    });
  },

  /**
   * 当前用户id
   */
  getUserId: function() {
    return wx.getStorageSync('user_id');
  },

  /**
   * 显示成功提示框
   */
  showSuccess: function(msg, callback) {
    wx.showToast({
      title: msg,
      icon: 'success',
      success: function() {
        callback && (setTimeout(function() {
          callback();
        }, 1500));
      }
    });
  },
  /**
   * 显示失败提示框
   */
  toast: function (msg) {
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 700
    })
  },
  /**
   * 显示失败提示框
   */
  showToast: function (msg) {
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 1500
    })
  },
  /**
   * 显示失败提示框
   */
  showError: function(msg, callback) {
    wx.showModal({
      title: '友情提示',
      content: msg,
      showCancel: false,
      success: function(res) {
        // callback && (setTimeout(function() {
        //   callback();
        // }, 1500));
        callback && callback(res);
      }
    });
  },
  showModel: function (msg, callback) {
    wx.showModal({
      title: '友情提示',
      content: msg,
      success: function (res) {
        // callback && (setTimeout(function() {
        //   callback();
        // }, 1500));
        callback && callback(res);
      }
    });
  },
  /**
   * get请求
   */
  _get: function(url, data, success, fail, complete, check_login) {
    wx.showNavigationBarLoading();
    let App = this;
    // 构造请求参数
    data = data || {};
    data['wxapp_id'] = 10001;

    // if (typeof check_login === 'undefined')
    //   check_login = true;

    // 构造get请求
    let request = function() {
      data.token = wx.getStorageSync('token');
      wx.request({
        url: App.api_root + url,
        header: {
          'content-type': 'application/json'
        },
        data: data,
        success: function(res) {
          if (res.statusCode !== 200 || typeof res.data !== 'object') {
            console.log(res);
            App.showError('网络请求出错');
            return false;
          }
          if (res.data.code === -1) {
            // 登录态失效, 重新登录
            wx.hideNavigationBarLoading();
            App.doLogin();
          } else if (res.data.code === 0) {
            App.showError(res.data.msg);
            return false;
          } else {
            success && success(res.data);
          }
        },
        fail: function(res) {
          // console.log(res);
          App.showError(res.errMsg, function() {
            fail && fail(res);
          });
        },
        complete: function(res) {
          wx.hideNavigationBarLoading();
          complete && complete(res);
        },
      });
    };
    // 判断是否需要验证登录
    check_login ? App.doLogin(request) : request();
  },

  /**
   * post提交
   */
  _post_form: function(url, data, success, fail, complete) {
    wx.showNavigationBarLoading();
    let App = this;
    data.wxapp_id = App.siteInfo.uniacid;
    if (data.user_info){
      console.log("login")
    }else{
      data.token = wx.getStorageSync('token');
    }
    wx.request({
      url: App.api_root + url,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      data: data,
      success: function(res) {
        if (res.statusCode !== 200 || typeof res.data !== 'object') {
          App.showError('网络请求出错');
          return false;
        }
        if (res.data.code === -1) {
          // 登录态失效, 重新登录
          App.doLogin(function() {
            App._post_form(url, data, success, fail);
          });
          return false;
        } else if (res.data.code === 0) {
          App.showError(res.data.msg, function() {
            fail && fail(res);
          });
          return false;
        }
        success && success(res.data);
      },
      fail: function(res) {
        // console.log(res);
        App.showError(res.errMsg, function() {
          fail && fail(res);
        });
      },
      complete: function(res) {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        complete && complete(res);
      }
    });
  },

  /**
   * 验证是否存在user_info
   */
  validateUserInfo: function() {
    let user_info = wx.getStorageSync('user_info');
    return !!wx.getStorageSync('user_info');
  },

  /**
   * 对象转URL
   */
  urlEncode: function urlencode(data) {
    var _result = [];
    for (var key in data) {
      var value = data[key];
      if (value.constructor == Array) {
        value.forEach(function(_value) {
          _result.push(key + "=" + _value);
        });
      } else {
        _result.push(key + '=' + value);
      }
    }
    return _result.join('&');
  },

  /**
   * 设置当前页面标题
   */
  setTitle: function() {
    let App = this,
      wxapp;
    if (wxapp = wx.getStorageSync('wxapp')) {
      wx.setNavigationBarTitle({
        title: wxapp.navbar.wxapp_title
      });
    } else {
      // App.getWxappBase(function() {
      //   App.setTitle();
      // });
    }
  },
  setHeaderTitle(text){
    wx.setNavigationBarTitle({
      title: text
    });
  }
});