import * as H from 'history';
import * as React from 'react';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import ExpansionPanel from 'src/components/ExpansionPanel';
import PaginationFooter from 'src/components/PaginationFooter';

import DomainIcon from 'src/assets/addnewmenu/domain.svg';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import NodeBalancerIcon from 'src/assets/addnewmenu/nodebalancer.svg';
import StackScriptIcon from 'src/assets/addnewmenu/stackscripts.svg';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';

import ClickableRow from './ClickableRow';

type ClassNames = 'root' | 'icon';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  icon: {
    width: 100,
  },
});

interface Props {
  data: any;
  handlePageChange: (newPage: number) => void;
  handleSizeChange: (newPageSize: number) => void;
  currentPage: number;
  pageSize: number;
  label: string;
  history: H.History;
}

interface State {}

type CombinedProps = Props
  & WithStyles<ClassNames>;

class SearchResultsPanel extends React.Component<CombinedProps, State> {
  state: State = {};

  getResultUrl = (type:string, id: string) => {
    switch (type) {
      case 'Linodes':
        return `linodes/${id}`
      case 'Volumes':
        return `volumes/${id}`
      case 'StackScripts':
        // @todo update to SS detail page/modal
        // This is an unfortunate hack in the meantime.
        window.location.href = `https://www.linode.com/stackscripts/view/${id}`
      case 'Domains':
        return `domains/${id}`
      case 'NodeBalancers':
        return `nodebalancers/${id}`;
      default:
        return '';
    }
  }

  handleItemRowClick = (id: string, type: string) => {
    const url: string = this.getResultUrl(type, id);
    if (!url) { return; }
    this.props.history.push(url);
  }

  /**
   * @param type string - correlates with the 'label' prop
   * on each of the iterables objects
   */
  getRelevantIcon = (type: string) => {
    switch (type) {
      case 'Linodes':
        return <LinodeIcon />
      case 'Volumes':
        return <VolumeIcon />
      case 'StackScripts':
        return <StackScriptIcon />
      case 'Domains':
        return <DomainIcon />
      case 'NodeBalancers':
        return <NodeBalancerIcon />
      default:
        return <LinodeIcon />
    }
  }

  renderPanelRow = (type: string, data: any) => {
    /*
    * Domains don't have labels
    */
    const title = (!!data.label)
      ? data.label
      : data.domain

    const { classes } = this.props;

    return (
      <ClickableRow
        type={type}
        id={data.id}
        key={data.id}
        handleClick={this.handleItemRowClick}
      >
        <TableCell className={classes.icon}>{this.getRelevantIcon(type)}</TableCell>
        <TableCell>{title}</TableCell>
      </ClickableRow>
    )
  }

  render() {
    const {
      data,
      label,
      currentPage,
      pageSize,
      handlePageChange,
      handleSizeChange
    } = this.props;
    return (
      <ExpansionPanel
        heading={label}
        key={label}
        defaultExpanded={!!data.data.length}
      >
        <Table>
          <TableBody>
            {data.data.map((eachEntity: any) =>
              this.renderPanelRow(label, eachEntity))}
          </TableBody>
        </Table>
        {data.results > 25 &&
          <PaginationFooter
            count={data.results}
            page={currentPage}
            pageSize={pageSize}
            handlePageChange={handlePageChange}
            handleSizeChange={handleSizeChange}
          />
        }
      </ExpansionPanel>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(SearchResultsPanel);