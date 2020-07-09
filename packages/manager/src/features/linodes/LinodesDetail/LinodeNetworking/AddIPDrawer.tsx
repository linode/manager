import * as React from 'react';
import { Link } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';

const useStyles = makeStyles((theme: Theme) => ({
  copy: {
    marginTop: 16
  }
}));

type IPType = 'v4Public' | 'v4Private' | 'v6';

const ipOptions: Item<IPType>[] = [
  { value: 'v4Public', label: 'IPv4 – Public' },
  { value: 'v4Private', label: 'IPv4 – Private' },
  { value: 'v6', label: 'IPv6' }
];

// @todo: Pre-fill support tickets
const explainerCopy: Record<IPType, JSX.Element> = {
  v4Public: (
    <>
      Public IP addresses, over and above the one included with each Linode,
      incur an additional monthly charge. If you need an additional Public IP
      Address you must request one. Please open a{' '}
      <Link to="support/tickets">Support Ticket</Link> if you have not done so
      already.
    </>
  ),
  v4Private: (
    <>
      Add a private IP address to your Linode. Data sent explicitly to and from
      private IP addresses in the same data center does not incur transfer quota
      usage. To ensure that the private IP is properly configured once added,
      it&apos;s best to reboot your Linode.
    </>
  ),

  v6: (
    <>
      IPv6 addresses are allocated as ranges, which you can choose to distribute
      and further route yourself. These ranges can only be allocated by our
      support team. Please open a{' '}
      <Link to="support/tickets">Support Ticket</Link> and request an IPv6 range
      for this Linode.
    </>
  )
};

const tooltipCopy: Record<IPType, JSX.Element | null> = {
  v4Public: null,
  v4Private: <>This Linode already has a private IP address.</>,
  v6: (
    <>
      Please open a <Link to="support/tickets">Support Ticket</Link> and request
      an IPv6 range for this Linode.
    </>
  )
};

interface Props {
  open: boolean;
  onClose: () => void;
  linodeID: number;
  hasPrivateIPAddress: boolean;
}

type CombinedProps = Props;

const AddIPDrawer: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const [selected, setSelected] = React.useState<IPType>('v4Public');

  const { open, onClose, linodeID, hasPrivateIPAddress } = props;

  const handleAllocate = () => null;

  const disabled =
    (selected === 'v4Private' && hasPrivateIPAddress) || selected === 'v6';

  const AllocateButton = (
    <Button
      buttonType="primary"
      onClick={handleAllocate}
      disabled={disabled}
      style={{ marginBottom: 8 }}
    >
      Allocate
    </Button>
  );

  return (
    <Drawer open={open} onClose={onClose} title="Add an IP Address">
      <React.Fragment>
        <EnhancedSelect
          // onBlur={onBlur}
          name={'IP type'}
          label="IP type"
          // placeholder="Select a Volume"
          value={ipOptions.find(thisOption => thisOption.value === selected)}
          // isLoading={loading}
          // errorText={error}
          options={ipOptions}
          onChange={(_selected: Item<IPType>) => setSelected(_selected.value)}
          isClearable={false}
          // onInputChange={this.onInputChange}
          // disabled={disabled}
        />
        <Typography variant="body1" className={classes.copy}>
          {explainerCopy[selected]}
        </Typography>
        <ActionsPanel style={{ marginTop: 16 }}>
          {disabled ? (
            <Tooltip title={tooltipCopy[selected]}>
              <div style={{ display: 'inline' }}>{AllocateButton}</div>
            </Tooltip>
          ) : (
            AllocateButton
          )}
          <Button buttonType="secondary" onClick={onClose} data-qa-cancel>
            Close
          </Button>
        </ActionsPanel>
      </React.Fragment>
    </Drawer>
  );
};

export default AddIPDrawer;
