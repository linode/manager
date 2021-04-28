import { Interface } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import Grid from 'src/components/Grid';
import HelpIcon from 'src/components/HelpIcon';
import { queryClient } from 'src/queries/base';
import { queryKey as vlansQueryKey } from 'src/queries/vlans';
import InterfaceSelect from '../LinodesDetail/LinodeSettings/InterfaceSelect';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingBottom: theme.spacing(3),
  },
  title: {
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  chip: {
    fontSize: '0.625rem',
    height: 15,
    marginTop: 2,
    marginLeft: theme.spacing(),
    marginBottom: theme.spacing(2),
    letterSpacing: '.25px',
    textTransform: 'uppercase',
  },
}));

interface Props {
  vlanLabel: string;
  labelError?: string;
  ipamAddress: string;
  ipamError?: string;
  readOnly?: boolean;
  region?: string;
  helperText?: string;
  handleVLANChange: (updatedInterface: Interface) => void;
}

type CombinedProps = Props;

const AttachVLAN: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  React.useEffect(() => {
    // Ensure VLANs are fresh.
    queryClient.invalidateQueries(vlansQueryKey);
  }, []);

  const {
    handleVLANChange,
    helperText,
    vlanLabel,
    labelError,
    ipamAddress,
    ipamError,
    readOnly,
    region,
  } = props;

  return (
    <div className={classes.root}>
      <Typography variant="h2" className={classes.title}>
        Attach a VLAN {helperText ? <HelpIcon text={helperText} /> : null}
      </Typography>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="body1">
            VLANs are used to create a private L2 Virtual Local Area Network
            between Linodes. A VLAN created or attached in this section will be
            assigned to the eth1 interface, with eth0 being used for connections
            to the public internet. VLAN configurations can be further edited in
            the Linode&apos;s{' '}
            <ExternalLink
              text="Configuration Profile"
              link="https://linode.com/docs/guides/disk-images-and-configuration-profiles/"
              hideIcon
            />
            .
          </Typography>
          <InterfaceSelect
            slotNumber={1}
            readOnly={readOnly || false}
            label={vlanLabel}
            labelError={labelError}
            purpose="vlan"
            ipamAddress={ipamAddress}
            ipamError={ipamError}
            handleChange={(newInterface: Interface) =>
              handleVLANChange(newInterface)
            }
            region={region}
            fromAddonsPanel
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default React.memo(AttachVLAN);
