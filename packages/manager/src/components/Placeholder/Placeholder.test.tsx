import * as React from 'react';

import ComputeIcon from 'src/assets/icons/entityIcons/compute.svg';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { Placeholder } from './Placeholder';

describe('Placeholder', () => {
  it('renders a placeholder with a title', () => {
    const { container, getByTestId, getByText } = renderWithTheme(
      <Placeholder title="This is a title" />
    );

    const title = getByText('This is a title');
    const icon = getByTestId('placeholder-icon');
    expect(title).toHaveClass('MuiTypography-h1');
    expect(container.querySelector('[height="20"]')).toEqual(icon);
  });

  it('displays the given icon and changes the heading style', () => {
    const { container, getByTestId } = renderWithTheme(
      <Placeholder icon={ComputeIcon} title="title" />
    );

    const icon = getByTestId('placeholder-icon');
    const iconQueriedDifferently = container.querySelector('[height="20"]');
    expect(icon).toEqual(iconQueriedDifferently);
  });

  it('renders a placeholder with additional props', () => {
    const { getByText } = renderWithTheme(
      <Placeholder
        additionalCopy="additional copy"
        showTransferDisplay
        subtitle="subtitle"
        title="title"
      />
    );

    getByText('title');
    getByText('additional copy');
    getByText('subtitle');
    getByText('Loading transfer data...');
  });

  it('displays children, links and buttons', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <Placeholder
        buttonProps={[{ buttonType: 'primary' }]}
        linksSection={<div>Pretend this is a link</div>}
        title="title"
      >
        This is a child element
      </Placeholder>
    );

    getByText('Pretend this is a link');
    getByText('This is a child element');
    getByTestId('placeholder-button');
  });
});
