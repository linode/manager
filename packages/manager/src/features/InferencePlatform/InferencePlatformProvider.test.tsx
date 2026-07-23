import * as React from 'react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { useInferencePlatform } from './InferencePlatformContext';
import { InferencePlatformProvider } from './InferencePlatformProvider';

const mockModels = [
  {
    capabilities: ['chat', 'completion'],
    description: 'Qwen3 8B is a powerful language model.',
    id: 'qwen3-8b',
    label: 'Qwen3 8B',
    lifecycle_status: 'active',
    modalities: { input: ['text'], output: ['text'] },
    parameters: {
      context_window: 32768,
      max_output_tokens: 8192,
      parameter_count_billions: 8,
    },
    playground_available: true,
    provider: { id: 'qwen', name: 'Qwen' },
    regions: ['us-ord'],
    tags: ['instruction-tuned'],
    type: 'text-generation',
    use_cases: ['chatbots'],
  },
  {
    capabilities: ['chat', 'completion'],
    description: "Google's Gemma 4 26B parameter instruction-tuned model.",
    id: 'gemma-4-26b-a4b-it',
    label: 'Gemma 4 26B A4B IT',
    lifecycle_status: 'active',
    modalities: { input: ['text'], output: ['text'] },
    parameters: {
      context_window: 262144,
      max_output_tokens: 8192,
      parameter_count_billions: 26,
    },
    playground_available: true,
    provider: { id: 'google', name: 'Google' },
    regions: ['us-ord', 'us-sea'],
    tags: ['instruction-tuned', 'long-context'],
    type: 'text-generation',
    use_cases: ['chatbots', 'long-context'],
  },
];

// Test component that consumes the context
const TestConsumer = () => {
  const { isModelsLoading, models } = useInferencePlatform();

  if (isModelsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <span data-testid="model-count">{models.length}</span>
      {models.map((model) => (
        <span data-testid={`model-${model.id}`} key={model.id}>
          {model.id}
        </span>
      ))}
    </div>
  );
};

const MODEL_COUNT_TEST_ID = 'model-count';

describe('InferencePlatformProvider', () => {
  beforeEach(() => {
    server.use(
      http.get('*/v4beta/inference/models', () => {
        return HttpResponse.json({
          data: mockModels,
        });
      })
    );
  });

  it('provides models to children via context', async () => {
    const { findByTestId, getByTestId } = renderWithTheme(
      <InferencePlatformProvider>
        <TestConsumer />
      </InferencePlatformProvider>
    );

    // Wait for loading to complete
    await findByTestId(MODEL_COUNT_TEST_ID);

    expect(getByTestId(MODEL_COUNT_TEST_ID)).toHaveTextContent('2');
    // getByTestId will throw if element not found, so just call it
    getByTestId('model-qwen3-8b');
    getByTestId('model-gemma-4-26b-a4b-it');
  });

  it('shows loading state while fetching models', () => {
    const { getByText } = renderWithTheme(
      <InferencePlatformProvider>
        <TestConsumer />
      </InferencePlatformProvider>
    );

    // getByText will throw if element not found
    getByText('Loading...');
  });

  it('provides empty array when API returns no models', async () => {
    server.use(
      http.get('*/v4beta/inference/models', () => {
        return HttpResponse.json({
          data: [],
        });
      })
    );

    const { findByTestId, getByTestId } = renderWithTheme(
      <InferencePlatformProvider>
        <TestConsumer />
      </InferencePlatformProvider>
    );

    await findByTestId(MODEL_COUNT_TEST_ID);
    expect(getByTestId(MODEL_COUNT_TEST_ID)).toHaveTextContent('0');
  });
});
