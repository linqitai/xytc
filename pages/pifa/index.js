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
    category_id: '',
    goodsList:[],
    list: [],
    currentOrder:''
  },

  onLoad: function (options) {
    let _this = this;
    this.setData({
      active: 2,
      tab_bar: App.globalData.tab_bar
    })
    this.setData({
      category_id: options.category_id || wx.getStorageSync('category_id')
    })
    // 获取分类列表
    this.getCategoryList();
  },
  onShow: function (e) {
  },
  subToCart: function(e) {
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
    App._get('cart2/sub', pramas, function (result) {
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
  addToCart: function(e) {
    let _this = this;
    let goodsId = e.currentTarget.dataset.goodsid
    let specId = e.currentTarget.dataset.specid
    var pramas = {
      goods_id: goodsId,
      goods_num:1,
      goods_sku_id: specId ? specId:''
    }
    console.log(pramas,"pramas")
    App._get('cart2/add', pramas, function (result) {
      if (result.code == 1) {
        // App.toast('+1')
        for (var i = 0; i < goodsList.length; i++) {
          if (specId){
            for(var j=0;j<goodsList[i].spec.length;j++) {
              if (goodsList[i].spec[j].spec_sku_id == specId) {
                goodsList[i].spec[j].cart_num = parseInt(goodsList[i].spec[j].cart_num) + 1;
                break;
              }
            }
          }else{
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
  orderTap(e) {
    var index = e.currentTarget.dataset.index;
    console.log(index,"index")
    this.setData({
      currentOrder:index
    })
    // 排序 all默认排序 sales销量排序 price价格排序
    // sortType: 'all',    // 排序类型
    //   sortPrice: false,   // 价格从低到高
    if (index == 0){
      this.setData({
        sortType:'all'
      })
    }else if(index == 1){
      this.setData({
        sortType: 'sales'
      })
    } else if (index == 2) {
      var sortPrice = this.data.sortPrice;
      this.setData({
        sortType: 'price',
        sortPrice: !sortPrice
      })
    }
    this.getGoodsList(this.data.category_id)
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
    if (App.globalData.categortListResultPifa) {
      _this.callback(App.globalData.categortListResultPifa)
    }else{
      App._get('category/lists2', {}, function (result) {
        App.globalData.categortListResultPifa = result
        console.log(App.globalData.categortListResultPifa,'App.globalData.categortListResult')
        if (result.code == 1) {
          _this.callback(result)
        }
      });
    }
  },
  callback(result) {
    let _this = this;
    var list = result.data.list;
    var index = '';
    var category_id = _this.data.category_id
    if (category_id) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].category_id == category_id) {
          index = i;
        }
      }
    }
    console.log(index, "index")
    _this.setData({
      list: list,
      curClassify: index != '' ? category_id : list[0].category_id,
      curNav: index != '' ? (list[index].child ? list[index].child[0].category_id : list[index].category_id) : (list[0].child ? list[0].child[0].category_id : list[index].category_id),
      curClassifyIndex: index != '' ? index : 0
    });
    console.log(_this.data.curClassify, 'curClassify')
    console.log(_this.data.curNav, 'curNav')
    var navid = index != '' ? (list[index].child ? list[index].child[0].category_id : list[index].category_id) : (list[0].child ? list[0].child[0].category_id : list[index].category_id)
    _this.setData({
      category_id: navid
    })
    _this.getGoodsList(navid)
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
      curNav: _this.data.list[curClassifyIndex].child ? _this.data.list[curClassifyIndex].child[0].category_id : _this.data.list[curClassifyIndex].category_id,
      category_id: _this.data.list[curClassifyIndex].child ? _this.data.list[curClassifyIndex].child[0].category_id : _this.data.list[curClassifyIndex].category_id
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
