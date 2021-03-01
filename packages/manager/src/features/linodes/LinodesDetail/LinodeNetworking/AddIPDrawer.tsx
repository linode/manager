import { allocateIPAddress } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { Link } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { makeStyles } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

const useStyles = makeStyles(() => ({
  copy: {
    marginTop: 16,
  },
  ipv6: {
    marginTop: 32,
  },
}));

type IPType = 'v4Public' | 'v4Private';

const ipOptions: Item<IPType>[] = [
  { value: 'v4Public', label: 'IPv4 – Public' },
  { value: 'v4Private', label: 'IPv4 – Private' },
];

// @todo: Pre-fill support tickets.
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
};

const tooltipCopy: Record<IPType, JSX.Element | null> = {
  v4Public: null,
  v4Private: <>This Linode already has a private IP address.</>,
};

interface Props {
  open: boolean;
  onClose: () => void;
  linodeID: number;
  hasPrivateIPAddress: boolean;
  onSuccess: () => void;
  readOnly: boolean;
}

type CombinedProps = Props;

const AddIPDrawer: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const [selected, setSelected] = React.useState<IPType | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const {
    open,
    onClose,
    linodeID,
    hasPrivateIPAddress,
    onSuccess,
    readOnly,
  } = props;

  React.useEffect(() => {
    if (open) {
      setSelected(null);
      setErrorMessage('');
    }
  }, [open]);

  const handleAllocate = () => {
    setSubmitting(true);

    // Only IPv4 addresses can currently be allocated.
    allocateIPAddress(linodeID, {
      type: 'ipv4',
      public: selected === 'v4Public',
    })
      .then((_) => {
        setSubmitting(false);
        onSuccess();
        onClose();
      })
      .catch((errResponse) => {
        setSubmitting(false);
        setErrorMessage(getErrorStringOrDefault(errResponse));
      });
  };

  const disabled =
    (selected === 'v4Private' && hasPrivateIPAddress) || !selected || readOnly;

  const AllocateButton = (
    <Button
      buttonType="primary"
      onClick={handleAllocate}
      disabled={disabled}
      style={{ marginBottom: 8 }}
      loading={submitting}
    >
      Allocate
    </Button>
  );

  const _tooltipCopy =
    disabled && selected
      ? readOnly
        ? 'You do not have permission to modify this Linode.'
        : tooltipCopy[selected]
      : null;

  return (
    <Drawer open={open} onClose={onClose} title="Add an IP Address">
      <React.Fragment>
        <Typography variant="h2">IPv4</Typography>
        {errorMessage && <Notice error text={errorMessage} spacingTop={8} />}
        <EnhancedSelect
          name={'IPv4 type'}
          label="IPv4 type"
          placeholder="Select an IPv4 type"
          value={ipOptions.find((thisOption) => thisOption.value === selected)}
          options={ipOptions}
          onChange={(_selected: Item<IPType>) => setSelected(_selected.value)}
          isClearable={false}
        />
        {selected && (
          <Typography variant="body1" className={classes.copy}>
            {explainerCopy[selected]}
          </Typography>
        )}
        <ActionsPanel style={{ marginTop: 8 }}>
          {_tooltipCopy ? (
            <Tooltip title={_tooltipCopy}>
              <div style={{ display: 'inline' }}>{AllocateButton}</div>
            </Tooltip>
          ) : (
            AllocateButton
          )}
          <Button buttonType="secondary" onClick={onClose} data-qa-cancel>
            Close
          </Button>
        </ActionsPanel>
        <Typography variant="h2" className={classes.ipv6}>
          IPv6
        </Typography>
        <Typography>
          IPv6 addresses are allocated as ranges, which you can choose to
          distribute and further route yourself. These ranges can only be
          allocated by our support team. Please open a{' '}
          <Link to="/support/tickets">Support Ticket</Link> and request an IPv6
          range for this Linode.
        </Typography>
      </React.Fragment>
    </Drawer>
  );
};

export default AddIPDrawer;
