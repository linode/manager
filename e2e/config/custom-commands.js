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
    browser.addCommand('waitClick', function(elementToClick) {
        browser.waitUntil(function() {
            browser.waitForVisible(elementToClick);
            return browser.click(elementToClick).state === 'success';
        }, 10000);
    });
}
