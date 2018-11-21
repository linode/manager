import Close from '@material-ui/icons/Close';
import Search from '@material-ui/icons/Search';
import * as moment from 'moment';
import { compose, isEmpty } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import _Control from 'react-select/lib/components/Control';
import IconButton from 'src/components/core/IconButton';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import { withTypes } from 'src/context/types';
import { typeLabelLong } from 'src/features/linodes/presentation';
import { emptyResults, searchAll, SearchResults } from 'src/features/Search/utils';
import { getAllEntities } from 'src/utilities/getAll';
import SearchSuggestion from './SearchSuggestion';

type ClassNames =
  'root'
  | 'navIconHide'
  | 'close'
  | 'textfieldContainer'
  | 'textfield'
  | 'input'
  | 'icon'

  const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    position: 'relative', /* for search results */
    height: 50,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.bg.main,
    padding: theme.spacing.unit,
    marginLeft: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2,
    transition: theme.transitions.create(['opacity']),
    [theme.breakpoints.down('sm')]: {
      backgroundColor: theme.bg.white,
      position: 'absolute',
      width: 'calc(100% - 118px)',
      zIndex: -1,
      left: 0,
      visibility: 'hidden',
      opacity: 0,
      margin: 0,
      '&.active': {
        visibility: 'visible',
        opacity: 1,
        zIndex: 3,
      },
    },
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
    '& .react-select__menu-list': {
      padding: 0,
      overflowX: 'hidden',
    },
    '& .react-select__control': {
      backgroundColor: 'transparent',
    },
    '& .react-select__value-container': {
      overflow: 'hidden',
      '& p': {
        fontSize: '1rem'
      }
    },
    '& .react-select__indicators': {
      display: 'none',
    },
    '& .react-select__menu': {
      marginTop: 12,
      boxShadow: `0 0 5px ${theme.color.boxShadow}`,
      maxHeight: 325,
      overflowY: 'auto',
      border: 0,
    }
  },
  navIconHide: {
    '& > span': {
      justifyContent: 'flex-end',
    },
    '& svg': {
      width: 32,
      height: 32,
    },
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  close: {
    '& > span': {
      padding: 2,
    },
    '&:hover, &:focus': {
      color: theme.palette.primary.main,
    },
  },
  icon: {
    color: '#c9cacb',
    fontSize: '2rem',
  },
  textfieldContainer: {
    width: '100%',
    [theme.breakpoints.down('sm')]: {},
  },
  textfield: {
    margin: 0,
    flex: 1,
    minHeight: 'initial',
    '& input:focus': {
      outline: '1px dotted #606469',
    },
  },
  input: {
    maxWidth: '100%',
    border: 0,
    background: 'transparent',
    '& input': {
      transition: theme.transitions.create(['opacity']),
      fontSize: '1.0em',
      [theme.breakpoints.down('sm')]: {},
    },
  },
});

interface TypesContextProps {
  typesData?: Linode.LinodeType[];
}

interface State {
  searchText: string;
  searchActive: boolean;
  linodes: Linode.Linode[];
  volumes: Linode.Volume[];
  nodebalancers: Linode.NodeBalancer[];
  domains: Linode.Domain[];
  resultsLoading: boolean;
  [resource: string]: any;
  options: Item[];
  searchResults: SearchResults;
}

type CombinedProps = TypesContextProps
  & WithStyles<ClassNames>
  & RouteComponentProps<{}>;

const Control = (props: any) =>
  <_Control {...props} />

// Style overrides for React Select
const selectStyles = {
  control: (base: any) => ({ ...base, backgroundColor: '#f4f4f4', margin: 0, width: '100%', border: 0 }),
  input: (base: any) => ({ ...base, margin: 0, width: '100%', border: 0 }),
  selectContainer: (base: any) => ({ ...base, width: '100%', margin: 0, border: 0 }),
  dropdownIndicator: (base: any) => ({ ...base, display: 'none' }),
  placeholder: (base: any) => ({ ...base, color: 'blue' }),
  menu: (base: any) => ({ ...base, maxWidth: '100% !important' })
};
class SearchBar extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  state: State = {
    linodes: [],
    volumes: [],
    nodebalancers: [],
    domains: [],
    images: [],
    searchText: '',
    searchActive: false,
    resultsLoading: false,
    options: [],
    searchResults: {...emptyResults}
  };

  lastFetch = moment.utc('1970-01-01T00:00:00');

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  dataAvailable() {
    return (
      this.state.linodes
      || this.state.volumes
      || this.state.nodebalancers
      || this.state.domains
    );
  }

  linodeDescription(
    typeLabel: string,
    memory: number,
    disk: number,
    vcpus: number,
    imageId: string,
  ) {
    const { images } = this.state;
    const image = (images && images.find((img:Linode.Image) => img.id === imageId))
      || { label: 'Unknown Image' };
    const imageDesc = image.label;
    const typeDesc = typeLabelLong(typeLabel, memory, disk, vcpus);
    return `${imageDesc}, ${typeDesc}`;
  }

  updateData = () => {
    getAllEntities(this.setEntitiesToState);
  }

  setEntitiesToState = (
    linodes: Linode.Linode[],
    nodebalancers: Linode.NodeBalancer[],
    volumes: Linode.Volume[],
    domains: Linode.Domain[],
    images: Linode.Image[]
  ) => {
    if (!this.mounted) { return; }
    this.setState({
      linodes,
      nodebalancers,
      volumes,
      domains,
      images
    }, this.getSearchSuggestions)
  }

  getSearchSuggestions = () => {
    const query = this.state.searchText;
    const { typesData } = this.props;
    if (!this.dataAvailable() || !query) {
      this.setState({ options: [], resultsLoading: false });
      return;
    };

    const { linodes, volumes, domains, nodebalancers, images } = this.state;

    const queryLower = query.toLowerCase();
    const searchResults: SearchResults = searchAll(
      linodes, volumes, nodebalancers, domains, images, queryLower, typesData,
    );

    /* Keep options (for the Select) and searchResults separate so that we can
    * pass the results to the search landing page in a usable format if necessary. */
    const options = [
      ...searchResults.linodes,
      ...searchResults.volumes,
      ...searchResults.nodebalancers,
      ...searchResults.domains,
      ...searchResults.images
    ]
    this.setState({ searchResults, options, resultsLoading: false });
  }

  handleSearchChange = (searchText: string): void => {
    this.setState({
      searchText,
      resultsLoading: true,
    }, () => {
      if (moment.utc().diff(this.lastFetch) > 60000) {
        this.lastFetch = moment.utc();
        // This will run getSearchSuggestions as a callback
        this.updateData();
      } else {
        this.getSearchSuggestions();
      }
    });
  }

  toggleSearch = () => {
    this.setState({
      searchActive: !this.state.searchActive,
    });
  }

  onSelect = (item: Item) => {
    if (!item || isEmpty(item)) { return; }
    const { history } = this.props;
    this.toggleSearch();
    history.push(item.data.path);
  }

  filterResults = (option: Item, inputValue: string) => {
    return true;
  }

  render() {
    const { classes } = this.props;
    const { searchActive, options, resultsLoading } = this.state;

    return (
      <React.Fragment>
        <IconButton
          color="inherit"
          aria-label="open menu"
          onClick={this.toggleSearch}
          className={classes.navIconHide}
          style={{ marginRight: 10 }}
        >
          <Search />
        </IconButton>
        <div
          className={`
          ${classes.root}
          ${searchActive ? 'active' : ''}
        `}>
          <Search
            className={classes.icon}
            data-qa-search-icon
          />
          <EnhancedSelect
            id="search-bar"
            options={options}
            onChange={this.onSelect}
            onInputChange={this.handleSearchChange}
            placeholder={
              searchActive ?
                "Search"
                :
                "Search for Linodes, Volumes, NodeBalancers, Domains, Tags..."
            }
            components={{ Control, Option: SearchSuggestion }}
            styleOverrides={selectStyles}
            openMenuOnFocus={false}
            openMenuOnClick={false}
            filterOption={this.filterResults}
            isLoading={resultsLoading}
            isClearable={false}
            isMulti={false}
            value={null}
          />
          <IconButton
            color="inherit"
            aria-label="close menu"
            onClick={this.toggleSearch}
            className={classes.navIconHide}
          >
            <Close className={classes.close} />
          </IconButton>
        </div>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

const typesContext = withTypes(({
  data: typesData,
}) => ({
  typesData,
}));

export default compose(
  styled,
  typesContext,
  withRouter,
)(SearchBar) as React.ComponentType<{}>;
