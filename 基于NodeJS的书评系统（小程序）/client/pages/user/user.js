// pages/user/user.js
const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');
const app = getApp();
const innerAudioContext = wx.createInnerAudioContext();
const UNPLAY = 0; //没有在播放
const PLAYING = 1; //正在播放中
const COLLECTION=0; //收藏模式
const REALEASE=1; //发布模式

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:null,
    tabMode: COLLECTION,//默认收藏模式
    comments:null, //评论都放在其中
    voicePlayStatus: [], //书评播放状态
  },

  //模式切换
  onTapChange:function(event){
    let tabMode = event.currentTarget.dataset.tap;
    this.setData({
      tabMode: tabMode,
    })
    this.getList();
  },

  //获取信息函数
  getList(cb) {
    if (this.data.tabMode == COLLECTION) {
      this.getCollection(cb);
    } else if (this.data.tabMode == REALEASE) {
      this.getUserComments(cb);
    }
  },

  //获取收藏
  getCollection(cb) {
    wx.showLoading({
      title: '收藏加载中'
    })
    qcloud.request({
      url: config.service.collectionUrl,
      method:"GET",
      login:true,
      success: result => {
        wx.hideLoading();
        if (!result.data.code) {
          let comments = result.data.data;
          comments.forEach(item => {
            item.duration = Math.floor(item.duration / 1000 * 100) / 100 + "''"
          });
          this.initVoicePlayStatu(comments);
          this.setData({
            comments: comments
          });
          //console.log("111")
          console.log(this.data.comments)
        } else {
          wx.showToast({
            icon: 'none',
            title: '加载失败'
          })
        }
      },
      fail: error => {
        console.log(error)
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: '加载失败'
        })
      },
      complete: result => {
        cb && cb()
      }
    })
  },

  // 获取发布书评
  getUserComments(cb) {
    wx.showLoading({
      title: '加载中...'
    });
    qcloud.request({
      url: config.service.userAllComments,
      method: "GET",
      login: true,
      success: result => {
        wx.hideLoading();
        if (!result.data.code) {
          let comments = result.data.data;
          comments.forEach(item => {
            item.duration = Math.floor(item.duration / 1000 * 100) / 100 + "''"
          });
          this.initVoicePlayStatu(comments);
          this.setData({
            comments: comments
          });
          console.log(this.data.comments);
        } else {
          wx.showToast({
            icon: 'none',
            title: '加载失败'
          })
        }
      },
      fail: error => {
        console.log(error)
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: '加载失败'
        })
      },
      complete: result => {
        cb && cb()
      }
    })
  },

  //初始化图书阅读状态
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
      voicePlayStatus[i] = UNPLAY;
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

  //跳转书评详情页
  onTapComDetail(event){
    let comId = event.currentTarget.dataset.comId;
    // console.log(comId); //debug锚点
    // console.log(movieId)
    wx.navigateTo({
      url: `/pages/comdetail/comdetail?comId=${comId}`,
    });
  },

  //onTapHome
  onTapHome() {
    wx.navigateBack({
      delta: 20 //大于现有页面数即可返回主页面
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.login({
      success: userInfo => {
        this.setData({
          userInfo: userInfo,
        });
        this.getList();
        this.setVoiceOptions();
      },
      fail: error => {
        console.log(error);
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.login({
      success: userInfo => {
        this.setData({
          userInfo: userInfo,
        });
        this.getList();
        this.setVoiceOptions();
      },
      fail: error => {
        console.log(error);
      }
    });
  },
  // 点击登录函数
  onTapLogin: function (event) {
    if (event.detail.userInfo) {
      this.setData({
        userInfo: event.detail.userInfo
      });
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getList(()=>{
      wx.stopPullDownRefresh();
    });
  },
})