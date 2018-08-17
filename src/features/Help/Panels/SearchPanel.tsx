import * as Algolia from 'algoliasearch';
import { compose, concat, pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

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
    width: '100%',
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

type CombinedProps = Props & WithStyles<ClassNames> & RouteComponentProps<{}>;

const dummyData = [
  {
    value: "1",
    label: "Ubuntu",
    data: {
      source: "Community Site",
      href: "https://www.linode.com/docs/web-servers/nginx/use-nginx-reverse-proxy/"
    }
  },
  {
    value: "2",
    label: "Gentoo",
    data: {
      source: "Docs",
      href: "https://www.linode.com/docs/web-servers/nginx/use-nginx-reverse-proxy/"
    }
  },
  {
    value: "3",
    label: "Arch Linux",
    data: {
      source: "Docs",
      href: "https://www.linode.com/docs/web-servers/nginx/use-nginx-reverse-proxy/"
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
    this.setState({ options: dummyData })
  }

  getDataFromOptions = () => {
    const { options, inputValue } = this.state;
    return concat(options,[{value: 'search', label: inputValue, data: { source: 'finalLink'}}]);
  }

  onInputValueChange = (inputValue:string) => {
    this.setState({ inputValue });
  }

  renderOptionsHelper = (item:Item, index:number, highlighted:boolean, itemProps:any, classes:any) => {
    return (
    <div key={index} {...itemProps} className={classes} >
      <SearchItem item={item} highlighted={highlighted}  />
    </div>
    )
  }

  handleSelect = (selected:Item) => {
    if (!selected) { return; }
    const { history } = this.props;
    const { inputValue } = this.state;
    const href = pathOr('', ['data', 'href'], selected)
    if (selected.value === 'search') {
      const link = inputValue
        ? `/support/search/?query=${inputValue}`
        : '/support/search/'
      history.push(link)
    } else {
      window.open(href,'_newtab');
    }
  }

  render() {
    const { classes } = this.props;
    const { inputValue, value } = this.state;
    const data = this.getDataFromOptions();

    return (
      <Grid container className={classes.root}>
        <Grid item xs={12} >
          <EnhancedSelect
            className={classes.input}
            options={data}
            value={value}
            inputValue={inputValue}
            renderItems={this.renderOptionsHelper}
            onInputValueChange={this.onInputValueChange}
            handleSelect={this.handleSelect}
            placeholder="Search docs and Community questions"
          />
        </Grid>
      </Grid>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose<any,any,any>(
  styled,
  withRouter)(SearchPanel);
