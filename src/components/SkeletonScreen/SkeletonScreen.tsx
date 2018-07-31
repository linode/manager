import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

type ClassNames = 'root'
  | 'tableCol1'
  | 'tableCol2';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  '@keyframes shine': {
    '0%': {
      backgroundPosition: -100,
    },
    '50%': {
      backgroundPosition: 200,
    },
    '100%': {
      backgroundPosition: -100,
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
  tableCol1: {
    width: '30%',
    minWidth: 100,
    paddingRight: theme.spacing.unit * 3,
    '& .line': {
      height: 44,
    },
  },
  tableCol2: {
    width: '70%',
    minWidth: 200,
  },
});

interface Props {
  type: 'table' | 'card';
}

type CombinedProps = Props & WithStyles<ClassNames>;

class SkeletonScreen extends React.Component<CombinedProps> {

  renderSkeleton = () => {
    const { classes, type } = this.props;
    switch (type) {
      case 'table':
        return (
          <div className={classes.root}>
            <div className={classes.tableCol1}>
              <div className="line" />
            </div>
            <div className={classes.tableCol2}>
              <div className="line" />
              <div className="line" />
            </div>
          </div>
        )

      case 'card':
        return false;
    }
  };

  render() {    
    return (
      this.renderSkeleton()
    );
  }
}

export default withStyles(styles, { withTheme: true })(SkeletonScreen);
