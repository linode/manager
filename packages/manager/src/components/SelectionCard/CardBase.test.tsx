import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CardBase } from './CardBase';

describe('CardBase component', () => {
  it('should render header decorations when supplied', () => {
    const { getByText } = renderWithTheme(
      <CardBase
        heading="Test"
        headingDecoration={<span>Hello World</span>}
        subheadings={['']}
      />
    );

    const headingDecoration = getByText('Hello World');
    expect(headingDecoration).toBeInTheDocument();
  });
});
