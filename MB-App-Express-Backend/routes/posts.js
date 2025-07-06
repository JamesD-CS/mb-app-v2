var express = require('express');
const db = require('../db.js');
var router = express.Router();
const { DateTime } = require("luxon");
const { v4: uuidv4 } = require('uuid');

router.use(express.json());

//Helper funtion to bundle posts and replies in a nested tree

function buildNestedTree(posts) {
  const map = new Map();
  const roots = [];

  // Initialize all posts in the map
  for (const post of posts) {
    map.set(post.poster_id, { ...post, replies: [] });
  }

  // Build the tree
  for (const post of posts) {
    const node = map.get(post.poster_id);
    if (post.parent_post_id) {
      const parent = map.get(post.parent_post_id);
      if (parent) {
        parent.replies.push(node);
      }
    } else {
      roots.push(node); // Top-level post
    }
  }

  console.log("post count:", posts.length)
  //console.log("built thread:",roots);
  return roots;
}


//Get list of all forums
router.get('/', async function(req, res, next) {
  try{
  const query = {
    // give the query a unique name
    name: 'get-forums',
    text: 'SELECT * FROM forums',
    
  }
  console.log(query);
  const result = await db.query(query)
  res.json(result.rows);

} catch (err) {
  console.error(err);
  res.status(500).send('Internal Server Error');
}
  
});

//Get all posts from forum
router.get('/:forum_id/', async function(req, res, next) {
  forum_id = Number(req.params.forum_id);
  page = 1;
  page_limit = 10;
  offset = 0;

  //paginate post results. 
  if (req.query.page){
    console.log('page query found, page is:', req.query.page);
    page = Number(req.query.page);
  }
  //limit post results. Default to 10 if no query parameters provided
  if (req.query.page_limit){
    console.log('page limit query found, page limit is:', req.query.page_limit);
    page_limit = Number(req.query.page_limit);
  } else{
    page_limit = 10;
  }

   if (page > 1){
      offset = (page * page_limit) - page_limit;

      console.log("page offset > 0 , query text: ", query.text);

    }

  console.log('page', page, 'page_limit', page_limit);

  try {

   
    //db query to retrieve all forum posts from db and recursively retrieve replies for each post.
    const new_get_posts_query = {
      name: 'get-posts-new' + String(Date.now()),
      text: `
    WITH RECURSIVE thread_tree (
      post_id, forum_id, title, body, poster_id, post_time, parent_post_id
    ) AS (
      -- Base case: top-level posts paginated and sorted
      (
        SELECT post_id, forum_id, title, body, poster_id, post_time, parent_post_id
        FROM posts
        WHERE forum_id = $1 AND parent_post_id IS NULL
        ORDER BY post_time DESC
        LIMIT $2 OFFSET $3
      )

      UNION ALL

      -- Recursive case: replies to top-level or nested posts
      SELECT p.post_id, p.forum_id, p.title, p.body, p.poster_id, p.post_time, p.parent_post_id
      FROM posts p
      JOIN thread_tree tt ON p.parent_post_id = tt.poster_id
    )
    SELECT * FROM thread_tree
    ORDER BY post_time;
  `,
      values:[forum_id, page_limit, offset]
    }

    const get_post_count_query = {
      // give the query a unique name
      name: 'get-post-count' + String(Date.now()),
      text: 'SELECT COUNT(*) FROM posts WHERE forum_id = $1 AND title IS NOT NULL',
      values: [forum_id]
    }

    console.log("final query:", new_get_posts_query);

    const [total_posts, post_results] = await Promise.all([

      db.query(get_post_count_query),
      db.query(new_get_posts_query)

    ]);
    //const total_posts = await db.query(get_post_count_query);

    //const post_results = await db.query(new_get_posts_query);

    const nested_post_results = buildNestedTree(post_results.rows);
    
    res.json({posts:nested_post_results, total_posts: total_posts.rows[0].count});


  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
  
});

//Get a post from forum
router.get('/:forum_id/:poster_id', async function(req, res, next) {
  let forum_id = Number(req.params.forum_id);
  let poster_id = req.params.poster_id;
  try {

    const get_post_query = {
      // give the query a unique name
      name: 'get-post',
      text: 'SELECT * FROM posts WHERE forum_id = $1 AND poster_id = $2',
      values: [forum_id, poster_id]
    }

    const new_get_post_query = {
      name: 'get-post-new' + String(Date.now()),
      text: `
    WITH RECURSIVE thread_tree (
      post_id, forum_id, title, body, poster_id, post_time, parent_post_id
    ) AS (
      -- Base case: top-level posts paginated and sorted
      (
        SELECT post_id, forum_id, title, body, poster_id, post_time, parent_post_id
        FROM posts
        WHERE forum_id = $1 AND poster_id = $2
        
      )

      UNION ALL

      -- Recursive case: replies to top-level or nested posts
      SELECT p.post_id, p.forum_id, p.title, p.body, p.poster_id, p.post_time, p.parent_post_id
      FROM posts p
      JOIN thread_tree tt ON p.parent_post_id = tt.poster_id
    )
    SELECT * FROM thread_tree
    ORDER BY post_time;
  `,
      values:[forum_id, poster_id]
    }
    const post = await db.query(new_get_post_query);
    let post_thread = buildNestedTree(post.rows)
    res.json({post:post_thread});

   
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
  
});

//Post message to forum
router.post('/:forum_id', async function(req, res, next) {
  let forum_id = Number(req.params.forum_id);
  let new_datetime = DateTime.now();
  let newuuid = uuidv4();
  console.log(req.body);
  
  const insert_query = {
    name: 'insert_message',
    text: 'INSERT INTO posts (forum_id, body, title, poster_id , post_time, parent_post_id ) VALUES($1, $2, $3, $4, $5, $6) ',
    values: [forum_id, req.body.body, req.body.title, newuuid, new_datetime, null]
  }
  console.log(insert_query);
  try{
    const result = await db.query(insert_query);
    console.log(result);
    res.status(201).send('Message Posted');

  } catch(error){
    console.error(error);
    res.status(500).send('Internal Server Error');
  }

});

//Post reply to message
router.post('/:forum_id/:post_id', async function(req, res, next) {
  let forum_id = Number(req.params.forum_id);
  let new_datetime = DateTime.now();
  let reply_uuid = uuidv4();
  let parent_post_id = req.params.post_id
  
  //Insert reply to posts table
  const insert_query = {
    name: 'insert_message',
    text: 'INSERT INTO posts (forum_id, body, poster_id , post_time, parent_post_id ) VALUES($1, $2, $3, $4, $5) ',
    values: [forum_id, req.body.body, reply_uuid, new_datetime, parent_post_id]
  }
  console.log(insert_query);
  try{
    const result = await db.query(insert_query);
    console.log(result);
    res.status(201).send('Message Posted');

  } catch(error){
    console.error(error);
    res.status(500).send('Internal Server Error');
  }

});

module.exports = router;
