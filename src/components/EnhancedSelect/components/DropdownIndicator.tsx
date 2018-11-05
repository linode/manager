import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';

import { IndicatorProps } from 'react-select/lib/components/indicators';

type ClassNames = 'root'
| 'enhancedSelectDropdown';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  enhancedSelectDropdown: {
    top: 'calc(50% - 12px)',
    right: 0,
    color: '#aaa !important',
    width: 28,
    height: 28,
    opacity: '0.5',
    position: 'absolute',
    marginTop: '-2px',
    transition: 'color 225ms ease-in-out',
    marginRight: '4px',
    pointerEvents: 'none',
  },
});

interface Props extends IndicatorProps<any> { }

type CombinedProps = Props & WithStyles<ClassNames>;

class DropdownIndicator extends React.PureComponent<CombinedProps> {

  render() {
    const { classes } = this.props;

    return (
        <KeyboardArrowDown className={classes.enhancedSelectDropdown}
        />
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(DropdownIndicator);

