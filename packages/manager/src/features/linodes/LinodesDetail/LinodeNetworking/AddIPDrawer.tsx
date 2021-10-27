import { allocateIPAddress } from '@linode/api-v4/lib/linodes';
import { createIPv6Range, IPv6Prefix } from '@linode/api-v4/lib/networking';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Radio from 'src/components/core/Radio';
import RadioGroup from 'src/components/core/RadioGroup';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import { Item } from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

const useStyles = makeStyles((theme: Theme) => ({
  copy: {
    marginTop: theme.spacing(2),
  },
  ipv6: {
    marginTop: theme.spacing(4),
  },
  ipSubheader: {
    marginTop: '1rem',
  },
  radioButtons: {
    marginTop: '0 !important',
  },
}));

type IPType = 'v4Public' | 'v4Private';

const ipOptions: Item<IPType>[] = [
  { value: 'v4Public', label: 'IPv4 – Public' },
  { value: 'v4Private', label: 'IPv4 – Private' },
];

const prefixOptions = [
  { value: '64', label: '/64' },
  { value: '56', label: '/56' },
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

  const [selectedIPv4, setSelectedIPv4] = React.useState<IPType | null>(null);
  const [errorMessageIPv4, setErrorMessageIPv4] = React.useState('');

  const [
    selectedIPv6Prefix,
    setSelectedIPv6Prefix,
  ] = React.useState<IPv6Prefix | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMessageIPv6, setErrorMessageIPv6] = React.useState('');

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
      setSelectedIPv4(null);
      setSelectedIPv6Prefix(null);
      setErrorMessageIPv4('');
      setErrorMessageIPv6('');
    }
  }, [open]);

  const handleIPv4Change = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: 'v4Public' | 'v4Private'
  ) => {
    setSelectedIPv4(value);
  };

  const handleIPv6Change = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any
  ) => {
    setSelectedIPv6Prefix(value);
  };

  const handleAllocateIPv4 = () => {
    setSubmitting(true);

    // Only IPv4 addresses can currently be allocated.
    allocateIPAddress(linodeID, {
      type: 'ipv4',
      public: selectedIPv4 === 'v4Public',
    })
      .then((_) => {
        setSubmitting(false);
        onSuccess();
        onClose();
      })
      .catch((errResponse) => {
        setSubmitting(false);
        setErrorMessageIPv4(getErrorStringOrDefault(errResponse));
      });
  };

  const handleCreateIPv6Range = () => {
    setSubmitting(true);

    createIPv6Range({
      linode_id: linodeID,
      prefix_length: Number(selectedIPv6Prefix) as IPv6Prefix,
    })
      .then((_: any) => {
        setSubmitting(false);
        onSuccess();
        onClose();
      })
      .catch((errResponse: APIError[]) => {
        setSubmitting(false);
        setErrorMessageIPv6(getErrorStringOrDefault(errResponse));
      });
  };

  const disabledIPv4 =
    (selectedIPv4 === 'v4Private' && hasPrivateIPAddress) ||
    !selectedIPv4 ||
    readOnly;

  const AllocateButton = (
    <Button
      buttonType="primary"
      onClick={handleAllocateIPv4}
      disabled={disabledIPv4}
      style={{ marginBottom: 8 }}
      loading={submitting}
    >
      Allocate
    </Button>
  );

  const disabledIPv6 = !selectedIPv6Prefix || readOnly;
  const AllocateButton2 = (
    <Button
      buttonType="primary"
      onClick={handleCreateIPv6Range}
      disabled={disabledIPv6}
      style={{ marginBottom: 8 }}
      loading={submitting}
    >
      Allocate
    </Button>
  );

  const _tooltipCopy =
    disabledIPv4 && selectedIPv4
      ? readOnly
        ? 'You do not have permission to modify this Linode.'
        : tooltipCopy[selectedIPv4]
      : null;

  return (
    <Drawer open={open} onClose={onClose} title="Add an IP Address">
      <React.Fragment>
        <Typography variant="h2">IPv4</Typography>
        {errorMessageIPv4 && (
          <Notice error text={errorMessageIPv4} spacingTop={8} />
        )}
        <Typography variant="h3" className={classes.ipSubheader}>
          Select IPv4 type
        </Typography>
        <RadioGroup
          aria-label="ip-option"
          name="Select IPv4 type"
          value={selectedIPv4}
          onChange={handleIPv4Change}
          className={classes.radioButtons}
          data-qa-ip-options-radio-group
        >
          {ipOptions.map((option, idx) => (
            <FormControlLabel
              key={idx}
              value={option.value}
              label={option.label}
              control={<Radio />}
              data-qa-radio={option.label}
            />
          ))}
        </RadioGroup>
        {selectedIPv4 && (
          <Typography variant="body1" className={classes.copy}>
            {explainerCopy[selectedIPv4]}
          </Typography>
        )}
        <ActionsPanel>
          <Button buttonType="secondary" onClick={onClose} data-qa-cancel>
            Close
          </Button>
          {_tooltipCopy ? (
            <Tooltip title={_tooltipCopy}>
              <div style={{ display: 'inline' }}>{AllocateButton}</div>
            </Tooltip>
          ) : (
            AllocateButton
          )}
        </ActionsPanel>
        <Typography variant="h2" className={classes.ipv6}>
          IPv6
        </Typography>
        {errorMessageIPv6 && (
          <Notice error text={errorMessageIPv6} spacingTop={8} />
        )}
        <Typography variant="h3" className={classes.ipSubheader}>
          Select prefix
        </Typography>
        <RadioGroup
          aria-label="prefix-option"
          name="Select prefix"
          value={selectedIPv6Prefix}
          onChange={handleIPv6Change}
          className={classes.radioButtons}
          data-qa-ip-options-radio-group
        >
          {prefixOptions.map((option, idx) => (
            <FormControlLabel
              key={idx}
              value={option.value}
              label={option.label}
              control={<Radio />}
              data-qa-radio={option.label}
            />
          ))}
        </RadioGroup>
        <Typography>
          IPv6 addresses are allocated as ranges, which you can choose to
          distribute and further route yourself.
        </Typography>
        <ActionsPanel>
          <Button buttonType="secondary" onClick={onClose} data-qa-cancel>
            Close
          </Button>
          {AllocateButton2}
        </ActionsPanel>
      </React.Fragment>
    </Drawer>
  );
};

export default AddIPDrawer;
