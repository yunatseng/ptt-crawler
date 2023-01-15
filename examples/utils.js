const { MongoClient } = require('mongodb');

/** 轉成貼文列表 Post[] e.g. [{ title: '...', url: '...' }, ...] */
function parse2Posts(result = {}) {
	const posts = [];
	Object.entries(result).forEach(([key, values]) => {
		values.forEach((value, index) => {
			posts[index] = {
				...posts[index],
				[key.slice(0, -1)]: value 
			};
		});
	});

	return posts;
}

/** 根據關鍵字過濾貼文 */
function filterPosts({ posts = [], keywords = [] }) {
	return posts.filter((post) => (
		keywords.some((keyword) => post.title.includes(keyword))
		|| keywords.some((keyword) => post.content.includes(keyword))
	));
}

/** 取得 DB Client */
async function getDbClient() {
	const url = 'mongodb://localhost:27017';
	const client = new MongoClient(url);

	await client.connect();
	console.log('連接 MongoDB 成功！');
	
	return client;
}

module.exports = {
	parse2Posts,
	filterPosts,
	getDbClient
};