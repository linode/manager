const crypto = require('crypto');
const { constants } = require('../../../constants');
import { apiCreateLinode, apiDeleteAllLinodes } from '../../../utils/common';

import ListLinodes from '../../../pageobjects/list-linodes';
import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';
import Settings from '../../../pageobjects/linode-detail/linode-detail-settings.page';

describe('Linode Detail - Settings Suite', () =>{
    beforeAll(() => {
        apiCreateLinode();
        ListLinodes.linodesDisplay();
        ListLinodes.navigateToDetail();
        LinodeDetail.landingElemsDisplay();
        LinodeDetail.changeTab('Settings');
        Settings.header.waitForVisible(constants.wait.normal);
        Settings.expandPanels(6);
    });

    afterAll(() => {
        apiDeleteAllLinodes();
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
        it('should powerdown linode', () => {
            LinodeDetail.setPower('powerOff');
        });

        it('should display a disk in the select, password field and save button', () => {
            Settings.selectDisk.waitForVisible();
            Settings.password.waitForVisible();
            Settings.passwordSave.waitForVisible();
        });

        it('should successfully change root password', () => {
            const newPassword = crypto.randomBytes(20).toString('hex');
            Settings.resetPassword(newPassword);
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

    describe('Watchdog Suite', () => {
        it('should display watchdog enabled by default', () => {
            expect(Settings.watchdogPanel.isVisible()).toBe(true);
            expect(Settings.watchdogDesc.isVisible()).toBe(true);
            const watchdogEnabled = Settings.watchdogToggle.getAttribute('data-qa-watchdog-toggle');
            expect(watchdogEnabled).toBe('true');
        });

        it('should disable watchdog', () => {
            Settings.toggleWatchdog('off');
        });

        it('should enable watchdog', () => {
            Settings.toggleWatchdog('on');
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