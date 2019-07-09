let users = [
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

let posts = [
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

let comments = [
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

const db = {
  users,
  posts,
  comments
};

export { db as default };
