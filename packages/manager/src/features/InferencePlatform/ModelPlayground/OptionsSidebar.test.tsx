import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  ModelPlaygroundModelContext,
  ModelPlaygroundOptionsContext,
} from './ModelPlaygroundContext';
import { OptionsSidebar } from './OptionsSidebar';
import { INITIAL_PLAYGROUND_SETTINGS } from './utils';

import type {
  ModelPlaygroundModelContextValue,
  ModelPlaygroundOptionsContextValue,
} from './ModelPlaygroundContext';
import type { InferenceModel, InferenceParameterDef } from '@linode/api-v4';

vi.mock('@akamai/cds-components/react', () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button onClick={onClick} type="button">
      {children}
    </button>
  ),
  Checkbox: ({ children }: { children: React.ReactNode }) => (
    <label>
      <input type="checkbox" />
      {children}
    </label>
  ),
  LoadingSpinner: () => (
    <div aria-label="Loading model options" role="status" />
  ),
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

vi.mock('@mui/material/Collapse', () => ({
  default: ({
    children,
    in: isOpen,
  }: {
    children: React.ReactNode;
    in: boolean;
  }) => (isOpen ? <div>{children}</div> : null),
}));

vi.mock('./SliderControl', () => ({
  SliderControl: ({
    label,
    max,
    min,
    step,
    tooltip,
  }: {
    label: string;
    max: number;
    min: number;
    step: number;
    tooltip: string;
  }) => (
    <div
      aria-label={label}
      aria-valuemax={max}
      aria-valuemin={min}
      aria-valuenow={min}
      data-step={step}
      data-tooltip={tooltip}
      role="slider"
    />
  ),
}));

vi.mock('./EffortControl', () => ({
  EffortControl: ({ label, options }: { label: string; options: string[] }) => (
    <div>
      <span>{label}</span>
      {options.map((option) => (
        <button key={option} type="button">
          {option}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('./SeedControl', () => ({
  SeedControl: ({ label }: { label?: string }) => <div>{label ?? 'Seed'}</div>,
}));

vi.mock('./StopSequencesControl', () => ({
  StopSequencesControl: ({ label }: { label?: string }) => (
    <div>{label ?? 'Stop Sequences'}</div>
  ),
}));

const createParameter = (
  overrides: Partial<InferenceParameterDef> = {}
): InferenceParameterDef => ({
  label: 'Parameter',
  type: 'number',
  ...overrides,
});

const createModelDetails = (
  inferenceParameters: Record<string, InferenceParameterDef>,
  parameters: Partial<InferenceModel['parameters']> = {}
): InferenceModel =>
  ({
    id: 'model-a',
    inference_parameters: inferenceParameters,
    label: 'Model A',
    parameters,
  }) as InferenceModel;

const defaultModelContext: ModelPlaygroundModelContextValue = {
  isModelDetailsError: false,
  isModelDetailsLoading: false,
  modelDetails: createModelDetails({}),
  onModelChange: vi.fn(),
  selectedModel: 'model-a',
};

const defaultOptionsContext: ModelPlaygroundOptionsContextValue = {
  onSettingsChange: vi.fn(),
  settings: INITIAL_PLAYGROUND_SETTINGS,
};

const renderSidebar = (
  modelContext: Partial<ModelPlaygroundModelContextValue> = {},
  optionsContext: Partial<ModelPlaygroundOptionsContextValue> = {}
) =>
  renderWithTheme(
    <ModelPlaygroundModelContext.Provider
      value={{ ...defaultModelContext, ...modelContext }}
    >
      <ModelPlaygroundOptionsContext.Provider
        value={{ ...defaultOptionsContext, ...optionsContext }}
      >
        <OptionsSidebar />
      </ModelPlaygroundOptionsContext.Provider>
    </ModelPlaygroundModelContext.Provider>
  );

describe('OptionsSidebar', () => {
  it('shows a loading spinner while model details load', () => {
    renderSidebar({ isModelDetailsLoading: true, modelDetails: undefined });

    expect(
      screen.getByRole('status', { name: 'Loading model options' })
    ).toBeVisible();
  });

  it('shows an error when model details fail to load', () => {
    renderSidebar({ isModelDetailsError: true, modelDetails: undefined });

    expect(
      screen.getByText(/unable to load this model's options/i)
    ).toBeVisible();
  });

  it('shows an empty state when no controls are available', () => {
    renderSidebar();

    expect(screen.getByText(/no controls available/i)).toBeVisible();
  });

  it('does not render unsupported numeric parameters', () => {
    renderSidebar({
      modelDetails: createModelDetails({
        min_tokens: createParameter({ label: 'Minimum Tokens' }),
      }),
    });

    expect(screen.getByText(/no controls available/i)).toBeVisible();
    expect(
      screen.queryByRole('slider', { name: 'Minimum Tokens' })
    ).not.toBeInTheDocument();
  });

  it('uses fallback descriptions for numeric parameters', async () => {
    const user = userEvent.setup();

    renderSidebar({
      modelDetails: createModelDetails({
        frequency_penalty: createParameter({ label: 'Frequency Penalty' }),
        temperature: createParameter({ label: 'Creativity' }),
      }),
    });

    expect(screen.getByRole('slider', { name: 'Creativity' })).toHaveAttribute(
      'data-tooltip',
      'Controls randomness. Lower values make output more focused and deterministic. Higher values make it more creative and varied.'
    );
    await user.click(screen.getByRole('button', { name: /advanced options/i }));
    expect(
      screen.getByRole('slider', { name: 'Frequency Penalty' })
    ).toHaveAttribute(
      'data-tooltip',
      "Reduces repetition by penalizing tokens in proportion to how often they've already appeared."
    );
  });

  it('ignores malformed parameter metadata', () => {
    renderSidebar({
      modelDetails: createModelDetails({
        temperature: null as unknown as InferenceParameterDef,
        reasoning_effort: createParameter({
          enum: 'high' as unknown as string[],
          type: 'string',
        }),
      }),
    });

    expect(screen.getByText(/no controls available/i)).toBeVisible();
  });

  it('renders only controls declared by the model schema', async () => {
    const user = userEvent.setup();

    renderSidebar({
      modelDetails: createModelDetails({
        stop: createParameter({ label: 'Custom Stop', type: 'array' }),
        stream: createParameter({ label: 'Live Output', type: 'boolean' }),
        temperature: createParameter({ label: 'Creativity' }),
      }),
    });

    expect(screen.getByRole('slider', { name: 'Creativity' })).toBeVisible();
    expect(screen.getByText('Live Output')).toBeVisible();
    expect(
      screen.getByRole('button', { name: /advanced options/i })
    ).toBeVisible();
    expect(screen.queryByText('Custom Stop')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /advanced options/i }));
    expect(screen.getByText('Custom Stop')).toBeVisible();
    expect(screen.queryByText(/enable thinking/i)).not.toBeInTheDocument();
  });

  it('renders model-provided reasoning effort options without enable_thinking', () => {
    renderSidebar({
      modelDetails: createModelDetails({
        reasoning_effort: createParameter({
          enum: ['minimal', 'standard', 3],
          label: 'Reasoning Level',
          type: 'string',
        }),
      }),
    });

    expect(screen.getByText('Reasoning Level')).toBeVisible();
    expect(screen.getByRole('button', { name: 'minimal' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'standard' })).toBeVisible();
    expect(screen.queryByRole('button', { name: '3' })).not.toBeInTheDocument();
    expect(screen.queryByText(/enable thinking/i)).not.toBeInTheDocument();
  });

  it('moves exclusive numeric bounds inward by one step', async () => {
    const user = userEvent.setup();

    renderSidebar({
      modelDetails: createModelDetails({
        temperature: createParameter({ exclusiveMinimum: 0 }),
        top_p: createParameter({ exclusiveMaximum: 1, label: 'Top P' }),
        top_k: createParameter({
          exclusiveMaximum: 40,
          label: 'Top K',
          type: 'integer',
        }),
      }),
    });

    expect(screen.getByRole('slider', { name: 'Parameter' })).toHaveAttribute(
      'aria-valuemin',
      '0.01'
    );
    expect(screen.getByRole('slider', { name: 'Top P' })).toHaveAttribute(
      'aria-valuemax',
      '0.99'
    );
    await user.click(screen.getByRole('button', { name: /advanced options/i }));
    expect(screen.getByRole('slider', { name: 'Top K' })).toHaveAttribute(
      'aria-valuemax',
      '39'
    );
  });

  it('uses the model max output tokens before the parameter maximum', () => {
    renderSidebar({
      modelDetails: createModelDetails(
        {
          max_tokens: createParameter({
            label: 'Max Output Tokens',
            maximum: 2048,
            type: 'integer',
          }),
        },
        { max_output_tokens: 1024 }
      ),
    });

    expect(
      screen.getByRole('slider', { name: 'Max Output Tokens' })
    ).toHaveAttribute('aria-valuemax', '1024');
  });
});
