const { constants } = require('../constants');

import Page from './page';

class Volumes extends Page {
  get placeholderText() { return $('[data-qa-placeholder-title]'); }
  get configDrawerClose() { return $(this.cancelButton.selector); }
  get volumeCell() { return $$('[data-qa-volume-cell]'); }
  get volumeCellElem() { return $('[data-qa-volume-cell]'); }
  get volumeCellLabel() { return $('[data-qa-volume-cell-label]') }
  get volumeAttachment() { return $('[data-qa-volume-cell-attachment]'); }
  get copyToolTip() { return $('[data-qa-copy-tooltip]'); }
  get configHelpMessages() { $$('[data-qa-config-help-msg]'); }

  baseElemsDisplay(initial) {
      if (initial) {
        this.placeholderText.waitForDisplayed();
      } else {
          this.volumeCellElem.waitForDisplayed(constants.wait.normal);
      }
  }

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

    $('[data-qa-action-menu-item="Delete"]').waitForDisplayed();
    browser.jsClick('[data-qa-action-menu-item="Delete"]');

    $('[data-qa-dialog-title]').waitForDisplayed();

    const dialogTitle = $('[data-qa-dialog-title]');
    const dialogConfirm = $('[data-qa-confirm]');
    const dialogCancel = $(this.cancelButton.selector);

    expect(dialogTitle.isDisplayed()).toBe(true);
    expect(dialogTitle.getText()).toMatch('Delete');
    expect(dialogConfirm.isDisplayed()).toBe(true);
    expect(dialogConfirm.getTagName()).toBe('button');
    expect(dialogCancel.isDisplayed()).toBe(true);
    expect(dialogCancel.getTagName()).toBe('button');

    // Confirm remove
    dialogConfirm.click();

    browser.waitUntil(function(volumeElement) {
      return $$('[data-qa-volume-cell]').length === (numberOfVolumes-1)
    }, constants.wait.long);
  }

  detachConfirm(linodeLabel) {
    // Wait for progress bars to not display on volume detail pages
    if (!browser.getUrl().includes('/linodes')) {
        $(`[data-qa-volume-cell-attachment="${linodeLabel}"]`).waitForDisplayed(constants.wait.minute, true);
    }
  }

  isAttached(volumeElement) {
    const attached = volumeElement.$(this.volumeAttachment.selector).getText() !== '' ? true : false;
    return attached;
  }
}

export default new Volumes();
