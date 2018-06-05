const crypto = require('crypto');
const { constants } = require('../../../constants');
const { createGenericLinode, createLinodeIfNone } = require('../../../utils/common');

import ListLinodes from '../../../pageobjects/list-linodes';
import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';
import Settings from '../../../pageobjects/linode-detail/linode-detail-settings.page';

describe('Linode Detail - Settings Suite', () =>{
    beforeAll(() => {
        createLinodeIfNone();
        ListLinodes.linodesDisplay();
        ListLinodes.navigateToDetail(ListLinodes.linodeElem);
        LinodeDetail.landingElemsDisplay();
        LinodeDetail.changeTab('Settings');
    });

    describe('Label Suite', () => {
        it('should display label editable text field', () => {
            Settings.label.waitForVisible();
            Settings.labelSave.waitForVisible();
        });

        it('should edit on save', () => {
            Settings.updateLabel('Some-New-Label');
        });
    });

    describe('Reset Root Password Suite', () => {
        it('should display a disk in the select, password field and save button', () => {
            Settings.selectDisk.waitForVisible();
            Settings.password.waitForVisible();
            Settings.passwordSave.waitForVisible();
        });

        it('should successfully change root password', () => {
            const newPassword = crypto.randomBytes(20).toString('hex');
            const disks = Settings.getDiskLabels();
            Settings.resetPassword(newPassword, disks[0]);
        });
    });

    describe('Notification Thresholds Suite', () => {
        it('should display all the alert toggles and default to enabled', () => {
            Settings.allAlertsEnabled();
        });

        it('should disable a notification threshold on toggle off', () => {
            const initialEnabledAlerts = $$('[data-qa-alert] :checked');
            const alertLabels = Settings.alerts.map(a => a.getAttribute('data-qa-alert'));
            
            Settings.toggleAlert(alertLabels[0]);
            
            const enabledAlerts = $$('[data-qa-alert] :checked');

            expect(enabledAlerts.length).not.toEqual(initialEnabledAlerts.length);
        });

        it('should enable a notification on toggle on', () => {
            const alertLabels = Settings.alerts.map(a => a.getAttribute('data-qa-alert'));
            Settings.toggleAlert(alertLabels[0]);
        });
    });

    describe('Advanced Configurations Suite', () => {
        xit('should add a configuration', () => {
            
        });

        it('should remove a configuration', () => {
            const configs = Settings.getConfigLabels();
            Settings.deleteConfig(configs[0]);
        });
    });

    describe('Delete Suite', () => {
        it('should remove the linode', () => {
            Settings.remove();
        });
    });
});