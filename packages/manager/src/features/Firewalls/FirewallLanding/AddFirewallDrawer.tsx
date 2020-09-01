import { Formik, FormikBag } from 'formik';
import {
  CreateFirewallPayload,
  CreateFirewallSchema,
  Firewall
} from '@linode/api-v4/lib/firewalls';
import { equals } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer, { DrawerProps } from 'src/components/Drawer';
import Select, { Item } from 'src/components/EnhancedSelect';
import LinodeMultiSelect from 'src/components/LinodeMultiSelect';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import {
  handleFieldErrors,
  handleGeneralErrors
} from 'src/utilities/formikErrorUtils';
import {
  firewallOptionItemsLong,
  PredefinedFirewall,
  predefinedFirewalls
} from '../shared';

/* tslint:disable-next-line */
interface Props extends Omit<DrawerProps, 'onClose' | 'onSubmit'> {
  onClose: () => void;
  onSubmit: (payload: CreateFirewallPayload) => Promise<Firewall>;
}

export type FormikProps = FormikBag<CombinedProps, CreateFirewallPayload>;

type CombinedProps = Props;

const initialValues: CreateFirewallPayload = {
  label: '',
  rules: {},
  devices: {
    linodes: []
  }
};

/**
 *
 * We need to generate a single "rules" payload to store in Formik state,
 * which will become the payload passed to createFirewall.
 *
 * To do this, we iterate over the selected rules, which is a list of Items.
 * We attempt to match each selected rule with a value in predefinedFirewalls.
 *
 * Each predefined rule has an array with a single entry for both inbound and outbound.
 * We accumulate these together and return the result.
 */
const defaultRules = {
  inbound: [],
  outbound: []
};
export const mergeRules = (
  selectedRules: Item<string>[],
  rules: Record<string, PredefinedFirewall> = predefinedFirewalls
) => {
  if (selectedRules.length === 0) {
    return {};
  }
  const mergedRules = selectedRules.reduce(
    (acc, currentRule) => {
      const rule = rules[currentRule.value];
      if (!rule) {
        return acc;
      }
      return {
        inbound: [...(acc?.inbound ?? []), ...(rule.inbound ?? [])],
        outbound: [...(acc?.outbound ?? []), ...(rule.outbound ?? [])]
      };
    },
    {
      ...defaultRules
    }
  );
  // We're using an empty object as our placeholder state, but the accumulator
  // has to have the correct shape for the logic above to work.
  // If nothing has changed, return the placeholder value {}.
  return equals(mergedRules, defaultRules) ? {} : mergedRules;
};

const AddFirewallDrawer: React.FC<CombinedProps> = props => {
  const { onClose, onSubmit, ...restOfDrawerProps } = props;

  const handleSelectRules = (selected: Item<string>[], cb: Function) => {
    const payload = mergeRules(selected);
    cb('rules', payload);
  };

  const submitForm = (
    values: CreateFirewallPayload,
    { setSubmitting, setErrors, setStatus }: FormikProps
  ) => {
    // Clear drawer error state
    setStatus(undefined);
    setErrors({});

    if (values.label === '') {
      values.label = undefined;
    }

    if (
      Array.isArray(values.rules.inbound) &&
      values.rules.inbound.length === 0
    ) {
      values.rules.inbound = undefined;
    }

    if (
      Array.isArray(values.rules.outbound) &&
      values.rules.outbound.length === 0
    ) {
      values.rules.outbound = undefined;
    }

    onSubmit(values)
      .then(() => {
        setSubmitting(false);
        onClose();
      })
      .catch(err => {
        const mapErrorToStatus = (generalError: string) =>
          setStatus({ generalError });

        setSubmitting(false);
        handleFieldErrors(setErrors, err);
        handleGeneralErrors(mapErrorToStatus, err, 'Error creating Firewall.');
      });
  };

  return (
    <Drawer {...restOfDrawerProps} onClose={onClose}>
      <Formik
        initialValues={initialValues}
        validationSchema={CreateFirewallSchema}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={submitForm}
      >
        {({
          values,
          errors,
          status,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          setFieldValue,
          validateField
        }) => (
          <form onSubmit={handleSubmit}>
            {status && (
              <Notice
                key={status}
                text={status.generalError}
                error
                data-qa-error
              />
            )}
            <TextField
              aria-label="Label for your new Firewall"
              label="Label"
              name="label"
              value={values.label}
              onChange={handleChange}
              errorText={errors.label}
              onBlur={handleBlur}
              inputProps={{
                autoFocus: true
              }}
            />
            <Select
              label="Rules"
              name="rules"
              options={firewallOptionItemsLong}
              errorText={
                errors['rules.inbound'] ||
                errors['rules.outbound'] ||
                errors.rules // errors.rules is where Yup validation errors will end up
                  ? 'Please select at least one rule.'
                  : undefined
              } // API errors such as "Inbound is required" not helpful with a pre-defined list
              isMulti
              aria-label="Select predefined rules for your firewall."
              textFieldProps={{
                required: true,
                helperText: `Add one or more predefined rules to this firewall. You can edit the
              default parameters for these rules after you create the firewall.`,
                helperTextPosition: 'top'
              }}
              onChange={(items: Item<string>[]) =>
                handleSelectRules(items, setFieldValue)
              }
              onBlur={handleBlur}
            />
            <LinodeMultiSelect
              showAllOption
              helperText="Add one or more predefined rules to this firewall. You can edit the
              default parameters for these rules after you create the firewall."
              errorText={errors['devices.linodes']}
              handleChange={(selected: number[]) =>
                setFieldValue('devices.linodes', selected)
              }
              onBlur={handleBlur}
            />
            <ActionsPanel>
              <Button
                buttonType="primary"
                onClick={() => handleSubmit()}
                data-qa-submit
                loading={isSubmitting}
              >
                Create
              </Button>
              <Button onClick={onClose} buttonType="cancel" data-qa-cancel>
                Cancel
              </Button>
            </ActionsPanel>
          </form>
        )}
      </Formik>
    </Drawer>
  );
};

export default compose<CombinedProps, Props>(React.memo)(AddFirewallDrawer);
