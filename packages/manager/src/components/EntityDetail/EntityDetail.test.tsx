import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { EntityDetail } from './EntityDetail';

const props = {
  footer: <div>footer</div>,
  header: <div>header</div>,
};
describe('Entity detail', () => {
  it('renders an Entity Detail', () => {
    const { getByText } = renderWithTheme(
      <EntityDetail {...props} body={<div>body</div>} />
    );

    getByText('body');
    getByText('footer');
    getByText('header');
  });

  it('does not render the body', () => {
    const { getByText } = renderWithTheme(<EntityDetail {...props} />);

    getByText('footer');
    getByText('header');
  });
});
