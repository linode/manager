const { constants } = require('../constants');
const { existsSync, writeFileSync, statSync } = require('fs');
const moment = require('moment');

/*
* Navigates to baseUrl, inputs username and password
* And attempts to login
* @param { String } username
* @param { String } password
* @returns {null} returns nothing
*/
exports.login = (username, password) => {
    browser.url(constants.routes.dashboard);
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
exports.getTokenIfNeeded = (user, pass) => {
    const tokenPath = './localStorage.json';
    const tokenExists = existsSync(tokenPath);
    const currentDate = moment(new Date(statSync(tokenPath).mtime)).format();
    const expirationDate = moment().add('2', 'hours').format();
    const getNewToken = tokenExists ? currentDate < expirationDate : true;

    if (getNewToken) {
        exports.login(user, pass);
        browser.waitForVisible('.App-wrapper-3');
        const localStorageObj = browser.execute(function() {
            return JSON.stringify(localStorage);
        });
        writeFileSync(tokenPath, localStorageObj.value);
        // Now reload the browser in a clean state
        browser.reload();
    }
}

/*
* Navigate to a null route on the manager,
* Add the token properties to local storage
* Navigate back to the homepage to be logged in
* @returns {Null} returns nothing
*/
exports.loadToken = () => {
    const tokenPath = '../../localStorage.json';
    try {
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
        browser.url(constants.routes.dashboard);
    } catch (err) {
        console.log(`${err} \n ensure that your local manager environment is running!`);
    }
}
