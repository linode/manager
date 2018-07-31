import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

type ClassNames = 'root'
  | 'col1'
  | 'col2'
  | 'line';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  '@keyframes shine': {
    '0%': {
      backgroundPosition: '-100px',
    },
    '50%, 100%': {
      backgroundPosition: '150%',
    },
  },
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    '& .line': {
      width: '100%',
      height: 16,
      marginTop: 12,
      backgroundImage: `
        linear-gradient(
          90deg,
          #ddd 0px,
          #f5f5f5 40%,
          #ddd 70%
        )`,
      backgroundSize: 600,
      animation: 'shine 2s infinite linear',
    },
  },
  col1: {
    width: '30%',
    minWidth: 100,
    paddingRight: theme.spacing.unit * 3,
    '& .line': {
      height: 44,
    },
  },
  col2: {
    width: '70%',
    minWidth: 200,
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
        <div className={classes.col1}>
          <div className="line" />
        </div>
        <div className={classes.col2}>
          <div className="line" />
          <div className="line" />
        </div>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(SkeletonScreen);
