const { constants } = require('../../constants');

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
        this.restrictAccess.waitForVisible(constants.wait.normal);
        if (restricted) {
            expect(this.globalPermissionsHeader.isVisible()).toBe(true);
            expect(this.billingAccessHeader.isVisible()).toBe(true);
            expect(this.specificPermissionsHeader.isVisible()).toBe(true);
            expect(this.globalPermissions.length).toBeGreaterThan(1);
            expect(this.billingPermissionNone.isVisible()).toBe(true);
            expect(this.billingPermissionRead.isVisible()).toBe(true);
            expect(this.billingPermissionWrite.isVisible()).toBe(true);
            expect(this.restrictAccess.isVisible()).toBe(true);
            expect($$(this.submitButton.selector).length).toBe(2);
            expect($$(this.cancelButton.selector).length).toBe(2);
            expect(this.restrictAccess.getAttribute('data-qa-restrict-access')).toBe('true');
        } else {
            expect(this.unrestrictedMsg.isVisible()).toBe(true);
            expect(this.restrictAccess.getAttribute('data-qa-restrict-access')).toBe('false');
        }
    }

    toggleGlobalPermission(permissionId, permission) {
        browser.waitForVisible(`[data-qa-global-permission="${permissionId}"]`, constants.wait.normal);
        if (permission === 'allow') {
            $(`[data-qa-global-permission="${permissionId}"]`).click();
            browser.waitForExist(`[data-qa-global-permission="${permissionId}"] input:checked`, constants.wait.normal);
        }

        if (permission === 'restrict') {
            if (browser.isExisting(`[data-qa-global-permission="${permissionId}"] input:checked`)) {
                $(`[data-qa-global-permission="${permissionId}"]`).click();
                browser.waitForExist(`[data-qa-global-permission="${permissionId}"] input:checked`, constants.wait.normal, true);
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
