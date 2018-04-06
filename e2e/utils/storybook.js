/*
* Sets focus to storybook preview iframe
* @returns { null } returns nothing
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

/*
* Navigate to a story form the story array, set focus to storybook preview,
* execute the callback function, and set the focus back to default.
* @param { Array } array of story css selectors
* @param { Function } function containing actions to take in each story
* @returns { null } returns nothing
*/
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