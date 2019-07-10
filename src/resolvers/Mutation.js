import uuidv4 from "uuid/v4";

const Mutation = {
  createUser(parent, args, { db }, info) {
    const emailTaken = db.users.some(user => user.email === args.data.email);
    if (emailTaken) throw new Error("信箱已被使用");

    const user = {
      id: uuidv4(),
      ...args.data
    };

    db.users.push(user);

    return user;
  },
  deleteUser(parent, args, { db }, info) {
    const userIndex = db.users.findIndex(user => user.id === args.id);

    if (userIndex === -1) throw new Error("此用戶id不存在!");

    // 刪除user
    const deletedUser = db.users.splice(userIndex, 1);

    // 刪除 user 相關的 post
    db.posts = db.posts.filter(post => {
      const match = post.author === args.id;

      // 刪除 post 相關的 comment
      if (match) {
        db.comments = db.comments.filter(comment => comment.post !== post.id);
      }

      return !match;
    });

    // 刪除 user 相關的 comment
    db.comments = db.comments.filter(comment => comment.author !== args.id);

    // 返回已刪除 user
    return deletedUser[0];
  },

  createPost(parent, args, { db }, info) {
    const userExists = db.users.some(user => user.id === args.data.author);

    if (!userExists) {
      throw new Error("用戶不存在, 無法創建文章");
    }

    const post = {
      id: uuidv4(),
      ...args.data
    };

    db.posts.push(post);

    return post;
  },
  deletePost(parent, args, { db }, info) {
    const postIndex = db.posts.findIndex(post => post.id === args.id);

    if (postIndex === -1) throw new Error("此文章id不存在!");
    // 刪除 post
    const deletedPost = db.posts.splice(postIndex, 1);

    // 刪除 post 關聯 comment
    db.comments = db.comments.filter(comment => comment.post !== args.id);

    // 返回已刪除 post
    return deletedPost[0];
  },

  createComment(parent, args, { db }, info) {
    // 檢查用戶是否存在
    const userExists = db.users.some(user => user.id === args.data.author);

    if (!userExists) {
      throw new Error("該用戶未存在");
    }

    // 檢查文章是否存在, 且公開
    const post = db.posts.find(post => post.id === args.data.post);

    if (!post) {
      throw new Error("沒有該篇文章");
    } else if (!post.published) {
      throw new Error("文章尚未公開，無法留言");
    }

    const comment = {
      id: uuidv4(),
      ...args.data
    };

    db.comments.push(comment);

    return comment;
  },
  deleteComment(parent, args, { db }, info) {
    const commentIndex = db.comments.findIndex(comment => comment.id === args.id);

    if (commentIndex === -1) throw new Error("此留言id不存在");

    const deletedComment = db.comments.splice(commentIndex, 1);

    return deletedComment[0];
  }
};

export { Mutation as default };