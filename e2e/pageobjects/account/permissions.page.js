const { constants } = require('../../constants');

import Page from '../page';

class Permissions extends Page {
    get globalPermissionsHeader() { return $('[data-qa-permissions-header="Global Permissions"]'); }
    get billingAccessHeader() { return $('[data-qa-permissions-header="Billing Access"]'); }
    get specificGrantsHeader() { return $('[data-qa-permissions-header="Specifc Grants"]'); }
    
    // Global Toggles
    get globalSection() { return $('[data-qa-global-section]'); }
    get addLinodesPermission() { return $('[data-qa-global-permission="add_linodes"]'); }
    get addNodeBalancersPermission() { return $('[data-qa-global-permission="add_nodebalancers"]'); }


    // Billing Permissions selection cards
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

    get saveButton() { return $('[data-qa-submit]'); }
    get cancelButton() { return $('[data-qa-cancel]'); }

    baseElementsDisplay() {
        // fill this in
        return true;
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

    setSpecificGrant(grantType, grant, accessLevel) {
        const permission =
            $(`[data-qa-permissions-header="${grantType}"]`).$('..')
                .$(`[data-qa-specific-grant="${grant}"]`)
                .$(`[data-qa-permission="${accessLevel}"]`);
        permission.click();
        
        expect(permission.getAttribute('data-qa-radio')).toBe('true');

        this.specificSection.$(this.saveButton.selector).click();
        this.waitForNotice('Successfully updated Entity-Specific Grants');
    }

    setBillingPermission(accessLevel) {
        $(`[data-qa-select-card-heading="${accessLevel}"]`).click();
        this.globalSection.$(this.saveButton.selector).click();
        this.waitForNotice(`Successfully updated global permissions`);
    }
}

export default new Permissions();
