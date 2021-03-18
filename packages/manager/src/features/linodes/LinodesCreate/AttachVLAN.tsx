import { Interface } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
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
  ipamAddress: string;
  handleVLANChange: (updatedInterface: Interface) => void;
}

type CombinedProps = Props;

const AttachVLAN: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { handleVLANChange } = props;

  return (
    <div className={classes.root}>
      <Typography variant="h2" className={classes.title}>
        Attach a VLAN
      </Typography>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="body1">
            {/* Temporary helper text pending finalized text. */}
            If you attach a VLAN to this Linode, it will be automatically
            assigned to the eth1 interface. You may edit interfaces from the
            Linode Configurations tab.
          </Typography>
          <InterfaceSelect
            slotNumber={1}
            readOnly={false}
            error={''}
            label={props.vlanLabel}
            purpose="vlan"
            ipamAddress={props.ipamAddress}
            handleChange={(newInterface: Interface) =>
              handleVLANChange(newInterface)
            }
            fromAddonsPanel
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default React.memo(AttachVLAN);
