import * as React from 'react';
import { Link } from 'react-router-dom';

import Hidden from 'src/components/core/Hidden';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableCell from 'src/components/core/TableCell';
import Typography from 'src/components/core/Typography';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableRow from 'src/components/TableRow';
import RegionIndicator from 'src/features/linodes/LinodesLanding/RegionIndicator';
import { getEntityByIDFromStore } from 'src/utilities/getEntityByIDFromStore';

type ClassNames =
  | 'root'
  | 'icon'
  | 'labelGridWrapper'
  | 'description'
  | 'labelCol'
  | 'moreCol'
  | 'actionsCol'
  | 'wrapHeader';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  icon: {
    position: 'relative',
    top: 3,
    width: 40,
    height: 40,
    '& .circle': {
      fill: theme.bg.offWhiteDT
    },
    '& .outerCircle': {
      stroke: theme.bg.main
    }
  },
  labelGridWrapper: {
    paddingLeft: `${theme.spacing(1) / 2}px !important`,
    paddingRight: `${theme.spacing(1) / 2}px !important`
  },
  description: {
    paddingTop: theme.spacing(1) / 2
  },
  labelCol: {
    width: '50%'
  },
  moreCol: {
    width: '25%'
  },
  actionsCol: {
    width: '10%'
  },
  wrapHeader: {
    wordBreak: 'break-all'
  }
});

interface Props {
  volume: Linode.Volume;
}
type CombinedProps = Props & WithStyles<ClassNames>;

export const getLinodeLabel = (linodeId: number | null) => {
  /** default to null unless everything works */
  if (!linodeId) {
    return null;
  }
  const attachedLinode: any = getEntityByIDFromStore('linode', linodeId);
  return attachedLinode ? attachedLinode.label : null;
};

export const VolumeDashboardRow: React.StatelessComponent<
  CombinedProps
> = props => {
  const {
    classes,
    volume: { label, linode_id, region, size }
  } = props;

  const attachedLinodeLabel = getLinodeLabel(linode_id);

  return (
    <TableRow key={label} data-qa-volume={label}>
      <TableCell className={classes.labelCol}>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className="py0">
            <EntityIcon variant="volume" />
          </Grid>
          <Grid item className={classes.labelGridWrapper}>
            <Typography
              role="header"
              variant="h3"
              className={classes.wrapHeader}
              data-qa-label
            >
              {label}
            </Typography>
            <Typography className={classes.description}>{size} GiB</Typography>
          </Grid>
        </Grid>
      </TableCell>
      <Hidden xsDown>
        <TableCell className={classes.moreCol} data-qa-attached-linode>
          {attachedLinodeLabel ? (
            <Link to={`/linodes/${linode_id}`}>{attachedLinodeLabel}</Link>
          ) : (
            <Typography>Unattached</Typography>
          )}
        </TableCell>
        <TableCell className={classes.moreCol} data-qa-volume-region>
          <RegionIndicator region={region} />
        </TableCell>
      </Hidden>
    </TableRow>
  );
};

const styled = withStyles(styles);

export default styled(VolumeDashboardRow);
