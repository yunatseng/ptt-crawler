'use strict';

const ptt_crawler = require('../index.js');
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

async function main() {
	const client = await getDbClient();

	/** DB 名稱 */
	const dbName = 'crawler_result';
	const db = client.db(dbName);

	/** 集合（表）名稱 */
	const collectionName = 'ptt';
	const collection = db.collection(collectionName);

	// 初始爬蟲
	await ptt_crawler.initialize({
		headless: true
	});

	try {
		/** 保險版 */
		const board = 'Insurance';
		/** 頁數 */
		const pages = 5;
		console.log(`開始爬 ${board} 版，共 ${pages} 頁`);

		/** 爬蟲結果 */
		const result = await ptt_crawler.getResults({
			board: board,
			pages: pages,
			skipPBs: true,
			getContents: true
		});
		
		// 轉成貼文列表
		const posts = parse2Posts(result);
		console.log(`爬完 ${board} 版 ${pages} 頁，結果共 ${posts.length} 篇`, /* posts */);

		/** 關鍵字列表 */
		const keywords = ['國泰', '大樹'];
		// 依關鍵過濾貼文列表
		const filteredPosts = filterPosts({ posts, keywords });
		console.log(`原 ${posts.length} 篇，根據 ${keywords.join('、')} 過濾完後剩 ${filteredPosts.length} 篇`);
	
		const res = await collection.insertMany(filteredPosts);
		console.log(`寫入 ${dbName}/${collectionName} 表成功`, res);
	} catch (error) {
		console.error(error);
	} finally {
		await ptt_crawler.close();
		await client.close();
	}
}

main();