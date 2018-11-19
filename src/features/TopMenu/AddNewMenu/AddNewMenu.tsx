import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp';
import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'redux';
import DomainIcon from 'src/assets/addnewmenu/domain.svg';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import NodebalancerIcon from 'src/assets/addnewmenu/nodebalancer.svg';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import Button from 'src/components/core/Button';
import Menu from 'src/components/core/Menu';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import DomainCreateDrawer from 'src/features/Domains/DomainCreateDrawer';
import { handleClose, handleOpen } from 'src/store/reducers/domainDrawer';
import { openForCreating } from 'src/store/reducers/volumeDrawer';
import AddNewMenuItem, { MenuItem } from './AddNewMenuItem';

type CSSClasses = 'wrapper'
  | 'menu'
  | 'button'
  | 'caret'
  | 'mobileCreate'
  | 'mobileButton';

const styles: StyleRulesCallback = (theme) => ({
  wrapper: {
    [theme.breakpoints.down('sm')]: {
      flex: 1,
    },
  },
  menu: {
    [theme.breakpoints.up('md')]: {
      marginTop: 20,
    },
  },
  button: {
    paddingRight: 22,
    [theme.breakpoints.down('sm')]: {
      padding: '6px 11px 7px 14px',
    },
  },
  caret: {
    position: 'relative',
    top: 2,
    left: 2,
    marginLeft: theme.spacing.unit / 2,
  },
  mobileButton: {
    marginLeft: -theme.spacing.unit,
  },
  mobileCreate: {
    width: 32,
    height: 32,
  },
});

interface Props {
  openForCreating: typeof openForCreating;
}

interface State {
  anchorEl?: HTMLElement;
}

type CombinedProps = Props & WithStyles<CSSClasses> & RouteComponentProps<{}> & DispatchProps & StateProps;

const styled = withStyles(styles);

class AddNewMenu extends React.Component<CombinedProps, State> {
  state = {
    anchorEl: undefined,
  };

  items: MenuItem[] = [
    {
      title: 'Linode',
      onClick: (e) => {
        this.props.history.push('/linodes/create');
        this.handleClose();
        e.preventDefault();
      },
      body: `High performance SSD Linux servers for all of your infrastructure needs`,
      ItemIcon: LinodeIcon,
    },
    {
      title: 'Volume',
      onClick: (e) => {
        this.props.openForCreating();
        this.handleClose();
        e.preventDefault();
      },
      body: `Block Storage service allows you to attach additional storage to your Linode`,
      ItemIcon: VolumeIcon,
    },
    {
      title: 'NodeBalancer',
      onClick: (e) => {
        this.props.history.push('/nodebalancers/create');
        this.handleClose();
        e.preventDefault();
      },
      body: `Ensure your valuable applications and services are highly-available`,
      ItemIcon: NodebalancerIcon,
    },
    {
      title: 'Domain',
      onClick: (e) => {
        this.props.actions.openDomainDrawer();
        this.handleClose();
        e.preventDefault();
      },
      body: `Manage your DNS records using Linode’s high-availability name servers`,
      ItemIcon: DomainIcon,
    },
  ];

  handleClick = (event: React.MouseEvent<HTMLElement>) => {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose = () => {
    this.setState({ anchorEl: undefined });
  }

  onDomainSuccess = (domain:Linode.Domain) => {
    const id = domain.id ? domain.id : '';
    this.props.actions.closeDomainDrawer();
    this.props.history.push(`/domains/${id}`);
    return;
  }

  render() {
    const { anchorEl } = this.state;
    const { classes, domainDrawerOpen } = this.props;
    const { closeDomainDrawer } = this.props.actions;
    const itemsLen = this.items.length;

    return (
      <div className={classes.wrapper}>
        <Button
          variant="raised"
          color="primary"
          aria-owns={anchorEl ? 'add-new-menu' : undefined}
          aria-expanded={anchorEl ? true : undefined}
          aria-haspopup="true"
          onClick={this.handleClick}
          className={classes.button}
          data-qa-add-new-menu-button
        >
          Create {
            anchorEl
              ? <KeyboardArrowUp className={classes.caret} />
              : <KeyboardArrowDown className={classes.caret} />
          }
        </Button>
        <Menu
          id="add-new-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          getContentAnchorEl={undefined}
          PaperProps={{ square: true }}
          anchorOrigin={{ vertical: 45, horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          className={classes.menu}
        >
          {this.items.map((i, idx) =>
            <AddNewMenuItem
              key={idx}
              index={idx}
              count={itemsLen}
              {...i}
            />)}
        </Menu>
        <DomainCreateDrawer
          open={domainDrawerOpen}
          onClose={closeDomainDrawer}
          onSuccess={this.onDomainSuccess}
          mode="create"
        />
      </div>

    );
  }
}

export const styledComponent = styled(AddNewMenu);

interface DispatchProps {
  actions: {
    closeDomainDrawer: () => void;
    openDomainDrawer: () => void;
  },
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch, ownProps) => {
  return {
    actions: {
      closeDomainDrawer: () => dispatch(handleClose()),
      openDomainDrawer: () => dispatch(handleOpen()),
    }
  };
};
interface StateProps {
  domainDrawerOpen: boolean;
}

const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (state, ownProps) => ({
  domainDrawerOpen: state.domainDrawer.open
});

const connected = connect(mapStateToProps, mapDispatchToProps);

export default compose(
  connected,
  withRouter,
  styled,
)(AddNewMenu);
