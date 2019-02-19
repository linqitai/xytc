let App = getApp();
var goodsList = [];
Page({
  data: {
    // banner轮播组件属性
    indicatorDots: true, // 是否显示面板指示点	
    autoplay: true, // 是否自动切换
    interval: 3000, // 自动切换时间间隔
    duration: 800, // 滑动动画时长
    imgHeights: {}, // 图片的高度
    imgCurrent: {}, // 当前banne所在滑块指针

    // 页面元素
    items: {},
    newest: {},
    goodsList: [],
    cate: {},
    scrollTop: 0,
    tabIndex: 0,
    cateList:[],
    curClassifyId:0,
    curClassifyIndex:0
  },

  onLoad: function() {
    // 刷新组件
    this.refreshView = this.selectComponent("#refreshView")
    // 设置页面标题
    // App.setTitle();
    // wx.clearStorageSync();
    wx.setStorageSync('category_id', '')
    // 获取首页数据
    this.getIndexData();
    this.getCateData();
    this.getGoodsData();
    // this.getBestGoodsData();
    this.getCategoryList();
  },
  /**
   * 切换list tab
   */
  switchTab(e) {
    var tabIndex = e.currentTarget.dataset.index;
    console.log(tabIndex,"index")
    this.setData({
      tabIndex
    })
  },
  toggleBtn: function (e) {
    let _this = this;
    var index = parseInt(e.currentTarget.dataset.index);
    goodsList[index].isOpen = !goodsList[index].isOpen;
    _this.setData({
      goodsList: goodsList
    })
  },
  subToCart: function (e) {
    console.log(e, 'e')
    let _this = this;
    let goodsId = e.currentTarget.dataset.goodsid
    let specId = e.currentTarget.dataset.specid
    var pramas = {
      goods_id: goodsId,
      goods_num: 1,
      goods_sku_id: specId ? specId : ''
    }
    console.log(pramas, "pramas")
    App._get('cart/sub', pramas, function (result) {
      if (result.code == 1) {
        // App.toast('-1')
        for (var i = 0; i < goodsList.length; i++) {
          if (specId) {
            for (var j = 0; j < goodsList[i].spec.length; j++) {
              if (goodsList[i].spec[j].spec_sku_id == specId) {
                goodsList[i].spec[j].cart_num = parseInt(goodsList[i].spec[j].cart_num) - 1;
                break;
              }
            }
          } else {
            if (goodsList[i].goods_id == goodsId) {
              goodsList[i].spec[0].cart_num = parseInt(goodsList[i].spec[0].cart_num) - 1;
              break;
            }
          }
        }
        _this.setData({
          goodsList
        })
      }
    });
  },
  addToCart: function (e) {
    let _this = this;
    let goodsId = e.currentTarget.dataset.goodsid
    let specId = e.currentTarget.dataset.specid
    var pramas = {
      goods_id: goodsId,
      goods_num: 1,
      goods_sku_id: specId ? specId : ''
    }
    console.log(pramas, "pramas")
    App._get('cart/add', pramas, function (result) {
      if (result.code == 1) {
        // App.toast('+1')
        for (var i = 0; i < goodsList.length; i++) {
          if (specId) {
            for (var j = 0; j < goodsList[i].spec.length; j++) {
              if (goodsList[i].spec[j].spec_sku_id == specId) {
                goodsList[i].spec[j].cart_num = parseInt(goodsList[i].spec[j].cart_num) + 1;
                break;
              }
            }
          } else {
            if (goodsList[i].goods_id == goodsId) {
              goodsList[i].spec[0].cart_num = parseInt(goodsList[i].spec[0].cart_num) + 1;
              break;
            }
          }
        }
        _this.setData({
          goodsList
        })
      }
    });
  },
  //触摸开始
  handletouchstart: function (event) {
    // console.log("触摸开始", event)
    this.refreshView.handletouchstart(event)
  },
  //触摸移动
  handletouchmove: function (event) {
    // console.log("触摸开始", event)
    this.refreshView.handletouchmove(event)
  },
  //触摸结束
  handletouchend: function (event) {
    // console.log("触摸结束")
    this.refreshView.handletouchend(event)
  },
  //触摸取消
  handletouchcancel: function (event) {
    // console.log("触摸取消")
    this.refreshView.handletouchcancel(event)
  },
  //页面滚动
  onPageScroll: function (event) {
    // console.log("页面滚动", event)
    this.refreshView.onPageScroll(event)
  },
  onPullDownRefresh: function () {
    console.log("onPullDownRefresh")
    // setTimeout(() => { this.refreshView.stopPullRefresh() }, 2000)
    // 获取首页数据
    this.getIndexData();
    this.getCateData();
    this.getGoodsData();
    this.getBestGoodsData();
  },
  _pullState: function(e) {
    console.log(e,"_pullState")
  },
  /**
   * 跳转到分类页面
   */
  toCategoryView: function(e) {
    var category_id = e.currentTarget.dataset.categoryid;
    console.log(category_id,"category_id")
    wx.setStorageSync('category_id', category_id)
    wx.reLaunch({
      url: '/pages/category/index'
    })
  },
  /**
   * 获取分类列表
   */
  getCategoryList: function () {
    let _this = this;
    App._get('category/lists', {}, function (result) {
      // console.log(result,"result")
      if (result.code == 1) {
        var cateList = result.data.list;
        console.log(cateList,"cateList")
        _this.setData({cateList})
      }
    });
  },
  /**
   * 选中分类
   */
  selectClassify: function (t) {
    let _this = this;
    let curClassifyId = t.target.dataset.id, curClassifyIndex = parseInt(t.target.dataset.index);
    this.setData({
      curClassifyId,
      curClassifyIndex
    });
    // this.getGoodsList(_this.data.curNav);
  },
  /**
   * 获取Banner数据
   */
  getIndexData: function() {
    let _this = this;
    App._get('index/page', {}, function(result) {
      _this.setData({
        items: result.data.items
      });
    });
  },
  /**
   * 获取分类数据
   */
  getCateData: function () {
    let _this = this;
    App._get('index/cate_list', {}, function (result) {
      _this.setData({
        cate: result.data.cate
      });
    });
  },
  /**
   * 获取商品数据
   */
  getGoodsData: function () {
    let _this = this;
    App._get('index/best_list', {}, function (result) {
      console.log(result,"result")
      goodsList = result.data.best
      for (var i = 0; i < goodsList.length; i++) {
        goodsList[i].isOpen = false;
      }
      _this.setData({
        goodsList
      })
    });
  },
  /**
   * 获取商品数据
   */
  getBestGoodsData: function () {
    let _this = this;
    App._get('index/best_list', {}, function (result) {
      _this.setData({
        best: result.data.best
      });
      _this.refreshView.stopPullRefresh()
    });
  },
  imagesHeight: function(e) {
    let imgId = e.target.dataset.id,
      itemKey = e.target.dataset.itemKey,
      ratio = e.detail.width / e.detail.height, // 宽高比
      viewHeight = 750 / ratio, // 计算的高度值
      imgHeights = this.data.imgHeights;

    // 把每一张图片的对应的高度记录到数组里
    if (typeof imgHeights[itemKey] === 'undefined') {
      imgHeights[itemKey] = {};
    }
    imgHeights[itemKey][imgId] = viewHeight;
    // 第一种方式
    let imgCurrent = this.data.imgCurrent;
    if (typeof imgCurrent[itemKey] === 'undefined') {
      imgCurrent[itemKey] = Object.keys(this.data.items[itemKey].data)[0];
    }
    this.setData({
      imgHeights,
      imgCurrent
    });
  },

  bindChange: function(e) {
    let itemKey = e.target.dataset.itemKey,
      imgCurrent = this.data.imgCurrent;
    // imgCurrent[itemKey] = e.detail.current;
    imgCurrent[itemKey] = e.detail.currentItemId;
    this.setData({
      imgCurrent
    });
  },

  goTop: function(t) {
    this.setData({
      scrollTop: 0
    });
  },

  scroll: function(t) {
    this.setData({
      indexSearch: t.detail.scrollTop
    }), t.detail.scrollTop > 300 ? this.setData({
      floorstatus: !0
    }) : this.setData({
      floorstatus: !1
    });
  },

  onShareAppMessage: function() {
    return {
      title: "小程序首页",
      desc: "",
      path: "/pages/index/index"
    };
  }
});