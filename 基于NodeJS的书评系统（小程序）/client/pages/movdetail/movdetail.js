// pages/movdetail/movdetail.js
const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    movie: {},
    userComments:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let movieId = options.id;
    //console.log(movieId)
    this.getMovie(movieId);
  },

  //获取书籍信息
  getMovie(movieId) {
    wx.showLoading({
      title: '书籍加载中...'
    })
    qcloud.request({
      url: config.service.moviesUrl + movieId,
      success: result => {
        console.log(result);
        if (!result.data.code && result.data.data !== {}) {
          this.setData({
            movie: result.data.data
          });
          this.getUserCom(movieId);
        } else {
          wx.showToast({
            icon: 'none',
            title: '书籍详情加载失败'
          })
        }
      },
      fail: error => {
        console.log(error)
        wx.showToast({
          icon: 'none',
          title: '书籍详情加载失败'
        })
      },
      complete: result => {
        wx.hideLoading();
      }
    });
  },
  
  //添加评论信息
  addComment:function(event) {
    let movieId = event.currentTarget.dataset.id;
    let comType = '';
    wx.showActionSheet({
      itemList: ['文字', '音频'],
      success: res => {
        if (res.tapIndex === 0) {
          // 文字
          comType = 'text'
        } else {
          // 音频
          comType = 'voice'
        }
        wx.navigateTo({
          url: `/pages/comedit/comedit?movieId=${movieId}&comType=${comType}`
        });
      },
      fail: error => {
        console.log(error);
      }
    })
  },

  //查询用户是否对本片有书评
  getUserCom(movieId) {
    qcloud.request({
      url: config.service.userComments + `?movieId=${movieId}`,
      method: 'GET',
      login: true,
      success: result => {
        console.log(result)
        if (!result.data.code) {
          this.setData({
            userComments: result.data.data
          })
          console.log(this.data.userComments)
        }
      },
      fail: error => {
        console.log(error)
      }
    });
  },

  // 跳转到我的书评，多个书评默认跳转到第一个(按评论时间最近排序)
  onUserCom() {
    let comId = this.data.userComments[0].comment_id;
    let movieId = this.data.movie.id;
    wx.navigateTo({
      url: `/pages/comdetail/comdetail?comId=${comId}&movieId=${movieId}`,
    });
  },

  seeComment:function(event){
    let movieId = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/comlist/comtlist?movieId=${movieId}`
    });
  }
})