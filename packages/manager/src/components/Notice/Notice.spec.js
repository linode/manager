const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Notice Suite', () => {
  const component = 'Notice';
  const childStories = [
    'All Notices',
  ];

  let notices;

  beforeAll(() => {
    navigateToStory(component, childStories[0]);
  });

  it('should display all the notices', () => {
    notices = $$('[data-qa-notice]');
    expect(notices.length).toEqual(7);
  });

  it('should display an error notice', () => {
    const errorNotices = notices.filter(n => {
      const errorMsg = 'This is an error notice';
      return n.getAttribute('class').includes('error') && n.isDisplayed() && n.getText().includes(errorMsg);
    });
    expect(errorNotices.length)
      .withContext(`Should only be one error notice`)
      .toEqual(1);
  });

  it('should display a warning notice', () => {
    const warningNotices = notices.filter(n => {
      const warningMsg = 'This is a warning notice';
      return n.getAttribute('class').includes('warning') && n.isDisplayed() && n.getText().includes(warningMsg);
    });
    expect(warningNotices.length)
      .withContext(`Should only be one warning notice`)
      .toEqual(1);
  });

  it('should display a success notice', () => {
    const successNotices = notices.filter(n => {
      const successMsg = 'This is a success notice';
      return n.getAttribute('class').includes('success') && n.isDisplayed() && n.getText().includes(successMsg);
    });
    expect(successNotices.length)
      .withContext(`Should only be one success notice`)
      .toEqual(1);
  });

  it('should display an important error notice', () => {
    const errorNotices = notices.filter(n => {
      const errorMsg = 'This is an important error notice';
      return n.getAttribute('class').includes('error') && n.isDisplayed() && n.getText().includes(errorMsg);
    });
    expect(errorNotices.length)
      .withContext(`Should only be one import error notice`)
      .toEqual(1);
    expect($('svg[data-qa-error-img]').isDisplayed())
      .withContext(`should display a error svg`)
      .toBe(true);
  });

  it('should display an important warning notice', () => {
    const warningNotices = notices.filter(n => {
        const warningMsg = 'This is an important warning notice';
        return n.getAttribute('class').includes('warning') && n.isDisplayed() && n.getText().includes(warningMsg);
    });
    expect(warningNotices.length)
      .withContext(`Should only be one import warning notice`)
      .toEqual(1);
    expect($('svg[data-qa-warning-img]').isDisplayed())
      .withContext(`should display a warning svg`)
      .toBe(true);
  });

  it('should display an important success notice', () => {
    const successNotices = notices.filter(n => {
        const successMsg = 'This is an important success notice';
        return n.getAttribute('class').includes('success') && n.isDisplayed() && n.getText().includes(successMsg);
    });
    expect(successNotices.length)
      .withContext(`Should only be one import error notice`)
      .toEqual(1);
    expect($('svg[data-qa-success-img]').isDisplayed())
      .withContext(`should display a success svg`)
      .toBe(true);
  });
});
