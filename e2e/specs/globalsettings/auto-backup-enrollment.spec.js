const { constants } = require('../../constants');
import {
    apiCreateLinode,
    updateGlobalSettings,
    timestamp
} from '../../utils/common';
import Dashboard from '../../pageobjects/dashboard.page';
import GlobalSettings from '../../pageobjects/account/global-settings.page';
import ListLinodes from '../../pageobjects/list-linodes';

describe('Backup Auto Enrollment Suite', () => {
    const disableAutoEnrollment = { backups_enabled: false };
    const linodeLabel = `TestLinode${timestamp()}`;

    beforeAll(() => {
        const settins = updateGlobalSettings(disableAutoEnrollment);
        console.log(settings);
        const linode = apiCreateLinode(linodeLabel);
        console.log(linode);
        browser.url(constants.routes.dashboard);
    });

    afterAll(() => {
        updateGlobalSettings(disableAutoEnrollment);
    });

    it('Enable backups for existing and backup auto enrollment CTA should display on dashboard', () => {
        Dashboard.baseElemsDisplay();
        expect(Dashboard.autoBackupEnrollmentCTA.isVisible()).toBe(true);
        expect(Dashboard.backupExistingLinodes.isVisible()).toBe(true);
    });
});
