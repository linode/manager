import { renderWithTheme } from 'src/utilities/testHelpers';
import * as React from 'react';

import CardBase from './index';

describe('CardBase component', () => {
  it('should render header decorations when supplied', () => {
    const { getByText } = renderWithTheme(
      <CardBase
        heading="Test"
        subheadings={['']}
        headingDecoration={<span>Hello World</span>}
      />
    );

    const headingDecoration = getByText('Hello World');
    expect(headingDecoration).toBeInTheDocument();
  });
});
