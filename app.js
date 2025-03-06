const express = require('express');
const bodyParser = require('body-parser');

const { getStoredPosts, storePosts } = require('./data/posts');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    // Attach CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Fetch all posts
app.get('/posts', async (req, res) => {
    const storedPosts = await getStoredPosts();
    res.json({ posts: storedPosts });
});

// Fetch a single post by ID
app.get('/posts/:id', async (req, res) => {
    const storedPosts = await getStoredPosts();
    const post = storedPosts.find((post) => post.id === req.params.id);
    if (post) {
        res.json({ post });
    } else {
        res.status(404).json({ message: 'Post not found.' });
    }
});

// Add a new post
app.post('/posts', async (req, res) => {
    const existingPosts = await getStoredPosts();
    const postData = req.body;
    const newPost = {
        ...postData,
        id: Math.random().toString(),
    };
    const updatedPosts = [newPost, ...existingPosts];
    await storePosts(updatedPosts);
    res.status(201).json({ message: 'Stored new post.', post: newPost });
});

// Update an existing post
app.put('/posts/:id', async (req, res) => {
    const existingPosts = await getStoredPosts();
    const postId = req.params.id;
    const updatedBody = req.body.body;

    const postIndex = existingPosts.findIndex((post) => post.id === postId);
    if (postIndex === -1) {
        return res.status(404).json({ message: 'Post not found.' });
    }

    const updatedPost = {
        ...existingPosts[postIndex],
        body: updatedBody,
    };

    existingPosts[postIndex] = updatedPost;
    await storePosts(existingPosts);
    res.json({ message: 'Post updated.', post: updatedPost });
});

// Delete a post
app.delete('/posts/:id', async (req, res) => {
    const existingPosts = await getStoredPosts();
    const postId = req.params.id;

    const updatedPosts = existingPosts.filter((post) => post.id !== postId);
    if (updatedPosts.length === existingPosts.length) {
        return res.status(404).json({ message: 'Post not found.' });
    }

    await storePosts(updatedPosts);
    res.json({ message: 'Post deleted.' });
});

app.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});