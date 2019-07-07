import { GraphQLServer } from "graphql-yoga";

// demo users data
const users = [
  {
    id: "1",
    name: "Mars",
    email: "mars@gmail.com",
    age: 32
  },
  {
    id: "2",
    name: "Sally",
    email: "sally@gmail.com"
  },
  {
    id: "3",
    name: "Jack",
    email: "jack@gmail.com",
    age: 35
  }
];

const posts = [
  {
    id: "1",
    title: "標題1",
    body: "body1...",
    published: true,
    author: "3"
  },
  {
    id: "2",
    title: "標題2",
    published: false,
    author: "3"
  },
  {
    id: "3",
    title: "文章3",
    body: "body3...",
    published: false,
    author: "3"
  }
];

const comments = [
  {
    id: "101",
    text: "很棒的文章",
    author: "1",
    post: "1"
  },
  {
    id: "102",
    text: "nice post",
    author: "3",
    post: "1"
  },
  {
    id: "103",
    text: "我不喜歡這篇文章",
    author: "3",
    post: "2"
  },
  {
    id: "104",
    text: "大神～請收下我的膝蓋",
    author: "3",
    post: "3"
  }
];

// 定義 schmea type
// String, Boolean, Int, Float, ID
const typeDefs = `
  type Query {
    users(query: String): [User!]!
    posts(query: String): [Post!]!
    comments(query:String): [Comment!]!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int,
    posts: [Post!]!
    comments: [Comment!]!
  }

  type Post {
    id: ID!
    title: String!
    body: String
    published: Boolean!
    author: User!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    text: String!
    author: User!
    post: Post!
  }
`;

// 定義解析器 Resolvers
const resolvers = {
  Query: {
    users(parent, args, ctx, info) {
      if (!args.query) return users;

      return users.filter(user => {
        return user.name.toLowerCase().includes(args.query.toLowerCase());
      });
    },

    posts(parent, args, ctx, info) {
      if (!args.query) return posts;

      return posts.filter(post => {
        const isTitleMatch = post.title.toLowerCase().includes(args.query.toLowerCase());
        const isBodyMatch = post.body && post.body.toLowerCase().includes(args.query.toLowerCase());
        return isTitleMatch || isBodyMatch;
      });
    },

    comments(parent, args, ctx, info) {
      if (!args.query) return comments;

      return comments.filter(comment => {
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
    author(parent, args, ctx, info) {
      return users.find(user => user.id === parent.author);
    },
    // post 跟 comment 關聯
    // 在搜尋 posts 時如果有指定到顯示 comments 資料，將會執行以下方法
    comments(parent, args, ctx, info) {
      return comments.filter(comment => comment.post === parent.id);
    }
  },

  // user 跟 post 關聯
  User: {
    // user 跟 post 關聯
    posts(parent, args, ctx, info) {
      return posts.filter(post => post.author === parent.id);
    },
    // user 跟 comment 關聯
    comments(parent, args, ctx, info) {
      return comments.filter(comment => comment.author === parent.id);
    }
  },

  // comment 跟 user 關聯
  Comment: {
    author(parent, args, ctx, info) {
      return users.find(user => user.id === parent.author);
    },
    post(parent, args, ctx, info) {
      return posts.find(post => post.id === parent.post);
    }
  }
};

const server = new GraphQLServer({
  typeDefs,
  resolvers
});

server.start(() => {
  console.log("GraphQL server is start");
});
