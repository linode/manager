import { FormControlLabel, Typography } from '@linode/ui';
import {
  Box,
  Divider,
  Notice,
  Radio,
  RadioGroup,
  Stack,
  Tooltip,
} from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import {
  useAllocateIPMutation,
  useLinodeIPsQuery,
} from 'src/queries/linodes/networking';
import { useCreateIPv6RangeMutation } from 'src/queries/networking/networking';

import { ExplainerCopy } from './ExplainerCopy';

import type { IPv6Prefix } from '@linode/api-v4/lib/networking';

export type IPType = 'v4Private' | 'v4Public';

type IPOption = {
  label: string;
  value: IPType;
};

const ipOptions: IPOption[] = [
  { label: 'Public', value: 'v4Public' },
  { label: 'Private', value: 'v4Private' },
];

const prefixOptions = [
  { label: '/64', value: '64' },
  { label: '/56', value: '56' },
];

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

const tooltipCopy: Record<IPType, null | string> = {
  v4Private: 'This Linode already has a private IP address.',
  v4Public: null,
};

interface Props {
  linodeId: number;
  linodeIsInDistributedRegion?: boolean;
  onClose: () => void;
  open: boolean;
  readOnly: boolean;
}

export const AddIPDrawer = (props: Props) => {
  const {
    linodeId,
    linodeIsInDistributedRegion,
    onClose,
    open,
    readOnly,
  } = props;

  const {
    error: ipv4Error,
    isPending: ipv4Loading,
    mutateAsync: allocateIPAddress,
    reset: resetIPv4,
  } = useAllocateIPMutation(linodeId);

  const {
    error: ipv6Error,
    isPending: ipv6Loading,
    mutateAsync: createIPv6Range,
    reset: resetIPv6,
  } = useCreateIPv6RangeMutation();

  const [selectedIPv4, setSelectedIPv4] = React.useState<IPType | null>(null);

  const [
    selectedIPv6Prefix,
    setSelectedIPv6Prefix,
  ] = React.useState<IPv6Prefix | null>(null);

  const { data: ips } = useLinodeIPsQuery(linodeId, open);

  React.useEffect(() => {
    if (open) {
      setSelectedIPv4(null);
      setSelectedIPv6Prefix(null);
      resetIPv4();
      resetIPv6();
    }
  }, [open]);

  const handleIPv4Change = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: 'v4Private' | 'v4Public'
  ) => {
    setSelectedIPv4(value);
  };

  const handleIPv6Change = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any
  ) => {
    setSelectedIPv6Prefix(value);
  };

  const handleAllocateIPv4 = async () => {
    // Only IPv4 addresses can currently be allocated.
    await allocateIPAddress({
      public: selectedIPv4 === 'v4Public',
      type: 'ipv4',
    });
    onClose();
  };

  const handleCreateIPv6Range = async () => {
    await createIPv6Range({
      linode_id: linodeId,
      prefix_length: Number(selectedIPv6Prefix) as IPv6Prefix,
    });
    onClose();
  };

  const hasPrivateIPAddress = ips !== undefined && ips.ipv4.private.length > 0;

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

  return (
    <Drawer onClose={onClose} open={open} title="Add an IP Address">
      <Stack spacing={2}>
        <Typography variant="h3">IPv4</Typography>
        {Boolean(ipv4Error) && (
          <Notice spacingTop={4} text={ipv4Error?.[0].reason} variant="error" />
        )}

        <StyledRadioGroup
          aria-labelledby="ipv4-select-type"
          data-qa-ip-options-radio-group
          name="Select IPv4 type"
          onChange={handleIPv4Change}
          value={selectedIPv4}
        >
          {linodeIsInDistributedRegion && (
            <Notice
              sx={{ fontSize: 15 }}
              text="Private IP is currently not available for distributed regions."
              variant="warning"
            />
          )}
          <Typography id="ipv4-select-type">Select type</Typography>
          <Box>
            {ipOptions.map((option, idx) => (
              <FormControlLabel
                disabled={
                  option.value === 'v4Private' && linodeIsInDistributedRegion
                }
                control={<Radio />}
                data-qa-radio={option.label}
                key={idx}
                label={option.label}
                value={option.value}
              />
            ))}
          </Box>
        </StyledRadioGroup>
        {selectedIPv4 && (
          <Typography>
            <ExplainerCopy ipType={selectedIPv4} linodeId={linodeId} />
          </Typography>
        )}

        {_tooltipCopy ? (
          <Tooltip placement="bottom-end" title={_tooltipCopy}>
            <div style={{ display: 'inline' }}>
              <StyledActionsPanel
                primaryButtonProps={{
                  disabled: disabledIPv4,
                  label: 'Allocate',
                  loading: ipv4Loading,
                  onClick: handleAllocateIPv4,
                }}
              />
            </div>
          </Tooltip>
        ) : (
          <StyledActionsPanel
            primaryButtonProps={{
              disabled: disabledIPv4,
              label: 'Allocate',
              loading: ipv4Loading,
              onClick: handleAllocateIPv4,
            }}
          />
        )}
        <Divider sx={{ pt: 1 }} />
        <Typography sx={{ pt: 1 }} variant="h3">
          IPv6
        </Typography>
        {Boolean(ipv6Error) && (
          <Notice spacingTop={4} text={ipv6Error?.[0].reason} variant="error" />
        )}

        <StyledRadioGroup
          aria-labelledby="ipv6-select-type"
          data-qa-ip-options-radio-group
          name="Select IPv6 type"
          onChange={handleIPv6Change}
          value={selectedIPv6Prefix}
        >
          <Typography id="ipv6-select-type">Select prefix</Typography>
          <Box>
            {prefixOptions.map((option, idx) => (
              <FormControlLabel
                control={<Radio />}
                data-qa-radio={option.label}
                key={idx}
                label={option.label}
                value={option.value}
              />
            ))}
          </Box>
        </StyledRadioGroup>
        {selectedIPv6Prefix && (
          <Typography>{IPv6ExplanatoryCopy[selectedIPv6Prefix]}</Typography>
        )}
        <Typography>
          IPv6 addresses are allocated as ranges, which you can choose to
          distribute and further route yourself.{' '}
          <Link to="https://techdocs.akamai.com/cloud-computing/docs/an-overview-of-ipv6-on-linode">
            Learn more
          </Link>
          .
        </Typography>
        <StyledActionsPanel
          primaryButtonProps={{
            disabled: disabledIPv6,
            label: 'Allocate',
            loading: ipv6Loading,
            onClick: handleCreateIPv6Range,
          }}
        />
      </Stack>
    </Drawer>
  );
};

const StyledRadioGroup = styled(RadioGroup, {
  label: 'StyledApiDrawerRadioGroup',
})(({ theme }) => ({
  '& label': {
    minWidth: 100,
  },
  '& p': {
    font: theme.font.bold,
  },
  marginBottom: '0 !important',
}));

const StyledActionsPanel = styled(ActionsPanel, {
  label: 'StyledActionsPanel',
})(({ theme }) => ({
  paddingTop: theme.spacing(2),
}));
