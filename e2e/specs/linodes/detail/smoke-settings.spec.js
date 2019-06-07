const crypto = require('crypto');
const { constants } = require('../../../constants');
import {
    apiCreateLinode,
    apiDeleteAllLinodes,
    timestamp,
} from '../../../utils/common';

import ListLinodes from '../../../pageobjects/list-linodes';
import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';
import Settings from '../../../pageobjects/linode-detail/linode-detail-settings.page';

describe('Linode Detail - Settings Suite', () =>{
    const linode = `AutoLinode${timestamp()}`;

    beforeAll(() => {
        apiCreateLinode(linode);
        ListLinodes.linodesDisplay();
        ListLinodes.navigateToDetail();
        LinodeDetail.landingElemsDisplay();
        LinodeDetail.changeTab('Settings');
        Settings.header.waitForVisible(constants.wait.normal);
    });

    afterAll(() => {
        apiDeleteAllLinodes();
    });

    describe('Label Suite', () => {
        beforeAll(() => {
            Settings.expandPanel('Linode Label');
            browser.pause(1000);
        });

        it('should display label editable text field', () => {
            Settings.label.waitForVisible();
            Settings.labelSave.waitForVisible();
        });

        it('should edit on save', () => {
            Settings.updateLabel('Some-New-Label');
        });
    });

    describe('Reset Root Password Suite', () => {
        beforeAll(() => {
            Settings.expandPanel('Reset Root Password');
            browser.pause(1000);
        });

        it('should powerdown linode', () => {
            LinodeDetail.setPower('powerOff');
        });

        it('should display a disk in the select, password field and save button', () => {
            Settings.selectDisk.waitForVisible(constants.wait.normal);
            Settings.password.waitForVisible(constants.wait.normal);
            Settings.passwordSave.waitForVisible(constants.wait.normal);
        });

        it('should successfully change root password', () => {
            const newPassword = crypto.randomBytes(20).toString('hex');
            Settings.resetPassword(newPassword);
        });
    });

    describe('Notification Thresholds Suite', () => {
        beforeAll(() => {
            Settings.expandPanel('Notification Thresholds');
            browser.pause(1000);
        });

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
        beforeAll(() => {
            Settings.expandPanel('Shutdown Watchdog');
            browser.pause(1000);
        });

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
        beforeAll(() => {
            LinodeDetail.changeTab('Advanced');
        });

        xit('should add a configuration', () => {

        });

        it('should remove a configuration', () => {
            const configs = Settings.getConfigLabels();
            Settings.deleteConfig(configs[0]);
        });
    });

    describe('Delete Suite', () => {
        beforeAll(() => {
            LinodeDetail.changeTab('Settings');
            Settings.expandPanel('Delete Linode');
            browser.pause(1000);
        });

        it('should remove the linode', () => {
            Settings.remove();
            $(ListLinodes.getLinodeSelector(linode)).waitForVisible(constants.wait.normal,true);
        });
    });
});
