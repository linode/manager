import Downshift, { DownshiftState, StateChangeOptions } from 'downshift';
import * as moment from 'moment';
import { compose, or } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Close from '@material-ui/icons/Close';
import Search from '@material-ui/icons/Search';

import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import NodebalIcon from 'src/assets/addnewmenu/nodebalancer.svg';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import TextField from 'src/components/TextField';
import { withTypes } from 'src/context/types';
import { displayType, typeLabelLong } from 'src/features/linodes/presentation';
import { getDomains } from 'src/services/domains';
import { getImagesPage } from 'src/services/images';
import { getLinodesPage } from 'src/services/linodes';
import { getNodeBalancers } from 'src/services/nodebalancers';
import { getVolumes } from 'src/services/volumes';

import SearchSuggestion, { SearchSuggestionT } from './SearchSuggestion';

type ClassNames =
  'root'
  | 'navIconHide'
  | 'close'
  | 'textfieldContainer'
  | 'textfield'
  | 'input'
  | 'icon'
  | 'searchSuggestions'
  | 'item'
  | 'selectedMenuItem';

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
      zIndex: 2,
      left: 0,
      visibility: 'hidden',
      opacity: 0,
      margin: 0,
      '&.active': {
        visibility: 'visible',
        opacity: 1,
      },
    },
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
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
  searchSuggestions: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 60,
    padding: 0,
    boxShadow: `0 0 5px ${theme.color.boxShadow}`,
    maxHeight: 325,
    overflowY: 'auto',
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
  images?: Linode.Image[];
  [resource: string]: any;
}

type CombinedProps = TypesContextProps
  & WithStyles<ClassNames>
  & RouteComponentProps<{}>;

class SearchBar extends React.Component<CombinedProps, State> {
  state: State = {
    searchText: '',
    searchActive: false,
  };

  lastFetch = moment.utc('1970-01-01T00:00:00');

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

  getAllPagesFor_(
    name: string,
    fetchFn: (page: number) => Promise<any>,
    page: number,
    pageCount: number,
  ) {
    if (!page || !pageCount) { return; }
    if (page > pageCount) { return; }
    fetchFn(page)
      .then((response) => {
        this.setState(prevState => ({
          [name]: [...prevState[name], ...response.data],
        }));
        this.getAllPagesFor_(name, fetchFn, page + 1, pageCount);
      });
  }

  getAllPagesFor(name: string, fetchFn: (page: number) => Promise<any>) {
    /* fetch the first page and get the page count */
    fetchFn(1)
      .then((response) => {
        this.setState({ [name]: response.data });
        /* fetch the rest of the pages */
        const pageCount = response.pages;
        this.getAllPagesFor_(name, fetchFn, 2, pageCount);
      });
  }

  getVolumesPage = (page: number) => getVolumes({ page })
  getDomainsPage = (page: number) => getDomains({ page })
  getNodeBalancersPage = (page: number) => getNodeBalancers({ page })

  updateData = () => {
    this.getAllPagesFor('linodes', getLinodesPage);
    this.getAllPagesFor('volumes', this.getVolumesPage);
    this.getAllPagesFor('nodebalancers', this.getNodeBalancersPage);
    this.getAllPagesFor('domains', this.getDomainsPage);
    this.getAllPagesFor('images', getImagesPage);
  }

  // Helper can be extended to other entities once tags are supported for them.
  // @todo Inefficient to call this function twice for each search result.
  getMatchingTags = (tags:string[], query:string): string[] => {
    return tags.filter((tag:string) => tag.toLowerCase().includes(query));
  }

  getSearchSuggestions = (query: string | null) => {
    const { typesData } = this.props;
    if (!this.dataAvailable() || !query) { return [] };

    const queryLower = query.toLowerCase();
    const searchResults = [];

    if (this.state.linodes && typesData) {
      const linodesByLabel = this.state.linodes.filter(
        linode => {
          const matchingTags = this.getMatchingTags(linode.tags, queryLower);
          return or(
            linode.label.toLowerCase().includes(queryLower),
            matchingTags.length > 0
          )
        }
      );
      searchResults.push(...(linodesByLabel.map(linode => ({
        title: linode.label,
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
      }))));
    }

    if (this.state.volumes) {
      const volumesByLabel = this.state.volumes.filter(
        volume => volume.label.toLowerCase().includes(queryLower),
      );
      searchResults.push(...(volumesByLabel.map(volume => ({
        title: volume.label,
        description: volume.size + ' G',
        Icon: VolumeIcon,
        path: `/volumes/${volume.id}`,
      }))));
    }

    if (this.state.nodebalancers) {
      const nodebalancersByLabel = this.state.nodebalancers.filter(
        nodebal => nodebal.label.toLowerCase().includes(queryLower),
      );
      searchResults.push(...(nodebalancersByLabel.map(nodebal => ({
        title: nodebal.label,
        description: nodebal.hostname,
        Icon: NodebalIcon,
        path: `/nodebalancers/${nodebal.id}`,
      }))));
    }

    if (this.state.domains) {
      const domainsByLabel = this.state.domains.filter(
        domain => domain.domain.toLowerCase().includes(queryLower),
      );
      searchResults.push(...(domainsByLabel.map(domain => ({
        title: domain.domain,
        description: domain.description || domain.status,
        /* TODO: Update this with the Domains icon! */
        Icon: NodebalIcon,
        path: `/domains/${domain.id}`,
      }))));
    }

    if (this.state.images) {
      const imagesByLabel = this.state.images.filter(
        image => (
          /* TODO: this should be a pre-filter at the API level */
          image.is_public === false
          && image.label.toLowerCase().includes(queryLower)
        ),
      );
      searchResults.push(...(imagesByLabel.map(image => ({
        title: image.label,
        description: image.description || '',
        /* TODO: Update this with the Images icon! */
        Icon: VolumeIcon,
        /* TODO: Choose a real location for this to link to */
        path: `/images`,
      }))));
    }

    return searchResults;
  }

  handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({
      searchText: e.target.value,
    }, () => {
      if (moment.utc().diff(this.lastFetch) > 60000) {
        this.lastFetch = moment.utc();
        this.updateData();
      }
    });
  }

  toggleSearch = () => {
    this.setState({
      searchActive: !this.state.searchActive,
    });
  }

  onSelect = (item: SearchSuggestionT) => {
    const { history } = this.props;
    /* Need to unfocus the search bar so the
    *  keyboard disappears on mobile.
    *  This is a known issue with Downshift (https://github.com/paypal/downshift/issues/32),
    *  hopefully this kludge won't be needed with React-Select.
    */
    const node = document.getElementById('searchbar-simple');
    if (node) { node.blur(); }
    this.toggleSearch();
    history.push(item.path);
  }

  renderSuggestion(
    suggestion: SearchSuggestionT,
    index: number,
    highlightedIndex: number | null,
    itemProps: any,
  ) {
    const { classes, history } = this.props;
    const isHighlighted = highlightedIndex === index;

    return (
      <MenuItem
        {...itemProps}
        key={suggestion.title + suggestion.description}
        selected={isHighlighted}
        component="div"
        className={classes.item}
        classes={{ selected: classes.selectedMenuItem }}
        data-qa-suggestion={suggestion.title}
        data-qa-selected={isHighlighted}
      >
        <SearchSuggestion
          Icon={suggestion.Icon}
          title={suggestion.title}
          description={suggestion.description}
          searchText={this.state.searchText}
          path={suggestion.path}
          history={history}
          tags={suggestion.tags}
          isHighlighted={isHighlighted}
        />
      </MenuItem>
    );
  }

  downshiftStateReducer(state: DownshiftState, changes: StateChangeOptions) {
    switch (changes.type) {
      case Downshift.stateChangeTypes.blurInput:
        return {
          ...changes,
          inputValue: '',
        };
      default:
        return changes;
    }
  }

  render() {
    const { classes } = this.props;
    const { searchActive } = this.state;

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
          <Downshift
            onSelect={this.onSelect}
            stateReducer={this.downshiftStateReducer}
            itemToString={(item: SearchSuggestionT) => (item && item.title) || ''}
            render={({
              getInputProps,
              getItemProps,
              isOpen,
              inputValue,
              highlightedIndex,
            }) => (
                <div className={classes.textfieldContainer}>
                  <TextField
                    fullWidth
                    className={classes.textfield}
                    autoFocus={searchActive}
                    InputProps={{
                      classes: {
                        root: classes.input,
                      },
                      ...getInputProps({
                        placeholder: 'Go to Linodes, Volumes, NodeBalancers, Domains...',
                        id: 'searchbar-simple',
                        onChange: this.handleSearchChange,
                      }),
                    }}
                    data-qa-search
                  />
                  {isOpen &&
                    <Paper
                      className={classes.searchSuggestions}
                    >
                      {this.getSearchSuggestions(inputValue).map((suggestion, index) => {
                        return this.renderSuggestion(
                          suggestion,
                          index,
                          highlightedIndex,
                          getItemProps({ item: suggestion }),
                        );
                      })}
                    </Paper>
                  }
                </div>
              )}
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

const styled = withStyles(styles, { withTheme: true });

const typesContext = withTypes(({
  data: typesData,
}) => ({
  typesData,
}));

export default compose(
  styled,
  typesContext,
  withRouter,
)(SearchBar);
