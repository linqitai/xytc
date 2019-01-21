var App = getApp();
var gzArr = [];
var countGz = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name:'',
    phone:"",
    pic:'',
    tempFilePaths:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getUserInfo();
  },
  getUserInfo(){
    App._post_form('user.index/store_info', {},
      function (res) {//成功
        console.log(res, "res")
        if (res.code == 1) {
          
        }
      }
    )
  },
  upload: function () {
    let that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有 
      success: res => {
        let tempFilePaths = res.tempFiles;
        that.setData({
          pic: tempFilePaths[0].path
        })
        wx.uploadFile({
          url: App.api_root + 'user.index/store_image&wxapp_id=10001&token=' + wx.getStorageSync('token'),      //此处换上你的接口地址
          filePath: tempFilePaths[0].path,
          name: 'licence_image',
          success: function (res) {
            //console.log(res,'res')
          },
          fail: function (res) {
            //console.log('fail');
          },
        })
      }
    })
  },
  getName: function (e) {
    console.log(e.detail.value)
    this.setData({
      name: e.detail.value
    })
  },
  getPhone:function(e){
    console.log(e.detail.value)
    this.setData({
      phone: e.detail.value
    })
  },
  publishEvent:function(){
    var that = this;
    var params = {
      name: that.data.name,
      phone: that.data.phone,
      licence_image: that.data.tempFilePaths,
    }
    var method = "POST";
    console.log(params,"----------params---------------")
    App._post_form('user.index/store_edit', params,
      function (res) {//成功
        console.log(res,"res")
        if(res.code==1) {
          App.showSuccess(res.msg,function(){
            wx.navigateBack();
          })
        }
      },
      function (res) {//失败
        console.log(res)
      },
      function (res) {//完成
        // console.log(res)
      }
    )
  },
  dialogSureBtn: function(e) {
    this.setData({
      maskIsShow: false,
      dialogSureIsShow: false
    })
  },
  maskHide: function (e) {
    console.log('click')
    this.setData({
      maskIsShow: false,
      dialogSureIsShow: false
    })
  },
  preventTouchMove: function (e) {
    console.log('click')
  },
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  }
})