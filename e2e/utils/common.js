const { existsSync, writeFileSync, statSync } = require('fs');

/*
* Navigates to baseUrl, inputs username and password
* And attempts to login
* @param { String } username
* @param { String } password
* @returns {null} returns nothing
*/
exports.login = (username, password) => {
	browser.url('/');
	browser.setValue('#username', username);
	browser.setValue('#password', password);
	browser.click('.btn-primary');
	if (browser.isExisting('.Modal')) {
		browser.click('.btn-primary');
	}
	browser.waitForVisible('.App-wrapper-3');
}

/*
* Get localStorage after landing on homepage
* and write them out to a file for use in other tests
* @returns { String } stringified local storage object
*/
exports.getTokenIfNeeded = () => {
	const tokenPath = './localStorage.json';
	const expirationDate = new Date().getHours() + 2 // Current Time + 2 hours;
	const expiredToken = new Date(statSync(tokenPath).mtime).getHours() > expirationDate;

	if (!existsSync(tokenPath) || expiredToken) {
		browser.waitForVisible('.App-wrapper-3');
		const localStorageObj = browser.execute(function() {
			return JSON.stringify(localStorage);
		});
		writeFileSync(tokenPath, localStorageObj.value);
		// Now reload the browser in a clean state
		browser.reload();
	}
}


exports.loadToken = () => {
	const tokenPath = '../../localStorage.json';
	const localStorageObj = require(tokenPath);
	const keys = Object.keys(localStorageObj);

	const storageObj = keys.map(key => {
		return { [key]: localStorageObj[key] }
	});
	browser.url('/null');
	browser.execute(function(storageObj) {
		storageObj.forEach(item => {
			localStorage.setItem(Object.keys(item)[0], Object.values(item)[0]);
		});
	}, storageObj);
	browser.url('/');
}