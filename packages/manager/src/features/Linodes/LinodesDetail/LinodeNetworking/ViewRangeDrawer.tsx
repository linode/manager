import { IPRange } from '@linode/api-v4/lib/networking';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';
import Drawer from 'src/components/Drawer';
import { useRegionsQuery } from 'src/queries/regions';

const useStyles = makeStyles()((theme: Theme) => ({
  section: {
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

interface Props {
  open: boolean;
  range?: IPRange;
  onClose: () => void;
}

export const ViewRangeDrawer = (props: Props) => {
  const { classes } = useStyles();
  const { range } = props;
  const region = (range && range.region) || '';

  const { data: regions } = useRegionsQuery();

  const actualRegion = regions?.find((r) => r.id === region);

  return (
    <Drawer
      open={props.open}
      onClose={props.onClose}
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

          <ActionsPanel
            showSecondary
            secondaryButtonDataTestId="cancel"
            secondaryButtonHandler={props.onClose}
            secondaryButtonText="Close"
          />
        </React.Fragment>
      )}
    </Drawer>
  );
};
