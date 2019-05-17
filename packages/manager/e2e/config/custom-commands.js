const {
    deleteAll,
    removeAllLinodes,
    createLinode,
    removeAllVolumes,
    allocatePrivateIp,
    getNodebalancers,
    removeNodebalancer,
    getDomains,
    removeDomain,
    getMyStackScripts,
    removeStackScript,
    getUserProfile,
    updateUserProfile,
    putGlobalSetting,
    getGlobalSettings,
    createVolume,
    getLinodeImage,
    createDomain,
    createNodeBalancer,
} = require('../setup/setup');

const {
    loadProxyImposter,
    getImposters,
    deleteImposters,
    loadImposter,
} = require('../utils/mb-utils');

const { getToken } = require('../utils/config-utils');

exports.browserCommands = () => {
    /* Overwrite the native getText function
    * Get text from specified selector and ensure padding whitespace is removed
    * @param {String} the selector to look for on the DOM
    * @return {String} the trimmed text from the specified selector
    */
    browser._getText = browser.getText;
    browser.getText = (selector) => {
        const text = browser._getText(selector);
        if (Array.isArray(text)) {
            const trimmedArray = text.map(t => t.trim())
            return trimmedArray;
        } else if (typeof text === 'string') {
            return text.trim();
        } else {
            return text;
        }
    }

    browser.addCommand('loadProxyImposter', function async(proxyConfig) {
        return loadProxyImposter(proxyConfig)
            .then(res => res)
            .catch(error => console.error(error));
    });

    browser.addCommand('getImposters', function async(removeProxies, file) {
        return getImposters(removeProxies, file)
            .then(res => res)
            .catch(error => console.error(error));
    });

    browser.addCommand('loadImposter', function async(imposter) {
        return loadImposter(imposter)
            .then(res => res)
            .catch(error => console.error(error));
    });

    browser.addCommand('deleteImposters', function async() {
        return deleteImposters()
            .then(res => res)
            .catch(error => console.error(error));
    });

    browser.addCommand('readToken', function(username) {
        const token = getToken(username);
        return token;
    });

    browser.addCommand('createLinode', function async(token, password, linodeLabel=false, tags=[], type, region, group, image) {
        return createLinode(token, password, linodeLabel, tags, type, region, group, image)
            .then(res => res)
            .catch(err => err);
    });

    browser.addCommand('removeAllLinodes', function async(token) {
        return removeAllLinodes(token)
            .then(res => res.length > 0);
    });

    browser.addCommand('removeAllVolumes', function async(token) {
        return removeAllVolumes(token)
            .then(res => res);
    });

    browser.addCommand('getDomains', function async(token) {
        return getDomains(token)
            .then(res => res);
    });

    browser.addCommand('removeDomain', function async(token, domainId) {
        return removeDomain(token, domainId)
            .then(res => res);
    });

    browser.addCommand('allocatePrivateIp', function async(token, linodeId) {
        return allocatePrivateIp(token, linodeId)
            .then(res => res);
    });

    browser.addCommand('getNodeBalancers', function async(token) {
        return getNodebalancers(token)
            .then(res => res);
    });

    browser.addCommand('removeNodeBalancer', function async(token, nodeBalancerId) {
        return removeNodebalancer(token, nodeBalancerId)
            .then(res => res);
    });

    browser.addCommand('getMyStackScripts', function async(token) {
        return getMyStackScripts(token)
            .then(res => res);
    });

    browser.addCommand('removeStackScript', function async(token, id) {
        return removeStackScript(token, id)
            .then(res => res);
    });

    /*
    * Executes a Javascript Click event via the browser console.
    * Useful when an element is not clickable via browser.click()
    * @param { String } elementToClick Selector to execute click event on
    * @returns { undefined } Returns nothing
    */
    browser.addCommand('jsClick', function(elementToClick) {
        browser.execute(function(elementToClick) {
            document.querySelector(elementToClick).click();
        }, elementToClick);
    });


    /* Executes a Javascript click event via the browser console
    *  on all elements matching the given selector name
    * Useful when the element is not clickable via browser.click()
    * @param { String } elementsToClick Selector displayed multiple times to click on
    */
    browser.addCommand('jsClickAll', function(elementsToClick) {
        browser.execute(function(elementsToClick) {
            var els = document.querySelectorAll(elementsToClick);
            els.forEach(e => e.click());
        }, elementsToClick);
    });

    /* Waits for the element to click to be visible
    * then execute a browser.click command on the element
    * @param { String } selector to wait for/click
    * @returns { null } Returns nothing
    */
    browser.addCommand('waitClick', function(elementToClick, timeout=10000) {
        browser.waitUntil(function() {
            browser.waitForVisible(elementToClick);
            return browser.click(elementToClick).state === 'success';
        }, timeout);
    });

    browser.addCommand('tryClick', function(elementToClick, timeout=5000) {
        let errorObject;
        browser.waitUntil(function() {
            try {
                browser.click(elementToClick);
                return true;
            } catch (err) {
                errorObject = err;
                return false;
            }
        }, timeout, `failed to click ${elementToClick} due to ${JSON.stringify(errorObject)}`);
    });

    /* Continuously try to set a value on a given selector
    *  for a given timeout. Returns once the value has been successfully set
    * @param { String } selector to target (usually an input)
    * @param { String } value to set input of
    * @param { Number } timeout
    */
    browser.addCommand('trySetValue', function(selector, value, timeout=10000) {
        browser.waitUntil(function() {
            browser.setValue(selector, value);
            return browser.getValue(selector) === value;
        }, timeout);
    });

    browser.addCommand('deleteAll', function async(token) {
        return deleteAll(token).then(() => {});
    });

    browser.addCommand('getUserProfile', function async(token) {
        return getUserProfile(token)
            .then(res => res);
    });

    browser.addCommand('updateUserProfile', function async(token,profileData) {
        return updateUserProfile(token,profileData)
            .then(res => res);
    });

    browser.addCommand('updateGlobalSettings', function async(token, settingsData) {
        return putGlobalSetting(token,settingsData)
            .then(res => res);
    });

    browser.addCommand('getGlobalSettings', function async(token) {
        return getGlobalSettings(token)
            .then(res => res);
    });

    browser.addCommand('createVolume', function async(token,label,region,size,tags,linode_id) {
        return createVolume(token,label,region,size,tags,linode_id)
            .then(res => res);
    });

    browser.addCommand('getLinodeImage', function async(token,imageId) {
        return getLinodeImage(token,imageId)
            .then(res => res);
    });

    browser.addCommand('createDomain', function async(token,type,domain,tags,group) {
        return createDomain(token,type,domain,tags,group)
            .then(res => res);
    });

    browser.addCommand('createNodeBalancer', function async(token,label,region,tags) {
        return createNodeBalancer(token,label,region,tags)
            .then(res => res);
    })
}
