class Rebuild {
    get title() { return $('[data-qa-title]'); }
    get description() { return $('[data-qa-rebuild-desc]'); }
    get help() { return $('[data-qa-help-button]'); }
    get popoverMsg() { return $('[data-qa-popover-text]'); }
    get imagesSelect() { return $('[data-qa-rebuild-image]'); }
    get password() { return $('[data-qa-hide] input'); }
    get submit() { return $('[data-qa-rebuild]'); }
    get imageSelectHeader() { return $('[data-qa-select-header]'); }
    get imageOptions() { return $$('[data-qa-image-option]'); }
    get imageError() { return $('[data-qa-image-error]'); }

    assertElemsDisplay() {
        const expectedTitle = 'Rebuild';

        expect(this.help.isVisible()).toBe(true);
        expect(this.title.getText()).toBe(expectedTitle);
        expect(this.description.isVisible()).toBe(true);
        expect(this.imagesSelect.isVisible()).toBe(true);
        expect(this.submit.getAttribute('class')).toContain('destructive');
        expect(this.password.isVisible()).toBe(true);
        return this;
    }

    selectImage(label) {
        this.imagesSelect.click();
        browser.waitForVisible('[data-qa-image-option]');
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
        expect(this.imagesSelect.getText()).t
        return this;
    }

    rebuild() {
        const toastMessage = 'Linode rebuild started.';

        this.submit.click();
        browser.waitForVisible('[data-qa-toast]');
        browser.waitUntil(function() {
            return browser
                .getText('[data-qa-toast-message]') === toastMessage;
        }, 15000);
    }
}

export default new Rebuild();
