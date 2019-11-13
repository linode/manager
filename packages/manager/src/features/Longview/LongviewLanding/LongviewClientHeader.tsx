import { pathOr } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  makeStyles,
  Theme,
  withTheme,
  WithTheme
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EditableEntityLabel from 'src/components/EditableEntityLabel';
import Grid from 'src/components/Grid';

import withLongviewClients, {
  DispatchProps
} from 'src/containers/longview.container';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    [theme.breakpoints.down('md')]: {
      flexDirection: 'row',
      alignItems: 'center'
    }
  },
  updates: {
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(2)
    }
  },
  link: {
    ...pathOr<Object>({}, ['overrides', 'MuiButton', 'root'], theme),
    ...pathOr<Object>(
      {},
      ['overrides', 'MuiButton', 'containedSecondary'],
      theme
    ),
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    display: 'inline-block',
    position: 'relative',
    [theme.breakpoints.down('md')]: {
      top: -4
    }
  }
}));

interface Props {
  clientID: number;
  clientLabel: string;
}

type CombinedProps = Props & DispatchProps & WithTheme;

export const LongviewClientHeader: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { clientID, clientLabel, updateLongviewClient } = props;
  const [updating, setUpdating] = React.useState<boolean>(false);

  const handleUpdateLabel = (newLabel: string) => {
    setUpdating(true);
    return updateLongviewClient(clientID, newLabel)
      .then(_ => {
        setUpdating(false);
      })
      .catch(_ => setUpdating(false));
  };

  return (
    <Grid container direction="column" className={classes.root}>
      <Grid item>
        <EditableEntityLabel
          text={clientLabel}
          iconVariant="linode"
          subText="dev.hostname.com"
          status="running"
          onEdit={handleUpdateLabel}
          loading={updating}
        />
      </Grid>
      <Grid item className={classes.updates}>
        <Typography>Up 47d 19h 22m</Typography>
        <Typography>2 packages have updates</Typography>
      </Grid>
      <Grid item>
        <Link to={`/longview/clients/${clientID}`} className={classes.link}>
          View details
        </Link>
      </Grid>
    </Grid>
  );
};

/** We only need the update action here, easier than prop drilling through 4 components */
export default withLongviewClients(() => ({}))(withTheme(LongviewClientHeader));
