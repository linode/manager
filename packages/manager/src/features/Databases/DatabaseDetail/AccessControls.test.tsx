import { fireEvent, screen } from '@testing-library/react';
import * as React from 'react';

import { databaseFactory } from 'src/factories';
import {
  getShadowRootElement,
  mockMatchMedia,
  renderWithTheme,
} from 'src/utilities/testHelpers';

import AccessControls from './AccessControls';

beforeAll(() => mockMatchMedia());

describe('Access Controls', () => {
  it('Should have a Remove button for each IP listed in the table', () => {
    const allowList = ['1.1.1.1/32', '2.2.2.2', '3.3.3.3/128'];
    const database = databaseFactory.build({ allow_list: allowList });

    renderWithTheme(<AccessControls database={database} />);

    expect(screen.getAllByText('Remove')).toHaveLength(allowList.length);
  });

  it('Should open a confirmation modal when a Remove button is clicked', () => {
    const database = databaseFactory.build();
    const { getAllByText } = renderWithTheme(
      <AccessControls database={database} />
    );
    const button = getAllByText('Remove')[0];

    fireEvent.click(button);
    expect(
      screen.getByTestId('ip-removal-confirmation-warning')
    ).toBeInTheDocument();
  });

  it.each([
    ['disable', true],
    ['enable', false],
  ])(
    'should %s "Manage Access" button when disabled is %s',
    async (_, isDisabled) => {
      const database = databaseFactory.build();
      const { getByTestId } = renderWithTheme(
        <AccessControls database={database} disabled={isDisabled} />
      );
      const buttonHost = getByTestId('button-access-control');
      const button = await getShadowRootElement(buttonHost, 'button');

      if (isDisabled) {
        expect(button).toBeDisabled();
      } else {
        expect(button).toBeEnabled();
      }
    }
  );
});
