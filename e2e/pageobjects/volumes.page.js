const { constants } = require('../constants');

import Page from './page';

class Volumes extends Page {
    get placeholderText() { return $('[data-qa-placeholder-title]'); }
    get volumeCell() { return $$('[data-qa-volume-cell]'); }
    get volumeCellElem() { return $('[data-qa-volume-cell]'); }
    get volumeCellLabel() { return $('[data-qa-volume-cell-label]') }
    get volumeAttachment() { return $('[data-qa-volume-cell-attachment]'); }

    getVolumeId(label) {
        const volumesWithLabel = this.volumeCell.filter(v => v.$(this.volumeCellLabel.selector).getText() === label);

        if (volumesWithLabel.length === 1) {
            return volumesWithLabel[0].getAttribute('data-qa-volume-cell');
        }

        return volumesWithLabel.map(v => v.getAttribute('data-qa-volume-cell'));
    }

    removeVolume(volumeElement) {
        const numberOfVolumes = this.volumeCell.length;
        volumeElement.$('[data-qa-action-menu]').click();

        browser.waitForVisible('[data-qa-action-menu-item="Delete"]');
        browser.jsClick('[data-qa-action-menu-item="Delete"]');

        browser.waitForVisible('[data-qa-dialog-title]');

        const dialogTitle = $('[data-qa-dialog-title]');
        const dialogConfirm = $('[data-qa-confirm]');
        const dialogCancel = $('[data-qa-cancel]');

        expect(dialogTitle.isVisible()).toBe(true);
        expect(dialogTitle.getText()).toBe('Delete Volume');
        expect(dialogConfirm.isVisible()).toBe(true);
        expect(dialogConfirm.getTagName()).toBe('button');
        expect(dialogCancel.isVisible()).toBe(true);
        expect(dialogCancel.getTagName()).toBe('button');

        // Confirm remove
        dialogConfirm.click();

        browser.waitUntil(function(volumeElement) {
            return $$('[data-qa-volume-cell]').length === (numberOfVolumes-1)
        }, constants.wait.long);
    }

    isAttached(volumeElement) {
        const attached = volumeElement.$(this.volumeAttachment.selector).getText() !== '' ? true : false;
        return attached;
    }
}

export default new Volumes();
