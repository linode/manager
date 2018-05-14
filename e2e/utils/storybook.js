exports.navigateToStory = (component, story) => {
    browser.url(`/iframe.html?selectedKind=${component}&selectedStory=${story}`);
}

/*
* Navigate to a story form the story array, set focus to storybook preview,
* execute the callback function, and set the focus back to default.
* @param { Array } array of story css selectors
* @param { Function } function containing actions to take in each story
* @returns { null } returns nothing
*/
exports.executeInAllStories = (component, storyArray, callback) => {
    storyArray.forEach(story => {
        exports.navigateToStory(component, story);
        callback();
    });
}
