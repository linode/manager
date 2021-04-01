import { Interface } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import Grid from 'src/components/Grid';
import InterfaceSelect from '../LinodesDetail/LinodeSettings/InterfaceSelect';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingBottom: theme.spacing(3),
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

interface Props {
  vlanLabel: string;
  labelError?: string;
  ipamAddress: string;
  ipamError?: string;
  readOnly?: boolean;
  region?: string;
  handleVLANChange: (updatedInterface: Interface) => void;
}

type CombinedProps = Props;

const AttachVLAN: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    handleVLANChange,
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
        Attach a VLAN
      </Typography>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="body1">
            {/* Temporary helper text pending finalized text. */}
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
