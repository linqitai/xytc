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
  store_cert:2,
  is_pifa_selected: false,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getCartList();
    this.store_cert = App.globalData.userInfo.store_cert;
  },
  /**
   * 获取购物车列表
   */
  getCartList: function() {
    let _this = this;
    let url = '';
    console.log(App.globalData.is_pifa_selected,"App.globalData.is_pifa_selected")
    if (App.globalData.is_pifa_selected){
      url = 'cart2/lists'
      App.setHeaderTitle("购物车")
    }else{
      url = 'cart/lists'
      App.setHeaderTitle("批发购物车")
    }
    App._get(url, {}, function(result) {
      console.log(result,"result:cart/list")
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
    console.log(_this.store_cert,"_this.store_cert:cart/add")
    if (App.globalData.is_pifa_selected) {
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
      if (App.globalData.is_pifa_selected){
        App.globalData.cart2++;
      }else{
        App.globalData.cart1++;
        console.log(App.globalData.cart1, "App.globalData.cart1")
      }
      _this.setData({
        ['goods_list[' + index + ']']: goods,
        order_total_price: _this.mathadd(App.deal_number(order_total_price), App.deal_number(goods.goods_price))
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
      if (App.globalData.is_pifa_selected) {
        url = 'cart2/sub'
      } else {
        url = 'cart/sub'
      }
      App._post_form(url, {
        goods_id: goods.goods_id,
        goods_sku_id: goodsSkuId
      }, function() {
        goods.total_num--;
        console.log("=====================")
        if (App.globalData.is_pifa_selected) {
          App.globalData.cart2--;
          console.log(App.globalData.cart2, "App.globalData.cart2")
        } else {
          App.globalData.cart1--;
          console.log(App.globalData.cart1, "App.globalData.cart1")
        }
        goods.total_num > 0 &&
        _this.setData({
          ['goods_list[' + index + ']']: goods,
          order_total_price: _this.mathsub(App.deal_number(order_total_price), App.deal_number(goods.goods_price))
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
      goodsSkuId = e.currentTarget.dataset.skuId,
      total_num = e.currentTarget.dataset.total_num;
    wx.showModal({
      title: "提示",
      content: "您确定要移除当前商品吗?",
      success: function(e) {
        let url = '';
        if (App.globalData.is_pifa_selected) {
          url = 'cart2/delete'
        } else {
          url = 'cart/delete'
        }
        e.confirm && App._post_form(url, {
          goods_id,
          goods_sku_id: goodsSkuId
        }, function(result) {
          if (App.globalData.is_pifa_selected) {
            App.globalData.cart2 = App.globalData.cart2 - total_num;
            console.log(App.globalData.cart2, "App.globalData.cart2")
          } else {
            App.globalData.cart1 = App.globalData.cart1 - total_num;
            console.log(App.globalData.cart1, "App.globalData.cart1")
          }
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
    wx.redirectTo({
      url: '../index/index',
    });
  }
})