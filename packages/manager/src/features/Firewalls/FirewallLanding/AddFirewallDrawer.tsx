import { Formik } from 'formik';
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
import TextField from 'src/components/TextField';

import withLinodes, {
  Props as LinodeProps
} from 'src/containers/withLinodes.container';

import { firewallOptionItems, predefinedFirewalls } from '../shared';

/* tslint:disable-next-line */
interface Props extends Omit<DrawerProps, 'onClose' | 'onSubmit'> {
  onClose: () => void;
  onSubmit: (payload: CreateFirewallPayload) => Promise<Firewall>;
}

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

  const [selectedRules, setRules] = React.useState<Item<string>[]>([]);
  const [selectAll, toggleSelectAll] = React.useState<boolean>(false);

  const handleSelectLinodes = (selectedLinodes: Item<number>[]) => {
    const hasSelectedAll = userSelectedAllLinodes(selectedLinodes);
    toggleSelectAll(hasSelectedAll);
    return hasSelectedAll
      ? linodesData.map(eachLinode => eachLinode.id)
      : selectedLinodes.map(eachValue => eachValue.value);
  };

  const handleSelectRules = (selected: Item<string>[], cb: Function) => {
    setRules(selected);
    const payload = mergeRules(selected);
    cb('rules', payload);
  };

  const submitForm = (values: any) => {
    // console.log(values);
    /**
     * if user selected _ALL_, create an array of Linode IDs for every Linode
     * otherwise use the values from the react-select input value
     */
  };

  const handleCloseDrawer = () => {
    props.onClose();
  };

  return (
    <Drawer {...restOfDrawerProps} onClose={handleCloseDrawer}>
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
          setFieldValue
        }) => (
          <form onSubmit={handleSubmit}>
            <TextField
              aria-label="Label for your new Firewall"
              label="Label"
              name="label"
              value={values.label}
              onChange={handleChange}
              required
              inputProps={{
                autoFocus: true
              }}
            />
            <Select
              label="Rules"
              options={firewallOptionItems}
              isMulti
              aria-label="Select predefined rules for your firewall."
              value={selectedRules}
              textFieldProps={{
                required: true,
                helperText: `Add one or more predefined rules to this firewall. You can edit the
              default parameters for these rules after you create the firewall.`,
                helperTextPosition: 'top'
              }}
              onChange={(items: Item<string>[]) =>
                handleSelectRules(items, setFieldValue)
              }
            />
            <Select
              label="Linodes"
              isLoading={linodesLoading}
              errorText={linodesError && linodesError[0]?.reason}
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
              <Button
                onClick={handleCloseDrawer}
                buttonType="cancel"
                data-qa-cancel
              >
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
