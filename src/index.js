import { GraphQLServer } from "graphql-yoga";
import db from "./db";
import Query from "./resolvers/Query";
import Mutation from "./resolvers/Mutation";
import User from "./resolvers/User";
import Post from "./resolvers/Post";
import Comment from "./resolvers/Comment";

const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers: {
    Query,
    Mutation,
    User,
    Post,
    Comment
  },
  // 將要通用的變數放置於 content, 之後即可在 resolvers 內透過 ctx 取得
  context: {
    db
  }
});

server.start(() => {
  console.log("GraphQL server is start");
});
