import { IPRange } from '@linode/api-v4/lib/networking';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import Drawer from 'src/components/Drawer';
import { Typography } from 'src/components/Typography';
import { useRegionsQuery } from 'src/queries/regions';

const useStyles = makeStyles()((theme: Theme) => ({
  section: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

interface Props {
  onClose: () => void;
  open: boolean;
  range?: IPRange;
}

export const ViewRangeDrawer = (props: Props) => {
  const { classes } = useStyles();
  const { range } = props;
  const region = (range && range.region) || '';

  const { data: regions } = useRegionsQuery();

  const actualRegion = regions?.find((r) => r.id === region);

  return (
    <Drawer
      onClose={props.onClose}
      open={props.open}
      title={`Details for IP Range`}
    >
      {props.range && (
        <React.Fragment>
          <div className={classes.section}>
            <Typography variant="h3">IP Range</Typography>
            <Typography variant="body1">
              {props.range.range} / {props.range.prefix} routed to{' '}
              {props.range.route_target}
            </Typography>
          </div>

          <div
            className={classes.section}
            style={{ border: 0, paddingBottom: 0 }}
          >
            <Typography variant="h3">Region</Typography>
            <Typography variant="body1">
              {actualRegion?.label ?? region}
            </Typography>
          </div>

          <ActionsPanel>
            <Button
              buttonType="secondary"
              data-qa-cancel
              onClick={props.onClose}
            >
              Close
            </Button>
          </ActionsPanel>
        </React.Fragment>
      )}
    </Drawer>
  );
};
