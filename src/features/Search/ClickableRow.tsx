import { compose } from 'ramda';
import * as React from 'react';

import {
  StyleRules,
  Theme,
  WithStyles,
  withStyles,
} from '@material-ui/core/styles';
import TableRow from '@material-ui/core/TableRow';

import RenderGuard from 'src/components/RenderGuard';

type ClassNames = 'root';

const styles = (theme: Theme & Linode.Theme): StyleRules => ({
  root: {
    '&:hover': {
      backgroundColor: `${theme.bg.offWhite} !important`,
    }
  }
});

interface Props {
  type: string;
  id: string;
  title: string;
  handleClick: (id: string, type: string) => void,
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ClickableRow: React.StatelessComponent<CombinedProps> = (props) => {
  const onClick = () => {
    const { id, type, handleClick } = props;
    handleClick(id, type);
  }

  return (
    <TableRow 
      className={props.classes.root}
      onClick={onClick}
    >
      {props.children}
    </TableRow>
  )
}

const styled = withStyles(styles, { withTheme: true });

export default compose<any, any, any>(
    styled,
    RenderGuard
    )(ClickableRow);