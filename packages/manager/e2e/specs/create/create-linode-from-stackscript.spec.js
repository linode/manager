const { constants } = require('../../constants');

import ConfigureStackScripts from '../../pageobjects/configure-stackscript.page';
import ConfigureLinode from '../../pageobjects/configure-linode';
import { timestamp, apiDeleteAllLinodes } from '../../utils/common';
import { assertLog } from '../../utils/assertionLog';

describe('Create Linode - Create from StackScript Suite', () => {
  beforeAll(() => {
    browser.url(constants.routes.create.linode);
    ConfigureLinode.baseDisplay();
  });

  afterAll(() => {
    apiDeleteAllLinodes();
  });

  it('should change tab to create from stackscript', () => {
    ConfigureLinode.createFrom('One-Click');
    ConfigureLinode.createFrom('Community StackScripts');
  });

  it('should display stackscript table', () => {
    ConfigureLinode.stackScriptTableDisplay();
  });

  it('should fail to create without selecting a stackscript', () => {
    const noticeMsg = 'You must select a StackScript';

    ConfigureLinode.deploy.click();
    ConfigureLinode.waitForNotice(noticeMsg);
  });

  it('should search for a community stackscript', () => {
    const docker = 'docker-ubuntu';
    ConfigureLinode.stackScriptSearch.setValue(docker);
    $('[data-qa-table-row="docker-ubuntu"]').waitForDisplayed(
      constants.wait.normal
    );
  });

  it('should select a stackscript if its table row is clicked', () => {
    /** Select a stackscript we know of */
    const dockerStackScript = $('[data-qa-table-row="docker-ubuntu"]');
    dockerStackScript.click();

    const checkedRows = ConfigureLinode.stackScriptRows.filter(
      row => row.$('[data-qa-radio]').getAttribute('data-qa-radio') === 'true'
    );

    expect(checkedRows.length).toEqual(1);
  });

  it('should display errors when creating without a region or plan', () => {
    const regionErr = 'Region is required.';
    const planError = 'Plan is required.';

    ConfigureLinode.deploy.click();
    ConfigureLinode.waitForNotice(planError, constants.wait.normal);
    expect(
      $('[data-qa-textfield-error-text]').isDisplayed(constants.wait.normal)
    )
      .withContext(`[data-qa-textfield-error-text] ${assertLog.displayed}`)
      .toBe(true);
    expect($('[data-qa-textfield-error-text]').getText())
      .withContext(`Should display ${regionErr}`)
      .toBe(regionErr);
  });

  it('should create from stackscript', () => {
    browser.enhancedSelect('#select-a-region', 'Newark, NJ');
    ConfigureLinode.plans[0].click();
    ConfigureLinode.randomPassword();

    const linodeLabel = `${timestamp()}`;
    browser.trySetValue(ConfigureLinode.label.selector, linodeLabel);
    ConfigureLinode.deploy.click();

    /**
     * at this point, we've been redirected to the Linodes detail page
     * and we should see the editable text on the screen
     */
    $('[data-qa-editable-text]').waitForDisplayed(constants.wait.minute);
    expect($('[data-qa-editable-text]').getText()).toBe(linodeLabel);
  });
});
