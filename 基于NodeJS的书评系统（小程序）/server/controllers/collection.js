// 登录授权接口
const DB = require('../utils/db.js');
// 收藏状态
const UNCOLLECT = 0;
const COLLECTED = 1;

module.exports = {

  //更新收藏信息，收藏为向数据库插入，取消收藏为从数据库删除
  update: async ctx => {
    const user = ctx.state.$wxInfo.userinfo.openId;
    const {comId,collectStatus} = ctx.request.body;
    if (!isNaN(comId)) {
      if (collectStatus == UNCOLLECT) {
        //评论id删除
        await DB.query('Delete from collection where user_id = ? and comment_id = ?', [user, comId])
      } else if (collectStatus == COLLECTED) {
        await DB.query('INSERT INTO collection(user_id, comment_id) VALUES (?, ?)', [user, comId])
      }
    }
    ctx.state.data = {};
  },
  
  //获取收藏列表
  collection: async ctx => {
    const user = ctx.state.$wxInfo.userinfo.openId;
    //左联接具体的方法见w3school,线连接表再从连接的表中选择
    ctx.state.data = await DB.query('SELECT comment_movie.comment_id, comment_movie.movie_image, comment_movie.movie_title, comment_movie.user_name, comment_movie.user_avatar, comment_movie.content, comment_movie.duration, comment_movie.type FROM collection LEFT JOIN ( SELECT comment.id as comment_id, movies.image as movie_image, movies.title as movie_title, comment.user_name as user_name, comment.user_avatar as user_avatar, comment.content as content, comment.duration as duration, comment.type as type from comment LEFT JOIN movies ON comment.movie_id = movies.id ) AS comment_movie ON collection.comment_id = comment_movie.comment_id WHERE collection.user_id = ? order by collection.create_time desc', [user])
  }
}