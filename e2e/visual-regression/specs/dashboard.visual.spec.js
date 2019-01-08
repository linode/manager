const { constants } = require('../../constants');
const { compareTest } = require('../../utils/visual-comparison');
import Dashboard from '../../pageobjects/dashboard.page';
import EnableAllBackupsDrawer from '../../pageobjects/enable-all-backups-drawer'
import ImportGroupsAsTagsDrawer from '../../pageobjects/import-groups-as-tags-drawer.page'

describe('Dashboard Visual Regression', function() {
    beforeAll(() => {
        browser.url(constants.routes.dashboard);
        Dashboard.baseElemsDisplay();
    });

    it('Top Menu - Create Button, Search, Profile Avatar, Notification', () => {
        compareTest('dashboard-top-menu', Dashboard.globalTopMenu.selector);
    });

    it('Side Bar Navigation', () => {
        compareTest('dashboard-side-bar', Dashboard.navigationSideBar.selector);
    });

    it('Dashboard Header', () => {
        compareTest('dashboard-header', Dashboard.header.selector);
    });

    it('Linodes Card', () => {
        compareTest('linodes-card', Dashboard.linodesCard.selector);
    });

    it('Volumes Card', () => {
        compareTest('volumes-card', Dashboard.volumesCard.selector);
    });

    it('Domains Card', () => {
        compareTest('domains-card', Dashboard.domainsCard.selector);
    });

    it('NodeBalancers Card', () => {
        compareTest('node-balancers-card', Dashboard.monthlyTransferCard.selector);
    });

    it('Monthly Transer Card', () => {
        compareTest('monthly-transfer-card', Dashboard.monthlyTransferCard.selector);
    });

    it('Back Up Your Data Card', () => {
        compareTest('backups-cta-header', Dashboard.backupsCTAHeader.selector);
        compareTest('auto-backup-enrollment-cta', Dashboard.autoBackupEnrollmentCTA.selector);
        compareTest('enable-backups-for-existing-cta', Dashboard.backupExistingLinodes.selector);
        browser.pause(2000);
        Dashboard.backupExistingLinodes.click();
        EnableAllBackupsDrawer.enableAllBackupsDrawerDisplays(true);
        compareTest('dashboard-enable-all-backups-drawer', `${EnableAllBackupsDrawer.drawerBase.selector} div:nth-child(2)`);
        browser.pause(2000);
        EnableAllBackupsDrawer.drawerClose.click();
        Dashboard.drawerBase.waitForVisible(constants.wait.normal,true);
    });

    it('Import Display Groups as Tags Card', () => {
        compareTest('import-groups-cta-header', Dashboard.importGroupsAsTagsHeader.selector);
        compareTest('import-groups-cta-message', Dashboard.importGroupsAsTagsCta.selector);
        compareTest('import-groups-cta-button', Dashboard.openImportDrawerButton.selector);
        Dashboard.openImportDrawerButton.click();
        ImportGroupsAsTagsDrawer.drawerDisplays();
        compareTest('dashboard-import-groups-drawer', `${ImportGroupsAsTagsDrawer.drawerBase.selector} div:nth-child(2)`);
        browser.pause(2000);
        ImportGroupsAsTagsDrawer.drawerClose.click();
        Dashboard.drawerBase.waitForVisible(constants.wait.normal,true);
    });

    it('Blog Card', () => {
        compareTest('blog-card', Dashboard.blogCard.selector);
    });
});
