const DB = require('../utils/db.js');

module.exports = {
  list: async ctx => {
    ctx.state.data = await DB.query("SELECT * FROM movies;")
  },

  detail: async ctx => {
    const movieId = + ctx.params.id
    if (!isNaN(movieId)) {//异常处理
      ctx.state.data = (await DB.query("SELECT * FROM movies where id = ?", [movieId]))[0]
    } else {
      ctx.state.data = {}
    }
  }
}