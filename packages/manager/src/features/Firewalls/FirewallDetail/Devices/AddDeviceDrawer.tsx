import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import v4 from 'uuid';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import Link from 'src/components/Link';
import LinodeMultiSelect from 'src/components/LinodeMultiSelect';
import Notice from 'src/components/Notice';
import { useStyles } from 'src/components/Notice/Notice';
import SupportLink from 'src/components/SupportLink';
import { useGrants, useProfile } from 'src/queries/profile';
import { getEntityIdsByPermission } from 'src/utilities/grants';
import { READ_ONLY_LINODES_HIDDEN_MESSAGE } from '../../FirewallLanding/AddFirewallDrawer';

interface Props {
  open: boolean;
  error?: APIError[];
  isSubmitting: boolean;
  currentDevices: number[];
  firewallLabel: string;
  onClose: () => void;
  addDevice: (selectedLinodes: number[]) => void;
}

export const AddDeviceDrawer: React.FC<Props> = (props) => {
  const {
    open,
    error,
    isSubmitting,
    currentDevices,
    firewallLabel,
    onClose,
    addDevice,
  } = props;

  const { data: grants } = useGrants();
  const { data: profile } = useProfile();
  const isRestrictedUser = Boolean(profile?.restricted);

  const classes = useStyles();

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

  // @todo update regex once error messaging updates
  const errorNotice = (errorMsg: string) => {
    // match something like: Linode <linode_label> (ID <linode_id>)
    const linode = /linode (.+?) \(id ([^()]*)\)/i.exec(errorMsg);
    const openTicket = errorMsg.match(/open a support ticket\./i);
    if (openTicket) {
      errorMsg = errorMsg.replace(/open a support ticket\./i, '');
    }
    if (linode) {
      const [, label, id] = linode;
      const labelIndex = errorMsg.indexOf(label);
      errorMsg = errorMsg.replace(/\(id ([^()]*)\)/i, '');
      return (
        <Notice error className={classes.noticeText}>
          {errorMsg.substring(0, labelIndex)}
          <Link to={`/linodes/${id}`}>{label}</Link>
          {errorMsg.substring(labelIndex + label.length)}
          {openTicket ? (
            <>
              <SupportLink text="open a Support ticket" />.
            </>
          ) : null}
        </Notice>
      );
    } else {
      return <Notice error text={errorMessage} />;
    }
  };

  // If a user is restricted, they can not add a read-only Linode to a firewall.
  const readOnlyLinodeIds = isRestrictedUser
    ? getEntityIdsByPermission(grants, 'linode', 'read_only')
    : [];

  const linodeSelectGuidance =
    readOnlyLinodeIds.length > 0 ? READ_ONLY_LINODES_HIDDEN_MESSAGE : undefined;

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
        {errorMessage ? errorNotice(errorMessage) : null}
        <LinodeMultiSelect
          key={key}
          handleChange={(selected) => setSelectedLinodes(selected)}
          helperText={`You can assign one or more Linodes to this Firewall. Each Linode can only be assigned to a single Firewall.`}
          filteredLinodes={[...currentDevices, ...readOnlyLinodeIds]}
          guidance={linodeSelectGuidance}
        />
        <ActionsPanel>
          <Button buttonType="secondary" onClick={onClose} data-qa-cancel>
            Cancel
          </Button>
          <Button
            buttonType="primary"
            onClick={handleSubmit}
            disabled={selectedLinodes.length === 0}
            loading={isSubmitting}
            data-qa-submit
          >
            Add
          </Button>
        </ActionsPanel>
      </form>
    </Drawer>
  );
};

export default AddDeviceDrawer;
