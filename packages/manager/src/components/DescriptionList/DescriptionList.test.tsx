import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DescriptionList } from './DescriptionList';

const items = [
  {
    description: 'Some description related to the label (long)',
    title: 'Random title',
  },
  {
    description: 'That',
    title: 'This',
  },
  {
    description: 'Another description',
    title: 'Another Title',
  },
];

describe('Description List', () => {
  it('displays the correct list of items', () => {
    const { getByText } = renderWithTheme(<DescriptionList items={items} />);

    items.forEach((item) => {
      expect(getByText(item.title)).toBeInTheDocument();
      expect(getByText(item.description)).toBeInTheDocument();
    });
  });

  it('renders a column by default', () => {
    const { container } = renderWithTheme(<DescriptionList items={items} />);
    expect(container.firstChild?.firstChild).toHaveStyle(
      'flex-direction: column'
    );
  });
});
