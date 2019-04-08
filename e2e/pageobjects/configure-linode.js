const crypto = require('crypto');
const { constants } = require('../constants');

import Page from './page';

class ConfigureLinode extends Page {
  get createHeader() {
    return $('[data-qa-create-linode-header]');
  }

  /** parent headers */
  get createFromDistribution() {
    return $('[data-qa-create-from="Distributions"]');
  }
  get createFromOneClick() {
    return $('[data-qa-create-from=One-Click]');
  }
  get createFromMyImage() {
    return $('[data-qa-create-from="My Images"]');
  }

  /** subtabs under One-Click */
  get createFromOneClickApp() {
    return $('[data-qa-create-from="One-Click Apps"]');
  }
  get createFromCommunityStackScript() {
    return $('[data-qa-create-from="Community StackScripts"]');
  }

  /** subtabs under My Images */
  get createFromImage() {
    return $('[data-qa-create-from="Images"]');
  }
  get createFromBackups() {
    return $('[data-qa-create-from="Backups"]');
  }
  get createFromClone() {
    return $('[data-qa-create-from="Clone Linode"]');
  }
  get createFromMyStackScript() {
    return $('[data-qa-create-from="My StackScripts"]');
  }

  get selectLinodeHeader() {
    return $('[data-qa-select-linode-header]');
  }
  get noCompatibleImages() {
    return $('[data-qa-no-compatible-images]');
  }

  get showOlderImages() {
    return $('[data-qa-show-more-expanded]');
  }

  get selectStackScriptPanel() {
    return $('[data-qa-panel="Select a StackScript"]');
  }
  get myStackScriptTab() {
    return $('[data-qa-tab="My StackScripts"]');
  }
  get linodeStackScriptTab() {
    return $('[data-qa-tab="Linode StackScripts"]');
  }
  get communityStackScriptTab() {
    return $('[data-qa-tab="Community StackScripts"]');
  }

  get stackScriptTableHeader() {
    return $('[data-qa-stackscript-table-header]');
  }
  get stackScriptDeploysHeader() {
    return $('[data-qa-stackscript-active-deploy-header]');
  }
  get stackScriptRevisionsHeader() {
    return $('[data-qa-stackscript-revision-header]');
  }
  get stackScriptCompatibleImagesHeader() {
    return $('[data-qa-stackscript-compatible-images]');
  }

  get stackScriptRow() {
    return $('[data-qa-table-row]');
  }
  get stackScriptRows() {
    return $$('[data-qa-table-row]');
  }
  get stackScriptTitle() {
    return $('[data-qa-stackscript-title]');
  }
  get stackScriptDeploys() {
    return $('[data-qa-stackscript-deploys]');
  }
  get stackScriptRevision() {
    return $('[data-qa-stackscript-revision]');
  }
  get stackScriptEmptyMsg() {
    return $('[data-qa-stackscript-empty-msg]');
  }

  get userDefinedFieldsHeader() {
    return $('[data-qa-user-defined-field-header]');
  }
  // User defined text field
  // user defined boolean

  get selectRegionHeader() {
    return $('[data-qa-tp="Region"]');
  }
  get regionTabs() {
    return $$('[data-qa-tp="Region"] [data-qa-tab]');
  }
  get regions() {
    return $$('[data-qa-tp="Region"] [data-qa-selection-card]');
  }

  get planHeader() {
    return $('[data-qa-tp="Linode Plan"]');
  }
  get planTabs() {
    return $$('[data-qa-tp="Linode Plan"] [data-qa-tab]');
  }
  get plans() {
    return $$('[data-qa-tp="Linode Plan"] [data-qa-selection-card]');
  }
  get planNames() {
    return $$(
      '[data-qa-tp="Linode Plan"] [data-qa-selection-card] [data-qa-select-card-heading]'
    );
  }

  get labelHeader() {
    return $('[data-qa-label-header]');
  }
  get label() {
    return $('[data-qa-label-header] input');
  }

  get passwordHeader() {
    return $('[data-qa-password-input]');
  }
  get password() {
    return $('[data-qa-password-input] input');
  }

  get sshHeader() {
    return $('[data-qa-table="SSH Keys"]');
  }
  get sshKeys() {
    return $$('[data-qa-ssh-public-key]');
  }

  get addonsHeader() {
    return $('[data-qa-add-ons]');
  }
  get addons() {
    return $$('[data-qa-add-ons] [data-qa-checked]');
  }
  get backupsCheckBox() {
    return $('[data-qa-check-backups]');
  }
  get privateIpCheckbox() {
    return $('[data-qa-check-private-ip]');
  }

  get orderSummary() {
    return $('[data-qa-order-summary]');
  }
  get total() {
    return $('[data-qa-total-price]');
  }
  get deploy() {
    return $('[data-qa-deploy-linode]');
  }

  cloneBaseElemsDisplay() {
    this.notice.waitForVisible();
    const notices = $$(this.notice.selector);

    const cloneSLA =
      'This newly created Linode will be created with the same password and SSH Keys (if any) as the original Linode.';
    const cloneFromHeader = 'Select Linode to Clone From';
    const selectLinodePanelText = $$('[data-qa-select-linode-header]').map(h =>
      h.getText()
    );

    expect(notices.map(n => n.getText())).toContain(cloneSLA);
    expect($$('[data-qa-select-linode-header]').length).toBe(1);
    expect(selectLinodePanelText).toContain(cloneFromHeader);
    expect(this.total.isVisible()).toBe(true);
    expect(this.total.getText()).toBe('$0.00/mo');
    expect(this.deploy.isVisible()).toBe(true);
  }

  stackScriptsBaseElemsDisplay(stackScriptTab) {
    this.selectStackScriptPanel.waitForVisible(constants.wait.normal);
    expect(stackScriptTab.isVisible()).toBe(true);
    expect(stackScriptTab.getAttribute('aria-selected')).toBe('true');

    expect(this.regionTabs.length).toBeGreaterThan(0);
    expect(this.regions.length).toBeGreaterThan(0);
    expect(this.selectRegionHeader.isVisible()).toBe(true);

    expect(this.planHeader.isVisible()).toBe(true);
    expect(this.planTabs.length).toBe(4);
    expect(this.plans.length).toBeGreaterThan(0);

    expect(this.label.isVisible()).toBe(true);
    expect(this.labelHeader.isVisible()).toBe(true);

    expect(this.passwordHeader.isVisible()).toBe(true);
    expect(this.password.isVisible()).toBe(true);

    expect(this.addonsHeader.isVisible()).toBe(true);
    expect(this.addons.length).toBe(2);
  }

  selectFirstStackScript() {
    return $(`${this.stackScriptRow.selector} [data-qa-radio]`);
  }

  stackScripShowDetails(title) {
    const selector = this.stackScriptRow.selector.replace(']', '');
    if (title) {
      $(`${selector}="${title}"] button`).click();
    } else {
      $$(`${this.stackScriptRow.selector} button`)[0].click();
    }
  }

  stackScriptTableDisplay() {
    this.stackScriptTableHeader.waitForVisible(constants.wait.normal);
    this.stackScriptDeploysHeader.waitForVisible(constants.wait.normal);
    this.stackScriptRevisionsHeader.waitForVisible(constants.wait.normal);
    this.stackScriptCompatibleImagesHeader.waitForVisible(
      constants.wait.normal
    );
  }

  stackScriptMetadataDisplay() {
    this.stackScriptRows.forEach(r => {
      expect(r.$(this.stackScriptTitle.selector).getText()).toMatch(/./g);
      expect(r.$(this.stackScriptDeploys.selector).getText()).toMatch(/./g);
      expect(r.$(this.stackScriptRevision.selector).getText()).toMatch(/./g);
    });
  }

  baseDisplay() {
    expect(this.createHeader.waitForVisible(constants.wait.normal)).toBe(true);

    expect(this.createFromDistribution.isVisible()).toBe(true);
    expect(this.createFromOneClick.isVisible()).toBe(true);
    expect(this.createFromMyImage.isVisible()).toBe(true);

    expect(this.selectImageHeader.isVisible()).toBe(true);
    this.imageTabs.forEach(tab => expect(tab.isVisible()).toBe(true));
    this.images.forEach(i => expect(i.isVisible()).toBe(true));
    expect(this.showOlderImages.isVisible()).toBe(true);

    expect(this.selectRegionHeader.isVisible()).toBe(true);
    this.regionTabs.forEach(tab => expect(tab.isVisible()).toBe(true));
    this.regions.forEach(r => expect(r.isVisible()).toBe(true));

    expect(this.planHeader.isVisible()).toBe(true);
    this.planTabs.forEach(tab => expect(tab.isVisible()).toBe(true));
    this.plans.forEach(p => expect(p.isVisible()).toBe(true));

    expect(this.labelHeader.isVisible()).toBe(true);
    expect(this.label.isVisible()).toBe(true);

    expect(this.multiSelect.isVisible()).toBe(true);

    expect(this.passwordHeader.isVisible()).toBe(true);
    expect(this.password.isVisible()).toBe(true);

    expect(this.addonsHeader.isVisible()).toBe(true);
    this.addons.forEach(a => expect(a.isVisible()).toBe(true));
  }
  // Configure a basic linode, selecting all the default options
  generic(label = `Test-Linode${new Date().getTime()}`) {
    this.images[0].click();
    this.regions[0].click();
    this.plans[0].click();
    this.label.setValue(label);
    this.password.setValue(`SomeTimeStamp${new Date().getTime()}`);
  }

  selectRegion(region) {
    this.generic();
    browser.click(`[data-qa-tp="Region"] [data-qa-tab="${region}"]`);

    // Select first available location in region
    this.regions[0].click();
  }

  selectImage(imageName) {
    const requestedImage = $(`[data-qa-select-card-heading="${imageName}"]`);
    requestedImage.click();
  }

  selectPlanTab(planType) {
    const initialPlans = this.plans.length;

    this.planHeader.$(`[data-qa-tab="${planType}"]`).click();

    browser.waitUntil(function() {
      return (
        $$('[data-qa-tp="Linode Plan"] [data-qa-selection-card]').length !==
        initialPlans
      );
    }, 5000);
  }

  selectPlan(planIndex = 0) {
    const planElement = this.plans[planIndex];
    planElement.click();
    browser.waitUntil(
      function() {
        return planElement
          .$('[data-qa-checked]')
          .getAttribute('data-qa-checked')
          .includes('true');
      },
      5000,
      'Failed to select plan'
    );
  }

  cloneSelectSource(linodeLabel) {
    const sourceSection = $$('[data-qa-select-linode-panel]');
    expect(sourceSection[0].$('[data-qa-select-linode-header]').getText()).toBe(
      'Select Linode to Clone From'
    );
    // const targetSection = $$('[data-qa-select-linode-panel]')
    // .filter(s => s.$('[data-qa-select-linode-header]').getText() === 'Select Target Linode');

    let linodes = sourceSection[0].$$('[data-qa-selection-card]');
    let sourceLinode = linodes[0];
    let sourceLabel = sourceLinode.$('[data-qa-select-card-heading]').getText();
    sourceLinode.click();

    // let targetLinodeCard = targetSection[0].$$('[data-qa-selection-card]')
    // .filter(c => c.$('[data-qa-select-card-heading]').getText() === sourceLabel);
    // expect(targetLinodeCard[0].getAttribute('class')).toContain('disabled');

    if (linodeLabel) {
      linodes = sourceSection[0]
        .$$('[data-qa-selection-card]')
        .filter(
          l => l.$('[data-qa-select-card-heading]').getText() === linodeLabel
        );
      sourceLinode = linodes[0];
      sourceLabel = sourceLinode.$('[data-qa-select-card-heading]').getText();

      sourceLinode.click();

      // targetLinodeCard = targetSection[0].$$('[data-qa-selection-card]')
      // .filter(c => c.$('[data-qa-select-card-heading]').getText() === sourceLabel);

      // expect(targetLinodeCard[0].getAttribute('class')).toContain('disabled');
    }
  }

  cloneSelectTarget(linodeLabel) {
    if (linodeLabel) {
      const targetSection = $$('[data-qa-select-linode-panel]').filter(
        s =>
          s.$('[data-qa-select-linode-header]').getText() ===
          'Select Target Linode'
      );
      const linodes = targetSection[0]
        .$$('[data-qa-selection-card]')
        .filter(
          l => l.$('[data-qa-select-card-heading]').getText() === linodeLabel
        );
      linodes[0].click();
    } else {
      const cloneToNewCard = $('[data-qa-select-card-heading="New Linode"]');
      cloneToNewCard.click();
      browser.waitForVisible('[data-qa-tp="Region"]');
      browser.waitForVisible('[data-qa-tp="Linode Plan"]');
      browser.waitForVisible('[data-qa-label-header]');
    }
  }

  createFrom(source) {
    const sourceSelector = `[data-qa-create-from="${source}"]`;
    $(sourceSelector).waitForVisible(constants.wait.normal);
    browser.click(sourceSelector);
    browser.waitUntil(
      function() {
        return browser
          .getAttribute(sourceSelector, 'aria-selected')
          .includes('true');
      },
      constants.wait.normal,
      'Failed to change tab of linode create source'
    );
  }

  randomPassword() {
    this.password.setValue(crypto.randomBytes(20).toString('hex'));
  }
}
export default new ConfigureLinode();
