var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var dingwei = require('../../utils/dingwei.js');
let App = getApp();
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    disabled: false,
    nav_select: false, // 快捷导航
    name:'',
    phone:'',
    region: '',
    address_id:'',
    address: '',//请选择地址
    longitude: wx.getStorageSync('longitude')||'',
    latitude: wx.getStorageSync('latitude') || '',
    markers: [{
      iconPath: '/images/location.png',
      id: 0,
      longitude: wx.getStorageSync('longitude') || '',
      latitude: wx.getStorageSync('latitude') || '',
      width: 50,
      height: 50
    }],
    polygons: [],
    error: '',
  },
  bindtap(e) {
    console.log(e,"bindtap")
  },
  bindpoitap(e) {
    console.log(e, "bindpoitap")
  },
  regionchange(e) {
    console.log(e.type)
  },
  markertap(e) {
    console.log(e.markerId)
  },
  controltap(e) {
    console.log(e.controlId)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    var operate = wx.getStorageSync('operate')
    console.log(operate, "operate")
    if (operate == 'add') {
      wx.setStorageSync('address_id', '')
      // that.clearStorage();
      // console.log(that.data, 'init data')
      /*判断是第一次加载还是从position页面返回
      如果从position页面返回，会传递用户选择的地点*/
      console.log(options.address,"options.address")
      if (options.address != null && options.address != '') {
        //设置变量 address 的值
        that.setData({
          address: options.address
        });
      }
    }else{
      if (options.address_id) {
        // 获取当前地址信息
        that.setData({
          address_id: options.address_id
        })
        that.getAddressDetail(options.address_id);
      }
    }
    var name = wx.getStorageSync('name')
    var phone = wx.getStorageSync('phone')
    that.setData({
      name: name || '',
      phone: phone || '',
      longitude: wx.getStorageSync('longitude') || '',
      latitude: wx.getStorageSync('latitude') || '',
      address: options.address || '',
      markers: [{
        iconPath: '/images/location.png',
        id: 0,
        longitude: wx.getStorageSync('longitude') || '',
        latitude: wx.getStorageSync('latitude') || '',
        width: 50,
        height: 50
      }]
    })
    var region = wx.getStorageSync('region');
    // console.log(region,"getStorageSync.region")
    if (region){
      this.setData({
        region: region
      })
    }else{
      that.getLocation();
    }
    that.getPolygon();
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
    for(var i = 0, l = poly.length, j = l - 1; i<l; j = i, i++) {
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
  /**
   * 获取当前地址信息
   */
  getAddressDetail: function (address_id) {
    let _this = this;
    App._get('address/detail', {
      address_id
    }, function (result) {
      wx.setStorageSync('address_id', result.data.detail.address_id)
      wx.setStorageSync('name', result.data.detail.name)
      wx.setStorageSync('phone', result.data.detail.phone)
      wx.setStorageSync('region', `${result.data.detail.region.province},${result.data.detail.region.city},${result.data.detail.region.region}`)
      wx.setStorageSync('address', result.data.detail.detail)
      wx.setStorageSync('longitude', result.data.detail.lon)
      wx.setStorageSync('latitude', result.data.detail.lat)
      _this.setData({
        address_id: result.data.detail.address_id,
        name: result.data.detail.name,
        phone: result.data.detail.phone,
        region: `${result.data.detail.region.province},${result.data.detail.region.city},${result.data.detail.region.region}`,
        address: result.data.detail.detail,
        longitude: result.data.detail.lon,
        latitude: result.data.detail.lat,
        markers: [{
          iconPath: '/images/location.png',
          id: 0,
          longitude: result.data.detail.lon,
          latitude: result.data.detail.lat,
          width: 50,
          height: 50
        }],
      });
    });
  },
  /**
   * 获取配送范围
   */
  getPolygon() {
    var that = this;
    var pramas = {}
    App._post_form('address/get_polygon', pramas, function (res) {
      // console.log(res);
      if(res.code == 1) {
        var polygons = [];
        var flag = false;
        for(var i=0;i<res.data.length;i++) {
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
          // console.log(r,'r')
          if(r != 'out'){
            flag = true
          }
        }
        that.setData({
          polygons
        })
        // console.log(that.data.polygons,"polygons")
        // console.log(flag,'flag')
        that.setData({
          flag: flag
        })
      }
    });
  },
  getLocation(){
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      success(res) {//经过测试在PC上定位不准确，在手机上就准确了
        // var location = dingwei.gcj02towgs84(res.longitude, res.latitude);//如果定位不准确的解决方法
        // const speed = res.speed
        // const accuracy = res.accuracy
        // console.log(location, "location")
        const longitude = res.longitude;
        const latitude = res.latitude;
        wx.setStorageSync('longitude', longitude);
        wx.setStorageSync('latitude', latitude);
        // const longitude = location[0];
        // const latitude = location[1];
        that.setData({
          longitude: longitude,
          latitude: latitude
        })
        // 实例化API核心类
        qqmapsdk = new QQMapWX({
          //此key需要用户自己申请
          key: App.mapKey
        });
        // console.log('qqmapsdk')
        // 调用接口
        that.pointToAddress(longitude, latitude, function (res) {
          // 得到最终地址
          // console.log(res, "得到最终地址");
          that.setData({
            region: `${res.address_component.province},${res.address_component.city},${res.address_component.district}`
          })
          // console.log(that.data.region, "region")
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
  onChangeAddress: function (e) {
    var that = this;
    wx.reLaunch({
      url: `/pages/address/position/position?latitude=${that.data.latitude}&longitude=${that.data.longitude}`
    });
  },
  bindNameInput: function(e) {
    // this.setData({
    //   name: e.detail.value
    // })
    wx.setStorageSync('name', e.detail.value)
  },
  bindPhoneInput: function (e) {
    // this.setData({
    //   phone: e.detail.value
    // })
    wx.setStorageSync('phone', e.detail.value)
  },
  /**
   * 修改地区
   */
  bindRegionChange: function (e) {
    var that = this;
    this.setData({
      region: e.detail.value
    })
    wx.setStorageSync('region', e.detail.value)
    // console.log(e.detail.value,"setStorageSync.region")
    var region = e.detail.value.join('')
    var url = `https://apis.map.qq.com/ws/geocoder/v1/?address=${region}&key=${App.mapKey}`
    // console.log(url,"url")
    wx.request({
      url: url,
      success(res) {
        // console.log(res,"getLongLat")
        // console.log(res.data.result.location.lng,"res.data.result.location.lng")
        // console.log(res.data.result.location.lat, "res.data.result.location.lat")
        const longitude = res.data.result.location.lng;
        const latitude = res.data.result.location.lat;
        wx.setStorageSync('longitude', longitude);
        wx.setStorageSync('latitude', latitude);
        // const longitude = location[0];
        // const latitude = location[1];
        that.setData({
          longitude: longitude,
          latitude: latitude
        })
        // console.log(that.data, "setData bindRegionChange")
      }
    })
  },
  clearStorage() {
    wx.setStorageSync('address_id', '')
    wx.setStorageSync('name', '')
    wx.setStorageSync('phone', '')
    wx.setStorageSync('region', '')
    wx.setStorageSync('address', '')
    wx.setStorageSync('longitude', '')
    wx.setStorageSync('latitude', '')
  },
  /**
   * 表单提交
   */
  saveData: function(e) {
    let _this = this;
    var values = e.detail.value;
    // console.log(wx.getStorageSync('address_id'),"wx.getStorageSync('address_id') 表单提交")
    values.address_id = wx.getStorageSync('address_id');
    values.region = this.data.region;
    values.lon = this.data.longitude;
    values.lat = this.data.latitude;
    values.flag = this.data.flag;
    
    // 表单验证
    if (!_this.validation(values)) {
      App.showError(_this.data.error);
      return false;
    }
    _this.clearStorage();
    // 按钮禁用
    _this.setData({
      disabled: true
    });
    var url;
    var operate = wx.getStorageSync('operate')
    console.log(operate);
    if(operate == 'add') {
      url = 'address/add'
    } else if (operate == 'edit') {
      url = 'address/edit'
    }
    // 提交到后端
    App._post_form(url, values, function(result) {
      App.showSuccess(result.msg, function() {
        wx.redirectTo({
          url: `/pages/address/index`
        });
      });
    }, false, function() {
      // 解除禁用
      _this.setData({
        disabled: false
      });
    });
  },

  /**
   * 表单验证
   */
  validation: function(values) {
    if (values.name === '') {
      this.data.error = '收件人不能为空';
      return false;
    }
    if (values.phone.length < 1) {
      this.data.error = '手机号不能为空';
      return false;
    }
    if (values.phone.length !== 11) {
      this.data.error = '手机号长度有误';
      return false;
    }
    let reg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (!reg.test(values.phone)) {
      this.data.error = '手机号不符合要求';
      return false;
    }
    if (!this.data.region) {
      this.data.error = '省市区不能空';
      return false;
    }
    if (values.detail === '') {
      this.data.error = '详细地址不能为空';
      return false;
    }
    if (values.flag === false) {
      this.data.error = '抱歉，所选位置暂时不在配送范围内';
      return false;
    }
    return true;
  },
  /**
   * 快捷导航 显示/隐藏
   */
  commonNav: function() {
    this.setData({
      nav_select: !this.data.nav_select
    });
  },

  /**
   * 快捷导航跳转
   */
  nav: function(e) {
    let url = '';
    switch (e.currentTarget.dataset.index) {
      case 'home':
        url = '../index/index';
        break;
      case 'fenlei':
        url = '../category/index';
        break;
      case 'cart':
        url = '../flow/index';
        break;
      case 'profile':
        url = '../user/index';
        break;
    }
    wx.switchTab({
      url
    });
  },

})