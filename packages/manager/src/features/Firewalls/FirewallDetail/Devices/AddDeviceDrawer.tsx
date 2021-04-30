import { Capabilities } from '@linode/api-v4/lib/regions/types';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import LinodeMultiSelect from 'src/components/LinodeMultiSelect';
import Notice from 'src/components/Notice';
import { dcDisplayNames } from 'src/constants';
import { useRegionsQuery } from 'src/queries/regions';
import arrayToList from 'src/utilities/arrayToDelimiterSeparatedList';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import v4 from 'uuid';

interface Props {
  open: boolean;
  error?: APIError[];
  isSubmitting: boolean;
  firewallLabel: string;
  currentDevices: number[];
  onClose: () => void;
  addDevice: (selectedLinodes: number[]) => void;
}

export const AddDeviceDrawer: React.FC<Props> = (props) => {
  const {
    addDevice,
    currentDevices,
    error,
    isSubmitting,
    firewallLabel,
    onClose,
    open,
  } = props;

  const regions = useRegionsQuery().data ?? [];

  const regionsWithFirewalls = regions
    .filter((thisRegion) =>
      thisRegion.capabilities.includes('Cloud Firewall' as Capabilities)
    )
    .map((thisRegion) => thisRegion.id);

  const [selectedLinodes, setSelectedLinodes] = React.useState<number[]>([]);

  // Used to reset the selected form values on form submit, since
  // the LinodeMultiSelect manages its state internally.
  const [key, setKey] = React.useState<string>(v4());

  React.useEffect(() => {
    // If we have a new error, clear out the select values
    if (error && error.length > 0) {
      setKey(v4());
    }
  }, [error]);

  const handleSubmit = () => {
    // @todo handling will have to be added here when we support Firewalls for NodeBalancers
    addDevice(selectedLinodes);
  };

  // @todo title and error messaging will update to "Device" once NodeBalancers are allowed
  const errorMessage = error
    ? getAPIErrorOrDefault(error, 'Error adding Linode')[0].reason
    : undefined;

  return (
    <Drawer
      title={`Add Linode to Firewall: ${firewallLabel}`}
      open={open}
      onClose={onClose}
    >
      <form
        onSubmit={(e: React.ChangeEvent<HTMLFormElement>) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {errorMessage && <Notice error text={errorMessage} />}
        <LinodeMultiSelect
          key={key}
          allowedRegions={regionsWithFirewalls}
          handleChange={(selected) => setSelectedLinodes(selected)}
          helperText={`You can assign one or more Linodes to this Firewall. Only Linodes
          in regions that currently support Firewalls (${arrayToList(
            regionsWithFirewalls.map((thisId) => dcDisplayNames[thisId])
          )}) will be displayed as options. Each Linode can only be assigned to a single Firewall.`}
          filteredLinodes={currentDevices}
        />
        <ActionsPanel>
          <Button
            buttonType="primary"
            disabled={selectedLinodes.length === 0}
            onClick={handleSubmit}
            data-qa-submit
            loading={isSubmitting}
          >
            Add
          </Button>
          <Button onClick={onClose} buttonType="cancel" data-qa-cancel>
            Cancel
          </Button>
        </ActionsPanel>
      </form>
    </Drawer>
  );
};

export default AddDeviceDrawer;
