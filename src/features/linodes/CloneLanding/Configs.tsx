import * as React from 'react';
import { compose } from 'recompose';
import CheckBox from 'src/components/CheckBox';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import { ConfigSelection } from './utilities';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    '& td': {
      borderBottom: 'none',
      paddingTop: 0,
      paddingBottom: 0
    }
  }
});
interface Props {
  configs: Linode.Config[];
  configSelection: ConfigSelection;
  handleSelect: (id: number) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const Configs: React.FC<CombinedProps> = props => {
  const { classes, configs, handleSelect, configSelection } = props;

  return (
    <Paginate data={configs}>
      {({
        data: paginatedData,
        handlePageChange,
        handlePageSizeChange,
        page,
        pageSize,
        count
      }) => {
        return (
          <React.Fragment>
            <Table
              isResponsive={false}
              aria-label="List of Configurations"
              border={false}
              className={classes.root}
            >
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRowEmptyState colSpan={1} />
                ) : (
                  paginatedData.map((config: Linode.Config) => (
                    <TableRow key={config.id} data-qa-config={config.label}>
                      <TableCell>
                        <CheckBox
                          checked={configSelection[config.id].isSelected}
                          onChange={() => handleSelect(config.id)}
                          text={config.label}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <PaginationFooter
              count={count}
              page={page}
              pageSize={pageSize}
              handlePageChange={handlePageChange}
              handleSizeChange={handlePageSizeChange}
              eventCategory="linode configs"
            />
          </React.Fragment>
        );
      }}
    </Paginate>
  );
};

const styled = withStyles(styles);
const enhanced = compose<CombinedProps, Props>(styled);

export default enhanced(Configs);
