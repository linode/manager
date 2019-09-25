const { constants } = require('../../constants');
const { assertLog } = require('../../utils/assertionLog');

import Dashboard from '../../pageobjects/dashboard.page';

describe('Dashboard Suite', () => {
  beforeAll(() => {
    browser.url(constants.routes.dashboard);
  });

  it('should display the dashboard elements', () => {
    Dashboard.baseElemsDisplay();
  });

  it('should display blog posts', () => {
    Dashboard.blogCard.waitForDisplayed(constants.wait.normal);
    expect(Dashboard.blogPosts.length)
      .withContext(`Should be at least one blog post`)
      .toBeGreaterThan(0);
    expect(Dashboard.blogPosts.length)
      .withContext(
        `${assertLog.incorrectNum} for "${
          Dashboard.blogPosts.selector
        }" selector`
      )
      .toEqual($$(Dashboard.postDescription.selector).length);

    Dashboard.blogPosts.forEach(post => {
      expect(post.getAttribute('href'))
        .withContext(`incorrect Url for blog posts`)
        .toContain('https://blog.linode.com');
    });
  });
});
