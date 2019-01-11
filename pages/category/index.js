let App = getApp();
var goodsList = [];
Page({
  data: {
    searchColor: "rgba(0,0,0,0.4)",
    searchSize: "15",
    searchName: "搜索商品",

    curClassify:0,
    curClassifyIndex:0,

    sortType: 'all',    // 排序类型
    sortPrice: false,   // 价格从低到高
    category_id:'',
    goodsList:[],
    list: [],
  },

  onLoad: function () {
    let _this = this;

    this.refreshView = this.selectComponent("#refreshView")

    // 获取分类列表
    this.getCategoryList();

  },
  onShow: function (e) {
    console.log(e,'e')
    // 获取分类列表
    this.getCategoryList();
  },
  addToCart: function(e) {
    console.log(e,'e')
    let _this = this;
    var pramas = {
      goods_id: e.currentTarget.dataset.goodsid,
      goods_num:1,
      goods_sku_id: e.currentTarget.dataset.specid?e.currentTarget.dataset.specid:''
    }
    console.log(pramas,"pramas")
    App._get('cart/add', pramas, function (result) {
      if (result.code == 1) {
        App.toast('+1')
      }
    });
  },
  //触摸开始
  handletouchstart: function (event) {
    this.refreshView.handletouchstart(event)
    console.log('触摸开始')
  },
  //触摸移动
  handletouchmove: function (event) {
    this.refreshView.handletouchmove(event)
    console.log('触摸移动')
  },
  //触摸结束
  handletouchend: function (event) {
    this.refreshView.handletouchend(event)
    console.log('触摸结束')
    setTimeout(() => { this.refreshView.stopPullRefresh() }, 2000)
  },
  //触摸取消
  handletouchcancel: function (event) {
    this.refreshView.handletouchcancel(event)
    console.log('触摸取消')
  },
  //页面滚动
  onPageScroll: function (event) {
    this.refreshView.onPageScroll(event)
    console.log('')
  },
  _pullState: function(e) {
    console.log(e,'e')
  },
  // onPullDownRefresh: function () {
  //   var _this = this;
  //   console.log('_this.refreshView.stopPullRefresh()')
  // },
  onPullDownRefresh: function () {
    setTimeout(() => { this.refreshView.stopPullRefresh() }, 2000)
  },
  scrollToUpper: function() {
    console.log('scrollToUp')
    wx.startPullDownRefresh()
  },
  toggleBtn: function(e) {
    let _this = this;
    var index = parseInt(e.currentTarget.dataset.index);
    goodsList[index].isOpen = !goodsList[index].isOpen;
    _this.setData({
      goodsList: goodsList
    })
  },
  getGoodsList: function (category_id) {
    let _this = this;
    var pramas = {
      sortType: this.data.sortType,
      sortPrice: this.data.sortPrice,
      category_id: category_id,
      search: ''
    }
    App._get('goods/lists', pramas, function (result) {
      if(result.code == 1){
        goodsList = result.data.list;
        for(var i=0;i<goodsList.length;i++) {
          goodsList[i].isOpen = false;
        }
        _this.setData({
          goodsList: goodsList
        })
      }
    });
  },
  /**
   * 获取分类列表
   */
  getCategoryList: function () {
    let _this = this;
    App._get('category/lists', {}, function (result) {
      // console.log(result,"result")
      if(result.code == 1) {
        _this.setData({
          list: result.data.list,
          curClassify: result.data.list[0].category_id,
          curNav: result.data.list[0].child[0].category_id
        });
        _this.getGoodsList(result.data.list[0].child[0].category_id)
      }
    });
  },

  /**
   * 选中分类
   */
  selectClassify: function (t) {
    let _this = this;
    let curClassify = t.target.dataset.id, curClassifyIndex = parseInt(t.target.dataset.index);
    this.setData({
      curClassify,
      curClassifyIndex,
      curNav: _this.data.list[curClassifyIndex].child[0].category_id
      // scrollTop: 0
    });
    this.getGoodsList(_this.data.curNav);
  },
  selectNav: function (t) {
    let curNav = t.target.dataset.id, curIndex = parseInt(t.target.dataset.index);
    this.setData({
      curNav,
      curIndex,
      scrollTop: 0,
      category_id: curNav
    });
    this.getGoodsList(curNav);
  },

  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },

  /**
   * 设置分享内容
   */
  onShareAppMessage: function () {
    return {
      title: "全部分类",
      desc: "",
      path: "/pages/category/index"
    };
  }
  
});
