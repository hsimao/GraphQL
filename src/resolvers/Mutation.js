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
  updateUser(parent, args, { db }, info) {
    const { id, data } = args;
    const user = db.users.find(user => user.id === id);

    if (!user) {
      throw new Error("User not found");
    }
    // 檢查 email
    if (typeof data.email === "string") {
      const emailTaken = db.users.some(user => user.email === data.email);

      if (emailTaken) throw new Error("此 Email 已經有用戶使用");

      user.email = data.email;
    }

    if (typeof data.name === "string") {
      user.name = data.name;
    }

    if (typeof data.age !== "undefined") {
      user.age = data.age;
    }

    return user;
  },

  createPost(parent, args, { db, pubsub }, info) {
    const userExists = db.users.some(user => user.id === args.data.author);

    if (!userExists) {
      throw new Error("用戶不存在, 無法創建文章");
    }

    const post = {
      id: uuidv4(),
      ...args.data
    };

    db.posts.push(post);

    if (args.data.published) {
      pubsub.publish("post", {
        post: {
          mutation: "CREATED",
          data: post
        }
      });
    }

    return post;
  },
  deletePost(parent, args, { db, pubsub }, info) {
    const postIndex = db.posts.findIndex(post => post.id === args.id);

    if (postIndex === -1) throw new Error("此文章id不存在!");
    // 刪除 post
    const [post] = db.posts.splice(postIndex, 1);

    // 刪除 post 關聯 comment
    db.comments = db.comments.filter(comment => comment.post !== args.id);

    // 公開的文章才觸發監聽功能
    if (post.published) {
      pubsub.publish("post", {
        post: {
          mutation: "DELETED",
          data: post
        }
      });
    }
    // 返回已刪除 post
    return post;
  },
  updatePost(parent, args, { db, pubsub }, info) {
    const { id, data } = args;
    const post = db.posts.find(post => post.id === id);
    const originalPost = { ...post };

    if (!post) {
      throw new Error("此文章不存在！");
    }

    if (typeof data.title === "string") {
      post.title = data.title;
    }

    if (typeof data.body === "string") {
      post.body = data.body;
    }

    if (typeof data.published === "boolean") {
      post.published = data.published;

      // 判斷最初文章的公開狀態與更新完後的公開狀態, 公開 => 不公開 : 調用 deleted 通知
      if (originalPost.published && !post.published) {
        pubsub.publish("post", {
          post: {
            mutation: "DELETED",
            data: originalPost
          }
        });

        // 不公開 => 公開 : 調用 created 通知
      } else if (!originalPost.published && post.published) {
        pubsub.publish("post", {
          post: {
            mutation: "CREATED",
            data: post
          }
        });
        // 沒更改到公開狀態，但文章為公開, 調用 update 通知
      } else if (post.published) {
        pubsub.publish("post", {
          post: {
            mutation: "UPDATED",
            data: post
          }
        });
      }
    }

    return post;
  },

  createComment(parent, args, { db, pubsub }, info) {
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
    pubsub.publish(`comment ${args.data.post}`, { comment });

    return comment;
  },
  deleteComment(parent, args, { db }, info) {
    const commentIndex = db.comments.findIndex(
      comment => comment.id === args.id
    );

    if (commentIndex === -1) throw new Error("此留言id不存在");

    const deletedComment = db.comments.splice(commentIndex, 1);

    return deletedComment[0];
  },
  updateComment(parent, args, { db }, info) {
    const { id, data } = args;
    const comment = db.comments.find(comment => comment.id === id);
    if (!comment) {
      throw new Error("找不到該留言！");
    }

    if (typeof data.text === "string") {
      comment.text = data.text;
    }

    return comment;
  }
};

export { Mutation as default };
