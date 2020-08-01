// pages/comedit/comedit.js
const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');
const app = getApp();
const recorderManager = wx.getRecorderManager();
const innerAudioContext = wx.createInnerAudioContext();
// 录音状态
const UNRECORDED = 0 //未录音
const RECORDING = 1 //录音中
const RECORDED = 2 //录音完成
// 录音授权状态
const UNVERIFIED = 0 // 未验证
const UNAUTHORIZED = 1 // 未授权
const AUTHORIZED = 2 // 已授权
// 播放状态
const UNPLAYED = 0
const PLAYING = 1

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: '',
    comContent: "", //文本内容，只有在书评内容是text时起效
    comVoice: null, //音频评论，只有在书评内容是voice是起效
    //comType: 'text', // 书评类型，默认为文本
    comType: 'voice',
    preview: false, // 编辑完成后转入预览模式
    voiceRecStatusTip: ['按住录音', '松开结束', '重新录制'], //录音按钮的文字显示与状态的对应关系
    voiceRecStatus: UNRECORDED, //录音状态标记
    voicePlayStatus: UNPLAYED, //录音播放状态
    voiceRecAuthStatus: UNVERIFIED, // 录音授权状态
    movie:'',
    // movie: {
    //   "id": 1,
    //   "title": "复仇者联盟3：无限战争",
    //   "image": "https://movies-1257864644.cos.ap-beijing.myqcloud.com/p2517753454.jpg",
    //   "category": "动作 / 科幻 / 奇幻 / 冒险",
    //   "description": "《复仇者联盟3：无限战争》是漫威图书宇宙10周年的历史性集结，将为书迷们带来史诗版的终极对决。面对灭霸突然发起的闪图袭击，复仇者联盟及其所有超级英雄盟友必须全力以赴，才能阻止他对全宇宙造成毁灭性的打击。",
    //   "create_time": "2018-12-26T00:43:53.000Z"
    // },

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let comType = options.comType;
    this.setData({
      comType: comType,
    });
    let movieId = options.movieId;
    wx.setNavigationBarTitle({
      title: '书评编辑'
    });
    //如果是语音模式则开始查询并获取语音授权
    if (comType === 'voice') {
      this.getRecAuth();
    }
    console.log(this.data.userInfo);
    console.log(movieId);
    console.log(comType);
    this.getMovie(movieId);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    app.login({
      success: userInfo => {
        this.setData({
          userInfo: userInfo,
          voiceRecStatus: UNRECORDED,
        });
        this.setVoiceOptions();
      },
      fail: error => {
        console.log(error);
      }
    });
    //console.log(this.data.userInfo);
  },

  // 点击登录函数
  onTapLogin: function(event) {
    if (event.detail.userInfo) {
      this.setData({
        userInfo: event.detail.userInfo
      });
    }
  },

  //获取用户输入文字
  onInputComment: function(event) {
    this.setData({
      comContent: event.detail.value,
    });
  },

  //开始录音
  startRec() {
    const options = {
      duration: 60000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 96000,
      format: 'mp3',
      frameSize: 50
    }
    if (this.data.voiceRecAuthStatus === UNVERIFIED) {
      this.getRecAuth();
    } else if (this.data.voiceRecAuthStatus === AUTHORIZED) {
      recorderManager.onStart(() => {
        wx.vibrateShort();
        innerAudioContext.stop();
        this.setData({
          voiceRecStatus: RECORDING,
          comVoice: null,
        });
      })
      recorderManager.start(options);
    }
  },

  //松开结束录音
  endRec() {
    recorderManager.stop();
    recorderManager.onStop((res) => {
      res['durationText'] = Math.floor(res.duration / 1000 * 100) / 100 + "''"
      this.setData({
        comVoice: res,
        voiceRecStatus: RECORDED
      })
      innerAudioContext.src = res.tempFilePath;
      console.log(innerAudioContext.src);
    });
  },

  //获取用户录音授权
  getRecAuth() {
    // 获取用户录音授权状态
    wx.getSetting({
      success: (res) => {
        let auth = res.authSetting['scope.record']
        //未验证
        if (auth === undefined) {
          wx.authorize({
            scope: 'scope.record',
            success: () => {
              // 已授权
              this.setData({
                voiceRecAuthStatus: AUTHORIZED
              })
            },
            fail: error => {
              console.log(error);
              // 未授权
              this.setData({
                voiceRecAuthStatus: UNAUTHORIZED
              });
            }
          });
        } else if (auth === false) {
          // 未授权
          this.setData({
            voiceRecAuthStatus: UNAUTHORIZED
          });
        } else if (auth === true) {
          // 已授权
          this.setData({
            voiceRecAuthStatus: AUTHORIZED
          });
        }
      },
      fail: error => {
        console.log(error);
      }
    });
  },

  //授权回调函数
  settingCallBack(event) {
    let auth = event.detail.authSetting['scope.record']

    if (auth === false) {
      this.setData({
        voiceRecAuthStatus: UNAUTHORIZED
      });
    } else {
      this.setData({
        voiceRecAuthStatus: AUTHORIZED
      });
    }
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

  //获取图书信息
  getMovie(movieId) {
    wx.showLoading({
      title: '图书加载中...'
    })
    qcloud.request({
      url: config.service.moviesUrl + movieId,
      success: result => {
        console.log(result);
        if (!result.data.code && result.data.data !== {}) {
          this.setData({
            movie: result.data.data
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: '图书详情加载失败'
          })
        }
      },
      fail: error => {
        console.log(error)
        wx.showToast({
          icon: 'none',
          title: '图书详情加载失败'
        })
      },
      complete: result => {
        wx.hideLoading();
      }
    });
  },

  //点击完成按钮事件
  onTapFinish() {
    //console.log(this.data.userInfo);调试是否出现用户信息
    //this.sendCom();
    this.setData({
      preview: true,
    });
    wx.setNavigationBarTitle({
      title: '书评预览'
    });
  },

  //点击重新编辑按钮
  onTapReEdit() {
    this.setData({
      preview: false,
    });
    wx.setNavigationBarTitle({
      title: '书评编辑'
    });
  },

  //点击发布书评
  onSendCom() {
    this.sendCom();
  },

  //添加书评
  addCom(movieId, comment, comType, duration) {
    wx.showLoading({
      title: '书评发布中...'
    });
    console.log(comType);
    qcloud.request({
      url: config.service.commentUploadUrl,
      data: {
        movieId: movieId,
        content: comment,
        comType: comType,
        duration: duration
      },
      login: true,
      method: 'POST',
      success: result => {
        wx.hideLoading();
        if (!result.data.code) {
          wx.showToast({
            title: '书评发布成功'
          });
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/comlist/comtlist?movieId=' + movieId
            })
          }, 1500);
        } else {
          wx.showToast({
            icon: 'none',
            title: '书评发布失败'
          })
        }
      },
      fail: error => {
        console.log(error);
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: '书评发布失败'
        })
      }
    })
  },

  //上传音频文件到存储桶
  uploadVoice(cb) {
    let url = this.data.comVoice.tempFilePath;
    wx.uploadFile({
      url: config.service.uploadUrl,
      filePath: url,
      name: 'file',
      header: {
        'content-type': 'multipart/form-data'
      },
      success: res => {
        console.log(res);
        let content = JSON.parse(res.data).data.imgUrl;
        cb && cb(content)
      },
      fail: error => {
        console.log(error);
      }
    })
  },

  //发送书评函数
  sendCom() {
    let movieId = this.data.movie.id;
    let comment = this.data.comContent;
    let comType = this.data.comType;
    let duration = null;
    if (this.data.comVoice) {
      duration = this.data.comVoice.duration;
    }
    if (comType === 'text') {
      this.addCom(movieId, comment, comType, duration);
    }
    else if (comType === 'voice') {
      this.uploadVoice((content) => {
        this.addCom(movieId, content, comType, duration);
      });
    }
    //要保证成功之后才能跳转
    // wx.navigateTo({
    //   url: `/pages/comlist/comtlist?movieId=${movieId}`
    // });
  },

})