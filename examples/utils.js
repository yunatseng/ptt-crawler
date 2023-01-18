const { MongoClient } = require('mongodb');

/** 轉成貼文列表 Post[] e.g. [{ title: '...', url: '...' }, ...] */
function parse2Posts(result = {}) {
	const extractType = (title = '') => {
		const results = /\[(.*?)\]/g.exec(title);
		return (results && results[1]) || null;
	};
	const extractDetail = (text = '') => {
		const timeStampRegExp = /([a-zA-Z]{3}\s.*\s\d{2}\s\d{2}:\d{2}:\d{2}\s\d{4})/;
		const date = timeStampRegExp.exec(text)[1];
		const cleanText = text
			.replace(/[\n\r]/g, '')
			.replace(new RegExp(`作者.*看板.*標題.*時間${timeStampRegExp.source}`), '');
		const [content, comments] = cleanText.split('--※');

		return {
			content,
			comments: `※${comments}`,
			date,
		};
	};

	const posts = [];
	Object.entries(result).forEach(([key, values]) => {
		const newKey = key.slice(0, -1);
		values.forEach((value = '', index = 0) => {
			posts[index] = {
				...posts[index],
				[newKey]: value,

				...(newKey === 'title' ? { type: extractType(value) } : {}),
				...(newKey === 'content' ? extractDetail(value): {})
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