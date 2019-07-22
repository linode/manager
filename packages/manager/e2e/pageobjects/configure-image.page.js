const { constants } = require('../constants');

import Page from './page';


class ConfigureImage extends Page {
    get placeholderMsg() { return $('[data-qa-placeholder-title]'); }
    get placeholderButton () { return $('[data-qa-placeholder-button]'); }
    get linodeSelect() { return $('[data-qa-linode-select]'); }
    get diskSelect() { return $('[data-qa-disk-select]'); }
    get label() { return $('[data-qa-image-label]'); }
    get description() { return $('[data-qa-image-description]'); }
    get createButton() { return $(this.submitButton.selector); }
    get linodesMenuItems() { return $$('[data-qa-linode-menu-item]'); }
    get diskMenuItems() { return $$('[data-qa-disk-menu-item]'); }

    baseElementsDisplay() {
        this.linodeSelect.waitForVisible(constants.wait.normal);
        expect(this.diskSelect.isVisible()).toBe(true);
        expect(this.label.isVisible()).toBe(true);
        expect(this.description.isVisible()).toBe(true);
        expect(this.createButton.isVisible()).toBe(true);
        expect(this.cancelButton.isVisible()).toBe(true);
    }

    configure(config) {
        this.label.$('input').setValue(config.label);
        this.description.$('textarea').setValue(config.description);
        this.chooseSelectOption(this.linodeSelect, 1);
        this.chooseSelectOption(this.diskSelect, 1);
    }

    create() {
        this.createButton.click();
        this.waitForNotice('Image scheduled for creation.');
        this.drawerTitle.waitForVisible(constants.wait.normal, true);
    }
}

export default new ConfigureImage();
