let App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods_list: [], // 商品列表
    order_total_num: 0,
    order_total_price: 0
  },
  is_pifa_selected: false,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.is_pifa_selected = App.globalData.is_pifa_selected
    console.log(this.is_pifa_selected,"is_pifa_selected")
    this.setData({
      active: App.setActive(2),// 根据用户信息来判断active
      tab_bar: App.globalData.tab_bar
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getCartList();
  },
  /**
   * 获取购物车列表
   */
  getCartList: function() {
    let _this = this;
    let url = '';
    console.log(_this.is_pifa_selected,"_this.is_pifa_selected")
    if (_this.is_pifa_selected){
      url = 'cart2/lists'
      App.setHeaderTitle("批发市场购物车")
    }else{
      url = 'cart/lists'
      App.setHeaderTitle("新零售购物车")
    }
    App._get(url, {}, function(result) {
      _this.setData(result.data);
    });
  },

  /**
   * 递增指定的商品数量
   */
  addCount: function(e) {
    let _this = this,
      index = e.currentTarget.dataset.index,
      goodsSkuId = e.currentTarget.dataset.skuId,
      goods = _this.data.goods_list[index],
      order_total_price = _this.data.order_total_price;
    // 后端同步更新
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let url = '';
    if (_this.store_cert==1) {
      url = 'cart2/add'
    } else {
      url = 'cart/add'
    }
    App._post_form(url, {
      goods_id: goods.goods_id,
      goods_num: 1,
      goods_sku_id: goodsSkuId
    }, function() {
      goods.total_num++;
      _this.setData({
        ['goods_list[' + index + ']']: goods,
        order_total_price: _this.mathadd(order_total_price, goods.goods_price)
      });
    });
  },

  /**
   * 递减指定的商品数量
   */
  minusCount: function(e) {
    let _this = this,
      index = e.currentTarget.dataset.index,
      goodsSkuId = e.currentTarget.dataset.skuId,
      goods = _this.data.goods_list[index],
      order_total_price = _this.data.order_total_price;

    if (goods.total_num > 1) {
      // 后端同步更新
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      let url = '';
      if (_this.store_cert==1) {
        url = 'cart2/sub'
      } else {
        url = 'cart/sub'
      }
      App._post_form(url, {
        goods_id: goods.goods_id,
        goods_sku_id: goodsSkuId
      }, function() {
        goods.total_num--;
        goods.total_num > 0 &&
        _this.setData({
          ['goods_list[' + index + ']']: goods,
          order_total_price: _this.mathsub(order_total_price, goods.goods_price)
        });
      });

    }
  },

  /**
   * 删除商品
   */
  del: function(e) {
    let _this = this,
      goods_id = e.currentTarget.dataset.goodsId,
      goodsSkuId = e.currentTarget.dataset.skuId;
    wx.showModal({
      title: "提示",
      content: "您确定要移除当前商品吗?",
      success: function(e) {
        let url = '';
        if (_this.store_cert==1) {
          url = 'cart2/delete'
        } else {
          url = 'cart/delete'
        }
        e.confirm && App._post_form(url, {
          goods_id,
          goods_sku_id: goodsSkuId
        }, function(result) {
          _this.getCartList();
        });
      }
    });
  },

  /**
   * 购物车结算
   */
  submit: function(t) {
    wx.setStorageSync('order_type', 'cart')
    wx.navigateTo({
      url: '../flow/checkout?order_type=cart'
    });
  },

  /**
   * 加法
   */
  mathadd: function(arg1, arg2) {
    return (Number(arg1) + Number(arg2)).toFixed(2);
  },

  /**
   * 减法
   */
  mathsub: function(arg1, arg2) {
    return (Number(arg1) - Number(arg2)).toFixed(2);
  },

  /**
   * 去购物
   */
  goShopping: function() {
    wx.switchTab({
      url: '../index/index',
    });
  }
})