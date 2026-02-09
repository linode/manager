import { profileFactory } from '@linode/utilities';
import { fireEvent, waitFor } from '@testing-library/react';
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
      "Fill the form and our partner's sales team will reach out to you"
    );

    expect(title).toBeInTheDocument();
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

    expect(getByText('my-user')).toBeInTheDocument();
    expect(getByText('user@akamai.com')).toBeInTheDocument();
  });

  it('renders an empty additional email address field by default', () => {
    const { getByText, getByTestId } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    const emailVal = getByTestId('domain-transfer-input')
      .querySelector('input')
      ?.getAttribute('value');

    expect(getByText('Additional email addresses')).toBeInTheDocument();
    expect(getByTestId('domain-transfer-input')).toBeInTheDocument();
    expect(emailVal).toBe('');
  });

  it('renders the "Add Email Address" button when the additional email address value has less than 2 emails', () => {
    const { getAllByTestId, getByText } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    const noOfEmails = getAllByTestId('domain-transfer-input').length;
    if (noOfEmails < 2) {
      const addEmailButton = getByText('Add email address');
      expect(addEmailButton).toBeVisible();
    }
  });

  it('renders an removable text field on click of the "Add Email Address" button', async () => {
    const { getByText, queryAllByTestId } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    const addEmailButton = getByText('Add email address');
    addEmailButton.click();

    await waitFor(() => {
      expect(queryAllByTestId('domain-transfer-input')).toHaveLength(2);
    });
  });

  it('should remove the additional email address field when the delete button is clicked', async () => {
    const { getByText, getByTestId, queryAllByTestId } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    const addEmailButton = getByText('Add email address');
    fireEvent.click(addEmailButton);

    let additionalEmailInputs = queryAllByTestId('domain-transfer-input');
    expect(additionalEmailInputs).toHaveLength(2);

    const removeButton = getByTestId('delete-ip-1');
    fireEvent.click(removeButton);

    additionalEmailInputs = queryAllByTestId('domain-transfer-input');

    expect(additionalEmailInputs).toHaveLength(1);
  });

  it('renders an error message if the entered additional email address is invalid', async () => {
    const { getByTestId, queryByText } = renderWithTheme(
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
      expect(queryByText('Please enter a valid email')).toBeVisible();
    });
  });

  it('renders an empty region field by default', async () => {
    const { getByLabelText } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    const regionInput = getByLabelText(/region/i) as HTMLInputElement;

    expect(regionInput).toBeInTheDocument();
    expect(regionInput).toHaveValue('');
  });

  it('renders the phone number input field', async () => {
    const { getByTestId } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    expect(getByTestId('phone-number-input')).toBeInTheDocument();
  });

  it('renders the company name text field', async () => {
    const { getByLabelText } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    const companyNameInput = getByLabelText("Your company's name");

    expect(companyNameInput).toBeInTheDocument();
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
    const consentCheckbox = getByTestId('tc-consent-checkbox');

    expect(consentCheckbox).toBeInTheDocument();
    expect(consentCheckbox).not.toBeChecked();
  });

  it('disables the submit button if the consent checkbox is not checked', async () => {
    const { getByText, getByTestId } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );
    const submitButton = getByText('Submit');
    expect(getByTestId('tc-consent-checkbox')).not.toBeChecked();
    expect(submitButton).toBeInTheDocument();
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

    await waitFor(() => {
      expect(getByText('Submit')).toBeEnabled();
    });
  });

  it('expands the terms and conditions when the "Show details" button is clicked', async () => {
    const { getByText, queryByText } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    const showDetailsButton = getByText('Show details');
    expect(showDetailsButton).toBeVisible();
    fireEvent.click(showDetailsButton);

    await waitFor(() => {
      expect(queryByText('Hide details')).toBeVisible();
    });
  });

  it('hides the terms and conditions when the "Hide details" button is clicked', async () => {
    const { getByText, queryByText } = renderWithTheme(
      <ContactSalesDrawer {...mockProps} />
    );

    const showDetailsButton = getByText('Show details');
    fireEvent.click(showDetailsButton);

    const hideDetailsButton = getByText('Hide details');
    fireEvent.click(hideDetailsButton);

    await waitFor(() => {
      expect(queryByText('Show details')).toBeVisible();
    });
  });
});
