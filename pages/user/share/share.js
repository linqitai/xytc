let App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取帮助列表
    this.getData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
   /**
 * @param obj time Date 对象
 * @return intval 开始时间
 */
  dayBeginTime(time) {
    let d = time.getDate();
    let m = time.getMonth();
    let y = time.getFullYear();
    return new Date(y, m, d);
  },
  /**
 * @param obj time Date 对象
 * @return intval 当月有多少天
 */
  getDaysByDate(time) {
    var date = new Date(time.getFullYear(), time.getMonth(), 0);
    return date.getDate();
  },
  toPerformance(e) {
    let that = this;
    var time_type = e.currentTarget.dataset.time_type
    var begin_time = ''
    var end_time = ''
    var thisYear = new Date().getFullYear()
    var thisMonth = ''
    var todayDate = new Date()
    if (time_type == 1) {
      thisMonth = todayDate.getMonth() // 上个月
      if(thisMonth==0){//如果这个月为1月，那就是去年的12月
        thisYear = thisYear;
        thisMonth = 12;
      }
      console.log(thisMonth,"thisMonth")
      begin_time = `${thisYear}-${thisMonth}-01`
      var d = new Date(thisYear, thisMonth,'01')
      end_time = `${thisYear}-${thisMonth}-${that.getDaysByDate(d)}`
    } else if (time_type == 2) {
      thisMonth = todayDate.getMonth() + 1
      console.log(thisMonth, "thisMonth")
      begin_time = `${thisYear}-${thisMonth}-01`
      var d = new Date(thisYear, thisMonth, '01')
      end_time = `${thisYear}-${thisMonth}-${todayDate.getDate()}`
    }
    console.log(time_type,begin_time, end_time,"time")
    wx.navigateTo({
      url: `./performance/performance?time_type=${time_type}&begin_time=${begin_time}&end_time=${end_time}`
    })
  },
  savePhoto() {
    this.getPhotosAuth();
  },
  //获取相册授权
  getPhotosAuth: function () {
    let that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              console.log('writePhotosAlbum授权成功')
              that.savePhotoEvent()
            }
          })
        }else{
          that.savePhotoEvent()
        }
      }
    })
  },
  savePhotoEvent() {
    let _this = this;
    wx.downloadFile({
      url: _this.data.imgurl,
      success: function (res) {

        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(result) {
            console.log(result,"result")
            // App.showSuccess(`保存成功`)
          }
        })

        wx.saveFile({
          tempFilePath: res.tempFilePath,
          success: function (res) {
            console.log(res.savedFilePath,"savedFilePath")
            App.showSuccess(`保存成功`)
            // App.showToast(`图片保存到${res.savedFilePath}`)
          }
        })

      }
    })
  },
  /**
   * 获取帮助列表
   */
  getData: function () {
    let _this = this;
    App._get('user.index/expand_index', {}, function (result) {
      // _this.setData(result.data);
      // console.log(result,"result")
      if (result.code == 1) {
        _this.setData(result.data.data);
        // console.log(_this.data,"data")
      }
    });
  },

})