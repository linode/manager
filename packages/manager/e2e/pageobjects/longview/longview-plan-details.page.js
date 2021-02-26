const { constants } = require('../../constants');
const { assertLog } = require('../../utils/assertionLog');
import longviewLanding from '../longview/longview-landing.page';
import Logger from '../../utils/Logger';
const log = new Logger('plan-details');

import Page from '../page';

class LongviewPlanDetails extends Page {
  get title() {
    return $('h1');
  }

  get clientsTab() {
    return $('[data-qa-tab=Clients]');
  }

  get planDetailsTab() {
    return $('[data-qa-tab=Plan Details]');
  }

  get currentPlan() {
    return $('[data-testid=current-plan]');
  }

  get changePlanButton() {
    return $('[data-testid=submit-button]');
  }

  get lvFreePlan() {
    return $(`[data-testid=lv-sub-table-row-longview-free]`);
  }

  get lv3Plan() {
    return $(`[data-testid=lv-sub-table-row-longview-3]`);
  }

  get lv10Plan() {
    return $(`[data-testid=lv-sub-table-row-longview-10]`);
  }

  get lv40Plan() {
    return $(`[data-testid=lv-sub-table-row-longview-40]`);
  }

  get lv100Plan() {
    return $(`[data-testid=lv-sub-table-row-longview-100]`);
  }

  get loading() {
    return $('[data-qa-loading="true"]');
  }

  get notLoading() {
    return $('[data-qa-loading="false"]');
  }

  isCurrentPlan(clientCount) {
    return $(
      `[data-testid="lv-sub-table-row-longview-${clientCount}"] [data-testid="current-plan"]`
    ).isExisting();
  }

  resetToFree() {
    if (this.isCurrentPlan('free')) {
      return;
    }
    this.changeLongviewPlan('free');
  }

  // checks to verify we are on the longview plan details page
  planDetailsDisplay() {
    const planOptions = [
      this.lvFreePlan,
      this.lv3Plan,
      this.lv10Plan,
      this.lv40Plan,
      this.lv100Plan,
    ];

    this.currentPlan.waitForDisplayed(constants.wait.short);
    expect(browser.getUrl())
      .withContext(`wrong url path`)
      .toContain('/longview/plan-details');
    planOptions.forEach(plan => {
      expect(plan.isDisplayed())
        .withContext(`Longview plan ${assertLog.displayed}`)
        .toBe(true);
      expect(plan.getText()).toContain('Longview');
    });
    expect(this.title.getText())
      .withContext(`${assertLog.incorrectText}`)
      .toBe('Longview');
    expect(this.documentationLink.isDisplayed())
      .withContext(`missing documentation link`)
      .toBe(true);
    expect(this.lvFreePlan.getText())
      .withContext(`${assertLog.incorrectText}`)
      .toContain('Longview Free');
    expect(this.changePlanButton.isDisplayed())
      .withContext(`${assertLog.displayed}`)
      .toBe(true);
    expect(this.changePlanButton.isEnabled())
      .withContext(`Change Plan button ${assertLog.notEnabled}`)
      .toBe(false);
  }
  // verifies that the correct plan is selected and active
  verifyPlan(clientCount) {
    const planRow = $(
      `[data-testid="lv-sub-table-row-longview-${clientCount}"]`
    );
    expect(this.isCurrentPlan(clientCount))
      .withContext(`should be current plan`)
      .toBe(true);
    expect(planRow.$('[data-qa-radio="true"]').isEnabled())
      .withContext(`Plan radio button ${assertLog.enabled}`)
      .toBe(true);

    expect(this.changePlanButton.isEnabled())
      .withContext(`Change plan button ${assertLog.notEnabled}`)
      .toBe(false);
  }
  // Used for selecting or using any longview plan row
  selectLongviewPlan(clientCount) {
    const planRow = $(
      `[data-testid="lv-sub-table-row-longview-${clientCount}"]`
    );
    planRow.click();
  }

  // used to handle the Change Plan button.
  // Figure out a better solution to the Change Plan button and it's
  // loading state and use the loading state to wait
  changeLongviewPlan(clientCount) {
    if (this.isCurrentPlan(clientCount)) {
      log.warn('current plan already selected');
      return false;
    }
    this.changePlanButton.click();
    browser.waitUntil(() => this.notLoading.isDisplayed());
    this.changePlanButton.waitForEnabled(constants.wait.short, true);
  }

  // simplified API call to reset the user account
  setPlanLVFree(token) {
    if (longviewLanding.checkForManaged(token)) {
      log.error('cannot use a managed user account for longview plan changes');
      return;
    } else {
      const free = { longview_subscription: null };
      return browser.updateGlobalSettings(token, free);
    }
  }
}

export default new LongviewPlanDetails();
