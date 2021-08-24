import { Linode } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import SelectionCard from 'src/components/SelectionCard';

export interface ExtendedLinode extends Linode {
  heading: string;
  subHeadings: string[];
}

type ClassNames = 'root' | 'panelBody';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      width: '100%',
      backgroundColor: theme.color.white,
    },
    panelBody: {
      padding: `${theme.spacing(2)}px 0 0`,
    },
  });

interface Notice {
  text: string;
  level: 'warning' | 'error'; // most likely only going to need these two
}

interface Props {
  linodes: ExtendedLinode[];
  selectedLinodeID?: number;
  handleSelection: (id: number, diskSize?: number) => void;
  error?: string;
  header?: string;
  disabled?: boolean;
  notice?: Notice;
}

type StyledProps = Props & WithStyles<ClassNames>;

type CombinedProps = StyledProps;

class SelectLinodePanel extends React.Component<CombinedProps> {
  renderCard(linode: ExtendedLinode) {
    const { selectedLinodeID, handleSelection, disabled } = this.props;
    return (
      <SelectionCard
        key={`selection-card-${linode.id}`}
        onClick={(e) => {
          handleSelection(linode.id, linode.specs.disk);
        }}
        checked={linode.id === Number(selectedLinodeID)}
        heading={linode.heading}
        subheadings={linode.subHeadings}
        disabled={disabled}
      />
    );
  }

  render() {
    const { error, classes, linodes, header, notice, disabled } = this.props;

    return (
      <Paginate data={linodes}>
        {({
          count,
          data: linodesData,
          handlePageChange,
          handlePageSizeChange,
          page,
          pageSize,
        }) => {
          return (
            <>
              <Paper className={classes.root} data-qa-select-linode-panel>
                {error && <Notice text={error} error />}
                {notice && !disabled && (
                  <Notice
                    text={notice.text}
                    error={notice.level === 'error'}
                    warning={notice.level === 'warning'}
                  />
                )}
                <Typography variant="h2" data-qa-select-linode-header>
                  {!!header ? header : 'Select Linode'}
                </Typography>
                <Typography component="div" className={classes.panelBody}>
                  <Grid container>
                    {linodesData.map((linode) => {
                      return this.renderCard(linode);
                    })}
                  </Grid>
                </Typography>
              </Paper>
              <PaginationFooter
                count={count}
                handlePageChange={handlePageChange}
                handleSizeChange={handlePageSizeChange}
                page={page}
                pageSize={pageSize}
                eventCategory={'Clone from existing panel'}
              />
            </>
          );
        }}
      </Paginate>
    );
  }
}

const styled = withStyles(styles);

export default compose<CombinedProps, Props & RenderGuardProps>(
  RenderGuard,
  styled
)(SelectLinodePanel);
