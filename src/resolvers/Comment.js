const Comment = {
  // comment 跟 user 關聯
  author(parent, args, { db }, info) {
    return db.users.find(user => user.id === parent.author);
  },
  // comment 跟 post 關聯
  post(parent, args, { db }, info) {
    return db.posts.find(post => post.id === parent.post);
  }
};

export { Comment as default };
