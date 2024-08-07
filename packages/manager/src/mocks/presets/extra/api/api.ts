import { http } from 'msw';

import { getExtraPresetsMap } from 'src/dev-tools/utils';

import type { MockPresetExtra } from 'src/mocks/types';

const APIResponseTime = () => {
  const responseTime = getExtraPresetsMap()['api:response-time'] || 0;

  return [
    http.all('*/v4*/*', async () => {
      // Simulating a 500ms delay for all requests
      // to make the UI feel more realistic (e.g. loading states)
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, responseTime);
        // Clear the timer if the request is aborted
        // to avoid any potential memory leaks
        return () => clearTimeout(timer);
      });
    }),
  ];
};

export const apiResponseTimePreset: MockPresetExtra = {
  canUpdateCount: true,
  desc: 'Allows to customize API response time',
  group: {
    id: 'API',
    type: 'single',
  },
  handlers: [APIResponseTime],
  id: 'api:response-time',
  label: 'API Response Time (ms)',
};
