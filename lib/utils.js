'use strict';

// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer');
const randomUseragent = require('random-useragent');

// add stealth plugin and use defaults (all evasion techniques)
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// puppeteer.use(StealthPlugin());

async function initPuppeteer(options) {
	const browser = await puppeteer.launch({
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
		headless: false,
		...options
	});

	const page = await browser.newPage();
	await page.setDefaultNavigationTimeout(180 * 1000); // 3 mins
	await page.setRequestInterception(true);
	page.on('request', request => {
		if (request.resourceType() === 'image') {
			request.abort();
			return;
		}

		request.continue();
	});
	page.setUserAgent(randomUseragent.getRandom());

	return {
		browser,
		page,
	};
}

module.exports = {
	initPuppeteer,
};