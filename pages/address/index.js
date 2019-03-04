let App = getApp();

Page({
  data: {
    list: [],
    default_id: null,
    nav_select: false, // 快捷导航
  },

  onLoad: function(options) {
    // 当前页面参数
    this.data.options = options;
    // wx.clearStorageSync();
    wx.setStorageSync('address_id', '')
    wx.setStorageSync('name', '')
    wx.setStorageSync('phone', '')
    wx.setStorageSync('region', '')
    wx.setStorageSync('address', '')
    wx.setStorageSync('longitude', '')
    wx.setStorageSync('latitude', '')
    // wx.setStorageSync('addToUrl', '')
  },
  
  onShow: function() {
    // 获取收货地址列表
    this.getAddressList();
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
  },
  /**
   * 获取收货地址列表
   */
  getAddressList: function() {
    let _this = this;
    App._get('address/lists', {}, function(result) {
      _this.setData(result.data);
    });
  },

  /**
   * 添加新地址
   */
  createAddress: function() {
    wx.setStorageSync('address_id', '')
    wx.setStorageSync('name', '')
    wx.setStorageSync('phone', '')
    wx.setStorageSync('region', '')
    wx.setStorageSync('address', '')
    wx.setStorageSync('longitude', '')
    wx.setStorageSync('latitude', '')
    wx.setStorageSync('operate', 'add')
    wx.navigateTo({
      url: './create'
    });
  },

  /**
   * 编辑地址
   */
  editAddress: function(e) {
    wx.setStorageSync('operate', 'edit')
    wx.setStorageSync('address_id', e.currentTarget.dataset.id)
    wx.showNavigationBarLoading();
    // wx.navigateTo({
    //   url: "./create?address_id=" + e.currentTarget.dataset.id
    // });
    wx.navigateTo({
      url: `./create?address_id=${e.currentTarget.dataset.id}&longitude=${e.currentTarget.dataset.lon}&latitude=${e.currentTarget.dataset.lat}`
    });
  },

  /**
   * 移除收货地址
   */
  removeAddress: function(e) {
    let _this = this,
      address_id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "提示",
      content: "您确定要移除当前收货地址吗?",
      success: function(o) {
        o.confirm && App._post_form('address/delete', {
          address_id
        }, function(result) {
          _this.getAddressList();
        });
      }
    });
  },

  /**
   * 设置为默认地址
   */
  setDefault: function(e) {
    let _this = this,
      address_id = e.detail.value;
    _this.setData({
      default_id: parseInt(address_id)
    });
    App._post_form('address/setDefault', {
      address_id
    }, function(result) {
      console.log("setDefault success")
      console.log(wx.getStorageSync('_from'),"wx.getStorageSync('_from')")
      if (wx.getStorageSync('_from') == 'flow'){
        wx.navigateBack();
      }
    });
    return false;
  },

});