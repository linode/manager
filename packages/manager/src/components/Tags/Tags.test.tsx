import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Tags } from './Tags';

describe('Tags list', () => {
  it('should display "Show More" button if the tags list is more than 3', () => {
    const { container, getByText } = renderWithTheme(
      <Tags tags={['tag1', 'tag2', 'tag3', 'tag4', 'tag5']} />
    );

    expect(getByText('+2')).toBeVisible();
    expect(
      container.querySelector('[data-qa-show-more-chip]')
    ).toBeInTheDocument();
  });

  it('shouldn\'t display the "Show More" button if the tags list contains 3 or fewer tags', () => {
    const { container } = renderWithTheme(
      <Tags tags={['tag1', 'tag2', 'tag3']} />
    );

    expect(
      container.querySelector('[data-qa-show-more-chip]')
    ).not.toBeInTheDocument();
  });
});
