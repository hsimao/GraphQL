import { GraphQLServer } from "graphql-yoga";
import uuidv4 from "uuid/v4";
import db from "./db";
console.log("db", db.comments);

// 定義解析器 Resolvers
const resolvers = {
  Query: {
    users(parent, args, { db }, info) {
      if (!args.query) return db.users;

      return db.users.filter(user => {
        return user.name.toLowerCase().includes(args.query.toLowerCase());
      });
    },

    posts(parent, args, { db }, info) {
      if (!args.query) return db.posts;

      return db.posts.filter(post => {
        const isTitleMatch = post.title.toLowerCase().includes(args.query.toLowerCase());
        const isBodyMatch = post.body && post.body.toLowerCase().includes(args.query.toLowerCase());
        return isTitleMatch || isBodyMatch;
      });
    },

    comments(parent, args, { db }, info) {
      if (!args.query) return db.comments;

      return db.comments.filter(comment => {
        const isIdMatch = comment.id.toLowerCase().includes(args.query.toLowerCase());
        const isTextMatch = comment.text.toLowerCase().includes(args.query.toLowerCase());
        return isIdMatch || isTextMatch;
      });
    }
  },

  // 定義關聯
  Post: {
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
  },

  // user 跟 post 關聯
  User: {
    // user 跟 post 關聯
    posts(parent, args, { db }, info) {
      return db.posts.filter(post => post.author === parent.id);
    },
    // user 跟 comment 關聯
    comments(parent, args, { db }, info) {
      return db.comments.filter(comment => comment.author === parent.id);
    }
  },

  // comment 跟 user 關聯
  Comment: {
    author(parent, args, { db }, info) {
      return db.users.find(user => user.id === parent.author);
    },
    post(parent, args, { db }, info) {
      return db.posts.find(post => post.id === parent.post);
    }
  },

  // Mutation
  Mutation: {
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
  }
};

const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers,
  // 將要通用的變數放置於 content, 之後即可在 resolvers 內透過 ctx 取得
  context: {
    db
  }
});

server.start(() => {
  console.log("GraphQL server is start");
});
