const { writeFileSync } = require('fs');

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
	browser.waitForVisible('.App-wrapper-3');
}

/*
* Get localStorage after landing on homepage
* and write them out to a file for use in other tests
* @returns { String } stringified local storage object
*/
exports.getLocalStorage = () => {
	browser.waitForVisible('.App-wrapper-3');
	const localStorageObj = browser.execute(function() {
		return JSON.stringify(localStorage);
	});
	writeFileSync('./localStorage.json', localStorageObj.value);
}
