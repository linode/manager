import { omitProps } from '@linode/ui';

import type { CreateAlertDefinitionForm, MetricCriteriaForm } from './types';
import type {
  CreateAlertDefinitionPayload,
  MetricCriteria,
} from '@linode/api-v4';

// filtering out the form properties which are not part of the payload
export const filterFormValues = (
  formValues: CreateAlertDefinitionForm
): CreateAlertDefinitionPayload => {
  const values = omitProps(formValues, [
    'service_type',
    'region',
    'engine_type',
    'severity',
  ]);
  // severity has a need for null in the form for edge-cases, so null-checking and returning it as an appropriate type
  const severity = formValues.severity!;
  return { ...values, severity };
};

export const filterMetricCriteriaFormValues = (
  formValues: MetricCriteriaForm
): MetricCriteria[] => {
  const aggregation_type = formValues.aggregation_type!;
  const operator = formValues.operator!;
  const values = omitProps(formValues, ['aggregation_type', 'operator']);
  return [{ ...values, aggregation_type, operator }];
};
