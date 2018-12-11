const { constants } = require('../../constants');

import Page from '../page';

export class VolumeDetail extends Page {
    get placeholderText() { return $('[data-qa-placeholder-title]'); }
    get createButton() { return $('[data-qa-placeholder-button]'); }
    get createIconLink() { return $('[data-qa-icon-text-link="Create a Volume"]'); }
    get label() { return $('[data-qa-volume-label]'); }
    get size() { return $('[data-qa-size]'); }
    get region() { return $('[data-qa-select-region]'); }
    get regionField() { return $('[data-qa-region]'); }
    get attachToLinode() { return $(`${this.drawerBase.selector} [data-qa-enhanced-select]`); }
    get linodeSelect() { return $('[data-qa-linode-select]'); }
    get linodeAttachOption() { return $('[data-qa-linode-menu-item]'); }
    get attachedTo() { return $('[data-qa-attach-to]'); }
    get attachRegion() { return $('[data-qa-attach-to-region]'); }
    get attachRegions() { return $$('[data-qa-attach-to-region]'); }
    get submit() { return this.submitButton; }
    get cancel() { return this.cancelButton; }
    get volumeCell() { return $$('[data-qa-volume-cell]'); }
    get volumeCellElem() { return $('[data-qa-volume-cell]'); }
    get volumeAttachment() { return $('[data-qa-volume-cell-attachment]'); }
    get volumeAttachedLinodes() { return $$('[data-qa-attached-linode]'); }
    get volumeCellLabel() { return $('[data-qa-volume-cell-label]') }
    get volumeCellSize() { return $('[data-qa-volume-size]') }
    get volumeFsPath() { return $('[data-qa-fs-path]'); }
    get volumeActionMenu() { return $('[data-qa-action-menu]'); }
    get volumeSelect() { return $('[data-qa-volume-select] span'); }
    get volumeOptions() { return $$('[data-value]'); }
    get attachButton() { return $('[data-qa-confirm-attach]'); }
    get cloneLabel() { return $('[data-qa-clone-from] input'); }
    get copyToolTips() { return $$('[data-qa-copy-tooltip]'); }
    get configHelpMessages() { return $$('[data-qa-config-help-msg]'); }
    get volumePrice() { return this.drawerPrice; }
    get volumePriceBillingInterval() { return this.drawerBillingInterval; }
    get volumeCreateSizeHelpText() { return $('[data-qa-volume-size-help]'); }
    get volumeCreateHelpText() { return $('[data-qa-volume-help]'); }
    get volumeCreateRegionHelp() { return $('[data-qa-volume-region]'); }
    get createFileSystemCommand() { return $('[data-qa-make-filesystem] input'); }
    get createMountDirCommand() { return $('[data-qa-mountpoint] input'); }
    get mountCommand() { return $('[data-qa-mount] input'); }
    get mountOnBootCommand() { return $('[data-qa-boot-mount] input'); }
    get umountCommand() { return $('[data-qa-umount] input'); }
    get fileSystemCheckCommand() { return $('[data-qa-check-filesystem] input'); }
    get resizeFileSystemCommand() { return $('[data-qa-resize-filesystem] input'); }

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
        browser.waitUntil(() => {
            return this.volumeCell.length > 0;
        }, constants.wait.normal);
        this.volumeCell.forEach(function(v) {
            pageObject.removeVolume(v);
        });
    }

    closeVolumeDrawer() {
        this.drawerClose.click();
        this.drawerTitle.waitForVisible(constants.wait.short, true);
    }

    defaultDrawerElemsDisplay() {
        const volumeDrawerTitle = 'Create a Volume';

        this.drawerTitle.waitForVisible(constants.wait.normal);

        expect(this.drawerTitle.getText()).toBe(volumeDrawerTitle);
        expect(this.size.$('input').getValue()).toContain(20);
        expect(this.label.$('input').getText()).toBe('');
        expect(this.region.isVisible()).toBe(true);
        expect(this.submit.isVisible()).toBe(true);
        expect(this.cancel.isVisible()).toBe(true);
        this.attachToLinode.waitForVisible(constants.wait.normal);
    }

    volumeConfigurationDrawerDisplays(){
        this.createFileSystemCommand.waitForVisible(constants.wait.normal);
        this.createMountDirCommand.waitForVisible(constants.wait.normal);
        this.mountCommand.waitForVisible(constants.wait.normal);
        this.mountOnBootCommand.waitForVisible(constants.wait.normal);
        expect(this.copyToolTips.length).toBe(4);
        expect(this.drawerTitle.getText()).toEqual('Volume Configuration');
    }

    getVolumeId(label) {
        const volumesWithLabel = this.volumeCell.filter(v => v.$(this.volumeCellLabel.selector).getText() === label);

        if (volumesWithLabel.length === 1) {
            return volumesWithLabel[0].getAttribute('data-qa-volume-cell');
        }

        return volumesWithLabel.map(v => v.getAttribute('data-qa-volume-cell'));
    }

    createVolume(volume, createMethod) {
        if (createMethod === 'placeholder') {
            this.createButton.waitForVisible(constants.wait.normal);
            this.createButton.click();
        }

        if (createMethod === 'icon') {
            this.createIconLink.waitForVisible(constants.wait.normal);
            this.createIconLink.click();
        }

        if (createMethod === 'header') {
            this.selectGlobalCreateItem('Volume');
        }

        this.drawerTitle.waitForVisible(constants.wait.normal);

        browser.waitForVisible('[data-qa-volume-label] input', constants.wait.normal);

        browser.waitForVisible('[data-qa-volume-label] input', constants.wait.normal);
        browser.trySetValue('[data-qa-volume-label] input', volume.label);
        browser.trySetValue('[data-qa-size] input', volume.size);

        if (volume.hasOwnProperty('region')) {
            this.selectRegion(volume.region);
            browser.waitForValue('[data-qa-select-region] input', constants.wait.normal);
        }

        if (volume.hasOwnProperty('attachedLinode')) {
            this.attachToLinode.click();
            this.selectOption.waitForVisible(constants.wait.normal);

            const optionToSelect =
                this.selectOptions.filter(opt => opt.getText().includes(volume.attachedLinode));

            optionToSelect[0].click();
        }

        if(volume.hasOwnProperty('tag')) {
            this.addTagToTagInput(volume.tag);
        }

        this.submit.click();

        if (volume.hasOwnProperty('attachedLinode')) {
            browser.waitForVisible(`[data-qa-volume-cell-attachment="${volume.attachedLinode}"]`, constants.wait.long * 2);
        }
    }

    editVolume(newLabel, tag=undefined) {
        this.drawerBase.waitForVisible(constants.wait.normal);
        this.label.waitForVisible(constants.wait.normal);
        browser.trySetValue('[data-qa-volume-label] input', newLabel, constants.wait.normal);
        if(tag){
          if(this.multiOption.isVisible()){
              const tags = $$(this.multiOption.selector).length;
              this.multiOption.$('..').$('..').$('input').setValue(tag);
              this.selectOptions[0].waitForVisible(constants.wait.normal);
              this.selectOptions[0].click();
              browser.waitUntil(() => {
                  return $$(this.multiOption.selector).length === tags + 1;
              },constants.wait.normal);
          }else{
              this.addTagToTagInput(tag);
          }
        }
        this.submit.click();
        this.drawerBase.waitForVisible(constants.wait.normal, true);
        browser.waitUntil(() => {
            return $$(this.volumeCellLabel.selector).find(label => label.getText().includes(newLabel));
        },constants.wait.normal);
    }

    resizeVolume(newSize) {
        this.drawerBase.waitForVisible(constants.wait.normal);
        this.size.waitForVisible(constants.wait.normal);
        $(`${this.size.selector} input`).setValue(newSize);
        const volumePrice = newSize * 0.1;
        expect(this.volumePrice.getText()).toEqual(`$${volumePrice.toFixed(2)}`);
        this.submit.click();
        this.waitForNotice('Volume scheduled to be resized.');
        this.umountCommand.waitForVisible(constants.wait.normal);
        this.fileSystemCheckCommand.waitForVisible(constants.wait.normal);
        this.resizeFileSystemCommand.waitForVisible(constants.wait.normal);
        this.mountCommand.waitForVisible(constants.wait.normal);
    }

    attachVolumeFromVolumeLanding(linode) {
        this.drawerBase.waitForVisible(constants.wait.normal);
        this.linodeSelect.waitForVisible(constants.wait.normal);
        this.linodeSelect.click();
        this.linodeAttachOption.waitForVisible(constants.wait.normal);
        const linodeAttach = this.linodeAttachOption.selector.replace(']','');
        browser.jsClick(`${linodeAttach}="${linode}"]`)
        this.linodeAttachOption.waitForVisible(constants.wait.normal,true);
        this.submitButton.click();
        this.drawerBase.waitForVisible(constants.wait.normal,false);
        const attachedTo = this.volumeAttachment.selector.replace(']','');
        $(`${attachedTo}="${linode}"`).waitForVisible(constants.wait.normal);
    }

    detachVolume(volume, detach=true) {
        this.selectActionMenuItem(volume, 'Detach');

        const dialogTitle = $('[data-qa-dialog-title]');
        const dialogConfirm = $('[data-qa-confirm]');
        const dialogCancel = $(this.cancelButton.selector);
        const dialogContent = $('[data-qa-dialog-content]');

        dialogTitle.waitForVisible(constants.wait.normal);
        expect(dialogTitle.isVisible()).toBe(true);
        expect(dialogTitle.getText()).toBe('Detach Volume');
        expect(dialogContent.getText()).toMatch(/\w/ig);
        expect(dialogConfirm.isVisible()).toBe(true);
        expect(dialogConfirm.getTagName()).toBe('button');
        expect(dialogCancel.isVisible()).toBe(true);
        expect(dialogCancel.getTagName()).toBe('button');
        if( detach ){
            dialogConfirm.click();
            dialogConfirm.waitForVisible(constants.wait.normal, true);
        }
    }

    confirmDetachORDelete() {
        this.dialogTitle.waitForVisible(constants.wait.normal);
        browser.click('[data-qa-confirm]');
        this.dialogTitle.waitForVisible(constants.wait.normal, true);
    }

    cloneVolume(newClone,currentSize) {
        const startVolumes = this.volumeCell.length;
        this.drawerBase.waitForVisible(constants.wait.normal);
        this.label.waitForVisible(constants.wait.normal);
        this.label.$('input').setValue(newClone);
        const volumePrice = currentSize * 0.1;
        expect(this.volumePrice.getText()).toEqual(`$${volumePrice.toFixed(2)}`);
        this.submitButton.click();
        this.drawerBase.waitForVisible(constants.wait.normal,true);
        browser.waitUntil(() => {
            return this.volumeCell.length === startVolumes + 1;
        }, constants.wait.minute);
    }

    removeVolume(volumeElement) {
        this.drawerTitle.waitForExist(constants.wait.normal, true);
        if (volumeElement.$('[data-qa-volume-cell-attachment]').isExisting() && volumeElement.$('[data-qa-volume-cell-attachment]').getText() !== '') {
            volumeElement.$('[data-qa-action-menu]').click();
            browser.waitForVisible('[data-qa-action-menu-item="Delete"]', constants.wait.normal);
            browser.jsClick('[data-qa-action-menu-item="Delete"]');
            browser.waitForVisible('[data-qa-dialog-title]', constants.wait.normal);
            browser.click('[data-qa-confirm]');
            browser.waitForVisible('[data-qa-dialog-title]', constants.wait.normal, true);

            // Wait for progress bars to not display on volume detail pages
            browser.waitForVisible('[data-qa-volume-loading]', constants.wait.long, true);

            browser.waitUntil(function() {
                return browser.isExisting('[data-qa-volume-cell-attachment]') &&
                    browser.getText('[data-qa-volume-cell-attachment]') === '' &&
                    volumeElement.$('[data-qa-action-menu]').isVisible();
            }, constants.wait.minute * 2, 'Remove Volume: Failed to detach volume');
        }
        const numberOfVolumes = this.volumeCell.length;
        volumeElement.$('[data-qa-action-menu]').click();

        browser.waitForVisible('[data-qa-action-menu-item="Delete"]', constants.wait.normal);
        browser.jsClick('[data-qa-action-menu-item="Delete"]');

        browser.waitForVisible('[data-qa-dialog-title]', constants.wait.normal);

        const dialogTitle = $('[data-qa-dialog-title]');
        const dialogConfirm = $('[data-qa-confirm]');
        const dialogCancel = $(this.cancelButton.selector);

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

    assertActionMenuItems(attached=true) {
        this.actionMenuItem.waitForVisible(constants.wait.normal);
        const menuItems =
          attached ? ["Show Configuration", "Edit Volume", "Resize", "Clone", "Detach" ] : ["Show Configuration", "Edit Volume", "Resize", "Clone", "Attach", "Delete" ];
        const actionMenuItem=this.actionMenuItem.selector.replace(']','');
        menuItems.forEach(item => expect($(`${actionMenuItem}="${item}"`).isVisible()).toBe(true));
    }

    assertConfig() {
        this.drawerTitle.waitForVisible(constants.wait.normal);
        expect(this.drawerTitle.getText()).toBe('Volume Configuration');
        expect(this.cancel.isVisible()).toBe(true);
        expect(this.cancel.getTagName()).toBe('button');
        expect(this.configHelpMessages.length).toBe(4);

        this.configHelpMessages.forEach(msg => {
            expect(msg.getText()).toMatch(/\w/ig);
        });

        expect(this.copyToolTips.length).toBe(4);
    }

    selectRegion(region) {
        this.region.waitForVisible();
        this.region.click();
        const regionSelector = this.attachRegion.selector.replace(']','');
        const volumeRegion = `${regionSelector}="${region}"]`;
        browser.waitUntil(() => {
            return this.attachRegions.length > 0;
        }, constants.wait.normal);
        browser.jsClick(volumeRegion);
        this.attachRegion.waitForVisible(constants.wait.short, true);
    }
}

export default new VolumeDetail();
