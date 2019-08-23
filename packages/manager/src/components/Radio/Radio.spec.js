const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Radio Suite', () => {
  const component = 'Radio';
  const childStories = [
    'Interactive',
  ]
  const radio = '[data-qa-radio]';
  let radios;

  beforeAll(() => {
    navigateToStory(component, childStories[0]);
  });

  it('should display radio buttons', () => {
    $(radio).waitForDisplayed();
    radios = $$(radio);
    expect(radios.length)
      .withContext(`Should be 4 buttons`)
      .toEqual(4)
    radios.forEach(r => expect(r.isDisplayed())
      .withContext(`Radio button should be displayed`)
      .toBe(true));
  });

  it('should check enabled buttons on click', () => {
    const enabledRadios = $$(radio).filter(r => !r.getAttribute('class').includes('Mui-disabled'));
    enabledRadios.forEach(r => {
      r.click();

      $('.Mui-checked circle#a').waitForExist(undefined);
      expect(r.getAttribute('class').includes('Mui-checked'))
        .withContext(`radio button should be enabled`)
        .toBe(true);
    });
  });

  it('should not check disabled buttons on click', () => {
    const disabledRadios = $$(radio).filter(r => r.getAttribute('class').includes('Mui-disabled'));
    disabledRadios.forEach(r => {
      r.$('..').click();
      expect(r.getAttribute('class').includes('Mui-disabled'))
        .withContext(`Radio button should not be enabled`)
        .toBe(true);
    });
  });

  it('should have a label as a parent', () => {
    radios.forEach(r => {
      expect(r.$('..').getTagName())
        .withContext(`Missing parent label`)
        .toBe('label');
    });
  });

  it('should have correct colors', () => {
    const warningColor = 'rgb(255,208,2)';
    const errorColor = 'rgb(205,34,39)';

    navigateToStory(component, childStories[0]);

    //check the color of warning notice circle
    expect($('[variant=warning] circle').getCSSProperty('stroke').value)
      .withContext(`Warning notice color should be ${warningColor}`)
      .toBe(warningColor);
    //check the color of the error notice circle
    expect($('[variant=error] circle').getCSSProperty('stroke').value)
      .withContext(`Error notice color should be ${errorColor}`)
      .toBe(errorColor);
  })
});
