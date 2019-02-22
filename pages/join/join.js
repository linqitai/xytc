var App = getApp();
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;
var gzArr = [];
var countGz = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name:'',
    sales_name:'',
    sales_sex:'',
    phone:"",
    licence_image:'',
    pic:'',
    store_cert:'',
    region: '',
    address_id: '',
    address: '',//请选择地址
    longitude: '',
    latitude: '',
    markers: [{
      iconPath: '/images/location.png',
      id: 0,
      longitude: '',
      latitude: '',
      width: 50,
      height: 50
    }],
    polygons: [],
    sexArr:[
      { id: 0, name: '男' },
      { id: 1, name: '女' }
    ],
    sex_index: 0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getUserInfo();
  },
  bindPickerChange_sex: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    this.setData({   //给变量赋值
      sex_index: e.detail.value,  //每次选择了下拉列表的内容同时修改下标然后修改显示的内容，显示的内容和选择的内容一致
    })
  },
  getUserInfo(){
    var that = this;
    App._post_form('user.index/store_info', {},
      function (res) {//成功
        console.log(res, "res")
        if (res.code == 1) {
          console.log(res.data.userInfo.name,"name")
          console.log(res.data.userInfo.phone,"phone")
          console.log(res.data.userInfo.licence_image,'licence_image')
          var name = res.data.userInfo.name;
          var sales_name = res.data.userInfo.sales_name;
          var sales_sex = res.data.userInfo.sales_sex;
          var phone = res.data.userInfo.phone.length>1 ? res.data.userInfo.phone:'';
          var address = res.data.userInfo.address;
          var licence_image = res.data.userInfo.licence_image;
          var store_cert = res.data.userInfo.store_cert;
          that.setData({
            name,
            sales_name,
            sex_index:sales_sex,
            phone,
            address,
            licence_image,
            store_cert
          })
          // that.getLocation();
          // that.getPolygon();
        }
      }
    )
  },
  upload: function () {
    let that = this;
    if (that.data.store_cert == 1 || that.data.store_cert == 2){ // 1为认证通过
      return;
    }
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有 
      success: res => {
        let tempFilePaths = res.tempFiles;
        that.setData({
          licence_image: tempFilePaths[0].path
        })
        wx.showLoading({
          mask: true
        })
        wx.uploadFile({
          url: App.api_root + 'user.index/store_image&wxapp_id=10001&token=' + wx.getStorageSync('token'),      //此处换上你的接口地址
          filePath: tempFilePaths[0].path,
          name: 'licence_image',
          success: function (res) {
            console.log(res,'res')
            var pic = JSON.parse(res.data).data
            console.log(pic,'pic')
            that.setData({
              pic:pic
            })
            wx.hideLoading()
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
  getSales_name: function (e) {
    console.log(e.detail.value)
    this.setData({
      sales_name: e.detail.value
    })
  },
  getSales_sex: function (e) {
    console.log(e.detail.value)
    this.setData({
      sales_sex: e.detail.value
    })
  },
  getPhone:function(e){
    console.log(e.detail.value)
    this.setData({
      phone: e.detail.value
    })
  },
  getAddress(e) {
    console.log(e.detail.value)
    this.setData({
      address: e.detail.value
    })
  },
  publishEvent:function(){
    var that = this;
    var params = {
      name: that.data.name,
      sales_name: that.data.sales_name,
      sales_sex: that.data.sexArr[that.data.sex_index].id,
      phone: that.data.phone,
      address: that.data.address
    }
    console.log(params);
    if (App.hasNull(params)){
      App.showError("请填写或完善信息");
      return;
    }
    params.licence_image = that.data.pic ? that.data.pic : ''
    var method = "POST";
    console.log(params,"----------params---------------")
    App._post_form('user.index/store_edit', params,
      function (res) {//成功
        console.log(res,"res")
        if(res.code==1) {
          App.showSuccess(res.msg,function(){
            that.getUserInfo();
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