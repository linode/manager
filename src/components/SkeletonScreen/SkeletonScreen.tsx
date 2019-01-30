import * as React from 'react';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type ClassNames = 'root' | 'tableCol1' | 'tableCol2';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  '@keyframes shine': {
    '0%': {
      backgroundPosition: -100
    },
    '50%': {
      backgroundPosition: 200
    },
    '100%': {
      backgroundPosition: -100
    }
  },
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    '& .line': {
      width: '100%',
      height: theme.spacing.unit * 2,
      marginTop: theme.spacing.unit,
      backgroundImage: `
        linear-gradient(
          90deg,
          ${theme.color.grey2} 0px,
          #f8f8f8 40%,
          ${theme.color.grey2} 70%
        )`,
      backgroundSize: 600,
      animation: 'shine 2s infinite linear'
    }
  },
  tableCol1: {
    width: '20%',
    minWidth: 100,
    paddingRight: theme.spacing.unit * 3,
    '& .line': {
      height: 40
    }
  },
  tableCol2: {
    width: '80%',
    minWidth: 100
  }
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
        );

      case 'card':
        return false;
    }
  };

  render() {
    return this.renderSkeleton();
  }
}

export default withStyles(styles)(SkeletonScreen);
