const { constants } = require('../constants');
const { assertLog } = require('../utils/assertionLog');

export default class Page {
  get dialogTitle() {
    return $('[data-qa-dialog-title]');
  }
  get dialogContent() {
    return $('[data-qa-dialog-content]');
  }
  get dialogConfirm() {
    return $('[data-qa-confirm-cancel]');
  }
  get dialogConfirmDelete() {
    return $('[data-qa-confirm-delete]');
  }
  get dialogConfirmCancel() {
    return $('[data-qa-cancel-delete]');
  }
  get dialogCancel() {
    return $('[data-qa-cancel-cancel]');
  }
  get sidebarTitle() {
    return $('[data-qa-sidebar-title]');
  }
  get drawerTitle() {
    return $('[data-qa-drawer-title]');
  }
  get drawerClose() {
    return $('[data-qa-close-drawer]');
  }
  get docs() {
    return $$('[data-qa-doc]');
  }
  get toast() {
    return $('[data-qa-toast]');
  }
  get userMenu() {
    return $('[data-qa-user-menu]');
  }
  get logoutButton() {
    return $('[data-qa-menu-link="Log Out"]');
  }
  get profileButton() {
    return $('[data-qa-menu-link="My Profile"]');
  }
  get globalCreate() {
    return $('[data-qa-add-new-menu-button]');
  }
  get addVolumeMenu() {
    return $('[data-qa-add-new-menu="Volume"]');
  }
  get addLinodeMenu() {
    return $('[data-qa-add-new-menu="Linode"]');
  }
  get addNodeBalancerMenu() {
    return $('[data-qa-add-new-menu="NodeBalancer"]');
  }
  get notice() {
    return $('[data-qa-notice]');
  }
  get notices() {
    return $$('[data-qa-notice]');
  }
  get panels() {
    return $$('[data-qa-panel-summary]');
  }
  get progressBar() {
    return $('[data-qa-circle-progress]');
  }
  get actionMenu() {
    return $('[data-qa-action-menu]');
  }
  get actionMenuItem() {
    return $('[data-qa-action-menu-item]');
  }
  get selectOptions() {
    return $$('[data-qa-option]');
  }
  get selectOption() {
    return $('[data-qa-option]');
  }
  get multiOption() {
    return $('[data-qa-multi-option]');
  }
  get multiSelect() {
    return $('[data-qa-multi-select]');
  }
  get toggleOption() {
    return $('[data-qa-toggle]');
  }
  get tag() {
    return $('[data-qa-tag]');
  }
  get tags() {
    return $$('[data-qa-tag]');
  }
  get addTag() {
    return $('[data-qa-add-tag]');
  }
  get deleteTag() {
    return $('[data-qa-delete-tag]');
  }
  get totalTags() {
    return $('[data-qa-total-tags]');
  }
  get helpButton() {
    return $('[data-qa-help-button]');
  }
  get tagsMultiSelect() {
    return $('[data-qa-multi-select="Type to choose or create a tag."]');
  }
  get popoverMsg() {
    return $('[role="tooltip"]');
  }
  get submitButton() {
    return $('[data-qa-submit]');
  }
  get cancelButton() {
    return $('[data-qa-cancel]');
  }
  get linearProgress() {
    return $('[data-qa-linear-progress]');
  }
  get drawerBase() {
    return $('[data-qa-drawer]');
  }
  get drawerPrice() {
    return $('[qa-data-price]');
  }
  get drawerBillingInterval() {
    return $('[qa-data-billing-interval]');
  }
  get enableAllBackups() {
    return $('[data-qa-backup-existing]');
  }
  get basicSelect() {
    return '[data-qa-select]';
  }
  get pageTitle() {
    return $('[data-qa-title]');
  }
  get openImportDrawerButton() {
    return $('[data-qa-open-import-drawer-button]');
  }
  get breadcrumbEditableText() {
    return $('[data-qa-editable-text]');
  }
  get breadcrumbStaticText() {
    return $('[data-qa-label-text]');
  }
  get breadcrumbBackLink() {
    return $('[data-qa-link]');
  }
  get breadCrumbLinkText() {
    return $('[data-qa-link-text]');
  }
  get breadcrumbEditButton() {
    return $('[data-qa-edit-button]');
  }
  get breadcrumbSaveEdit() {
    return $('[data-qa-save-edit]');
  }
  get breadcrumbCancelEdit() {
    return $('[data-qa-cancel-edit]');
  }
  get groupByTagsToggle() {
    return $$('span')
      .find(it => it.getText().includes('Group by Tag'))
      .$('..');
  }
  get tagHeaderSelector() {
    return 'data-qa-tag-header';
  }
  get tagHeaders() {
    return $$(`[${this.tagHeaderSelector}]`);
  }
  get toolTipIcon() {
    return $('[data-qa-tooltip-icon]');
  }
  get toolTipMessage() {
    return $('[data-qa-tooltip]');
  }
  get enterKey() {
    return '\uE007';
  }
  get upArrowKey() {
    return '\ue013';
  }

  //Shared in create linode and rebuild flow
  get selectImageHeader() {
    return $('[data-qa-tp="Choose a Distribution"]');
  }
  get imageTabs() {
    return $$('[data-qa-tp="Choose a Distribution"] [data-qa-tab]');
  }
  get images() {
    return $$('[data-qa-tp="Choose a Distribution"] [data-qa-selection-card]');
  }
  get imageName() {
    return $('[data-qa-enhanced-select] #images');
  }

  logout() {
    this.userMenu.waitForDisplayed(constants.wait.normal);
    this.userMenu.click();
    this.logoutButton.waitForDisplayed(constants.wait.normal);
    this.logoutButton.click();
    this.logoutButton.waitForDisplayed(constants.wait.normal, true);
    this.globalCreate.waitForDisplayed(constants.wait.normal, true);

    browser.waitUntil(
      function() {
        return browser.getUrl().includes('/login');
      },
      constants.wait.normal,
      'Failed to redirect to login page on log out'
    );
  }

  chooseSelectOption(selectElement, selectOption) {
    selectElement.click();
    $('[data-value]').waitForDisplayed();

    if (Number.isInteger(selectOption)) {
      const optionElement = $$('[data-value]')[selectOption];
      optionElement.click();
      optionElement.waitForDisplayed(constants.wait.normal, true);
      return;
    }

    $(`[data-value="${selectOption}"]`).click();
    $(`[data-value="${selectOption}"]`).waitForDisplayed(
      constants.wait.normal,
      true
    );
  }

  expandPanel(title) {
    console.log(`expanding "${title}" panel`);
    $(`[data-qa-panel-summary="${title}"]`).waitForDisplayed(
      constants.wait.normal
    );
    $(`[data-qa-panel-summary="${title}"]`).click();

    browser.waitUntil(
      function() {
        return $(`[data-qa-panel-summary="${title}"]`)
          .getAttribute('aria-expanded')
          .includes('true');
      },
      constants.wait.normal,
      'Panel failed to expand'
    );
  }

  expandPanels(numberOfPanels) {
    browser.waitUntil(
      function() {
        return $$('[data-qa-panel-summary]').length === numberOfPanels;
      },
      constants.wait.normal,
      'Number of expected panels failed to display'
    );

    this.panels.forEach(panel => {
      panel.click();
      // throttle expanding panels with a pause
      browser.pause(500);
    });
  }

  selectGlobalCreateItem(menuItem) {
    console.log(`setting global create item to: ${menuItem}`);
    this.globalCreate.waitForDisplayed(constants.wait.normal);
    $('[data-qa-add-new-menu-button]').waitForDisplayed(constants.wait.normal);
    $('[data-qa-add-new-menu-button]').click();
    $(`[data-qa-add-new-menu="${menuItem}"]`).waitForDisplayed(
      constants.wait.short
    );
    console.log(`selecting ${menuItem} from menu`);
    $(`[data-qa-add-new-menu="${menuItem}"]`).click();
    console.log(`waiting for add new menu button to not be displayed`);
    $(`[data-qa-add-new-menu="${menuItem}"]`).waitForDisplayed(
      constants.wait.normal,
      true
    );
    console.log(`menu item ${menuItem} has been selected`);
  }

  waitForNotice(noticeMsg, timeout = 10000, opposite = false) {
    return browser.waitUntil(
      function() {
        const noticeRegex = new RegExp(noticeMsg, 'ig');
        const noticeMsgDisplays = $$('[data-qa-notice]').filter(
          n => !!n.getText().match(noticeRegex)
        );

        if (opposite) {
          return noticeMsgDisplays.length === 0;
        }

        return noticeMsgDisplays.length > 0;
      },
      timeout,
      `${noticeMsg} failed to display after ${timeout}ms`
    );
  }

  assertDocsDisplay() {
    const sidebarTitle = this.sidebarTitle.getText();
    const docs = this.docs;
    expect(docs.length).toBe(2);
    expect(sidebarTitle).toBe('Linode Docs');
  }

  toastDisplays(expectedMessage, timeout = constants.wait.normal, wait = true) {
    this.toast.waitForDisplayed(timeout);
    let toastMessage;
    console.log('toast message: ' + $(this.toast.selector).getText());
    if (wait) {
      browser.waitUntil(
        () => {
          toastMessage = $$(this.toast.selector).find(
            toast => toast.getText() === expectedMessage
          );
          return toastMessage;
        },
        timeout,
        `waited for toast text to equal: ${expectedMessage}`
      );
      toastMessage.waitForDisplayed(timeout, true);
    } else {
      this.toast.waitForDisplayed(timeout, true);
    }
  }

  openActionMenu(actionMenuRow) {
    $(`${actionMenuRow.selector} ${this.actionMenu.selector}`).waitForDisplayed(
      constants.wait.normal
    );
    try {
      actionMenuRow.$(this.actionMenu.selector).click();
      browser.waitUntil(
        () => {
          return $$('[data-qa-action-menu-item]').length > 0;
        },
        constants.wait.normal,
        'Menu items failed to show up'
      );
    } catch (e) {
      /* Our attempt clicking the action menu bombed, most likely because some
      // Element in the UI is covering it. JS Click to force the click instead
      */
      browser.jsClick(`${actionMenuRow.selector} ${this.actionMenu.selector}`);
      browser.waitUntil(
        () => {
          return $$('[data-qa-action-menu-item]').length > 0;
        },
        constants.wait.normal,
        'Menu items failed to show up'
      );
    }
  }

  selectActionMenuItem(tableCell, item) {
    this.openActionMenu(tableCell);
    browser.jsClick(`[data-qa-action-menu-item="${item}"]`);
  }

  selectActionMenuItemV2(tableCellSelector, item, index = 0) {
    const actionMenu = $$(`${tableCellSelector} ${this.actionMenu.selector}`)[
      index
    ];
    actionMenu.click();
    $(this.actionMenuItem.selector).waitForDisplayed(constants.wait.normal);
    const trimActionMenu = this.actionMenuItem.selector.replace(']', '');
    browser.jsClick(`${trimActionMenu}="${item}"]`);
  }

  actionMenuOptionExists(actionMenuRow, options) {
    this.openActionMenu(actionMenuRow);
    options.forEach(option => {
      expect($(`[data-qa-action-menu-item="${option}"]`).isDisplayed())
        .withContext(
          `"${this.protocolSelect.selector}" selector ${assertLog.displayed}`
        )
        .toBe(true);
    });
  }

  closeDrawer() {
    this.drawerClose.click();
    this.drawerTitle.waitForDisplayed(constants.wait.normal, true);
  }

  changeTab(tab) {
    console.log(`changing to "${tab}" tab`);
    const tabElementSelector = `[data-qa-tab="${tab}"]`;
    $(tabElementSelector).waitForDisplayed(constants.wait.normal);
    browser.jsClick(tabElementSelector);
    browser.waitUntil(
      function() {
        return $(`[data-qa-tab="${tab}"]`)
          .getAttribute('aria-selected')
          .includes('true');
      },
      constants.wait.normal,
      'Failed to change tab'
    );
    $('[data-qa-circle-progress]').waitForDisplayed(
      constants.wait.normal,
      true
    );
    return this;
  }

  removeTag(label) {
    const matchingTags = this.tags.filter(t =>
      t.getAttribute('data-qa-tag').includes(label)
    );

    matchingTags.forEach(t => {
      const tagName = t.getText();
      t.$(this.deleteTag.selector).click();
      $(`[data-qa-tag="${tagName}"]`).waitForDisplayed(
        constants.wait.normal,
        true
      );
    });
  }

  addTagToTagInput(tagName) {
    this.tagsMultiSelect
      .$('..')
      .$('input')
      .setValue(tagName);
    this.selectOptions[0].waitForDisplayed(constants.wait.normal);
    this.selectOptions[0].click();
    this.multiOption.waitForDisplayed(constants.wait.normal);
    expect(this.multiOption.getText())
      .withContext(
        `${assertLog.incorrectText} for "${this.multiOption.selector}" selector`
      )
      .toBe(tagName);
  }

  addTagToTagPanel(tagName) {
    const expectedCount = this.tags.length + 1;
    this.addTag.click();
    const createTagSelect = $$('[data-qa-enhanced-select]')[1]
      .$('..')
      .$('input');
    createTagSelect.waitForDisplayed(constants.wait.normal);
    createTagSelect.setValue(tagName);
    createTagSelect.addValue(this.enterKey);
    browser.waitUntil(() => {
      return this.tags.length === expectedCount;
    }, constants.wait.normal);
  }

  checkTagsApplied(expectedTags) {
    browser.waitUntil(() => {
      return this.tags.length > 0;
    }, constants.wait.normal);
    const appliedTags = this.tags.map(tag => tag.getText());
    expectedTags.forEach(tag => {
      expect(appliedTags.includes(tag))
        .withContext(`${assertLog.incorrectTag} "${tag}"`)
        .toBe(true);
    });
  }

  addIcon(iconText) {
    return $(`[data-qa-icon-text-link="${iconText}"]`);
  }

  tagHeader(tag) {
    return $(`[${this.tagHeaderSelector}=${tag}]`);
  }

  groupByTags(group) {
    this.groupByTagsToggle.click();
    browser.waitUntil(() => {
      return group ? this.tagHeaders.length > 0 : this.tagHeaders.length === 0;
    }, constants.wait.normal);
  }

  tagGroupsInAlphabeticalOrder(tags) {
    const tagHeaders = this.tagHeaders.map(header =>
      header.getAttribute(this.tagHeaderSelector)
    );
    expect(tagHeaders)
      .withContext(`"${tagHeaders}" ${assertLog.incorrectOrder}`)
      .toEqual(tagHeaders.sort());
  }
}
