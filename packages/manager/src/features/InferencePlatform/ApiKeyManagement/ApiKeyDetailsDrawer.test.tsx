import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { apiKeyFactory } from 'src/factories/inferencePlatform';
import { getUsage } from 'src/mocks/presets/crud/handlers/inferencePlatform';
import { server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { InferencePlatformContext } from '../InferencePlatformContext';
import { ApiKeyDetailsDrawer } from './ApiKeyDetailsDrawer';

import type { ApiKey, InferenceModel } from '@linode/api-v4';
import type { MockState } from 'src/mocks/types';

vi.mock('./UsageSparkline', () => ({
  UsageSparkline: ({ data }: { data: number[] }) => (
    <output aria-label="usage sparkline data">{data.join(',')}</output>
  ),
}));

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
 * Helper to find a CDS button by its aria-label attribute
 */
const getCdsButtonByAriaLabel = (
  root: ParentNode,
  ariaLabel: string
): HTMLElement | undefined =>
  // eslint-disable-next-line testing-library/no-node-access -- CDS web component
  Array.from(root.querySelectorAll<HTMLElement>('cds-button')).find(
    (button) => button.getAttribute('aria-label') === ariaLabel
  );

const MODEL_TYPE = 'text-generation';

const mockModels: InferenceModel[] = [
  {
    capabilities: ['chat', 'completion'],
    description: 'Test model 1',
    id: 'model-1',
    label: 'Model 1',
    lifecycle_status: 'active',
    modalities: { input: ['text'], output: ['text'] },
    parameters: {
      context_window: 32768,
      max_output_tokens: 8192,
      parameter_count_billions: 8,
    },
    playground_available: true,
    provider: { id: 'test', name: 'Test' },
    regions: ['us-ord'],
    tags: [],
    type: MODEL_TYPE,
    use_cases: [],
  },
  {
    capabilities: ['chat', 'completion'],
    description: 'Test model 2',
    id: 'model-2',
    label: 'Model 2',
    lifecycle_status: 'active',
    modalities: { input: ['text'], output: ['text'] },
    parameters: {
      context_window: 32768,
      max_output_tokens: 8192,
      parameter_count_billions: 8,
    },
    playground_available: true,
    provider: { id: 'test', name: 'Test' },
    regions: ['us-ord'],
    tags: [],
    type: MODEL_TYPE,
    use_cases: [],
  },
  {
    capabilities: ['chat', 'completion'],
    description: 'Test model 3',
    id: 'model-3',
    label: 'Model 3',
    lifecycle_status: 'active',
    modalities: { input: ['text'], output: ['text'] },
    parameters: {
      context_window: 32768,
      max_output_tokens: 8192,
      parameter_count_billions: 8,
    },
    playground_available: true,
    provider: { id: 'test', name: 'Test' },
    regions: ['us-ord'],
    tags: [],
    type: MODEL_TYPE,
    use_cases: [],
  },
];

const mockApiKey = apiKeyFactory.build({
  allowed_models: ['*'],
  description: 'Test description',
  id: 123,
  key_prefix: 'linf_abc',
  key_type: 'user',
  label: 'my-api-key',
  status: 'active',
});

interface TestProps {
  apiKey: ApiKey | null;
  onClose: () => void;
  onSave?: () => void;
  open: boolean;
}

const defaultProps: TestProps = {
  apiKey: mockApiKey,
  onClose: vi.fn(),
  onSave: vi.fn(),
  open: true,
};

const renderWithContext = (props: TestProps = defaultProps) => {
  return renderWithTheme(
    <InferencePlatformContext.Provider
      value={{ isModelsLoading: false, models: mockModels }}
    >
      <ApiKeyDetailsDrawer {...props} />
    </InferencePlatformContext.Provider>
  );
};

describe('ApiKeyDetailsDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    server.use(...getUsage({} as MockState));
  });

  it('renders the drawer with key label in title', () => {
    const { container } = renderWithContext();
    // CDS Drawer has aria-label with the key name
    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container -- CDS web component
    const drawer = container.querySelector('cds-drawer');
    expect(drawer).toHaveAttribute('aria-label', 'my-api-key');
  });

  it('renders null when apiKey is null', () => {
    const { container } = renderWithContext({
      ...defaultProps,
      apiKey: null,
    });
    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container -- CDS web component
    const drawer = container.querySelector('cds-drawer');
    expect(drawer).toBeNull();
  });

  it('displays the key ID', () => {
    const { getByText } = renderWithContext();
    expect(getByText('123')).toBeVisible();
  });

  it('displays the key prefix', () => {
    const { getByText } = renderWithContext();
    expect(getByText('linf_abc...')).toBeVisible();
  });

  it('displays the description', () => {
    const { getByText } = renderWithContext();
    expect(getByText('Test description')).toBeVisible();
  });

  it('displays "No description" when description is empty', () => {
    const { getByText } = renderWithContext({
      ...defaultProps,
      apiKey: apiKeyFactory.build({ description: '' }),
    });
    expect(getByText('No description')).toBeVisible();
  });

  it('displays the status badge', () => {
    const { getByText } = renderWithContext();
    expect(getByText('active')).toBeVisible();
  });

  it('displays the KeyTypeBadge for playground keys', () => {
    const { getByText } = renderWithContext({
      ...defaultProps,
      apiKey: apiKeyFactory.build({ key_type: 'playground' }),
    });
    expect(getByText('Playground')).toBeVisible();
  });

  it('shows edit button for Name field on user keys', () => {
    const { container } = renderWithContext();
    // Button has aria-label="Edit Name" not text content
    const editButton = getCdsButtonByAriaLabel(container, 'Edit Name');
    expect(editButton).toBeInTheDocument();
  });

  it('shows edit button for Description field on user keys', () => {
    const { container } = renderWithContext();
    const editButton = getCdsButtonByAriaLabel(container, 'Edit Description');
    expect(editButton).toBeInTheDocument();
  });

  it('does not show edit buttons for playground keys', () => {
    const { container } = renderWithContext({
      ...defaultProps,
      apiKey: apiKeyFactory.build({ key_type: 'playground' }),
    });
    expect(getCdsButtonByAriaLabel(container, 'Edit Name')).toBeUndefined();
    expect(
      getCdsButtonByAriaLabel(container, 'Edit Description')
    ).toBeUndefined();
  });

  it('shows Close button when there are no changes', () => {
    const { container } = renderWithContext();
    const closeButton = getCdsButtonHostByText(container, 'Close');
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onClose when Close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = renderWithContext({
      ...defaultProps,
      onClose,
    });
    const closeButton = getCdsButtonHostByText(container, 'Close');
    expect(closeButton).toBeInTheDocument();
    await user.click(closeButton!);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders Usage 24h section', () => {
    const { getByText } = renderWithContext();
    expect(getByText('Usage 24h')).toBeVisible();
  });

  it('renders zero usage sparkline for never-used keys', async () => {
    const { getByLabelText } = renderWithContext({
      ...defaultProps,
      apiKey: apiKeyFactory.build({
        id: 999999,
        last_used: null,
        status: 'active',
      }),
    });

    await waitFor(() => {
      const values = getByLabelText('usage sparkline data').textContent ?? '';
      expect(values).toBe(Array.from({ length: 24 }, () => 0).join(','));
    });
  });

  it('renders non-zero usage sparkline for used keys', async () => {
    const { getByLabelText } = renderWithContext({
      ...defaultProps,
      apiKey: apiKeyFactory.build({ id: 1, last_used: '2026-05-14T10:30:00Z' }),
    });

    await waitFor(() => {
      const values = getByLabelText('usage sparkline data').textContent ?? '';
      const parsed = values
        .split(',')
        .map((value) => Number(value))
        .filter((value) => !Number.isNaN(value));
      expect(parsed.some((value) => value > 0)).toBe(true);
    });
  });

  it('displays Created and Updated labels', () => {
    const { getByText } = renderWithContext();
    expect(getByText('Created')).toBeVisible();
    expect(getByText('Updated')).toBeVisible();
  });
});
