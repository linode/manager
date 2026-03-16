import { profileFactory } from '@linode/utilities';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import * as React from 'react';

import {
  renderWithTheme,
  renderWithThemeAndHookFormContext,
} from 'src/utilities/testHelpers';

import { ContactSalesDrawer } from './ContactSalesDrawer';

import type { ContactSalesDrawerProps } from './ContactSalesDrawer';

const mockProps: ContactSalesDrawerProps = {
  open: true,
  onClose: vi.fn(),
  productName: 'Linode Kubernetes Engine',
  partnerName: 'Linode',
};

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

describe('ContactSalesDrawer', () => {
  it('should render the Contact Sales Drawer with the correct title and description', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <ContactSalesDrawer {...mockProps} />,
    });

    const title = getByText(`Contact ${mockProps.partnerName} sales`);
    const description = getByText(
      "Complete the form and our partner's sales team will reach out to you"
    );

    expect(title).toBeVisible();
    expect(description).toBeVisible();
  });

  it('renders the username and email address ', () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({
        username: 'my-user',
        email: 'user@akamai.com',
      }),
    });

    const { getByText } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    expect(getByText('my-user')).toBeVisible();
    expect(getByText('user@akamai.com')).toBeVisible();
  });

  it('renders an empty additional email address field by default', () => {
    const { getByText, getByTestId } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    const emailVal = getByTestId('domain-transfer-input')
      .querySelector('input')
      ?.getAttribute('value');

    expect(getByText('Additional email addresses')).toBeVisible();
    expect(getByTestId('domain-transfer-input')).toBeVisible();
    expect(emailVal).toBe('');
  });

  it('renders the add email button when the additional email address value has less than 2 emails', () => {
    const { getAllByTestId, getByText } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    const noOfEmails = getAllByTestId('domain-transfer-input').length;
    if (noOfEmails < 2) {
      const addEmailButton = getByText(
        'Click to add a second, additional email address'
      );
      expect(addEmailButton).toBeVisible();
    }
  });

  it('renders a removable text field on click of the add email button', async () => {
    const { getByText, getAllByTestId } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    const addEmailButton = getByText(
      'Click to add a second, additional email address'
    );
    fireEvent.click(addEmailButton);

    expect(getAllByTestId('domain-transfer-input')).toHaveLength(2);
  });

  it('should remove the additional email address field when the delete button is clicked', async () => {
    const { getByText, getByTestId, queryAllByTestId } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    const addEmailButton = getByText(
      'Click to add a second, additional email address'
    );
    fireEvent.click(addEmailButton);

    let additionalEmailInputs = queryAllByTestId('domain-transfer-input');
    expect(additionalEmailInputs).toHaveLength(2);

    const removeButton = getByTestId('delete-ip-1');
    fireEvent.click(removeButton);

    additionalEmailInputs = queryAllByTestId('domain-transfer-input');

    expect(additionalEmailInputs).toHaveLength(1);
  });

  it('renders an error message if the entered additional email address is invalid', async () => {
    const { getByTestId, getByText } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    const additionalEmailInput = getByTestId(
      'domain-transfer-input'
    ).querySelector('input') as HTMLInputElement;
    fireEvent.change(additionalEmailInput, {
      target: { value: 'test' },
    });
    fireEvent.blur(additionalEmailInput);

    await waitFor(() => {
      expect(getByText('Please enter a valid email')).toBeVisible();
    });
  });

  it('renders an empty region field by default', async () => {
    const { getByLabelText } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    const regionInput = getByLabelText(/region/i) as HTMLInputElement;

    expect(regionInput).toBeVisible();
    expect(regionInput).toHaveValue('');
  });

  it('renders the selected region from the dropdown', async () => {
    const { getByTestId, queryByRole } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    const regionInput = getByTestId('region-autocomplete');
    const openButton = within(regionInput).getByRole('button', {
      name: 'Open',
    });

    fireEvent.click(openButton);

    await waitFor(async () => {
      const regionOption = queryByRole('option', {
        name: 'United States Of America',
      });
      if (regionOption) {
        fireEvent.click(regionOption);
      }
    });

    const selectedRegion = regionInput?.querySelector(
      'input'
    ) as HTMLInputElement;

    expect(selectedRegion).toHaveValue('United States Of America');
  });

  it('shows an error message if a region is not selected on form submission', async () => {
    const { getByText, queryByText } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    const tc_consentCheckbox = screen
      .getByTestId('tc-consent-checkbox')
      .querySelector('input') as HTMLInputElement;
    fireEvent.click(tc_consentCheckbox);

    const submitButton = getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(queryByText('Please select your region')).toBeVisible();
    });
  });

  it('renders "+1" as the default country dialing code', async () => {
    const { getByTestId } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );
    const countryCodeSelect = getByTestId('phone-country-code-autocomplete');
    const countryCodeSelectValue = countryCodeSelect.querySelector(
      'input'
    ) as HTMLInputElement;
    expect(countryCodeSelectValue).toHaveValue('+1');
  });

  it('renders the selected country dialing code from the dropdown', async () => {
    const { getByTestId, queryByRole } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    const countryCodeInput = getByTestId('phone-country-code-autocomplete');
    const openButton = within(countryCodeInput).getByRole('button', {
      name: 'Open',
    });

    fireEvent.click(openButton);

    await waitFor(async () => {
      const countryCodeOption = queryByRole('option', {
        name: /\+91/i,
      });
      if (countryCodeOption) {
        fireEvent.click(countryCodeOption);
      }
    });

    const selectedCountryCode = countryCodeInput?.querySelector(
      'input'
    ) as HTMLInputElement;

    screen.debug(countryCodeInput);
    expect(selectedCountryCode).toHaveValue('+91');
  });

  it('renders the phone number input field', async () => {
    const { getByTestId } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    expect(getByTestId('phone-number-input')).toBeVisible();
  });

  it('renders the company name text field', async () => {
    const { getByLabelText } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    const companyNameInput = getByLabelText("Your company's name");

    expect(companyNameInput).toBeVisible();
  });

  it('renders the akamai executive email input field', async () => {
    const { getByLabelText } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    const akamaiEmailInput = getByLabelText('Akamai account executive email');

    expect(akamaiEmailInput).toBeVisible();
  });

  it('shows an error if the akamai executive email entered is invalid', async () => {
    const { getByLabelText, queryByText } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );
    const akamaiEmailInput = getByLabelText(
      'Akamai account executive email'
    ) as HTMLInputElement;

    fireEvent.change(akamaiEmailInput, {
      target: { value: 'test' },
    });
    fireEvent.blur(akamaiEmailInput);

    await waitFor(() => {
      expect(queryByText('Must be an akamai email address.')).toBeVisible();
    });
  });

  it('renders the consent checkbox and is unchecked by default', async () => {
    const { getByTestId } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );
    const consentCheckbox = getByTestId('tc-consent-checkbox').querySelector(
      'input'
    ) as HTMLInputElement;

    screen.debug(consentCheckbox);

    expect(consentCheckbox).not.toBeChecked();
  });

  it('disables the submit button if the consent checkbox is not checked', async () => {
    const { getByText, getByTestId } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );
    const submitButton = getByText('Submit');
    expect(getByTestId('tc-consent-checkbox')).not.toBeChecked();
    expect(submitButton).toBeVisible();
    expect(submitButton).toBeDisabled();
  });

  it('enables the submit button when the consent checkbox is checked', async () => {
    const { getByText, getByTestId } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    expect(getByText('Submit')).toBeDisabled();

    const consentCheckbox = getByTestId('tc-consent-checkbox').querySelector(
      'input'
    ) as HTMLInputElement;

    fireEvent.click(consentCheckbox);

    // Submit should still be disabled because required fields (region, phone) are not filled
    expect(getByText('Submit')).toBeDisabled();
  });

  it('expands the terms and conditions when the "Show details" button is clicked', async () => {
    const { getByText } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    const showDetailsButton = getByText('Show details');
    expect(showDetailsButton).toBeVisible();
    fireEvent.click(showDetailsButton);

    expect(getByText('Hide details')).toBeVisible();
  });

  it('hides the terms and conditions when the "Hide details" button is clicked', async () => {
    const { getByText } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    const showDetailsButton = getByText('Show details');
    fireEvent.click(showDetailsButton);

    const hideDetailsButton = getByText('Hide details');
    fireEvent.click(hideDetailsButton);

    expect(getByText('Show details')).toBeVisible();
  });
});
