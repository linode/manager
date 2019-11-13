const { constants } = require('../../constants');

import { apiDeleteMyStackScripts } from '../../utils/common';

import ConfigureStackScripts from '../../pageobjects/configure-stackscript.page';
import ListStackScripts from '../../pageobjects/list-stackscripts.page';

// TODO this functionality has changed and needs to be refactored
xdescribe('StackScript - Edit Existing', () => {
  const stackConfig = {
    label: `${new Date().getTime()}-MyStackScript`,
    description: 'test stackscript example',
    revisionNote: new Date().getTime(),
    script: '#!/bin/bash',
    images: ['debian9']
  };

  const newConfig = {
    label: `someNewLabel`,
    description: 'new description!',
    revisionNote: 'new revision',
    script: '#!/bin/bash \n echo fooooo'
  };

  function assertOriginalDisplays() {
    const compatibleImages = ConfigureStackScripts.imageTags.filter(t =>
      t.getText().includes(stackConfig.images[0])
    );
    const description = ConfigureStackScripts.description
      .$('textarea')
      .getValue();
    const script = ConfigureStackScripts.script.$('textarea').getText();
    const label = ConfigureStackScripts.label.$('input').getValue();

    expect(description).toBe(stackConfig.description);
    expect(compatibleImages.length).toBe(1);
    expect(script).toBe(stackConfig.script);
    expect(label).toBe(stackConfig.label);
  }

  beforeAll(() => {
    browser.url(constants.routes.stackscripts);
    ListStackScripts.baseElementsDisplay();
    ListStackScripts.create.click();
    ConfigureStackScripts.createHeader.waitForDisplayed(constants.wait.normal);
    ConfigureStackScripts.configure(stackConfig);
    ConfigureStackScripts.create(stackConfig);
  });

  afterAll(() => {
    apiDeleteMyStackScripts();
  });

  it('should display edit action menu option', () => {
    ListStackScripts.stackScriptRow.waitForDisplayed(constants.wait.normal);
    ListStackScripts.stackScriptRows[0].$('[data-qa-action-menu]').click();
    $('[data-qa-action-menu-item="Edit"]').waitForDisplayed(
      constants.wait.normal
    );
  });

  it('should display edit stackscript page', () => {
    $('[data-qa-action-menu-item="Edit"]').click();
    ConfigureStackScripts.editElementsDisplay();

    assertOriginalDisplays();
  });

  it('should remove all compatible images', () => {
    ConfigureStackScripts.removeImage(stackConfig.images[0]);
  });

  it('should update the config fields of the stackscript with new configuration', () => {
    ConfigureStackScripts.configure(newConfig);
  });

  it('should clear the changes on cancel', () => {
    ConfigureStackScripts.cancel();
    assertOriginalDisplays();
  });

  it('should successfully update the name of the stackscript', () => {
    ConfigureStackScripts.configure(newConfig);
    ConfigureStackScripts.create(newConfig, true);
  });
});
