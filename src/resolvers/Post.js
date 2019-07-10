// 定義關聯
const Post = {
  // post 跟 user 關聯
  // 在搜尋 posts 時如果有指定到顯示 author 資料，將會執行以下方法
  author(parent, args, { db }, info) {
    return db.users.find(user => user.id === parent.author);
  },
  // post 跟 comment 關聯
  // 在搜尋 posts 時如果有指定到顯示 comments 資料，將會執行以下方法
  comments(parent, args, { db }, info) {
    return db.comments.filter(comment => comment.post === parent.id);
  }
};

export { Post as default };
