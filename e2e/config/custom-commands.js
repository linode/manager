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

    browser.addCommand('jsClick', function(elementToClick) {
        browser.execute(function(elementToClick) {
            document.querySelector(elementToClick).click();
        }, elementToClick);
    });


    browser.addCommand('jsClickAll', function(elementsToClick) {
        browser.execute(function(elementsToClick) {
            var els = document.querySelectorAll(elementsToClick);
            els.forEach(e => e.click());
        }, elementsToClick);
    });
}