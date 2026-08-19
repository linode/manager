import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { apiKeyFactory } from 'src/factories/inferencePlatform';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ApiKeyManagement } from './ApiKeyManagement';

const mockApiKeys = apiKeyFactory.buildList(5);

const CREATE_API_KEY_TEXT = 'Create API Key';

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

describe('ApiKeyManagement', () => {
  beforeEach(() => {
    server.use(
      http.get('*/v4beta/inference-platform/api-keys', () => {
        return HttpResponse.json({
          data: mockApiKeys,
          page: 1,
          pages: 1,
          results: mockApiKeys.length,
        });
      })
    );
  });

  it('renders the filter text field', () => {
    const { container } = renderWithTheme(<ApiKeyManagement />);
    // CDS TextField - look for the component
    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container -- CDS web component
    const textField = container.querySelector('cds-text-field');
    expect(textField).toBeInTheDocument();
  });

  it('renders the status filter dropdown', () => {
    const { container } = renderWithTheme(<ApiKeyManagement />);
    // CDS Select component
    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container -- CDS web component
    const select = container.querySelector('cds-select');
    expect(select).toBeInTheDocument();
  });

  it('renders the show playground keys checkbox', () => {
    const { getByText } = renderWithTheme(<ApiKeyManagement />);
    expect(getByText('Show playground keys')).toBeVisible();
  });

  it('renders the create API key button', () => {
    const { container } = renderWithTheme(<ApiKeyManagement />);
    const createButton = getCdsButtonHostByText(container, CREATE_API_KEY_TEXT);
    expect(createButton).toBeInTheDocument();
  });

  it('opens create drawer when create button is clicked', async () => {
    const user = userEvent.setup();
    const { container } = renderWithTheme(<ApiKeyManagement />);

    const createButton = getCdsButtonHostByText(container, CREATE_API_KEY_TEXT);
    expect(createButton).toBeInTheDocument();
    await user.click(createButton!);

    // Check for the drawer with open attribute (CDS Drawer doesn't use heading role)
    // eslint-disable-next-line testing-library/no-node-access -- CDS web component
    const drawer = document.body.querySelector('cds-drawer[open]');
    expect(drawer).toBeInTheDocument();
  });

  it('has playground keys checkbox checked by default', () => {
    const { container } = renderWithTheme(<ApiKeyManagement />);
    // CDS Checkbox component
    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container -- CDS web component
    const checkbox = container.querySelector('cds-checkbox') as HTMLElement & {
      checked?: boolean;
    };
    expect(checkbox).toBeInTheDocument();
    expect(checkbox?.checked).toBe(true);
  });

  it.skip('allows toggling the playground keys checkbox', async () => {
    // TODO [HELIX-356]: Fix this test - CDS Checkbox click in tests doesn't properly toggle the checked property
    const user = userEvent.setup();
    const { container } = renderWithTheme(<ApiKeyManagement />);
    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container -- CDS web component
    const checkbox = container.querySelector('cds-checkbox') as HTMLElement & {
      checked?: boolean;
    };
    expect(checkbox).toBeInTheDocument();
    expect(checkbox?.checked).toBe(true);
    await user.click(checkbox!);
    expect(checkbox?.checked).toBe(false);
  });

  it.skip('allows typing in the filter field', async () => {
    // TODO [HELIX-356]: Fix this test - CDS text-field shadow DOM requires special handling for input events
    const user = userEvent.setup();
    const { container } = renderWithTheme(<ApiKeyManagement />);
    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container -- CDS web component
    const textField = container.querySelector('cds-text-field');
    expect(textField).toBeInTheDocument();

    // Would need to access shadow DOM input
    await user.type(textField!, 'test-key');
    expect(textField).toHaveAttribute('value', 'test-key');
  });
});
