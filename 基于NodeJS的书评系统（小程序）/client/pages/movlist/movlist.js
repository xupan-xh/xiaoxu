// pages/movlist/movlist.js
const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    movies: [],
  },
  goToMovDetail(event) {
    let movieId = event.currentTarget.id.split('-')[1];
    //console.log(movieId);
    wx.navigateTo({
      url: '/pages/movdetail/movdetail?id=' + movieId,
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getMovieList();
  },
  //获取书籍信息
  getMovieList: function () {
    wx.showLoading({
      title: '书籍列表加载中'
    })
    qcloud.request({
      url: config.service.moviesUrl,
      success: result => {
        //wx.hideLoading();
        if (!result.data.code && result.data.data !== {}) {
          let movies = result.data.data;
          this.setData({
            movies: result.data.data,
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: '书籍列表加载失败'
          })
        }
      },
      fail: error => {
        console.log(error);
        wx.showToast({
          icon: 'none',
          title: '书籍列表加载失败'
        })
      },
      complete: result => {
        wx.hideLoading();
      }
    });
  },

  onPullDownRefresh: function () {
    this.getMovieList(() => {
      wx.stopPullDownRefresh();
    })
  },
})