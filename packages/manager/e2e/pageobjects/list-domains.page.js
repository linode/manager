const { constants } = require('../constants');
const { assertLog } = require('../utils/assertionLog');

import Page from './page.js';

class ListDomains extends Page {
  get placeholderText() {
    return $('[data-qa-placeholder-title]');
  }
  get createButton() {
    return $('[data-qa-placeholder-button]');
  }
  get createIconLink() {
    return this.addIcon('Add a Domain');
  }
  get importZoneButton() {
    return this.addIcon('Import a Zone');
  }
  get actionMenu() {
    return $('[data-qa-action-menu]');
  }
  get domainNameHeader() {
    return $('[data-qa-domain-name-header]');
  }
  get domainTypeHeader() {
    return $('[data-qa-domain-type-header]');
  }
  get domainDrawer() {
    return $('[data-qa-drawer]');
  }
  get domainAttribute() {
    return 'data-qa-domain-cell';
  }
  get domains() {
    return $$(`[${this.domainAttribute}]`);
  }
  get domainElem() {
    return $(`[${this.domainAttribute}]`);
  }
  get label() {
    return $('[data-qa-domain-label]');
  }
  get type() {
    return $('[data-qa-domain-type]');
  }
  get soaMailLabel() {
    return $('[data-qa-textfield-label="SOA Email Address"]');
  }
  get createSoaEmail() {
    return $('[data-qa-soa-email]');
  }
  get domainNameLabel() {
    return $('[data-qa-textfield-label="Domain"]');
  }
  get createDomainName() {
    return $('[data-qa-domain-name]');
  }
  get cloneDomainName() {
    return $('[data-qa-clone-name]');
  }
  get cancel() {
    return this.cancelButton;
  }
  get submit() {
    return this.submitButton;
  }
  get domainSortAtttribute() {
    return 'data-qa-sort-domain';
  }
  get typeSortAttribure() {
    return 'data-qa-sort-type';
  }

  baseElemsDisplay(placeholder) {
    if (placeholder) {
      const placeholderTitle = 'Manage your Domains';
      const buttonText = 'Add a Domain';
      this.placeholderText.waitForDisplayed(constants.wait.normal);

      expect(this.placeholderText.getText())
        .withContext(
          `${assertLog.incorrectText} for "${
            this.placeholderText.selector
          }" selector`
        )
        .toMatch(placeholderTitle);
      expect(this.createButton.getText())
        .withContext(
          `${assertLog.incorrectText} for "${
            this.createButton.selector
          }" selector`
        )
        .toMatch(buttonText);
      return this;
    }

    this.createIconLink.waitForDisplayed();
    expect(this.domainElem.isDisplayed())
      .withContext(
        `"${this.domainElem.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.domainNameHeader.isDisplayed())
      .withContext(
        `"${this.domainNameHeader.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.domainNameHeader.getText())
      .withContext(
        `${assertLog.incorrectText} for "${
          this.domainNameHeader.selector
        }" selector`
      )
      .toBe('Domain');
    expect(this.domainTypeHeader.isDisplayed())
      .withContext(
        `"${this.domainTypeHeader.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.domainTypeHeader.getText())
      .withContext(
        `${assertLog.incorrectText} for "${
          this.domainTypeHeader.selector
        }" selector`
      )
      .toBe('Type');
    expect(this.domains.length)
      .withContext(
        `${assertLog.incorrectNum} for "${this.domains.selector}" selector`
      )
      .toBeGreaterThan(0);
    expect(this.domains[0].$(this.label.selector).isDisplayed())
      .withContext(`"${this.label.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
    expect(this.domains[0].$(this.type.selector).isDisplayed())
      .withContext(`"${this.type.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
    expect(
      this.domains[0]
        .$(this.actionMenu.selector)
        .withContext(
          `"${this.actionMenu.selector}" selector ${assertLog.displayed}`
        )
        .isDisplayed()
    ).toBe(true);
    return this;
  }

  createDrawerElemsDisplay() {
    const createDrawerTitle = 'Add a new Domain';
    const submitMsg = 'Create';
    const cancelMsg = 'Cancel';

    expect(this.drawerTitle.getText())
      .withContext(
        `${assertLog.incorrectText} for "${this.drawerTitle.selector}" selector`
      )
      .toBe(createDrawerTitle);
    expect(this.createSoaEmail.isDisplayed())
      .withContext(
        `"${this.createSoaEmail.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.soaMailLabel.getText())
      .withContext(
        `${assertLog.incorrectText} for "${
          this.soaMailLabel.selector
        }" selector`
      )
      .toBe('SOA Email Address');
    expect(this.domainNameLabel.getText())
      .withContext(
        `${assertLog.incorrectText} for "${
          this.domainNameLabel.selector
        }" selector`
      )
      .toBe('Domain');
    expect(this.createDomainName.isDisplayed())
      .withContext(
        `"${this.createDomainName.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.submit.isDisplayed())
      .withContext(`"${this.submit.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
    expect(this.submit.getText())
      .withContext(
        `${assertLog.incorrectText} for "${this.submit.selector}" selector`
      )
      .toBe(submitMsg);
    expect(this.cancel.isDisplayed())
      .withContext(`"${this.cancel.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
    expect(this.cancel.getText())
      .withContext(
        `${assertLog.incorrectText} for "${this.cancel.selector}" selector`
      )
      .toBe(cancelMsg);
  }

  create(name, email, placeholder, tag = undefined) {
    console.log(`creating a domain`);
    let existingDomainsCount;
    if (placeholder) {
      this.createButton.click();
    } else {
      existingDomainsCount = this.domains.length;
      this.createIconLink.click();
    }

    this.drawerTitle.waitForDisplayed(constants.wait.normal);
    this.createDrawerElemsDisplay();
    this.createDomainName.$('input').setValue(name);
    this.createSoaEmail.$('input').setValue(email);
    if (tag) {
      this.addTagToTagInput(tag);
    }
    this.submit.click();
    this.domainDrawer.waitForDisplayed(constants.wait.normal, true);
    $(this.breadcrumbStaticText.selector).waitForDisplayed(
      constants.wait.normal
    );

    browser.waitUntil(function() {
      return browser.getUrl().includes('/domains/');
    }, constants.wait.normal);
    console.log(`domain "${name}" created`);
    //TODO find out if this code is needed
    // if (placeholder) {
    //     this.domainElem.waitForDisplayed(constants.wait.normal);
    // } else {
    //     browser.waitUntil(function() {
    //         return $$('[data-qa-domain-cell]').length > existingDomainsCount;
    //     }, constants.wait.normal, 'Domain failed to be created');
    // }
  }

  editDnsRecord(domain) {
    this.selectActionMenuItem(domain, 'Edit DNS Records');
    browser.waitUntil(function() {
      return browser.getUrl().includes('/records');
    }, constants.wait.normal);
    $(this.breadcrumbStaticText.selector).waitForDisplayed();
  }

  cloneDrawerElemsDisplay() {
    this.drawerTitle.waitForDisplayed();
    this.drawerClose.waitForDisplayed();
    expect(this.drawerTitle.getText())
      .withContext(
        `${assertLog.incorrectText} for "${this.drawerTitle.selector}" selector`
      )
      .toBe('Add a new Domain');
    expect(this.cloneDomainName.isDisplayed())
      .withContext(
        `"${this.cloneDomainName.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
  }

  clone(newDomainName) {
    this.cloneDrawerElemsDisplay();
    browser.trySetValue(
      `${this.cloneDomainName.selector} input`,
      newDomainName
    );
    this.submit.click();
    this.drawerBase.waitForDisplayed(constants.wait.normal, true);
    this.breadcrumbStaticText.waitForDisplayed(constants.wait.normal);
    expect(this.breadcrumbStaticText.getText())
      .withContext(
        `${assertLog.incorrectText} for "${
          this.breadcrumbStaticText.selector
        }" selector`
      )
      .toBe(newDomainName);
    this.breadcrumbBackLink.click();
    this.domainRow(newDomainName).waitForDisplayed(constants.wait.normal);
  }

  remove(domainName) {
    this.dialogTitle.waitForDisplayed();
    expect(this.dialogTitle.getText())
      .withContext(
        `${assertLog.incorrectText} for "${this.dialogTitle.selector}" selector`
      )
      .toBe(`Remove ${domainName}`);
    expect(this.submit.isDisplayed())
      .withContext(
        `"${this.blogCard.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.cancel.isDisplayed())
      .withContext(
        `"${this.blogCard.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    this.submit.click();
    this.dialogTitle.waitForDisplayed(constants.wait.normal, true);
    this.domainRow(domainName).waitForDisplayed(constants.wait.normal, true);
  }

  domainRow(domain) {
    const selector = this.domainElem.selector.replace(']', '');
    return $(`${selector}="${domain}"`);
  }

  getDomainTags(domain) {
    this.domainRow(domain).waitForDisplayed(constants.wait.normal);
    return this.domainRow(domain)
      .$$(this.tag.selector)
      .map(tag => tag.getText());
  }

  getDomainsInTagGroup(tag) {
    return this.tagHeader(tag)
      .$$(this.domainElem.selector)
      .map(domain => domain.getAttribute(this.domainAttribute));
  }

  getListedDomains() {
    return $$(this.domainElem.selector).map(domain =>
      domain.getAttribute(this.domainAttribute)
    );
  }

  sortTableByHeader(header) {
    const selector =
      header.toLowerCase() === 'domain'
        ? this.domainSortAtttribute
        : this.typeSortAttribure;
    const start = $(`[${selector}]`).getAttribute(selector);
    $(`[${selector}]>span`).click();
    browser.pause(1000);
    browser.waitUntil(() => {
      return $(`[${selector}]`).getAttribute(selector) !== start;
    }, constants.wait.normal);
    return $(`[${selector}]`).getAttribute(selector);
  }
}

export default new ListDomains();
