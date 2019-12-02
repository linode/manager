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

/* tslint:disable-next-line */
interface Props extends Omit<DrawerProps, 'onClose'> {
  onClose: () => void;
}

type CombinedProps = Props & LinodeProps;

const AddFirewallDrawer: React.FC<CombinedProps> = props => {
  const {
    getLinodes,
    linodesLoading,
    linodesError,
    linodesResults,
    linodesData,
    linodesLastUpdated,
    ...restOfDrawerProps
  } = props;

  const [selectedLinodes, handleSelectLinodes] = React.useState<
    Item<number | string>[]
  >([]);

  const submitForm = () => {
    /**
     * if user selected _ALL_, create an array of Linode IDs for every Linode
     * otherwise use the values from the react-select input value
     */
    const payloadAsArrayOfLinodeIDs = userSelectedAllLinodes(selectedLinodes)
      ? linodesData.map(eachLinode => eachLinode.id)
      : selectedLinodes.map(eachValue => eachValue.value);

    return payloadAsArrayOfLinodeIDs;
  };

  const handleCloseDrawer = () => {
    handleSelectLinodes([]);
    props.onClose();
  };

  const allLinodesAreSelected = userSelectedAllLinodes(selectedLinodes);

  return (
    <Drawer {...restOfDrawerProps} onClose={handleCloseDrawer}>
      <TextField
        aria-label="Name of your new firewall"
        label="Name"
        required
        // inputRef={inputRef}
        inputProps={{
          autoFocus: true
        }}
      />
      <Select
        label="Rules"
        aria-label="Select predefined rules for your firewall."
        textFieldProps={{
          required: true,
          helperText: `Add one or more predefined rules to this firewall. You can edit the
          default parameters for these rules after you create the firewall.`,
          helperTextPosition: 'top',
          label: 'Rules'
        }}
        onChange={() => null}
      />
      <Select
        label="Linodes"
        isLoading={linodesLoading}
        errorText={linodesError ? linodesError[0].reason : ''}
        value={
          /*
            if the user selected _ALL_, that's the only chip
            we want appearing in the actual text field.
           */
          allLinodesAreSelected
            ? [
                {
                  value: 'ALL',
                  label: 'All Linodes'
                }
              ]
            : selectedLinodes
        }
        isMulti
        options={generateOptions(
          allLinodesAreSelected,
          linodesData,
          linodesError
        )}
        onChange={(values: Item<number | string>[]) =>
          handleSelectLinodes(values)
        }
        placeholder="Select a Linode or type to search..."
        aria-label="Select which Linodes to which you want to apply this new firewall"
        textFieldProps={{
          helperTextPosition: 'top',
          helperText: `Assign one or more Linodes to this firewall. You can
          add Linodes later if you want to customize your rules first.`,
          label: 'Linodes'
        }}
        hideSelectedOptions={true}
      />
      <ActionsPanel>
        <Button
          buttonType="primary"
          onClick={submitForm}
          data-qa-submit
          loading={false}
        >
          Create
        </Button>
        <Button onClick={handleCloseDrawer} buttonType="cancel" data-qa-cancel>
          Cancel
        </Button>
      </ActionsPanel>
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
