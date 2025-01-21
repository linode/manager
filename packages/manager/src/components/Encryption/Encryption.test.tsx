import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { checkboxTestId, descriptionTestId, headerTestId } from './constants';
import { Encryption } from './Encryption';

describe('DiskEncryption', () => {
  it('should render a header', () => {
    const { getByTestId } = renderWithTheme(
      <Encryption
        descriptionCopy="Description for unit test"
        isEncryptEntityChecked={true}
        onChange={vi.fn()}
      />
    );

    const heading = getByTestId(headerTestId);

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H3');
  });

  it('should render a description', () => {
    const { getByTestId } = renderWithTheme(
      <Encryption
        descriptionCopy="Description for unit test"
        isEncryptEntityChecked={true}
        onChange={vi.fn()}
      />
    );

    const description = getByTestId(descriptionTestId);

    expect(description).toBeVisible();
  });

  it('should render a checkbox', () => {
    const { getByTestId } = renderWithTheme(
      <Encryption
        descriptionCopy="Description for unit test"
        isEncryptEntityChecked={true}
        onChange={vi.fn()}
      />
    );

    const checkbox = getByTestId(checkboxTestId);

    expect(checkbox).toBeVisible();
  });
});
