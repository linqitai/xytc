var QQMapWX = require('../../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({
  data: {
    address:''
  },
  onLoad: function (options) {
    // console.log(options, "options")
    this.setData({
      address: options.address
    })
  },
  bindTextAreaInput: function (e) {
    // console.log(e.detail.value)
    this.setData({
      address: e.detail.value
    })
  },
  sure: function() {
    console.log(this.data.address,"this.data.address")
    wx.setStorageSync('address', this.data.address)
    wx.setStorageSync('fromSureAddress', 1)
    wx.navigateBack({
      delta: 1
    });
    // wx.navigateTo({
    //   url: `/pages/address/create?address=${this.data.address}`
    // });
  }
});