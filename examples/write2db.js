'use strict';

const ptt_crawler = require('../index.js');

// 轉化成 Post[] e.g. [{ title: '...', url: '...' }, ...]
function parse2Posts(result) {
	const posts = [];
	Object.entries(result).forEach(([key, values]) => {
		values.forEach((value, index) => {
			posts[index] = { ...posts[index], [key.slice(0, -1)]: value };
		});
	});

	return posts;
}

async function main() {
	await ptt_crawler.initialize({
		headless: true
	});

	/** 保險版 */
	const board = 'Insurance';
	/** 頁數 */
	const pages = 1;
	const result = await ptt_crawler.getResults({
		board: board,
		pages: pages,
		skipPBs: true,
		getContents: true
	});

	await ptt_crawler.close();

	const posts = parse2Posts(result);
	console.log(`爬 ${board} 版，共 ${pages} 頁 ${posts.length} 篇 \n`, posts);
}

main();