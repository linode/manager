import {
  createUsageData,
  inferenceUsageFactory,
  inferenceUsageTimeSeriesFactory,
} from 'src/factories/inferencePlatform';

import {
  transformAllUsageData,
  transformApiDataToChartPayload,
} from './usageUtils';

// Group definitions for test data
const MODEL_1 = { id: 'qwen3-8b', label: 'Qwen3 8B', scale: 100000 };
const MODEL_2 = {
  id: 'llama-3.3-70b-instruct',
  label: 'Llama 3.3 70B Instruct',
  scale: 70000,
};

// Time bucket constants
const BUCKET_1 = '2026-06-21T14:00:00Z';
const BUCKET_2 = '2026-06-21T15:00:00Z';
const BUCKET_3 = '2026-06-21T16:00:00Z';

// Generate mock data using factories
// Multi-model data with 3 buckets
const mockUsageData = createUsageData(
  [MODEL_1, MODEL_2],
  [BUCKET_1, BUCKET_2, BUCKET_3]
);

// Single model data with 2 buckets for simpler tests
const mockSingleModelData = createUsageData([MODEL_1], [BUCKET_1, BUCKET_2]);

describe('usageUtils', () => {
  describe('transformAllUsageData', () => {
    it('returns no-data payloads when apiData is undefined', () => {
      const result = transformAllUsageData(undefined);

      expect(result.total.series).toHaveLength(1);
      expect(result.total.series[0].id).toBe('no-data');
      expect(result.total.series[0].label).toBe('No Data');
      expect(result.input.series[0].id).toBe('no-data');
      expect(result.output.series[0].id).toBe('no-data');
      expect(result.request.series[0].id).toBe('no-data');
    });

    it('returns no-data payloads when time_series is empty', () => {
      const emptyData = inferenceUsageFactory.build({ time_series: [] });

      const result = transformAllUsageData(emptyData);

      expect(result.total.series[0].id).toBe('no-data');
      expect(result.input.series[0].id).toBe('no-data');
      expect(result.output.series[0].id).toBe('no-data');
      expect(result.request.series[0].id).toBe('no-data');
    });

    it('returns no-data payloads when time_series is undefined', () => {
      const noTimeSeriesData = inferenceUsageFactory.build();
      // @ts-expect-error - Testing undefined time_series edge case
      delete noTimeSeriesData.time_series;

      const result = transformAllUsageData(noTimeSeriesData);

      expect(result.total.series[0].id).toBe('no-data');
    });

    it('transforms valid data into all four chart payloads', () => {
      const result = transformAllUsageData(mockUsageData);

      // Should have series for both models
      expect(result.total.series).toHaveLength(2);
      expect(result.input.series).toHaveLength(2);
      expect(result.output.series).toHaveLength(2);
      expect(result.request.series).toHaveLength(2);
    });

    it('correctly maps series id and label', () => {
      const result = transformAllUsageData(mockUsageData);

      const model1Series = result.total.series.find((s) => s.id === MODEL_1.id);
      const model2Series = result.total.series.find((s) => s.id === MODEL_2.id);

      expect(model1Series?.label).toBe(MODEL_1.label);
      expect(model2Series?.label).toBe(MODEL_2.label);
    });

    it('extracts total tokens correctly', () => {
      const result = transformAllUsageData(mockUsageData);

      const model1Series = result.total.series.find((s) => s.id === MODEL_1.id);

      // Factory creates: totalTokens = scale per bucket
      // Model 1 has scale 100000, so each bucket has 100000 total tokens
      expect(model1Series?.values).toHaveLength(3);
      expect(model1Series?.values[0].value).toBe(MODEL_1.scale);
      expect(model1Series?.values[1].value).toBe(MODEL_1.scale);
      expect(model1Series?.values[2].value).toBe(MODEL_1.scale);
    });

    it('extracts input tokens correctly', () => {
      const result = transformAllUsageData(mockUsageData);

      const model1Series = result.input.series.find((s) => s.id === MODEL_1.id);

      // Factory creates: inputTokens = scale * 0.4
      const expectedInput = Math.floor(MODEL_1.scale * 0.4);
      expect(model1Series?.values[0].value).toBe(expectedInput);
      expect(model1Series?.values[1].value).toBe(expectedInput);
      expect(model1Series?.values[2].value).toBe(expectedInput);
    });

    it('extracts output tokens correctly', () => {
      const result = transformAllUsageData(mockUsageData);

      const model2Series = result.output.series.find(
        (s) => s.id === MODEL_2.id
      );

      // Factory creates: outputTokens = scale * 0.6
      const expectedOutput = Math.floor(MODEL_2.scale * 0.6);
      expect(model2Series?.values[0].value).toBe(expectedOutput);
      expect(model2Series?.values[1].value).toBe(expectedOutput);
      expect(model2Series?.values[2].value).toBe(expectedOutput);
    });

    it('extracts request counts correctly', () => {
      const result = transformAllUsageData(mockUsageData);

      const model1Series = result.request.series.find(
        (s) => s.id === MODEL_1.id
      );

      // Factory creates: requestCount = scale * 0.001
      const expectedRequests = Math.floor(MODEL_1.scale * 0.001);
      expect(model1Series?.values[0].value).toBe(expectedRequests);
      expect(model1Series?.values[1].value).toBe(expectedRequests);
      expect(model1Series?.values[2].value).toBe(expectedRequests);
    });

    it('sorts time series values chronologically', () => {
      // Create data with out-of-order buckets using factory
      const unsortedData = inferenceUsageFactory.build({
        time_series: [
          inferenceUsageTimeSeriesFactory.build({
            bucket: BUCKET_2, // Later bucket first
            group_id: MODEL_1.id,
            group_label: MODEL_1.label,
            total_tokens: 180000,
          }),
          inferenceUsageTimeSeriesFactory.build({
            bucket: BUCKET_1, // Earlier bucket second
            group_id: MODEL_1.id,
            group_label: MODEL_1.label,
            total_tokens: 120000,
          }),
        ],
      });

      const result = transformAllUsageData(unsortedData);

      // Values should be sorted: BUCKET_1 (120000) then BUCKET_2 (180000)
      expect(result.total.series[0].values[0].value).toBe(120000);
      expect(result.total.series[0].values[1].value).toBe(180000);
    });

    it('formats time strings correctly', () => {
      const result = transformAllUsageData(mockSingleModelData);

      const firstValue = result.total.series[0].values[0];

      expect(firstValue.time).toBeDefined();
      expect(typeof firstValue.time).toBe('string');
      // Time should be in HH:MM format
      expect(firstValue.time).toMatch(/^\d{2}:\d{2}$/);
    });

    it('formats date strings correctly', () => {
      const result = transformAllUsageData(mockSingleModelData);

      const firstValue = result.total.series[0].values[0];

      expect(firstValue.date).toBeDefined();
      expect(typeof firstValue.date).toBe('string');
      // Date should be in DD/MM/YYYY format (en-GB locale)
      expect(firstValue.date).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it('keeps time labels unique by including the date across multiple days', () => {
      // Buckets at the same clock time on different days would otherwise
      // collapse to a single "HH:MM" X-axis category and stack every bar.
      const multiDayData = createUsageData(
        [MODEL_1],
        ['2026-06-21T00:00:00Z', '2026-06-22T00:00:00Z', '2026-06-23T00:00:00Z']
      );

      const values = transformAllUsageData(multiDayData).total.series[0].values;

      // For multi-day ranges, time includes the date (DD/MM\nHH:MM) for unique bucketing.
      // xAxisDate is also set for rendering the two-line X-axis tick.
      values.forEach((v) => {
        expect(v.time).toMatch(/^\d{2}\/\d{2}\n\d{2}:\d{2}$/);
        expect(v.xAxisDate).toMatch(/^\d{2}\/\d{2}$/);
      });

      // Every bucket must map to a distinct X-axis category via the time field.
      const times = values.map((v) => v.time);
      expect(new Set(times).size).toBe(values.length);
    });
  });

  describe('transformApiDataToChartPayload', () => {
    it('returns no-data payload when apiData is undefined', () => {
      const result = transformApiDataToChartPayload(undefined);

      expect(result.series).toHaveLength(1);
      expect(result.series[0].id).toBe('no-data');
      expect(result.series[0].label).toBe('No Data');
      expect(result.series[0].values).toHaveLength(1);
      expect(result.series[0].values[0].value).toBe(1);
    });

    it('returns no-data payload when time_series is empty', () => {
      const emptyData = inferenceUsageFactory.build({ time_series: [] });

      const result = transformApiDataToChartPayload(emptyData);

      expect(result.series[0].id).toBe('no-data');
    });

    it('defaults to total tokens when dataType is not specified', () => {
      const result = transformApiDataToChartPayload(mockSingleModelData);

      // Should return total_tokens = scale for each bucket
      expect(result.series[0].values[0].value).toBe(MODEL_1.scale);
      expect(result.series[0].values[1].value).toBe(MODEL_1.scale);
    });

    it('extracts total tokens when dataType is "total"', () => {
      const result = transformApiDataToChartPayload(
        mockSingleModelData,
        'total'
      );

      expect(result.series[0].values[0].value).toBe(MODEL_1.scale);
      expect(result.series[0].values[1].value).toBe(MODEL_1.scale);
    });

    it('extracts input tokens when dataType is "input"', () => {
      const result = transformApiDataToChartPayload(
        mockSingleModelData,
        'input'
      );

      // input_tokens = scale * 0.4
      const expectedInput = Math.floor(MODEL_1.scale * 0.4);
      expect(result.series[0].values[0].value).toBe(expectedInput);
      expect(result.series[0].values[1].value).toBe(expectedInput);
    });

    it('extracts output tokens when dataType is "output"', () => {
      const result = transformApiDataToChartPayload(
        mockSingleModelData,
        'output'
      );

      // output_tokens = scale * 0.6
      const expectedOutput = Math.floor(MODEL_1.scale * 0.6);
      expect(result.series[0].values[0].value).toBe(expectedOutput);
      expect(result.series[0].values[1].value).toBe(expectedOutput);
    });

    it('extracts request count when dataType is "request"', () => {
      const result = transformApiDataToChartPayload(
        mockSingleModelData,
        'request'
      );

      // request_count = scale * 0.001
      const expectedRequests = Math.floor(MODEL_1.scale * 0.001);
      expect(result.series[0].values[0].value).toBe(expectedRequests);
      expect(result.series[0].values[1].value).toBe(expectedRequests);
    });

    it('handles multiple groups correctly', () => {
      const result = transformApiDataToChartPayload(mockUsageData, 'total');

      expect(result.series).toHaveLength(2);

      const model1 = result.series.find((s) => s.id === MODEL_1.id);
      const model2 = result.series.find((s) => s.id === MODEL_2.id);

      expect(model1).toBeDefined();
      expect(model2).toBeDefined();
      expect(model1?.values).toHaveLength(3);
      expect(model2?.values).toHaveLength(3);
    });

    it('preserves group labels', () => {
      const result = transformApiDataToChartPayload(mockUsageData, 'total');

      const model1 = result.series.find((s) => s.id === MODEL_1.id);

      expect(model1?.label).toBe(MODEL_1.label);
    });
  });
});
