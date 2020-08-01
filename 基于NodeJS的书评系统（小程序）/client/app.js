//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')
let userInfo;

App({
  onLaunch: function() {
    qcloud.setLoginUrl(config.service.loginUrl)
  },
  //登录函数实现
  login({
    success,
    fail,
    complete
  }) {
    if (userInfo) {
      return success && success(userInfo);
    }
    qcloud.login({
      success: result => {
        if (result) {
          userInfo = result;
          //登录成功执行传入的success函数参数
          success && success(userInfo);
        } else {
          this.getUserInfo({
            success,
            fail,
            complete,
          });
        }
      },
      fail: error => {
        console.log(error);
        fail && fail();
      },
      complete: () => {
        complete && complete();
      }
    })
  },

  // 获取用户信息函数
  getUserInfo({
    success,
    fail,
    complete
  }) {
    qcloud.request({
      url: config.service.requestUrl,
      login: true,
      success: result => {
        //console.log(result);
        let data = result.data;
        if (!data.code) {
          userInfo = data.data;
          success && success(userInfo);
        } else {
          fail && fail();
        }
      },
      fail: error => {
        console.log(error);
        fail && fail();
      },
      complete: () => {
        complete && complete();
      }
    })
  }
})