import { Config } from 'linode-js-sdk/lib/linodes';
import * as React from 'react';
import CheckBox from 'src/components/CheckBox';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import { ConfigSelection } from './utilities';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& td': {
      borderBottom: 'none',
      paddingTop: 0,
      paddingBottom: 0
    }
  }
}));
export interface Props {
  configs: Config[];
  configSelection: ConfigSelection;
  handleSelect: (id: number) => void;
}

export const Configs: React.FC<Props> = props => {
  const { configs, handleSelect, configSelection } = props;

  const classes = useStyles();

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
            <div
              id="tabpanel-linode-clone-configs"
              role="tabpanel"
              aria-labelledby="tab-linode-clone-configs"
            >
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
                    paginatedData.map((config: Config) => (
                      <TableRow key={config.id} data-qa-config={config.label}>
                        <TableCell>
                          <CheckBox
                            checked={
                              configSelection[config.id] &&
                              configSelection[config.id].isSelected
                            }
                            onChange={() => handleSelect(config.id)}
                            text={config.label}
                            data-testid={`checkbox-${config.id}`}
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
            </div>
          </React.Fragment>
        );
      }}
    </Paginate>
  );
};

export default Configs;
