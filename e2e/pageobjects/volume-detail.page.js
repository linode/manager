class VolumeDetail {
    get drawerTitle() { return $('[data-qa-drawer-title]'); }
    get placeholderText() { return $('[data-qa-placeholder-title]'); }
    get createButton() { return $('[data-qa-placeholder-button]'); }
    get createIconLink() { return $('[data-qa-icon-text-link="Create a Volume"]'); }
    get label() { return $('[data-qa-volume-label]'); }
    get size() { return $('[data-qa-size]'); }
    get region() { return $('[data-qa-region]'); }
    get attachedTo() { return $('[data-qa-attach-to]'); }
    get submit() { return $('[data-qa-submit]'); }
    get cancel() { return $('[data-qa-cancel]'); }
    get volumeCell() { return $$('[data-qa-volume-cell]'); }
    get volumeCellLabel() { return $('[data-qa-volume-cell-label]') }
    get volumeCellSize() { return $('[data-qa-volume-size]') }
    get volumeFsPath() { return $('[data-qa-fs-path]'); }
    get volumeActionMenu() { return $('[data-qa-action-menu]'); }

    createVolume(volume) {
        this.createButton.click();
        this.drawerTitle.waitForVisible();

        this.label.setValue(volume.label);
        this.size.setValue(volume.size);
        // this.region.setValue(volume.region);
        this.submit.click();
    }

    editVolume(volume, newLabel) {
        // Placeholder volume action
    }

    resizeVolume(volume, newSize) {
        // Placeholder volume action
    }

    detachVolume(volume) {
        // Placeholder volume action
    }

    cloneVolume(volume, newLabel) {
        // Placeholder volume action
    }

    removeVolume(volumeElement) {
        volumeElement.$('[data-qa-action-menu]').click();
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

        browser.waitUntil(function() {
            return !browser.isExisting('[data-qa-volume-cell]');
        }, 15000);

        this.placeholderText.waitForVisible(20000);
    }

    assertVolumeInTable(volume) {
        const volumes = this.volumeCell;
        const vLabel = this.volumeCellLabel;
        const vSize = this.volumeCellSize;
        const vFsPath = this.volumeFsPath;

        const volumesDisplayed = volumes.map((v) => {
            return [v.$(vLabel.selector).getText(), 
            v.$(vSize.selector).getText()]
        });
        expect(volumesDisplayed).toContain([volume.label, volume.size]);
    }

    assertActionMenuItems() {
        const menuItems = [
            '[data-qa-action-menu-item="Edit"]',
            '[data-qa-action-menu-item="Resize"]',
            '[data-qa-action-menu-item="Clone"]',
            '[data-qa-action-menu-item="Detach"]',
            '[data-qa-action-menu-item="Delete"]'
        ]

        menuItems.forEach(item => expect($(item).isVisible()).toBe(true));
    }
}

export default new VolumeDetail();
