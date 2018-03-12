import * as React from 'react';
import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Typography from 'material-ui/Typography';

import { formatRegion } from './presentation';

type CSSClasses =  'regionIndicator';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  regionIndicator: {
    alignItems: 'center',
  },
});

interface Props {
  region: string;
}

class RegionIndicator extends React.Component<Props & WithStyles<CSSClasses> > {
  render() {
    const { classes, region } = this.props;

    return (
      <div className={`dif ${classes.regionIndicator}`}>
        <Typography
          variant="body2"
          noWrap
        >
          {formatRegion(region)}
        </Typography>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(RegionIndicator);
