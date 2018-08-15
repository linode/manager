const { constants } = require('../../constants');

import Page from '../page';

export class VolumeDetail extends Page {
    get drawerTitle() { return $('[data-qa-drawer-title]'); }
    get drawerClose() { return $('[data-qa-close-drawer]'); }
    get placeholderText() { return $('[data-qa-placeholder-title]'); }
    get createButton() { return $('[data-qa-placeholder-button]'); }
    get createIconLink() { return $('[data-qa-icon-text-link="Create a Volume"]'); }
    get label() { return $('[data-qa-volume-label]'); }
    get size() { return $('[data-qa-size]'); }
    get region() { return $('[data-qa-select-region]'); }
    get regionField() { return $('[data-qa-region]'); }
    get attachToLinode() { return $('[data-qa-select-linode]'); }
    get attachedTo() { return $('[data-qa-attach-to]'); }
    get attachRegions() { return $$('[data-qa-attach-to-region]'); }
    get submit() { return $('[data-qa-submit]'); }
    get cancel() { return $('[data-qa-cancel]'); }
    get volumeCell() { return $$('[data-qa-volume-cell]'); }
    get volumeCellElem() { return $('[data-qa-volume-cell]'); }
    get volumeAttachment() { return $('[data-qa-volume-cell-attachment]'); }
    get volumeAttachedLinodes() { return $$('[data-qa-attached-linode]'); }
    get volumeCellLabel() { return $('[data-qa-volume-cell-label]') }
    get volumeCellSize() { return $('[data-qa-volume-size]') }
    get volumeFsPath() { return $('[data-qa-fs-path]'); }
    get volumeActionMenu() { return $('[data-qa-action-menu]'); }
    get volumeSelect() { return $('[data-qa-volume-select] span'); }
    get volumeOptions() { return $$('[data-qa-volume-option]'); }
    get attachButton() { return $('[data-qa-confirm-attach]'); }
    get cancelButton() { return $('[data-qa-cancel]'); }
    get cloneLabel() { return $('[data-qa-clone-from] input'); }
    get copyToolTips() { return $$('[data-qa-copy-tooltip]'); }
    get configHelpMessages() { return $$('[data-qa-config-help-msg]'); }

    volAttachedToLinode(linodeLabel) {
        browser.waitUntil(function() {
            const attachedToLinode = $$('[data-qa-volume-cell]')
                .filter(e => e.$('[data-qa-volume-cell-attachment]')
                    .getText().includes(linodeLabel));
            return attachedToLinode.length > 0;
        }, constants.wait.normal);
    }

    removeAllVolumes() {
        const pageObject = this;

        this.volumeCell.forEach(function(v) {
            pageObject.removeVolume(v);
        });
    }

    closeVolumeDrawer() {
        this.drawerClose.click();
        this.drawerTitle.waitForVisible(constants.wait.short, true);
        browser.waitForExist('[data-qa-drawer]', constants.wait.normal, true);
        this.globalCreate.waitForVisible();
    }

    defaultDrawerElemsDisplay() {
        const volumeDrawerTitle = 'Create a Volume';

        this.drawerTitle.waitForVisible();

        expect(this.drawerTitle.getText()).toBe(volumeDrawerTitle);
        expect(this.size.$('input').getValue()).toContain(20);
        expect(this.label.$('input').getText()).toBe('');
        expect(this.region.getText()).toBe('Select a Region');
        expect(this.submit.isVisible()).toBe(true);
        expect(this.cancel.isVisible()).toBe(true);
        expect(this.attachToLinode.getText()).toBe('Select a Linode');
    }

    getVolumeId(label) {
        const volumesWithLabel = this.volumeCell.filter(v => v.$(this.volumeCellLabel.selector).getText() === label);

        if (volumesWithLabel.length === 1) {
            return volumesWithLabel[0].getAttribute('data-qa-volume-cell');
        }

        return volumesWithLabel.map(v => v.getAttribute('data-qa-volume-cell'));
    }

    createVolume(volume, menuCreate) {
        if (menuCreate) {
            this.globalCreate.click();
            this.addVolumeMenu.waitForVisible();
            this.addVolumeMenu.click();
        } else if (this.placeholderText.isVisible()) {
            this.createButton.click();
        } else {
            this.createIconLink.click();
        }
        this.drawerTitle.waitForVisible();

        browser.trySetValue('[data-qa-volume-label] input', volume.label);
        browser.trySetValue('[data-qa-size] input', volume.size);

        if (volume.hasOwnProperty('region')) {
            this.region.waitForVisible();
            this.region.click(); 
            browser.waitForVisible('[data-qa-attach-to-region]');
            browser.click(`[data-qa-attach-to-region="${volume.region}"]`);
            
            browser.waitForVisible('[data-qa-attach-to-region]', constants.wait.short, true);
            browser.waitForValue('[data-qa-select-region] input', constants.wait.normal);
        }

        if (volume.hasOwnProperty('attachedLinode')) {
            this.attachToLinode.click();
            browser.waitForVisible('[data-qa-attached-linode]', constants.wait.normal);
            const linodeToAttach = this.volumeAttachedLinodes.filter(v => v.getText() === volume.attachedLinode);
            linodeToAttach[0].click();
            browser.waitForVisible('[data-qa-attached-linode]', constants.wait.short, true);
        }
        // this.region.setValue(volume.region); 
        this.submit.click();

        if (volume.hasOwnProperty('attachedLinode')) {
            browser.waitForVisible(`[data-qa-volume-cell-attachment="${volume.attachedLinode}"]`, constants.wait.long * 2);
        }

        if (volume.hasOwnProperty('region')) {
            browser.waitForExist('[data-qa-drawer]', constants.wait.normal, true);
        }
    }

    editVolume(volume, newLabel) {
        browser.waitForVisible('[data-qa-drawer-title]');
        const drawerTitle = browser.getText('[data-qa-drawer-title]');

        browser.trySetValue('[data-qa-volume-label] input', newLabel, constants.wait.normal);

        this.submit.click();

        browser.waitUntil(function() {
            return newLabel === $(`[data-qa-volume-cell="${volume.id}"]`).$('[data-qa-volume-cell-label]').getText();
        }, constants.wait.normal);
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
        expect(dialogCancel.isVisible()).toBe(true);
        expect(dialogCancel.getTagName()).toBe('button');
    }

    detachConfirm(volumeId) {
        this.dialogTitle.waitForVisible();
        browser.click('[data-qa-confirm]');
        browser.waitForVisible(`[data-qa-volume-cell="${volumeId}"]`, constants.wait.long, true);

        // Wait for progress bars to not display on volume detail pages
        if (!browser.getUrl().includes('/linodes')) {
            // browser.waitForVisible('[data-qa-volume-loading]', constants.wait.long);
            // browser.waitForVisible('[data-qa-volume-loading]', constants.wait.long, true);
        }
    }

    cloneVolume(volume, newLabel) {
        // Placeholder volume action
    }

    removeVolume(volumeElement) {
        if (volumeElement.$('[data-qa-volume-cell-attachment]').isExisting() && volumeElement.$('[data-qa-volume-cell-attachment]').getText() !== '') {
            volumeElement.$('[data-qa-action-menu]').click();
            browser.waitForVisible('[data-qa-action-menu-item="Detach"]');
            browser.jsClick('[data-qa-action-menu-item="Detach"]');
            browser.waitForVisible('[data-qa-dialog-title]');
            browser.click('[data-qa-confirm]');
            browser.waitForVisible('[data-qa-dialog-title]', constants.wait.normal, true);

            // Wait for progress bars to not display on volume detail pages
            browser.waitForVisible('[data-qa-volume-loading]', constants.wait.long, true);

            browser.waitUntil(function() {
                return volumeElement.$('[data-qa-volume-cell-attachment]').getText() === '';
            }, constants.wait.minute, 'Remove Volume: Failed to detach volume');
        }
        const numberOfVolumes = this.volumeCell.length;
        volumeElement.$('[data-qa-action-menu]').click();

        browser.waitForVisible('[data-qa-action-menu-item="Delete"]', constants.wait.normal);
        browser.jsClick('[data-qa-action-menu-item="Delete"]');

        browser.waitForVisible('[data-qa-dialog-title]', constants.wait.normal);

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
        dialogConfirm.waitForVisible(constants.wait.normal, true);

        browser.waitUntil(function(volumeElement) {
            return $$('[data-qa-volume-cell]').length === (numberOfVolumes-1)
        }, constants.wait.minute, 'Volume failed to be removed');
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
            '[data-qa-action-menu-item="Rename"]',
            '[data-qa-action-menu-item="Resize"]',
            '[data-qa-action-menu-item="Clone"]',
            '[data-qa-action-menu-item="Detach"]',
            '[data-qa-action-menu-item="Delete"]'
        ]

        menuItems.forEach(item => expect($(item).isVisible()).toBe(true));
    }

    assertConfig() {
        expect(this.drawerTitle.getText()).toBe('Volume Configuration');
        expect(this.cancel.isVisible()).toBe(true);
        expect(this.cancel.getTagName()).toBe('button');
        expect(this.configHelpMessages.length).toBe(4);

        this.configHelpMessages.forEach(msg => {
            expect(msg.getText()).toMatch(/\w/ig);
        });

        expect(this.copyToolTips.length).toBe(4);
    }
}

export default new VolumeDetail();
