import { ActionsPanel } from '@linode/ui';
import * as React from 'react';

import { AssignRuleSetSection } from './AssignRuleSetSection';

import type { FirewallRuleSetFormProps } from './FirewallRuleDrawer.types';

export const FirewallRuleSetForm = React.memo(
  (props: FirewallRuleSetFormProps) => {
    const {
      category,
      errors,
      handleSubmit,
      ruleErrors,
      setFieldError,
      setFieldValue,
      values,
    } = props;

    // Set form field errors for each error
    React.useEffect(() => {
      ruleErrors?.forEach((thisError) => {
        setFieldError(thisError.formField, thisError.reason);
      });
    }, [ruleErrors, setFieldError]);

    return (
      <form onSubmit={handleSubmit}>
        <AssignRuleSetSection
          category={category}
          errorText={errors.ruleset}
          handleRuleSetChange={(ruleSetId) =>
            setFieldValue('ruleset', ruleSetId)
          }
          selectedRuleSetId={values.ruleset}
        />

        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            label: 'Add Rule',
            type: 'submit',
          }}
        />
      </form>
    );
  }
);
