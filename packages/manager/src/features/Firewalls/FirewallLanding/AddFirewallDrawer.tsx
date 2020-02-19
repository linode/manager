import { Formik, FormikBag } from 'formik';
import {
  CreateFirewallPayload,
  CreateFirewallSchema,
  Firewall
} from 'linode-js-sdk/lib/firewalls';
import * as React from 'react';
import { compose } from 'recompose';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer, { DrawerProps } from 'src/components/Drawer';
import Select, { Item } from 'src/components/EnhancedSelect';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';

import withLinodes, {
  Props as LinodeProps
} from 'src/containers/withLinodes.container';
import {
  handleFieldErrors,
  handleGeneralErrors
} from 'src/utilities/formikErrorUtils';

import { firewallOptionItems, predefinedFirewalls } from '../shared';

/* tslint:disable-next-line */
interface Props extends Omit<DrawerProps, 'onClose' | 'onSubmit'> {
  onClose: () => void;
  onSubmit: (payload: CreateFirewallPayload) => Promise<Firewall>;
}

export type FormikProps = FormikBag<CombinedProps, CreateFirewallPayload>;

type CombinedProps = Props & LinodeProps;

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
export const mergeRules = (selectedRules: Item<string>[]) => {
  return selectedRules.reduce(
    (acc, currentRule) => {
      const rule = predefinedFirewalls[currentRule.value];
      if (!rule) {
        return acc;
      }
      return {
        inbound: [...acc.inbound, ...rule.inbound],
        outbound: [...acc.outbound, ...rule.outbound]
      };
    },
    {
      inbound: [],
      outbound: []
    }
  );
};

const AddFirewallDrawer: React.FC<CombinedProps> = props => {
  const {
    getLinodes,
    linodesLoading,
    linodesError,
    linodesResults,
    linodesData,
    linodesLastUpdated,
    onClose,
    onSubmit,
    ...restOfDrawerProps
  } = props;

  const linodeError = linodesError && linodesError[0]?.reason;

  const [selectAll, toggleSelectAll] = React.useState<boolean>(false);

  const handleSelectLinodes = (selectedLinodes: Item<number>[]) => {
    const hasSelectedAll = userSelectedAllLinodes(selectedLinodes);
    toggleSelectAll(hasSelectedAll);
    return hasSelectedAll
      ? linodesData.map(eachLinode => eachLinode.id)
      : selectedLinodes.map(eachValue => eachValue.value);
  };

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
              required
              inputProps={{
                autoFocus: true
              }}
            />
            <Select
              label="Rules"
              name="rules"
              options={firewallOptionItems}
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
            <Select
              label="Linodes"
              name="linodes"
              isLoading={linodesLoading}
              errorText={linodeError || errors['devices.linodes']}
              isMulti
              options={generateOptions(selectAll, linodesData, linodesError)}
              noOptionsMessage={({ inputValue }) =>
                linodesData.length === 0 || selectAll
                  ? 'No Linodes available.'
                  : 'No results.'
              }
              onChange={(selected: Item<number>[]) =>
                setFieldValue('devices.linodes', handleSelectLinodes(selected))
              }
              placeholder="Select a Linode or type to search..."
              aria-label="Select which Linodes to which you want to apply this new firewall"
              textFieldProps={{
                helperTextPosition: 'top',
                helperText: `Assign one or more Linodes to this firewall. You can
              add Linodes later if you want to customize your rules first.`
              }}
              hideSelectedOptions={true}
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

const generateOptions = (
  allLinodesAreSelected: boolean,
  linodesData: LinodeProps['linodesData'],
  linodeError: LinodeProps['linodesError']
): Item<any>[] => {
  /** if there's an error, don't show any options */
  if (linodeError) {
    return [];
  }

  return allLinodesAreSelected
    ? [
        {
          value: 'ALL',
          label: 'All Linodes'
        }
      ]
    : [
        {
          value: 'ALL',
          label: 'All Linodes'
        },
        ...linodesData.map(eachLinode => ({
          value: eachLinode.id,
          label: eachLinode.label
        }))
      ];
};

const userSelectedAllLinodes = (values: Item<string | number>[]) =>
  values.some(eachValue => eachValue.value === 'ALL');

export default compose<CombinedProps, Props>(
  React.memo,
  withLinodes()
)(AddFirewallDrawer);
