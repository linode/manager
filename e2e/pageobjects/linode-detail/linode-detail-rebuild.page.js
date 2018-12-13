const { constants } = require('../../constants');

import Page from '../page';

class Rebuild extends Page {
    get title() { return $('[data-qa-title]'); }
    get description() { return $('[data-qa-rebuild-desc]'); }
    get imageSelectSelector() { return '[data-qa-enhanced-select="Select an Image"]';}
    get imagesSelect() { return $(`${this.imageSelectSelector}>div>div`); }
    get password() { return $('[data-qa-hide] input'); }
    get submit() { return $('[data-qa-rebuild]'); }
    get imageSelectHeader() { return $('[data-qa-select-header]'); }
    get imageOption() { return $('[data-qa-image-option]'); }
    get imageOptions() { return $$(this.imageOption.selector); }
    get imageError() { return $(`${this.imageSelectSelector}>p`); }

    assertElemsDisplay() {
        const expectedTitle = 'Rebuild';

        this.imagesSelect.waitForVisible(constants.wait.normal);

        expect(this.helpButton.isVisible()).toBe(true);
        expect(this.title.getText()).toBe(expectedTitle);
        expect(this.description.isVisible()).toBe(true);
        expect(this.imagesSelect.isVisible()).toBe(true);
        expect(this.submit.isVisible()).toBe(true);
        expect(this.password.isVisible()).toBe(true);
        return this;
    }

    selectImage(label) {
        this.imagesSelect.click();
        browser.pause(500);
        if (label) {
            const targetImage =
                this.selectOptions
                    .find(option => option.getText().includes(label));
            targetImage.click();
            return this;
        }
        console.log(this.selectOptions);
        const imageOption = this.selectOptions[0];
        const imageName = imageOption.getText();

        imageOption.click();
        // Expect image select to update with imageName
        const selectedOptionAttribute = this.imageSelectSelector.split('=');
        expect($(`${selectedOptionAttribute[0]}="${imageName}"]`).isVisible()).toBe(true);

        return this;
    }

    rebuild() {
        const toastMessage = 'Linode rebuild started.';
        browser.jsClick(this.submit.selector);
        this.toastDisplays(toastMessage, constants.wait.minute);
    }
}

export default new Rebuild();
