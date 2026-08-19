import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { UsageSection } from './index';

import type { InferenceUsage } from '@linode/api-v4';

const USAGE_ENDPOINT = '*/v4beta/inference/usage';

const LLAMA_MODEL_ID = 'llama-3.1-8b';
const LLAMA_MODEL_LABEL = 'Llama 3.1 8B';
const MISTRAL_MODEL_ID = 'mistral-7b';
const MISTRAL_MODEL_LABEL = 'Mistral 7B';

const mockUsageData: InferenceUsage = {
  breakdown: [
    {
      id: LLAMA_MODEL_ID,
      input_tokens: 5000000,
      label: LLAMA_MODEL_LABEL,
      output_tokens: 15000000,
      percentage: 60,
      request_count: 50000,
      total_tokens: 20000000,
    },
    {
      id: MISTRAL_MODEL_ID,
      input_tokens: 3000000,
      label: MISTRAL_MODEL_LABEL,
      output_tokens: 10000000,
      percentage: 40,
      request_count: 30000,
      total_tokens: 13000000,
    },
  ],
  summary: {
    avg_latency_ms: 200,
    failed_requests: 100,
    input_tokens: 8000000,
    output_tokens: 25000000,
    successful_requests: 79900,
    total_requests: 80000,
    total_tokens: 33000000,
  },
  time_series: [
    {
      bucket: '2026-06-28T10:00:00Z',
      group_id: LLAMA_MODEL_ID,
      group_label: LLAMA_MODEL_LABEL,
      input_tokens: 200000,
      output_tokens: 600000,
      request_count: 2000,
      total_tokens: 800000,
    },
    {
      bucket: '2026-06-28T10:00:00Z',
      group_id: MISTRAL_MODEL_ID,
      group_label: MISTRAL_MODEL_LABEL,
      input_tokens: 120000,
      output_tokens: 400000,
      request_count: 1200,
      total_tokens: 520000,
    },
    {
      bucket: '2026-06-28T11:00:00Z',
      group_id: LLAMA_MODEL_ID,
      group_label: LLAMA_MODEL_LABEL,
      input_tokens: 250000,
      output_tokens: 750000,
      request_count: 2500,
      total_tokens: 1000000,
    },
    {
      bucket: '2026-06-28T11:00:00Z',
      group_id: MISTRAL_MODEL_ID,
      group_label: MISTRAL_MODEL_LABEL,
      input_tokens: 150000,
      output_tokens: 450000,
      request_count: 1500,
      total_tokens: 600000,
    },
  ],
};

describe('UsageSection', () => {
  beforeEach(() => {
    server.use(
      http.post(USAGE_ENDPOINT, () => {
        return HttpResponse.json(mockUsageData);
      })
    );
  });

  it('renders the Usage section with title', async () => {
    const { getByText } = renderWithTheme(<UsageSection />);

    await waitFor(() => {
      expect(getByText('Usage - Tokens')).toBeVisible();
    });
  });

  it('renders the series filter dropdown', async () => {
    const { container } = renderWithTheme(<UsageSection />);

    await waitFor(() => {
      // CDS Select renders as a web component, not role="combobox"
      // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container -- CDS web component
      expect(container.querySelector('cds-select')).toBeInTheDocument();
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

    const { getByText } = renderWithTheme(<UsageSection />);

    await waitFor(() => {
      expect(getByText('Usage - Tokens')).toBeVisible();
    });
  });
});
