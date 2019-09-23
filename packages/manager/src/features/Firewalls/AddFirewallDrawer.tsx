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
interface Props extends DrawerProps {}

type CombinedProps = Props & LinodeProps;

const AddFirewallDrawer: React.FC<CombinedProps> = props => {
  const {
    getLinodes,
    loading: linodesLoading,
    error: linodesError,
    results: linodesResults,
    entities: linodesEntities,
    lastUpdated: linodesLastUpdated,
    ...restOfDrawerProps
  } = props;

  const [selectedLinodes, handleSelectLinodes] = React.useState<
    Item<number | string>[]
  >([]);

  const inputRef = React.useCallback(
    node => {
      /**
       * focus on first textfield when drawer is opened
       */
      if (node && node.focus && props.open === true) {
        node.focus();
      }
    },
    [props.open]
  );

  const submitForm = () => {
    /**
     * if user selected _ALL_, create an array of Linode IDs for every Linode
     * otherwise use the values from the react-select input value
     */
    const payloadAsArrayOfLinodeIDs = userSelectedAllLinodes(selectedLinodes)
      ? linodesEntities.map(eachLinode => eachLinode.id)
      : selectedLinodes.map(eachValue => eachValue.value);

    return payloadAsArrayOfLinodeIDs;
  };

  return (
    <Drawer {...restOfDrawerProps}>
      <TextField label="Name" required inputRef={inputRef} />
      <Select
        label="Rules"
        textFieldProps={{
          required: true,
          helperText: `Add one or more predefined rules to this firewall. You can edit the
          default parameters for these rules after you create the firewall.`,
          helperTextPosition: 'top'
        }}
        onChange={() => null}
      />
      <Select
        isLoading={linodesLoading}
        value={
          /*
            if the user selected _ALL_, that's the only chip
            we want appearing in the actual text field.
           */
          userSelectedAllLinodes(selectedLinodes)
            ? [
                {
                  value: 'ALL',
                  label: 'All Linodes'
                }
              ]
            : selectedLinodes
        }
        isMulti
        options={
          /*
            basically, don't show any dropdown options
            if the user has selected _ALL_
           */
          userSelectedAllLinodes(selectedLinodes)
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
                ...linodesEntities.map(eachLinode => ({
                  value: eachLinode.id,
                  label: eachLinode.label
                }))
              ]
        }
        onChange={(values: Item<number | string>[]) =>
          handleSelectLinodes(values)
        }
        placeholder="Select a Linode or type to search..."
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
          onClick={submitForm}
          data-qa-submit
          loading={false}
        >
          Create
        </Button>
        <Button
          onClick={props.onClose as any}
          buttonType="cancel"
          data-qa-cancel
        >
          Cancel
        </Button>
      </ActionsPanel>
    </Drawer>
  );
};

const userSelectedAllLinodes = (values: Item<string | number>[]) =>
  values.some(eachValue => eachValue.value === 'ALL');

export default compose<CombinedProps, Props>(
  React.memo,
  withLinodes()
)(AddFirewallDrawer);
