const { navigateToStory } = require('../../../e2e/utils/storybook');

describe('Password Input Suite', () => {
  const component = 'Password Input';
  const childStories = ['Example'];
  const passwordInput = '[data-qa-hide] input';

  function hideShow(show) {
    $('[data-qa-hide] svg').click();
    const hidden = $('[data-qa-hide]').getAttribute('data-qa-hide');
    const type = $(passwordInput).getAttribute('type');

    if (show) {
      expect(hidden)
        .withContext(`Password should be displayed`)
        .toBe('false');
      expect(type)
        .withContext(`Incorrect type`)
        .toBe('text');
    } else {
      expect(hidden)
        .withContext(`Password should be hidden`)
        .toBe('true');
      expect(type)
        .withContext(`Incorrect type`)
        .toBe('password');
    }
  }

  beforeAll(() => {
    navigateToStory(component, childStories[0]);
  });

  it('should display password when click show', () => {
    hideShow(true);
  });

  it('should hide when click hide', () => {
    hideShow();
  });
});
