/**
 * ajax 服务路由集合
 */
const router = require('koa-router')({
    prefix: '/weapp'
})
const controllers = require('../controllers')

// 从 sdk 中取出中间件
// 这里展示如何使用 Koa 中间件完成登录态的颁发与验证
const { auth: { authorizationMiddleware, validationMiddleware } } = require('../qcloud')

// --- 登录与授权 Demo --- //
// 登录接口
router.get('/login', authorizationMiddleware, controllers.login)
// 用户信息接口（可以用来验证登录态）
router.get('/user', validationMiddleware, controllers.user)

// --- 图片上传 Demo --- //
// 图片上传接口，小程序端可以直接将 url 填入 wx.uploadFile 中
router.post('/upload', controllers.upload)

// --- 信道服务接口 Demo --- //
// GET  用来响应请求信道地址的
router.get('/tunnel', controllers.tunnel.get)
// POST 用来处理信道传递过来的消息
router.post('/tunnel', controllers.tunnel.post)

// --- 客服消息接口 Demo --- //
// GET  用来响应小程序后台配置时发送的验证请求
router.get('/message', controllers.message.get)
// POST 用来处理微信转发过来的客服消息
router.post('/message', controllers.message.post)

// GET 用来获取books表数据
router.get('/movies',controllers.movies.list)
// 获取书籍详情
router.get('/movies/:id', controllers.movies.detail)
// 提交书评
router.post('/comment', validationMiddleware, controllers.comment.add)
// 书评列表
router.get('/comment', controllers.comment.list)
// 获取评论详情
//router.get('/comment/:id', controllers.comment.comment)
// 获得组合书评详情
router.get('/comment/:id', validationMiddleware, controllers.comment.detail)
// 评论收藏相关
router.post('/collection', validationMiddleware, controllers.collection.update)
// 获得用户收藏列表
router.get('/collection', validationMiddleware, controllers.collection.collection)
// 获取用户某一书籍书评
router.get('/usercomments', validationMiddleware, controllers.comment.userComments)
// 获取用户所有书评
router.get('/userallcomments',validationMiddleware, controllers.comment.userAllComments)
// 获取所有的评论
router.get('/oneofcomments', validationMiddleware, controllers.comment.oneOfComments)


module.exports = router
