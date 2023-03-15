import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import * as React from 'react';
import { IndicatorProps } from 'react-select';
import { createStyles, withStyles, WithStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

type ClassNames = 'root' | 'enhancedSelectDropdown';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    enhancedSelectDropdown: {
      color: '#aaa !important',
      width: 28,
      height: 28,
      opacity: 0.5,
      marginTop: 0,
      transition: 'color 225ms ease-in-out',
      marginRight: '4px',
      pointerEvents: 'none',
    },
  });

interface Props extends IndicatorProps<any, any> {}

type CombinedProps = Props & WithStyles<ClassNames>;

class DropdownIndicator extends React.PureComponent<CombinedProps> {
  render() {
    const { classes } = this.props;

    return <KeyboardArrowDown className={classes.enhancedSelectDropdown} />;
  }
}

const styled = withStyles(styles);

export default styled(DropdownIndicator);
