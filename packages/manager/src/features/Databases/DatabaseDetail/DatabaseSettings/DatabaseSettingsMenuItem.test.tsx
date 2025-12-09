import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import DatabaseSettingsMenuItem from './DatabaseSettingsMenuItem';

describe('DatabaseSettingsMenuItem Component', () => {
  const buttonText = 'Click Me';
  const descriptiveText = 'Here is some descriptive text';
  const sectionTitle = 'Menu Item Title';

  it('Should have a title', () => {
    const { getByRole } = renderWithTheme(
      <DatabaseSettingsMenuItem
        buttonText={buttonText}
        descriptiveText={descriptiveText}
        onClick={vi.fn()}
        sectionTitle={sectionTitle}
      />
    );
    const title = getByRole('heading');
    expect(title).toHaveTextContent(sectionTitle);
  });

  it('Should have descriptive text', () => {
    const { getByText } = renderWithTheme(
      <DatabaseSettingsMenuItem
        buttonText={buttonText}
        descriptiveText={descriptiveText}
        onClick={vi.fn()}
        sectionTitle={sectionTitle}
      />
    );
    getByText(descriptiveText);
  });

  it('Should have a primary button with provided text', () => {
    const { getByTestId } = renderWithTheme(
      <DatabaseSettingsMenuItem
        buttonText={buttonText}
        descriptiveText={descriptiveText}
        onClick={vi.fn()}
        sectionTitle={sectionTitle}
      />
    );
    const button = getByTestId(`settings-button-${buttonText}`);
    expect(button).toHaveTextContent(buttonText);
  });

  it('Should have a primary button that calls the provided callback when clicked', () => {
    const onClick = vi.fn();
    const { getByTestId } = renderWithTheme(
      <DatabaseSettingsMenuItem
        buttonText={buttonText}
        descriptiveText={descriptiveText}
        onClick={onClick}
        sectionTitle={sectionTitle}
      />
    );
    const button = getByTestId(`settings-button-${buttonText}`);
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });
});
