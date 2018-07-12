import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import { formatRegion } from '../presentation';

type CSSClasses =  'regionIndicator';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  regionIndicator: {
    alignItems: 'center',
    whiteSpace: 'nowrap',
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
        {formatRegion(region)}
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(RegionIndicator);
