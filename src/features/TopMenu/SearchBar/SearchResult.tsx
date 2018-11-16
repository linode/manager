import * as React from 'react';
import { OptionProps } from 'react-select/lib/components/Option';
import MenuItem from 'src/components/core/MenuItem';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import SearchSuggestion from './SearchSuggestion';

type ClassNames = 'root' | 'item' | 'selectedMenuItem';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    position: 'absolute',
    left: '10px'
  },
  item: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:hover, &:focus': {
      backgroundColor: `${theme.bg.offWhite} !important`,
    },
    '&:last-item': {
      border: 0,
    },
  },
  selectedMenuItem: {
    backgroundColor: `${theme.bg.offWhite} !important`,
    '& .circle': {
      transition: theme.transitions.create(['fill']),
      fill: theme.palette.primary.main,
    },
    '& .outerCircle': {
      transition: theme.transitions.create(['stroke']),
      stroke: '#2967B1',
    },
    '& .insidePath *': {
      transition: theme.transitions.create(['stroke']),
      stroke: 'white',
    },
  },
});

interface Props extends OptionProps<any> {
  value: number;
  data: any;
 }

 type CombinedProps = Props & WithStyles<ClassNames>;


const Option: React.StatelessComponent<CombinedProps> = (props) => {
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
  )
}
const styled = withStyles(styles, { withTheme: true });

export default styled(Option);
