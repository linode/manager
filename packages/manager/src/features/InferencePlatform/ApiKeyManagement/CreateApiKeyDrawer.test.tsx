import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateApiKeyDrawer } from './CreateApiKeyDrawer';

const defaultProps = {
  onClose: vi.fn(),
  open: true,
};

/**
 * Helper to find a CDS button host element by its text content
 */
const getCdsButtonHostByText = (
  root: ParentNode,
  text: string
): HTMLElement | undefined =>
  // eslint-disable-next-line testing-library/no-node-access -- CDS web component
  Array.from(root.querySelectorAll<HTMLElement>('cds-button')).find(
    (button) => button.textContent?.trim() === text
  );

/**
 * Helper to find a CDS text field by looking for the form-label with the given text
 */
const getCdsTextFieldByLabel = (
  root: ParentNode,
  labelText: string
): HTMLElement | null => {
  // eslint-disable-next-line testing-library/no-node-access -- CDS web component
  const formLabels = root.querySelectorAll('cds-form-label');
  for (const label of Array.from(formLabels)) {
    if (label.textContent?.trim() === labelText) {
      // eslint-disable-next-line testing-library/no-node-access -- CDS web component
      const formField = label.closest('cds-form-field');
      // eslint-disable-next-line testing-library/no-node-access -- CDS web component
      return formField?.querySelector('cds-text-field') ?? null;
    }
  }
  return null;
};

describe('CreateApiKeyDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the drawer with title', () => {
    const { getByText } = renderWithTheme(
      <CreateApiKeyDrawer {...defaultProps} />
    );

    // CDS Drawer has the title in a slot, not as a heading role
    expect(getByText('Create API Key')).toBeVisible();
  });

  it('renders the label field', () => {
    const { container } = renderWithTheme(
      <CreateApiKeyDrawer {...defaultProps} />
    );

    // CDS form-label elements don't connect with inputs for getByLabelText
    const textField = getCdsTextFieldByLabel(container, 'Name');
    expect(textField).toBeInTheDocument();
  });

  it('renders the description field', () => {
    const { getByText } = renderWithTheme(
      <CreateApiKeyDrawer {...defaultProps} />
    );

    // CDS form-label elements render the text
    expect(getByText('Description')).toBeVisible();
  });

  it('renders expiry options', () => {
    const { getByText } = renderWithTheme(
      <CreateApiKeyDrawer {...defaultProps} />
    );

    // CDS radio buttons don't have role="radio" accessible, check labels
    expect(getByText('In 6 months')).toBeVisible();
    expect(getByText('In 3 months')).toBeVisible();
    expect(getByText('Never')).toBeVisible();
  });

  it('has 6 months selected by default', () => {
    const { container } = renderWithTheme(
      <CreateApiKeyDrawer {...defaultProps} />
    );

    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container -- CDS web component
    const radioButtons = container.querySelectorAll('cds-radio-button');
    // First radio button should be checked (6 months) - CDS reflects checked as a property
    const firstRadio = radioButtons[0] as HTMLElement & { checked?: boolean };
    expect(firstRadio?.checked).toBe(true);
  });

  it('shows error when submitting without a label', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CreateApiKeyDrawer {...defaultProps} />);

    const createButton = getCdsButtonHostByText(
      document.body,
      'Create API key'
    );
    expect(createButton).toBeInTheDocument();
    await user.click(createButton!);

    // Error is shown via NotificationBanner
    await waitFor(() => {
      // eslint-disable-next-line testing-library/no-node-access -- CDS web component
      const banner = document.body.querySelector(
        'cds-notification-banner'
      ) as HTMLElement & { text?: string };
      expect(banner).toBeInTheDocument();
      // CDS web component sets text as a property, not an attribute
      expect(banner?.text).toBe('Name is required');
    });
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CreateApiKeyDrawer {...defaultProps} />);

    const cancelButton = getCdsButtonHostByText(document.body, 'Cancel');
    expect(cancelButton).toBeVisible();
    await user.click(cancelButton!);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it.skip('creates an API key successfully', async () => {
    // TODO [HELIX-355]: Fix this test - CDS text-field shadow DOM requires special handling for input events
    // See getCdsTextFieldInput and changeCdsTextField helpers in IAM/utilities/testHelpers
    const user = userEvent.setup();
    server.use(
      http.post('*/v4beta/inference/api-keys', () => {
        return HttpResponse.json({
          allowed_models: ['*'],
          created: '2024-01-01T00:00:00Z',
          description: 'Test description',
          expiry: '2024-07-01T00:00:00Z',
          id: 1,
          key: 'linf_abc123_full_secret_key',
          key_prefix: 'linf_abc123',
          key_type: 'user',
          label: 'Test Key',
          last_used: null,
          status: 'active',
          updated: '2024-01-01T00:00:00Z',
        });
      })
    );

    const { container, getByText } = renderWithTheme(
      <CreateApiKeyDrawer {...defaultProps} />
    );

    // Find and type into the Name field
    const labelInput = getCdsTextFieldByLabel(
      container,
      'Name'
    ) as HTMLElement & { value?: string };
    expect(labelInput).toBeInTheDocument();

    // For CDS text-field, we need to set the value property
    // eslint-disable-next-line testing-library/no-node-access -- CDS web component
    const inputElement = labelInput?.shadowRoot?.querySelector('input');
    if (inputElement) {
      await user.type(inputElement, 'Test Key');
    } else {
      // Fallback: set value directly on the web component
      labelInput!.setAttribute('value', 'Test Key');
      labelInput!.dispatchEvent(new Event('input', { bubbles: true }));
    }

    const createButton = getCdsButtonHostByText(
      document.body,
      'Create API key'
    );
    await user.click(createButton!);

    // Should show the secret token dialog with the confirmation button
    await waitFor(() => {
      expect(getByText('I Have Saved My API Key')).toBeVisible();
    });
  });

  it('does not render when open is false', () => {
    const { container } = renderWithTheme(
      <CreateApiKeyDrawer {...defaultProps} open={false} />
    );

    // CDS Drawer still renders children but doesn't have 'open' attribute
    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container -- CDS web component
    const drawer = container.querySelector('cds-drawer');
    expect(drawer).not.toHaveAttribute('open');
  });
});
