const { constants } = require('../../constants');

import Page from '../page';

class Rebuild extends Page {
    get title() { return $('[data-qa-title]'); }
    get description() { return $('[data-qa-rebuild-desc]'); }
    get imagesSelect() { return $('[data-qa-rebuild-image]'); }
    get password() { return $('[data-qa-hide] input'); }
    get submit() { return $('[data-qa-rebuild]'); }
    get imageSelectHeader() { return $('[data-qa-select-header]'); }
    get imageOption() { return $('[data-qa-image-option]'); }
    get imageOptions() { return $$(this.imageOption.selector); }
    get imageError() { return $('[data-qa-image-error]'); }

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

        /*
          Use waitUntil here instead of standard waitForExist
          Due to chromedriver request throttling issue
        */
        browser.waitUntil(function() {
            return $('[data-qa-image-option]').isVisible();
        }, constants.wait.normal);

        if (label) {
            const targetImage =
                this.imageOptions
                    .filter(option => option.getText().includes(label));
            targetImage[0].click();
            return this;
        }

        const imageOption = this.imageOptions[0];
        const imageName = imageOption.getText();

        imageOption.click();
        // Expect image select to update with imageName
        expect(this.imagesSelect.getText()).toBe(imageName);

        return this;
    }

    rebuild() {
        const toastMessage = 'Linode rebuild started.';
        browser.jsClick(this.submit.selector);
        this.toastDisplays(toastMessage);
    }
}

export default new Rebuild();
