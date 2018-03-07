import * as React from 'react';
import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Typography from 'material-ui/Typography';

import { flagImg, formatRegion } from './presentation';

type CSSClasses =  'regionIndicator' | 'flagImg';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  regionIndicator: {
    alignItems: 'center',
  },
  flagImg: {
    marginRight: theme.spacing.unit,
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
        <img
          className={classes.flagImg}
          src={flagImg(region)}
          width="20"
          height="15"
          role="presentation"
        />
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
