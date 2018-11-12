import { pathOr } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import { displayPrice as _displayPrice } from 'src/components/DisplayPrice/DisplayPrice';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';


import { ExtendedLinode } from './BackupDrawer';

type ClassNames = 'root' | 'error';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  error: {
    color: theme.color.red,
  }
});

interface Props {
  linodes: ExtendedLinode[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const displayPrice = (price: string | number) => {
  if (typeof price === 'string') { return price; }
  return _displayPrice(price);
}

const getLabel = (type?: Linode.LinodeType) =>
  pathOr('Unknown', ['label'], type);

const getPrice = (type?: Linode.LinodeType) =>
  pathOr('Unavailable',['addons', 'backups', 'price', 'monthly'], type);

export const BackupLinodes: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, linodes } = props;
  return (
    <React.Fragment>
      {linodes && linodes.map((linode: ExtendedLinode, idx: number) =>
        <React.Fragment key={idx}>
          <TableRow data-qa-linodes >
            <TableCell>
              <div>
                <Tooltip title={pathOr('', ['linodeError', 'reason'], linode)}>
                  <Typography
                    variant="body1"
                    className={linode.linodeError && classes.error}
                  >
                    {linode.label}
                  </Typography>
                </Tooltip>
              </div>
            </TableCell>

            <TableCell >{getLabel(linode.typeInfo)}</TableCell>
            <TableCell >{`${displayPrice(getPrice(linode.typeInfo))}/mo`}</TableCell>
          </TableRow>
        </React.Fragment>
      )}
    </React.Fragment>
    )
};

BackupLinodes.displayName = "BackupLinodes";

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(BackupLinodes);
