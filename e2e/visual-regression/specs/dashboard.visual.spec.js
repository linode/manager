const { constants } = require('../../constants');
const { compareTest } = require('../../utils/visual-comparison');
import Dashboard from '../../pageobjects/dashboard.page';

describe('Dashboard Visual Regression', function() {
    beforeAll(() => {
        browser.url(constants.routes.dashboard);
        Dashboard.baseElemsDisplay();
    });

    it('Auto Backups Enrollment CTA', () => {
        compareTest('auto-backup-enrollment-cta', Dashboard.autoBackupEnrollmentCTA.selector);
    });
});
