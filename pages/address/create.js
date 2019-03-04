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
    nav_select: false, // 
    isOnLoad: 0,
    name:'',
    phone:'',
    region: '',
    address_id:'',
    address: wx.getStorageSync('address') || '',//请选择地址
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { // options: address_id\lat\lan
    console.log('================onLoad=====================')
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('operate')=='add'?"新增收获地址":"编辑收获地址",
    })
    wx.setStorageSync('fromSureAddress', 0)
    var that = this;
    var operate = wx.getStorageSync('operate')
    if (operate == 'add') {
      wx.setStorageSync('address_id', '')
      // that.clearStorage();
      // console.log(that.data, 'init data')
      /*判断是第一次加载还是从position页面返回
      如果从position页面返回，会传递用户选择的地点*/
      // console.log(options.address, "options.address")
      if (options.address != null && options.address != '') {
        //设置变量 address 的值
        that.setData({
          address: options.address
        });
      }
      // var region = wx.getStorageSync('region');
      if (that.data.region) { //地区存在
        that.relGetLocation(options.longitude, options.latitude);
      } else {//地区不存在，就去获取
        that.getLocation();
      }
      that.getPolygon();
    } else { //编辑
      if (options.address_id) {
        // 获取当前地址信息
        that.getAddressDetail(options.address_id);
      }
    }
  },
  onShow() {
    let _this = this;
    if (wx.getStorageSync("fromSureAddress")){
      _this.setData({
        region: wx.getStorageSync("region"),
        address: wx.getStorageSync("address"),
        longitude: wx.getStorageSync("longitude"),
        latitude: wx.getStorageSync("latitude"),
        markers: [{
          iconPath: '/images/location.png',
          id: 0,
          longitude: wx.getStorageSync("longitude"),
          latitude: wx.getStorageSync("latitude"),
          width: 50,
          height: 50
        }],
      });
      _this.getPolygon();
    }
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
      console.log(result,"detail result")
      wx.setStorageSync('address_id', result.data.detail.address_id)
      wx.setStorageSync('name', result.data.detail.name)
      wx.setStorageSync('phone', result.data.detail.phone)
      wx.setStorageSync('region', `${result.data.detail.region.province},${result.data.detail.region.city},${result.data.detail.region.region}`)
      // wx.setStorageSync('address', result.data.detail.detail)
      wx.setStorageSync('longitude', result.data.detail.lon)
      wx.setStorageSync('latitude', result.data.detail.lat)
      console.log(wx.getStorageSync("address"), "wx.getStorageSync(address)")
      _this.setData({
        address_id: result.data.detail.address_id,
        name: result.data.detail.name,
        phone: result.data.detail.phone,
        region: `${result.data.detail.region.province},${result.data.detail.region.city},${result.data.detail.region.region}`,
        address: wx.getStorageSync("address") ? wx.getStorageSync("address") : result.data.detail.detail,
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
      // var region = wx.getStorageSync('region');
      if (_this.data.region) { //地区存在
        _this.relGetLocation(result.data.detail.lon, result.data.detail.lat);
      } else {//地区不存在，就去获取
        _this.getLocation();
      }
      _this.getPolygon();
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
          console.log(r,'r')
          if(r != 'out'){
            flag = true
          }
        }
        that.setData({
          polygons
        })
        // console.log(that.data.polygons,"polygons")
        console.log(flag,'flag')
        that.setData({
          flag: flag
        })
      }
    });
  },
  relGetLocation(longitude, latitude) {
    console.log(this.data.markers,"markers")
    console.log(`${longitude},${latitude}`,"relGetLocation")
    var that = this;
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
  },
  getLocation(){
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      success(res) {//经过测试在PC上定位不准确，在手机上就准确了
        // var location = dingwei.gcj02towgs84(res.longitude, res.latitude);//如果定位不准确的解决方法
        const longitude = res.longitude;
        const latitude = res.latitude;
        console.log(longitude, latitude, 'getLocation')
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
    wx.navigateTo({
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
        console.log(wx.getStorageSync('_from'),"wx.getStorageSync('_from')")
        if (wx.getStorageSync('_from')=='flow'){
          var addToUrl = wx.getStorageSync('addToUrl');
          console.log(addToUrl,"addToUrl")
          console.log(wx.getStorageSync('order_type'),"wx.getStorageSync('order_type')")
          if (addToUrl){
            wx.redirectTo({
              url: "/pages/flow/checkout?" + addToUrl
            });
          }else{
            wx.redirectTo({
              url: `/pages/flow/checkout?order_type=${wx.getStorageSync('order_type')}` + addToUrl
            });
          }
        }else{
          wx.redirectTo({
            url: `/pages/address/index`
          });
        }
        
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
      // this.data.error = '收件人不能为空';
      this.setData({ error: '收件人不能为空'})
      return false;
    }
    if (values.phone.length < 1) {
      // this.data.error = '手机号不能为空';
      this.setData({ error: '手机号不能为空' })
      return false;
    }
    if (values.phone.length !== 11) {
      // this.data.error = '手机号长度有误';
      this.setData({ error: '手机号长度有误' })
      return false;
    }
    let reg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (!reg.test(values.phone)) {
      // this.data.error = '手机号不符合要求';
      this.setData({ error: '手机号不符合要求' })
      return false;
    }
    // if (!this.data.region) {
    //   // this.data.error = '省市区不能空';
    //   this.setData({ error: '省市区不能空' })
    //   return false;
    // }
    if (values.detail === '') {
      // this.data.error = '详细地址不能为空';
      this.setData({ error: '详细地址不能为空' })
      return false;
    }
    if (values.flag === false) {
      // this.data.error = '抱歉，所选位置暂时不在配送范围内';
      this.setData({ error: '抱歉，所选位置暂时不在配送范围内' })
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