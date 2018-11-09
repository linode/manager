import { pathOr } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import TableRow from '@material-ui/core/TableRow';

import { displayPrice as _displayPrice } from 'src/components/DisplayPrice/DisplayPrice';
import TableCell from 'src/components/TableCell';


import { ExtendedLinode } from './BackupDrawer';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  linodes: any[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const displayPrice = (price: string | number) => {
  if (typeof price === 'string') { return price; }
  return _displayPrice(price);
}

const getLabel = (type?: Linode.LinodeType) =>
  pathOr('Unknown', ['label'], type);

const getPrice = (type?: Linode.LinodeType) =>
  pathOr("Unavailable",['addons', 'backups', 'price', 'monthly'], type);

const BackupLinodes: React.StatelessComponent<CombinedProps> = (props) => {
  const { linodes } = props;
  return (
    <React.Fragment>
      {linodes && linodes.map((linode: ExtendedLinode, idx: number) =>
        <React.Fragment key={idx}>
          <TableRow data-qa-linodes >
            <TableCell >{linode.label}</TableCell>
            <TableCell >{getLabel(linode.typeInfo)}</TableCell>
            <TableCell >{`${displayPrice(getPrice(linode.typeInfo))}/mo`}</TableCell>
          </TableRow>
          {/* @todo need error handling pattern for displaying individual
          * errors for each Linode */}
          {/* {linode.linodeError &&
            <TableRow>
              <TableCell>{linode.linodeError.reason}</TableCell>
            </TableRow>
          } */}
          </React.Fragment>
      )}
    </React.Fragment>
    )
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(BackupLinodes);
