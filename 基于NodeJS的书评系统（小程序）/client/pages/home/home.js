// pages/home/home.js
const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    comment: null,
    userInfo: '',
  },

  //获取一条随机的书评，更新服务器随机处理
  getOneOfAllCom(cb){
    wx.showLoading({
      title: '正在加载'
    })
    qcloud.request({
      url: config.service.oneOfComments,
      method: 'GET',
      login:true,
      success: result => {
        wx.hideLoading();
        if (!result.data.code) {
          let comment = result.data.data[0];
          this.setData({
            comment:comment,
          });
          console.log(this.data.comment)
          wx.showToast({
            title: '加载成功'
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: '加载失败'
          });
        }
      },
      fail: error => {
        console.log(error);
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: '加载失败'
        });
      },
      complete: () => {
        cb && cb()
      }
    })
  },

  //跳转至图书详情页
  onTapMovDetail(){
    let movieId = this.data.comment.movie_id;
    //console.log(movieId);
    wx.navigateTo({
      url: '/pages/movdetail/movdetail?id=' + movieId,
    })
  },

  onTapComDetail(){
    let comId = this.data.comment.comment_id;
    wx.navigateTo({
      url: `/pages/comdetail/comdetail?comId=${comId}`,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    app.login({
      success: userInfo => {
        this.setData({
          userInfo: userInfo
        })
        this.getOneOfAllCom();
      },
      fail: error => {
        console.log(error);
      }
    })
  },

  // onShow:function(){
  //   app.login({
  //     success: userInfo => {
  //       this.setData({
  //         userInfo: userInfo
  //       })
  //       this.getOneOfAllCom();
  //     },
  //     fail: error => {
  //       console.log(error);
  //     }
  //   })
  // },

  // 点击登录函数
  onTapLogin: function(event) {
    if (event.detail.userInfo) {
      this.setData({
        userInfo: event.detail.userInfo
      })
      //this.getRecommendComment();
    }
  },

  /**
   * 监听下拉刷新事件
   * 重新获取推荐的书评
   */
  onPullDownRefresh() {
    this.getOneOfAllCom(() => {
      wx.stopPullDownRefresh();
    });
  },

})