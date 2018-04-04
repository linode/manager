/*
* Sets focus to storybook preview iframe
* @returns {null} returns nothing
*/
exports.previewFocus = () => {
    // Shift focus to storybook preview iFrame
    const storybookPreviewFrame = $('#storybook-preview-iframe').value;
    browser.frame(storybookPreviewFrame);
}

/*
* Poll the DOM for 10 seconds for a element and repeats set-frame focus each time
* @returns { Boolean } returns true or false
*/
exports.waitForFocus = (elementToBeFocused) => {
    return browser.waitUntil(function() {
        exports.previewFocus();
        return browser.isExisting(elementToBeFocused) !== false;
    }, 10000)
}


exports.executeInAllStories = (storyArray, callback) => {
    storyArray.forEach(story => {
        browser.click(story);
        browser.waitUntil(function() {
            return browser.getAttribute(story, 'href').includes('?selectedKind');
        }, 5000);
        exports.previewFocus();
        callback();
        browser.frame();
    });
}