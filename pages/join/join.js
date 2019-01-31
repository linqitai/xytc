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
    polygons: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getUserInfo();
    
  },
  /**
   * 生命周期函数--页面展示
   */
  onShow() {
    // var address = wx.getStorageSync('address')
    // console.log(address,"address")
    // this.setData({
    //   address
    // })
  },
  /**
   * 获取配送范围
   */
  getPolygon() {
    var that = this;
    var pramas = {}
    App._post_form('address/get_polygon', pramas, function (res) {
      // console.log(res);
      if (res.code == 1) {
        var polygons = [];
        var flag = false;
        for (var i = 0; i < res.data.length; i++) {
          // console.log(JSON.stringify(res.data[i]),"JsonStringigy")
          var item = {
            points: res.data[i],
            strokeWidth: 2,
            strokeColor: '#16A751'
          };
          // console.log(item,"item")
          polygons.push(item)
          var p = {
            longitude: that.data.longitude,
            latitude: that.data.latitude
          }
          var poly = res.data[i]
          var r = that.rayCasting(p, poly)
          console.log(r, 'r')
          if (r != 'out') {
            flag = true
          }
        }
        that.setData({
          polygons,
          flag
        })
        console.log(flag, 'flag')
      }
    });
  },
  /**
   * @description 射线法判断点是否在多边形内部
   * @param {Object} p 待判断的点，格式：{ x: X坐标, y: Y坐标 }
   * @param {Array} poly 多边形顶点，数组成员的格式同 p
   * @return {String} 点 p 和多边形 poly 的几何关系
   */
  rayCasting(p, poly) {
    var px = p.longitude,
      py = p.latitude,
      flag = false
    for (var i = 0, l = poly.length, j = l - 1; i < l; j = i, i++) {
      var sx = poly[i].longitude,
        sy = poly[i].latitude,
        tx = poly[j].longitude,
        ty = poly[j].latitude
      // 点与多边形顶点重合
      if ((sx === px && sy === py) || (tx === px && ty === py)) {
        return 'on'
      }
      // 判断线段两端点是否在射线两侧
      if ((sy < py && ty >= py) || (sy >= py && ty < py)) {
        // 线段上与射线 Y 坐标相同的点的 X 坐标
        var x = sx + (py - sy) * (tx - sx) / (ty - sy)
        // 点在多边形的边上
        if (x === px) {
          return 'on'
        }
        // 射线穿过多边形的边界
        if (x > px) {
          flag = !flag
        }
      }
    }
    // 射线穿过多边形边界的次数为奇数时点在多边形内
    return flag ? 'in' : 'out'
  },
  getLocation() {
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      success(res) {//经过测试在PC上定位不准确，在手机上就准确了
        // var location = dingwei.gcj02towgs84(res.longitude, res.latitude);//如果定位不准确的解决方法
        const longitude = res.longitude;
        const latitude = res.latitude;
        // 实例化API核心类
        qqmapsdk = new QQMapWX({
          //此key需要用户自己申请
          key: App.mapKey
        });
        // console.log('qqmapsdk')
        // 调用接口
        that.pointToAddress(longitude, latitude, function (res) {
          that.setData({
            region: `${res.address_component.province},${res.address_component.city},${res.address_component.district}`
          })
          console.log(that.data.region, "region")
          wx.setStorageSync('region', that.data.region)
        })
      }
    })
  },
  // 定义 pointToAddress 方法
  pointToAddress: function (longitude, latitude, callback) {
    var _this = this;
    // 调用接口
    qqmapsdk.reverseGeocoder({
      location: {
        longitude: longitude,
        latitude: latitude
      },
      success: function (res) {
        // 解析成功返回地址
        callback(res.result);
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        console.log(res);
      }
    });
  },
  /**
   * change详细地址
   */
  onChangeAddress: function (e) {
    var that = this;
    wx.navigateTo({
      url: `/pages/address/position/position?latitude=${that.data.latitude}&longitude=${that.data.longitude}`
    });
  },
  /**
   * change地区
   */
  bindRegionChange: function (e) {
    var that = this;
    this.setData({
      region: e.detail.value
    })
    wx.setStorageSync('region', e.detail.value)
    var region = e.detail.value.join('')
    var url = `https://apis.map.qq.com/ws/geocoder/v1/?address=${region}&key=${App.mapKey}`
    wx.request({
      url: url,
      success(res) {
        const longitude = res.data.result.location.lng;
        const latitude = res.data.result.location.lat;
        that.setData({
          longitude: longitude,
          latitude: latitude,
          address: ''
        })
        wx.setStorageSync('address', '')
        wx.setStorageSync('longitude', '');
        wx.setStorageSync('latitude', '');
      }
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
          var phone = res.data.userInfo.phone;
          var address = res.data.userInfo.address;
          var licence_image = res.data.userInfo.licence_image;
          var store_cert = res.data.userInfo.store_cert;
          that.setData({
            name,
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
          title: '上传中',
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
      phone: that.data.phone,
      address: that.data.address,
      licence_image: that.data.pic,
    }
    if (App.hasNull(params)){
      App.showError("请填写或完善信息");
      return;
    }
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