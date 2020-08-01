// pages/comlist/comtlist.js
const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');
const innerAudioContext = wx.createInnerAudioContext();
const app = getApp();
let commentData = [];
const UNPLAY = 0; //没有在播放
const PLAYING = 1; //正在播放中

Page({

  /**
   * 页面的初始数据
   */
  data: {
    voicePlayStatus: [], //书评播放状态
    comments: [],
    movieId: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let movieId = options.movieId;
    this.setData({
      movieId: movieId
    });
    this.setVoiceOptions();
    this.getComments(movieId);
  },

  //获取书评函数
  getComments(movieId, cb) {
    wx.showLoading({
      title: '正在加载书评'
    })
    qcloud.request({
      url: config.service.commentUrl + `?movieId=${movieId}`,
      data: {
        movieId: movieId
      },
      method: 'GET',
      success: result => {
        wx.hideLoading();
        if (!result.data.code) {
          commentData = result.data.data;
          this.commentsDisplay(commentData);
          this.initVoicePlayStatu(commentData);
          //console.log(this.data.voicePlayStatu);
          wx.showToast({
            title: '书评加载成功'
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: '书评加载失败'
          });
        }
      },
      fail: error => {
        console.log(error);
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: '书评加载失败'
        });
      },
      complete: () => {
        cb && cb()
      }
    })
  },

  //书评显示数据处理
  commentsDisplay(commentData) {
    let commentsDisplay = commentData.map(item => {
      item.create_time = `${item.create_time.split('T')[0]} ${item.create_time.split('T')[1].split('.')[0]}`;
      item.duration = Math.floor(item.duration / 1000 * 100) / 100 + "''";
      return {
        id: item.id,
        movie_id: item.movie_id,
        user_id: item.user_id,
        user_name: item.user_name,
        user_avatar: item.user_avatar,
        type: item.type,
        content: item.content,
        duration: item.duration,
        create_time: item.create_time
      }
    });
    this.setData({
      comments: commentsDisplay,
    });
  },

  //初始化影片播放状态
  initVoicePlayStatu(commentData) {
    let voicePlayStatu = commentData.map(item => {
      return UNPLAY;
    });
    this.setData({
      voicePlayStatu: voicePlayStatu,
    })
  },

  //监听实现音频播放
  onTapPlay(event) {
    let src = event.currentTarget.dataset.src;
    let index = event.currentTarget.dataset.index;
    console.log(src)
    innerAudioContext.src = src;
    let voicePlayStatus = this.data.voicePlayStatus;
    for (let i = 0; i < this.data.voicePlayStatus.length; i++) {
      voicePlayStatus[i]=UNPLAY;
    }
    voicePlayStatus[index] = PLAYING;
    innerAudioContext.play();
    this.setData({
      voicePlayStatus: voicePlayStatus
    });
  },

  //设置播放参数
  setVoiceOptions() {
    //播放结束时需要变更状态
    //innerAudioContext.onPlay();
    innerAudioContext.onEnded(() => {
      let voicePlayStatus = [];
      for (let i = 0; i < this.data.voicePlayStatus.length; i++) {
        voicePlayStatus[i] = UNPLAY;
      }
      this.setData({
        voicePlayStatus: voicePlayStatus
      })
    });
    innerAudioContext.onPause(() => {
      let voicePlayStatus = [];
      for (let i = 0; i < this.data.voicePlayStatus.length; i++) {
        voicePlayStatus[i] = UNPLAY;
      }
      this.setData({
        voicePlayStatus: voicePlayStatus
      })
    })
    innerAudioContext.onStop(() => {
      let voicePlayStatus = [];
      for (let i = 0; i < this.data.voicePlayStatus.length; i++) {
        voicePlayStatus[i] = UNPLAY;
      }
      this.setData({
        voicePlayStatus: voicePlayStatus
      })
    })
    innerAudioContext.onError((res) => {
      console.log(res);
    })
  },

  //跳转到评论详情页面
  onTapComDetail:function(event){
    let comId = event.currentTarget.dataset.comId;
    let movieId = event.currentTarget.dataset.movieId;
    // console.log(comId); //debug锚点
    // console.log(movieId)
    wx.navigateTo({
      url: `/pages/comdetail/comdetail?comId=${comId}&movieId=${movieId}`,
    })
  },
  
  //onTapHome
  onTapHome(){
    wx.navigateBack({
      delta: 20 //大于现有页面数即可返回主页面
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.getComments(this.data.movieId, () => {
      wx.stopPullDownRefresh();
    });
  },
})