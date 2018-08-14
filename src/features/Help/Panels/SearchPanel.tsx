import * as React from 'react';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';

import EnhancedSelect, { Item } from 'src/components/EnhancedSelect';
import Grid from 'src/components/Grid';

import SearchItem from './SearchItem';

type ClassNames = 'root'
  | 'bgIcon'
  | 'searchHeading'
  | 'input'
  | 'textfield';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    padding: theme.spacing.unit * 4,
    maxWidth: '100%',
    backgroundColor: theme.color.green,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bgIcon: {
    color: '#04994D',
    width: 250,
    height: 250,
    '& .circle': {
      fill: 'transparent',
    },
    '& .outerCircle': {
      stroke: 'transparent',
    },
    '& .insidePath path': {
      stroke: '#04994D',
    },
  },
  searchHeading: {
    textAlign: 'center',
    color: theme.color.white,
    position: 'relative',
    zIndex: 2,
  },
  textfield: {
    backgroundColor: theme.color.white,
    margin: 0,
    flex: 1,
    minHeight: 'initial',
    '& input:focus': {
      outline: '1px dotted #606469',
    },
  },
  input: {
    border: 0,
    background: 'transparent',
    '& input': {
      transition: theme.transitions.create(['opacity']),
      fontSize: '1.0em',
      [theme.breakpoints.down('sm')]: {},
    },
  },
});

interface Props {}

interface State {
  value: string;
  inputValue: string;
  options: Item[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const dummyData = [
  {
    value: "1",
    label: "Ubuntu",
    data: {
      source: "Community Site"
    }
  },
  {
    value: "2",
    label: "Gentoo",
    data: {
      source: "Docs"
    }
  },
  {
    value: "3",
    label: "Arch Linux",
    data: {
      source: "Docs"
    }
  }
]

class SearchPanel extends React.Component<CombinedProps, State> {
  state: State = {
    value: '',
    inputValue: '',
    options: [],
  };

  componentDidMount() {
    const { inputValue } = this.state;
    const valueText = inputValue ? `Search for "${inputValue}"` : 'Search';
    dummyData.push({value:'search',label:valueText, data: { source: 'finalLink'}});
    this.setState({ options: dummyData })
  }

  onInputValueChange = (input:string) => {
    this.setState({ inputValue: input });
  }

  renderOptionsHelper = (item:Item, index:number, highlighted:boolean) => {
    return <SearchItem item={item} index={index} highlighted={highlighted} />
  }

  render() {
    const { classes } = this.props;
    const { inputValue, options, value } = this.state;

    return (
      <Grid container className={classes.root}>
        <Grid item xs={12} >
          <EnhancedSelect
            className={classes.input}
            options={options}
            value={value}
            inputValue={inputValue}
            renderItems={this.renderOptionsHelper}
            placeholder="Search docs and Community questions"
          />
        </Grid>
      </Grid>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(SearchPanel);
