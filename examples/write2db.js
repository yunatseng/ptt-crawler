'use strict';

const { 
	pttCrawler,
} = require('../index.js');
const {
	getDbClient,
	parse2Posts,
	filterPosts,
} = require('./utils.js');

async function main() {
	const dbClient = await getDbClient();

	/** DB 名稱 */
	const dbName = 'crawler_result';
	const db = dbClient.db(dbName);

	console.log('---開始爬 PTT---');

	/** 集合（表）名稱 */
	const collectionName = 'ptt';
	const collection = db.collection(collectionName);

	// 初始爬蟲
	await pttCrawler.initialize({
		headless: false,
	});

	try {
		/** 保險版 */
		const board = 'Insurance';
		/** 頁數 */
		const pages = 3;
		console.log(`開始爬 ${board} 版，共 ${pages} 頁`);

		/** 爬蟲結果 */
		const result = await pttCrawler.getResults({
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
		console.error('爬 PTT 失敗', error);
	}

	await pttCrawler.close();
	await dbClient.close();
}

main();