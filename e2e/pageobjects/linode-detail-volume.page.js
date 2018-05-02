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
    get volumeSelect() { return $('[data-qa-volume-select] span'); }
    get volumeOptions() { return $$('[data-qa-volume-option]'); }
    get attachButton() { return $('[data-qa-confirm-attach]'); }
    get cancelButton() { return $('[data-qa-cancel]'); }
    get cloneLabel() { return $('[data-qa-clone-from] input'); }

    createVolume(volume) {
        if (this.placeholderText.isVisible()) {
            this.createButton.click();
        } else {
            this.createIconLink.click();
        }
        this.drawerTitle.waitForVisible();

        this.label.$('input').setValue(volume.label);
        this.size.$('input').setValue(volume.size);
        // this.region.setValue(volume.region);
        this.submit.click();
    }

    editVolume(volume, newLabel) {
        browser.waitForVisible('[data-qa-drawer-title]');
        const drawerTitle = browser.getText('[data-qa-drawer-title]');

        browser.trySetValue('[data-qa-volume-label] input', newLabel, 10000);

        this.submit.click();

        browser.waitUntil(function() {
            return newLabel === $(`[data-qa-volume-cell="${volume.id}"]`).$('[data-qa-volume-cell-label]').getText();
        }, 10000);
    }

    resizeVolume(volume, newSize) {
        // Placeholder volume action
    }

    attachVolume(linodeLabel, volume) {
        browser.waitForVisible('[data-qa-drawer-title]');
        const drawerTitle = browser.getText('[data-qa-drawer-title]');

        browser.jsClick('[data-qa-volume-select] span');
        
        const options = this.volumeOptions.map(v => v.getText());
        const optToClick = this.volumeOptions.filter(opt => opt.getText() === volume.label);

        expect(drawerTitle).toBe(`Attach Volume to ${linodeLabel}`);
        expect(options).toContain(volume.label);

        optToClick[0].click();
        browser.jsClick('[data-qa-confirm-attach]');
        browser.waitForVisible(`[data-qa-volume-cell="${volume.id}"]`);
    }

    detachVolume(volume) {
        this.selectActionMenuItem(volume, 'Detach');

        const dialogTitle = $('[data-qa-dialog-title]');
        const dialogConfirm = $('[data-qa-confirm]');
        const dialogCancel = $('[data-qa-cancel]');
        const dialogContent = $('[data-qa-dialog-content]');

        expect(dialogTitle.isVisible()).toBe(true);
        expect(dialogTitle.getText()).toBe('Detach Volume');
        expect(dialogContent.getText()).toMatch(/\w/ig);
        expect(dialogConfirm.isVisible()).toBe(true);
        expect(dialogConfirm.getTagName()).toBe('button');
        expect(dialogConfirm.getAttribute('class')).toContain('destructive');
        expect(dialogCancel.isVisible()).toBe(true);
        expect(dialogCancel.getTagName()).toBe('button');
    }

    detachConfirm(volumeId) {
        browser.click('[data-qa-confirm]');
        browser.waitForVisible(`[data-qa-volume-cell="${volumeId}"]`, 10000, true);
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
        }, 30000);

        this.placeholderText.waitForVisible(20000);
    }

    selectActionMenuItem(volume, item) {
        volume.$(this.volumeActionMenu.selector).click();
        browser.jsClick(`[data-qa-action-menu-item="${item}"]`);
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
