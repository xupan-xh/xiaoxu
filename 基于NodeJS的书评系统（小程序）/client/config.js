/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
var host = 'https://www.e-lian.club';

var config = {

  // 下面的地址配合云端 Demo 工作
  service: {
    host,

    // 登录地址，用于建立会话
    loginUrl: `${host}/weapp/login`,

    // 测试的请求地址，用于测试会话
    requestUrl: `${host}/weapp/user`,

    // 测试的信道服务地址
    tunnelUrl: `${host}/weapp/tunnel`,

    // 上传图片接口
    uploadUrl: `${host}/weapp/upload`,

    // 图书数据地址
    moviesUrl: `${host}/weapp/movies/`,

    // 书评地址
    commentUrl: `${host}/weapp/comment`,

    // 书评上传地址
    commentUploadUrl: `${host}/weapp/comment/`,

    // 收藏地址
    collectionUrl: `${host}/weapp/collection`,

    // 收藏地址
    userComments: `${host}/weapp/usercomments`,

    // 收藏地址
    userAllComments: `${host}/weapp/userallcomments`,

    // 随机一条评论
    oneOfComments: `${host}/weapp/oneofcomments`,
  }
};

module.exports = config;