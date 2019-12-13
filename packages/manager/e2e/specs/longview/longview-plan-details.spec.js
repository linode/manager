const { constants } = require('../../constants');
const { readToken } = require('../../utils/config-utils');
import LongviewLanding from '../../pageobjects/longview/longview-landing.page';
import LongviewPlan from '../../pageobjects/longview/longview-plan-details.page';
import { assertLog } from '../../utils/assertionLog';
import { longviewText } from './longviewText';

describe('longview suite', () => {
  let token;
  const managedAccount =
    'cannot use a managed account for basic longview plan changes';
  afterAll(() => {
    LongviewLanding.removeAllLVClients(token);
  });

  describe('Longview client tests', () => {
    beforeEach(() => {
      token = readToken(browser.options.testUser);
      LongviewLanding.removeAllLVClients(token);
      browser.url(constants.routes.longview.clients);
      LongviewLanding.baseLongviewPage();
    });

    it('checks default page with no longview clients', () => {
      // checks for managed account. test will not work with managed accounts
      expect(LongviewLanding.checkForManaged(token))
        .withContext(`${managedAccount}`)
        .toBe(false);
      expect(LongviewLanding.noLVClients.isDisplayed())
        .withContext(`should not have longview clients`)
        .toBe(true);
      expect(LongviewLanding.noLVClients.$('p').getText())
        .withContext(`${assertLog.incorrectText}`)
        .toBe(`${longviewText.noClients}`);
      expect(LongviewLanding.upgradeText.getText())
        .withContext(`${assertLog.incorrectText} for longview upgrade`)
        .toBe(`${longviewText.upgradeMessage}`);
    });

    it('can add a new client', () => {
      LongviewLanding.addLVClient(1);
      expect($('[data-qa-editable-text]').isDisplayed())
        .withContext(`Longview client name ${assertLog.displayed}`)
        .toBe(true);
      expect($('[data-qa-editable-text]').getText())
        .withContext(`longview client ${assertLog.incorrectText}`)
        .toContain('longview');
    });

    it('checks for correct longview client information', () => {
      // create a client via API and validate information
      const client = LongviewLanding.addLVClientsAPI(token, 1);
      const installCode = `${longviewText.installCmd}${client[0].install_code}${longviewText.installCmd2}`;
      const clientId = client[0].id;
      browser.refresh();
      LongviewLanding.baseLongviewPage();
      const clientRow = $(`[data-testid="${clientId}"]`);
      clientRow.waitForDisplayed();

      expect(clientRow.$('[data-qa-editable-text]').getText())
        .withContext(`${assertLog.incorrectText} longview label`)
        .toBe(client[0].label);
      expect(LongviewLanding.longviewClient.$('pre').getText())
        .withContext(`${assertLog.incorrectText} for install command`)
        .toBe(`${installCode}`);
      expect(LongviewLanding.apiKey.getText())
        .withContext(`${assertLog.incorrectText} api install key`)
        .toBe(`API Key: ${client[0].api_key}`);
    });

    it('can delete a client', () => {
      const client = LongviewLanding.addLVClientsAPI(token, 1);
      const clientId = client[0].id;
      browser.refresh();
      LongviewLanding.baseLongviewPage();

      $(`[data-testid="${clientId}"] [data-qa-action-menu]`).waitForDisplayed();
      LongviewLanding.removeLVClient(clientId);
    });
  });

  describe('longview plan detail tests', () => {
    const lvSetting = { longview_subscription: null };

    beforeEach(() => {
      token = readToken(browser.options.testUser);
      if (!LongviewLanding.checkForManaged(token)) {
        LongviewLanding.removeAllLVClients(token);
        LongviewPlan.setPlanLVFree(token, lvSetting);
        browser.url(constants.routes.longview.planDetails);
        LongviewPlan.planDetailsDisplay();
      }
    });
    it('checks that longview plan can be changed', () => {
      // checks for managed account
      expect(LongviewLanding.checkForManaged(token))
        .withContext(`${managedAccount}`)
        .toBe(false);
      // Changes a plan
      expect(LongviewPlan.isCurrentPlan('free'))
        .withContext(`free plan should be set`)
        .toBe(true);

      LongviewPlan.selectLongviewPlan('100');
      LongviewPlan.changeLongviewPlan('100');
      LongviewPlan.verifyPlan('100');
    });

    it('cannot set a plan that is lower than current longview clients ', () => {
      // checks for managed account
      expect(LongviewLanding.checkForManaged(token))
        .withContext(`${managedAccount}`)
        .toBe(false);
      // Create 4 longview clients
      const clients = LongviewLanding.addLVClientsAPI(token, 4);
      const clientCount = LongviewLanding.getLVClientsAPI();
      const lvError = `Too many active Longview clients (${clientCount.length}) for the subscription selected (3). Select a larger subscription or reduce the number of Longview clients.`;
      LongviewPlan.lv3Plan.click();
      LongviewPlan.changePlanButton.click();
      $('[data-qa-notice').waitForDisplayed();
      expect($('[data-qa-error="true"]').isDisplayed())
        .withContext(`Client count error ${assertLog.displayed}`)
        .toBe(true);
      expect($('[data-qa-error="true"]').getText())
        .withContext(`${assertLog.incorrectText} for client error`)
        .toBe(lvError);
      expect(LongviewPlan.changePlanButton.isEnabled())
        .withContext(`Change Plan button ${assertLog.enabled}`)
        .toBe(true);
      // delete created longview clients
      LongviewLanding.deleteLVClientsAPI(token, clients);
    });
  });
});
