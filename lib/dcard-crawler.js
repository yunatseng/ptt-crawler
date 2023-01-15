const { initPuppeteer } = require('./utils');

class DcardCrawler {
	constructor() {}

	async init(options) {
		const { browser, page } = await initPuppeteer({
			slowMo: 500,
			// headless: true,
			...options,
		});

		page.setCookie(
			{ name: '__cf_bm', value: '2IGZKFYjZoVi5XIdM2YgEl1Ui4a24FQ20OPcgXbcJIA-1673787482-0-AR8KEGCMN+DxFZwMwrs3Tvc+dUCnvqdDDEmx9VZ1kNQwKOQcFo/UN/3t4pHZsCY5+7Za1EyktwD3bNnaRp4OcHA=', domain: '.dcard.tw' },
			{ name: '_cfuvid', value: 'X6H0_AV0WODylVe.b8bPvqDx0PiXkrb0Wx2dBB30tqY-1673787482264-0-604800000', domain: '.dcard.tw' },
			// { name: '__cfruid', value: '5fc687c97fda717c47db4ef8ffd6f60f1366123f-1661192176', domain: '.dcard.tw' },
			{ name: 'cf_clearance', value: 'Rg11EHdmH0jAbO5NnZ0srzc.CGnpIoiP2kmx2aNU9BM-1673787482-0-250', domain: '.dcard.tw' },
			{ name: 'cf_chl_2', value: '2e4b3a1eeaf592a', domain: '.dcard.tw' }
		);

		this.page = page;
		this.browser = browser;
	}

	async getResult({forum, keywords = []}) {
		const { page } = this;
		if(!page) throw new Error();

		const BASE_URL = 'https://www.dcard.tw/service/api/v2';
		const searchUrl = `${BASE_URL}/search/posts?limit=30&query=${keywords.join(' ')}&forum=${forum}&highlight=true&sort=relevance&country=TW`;

		const res = await page.goto(searchUrl);
		// @ts-ignore
		const posts = await res.json();

		for (const [index, { id }] of posts.entries()) {
			const postUrl = `${BASE_URL}/posts/${id}?__cf_chl_tk=m2IYqrXGCwbY93zKS7j.hyhBSeI2xXbGGosW4E_An90-1673787465-0-gaNycGzNB5E`;
			const res = await page.goto(postUrl);
			// @ts-ignore
			const post = await res.json();

			posts[index] = {...post[index], ...post};
		}

		return posts;
	}

	close() {
		return this.browser.close();
	}
}

module.exports = new DcardCrawler();
