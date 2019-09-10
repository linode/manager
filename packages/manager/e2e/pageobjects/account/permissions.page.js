const { constants } = require('../../constants');
const { assertLog } = require('../../utils/assertionLog');

import Page from '../page';

class Permissions extends Page {
  get globalPermissionsHeader() { return $('[data-qa-permissions-header="Global Permissions"]'); }
  get billingAccessHeader() { return $('[data-qa-permissions-header="billing"]'); }
  get specificPermissionsHeader() { return $('[data-qa-permissions-header="Specific Permissions"]'); }

  // Global Toggles
  get restrictAccess() { return $('[data-qa-restrict-access]'); }
  get restrictAccessToggle() { return this.restrictAccess.$('..').$('..').$(this.toggleOption.selector); }
  get restrictAccessTooltip() { return this.restrictAccess.$('..').$('..').$(this.helpButton.selector); }
  get globalSection() { return $('[data-qa-global-section]'); }
  get globalPermissions() { return $$('[data-qa-global-permission]'); }
  get addLinodesPermission() { return $('[data-qa-global-permission="add_linodes"]'); }
  get addNodeBalancersPermission() { return $('[data-qa-global-permission="add_nodebalancers"]'); }


  // Billing Permissions selection cards
  get billingSection() { return $('[data-qa-billing-section]'); }
  get billingNoPermissions() { return $('[data-qa-select-card-heading="None"]'); }
  get billingReadPermissions() { return $('[data-qa-select-card-heading="Read Only"]'); }
  get billingWriteReadPermissions() { return $('[data-qa-select-card-heading="Read-Write"]'); }

  //Billing Grants
  get billingSection() { return $('[data-qa-entity-section]'); }
  get billingPermissionNone() { return $('[data-qa-select-card-heading="None"]'); }
  get billingPermissionRead() { return $('[data-qa-select-card-heading="Read Only"]'); }
  get billingPermissionWrite() { return $('[data-qa-select-card-heading="Read-Write"]'); }

  // Specific Grants
  get specificSection() { return $('[data-qa-entity-section]'); }
  get linodesGrantsHeader() { return $('[data-qa-permissions-header="Linodes"]'); }
  get volumesGrantsHeader() { return $('[data-qa-permissions-header="Volumes"]'); }
  get stackScriptsGrantsHeader() { return $('[data-qa-permissions-header="StackScripts"]'); }
  get nodeBalancersGrantsHeader() { return $('[data-qa-permissions-header="NodeBalancers"]'); }
  get specificGrant() { return $('[data-qa-specific-grant]'); }
  get specifcGrants() { return $$('[data-qa-specific-grant]'); }

  get saveButton() { return $(this.submitButton.selector); }
  get unrestrictedMsg() { return $('[data-qa-unrestricted-msg'); }

  baseElementsDisplay(restricted) {
    this.restrictAccess.waitForDisplayed(constants.wait.normal);
    if (restricted) {
      expect(this.globalPermissionsHeader.isDisplayed())
        .withContext(`"${this.globalPermissionsHeader.selector}" selector ${assertLog.displayed}`)
        .toBe(true);
      expect(this.billingAccessHeader.isDisplayed())
        .withContext(`"${this.billingAccessHeader.selector}" selector ${assertLog.displayed}`)
        .toBe(true);
      expect(this.specificPermissionsHeader.isDisplayed())
        .withContext(`"${this.specificPermissionsHeader.selector}" selector ${assertLog.displayed}`)
        .toBe(true);
      expect(this.globalPermissions.length)
        .withContext(`${assertLog.incorrectNum} for "${this.specificPermissionsHeader.selector}" selector`)
        .toBeGreaterThan(1);
      expect(this.billingPermissionNone.isDisplayed())
        .withContext(`"${this.billingPermissionNone.selector}" selector ${assertLog.displayed}`)
        .toBe(true);
      expect(this.billingPermissionRead.isDisplayed())
        .withContext(`"${this.billingPermissionRead.selector}" selector ${assertLog.displayed}`)
        .toBe(true);
      expect(this.billingPermissionWrite.isDisplayed())
        .withContext(`"${this.billingPermissionWrite.selector}" selector ${assertLog.displayed}`)
        .toBe(true);
      expect(this.restrictAccess.isDisplayed())
        .withContext(`"${this.restrictAccess.selector}" selector ${assertLog.displayed}`)
        .toBe(true);
      expect($$(this.submitButton.selector).length)
        .withContext(`${assertLog.incorrectNum} for "${this.submitButton.selector}" selector`)
        .toBe(2);
      expect($$(this.cancelButton.selector).length)
        .withContext(`${assertLog.incorrectNum} for "${this.cancelButton.selector}" selector`)
        .toBe(2);
      expect(this.restrictAccess.getAttribute('data-qa-restrict-access'))
        .withContext(`"${this.restrictAccess.selector}" selector ${assertLog.displayed}`)
        .toBe('true');
    } else {
      expect(this.unrestrictedMsg.isDisplayed())
        .withContext(`"${this.unrestrictedMsg.selector}" selector ${assertLog.displayed}`)
        .toBe(true);
      expect(this.restrictAccess.getAttribute('data-qa-restrict-access'))
        .withContext(`"${this.restrictAccess.selector}" selector ${assertLog.displayed}`)
        .toBe('false');
    }
  }

  toggleGlobalPermission(permissionId, permission) {
    $(`[data-qa-global-permission="${permissionId}"]`).waitForDisplayed(constants.wait.normal);
    if (permission === 'allow') {
      $(`[data-qa-global-permission="${permissionId}"]`).click();
      $(`[data-qa-global-permission="${permissionId}"] input:checked`).waitForExist(constants.wait.normal);
    }

    if (permission === 'restrict') {
      if ($(`[data-qa-global-permission="${permissionId}"] input:checked`).isExisting()) {
        $(`[data-qa-global-permission="${permissionId}"]`).click();
        $(`[data-qa-global-permission="${permissionId}"] input:checked`).waitForExist(constants.wait.normal, true);
      }
    }
    this.globalSection.$(this.saveButton.selector).click();
    this.waitForNotice(`Successfully updated global permissions`);
  }

  setSpecificPermission(permType, perm, accessLevel) {
    const permission =
      $(`[data-qa-permissions-header="${permType}"]`).$('..')
        .$(`[data-qa-specific-grant="${perm}"]`)
        .$(`[data-qa-permission="${accessLevel}"]`);
    permission.click();

    expect(permission.getAttribute('data-qa-radio')).toBe('true');

    this.specificSection.$(this.saveButton.selector).click();
    this.waitForNotice('Successfully updated Entity-Specific Permissions');
  }

  setBillingPermission(accessLevel) {
    $(`[data-qa-select-card-heading="${accessLevel}"]`).click();
    this.globalSection.$(this.saveButton.selector).click();
    this.waitForNotice(`Successfully updated global permissions`);
  }
}

export default new Permissions();
