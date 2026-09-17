import * as React from 'react';
import { vi } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ModelRow } from './ModelRow';

import type { Model } from '../../ModelLibrary/modelLibrary.types';

const navigate = vi.fn();
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-router')>(
    '@tanstack/react-router'
  );
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

const buildModel = (overrides: Partial<Model> = {}): Model => ({
  contextLengthK: 128,
  description: 'A test model description.',
  descriptionShort: 'Test model',
  id: 'test-model',
  inputModes: [],
  isServerless: true,
  outputModes: [],
  parametersB: 8,
  playgroundAvailable: true,
  providerLogo: 'google',
  providerName: 'Google',
  releasedAt: '2025-01-01',
  supportedLanguages: ['en'],
  title: 'Test Model',
  updatedAt: '2025-01-01',
  useCaseTags: [],
  ...overrides,
});

describe('ModelRow — inferencePlatform2026Beta gating', () => {
  beforeEach(() => {
    navigate.mockClear();
  });

  it('is clickable and navigates when the flag is ON', () => {
    const model = buildModel();
    const { getByLabelText } = renderWithTheme(<ModelRow model={model} />, {
      flags: { inferencePlatform2026Beta: true },
    });
    const row = getByLabelText(`View details for ${model.title}`);

    expect(row).toHaveAttribute('role', 'button');
    expect(row).toHaveAttribute('tabindex', '0');

    row.click();
    expect(navigate).toHaveBeenCalledWith({
      params: { modelId: model.id },
      to: '/inference-platform/model-library/$modelId',
    });
  });

  it('is not interactive and does not navigate when the flag is OFF', () => {
    const model = buildModel();
    const { getByLabelText } = renderWithTheme(<ModelRow model={model} />, {
      flags: { inferencePlatform2026Beta: false },
    });
    const row = getByLabelText(`View details for ${model.title}`);

    expect(row).toHaveAttribute('aria-disabled', 'true');
    expect(row).not.toHaveAttribute('role', 'button');
    expect(row).toHaveAttribute('tabindex', '-1');

    row.click();
    expect(navigate).not.toHaveBeenCalled();
  });
});
