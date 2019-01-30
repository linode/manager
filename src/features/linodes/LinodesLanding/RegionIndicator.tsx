import * as React from 'react';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import { formatRegion } from 'src/utilities';

type CSSClasses = 'regionIndicator';

const styles: StyleRulesCallback<CSSClasses> = theme => ({
  regionIndicator: {
    alignItems: 'center',
    whiteSpace: 'nowrap'
  }
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
