import * as React from 'react';

import {
  withStyles,
  StyledComponentProps,
} from 'material-ui/styles';
import Typography from 'material-ui/Typography';

import { menuWidth } from 'src/components/SideMenu';
import { TodoAny } from 'src/utils';

const styles = (theme: any): any => ({
  appBar: {
    backgroundColor: '#333',
    position: 'absolute',
    marginLeft: menuWidth,
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${menuWidth}px)`,
    },
  },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
});

type Props = StyledComponentProps & {
  toggleSideMenu: () => void, 
};

class TopMenu extends React.Component<Props> {
  render() {
    const { classes } = this.props;

    if (!classes) {
      return null;
    }

    return (
      <div>
        <Typography variant="button" align="right">
          Hello
        </Typography>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(
  TopMenu as TodoAny,
) as TodoAny;
