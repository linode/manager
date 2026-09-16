import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { InferencePlatformContext } from '../InferencePlatformContext';
import { ModelsPopover } from './ModelsPopover';

import type { InferenceModel } from '@linode/api-v4';

const buildModel = (id: string): InferenceModel =>
  ({
    id,
    label: id,
    lifecycle_status: 'active',
    modalities: { input: ['text'], output: ['text'] },
    playground_available: true,
    provider: { id: 'test', name: 'Test' },
    regions: ['us-ord'],
    tags: [],
    type: 'text-generation',
    use_cases: [],
  }) as unknown as InferenceModel;

const mockModels: InferenceModel[] = [
  buildModel('zeta-1'),
  buildModel('alpha-1'),
  buildModel('mu-1'),
];

const renderWithContext = (models: string[]) =>
  renderWithTheme(
    <InferencePlatformContext.Provider
      value={{ isModelsLoading: false, models: mockModels }}
    >
      <ModelsPopover models={models} />
    </InferencePlatformContext.Provider>
  );

describe('ModelsPopover', () => {
  it('renders "All" trigger and full model list alphabetically for wildcard', () => {
    const { getByText, container } = renderWithContext(['*']);

    expect(getByText('All')).toBeVisible();

    const items = Array.from(
      // eslint-disable-next-line testing-library/no-container -- CDS web component
      container.querySelectorAll('cds-popover span')
    ).map((el) => el.textContent);
    expect(items).toEqual(['alpha-1', 'mu-1', 'zeta-1']);
  });

  it('renders "All" trigger for empty allowed_models', () => {
    const { getByText } = renderWithContext([]);
    expect(getByText('All')).toBeVisible();
  });

  it('renders count and sorted subset for specific models', () => {
    const { getByText, container } = renderWithContext(['zeta-1', 'alpha-1']);

    expect(getByText('2 Models')).toBeVisible();

    const items = Array.from(
      // eslint-disable-next-line testing-library/no-container -- CDS web component
      container.querySelectorAll('cds-popover span')
    ).map((el) => el.textContent);
    expect(items).toEqual(['alpha-1', 'zeta-1']);
  });

  it('uses singular "Model" label for a single item', () => {
    const { getByText } = renderWithContext(['alpha-1']);
    expect(getByText('1 Model')).toBeVisible();
  });
});
