const fs = require('node:fs/promises');

async function getStoredPosts() {
    const rawFileContent = await fs.readFile('posts.json', {
        encoding: 'utf-8'
    });
    const data = JSON.parse(rawFileContent);
    const storedPosts = data.posts ?? [];
    return storedPosts;
}

function storePosts(posts) {
    return fs.writeFile('posts.json', JSON.stringify({ posts: posts || [] }));
}

module.exports = async (req, res) => {
    if (req.method === 'GET' && req.url === '/api/posts') {
        const posts = await getStoredPosts();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(posts));
    } else if (req.method === 'POST' && req.url === '/api/posts') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const newPost = JSON.parse(body);
            const posts = await getStoredPosts();
            posts.push(newPost);
            await storePosts(posts);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newPost));
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Not Found' }));
    }
};