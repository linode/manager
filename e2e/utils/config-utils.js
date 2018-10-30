const moment = require('moment');
const { existsSync, statSync, writeFileSync, readFileSync } = require('fs');
const { constants } = require('../constants');
const { deleteAll } = require('../setup/setup');

/*
* Get localStorage after landing on homepage
* and write them out to a file for use in other tests
* @returns { String } stringified local storage object
*/
exports.storeToken = (credFilePath, username) => {
    let credCollection = JSON.parse(readFileSync(credFilePath));

    const getTokenFromLocalStorage = () => {
        console.log('I am getting from storage!!');
        const browserLocalStorage = browser.execute(function() {
            return JSON.stringify(localStorage);
        });
        const parsedLocalStorage = JSON.parse(browserLocalStorage.value);
        return parsedLocalStorage['authentication/oauth-token'];
    }

    let currentUser = credCollection.find( cred => cred.username === username );

    if ( !currentUser.isPresetToken ){
        currentUser.token = getTokenFromLocalStorage();
    }

    writeFileSync(credFilePath, JSON.stringify(credCollection));
}

exports.readToken = (username) => {
    const credCollection = JSON.parse(readFileSync('./e2e/creds.js'));
    const currentUserCreds = credCollection.find(cred => cred.username === username);

    return currentUserCreds['token'];
}

/*
* Navigates to baseUrl, inputs username and password
* And attempts to login
* @param { String } username
* @param { String } password
* @returns {null} returns nothing
*/
exports.login = (username, password, credFilePath) => {
    browser.url(constants.routes.linodes);
    try {
        browser.waitForVisible('#username', constants.wait.long);
    } catch (err) {
        console.log(browser.getSource());

    }
    browser.waitForVisible('#password', constants.wait.long);
    browser.trySetValue('#username', username);
    browser.trySetValue('#password', password);
    browser.click('.btn-primary');

    try {
        browser.waitUntil(function() {
            return browser.isExisting('[data-qa-add-new-menu-button]') || browser.getUrl().includes('oauth/authorize');
        }, constants.wait.normal);
    } catch (err) {
        console.log('failed to login!');
        if (browser.getText('.alert').includes('This field is required.')) {
            browser.trySetValue('#password', password);
            browser.click('.btn-primary');
        }
    }

    if (browser.isExisting('.Modal')) {
        browser.click('.btn-primary');
    }
    browser.waitForVisible('[data-qa-add-new-menu-button]', constants.wait.long);
    browser.waitForVisible('[data-qa-circle-progress]', constants.wait.long, true);

    exports.storeToken(credFilePath, username);
}

exports.checkoutCreds = (credFilePath, specFile) => {
    let credCollection = JSON.parse(readFileSync(credFilePath));
    return credCollection.find((cred, i) => {
        if (!cred.inUse) {
            credCollection[i].inUse = true;
            credCollection[i].spec = specFile;
            browser.options.testUser = credCollection[i].username;
            writeFileSync(credFilePath, JSON.stringify(credCollection));
            return cred;
        }
    });
}

exports.checkInCreds = (credFilePath, specFile) => {
    let credCollection = JSON.parse(readFileSync(credFilePath));

    return credCollection.find((cred, i) => {
        if (cred.spec === specFile) {
            credCollection[i].inUse = false;
            credCollection[i].spec = '';
            // credCollection[i].token = '';
            writeFileSync(credFilePath, JSON.stringify(credCollection));
            return cred;
        }
        return;
    });
}

exports.generateCreds = (credFilePath, config) => {
    const credCollection = [];
    const usersObject =  new Map(Object.entries(process.env));

    const setCredCollection = (userKey) => {
        const passKey = userKey.includes('2') ? 'MANAGER_PASS_2' : 'MANAGER_PASS';
        const oauthKey = userKey.includes('2') ? 'MANAGER_OAUTH_2' : 'MANAGER_OAUTH';
        const token = (usersObject.get(oauthKey) === undefined) ? '' : usersObject.get(oauthKey);
        const tokenFlag = !(usersObject.get(oauthKey) === undefined);
        credCollection.push({username: usersObject.get(userKey), password: usersObject.get(passKey), inUse: false, token: token, spec: '', isPresetToken: tokenFlag});
    }

    setCredCollection('MANAGER_USER');

    if ( usersObject.get('MANAGER_USER_2') && (config.specs[0].includes('**') || config.specs.length > 1) ) {
        setCredCollection('MANAGER_USER_2');
    }

    writeFileSync(credFilePath, JSON.stringify(credCollection));
}

exports.cleanupAccounts = (credFilePath) => {
    const credCollection = JSON.parse(readFileSync(credFilePath));
    credCollection.forEach(cred => {
        return deleteAll(cred.token).then(() => {});
    });
}

/*
* Navigate to a null route on the manager,
* Add the token properties to local storage
* Navigate back to the homepage to be logged in
* @returns {Null} returns nothing
*/
// exports.loadToken = () => {
//     const tokenPath = '../../localStorage.json';
//     try {
//         const localStorageObj = require(tokenPath);
//         const keys = Object.keys(localStorageObj);

//         const storageObj = keys.map(key => {
//             return { [key]: localStorageObj[key] }
//         });

//         browser.url('/null');
//         browser.waitForText('#root > span:nth-child(1)');
//         browser.waitUntil(function() {
//             browser.execute(function(storageObj) {
//                 storageObj.forEach(item => {
//                     localStorage.setItem(Object.keys(item)[0], Object.values(item)[0]);
//                 });
//             }, storageObj);
//             browser.url('/null');
//             return browser.execute(function(storageObj) {
//                 return localStorage.getItem('authentication/oauth-token').includes(storageObj['authentication/oauth-token']) === true;
//             }, storageObj);
//         }, 10000);
//         browser.url(constants.routes.dashboard);
//         browser.waitForVisible('[data-qa-beta-notice]');
//         browser.click('[data-qa-beta-notice] button');
//     } catch (err) {
//         console.log(`${err} \n ensure that your local manager environment is running!`);
//     }
// }
