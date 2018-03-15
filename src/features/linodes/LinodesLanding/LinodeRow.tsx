import * as React from 'react';
import { Link } from 'react-router-dom';

import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';

import Tag from 'src/components/Tag';

import LinodeStatusIndicator from './LinodeStatusIndicator';
import RegionIndicator from './RegionIndicator';
import IPAddress from './IPAddress';
import { displayLabel } from './presentation';
import LinodeActionMenu from './LinodeActionMenu';

type ClassNames = 'linodeCell'
| 'tagsCell'
| 'ipCell'
| 'ipCellInner'
| 'regionCell'
| 'actionCell';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => {
  return ({
    linodeCell: {
      width: '30%',
    },
    tagsCell: {
      width: '15%',
    },
    ipCell: {
      width: '30%',
    },
    regionCell: {
      width: '15%',
    },
    actionCell: {
      width: '10%',
    },
    ipCellInner: {
      maxWidth: 100,
      display: 'block',
      overflow: 'auto',
      [theme.breakpoints.up('md')]: {
        maxWidth: 200,
      },
      [theme.breakpoints.up('lg')]: {
        maxWidth: 300,
      },
    },
  });
};

interface Props {
  linode: (Linode.Linode & { recentEvent?: Linode.Event });
  type?: Linode.LinodeType;
}

type PropsWithStyles = Props & WithStyles<ClassNames>;

class LinodeRow extends React.Component<PropsWithStyles> {
  render() {
    const { linode, type, classes } = this.props;
    const specsLabel = type && displayLabel(type.memory);

    /**
     * @todo Until tags are implemented we're using the group as a faux tag.
     **/
    const tags = [linode.group].filter(Boolean);

    return (
      <TableRow key={linode.id}>
        <TableCell className={classes.linodeCell}>
          <Grid container alignItems="center">
            <Grid item className="py0">
              <LinodeStatusIndicator status={linode.status} />
            </Grid>
            <Grid item className="py0">
              <Link to={`/linodes/${linode.id}`}>
                <Typography variant="subheading">
                  {linode.label}
                </Typography>
              </Link>
              {specsLabel && <div>{specsLabel}</div>}
            </Grid>
          </Grid>
        </TableCell>
        <TableCell className={classes.tagsCell}>
          {tags.map((v: string, idx) => <Tag key={idx} label={v} />)}
        </TableCell>
        <TableCell className={classes.ipCell}>
          <div className={classes.ipCellInner}>
            <IPAddress ips={linode.ipv4} />
            <IPAddress ips={[linode.ipv6]} />
          </div>
        </TableCell>
        <TableCell className={classes.regionCell}>
          <RegionIndicator region={linode.region} />
        </TableCell>
        <TableCell>
          <LinodeActionMenu linode={linode} />
        </TableCell>
      </TableRow >
    );
  }
}

export default withStyles(styles, { withTheme: true })(LinodeRow);
