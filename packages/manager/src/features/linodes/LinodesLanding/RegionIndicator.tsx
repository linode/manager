import * as React from 'react';
import { createStyles, withStyles, WithStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { formatRegion } from 'src/utilities';

type CSSClasses = 'regionIndicator';

const styles = (theme: Theme) =>
  createStyles({
    regionIndicator: {
      alignItems: 'center',
      whiteSpace: 'nowrap',
    },
  });

interface Props {
  region: string;
}

class RegionIndicator extends React.Component<Props & WithStyles<CSSClasses>> {
  render() {
    const { classes, region } = this.props;

    return (
      <div className={`dif ${classes.regionIndicator}`}>
        {formatRegion(region)}
      </div>
    );
  }
}

export default withStyles(styles)(RegionIndicator);
