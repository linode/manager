const { constants } = require('../../constants');
import { updateProfile, getProfile } from '../../utils/common';
import Display from '../../pageobjects/profile/display.page';

describe('Profile - Update Display Settings', () => {
  let resetProfileBody;

  beforeAll(() => {
    browser.url(constants.routes.profile.view);
    const startProfile = getProfile();
    resetProfileBody = {
      email: startProfile.email,
      timezone: startProfile.timezone
    };
  });

  afterAll(() => {
    updateProfile(resetProfileBody);
  });

  //TODO redo this suite or keep in Jest
  xit('Should display the update display settings view', () => {
    Display.baseElementsDisplay();
  });

  it('Display name should not be editable', () => {
    expect(Display.userName.getAttribute('disabled')).toBe('true');
  });

  it('Email should be an editable field', () => {
    expect(Display.userEmail.getAttribute('disabled')).toBe(null);
  });

  xit('Invalid emails can not be saved', () => {
    browser.trySetValue(Display.userEmail.selector, 'fakeemail');
    Display.submitButton.click();
    Display.invalidEmailWarning.waitForDisplayed(constants.wait.normal);
    expect(Display.invalidEmailWarning.getText()).toEqual(
      'email must be a valid email'
    );
    Display.cancelButton.click();
  });

  it('Valid email can be saved', () => {
    const validEmail = 'test@gmail.com';
    browser.trySetValue(Display.userEmail.selector, validEmail);
    Display.submitButton.click();
    Display.waitForNotice('Email address updated.');
    expect(getProfile().email).toBe(validEmail);
  });

  xit('Change user timezone', () => {
    const gmtOffset = '(GMT -5:00) Eastern Time - New York';
    const timeZoneResponse = 'America/New_York';
    expect(Display.timeZoneSelect.isDisplayed()).toBe(true);
    Display.timeZoneSelect
      .$('..')
      .$('input')
      .setValue(gmtOffset);
    Display.selectOptions[0].waitForDisplayed(constants.wait.normal);
    Display.selectOptions[0].click(0);
    Display.saveTimeZone.click();
    Display.waitForNotice('Account timezone updated.');
    expect(getProfile().timezone).toBe(timeZoneResponse);
  });
});
