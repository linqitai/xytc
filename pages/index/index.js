let App = getApp();

Page({
  data: {
    // banner轮播组件属性
    indicatorDots: true, // 是否显示面板指示点	
    autoplay: true, // 是否自动切换
    interval: 3000, // 自动切换时间间隔
    duration: 800, // 滑动动画时长
    imgHeights: {}, // 图片的高度
    imgCurrent: {}, // 当前banne所在滑块指针
    test:'/pages/category/index?category_id=29',
    // 页面元素
    items: {},
    newest: {},
    best: {},
    cate: {},
    scrollTop: 0,
    top: '',
    left: '',
    windowWidth: '',
    windowHeight: ''
  },
  to_shopcart_view(){
    wx.navigateTo({
      url: "../flow/index"
    });
  },
  // 拖动不超过规定范围
  setTouchMove: function (e) {
    e.preventDefault();
    console.log("---------------- e.touches[0].clientX----------------8==" + e.touches[0].clientX)
    console.log("---------------- e.touches[0].clientX----------------8=======" + e.touches[0].clientY)
    if (e.touches[0].clientX < 650 && e.touches[0].clientY < 1110 && e.touches[0].clientX > 0 && e.touches[0].clientY > 0) {
      this.setData({
        left: e.touches[0].clientX,
        top: e.touches[0].clientY
      })
    }else{
      this.setData({
        left: 650,
        top: 1110
      })
    }
  },
  onShow: function() {
    let _this = this;
    console.log("----------------onShow-------------------")
    App.globalData.is_pifa_selected = true;
    console.log(App.globalData.is_pifa_selected, "App.globalData.is_pifa_selected")
    App.getUserDetail(function () {
      let tab_bar = App.globalData.tab_bar
      _this.setData({
        tab_bar: tab_bar
      })
    })
    // tab_bar[3].info = 2
    this.setData({
      active: 0
    })
    // 刷新组件
    this.refreshView = this.selectComponent("#refreshView")
    // 设置页面标题
    // App.setTitle();
    // wx.clearStorageSync();
    wx.setStorageSync('category_id', '')
    // 获取首页数据
    if (App.globalData.banner) {
      this.setData({
        items: App.globalData.banner
      })
    }else{
      this.getIndexData();
    }
    if (App.globalData.cate) {
      this.setData({
        cate: App.globalData.cate
      })
    } else {
      this.getCateData();
    }
    if (App.globalData.newest) {
      this.setData({
        newest: App.globalData.newest
      })
    } else {
      this.getGoodsData();
    }
    if (App.globalData.best) {
      this.setData({
        best: App.globalData.best
      })
    } else {
      this.getBestGoodsData();
    };
  },
  /**
   * 跳转到分类页面
   */
  toCategoryView: function (e) {
    var category_id = e.currentTarget.dataset.categoryid;
    console.log(category_id, "category_id")
    wx.setStorageSync('category_id', category_id)
    wx.reLaunch({
      url: '/pages/category/index?category_id=' + category_id
    })
  },
  toCategoryView2(e) {
    var linkurl = e.currentTarget.dataset.linkurl;
    console.log(linkurl, "linkurl")
    var to = linkurl.split('/')[2];
    console.log(to,"split[2]")
    if (to =='category'){
      wx.reLaunch({
        url: linkurl
      })
    }else{
      wx.navigateTo({
        url: linkurl
      })
    }
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
   * 获取Banner数据
   */
  getIndexData: function() {
    let _this = this;
    App._get('index/page', {}, function(result) {
      App.globalData.banner = result.data.items
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
      App.globalData.cate = result.data.cate
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
    App._get('index/good_list', {}, function (result) {
      App.globalData.newest = result.data.newest
      _this.setData({
        newest: result.data.newest
      });
    });
  },
  /**
   * 获取商品数据
   */
  getBestGoodsData: function () {
    let _this = this;
    App._get('index/best_list', {}, function (result) {
      App.globalData.best = result.data.best;
      _this.setData({
        best: result.data.best
      });
      _this.refreshView.stopPullRefresh();
    });
  },
  /**
   * 计算图片高度
   */
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