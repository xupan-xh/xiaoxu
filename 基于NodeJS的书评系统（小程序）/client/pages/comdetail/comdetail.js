// pages/comdetail/comdetail.js
const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');
const innerAudioContext = wx.createInnerAudioContext();
const app = getApp();
const UNPLAYED = 0; //没有在播放
const PLAYING = 1; //正在播放中
const COLLECTED = 1; //已经收藏的
const UNCOLLECT = 0; //未收藏，取消收藏的

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:null,
    commentDetail:{},
    moive: {},
    comType: "text",
    collectStatus: UNCOLLECT, 
    userComments:[],//存储用户对本片的书评
    voicePlayStatus: UNPLAYED, //录音播放状态
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // let movieId = options.movieId;
    // let comId = options.comId;
    // // console.log(movieId)
    // // console.log(comId)
    // this.getMovie(movieId);
    // this.getComment(comId);
    let comId = options.comId;
    this.getComDetail(comId);
  },

  // 后端实现联合获取相关信息
  // //获取书籍信息
  // getMovie(movieId) {
  //   wx.showLoading({
  //     title: '信息加载中...'
  //   })
  //   qcloud.request({
  //     url: config.service.moviesUrl + movieId,
  //     success: result => {
  //       console.log(result);
  //       if (!result.data.code && result.data.data !== {}) {
  //         this.setData({
  //           movie: result.data.data
  //         });
  //       } else {
  //         wx.showToast({
  //           icon: 'none',
  //           title: '书籍加载失败'
  //         })
  //       }
  //     },
  //     fail: error => {
  //       console.log(error)
  //       wx.showToast({
  //         icon: 'none',
  //         title: '书籍加载失败'
  //       })
  //     },
  //     complete: result => {
  //       wx.hideLoading();
  //     }
  //   });
  // },

  // //获取评论信息
  // getComment(comId) {
  //   qcloud.request({
  //     url: config.service.commentUrl +'/'+ comId,
  //     success: result => {

  //       console.log(result);

  //       if (!result.data.code && result.data.data !== {}) {
  //         this.setData({
  //           comment: result.data.data
  //         });
  //       } else {
  //         wx.showToast({
  //           icon: 'none',
  //           title: '评论加载失败'
  //         })
  //       }
  //     },
  //     fail: error => {
  //       console.log(error)
  //       wx.showToast({
  //         icon: 'none',
  //         title: '评论加载失败'
  //       })
  //     },
  //     complete: result => {
  //       wx.hideLoading();
  //     }
  //   });
  // },

  // 获取书评详情
  getComDetail(comId) {
    qcloud.request({
      url: config.service.commentUrl + '/' + comId,
      method: 'GET',
      login: true,
      success: result => {
        console.log(result)
        console.log(this.data.userInfo)
        if (!result.data.code) {
          let comment = result.data.data;
          comment.duration = Math.floor(comment.duration / 1000 * 100) / 100 + "''";
          // 绑定数据
          this.setData({
            commentDetail: comment
          });
          // 绑定播放地址
          innerAudioContext.src = this.data.commentDetail.content;
          // 获取登录用户的该书籍的书评
          // 如果用户已经评论过则跳转到用户的评论详情页
          let movieId = comment.movie_id;
          this.getUserCom(movieId);
        } else {
          wx.showToast({
            icon: 'none',
            title: '加载失败'
          })
        }
      },
      fail: error => {
        console.log(error)
        wx.showToast({
          icon: 'none',
          title: '加载失败'
        })
      }
    })
  },

  //收藏与取消收藏相关函数
  onTapCollect() {
    let comId = this.data.commentDetail.comment_id;
    let collectStatus = this.data.commentDetail.collection_id ? UNCOLLECT:COLLECTED;

    wx.showLoading({
      title: "请稍候..."
    });
    qcloud.request({
      url: config.service.collectionUrl,
      method: 'POST',
      login:true,
      data: {
        comId: comId,
        collectStatus: collectStatus
      },
      success: result => {
        console.log(comId);
        wx.hideLoading();
        //成功之后更新现在书评信息
        console.log(result);
        this.getComDetail(comId);
        if (!result.data.code) {
          wx.showToast({
            title: "操作成功"
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: "操作失败"
          })
        }
      },
      fail: error => {
        console.log(error)
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: "操作失败"
        })
      }
    });
  },

  // 点击登录函数
  onTapLogin: function (event) {
    if (event.detail.userInfo) {
      this.setData({
        userInfo: event.detail.userInfo
      })
    }
  },

  //写书评函数
  onEditCom(){
    let movieId = this.data.commentDetail.movie_id;
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    app.login({
      success: userInfo => {
        //console.log(userInfo)
        this.setData({
          userInfo: userInfo
        })
        this.setVoiceOptions();
      },
      fail: error => {
        console.log(error)
      }
    })
  },

  //查询用户是否对本片有书评
  getUserCom(movieId) {
    qcloud.request({
      url: config.service.userComments + `?movieId=${movieId}`,
      method:'GET',
      login:true,
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
  onUserCom(){
    let comId = this.data.userComments[0].comment_id;
    let movieId = this.data.commentDetail.movie_id;
    wx.navigateTo({
      url: `/pages/comdetail/comdetail?comId=${comId}&movieId=${movieId}`,
    });
  },

  //播放录音
  onTapVoice() {
    if (this.data.voicePlayStatus === UNPLAYED) {
      //console.log("开始播放1");
      //真机调试IOS系统无法播放，Android可以播放
      innerAudioContext.play(() => {
        console.log("开始播放");
      });
    } else if (this.data.voicePlayStatus === PLAYING) {
      //console.log("暂停播放1");
      innerAudioContext.pause(() => {
        console.log("暂停播放");
      });
    }
  },

  //音频参数设置
  setVoiceOptions() {
    innerAudioContext.onPlay(() => {
      this.setData({
        voicePlayStatus: PLAYING
      })
    })
    innerAudioContext.onPause(() => {
      this.setData({
        voicePlayStatus: UNPLAYED
      })
    })
    innerAudioContext.onStop(() => {
      this.setData({
        voicePlayStatus: UNPLAYED
      })
    })
    innerAudioContext.onEnded(() => {
      this.setData({
        voicePlayStatus: UNPLAYED
      })
    })
    innerAudioContext.onError(error => {
      console.log(error);
    });
  },
})