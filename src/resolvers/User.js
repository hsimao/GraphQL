// 定義關聯
const User = {
  // user 跟 post 關聯
  posts(parent, args, { db }, info) {
    return db.posts.filter(post => post.author === parent.id);
  },
  // user 跟 comment 關聯
  comments(parent, args, { db }, info) {
    return db.comments.filter(comment => comment.author === parent.id);
  }
};

export { User as default };
