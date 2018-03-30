exports.previewFocus = () => {
    // Shift focus to storybook preview iFrame
    const storybookPreviewFrame = $('#storybook-preview-iframe').value;
    browser.frame(storybookPreviewFrame);
}
