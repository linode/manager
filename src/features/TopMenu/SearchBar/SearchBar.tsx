import Close from '@material-ui/icons/Close';
import Search from '@material-ui/icons/Search';
import * as Bluebird from 'bluebird';
import * as moment from 'moment';
import { compose, isEmpty, or } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import _Control from 'react-select/lib/components/Control';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import NodebalIcon from 'src/assets/addnewmenu/nodebalancer.svg';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import IconButton from 'src/components/core/IconButton';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import { withTypes } from 'src/context/types';
import { displayType, typeLabelLong } from 'src/features/linodes/presentation';
import { getDomains } from 'src/services/domains';
import { getImages } from 'src/services/images';
import { getLinodes } from 'src/services/linodes';
import { getNodeBalancers } from 'src/services/nodebalancers';
import { getVolumes } from 'src/services/volumes';
import { getAll } from 'src/utilities/getAll';
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
  linodes?: Linode.Linode[];
  volumes?: Linode.Volume[];
  nodebalancers?: Linode.NodeBalancer[];
  domains?: Linode.Domain[];
  resultsLoading: boolean;
  [resource: string]: any;
  options: Item[];
}

type CombinedProps = TypesContextProps
  & WithStyles<ClassNames>
  & RouteComponentProps<{}>;

const getAllLinodes = getAll(getLinodes);
const getAllNodeBalancers = getAll(getNodeBalancers);
const getAllVolumes = getAll(getVolumes);
const getAllDomains = getAll(getDomains);
const getAllImages = getAll(getImages);

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
    searchText: '',
    searchActive: false,
    resultsLoading: false,
    options: []
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
    Bluebird.join(
      getAllLinodes(),
      getAllNodeBalancers(),
      getAllVolumes(),
      getAllDomains(),
      getAllImages(),
      this.setEntitiesToState
    )
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

  // Helper can be extended to other entities once tags are supported for them.
  // @todo Inefficient to call this function twice for each search result.
  getMatchingTags = (tags:string[], query:string): string[] => {
    return tags.filter((tag:string) => tag.toLocaleLowerCase().includes(query));
  }

  getSearchSuggestions = () => {
    const query = this.state.searchText;
    const { typesData } = this.props;
    if (!this.dataAvailable() || !query) {
      this.setState({ options: [], resultsLoading: false });
      return;
    };

    const queryLower = query.toLowerCase();
    const searchResults = [];

    if (this.state.linodes && typesData) {
      const linodesByLabel = this.state.linodes.filter(
        linode => {
          const matchingTags = this.getMatchingTags(linode.tags, queryLower);
          const bool = or(
            linode.label.toLowerCase().includes(queryLower),
            matchingTags.length > 0
          )
          return bool;
        }
      );
      searchResults.push(...(linodesByLabel.map(linode => ({
        label: linode.label,
        value: linode.id,
        data: {
          tags: this.getMatchingTags(linode.tags, queryLower),
          description: this.linodeDescription(
            displayType(linode.type, typesData),
            linode.specs.memory,
            linode.specs.disk,
            linode.specs.vcpus,
            linode.image!,
          ),
          Icon: LinodeIcon,
          path: `/linodes/${linode.id}`,
          searchText: query,
        }
      }))));
    }

    if (this.state.volumes) {
      const volumesByLabel = this.state.volumes.filter(
        volume => {
          const matchingTags = this.getMatchingTags(volume.tags, queryLower);
          const bool = or(
            volume.label.toLowerCase().includes(queryLower),
            matchingTags.length > 0
          )
          return bool;
        }
      );
      searchResults.push(...(volumesByLabel.map(volume => ({
        label: volume.label,
        value: volume.id,
        data: {
          tags: volume.tags,
          description: volume.size + ' G',
          Icon: VolumeIcon,
          path: `/volumes/${volume.id}`,
          searchText: query,
        }
      }))));
    }

    if (this.state.nodebalancers) {
      const nodebalancersByLabel = this.state.nodebalancers.filter(
        nodebal => nodebal.label.toLowerCase().includes(queryLower),
      );
      searchResults.push(...(nodebalancersByLabel.map(nodebal => ({
        label: nodebal.label,
        value: nodebal.id,
        data: {
          tags: [],
          description: nodebal.hostname,
          Icon: NodebalIcon,
          path: `/nodebalancers/${nodebal.id}`,
          searchText: query,
        }
      }))));
    }

    if (this.state.domains) {
      const domainsByLabel = this.state.domains.filter(
        domain => {
          const matchingTags = this.getMatchingTags(domain.tags, queryLower);
          const bool = or(
            domain.domain.toLowerCase().includes(queryLower),
            matchingTags.length > 0
          )
          return bool;
        }
      );
      searchResults.push(...(domainsByLabel.map(domain => ({
        label: domain.domain,
        value: domain.id,
        data: {
          tags: domain.tags,
          description: domain.description || domain.status,
          /* TODO: Update this with the Domains icon! */
          Icon: NodebalIcon,
          path: `/domains/${domain.id}`,
          searchText: query
        }
      }))));
    }

    if (this.state.images) {
      const imagesByLabel = this.state.images.filter(
        (image: Linode.Image) => (
          /* TODO: this should be a pre-filter at the API level */
          image.is_public === false
          && image.label.toLowerCase().includes(queryLower)
        ),
      );
      searchResults.push(...(imagesByLabel.map((image: Linode.Image) => ({
        label: image.label,
        value: image.id,
        data: {
          tags: [],
          description: image.description || '',
          /* TODO: Update this with the Images icon! */
          Icon: VolumeIcon,
          /* TODO: Choose a real location for this to link to */
          path: `/images`,
          searchText: query,
        }
      }))));
    }
    this.setState({ options: searchResults, resultsLoading: false });
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
