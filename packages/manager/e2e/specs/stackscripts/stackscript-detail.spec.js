const { constants } = require('../../constants');
import {
  apiDeleteMyStackScripts,
  timestamp,
  switchTab
} from '../../utils/common';
import ConfigureStackScripts from '../../pageobjects/configure-stackscript.page';
import ListStackScripts from '../../pageobjects/list-stackscripts.page';
import StackScriptDetail from '../../pageobjects/stackscripts/stackscript-detail.page';
import ConfigureLinode from '../../pageobjects/configure-linode';

// TODO needs to be refactored
xdescribe('StackScript - detail page and drawer suite', () => {
  let selectedStackScript;

  const getStackScriptDetailsFromRow = () => {
    browser.pause(500);
    browser.waitUntil(() => {
      return ListStackScripts.stackScriptRows.length > 0;
    }, constants.wait.normal);
    const titleAndAuthor = $$(
      `${ListStackScripts.stackScriptTitle.selector} h3`
    )[0].getText();
    const deploys = $$(
      ListStackScripts.stackScriptDeploys.selector
    )[0].getText();
    const compatibleDistributions = $$(
      ListStackScripts.stackScriptCompatibleDistributions.selector
    )[0]
      .$$('div')
      .map(distro => distro.getText())
      .filter(d => !d.includes(`\n+`));
    const getTitleAndAuthor = titleAndAuthor.split('/');
    const stackScriptDetails = {
      title: getTitleAndAuthor[1].trim(),
      author: getTitleAndAuthor[0].trim(),
      deploys: deploys,
      distributions: compatibleDistributions
    };
    return stackScriptDetails;
  };

  const verifyStackScriptDetailPageOrDrawer = (
    title,
    author,
    deployments,
    description,
    code
  ) => {
    expect(StackScriptDetail.stackScriptTitle(title).isDisplayed()).toBe(true);
    expect(StackScriptDetail.stackScriptAuthor(author).isDisplayed()).toBe(
      true
    );
    expect(StackScriptDetail.stackScriptDeployments.getText()).toContain(
      deployments
    );

    if (description) {
      expect(StackScriptDetail.stackScriptDescription.getText()).toContain(
        description
      );
    }
    if (code) {
      const scriptList = code.split('\n');
      expect(StackScriptDetail.getStackScriptCode()).toEqual(scriptList);
    }
  };

  beforeAll(() => {
    browser.url(constants.routes.stackscripts);
    ListStackScripts.baseElementsDisplay();
  });

  afterAll(() => {
    apiDeleteMyStackScripts();
  });

  describe('Community StackScript detail page', () => {
    beforeAll(() => {
      ListStackScripts.changeTab('Community StackScripts');
    });

    it('StackScript detail page displays', () => {
      selectedStackScript = getStackScriptDetailsFromRow();
      ListStackScripts.stackScriptDetailPage();
      StackScriptDetail.stackScriptDetailPageDisplays();
    });

    it('Verify StackScript details correspond to the row clicked', () => {
      verifyStackScriptDetailPageOrDrawer(
        selectedStackScript.title,
        selectedStackScript.author,
        selectedStackScript.deploys,
        selectedStackScript.distributions
      );
    });

    it('Breadcrumb link navigates back to StackScript landing', () => {
      //TODO un-skip once M3-3509 is fixed
      // expect(StackScriptDetail.breadcrumbStaticText.getText()).toEqual(
      //   `${selectedStackScript.author} / ${selectedStackScript.title}`
      // );
      StackScriptDetail.breadcrumbBackLink.click();
      ListStackScripts.baseElementsDisplay();
    });
  });

  describe('Created StackScript - detail page and detail drawer', () => {
    const stackConfig = {
      label: `AutoStackScript${timestamp()}`,
      description: 'test stackscript example',
      images: ['debian9', 'arch', 'containerlinux'],
      script: '#!/bin/bash\necho "Hello Linode"'
    };

    beforeAll(() => {
      ListStackScripts.create.click();
      ConfigureStackScripts.baseElementsDisplay();
      ConfigureStackScripts.configure(stackConfig);
    });
    it('does this before the other tests', () => {
      ListStackScripts.create.click();
      ConfigureStackScripts.baseElementsDisplay();
      ConfigureStackScripts.configure(stackConfig);
    });

    it('StackScript detail page displays for created StackScript', () => {
      ConfigureStackScripts.create(stackConfig);
      ListStackScripts.stackScriptRowByTitle(
        stackConfig.label
      ).waitForDisplayed(constants.wait.true);
      ListStackScripts.stackScriptDetailPage(stackConfig.label);
      StackScriptDetail.stackScriptDetailPageDisplays();
    });

    it('Verify StackScript detail page displays the correct data for created StackScript', () => {
      verifyStackScriptDetailPageOrDrawer(
        stackConfig.label,
        browser.options.testUser,
        '0',
        stackConfig.images,
        stackConfig.description,
        stackConfig.script
      );
      expect(StackScriptDetail.breadcrumbStaticText.getText()).toEqual(
        `${browser.options.testUser} / ${stackConfig.label}`
      );
    });

    it('Author text links to the community StackScripts page', () => {
      StackScriptDetail.stackScriptAuthor(browser.options.testUser)
        .$('a')
        .click();
      switchTab();
      expect(browser.getTitle()).toContain('StackScripts -');
      expect(browser.getUrl()).toContain(
        `linode.com/stackscripts/profile/${browser.options.testUser}`
      );
      browser.close();
      StackScriptDetail.stackScriptDetailPageDisplays();
    });

    it('Deploy to StackScript button navigates to configure Linode from StackScript page', () => {
      StackScriptDetail.deployStackScriptButton.click();
      browser.pause(2000);
      ConfigureLinode.selectFirstStackScript(
        stackConfig.label
      ).waitForDisplayed(constants.wait.normal);
      expect(
        ConfigureLinode.selectFirstStackScript(stackConfig.label).getAttribute(
          'data-qa-radio'
        )
      ).toBe('true');
    });

    it('StackScript detail drawer opens from the StackScript table on the configure Linode page', () => {
      ConfigureLinode.stackScripShowDetails(stackConfig.label);
      StackScriptDetail.stackScriptDetailDrawerDisplays();
    });

    it('StackScript detail drawer displays correct StackScript details ', () => {
      verifyStackScriptDetailPageOrDrawer(
        stackConfig.label,
        browser.options.testUser,
        '0',
        stackConfig.images,
        stackConfig.description,
        stackConfig.script
      );
      expect(StackScriptDetail.drawerTitle.getText()).toEqual(
        `${browser.options.testUser} / ${stackConfig.label}`
      );
      StackScriptDetail.drawerClose.click();
      ConfigureLinode.drawerBase.waitForDisplayed(constants.wait.normal, true);
    });

    it('Can dismiss selected StackScript', () => {
      const chooseFromOthers = $$('button span').find(
        it => it.getText() === 'Choose another StackScript'
      );
      expect(chooseFromOthers.isDisplayed()).toBe(true);
      chooseFromOthers.click();
      browser.pause(5000);
      ConfigureLinode.stackScriptsBaseElemsDisplay(
        $('[data-qa-create-from="Account StackScripts"]')
      );
    });
  });

  xdescribe('Community StackScript detail drawer', () => {
    beforeAll(() => {
      browser.url(constants.routes.stackscripts);
      ConfigureLinode.changeTab('Community StackScripts');
      browser.pause(500);
    });

    it('StackScript detail page displays', () => {
      selectedStackScript = getStackScriptDetailsFromRow();
      ConfigureLinode.stackScripShowDetails();
      StackScriptDetail.stackScriptDetailDrawerDisplays();
    });

    it('Verify StackScript drawer details correspond to the row clicked', () => {
      verifyStackScriptDetailPageOrDrawer(
        selectedStackScript.title,
        selectedStackScript.author,
        selectedStackScript.deploys,
        selectedStackScript.distributions
      );
      expect(StackScriptDetail.breadcrumbStaticText.getText()).toEqual(
        `${selectedStackScript.author} / ${selectedStackScript.title}`
      );
    });
  });
});
