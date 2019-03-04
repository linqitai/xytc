var QQMapWX = require('../../../utils/qqmap-wx-jssdk.js');
let App = getApp();
var qqmapsdk;
Page({
  data: {
    latitude: 0,//地图初次加载时的纬度坐标
    longitude: 0, //地图初次加载时的经度坐标
    name: "" //选择的位置名称
  },
  onLoad: function (options) {
    console.log(options,"options")
    var latitude = options.latitude
    var longitude = options.longitude
    this.setData({
      latitude,
      longitude
    })
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: App.mapKey
    });
    // this.mapCtx = wx.createMapContext('myMap')
    // wx.openLocation({
    //   latitude: parseFloat(latitude),
    //   longitude: parseFloat(longitude),
    //   scale: 28
    // })
    
    this.moveToLocation();
  },
  //移动选点
  moveToLocation: function () {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        console.log(res,"moveToLocation");
        const longitude = res.longitude;
        const latitude = res.latitude;
        wx.setStorageSync('longitude', longitude);
        wx.setStorageSync('latitude', latitude);
        wx.setStorageSync('address', res.name);
        console.log(`${longitude},${latitude}`,'setStorageSync')
        //选择地点之后返回到原来页面
        wx.redirectTo({
          url: `/pages/address/position/sureAddress?address=${res.address}(${res.name})` // "pages/address/position/sureAddress"
        });
      },
      fail: function (err) {
        console.log(err)
      }
    });
  }
});