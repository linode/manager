import * as React from 'react';
import { vi } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ModelCard } from './ModelCard';

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

describe('ModelCard — inferencePlatform2026Beta gating', () => {
  beforeEach(() => {
    navigate.mockClear();
  });

  it('is clickable and navigates when the flag is ON', async () => {
    const model = buildModel();
    const { getByLabelText } = renderWithTheme(<ModelCard model={model} />, {
      flags: { inferencePlatform2026Beta: true },
    });
    const card = getByLabelText(`View details for ${model.title}`);

    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabindex', '0');
    expect(card).not.toHaveAttribute('aria-disabled', 'true');

    card.click();
    expect(navigate).toHaveBeenCalledWith({
      params: { modelId: model.id },
      to: '/inference-platform/model-library/$modelId',
    });
  });

  it('is not interactive and does not navigate when the flag is OFF', () => {
    const model = buildModel();
    const { getByLabelText } = renderWithTheme(<ModelCard model={model} />, {
      flags: { inferencePlatform2026Beta: false },
    });
    const card = getByLabelText(`View details for ${model.title}`);

    expect(card).toHaveAttribute('aria-disabled', 'true');
    expect(card).not.toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabindex', '-1');

    card.click();
    expect(navigate).not.toHaveBeenCalled();
  });
});
