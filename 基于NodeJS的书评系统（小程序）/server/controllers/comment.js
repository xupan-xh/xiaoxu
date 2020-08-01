const DB = require('../utils/db.js')

module.exports = {
  
  //根据电影id获取书评列表
  list: async ctx => {
    const { movieId } = ctx.request.query;
    if (!isNaN(movieId)) {
      ctx.state.data = await DB.query('Select * from comment where movie_id = ? order by create_time desc', [movieId])
    }
  },

  //根据影评id获得书评信息
  comment: async ctx => {
    const comId = + ctx.params.id
    if (!isNaN(comId)) {//异常处理
      ctx.state.data = (await DB.query("SELECT * FROM comment where id = ?", [comId]))[0]
    } else {
      ctx.state.data = {}
    }
  },

  //取得随机一条评论
  oneOfComments: async ctx => {
    ctx.state.data = await DB.query("Select comment.id as comment_id, comment.content as content, comment.duration as duration, comment.type as type, comment.user_avatar as user_avatar, comment.user_name as user_name,comment.movie_id as movie_id ,movies.image as movie_image, movies.title as movie_title from comment left join movies on comment.movie_id = movies.id order by rand() limit 1")
  },
  
  //添加书评
  add: async ctx => {
    const user = ctx.state.$wxInfo.userinfo.openId;
    const username = ctx.state.$wxInfo.userinfo.nickName;
    const avatar = ctx.state.$wxInfo.userinfo.avatarUrl;
    const { movieId, content, comType, duration } = ctx.request.body;

    if (!isNaN(movieId)) {
      await DB.query('INSERT INTO comment(movie_id, user_id, user_name, user_avatar, type, content, duration) VALUES (?, ?, ?, ?, ?, ?, ?)', [movieId, user, username, avatar, comType, content, duration])
    }
    ctx.state.data = {}
  },

  //根据书评id获取包含书籍，收藏等信息的书评信息，左联接
  detail: async ctx => {
    const user = ctx.state.$wxInfo.userinfo.openId;
    const id = +ctx.params.id;
    if (!isNaN(id)) {
      ctx.state.data = (await DB.query('SELECT comment.id as comment_id, comment.movie_id as movie_id, comment.user_id as user_id, comment.user_name as user_name, comment.user_avatar as user_avatar, type as type, comment.content as content, comment.duration as duration, comment.create_time as create_time, movies.title as movie_title, movies.image as movie_image, collection.id as collection_id FROM comment LEFT JOIN movies ON comment.movie_id = movies.id LEFT JOIN collection ON comment.id = collection.comment_id AND collection.user_id = ? where comment.id = ?', [user, id]))[0] || []
    }
  },

  //返回一个用户对某一书评的所有书评
  userComments: async ctx => {
    const user = ctx.state.$wxInfo.userinfo.openId;
    const { movieId } = ctx.request.query;
    if (!movieId) movieId = null
    ctx.state.data = await DB.query('Select comment.id as comment_id, comment.content as content, comment.duration as duration, comment.type as type, comment.user_avatar as user_avatar, comment.user_name as user_name, movies.image as movie_image, movies.title as movie_title from comment left join movies on comment.movie_id = movies.id where user_id = ? and comment.movie_id = ifnull(?, comment.movie_id) order by comment.create_time desc', [user, movieId])
  },

  //返回一个用户对发布的所有书评
  userAllComments: async ctx => {
    const user = ctx.state.$wxInfo.userinfo.openId;
    ctx.state.data = await DB.query('Select comment.id as comment_id, comment.content as content, comment.duration as duration, comment.type as type, comment.user_avatar as user_avatar, comment.user_name as user_name, movies.image as movie_image, movies.title as movie_title from comment left join movies on comment.movie_id = movies.id where user_id = ? order by comment.create_time desc', [user])
  }
}