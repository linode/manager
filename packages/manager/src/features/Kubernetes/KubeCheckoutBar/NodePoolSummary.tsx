import { LinodeType } from '@linode/api-v4/lib/linodes/types';
import Close from '@material-ui/icons/Close';
import * as React from 'react';
import Divider from 'src/components/core/Divider';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DisplayPrice from 'src/components/DisplayPrice';
import EnhancedNumberInput from 'src/components/EnhancedNumberInput';
import Grid from 'src/components/Grid';
import IconButton from 'src/components/IconButton';
import { pluralize } from 'src/utilities/pluralize';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(),
  },
  typeHeader: {
    paddingLeft: theme.spacing(),
    paddingBottom: theme.spacing(0.5),
    fontSize: '16px',
    fontWeight: 600,
  },
  typeSubheader: {
    paddingLeft: theme.spacing(),
    fontSize: '14px',
  },
  button: {
    color: '#979797',
    '&:hover': {
      color: '#6e6e6e',
    },
  },
  divider: {
    marginTop: theme.spacing(2),
  },
}));

export interface Props {
  nodeCount: number;
  poolType: LinodeType | null;
  price: number;
  updateNodeCount: (count: number) => void;
  onRemove: () => void;
}

export const NodePoolSummary: React.FC<Props> = (props) => {
  const { nodeCount, onRemove, poolType, price, updateNodeCount } = props;

  const classes = useStyles();

  // This should never happen but TS wants us to account for the situation
  // where we fail to match a selected type against our types list.
  if (poolType === null) {
    return null;
  }

  return (
    <React.Fragment>
      <Divider className={classes.divider} />
      <Grid
        container
        alignItems="flex-start"
        direction="column"
        className={classes.root}
        data-testid="node-pool-summary"
      >
        <Grid
          container
          direction="row"
          alignItems="center"
          justify="space-between"
          wrap="nowrap"
        >
          <Grid item>
            <Typography className={classes.typeHeader}>
              {poolType.label} Plan
            </Typography>
            <Typography className={classes.typeSubheader}>
              {pluralize('CPU', 'CPUs', poolType.vcpus)}, {poolType.disk / 1024}{' '}
              GB Storage
            </Typography>
          </Grid>
          <Grid item>
            <IconButton
              className={classes.button}
              onClick={onRemove}
              data-testid="remove-pool-button"
            >
              <Close />
            </IconButton>
          </Grid>
        </Grid>
        <Grid item>
          <EnhancedNumberInput
            value={nodeCount}
            setValue={updateNodeCount}
            small
            min={1}
          />
        </Grid>
        <Grid item>
          <DisplayPrice price={price} fontSize="16px" interval="month" />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default React.memo(NodePoolSummary);
