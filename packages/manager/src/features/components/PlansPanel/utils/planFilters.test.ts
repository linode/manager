import { planSelectionTypeFactory } from 'src/factories/types';

import {
  PLAN_FILTER_TYPE_ALL,
  PLAN_FILTER_TYPE_COMPUTE_OPTIMIZED,
  PLAN_FILTER_TYPE_GENERAL_PURPOSE,
} from '../constants';
import {
  applyPlanFilters,
  filterPlansByGeneration,
  filterPlansByType,
  getAvailableTypes,
  supportsTypeFiltering,
} from './planFilters';

describe('planFilters utilities', () => {
  const createPlan = (
    overrides: Partial<ReturnType<typeof planSelectionTypeFactory.build>>
  ) => planSelectionTypeFactory.build(overrides);

  const g8ComputePlan = createPlan({
    id: 'g8-dedicated-8-4',
    label: 'Dedicated G8 Compute Optimized',
  });

  const g8GeneralPlan = createPlan({
    id: 'g8-dedicated-16-4',
    label: 'Dedicated G8 General Purpose',
  });

  const g7DedicatedPlan = createPlan({
    id: 'g7-dedicated-16-8',
    label: 'Dedicated G7 Plan',
  });

  const g7PremiumPlan = createPlan({
    id: 'g7-premium-64-32',
    label: 'Premium G7 Plan',
  });

  const g6Plan = createPlan({
    id: 'g6-dedicated-16-8',
    label: 'Dedicated G6 Plan',
  });

  const rogueG8Plan = createPlan({
    id: 'g8-dedicated-99-999',
    label: 'Unlisted G8 Plan',
  });

  describe('filterPlansByGeneration', () => {
    it('returns only G8 plans that exist in the allow-list', () => {
      const result = filterPlansByGeneration(
        [g8ComputePlan, g8GeneralPlan, rogueG8Plan, g7DedicatedPlan],
        'g8'
      );

      expect(result).toEqual([g8ComputePlan, g8GeneralPlan]);
    });

    it('returns all G7 plans based on prefix matching', () => {
      const result = filterPlansByGeneration(
        [g7DedicatedPlan, g7PremiumPlan, g8ComputePlan],
        'g7'
      );

      expect(result).toEqual([g7DedicatedPlan, g7PremiumPlan]);
    });

    it('returns all G6 plans based on prefix matching', () => {
      const result = filterPlansByGeneration(
        [g6Plan, g7PremiumPlan, g8ComputePlan],
        'g6'
      );

      expect(result).toEqual([g6Plan]);
    });

    it('returns all dedicated plans (G6, G7, G8) when generation is "all"', () => {
      const result = filterPlansByGeneration(
        [g8ComputePlan, g8GeneralPlan, g7DedicatedPlan, g7PremiumPlan, g6Plan],
        'all'
      );

      expect(result).toEqual([
        g8ComputePlan,
        g8GeneralPlan,
        g7DedicatedPlan,
        g7PremiumPlan,
        g6Plan,
      ]);
    });
  });

  describe('filterPlansByType', () => {
    it('returns all plans when type is "all"', () => {
      const result = filterPlansByType(
        [g8ComputePlan, g8GeneralPlan],
        'g8',
        PLAN_FILTER_TYPE_ALL
      );

      expect(result).toEqual([g8ComputePlan, g8GeneralPlan]);
    });

    it('returns compute optimized plans for G8', () => {
      const result = filterPlansByType(
        [g8ComputePlan, g8GeneralPlan],
        'g8',
        PLAN_FILTER_TYPE_COMPUTE_OPTIMIZED
      );

      expect(result).toEqual([g8ComputePlan]);
    });

    it('returns general purpose plans for G8', () => {
      const result = filterPlansByType(
        [g8ComputePlan, g8GeneralPlan],
        'g8',
        PLAN_FILTER_TYPE_GENERAL_PURPOSE
      );

      expect(result).toEqual([g8GeneralPlan]);
    });

    it('ignores type filtering for G7, G6, and "all" generation', () => {
      const resultG7 = filterPlansByType(
        [g7DedicatedPlan],
        'g7',
        PLAN_FILTER_TYPE_COMPUTE_OPTIMIZED
      );
      const resultG6 = filterPlansByType(
        [g6Plan],
        'g6',
        PLAN_FILTER_TYPE_GENERAL_PURPOSE
      );
      const resultAll = filterPlansByType(
        [g8ComputePlan, g8GeneralPlan],
        'all',
        PLAN_FILTER_TYPE_COMPUTE_OPTIMIZED
      );

      expect(resultG7).toEqual([g7DedicatedPlan]);
      expect(resultG6).toEqual([g6Plan]);
      expect(resultAll).toEqual([g8ComputePlan, g8GeneralPlan]);
    });
  });

  describe('applyPlanFilters', () => {
    it('returns an empty array when no generation is selected', () => {
      const result = applyPlanFilters(
        [g8ComputePlan, g8GeneralPlan],
        undefined,
        PLAN_FILTER_TYPE_ALL
      );

      expect(result).toEqual([]);
    });

    it('applies both generation and type filters', () => {
      const result = applyPlanFilters(
        [g8ComputePlan, g8GeneralPlan, g7DedicatedPlan, g7PremiumPlan, g6Plan],
        'g8',
        PLAN_FILTER_TYPE_GENERAL_PURPOSE
      );

      expect(result).toEqual([g8GeneralPlan]);
    });

    it('returns all dedicated plans when generation is "all"', () => {
      const result = applyPlanFilters(
        [g8ComputePlan, g8GeneralPlan, g7DedicatedPlan, g7PremiumPlan, g6Plan],
        'all',
        PLAN_FILTER_TYPE_ALL
      );

      expect(result).toEqual([
        g8ComputePlan,
        g8GeneralPlan,
        g7DedicatedPlan,
        g7PremiumPlan,
        g6Plan,
      ]);
    });
  });

  describe('supportsTypeFiltering', () => {
    it('only supports type filtering for G8', () => {
      expect(supportsTypeFiltering('g8')).toBe(true);
      expect(supportsTypeFiltering('g7')).toBe(false);
      expect(supportsTypeFiltering('g6')).toBe(false);
      expect(supportsTypeFiltering('all')).toBe(false);
    });
  });

  describe('getAvailableTypes', () => {
    it('returns all type options for G8', () => {
      expect(getAvailableTypes('g8')).toEqual([
        PLAN_FILTER_TYPE_ALL,
        PLAN_FILTER_TYPE_COMPUTE_OPTIMIZED,
        PLAN_FILTER_TYPE_GENERAL_PURPOSE,
      ]);
    });

    it('returns only the "all" option for G7, G6, and "all" generation', () => {
      expect(getAvailableTypes('g7')).toEqual([PLAN_FILTER_TYPE_ALL]);
      expect(getAvailableTypes('g6')).toEqual([PLAN_FILTER_TYPE_ALL]);
      expect(getAvailableTypes('all')).toEqual([PLAN_FILTER_TYPE_ALL]);
    });
  });
});
