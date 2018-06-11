const {
    deleteAll,
    removeAllLinodes,
    createLinode,
    removeAllVolumes,
} = require('../setup/setup');

const { readToken } = require('../utils/config-utils');

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

    browser.addCommand('readToken', function() {
        const token = readToken();
        return token;
    });

    browser.addCommand('createLinode', function async(token, password, linodeLabel=false) {
        return createLinode(token, password, linodeLabel)
            .then(res => res)
            .catch(err => err);
    });

    browser.addCommand('removeAllLinodes', function async(token) {
        return removeAllLinodes(token)
            .then((res) => res.length > 0);
    });

    browser.addCommand('removeAllVolumes', function async(token) {
        return removeAllVolumes(token)
            then(res => res);
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
}
