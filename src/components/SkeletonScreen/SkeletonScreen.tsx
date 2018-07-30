import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

type ClassNames = 'root'
  | 'col1'
  | 'col2'
  | 'line';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  '@keyframes shine': {
    '0%': {
      backgroundPosition: '-100%',
    },
    '40%, 100%': {
      backgroundPosition: '100%',
    },
  },
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  col1: {
    width: '30%',
    minWidth: 100,
    paddingRight: theme.spacing.unit * 3,
  },
  col2: {
    width: '70%',
    minWidth: 200,
  },
  line: {
    width: '100%',
    height: 16,
    marginTop: 12,
    backgroundImage: `
      linear-gradient(
        90deg,
        #ddd 0px,
        #e8e8e8 30%,
        #ddd 70%
      )`,
    backgroundSize: '60%',
    animation: 'shine 2s infinite linear',
  },
});

interface Props {
  type: 'table' | 'card';
}

type CombinedProps = Props & WithStyles<ClassNames>;

class SkeletonScreen extends React.Component<CombinedProps> {

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        {/* <div className={classes.col1}>
          <div className={classes.line} />
        </div> */}
        <div className={classes.col2}>
          <div className={classes.line} />
          <div className={classes.line} />
        </div>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(SkeletonScreen);
