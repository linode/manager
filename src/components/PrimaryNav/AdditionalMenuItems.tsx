import * as React from 'react';
import { Link } from 'react-router-dom';

import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/core/styles';
import Divider from 'src/components/core/Divider';
import ListItem from 'src/components/core/ListItem';
import ListItemText from 'src/components/core/ListItemText';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface Props {
  closeMenu: () => void;
  navigate: (href: string) => void;
  linkClasses: (href?: string) => string;
  listItemClasses: string;
  dividerClasses: string;
}

interface State {
  adaError?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

interface PrimaryLink {
  href?: string;
  onClick?: () => void;
  key: string;
  display: string;
  logo?: React.ComponentType<any>;
}

class AdditionalMenuItems extends React.PureComponent<CombinedProps, State> {
  state: State = {};

  componentDidMount() {
    /*
     * Init Ada Chaperone chat app
     * Script is included in index.html
     */
    if ('AdaChaperone' in window) {
      this.ada = new (window as any).AdaChaperone('linode');
    }
  }

  handleAdaInit = () => {
    /*
     * Show the Ada chat
     */
    if (typeof this.ada === 'undefined') {
      this.setState({
        adaError:
          'There was an issue loading the chat at this time. Please try again later.'
      });
      return;
    }
    this.setState({ adaError: '' });
    this.ada.show();
  };

  links: PrimaryLink[] = [
    { display: 'Get Help', href: '/support', key: 'help' },
    { display: 'Chat', key: 'chat', onClick: this.handleAdaInit }
  ];

  /** ada chat bot */
  ada: any = undefined;

  render() {
    return (
      <React.Fragment>
        {this.links.map(eachLink => {
          if (!eachLink.onClick && !eachLink.href) {
            throw new Error(
              'A Primary Link needs either an href or an onClick prop'
            );
          }

          /* 
           href takes priority here. So if an href and onClick 
           so if an href and onClick is provided, the onClick will not be applied
          */
          return (
            <React.Fragment key={eachLink.key}>
              {eachLink.href ? (
                <Link
                  role="menuitem"
                  to={eachLink.href}
                  onClick={this.props.closeMenu}
                  data-qa-nav-item={eachLink.key}
                  className={this.props.linkClasses(eachLink.href)}
                >
                  <ListItemText
                    primary={eachLink.display}
                    disableTypography={true}
                    className={this.props.listItemClasses}
                  />
                </Link>
              ) : (
                <ListItem
                  role="menuitem"
                  onClick={() => {
                    this.props.closeMenu();
                    /** disregarding undefined is fine here becasue of the error thrown above */
                    eachLink.onClick!();
                  }}
                  data-qa-nav-item={eachLink.key}
                  className={this.props.linkClasses()}
                >
                  <ListItemText
                    primary={eachLink.display}
                    disableTypography={true}
                    className={this.props.listItemClasses}
                  />
                </ListItem>
              )}
              <Divider className={this.props.dividerClasses} />
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(AdditionalMenuItems);
