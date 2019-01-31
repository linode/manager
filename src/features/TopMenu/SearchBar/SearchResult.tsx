import * as React from 'react';
import { OptionProps } from 'react-select/lib/components/Option';
import MenuItem from 'src/components/core/MenuItem';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import SearchSuggestion from './SearchSuggestion';

type ClassNames = 'root' | 'item' | 'selectedMenuItem';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  '@keyframes dash': {
    to: {
      'stroke-dashoffset': 0
    }
  },
  root: {
    position: 'absolute',
    left: '10px'
  },
  item: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    '& .circle': {
      fill: theme.bg.offWhiteDT
    },
    '& .outerCircle': {
      stroke: theme.bg.main
    },
    '&:last-item': {
      border: 0
    }
  },
  selectedMenuItem: {
    ...theme.animateCircleIcon,
    backgroundColor: `${theme.bg.offWhite} !important`
  }
});

interface Props extends OptionProps<any> {
  value: number;
  data: any;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const Option: React.StatelessComponent<CombinedProps> = props => {
  const suggestion = props.data.data;
  return (
    <MenuItem
      {...props.innerProps}
      key={suggestion.label + suggestion.description}
      selected={Boolean(props.isFocused)}
      component="div"
      className={props.classes.item}
      classes={{ selected: props.classes.selectedMenuItem }}
    >
      <SearchSuggestion {...props} />
    </MenuItem>
  );
};
const styled = withStyles(styles);

export default styled(Option);
