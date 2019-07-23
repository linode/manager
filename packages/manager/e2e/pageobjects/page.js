const { constants } = require('../constants');

export default class Page {
    get dialogTitle() { return $('[data-qa-dialog-title]'); }
    get dialogContent() { return $('[data-qa-dialog-content]'); }
    get dialogConfirm() { return $('[data-qa-confirm-cancel]'); }
    get dialogConfirmDelete() { return $('[data-qa-confirm-delete]'); }
    get dialogConfirmCancel() { return $('[data-qa-cancel-delete]'); }
    get dialogCancel() { return $('[data-qa-cancel-cancel]'); }
    get sidebarTitle() { return $('[data-qa-sidebar-title]'); }
    get drawerTitle() { return $('[data-qa-drawer-title]'); }
    get drawerClose() { return $('[data-qa-close-drawer]'); }
    get docs() { return $$('[data-qa-doc]'); }
    get toast() { return $('[data-qa-toast]'); }
    get toastMsg() { return $('[data-qa-toast-message]'); }
    get userMenu() { return $('[data-qa-user-menu]'); }
    get logoutButton() { return $('[data-qa-menu-link="Log Out"]'); }
    get profileButton() { return $('[data-qa-menu-link="My Profile"]'); }
    get globalCreate() { return $('[data-qa-add-new-menu-button]'); }
    get addVolumeMenu() { return $('[data-qa-add-new-menu="Volume"]'); }
    get addLinodeMenu() { return $('[data-qa-add-new-menu="Linode"]'); }
    get addNodeBalancerMenu() { return $('[data-qa-add-new-menu="NodeBalancer"]'); }
    get notice() { return $('[data-qa-notice]'); }
    get notices() { return $$('[data-qa-notice]'); }
    get panels() { return $$('[data-qa-panel-summary]'); }
    get progressBar() { return $('[data-qa-circle-progress]'); }
    get actionMenu() { return $('[data-qa-action-menu]'); }
    get actionMenuItem() { return $('[data-qa-action-menu-item]'); }
    get selectOptions() { return $$('[data-qa-option]'); }
    get selectOption() { return $('[data-qa-option]') };
    get multiOption() { return $('[data-qa-multi-option]'); }
    get multiSelect() { return $('[data-qa-multi-select]'); }
    get toggleOption() { return $('[data-qa-toggle]'); }
    get tag() { return $('[data-qa-tag]'); }
    get tags() { return $$('[data-qa-tag]'); }
    get addTag() { return $('[data-qa-add-tag]'); }
    get deleteTag() { return $('[data-qa-delete-tag]'); }
    get totalTags() { return $('[data-qa-total-tags]'); }
    get helpButton() { return $('[data-qa-help-button]'); }
    get tagsMultiSelect() { return $('[data-qa-multi-select="Type to choose or create a tag."]'); }
    get popoverMsg() { return $('[role="tooltip"]'); }
    get submitButton () { return $('[data-qa-submit]'); }
    get cancelButton() { return $('[data-qa-cancel]'); }
    get linearProgress() { return $('[data-qa-linear-progress]'); }
    get drawerBase() { return $('[data-qa-drawer]'); }
    get drawerPrice() { return $('[qa-data-price]'); }
    get drawerBillingInterval() { return $('[qa-data-billing-interval]'); }
    get enableAllBackups() { return $('[data-qa-backup-existing]'); }
    get basicSelect() { return '[data-qa-select]'; }
    get pageTitle() { return $('[data-qa-title]'); }
    get openImportDrawerButton() { return $('[data-qa-open-import-drawer-button]'); }
    get breadcrumbEditableText() { return $('[data-qa-editable-text]'); }
    get breadcrumbStaticText() { return $('[data-qa-label-title]'); }
    get breadcrumbBackLink() { return $('[data-qa-link]'); }
    get breadCrumbLinkText() { return $('[data-qa-link-text]'); }
    get breadcrumbEditButton() { return $('[data-qa-edit-button]'); }
    get breadcrumbSaveEdit() { return $('[data-qa-save-edit]'); }
    get breadcrumbCancelEdit() { return $('[data-qa-cancel-edit]'); }
    get groupByTagsToggle() { return $$('span').find(it => it.getText().includes('Group by Tag')).$('..'); }
    get tagHeaderSelector() { return 'data-qa-tag-header'; }
    get tagHeaders() { return $$(`[${this.tagHeaderSelector}]`); }
    get toolTipIcon() { return $('[data-qa-tooltip-icon]'); }
    get toolTipMessage() { return $('[data-qa-tooltip]'); }
    get enterKey() { return '\uE007'; }
    get upArrowKey() { return '\ue013'; }

    //Shared in create linode and rebuild flow
    get selectImageHeader() { return $('[data-qa-tp="Select Image"]'); }
    get imageTabs() { return  $$('[data-qa-tp="Select Image"] [data-qa-tab]'); }
    get images() { return $$('[data-qa-tp="Select Image"] [data-qa-selection-card]'); }
    get imageNames() { return $$('[data-qa-tp="Select Image"] [data-qa-select-card-heading]'); }

    logout() {
        this.userMenu.waitForVisible(constants.wait.normal);
        this.userMenu.click();
        this.logoutButton.waitForVisible(constants.wait.normal);
        this.logoutButton.click();
        this.logoutButton.waitForVisible(constants.wait.normal, true);
        this.globalCreate.waitForVisible(constants.wait.normal, true);

        browser.waitUntil(function() {
            return browser.getUrl().includes('/login');
        }, constants.wait.normal, 'Failed to redirect to login page on log out');
    }

    chooseSelectOption(selectElement, selectOption) {
        selectElement.click();
        browser.waitForVisible('[data-value]');

        if (Number.isInteger(selectOption)) {
            const optionElement = $$('[data-value]')[selectOption];
            optionElement.click();
            optionElement.waitForVisible(constants.wait.normal, true);
            return;
        }

        $(`[data-value="${selectOption}"]`).click();
        browser.waitForVisible(`[data-value="${selectOption}"]`, constants.wait.normal, true);
    }

    expandPanel(title) {
        $(`[data-qa-panel-summary="${title}"]`).waitForVisible(constants.wait.normal);
        $(`[data-qa-panel-summary="${title}"]`).click();

        browser.waitUntil(function() {
            return $(`[data-qa-panel-summary="${title}"]`)
                .getAttribute('aria-expanded').includes('true');
        }, constants.wait.normal, 'Panel failed to expand');
    }

    expandPanels(numberOfPanels) {
        browser.waitUntil(function() {
            return $$('[data-qa-panel-summary]').length === numberOfPanels
        }, constants.wait.normal, 'Number of expected panels failed to display');

        this.panels.forEach(panel => {
            panel.click();
            // throttle expanding panels with a pause
            browser.pause(500);
        });

    }

    selectGlobalCreateItem(menuItem) {
        this.globalCreate.waitForVisible(constants.wait.normal);
        browser.tryClick(this.globalCreate.selector);
        browser.waitForVisible('[data-qa-add-new-menu]', constants.wait.normal);
        browser.click(`[data-qa-add-new-menu="${menuItem}"]`);
        browser.waitForVisible('[data-qa-add-new-menu]', constants.wait.normal, true);
    }

    waitForNotice(noticeMsg, timeout=10000, opposite=false) {
        return browser.waitUntil(function() {
            const noticeRegex = new RegExp(noticeMsg, 'ig');
            const noticeMsgDisplays = $$('[data-qa-notice]')
                .filter(n => !!n.getText().match(noticeRegex));

                if (opposite) {
                    return noticeMsgDisplays.length === 0;
                }
                
            return noticeMsgDisplays.length > 0;
        }, timeout, `${noticeMsg} failed to display after ${timeout}ms`);
    }

    assertDocsDisplay() {
        const sidebarTitle = this.sidebarTitle.getText();
        const docs = this.docs;
        expect(docs.length).toBe(2);
        expect(sidebarTitle).toBe('Linode Docs');
    }

    toastDisplays(expectedMessage, timeout=constants.wait.normal, wait=true) {
        this.toast.waitForVisible(timeout);
        let toastMessage;
        if(wait){
            browser.waitUntil(() => {
                toastMessage = $$(this.toast.selector).find(toast => toast.getText() === expectedMessage);
                return toastMessage;
            },timeout);
            toastMessage.waitForVisible(timeout, true);
        }else{
            this.toast.waitForVisible(timeout, true);
        }

    }

    openActionMenu(actionMenuRow) {
        browser.waitForVisible(`${actionMenuRow.selector} ${this.actionMenu.selector}`, constants.wait.normal);
        // actionMenuRow.$(this.actionMenu.selector).waitForVisible(constants.wait.normal);
        try {
          actionMenuRow.$(this.actionMenu.selector).click();
          browser.waitUntil(() => {
              return $$('[data-qa-action-menu-item]').length > 0;
          }, constants.wait.normal, "Menu items failed to show up");
        } catch (e) {
                /* Our attempt clicking the action menu bombed, most likely because some
                // Element in the UI is covering it. JS Click to force the click instead
                */
                browser.jsClick(`${actionMenuRow.selector} ${this.actionMenu.selector}`);
                browser.waitUntil(() => {
                    return $$('[data-qa-action-menu-item]').length > 0;
                }, constants.wait.normal, "Menu items failed to show up");
        }
    }

    selectActionMenuItem(tableCell, item) {
        this.openActionMenu(tableCell);
        browser.jsClick(`[data-qa-action-menu-item="${item}"]`);
    }

    selectActionMenuItemV2(tableCellSelector, item, index=0){
      const actionMenu = $$(`${tableCellSelector} ${this.actionMenu.selector}`)[index];
      actionMenu.click();
      browser.waitForVisible(this.actionMenuItem.selector, constants.wait.normal);
      const trimActionMenu = this.actionMenuItem.selector.replace(']', '');
      browser.jsClick(`${trimActionMenu}="${item}"]`);
    }

    actionMenuOptionExists(actionMenuRow,options) {
        this.openActionMenu(actionMenuRow);
        options.forEach((option) => {
            expect($(`[data-qa-action-menu-item="${option}"]`).isVisible()).toBe(true)
        });
    }

    closeDrawer() {
        this.drawerClose.click();
        this.drawerTitle.waitForVisible(constants.wait.normal, true);
    }

    changeTab(tab) {
        const tabElementSelector = `[data-qa-tab="${tab}"]`;
        $(tabElementSelector).waitForVisible(constants.wait.normal);
        browser.jsClick(tabElementSelector);
        browser.waitUntil(function() {
            return browser
                .getAttribute(`[data-qa-tab="${tab}"]`, 'aria-selected').includes('true');
        }, constants.wait.normal, 'Failed to change tab');
        browser.waitForVisible('[data-qa-circle-progress]', constants.wait.normal, true);
        return this;
    }

    removeTag(label) {
        const matchingTags = this.tags.filter(t => t.getAttribute('data-qa-tag').includes(label));

        matchingTags.forEach(t => {
            const tagName = t.getText();
            t.$(this.deleteTag.selector).click();
            browser.waitForVisible(`[data-qa-tag="${tagName}"]`, constants.wait.normal, true);
        });
    }

    addTagToTagInput(tagName){
        this.tagsMultiSelect.$('..').$('input').setValue(tagName);
        this.selectOptions[0].waitForVisible(constants.wait.normal);
        this.selectOptions[0].click();
        this.multiOption.waitForVisible(constants.wait.normal);
        expect(this.multiOption.getText()).toBe(tagName);
    }

    addTagToTagPanel(tagName){
        const expectedCount = this.tags.length + 1
        this.addTag.click();
        const createTagSelect = $$('[data-qa-enhanced-select]')[1].$('..').$('input');
        createTagSelect.waitForVisible(constants.wait.normal);
        createTagSelect.setValue(tagName);
        createTagSelect.addValue(this.enterKey);
        browser.waitUntil(() => {
            return this.tags.length === expectedCount;
        }, constants.wait.normal);
    }

    checkTagsApplied(expectedTags){
        browser.waitUntil(() => {
            return this.tags.length > 0;
        },constants.wait.normal);
        const appliedTags = this.tags.map(tag => tag.getText());
        expectedTags.forEach((tag) => {
            expect(appliedTags.includes(tag)).toBe(true);
        });
    }

    addIcon(iconText){
        return $(`[data-qa-icon-text-link="${iconText}"]`);
    }

    tagHeader(tag){
        return $(`[${this.tagHeaderSelector}=${tag}]`);
    }

    groupByTags(group){
        this.groupByTagsToggle.click();
        browser.waitUntil(() => {
          return group ? this.tagHeaders.length > 0 : this.tagHeaders.length === 0;
        },constants.wait.normal);
    }

    tagGroupsInAlphabeticalOrder(tags){
        const tagHeaders = this.tagHeaders
            .map(header => header.getAttribute(this.tagHeaderSelector));
        expect(tagHeaders).toEqual(tagHeaders.sort());
    }
}
