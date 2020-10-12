import * as React from 'react';

import Grid from 'src/components/core/Grid';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import DrawerContent from 'src/components/DrawerContent';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  icon: {
    color: '#3683dc'
  },
  tooltip: {
    '& svg': {
      color: '#3683dc'
    }
  },
  iconLink: {
    marginRight: theme.spacing(1),
    background: 'none',
    border: 'none',
    padding: 0,
    font: 'inherit',
    cursor: 'pointer'
  }
}));

interface Props {
  open: boolean;
  closeDrawer: () => void;
  loading: boolean;
  error: string | null;
  linodeLabel: string;
}

export type CombinedProps = Props;

export const AttachVlanDrawer: React.FC<CombinedProps> = props => {
  const { error, loading, closeDrawer, open, linodeLabel } = props;

  const classes = useStyles();

  return (
    <Drawer title={'Attach a VLAN'} open={open} onClose={closeDrawer}>
      <DrawerContent
        title={linodeLabel}
        error={!!error}
        errorMessage={error || undefined}
        loading={loading}
      >
        <Typography variant="h2">{linodeLabel}</Typography>
      </DrawerContent>
    </Drawer>
  );
};

export default AttachVlanDrawer;
