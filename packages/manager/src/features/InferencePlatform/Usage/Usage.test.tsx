import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { createUsageData } from 'src/factories/inferencePlatform';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { Usage } from './Usage';

// Constants
const USAGE_ENDPOINT = '*/v4beta/inference/usage';
const TOTAL_TOKENS_BY_MODEL = 'Total Tokens by Model';

// Model group definitions
const LLAMA_MODEL = {
  id: 'llama-3.1-70b-instruct',
  label: 'Llama 3.1 70B Instruct',
  scale: 3500000, // Scale to produce ~7M total tokens over 2 buckets
};
const MISTRAL_MODEL = {
  id: 'mistral-7b-instruct',
  label: 'Mistral 7B Instruct',
  scale: 1700000, // Scale to produce ~3.4M total tokens over 2 buckets
};

// API Key group definitions
const API_KEY_1 = {
  id: 'key-abc-123',
  label: 'Production Key',
  scale: 7500000, // Scale to produce ~15M total tokens over 2 buckets
};
const API_KEY_2 = {
  id: 'key-xyz-456',
  label: 'Development Key',
  scale: 3250000, // Scale to produce ~6.5M total tokens over 2 buckets
};

// Generate mock data using factories
const mockUsageDataByModel = createUsageData([LLAMA_MODEL, MISTRAL_MODEL]);
const mockUsageDataByApiKey = createUsageData([API_KEY_1, API_KEY_2]);

// Handler that responds based on group_by parameter
const createDynamicUsageHandler = () => {
  return http.post(USAGE_ENDPOINT, async ({ request }) => {
    try {
      const body = (await request.json()) as { group_by?: string };
      if (body?.group_by === 'api-key') {
        return HttpResponse.json(mockUsageDataByApiKey);
      }
    } catch {
      // Empty body, use default
    }
    return HttpResponse.json(mockUsageDataByModel);
  });
};

describe('Usage', () => {
  beforeEach(() => {
    server.use(
      http.post(USAGE_ENDPOINT, () => {
        return HttpResponse.json(mockUsageDataByModel);
      }),
      http.options(USAGE_ENDPOINT, () => {
        return new HttpResponse(null, { status: 200 });
      })
    );
  });

  it('renders the Usage tab with charts', async () => {
    const { getByText } = renderWithTheme(<Usage />);

    await waitFor(() => {
      expect(getByText('Total Tokens')).toBeVisible();
    });

    expect(getByText('Input Tokens')).toBeVisible();
    expect(getByText('Output Tokens')).toBeVisible();
    expect(getByText('Total Requests')).toBeVisible();
  });

  it('renders chart cards', async () => {
    const { getByText } = renderWithTheme(<Usage />);

    await waitFor(() => {
      expect(getByText(TOTAL_TOKENS_BY_MODEL)).toBeVisible();
    });

    expect(getByText('Input Tokens by Model')).toBeVisible();
    expect(getByText('Output Tokens by Model')).toBeVisible();
    expect(getByText('Requests by Model')).toBeVisible();
  });

  it('renders model options in the filter dropdown', async () => {
    const { getByLabelText } = renderWithTheme(<Usage />);

    await waitFor(() => {
      // The filter dropdown should be rendered with "Model" aria-label
      getByLabelText('Model');
    });
  });

  it('shows No Data when API returns empty time_series', async () => {
    server.use(
      http.post(USAGE_ENDPOINT, () => {
        return HttpResponse.json({
          breakdown: [],
          summary: {
            avg_latency_ms: 0,
            failed_requests: 0,
            input_tokens: 0,
            output_tokens: 0,
            successful_requests: 0,
            total_requests: 0,
            total_tokens: 0,
          },
          time_series: [],
        });
      })
    );

    const { getAllByText } = renderWithTheme(<Usage />);

    await waitFor(() => {
      // Should show "No Data" in the metric cards
      const noDataElements = getAllByText('No Data');
      expect(noDataElements.length).toBeGreaterThan(0);
    });
  });
});

describe('Usage - Metrics By toggle behavior', () => {
  it('switches chart titles from "Model" to "API Key" when toggled', async () => {
    let lastGroupBy: string | undefined;

    server.use(
      http.post(USAGE_ENDPOINT, async ({ request }) => {
        try {
          const body = (await request.json()) as { group_by?: string };
          lastGroupBy = body?.group_by;
          if (body?.group_by === 'api-key') {
            return HttpResponse.json(mockUsageDataByApiKey);
          }
        } catch {
          // Empty body
        }
        return HttpResponse.json(mockUsageDataByModel);
      })
    );

    const user = userEvent.setup();
    const { getByText } = renderWithTheme(<Usage />);

    // Wait for initial render with Model view
    await waitFor(() => {
      expect(getByText(TOTAL_TOKENS_BY_MODEL)).toBeVisible();
    });
    expect(getByText('Input Tokens by Model')).toBeVisible();
    expect(getByText('Requests by Model')).toBeVisible();
    expect(lastGroupBy).toBe('model');

    // Click the "API Key" toggle option
    await user.click(getByText('API Key'));

    // Titles should update to show "API Key"
    await waitFor(() => {
      expect(getByText('Total Tokens by API Key')).toBeVisible();
    });
    expect(getByText('Input Tokens by API Key')).toBeVisible();
    expect(getByText('Requests by API Key')).toBeVisible();

    // Verify the API was called with group_by: 'api-key'
    expect(lastGroupBy).toBe('api-key');
  });

  it('shows API Key filter dropdown when in API Key view', async () => {
    server.use(createDynamicUsageHandler());

    const user = userEvent.setup();
    const { getByLabelText, getByText } = renderWithTheme(<Usage />);

    // Wait for initial render - Model dropdown should be enabled
    await waitFor(() => {
      expect(getByText(TOTAL_TOKENS_BY_MODEL)).toBeVisible();
    });
    expect(getByLabelText('Model')).not.toBeDisabled();

    // Switch to API Key view
    await user.click(getByText('API Key'));

    // API Key dropdown should now be enabled, Model should be disabled
    await waitFor(() => {
      expect(getByLabelText('API Key')).not.toBeDisabled();
    });
  });
});

describe('Usage - Filter dropdown', () => {
  it('renders both Model and API Key filter dropdowns', async () => {
    server.use(createDynamicUsageHandler());

    const { getByLabelText, getByText } = renderWithTheme(<Usage />);

    // Wait for data to load
    await waitFor(() => {
      expect(getByText(TOTAL_TOKENS_BY_MODEL)).toBeVisible();
    });

    // Both dropdowns should exist and Model should be enabled (default view)
    expect(getByLabelText('Model')).not.toBeDisabled();
    // API Key dropdown exists (getByLabelText will throw if not found)
    getByLabelText('API Key');
  });
});

describe('Usage - Metric card values', () => {
  it('displays formatted token values from API data', async () => {
    server.use(createDynamicUsageHandler());

    const { getByText } = renderWithTheme(<Usage />);

    // Wait for data to load and verify metric card values
    // Factory creates: totalTokens = scale * 2 (2 buckets)
    // - Llama: 3,500,000 * 2 = 7M total tokens
    // - Mistral: 1,700,000 * 2 = 3.4M total tokens
    // Combined: 10.4M
    await waitFor(() => {
      expect(getByText('10.4M')).toBeVisible();
    });

    // Input tokens: scale * 0.4 * 2 buckets
    // Llama: 3.5M * 0.4 * 2 = 2.8M, Mistral: 1.7M * 0.4 * 2 = 1.36M
    // Combined: ~4.16M
    expect(getByText('4.2M')).toBeVisible();

    // Output tokens: scale * 0.6 * 2 buckets
    // Llama: 3.5M * 0.6 * 2 = 4.2M, Mistral: 1.7M * 0.6 * 2 = 2.04M
    // Combined: ~6.24M
    expect(getByText('6.2M')).toBeVisible();

    // Total requests: scale * 0.001 * 2 buckets
    // Llama: 3500 * 2 = 7000, Mistral: 1700 * 2 = 3400
    // Combined: 10400 = 10.4K
    expect(getByText('10.4K')).toBeVisible();
  });

  it('updates metric values when switching to API Key view', async () => {
    server.use(createDynamicUsageHandler());

    const user = userEvent.setup();
    const { getByText, queryByText } = renderWithTheme(<Usage />);

    // Wait for Model view data
    await waitFor(() => {
      expect(getByText('10.4M')).toBeVisible();
    });

    // Switch to API Key view
    await user.click(getByText('API Key'));

    // API Key view has different totals:
    // Key 1: 7.5M * 2 = 15M, Key 2: 3.25M * 2 = 6.5M
    // Combined: 21.5M
    await waitFor(() => {
      expect(getByText('21.5M')).toBeVisible();
    });

    // Model view total should no longer be visible
    expect(queryByText('10.4M')).not.toBeInTheDocument();
  });
});

// Additional model groups for Top 5 + Other testing
// Now we send ALL 8 models to the API, and the UI aggregates to Top 5 + Other
const MODEL_3 = { id: 'gemma-4-26b', label: 'Gemma 4 26B', scale: 22500000 };
const MODEL_4 = { id: 'qwen3-8b', label: 'Qwen3 8B', scale: 15000000 };
const MODEL_5 = { id: 'deepseek-r1', label: 'DeepSeek R1', scale: 7500000 };
// Models that will be aggregated into "Other" by the UI
const MODEL_6 = { id: 'phi-3-mini', label: 'Phi 3 Mini', scale: 2500000 };
const MODEL_7 = { id: 'gemma-2b', label: 'Gemma 2B', scale: 1500000 };
const MODEL_8 = { id: 'tiny-llama', label: 'Tiny Llama', scale: 1000000 };
const OTHER_LABEL = 'Other (3 models)';

// All 8 models - UI will show top 5 by usage and aggregate the rest into "Other"
const allEightModels = [
  { ...LLAMA_MODEL, scale: 35000000 }, // ~70M total tokens (Top 1)
  { ...MISTRAL_MODEL, scale: 30000000 }, // ~60M total tokens (Top 2)
  MODEL_3, // ~45M total tokens (Top 3)
  MODEL_4, // ~30M total tokens (Top 4)
  MODEL_5, // ~15M total tokens (Top 5)
  MODEL_6, // ~5M total tokens (aggregated into Other)
  MODEL_7, // ~3M total tokens (aggregated into Other)
  MODEL_8, // ~2M total tokens (aggregated into Other)
];

// Generate mock data with all 8 models - UI will aggregate to Top 5 + Other
const mockUsageDataWithAllModels = createUsageData(allEightModels);

describe('Usage - Top N + Other aggregation', () => {
  it('displays "Other" category when API returns more than 5 groups', async () => {
    server.use(
      http.post(USAGE_ENDPOINT, () => {
        return HttpResponse.json(mockUsageDataWithAllModels);
      })
    );

    const { getAllByText } = renderWithTheme(<Usage />);

    // Wait for data to load and verify "Other" label is displayed
    // The UI aggregates the bottom 3 models into "Other (3 models)"
    await waitFor(() => {
      const otherElements = getAllByText(OTHER_LABEL);
      expect(otherElements.length).toBeGreaterThan(0);
      expect(otherElements[0]).toBeVisible();
    });
  });

  it('displays all top 5 models plus Other in the filter dropdown', async () => {
    server.use(
      http.post(USAGE_ENDPOINT, () => {
        return HttpResponse.json(mockUsageDataWithAllModels);
      })
    );

    const { getAllByText, getByLabelText } = renderWithTheme(<Usage />);

    // Wait for data to load - Other label should appear in charts
    await waitFor(() => {
      const otherElements = getAllByText(OTHER_LABEL);
      expect(otherElements.length).toBeGreaterThan(0);
    });

    // Verify the Model dropdown is enabled and contains the expected models
    expect(getByLabelText('Model')).not.toBeDisabled();

    // All 6 groups (5 models + Other) should be present in the data
    // The dropdown gets populated from the chart data series
    expect(getAllByText(LLAMA_MODEL.label).length).toBeGreaterThan(0);
    expect(getAllByText(MISTRAL_MODEL.label).length).toBeGreaterThan(0);
    expect(getAllByText(MODEL_3.label).length).toBeGreaterThan(0);
    expect(getAllByText(MODEL_4.label).length).toBeGreaterThan(0);
    expect(getAllByText(MODEL_5.label).length).toBeGreaterThan(0);
  });

  it('includes Other group in total token calculations', async () => {
    server.use(
      http.post(USAGE_ENDPOINT, () => {
        return HttpResponse.json(mockUsageDataWithAllModels);
      })
    );

    const { getByText } = renderWithTheme(<Usage />);

    // Total tokens from all 8 models (UI aggregates bottom 3 into Other)
    // The factory creates: totalTokens = scale * 2 (2 buckets)
    // Sum of scales: 35M + 30M + 22.5M + 15M + 7.5M + 2.5M + 1.5M + 1M = 115M
    // Total tokens = 115M * 2 = 230M
    await waitFor(() => {
      expect(getByText('230M')).toBeVisible();
    });
  });
});
