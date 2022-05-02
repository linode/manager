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
import ExternalLink from 'src/components/Link';
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
  { value: 'v4Public', label: 'Public' },
  { value: 'v4Private', label: 'Private' },
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
      it&rsquo;s best to reboot your Linode.
    </>
  ),
};

const IPv6ExplanatoryCopy = {
  56: (
    <>
      /56 ranges are typically only required by specialized systems or
      networking applications.
    </>
  ),
  64: (
    <>
      /64 is the most common range provided to our customers and sufficient for
      most applications that require additional IPv6 addresses.
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
  onSuccess: () => Promise<void>[];
  readOnly: boolean;
}

type CombinedProps = Props;

const AddIPDrawer: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const [selectedIPv4, setSelectedIPv4] = React.useState<IPType | null>(null);
  const [submittingIPv4, setSubmittingIPv4] = React.useState(false);
  const [errorMessageIPv4, setErrorMessageIPv4] = React.useState('');

  const [
    selectedIPv6Prefix,
    setSelectedIPv6Prefix,
  ] = React.useState<IPv6Prefix | null>(null);

  const [submittingIPv6, setSubmittingIPv6] = React.useState(false);
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
    setSubmittingIPv4(true);
    setErrorMessageIPv4('');

    // Only IPv4 addresses can currently be allocated.
    allocateIPAddress(linodeID, {
      type: 'ipv4',
      public: selectedIPv4 === 'v4Public',
    })
      .then((_) => {
        setSubmittingIPv4(false);
        Promise.all(onSuccess());
        onClose();
      })
      .catch((errResponse) => {
        setSubmittingIPv4(false);
        setErrorMessageIPv4(getErrorStringOrDefault(errResponse));
      });
  };

  const handleCreateIPv6Range = () => {
    setSubmittingIPv6(true);
    setErrorMessageIPv6('');

    createIPv6Range({
      linode_id: linodeID,
      prefix_length: Number(selectedIPv6Prefix) as IPv6Prefix,
    })
      .then((_: any) => {
        setSubmittingIPv6(false);
        Promise.all(onSuccess());
        onClose();
      })
      .catch((errResponse: APIError[]) => {
        setSubmittingIPv6(false);
        setErrorMessageIPv6(getErrorStringOrDefault(errResponse));
      });
  };

  const disabledIPv4 =
    (selectedIPv4 === 'v4Private' && hasPrivateIPAddress) ||
    !selectedIPv4 ||
    readOnly;

  const disabledIPv6 = !selectedIPv6Prefix || readOnly;

  const _tooltipCopy =
    disabledIPv4 && selectedIPv4
      ? readOnly
        ? 'You do not have permission to modify this Linode.'
        : tooltipCopy[selectedIPv4]
      : null;

  const buttonJSX = (type: 'IPv4' | 'IPv6') => {
    const IPv4 = type === 'IPv4';

    const onClick = IPv4 ? handleAllocateIPv4 : handleCreateIPv6Range;
    const disabled = IPv4 ? disabledIPv4 : disabledIPv6;
    const submitting = IPv4 ? submittingIPv4 : submittingIPv6;

    return (
      <Button
        buttonType="primary"
        onClick={onClick}
        disabled={disabled}
        style={{ marginBottom: 8 }}
        loading={submitting}
      >
        Allocate
      </Button>
    );
  };

  return (
    <Drawer open={open} onClose={onClose} title="Add an IP Address">
      <React.Fragment>
        <Typography variant="h2">IPv4</Typography>
        {errorMessageIPv4 && (
          <Notice error text={errorMessageIPv4} spacingTop={8} />
        )}
        <Typography variant="h3" className={classes.ipSubheader}>
          Select type
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
          {_tooltipCopy ? (
            <Tooltip title={_tooltipCopy}>
              <div style={{ display: 'inline' }}>{buttonJSX('IPv4')}</div>
            </Tooltip>
          ) : (
            buttonJSX('IPv4')
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
        {selectedIPv6Prefix && (
          <Typography variant="body1" style={{ marginBottom: '1rem' }}>
            {IPv6ExplanatoryCopy[selectedIPv6Prefix]}
          </Typography>
        )}
        <Typography>
          IPv6 addresses are allocated as ranges, which you can choose to
          distribute and further route yourself.{' '}
          <ExternalLink to="https://www.linode.com/docs/guides/an-overview-of-ipv6-on-linode/">
            Learn more
          </ExternalLink>
          .
        </Typography>
        <ActionsPanel>{buttonJSX('IPv6')}</ActionsPanel>
      </React.Fragment>
    </Drawer>
  );
};

export default AddIPDrawer;
