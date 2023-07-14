import { Linode } from '@linode/api-v4/lib/linodes';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { WithStyles, createStyles, withStyles } from '@mui/styles';
import * as React from 'react';
import { compose } from 'recompose';

import { Notice } from 'src/components/Notice/Notice';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { Typography } from 'src/components/Typography';
import Paper from 'src/components/core/Paper';

export interface ExtendedLinode extends Linode {
  heading: string;
  subHeadings: string[];
}

type ClassNames = 'panelBody' | 'root';

const styles = (theme: Theme) =>
  createStyles({
    panelBody: {
      padding: `${theme.spacing(2)} 0 0`,
    },
    root: {
      backgroundColor: theme.color.white,
      flexGrow: 1,
      width: '100%',
    },
  });

interface Notice {
  level: 'error' | 'warning'; // most likely only going to need these two 'warning'; 'warning';
  text: string;
}

interface Props {
  disabled?: boolean;
  error?: string;
  handleSelection: (id: number, type: null | string, diskSize?: number) => void;
  header?: string;
  linodes: ExtendedLinode[];
  notice?: Notice;
  selectedLinodeID?: number;
}

type StyledProps = Props & WithStyles<ClassNames>;

type CombinedProps = StyledProps;

class SelectLinodePanel extends React.Component<CombinedProps> {
  render() {
    const { classes, disabled, error, header, linodes, notice } = this.props;

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
                {error && <Notice error text={error} />}
                {notice && !disabled && (
                  <Notice
                    error={notice.level === 'error'}
                    text={notice.text}
                    warning={notice.level === 'warning'}
                  />
                )}
                <Typography data-qa-select-linode-header variant="h2">
                  {!!header ? header : 'Select Linode'}
                </Typography>
                <Typography className={classes.panelBody} component="div">
                  <Grid container spacing={2}>
                    {linodesData.map((linode) => {
                      return this.renderCard(linode);
                    })}
                  </Grid>
                </Typography>
              </Paper>
              <PaginationFooter
                count={count}
                eventCategory={'Clone from existing panel'}
                handlePageChange={handlePageChange}
                handleSizeChange={handlePageSizeChange}
                page={page}
                pageSize={pageSize}
              />
            </>
          );
        }}
      </Paginate>
    );
  }

  renderCard(linode: ExtendedLinode) {
    const { disabled, handleSelection, selectedLinodeID } = this.props;
    return (
      <SelectionCard
        onClick={(e) => {
          handleSelection(linode.id, linode.type, linode.specs.disk);
        }}
        checked={linode.id === Number(selectedLinodeID)}
        disabled={disabled}
        heading={linode.heading}
        key={`selection-card-${linode.id}`}
        subheadings={linode.subHeadings}
      />
    );
  }
}

const styled = withStyles(styles);

export default compose<CombinedProps, Props & RenderGuardProps>(
  RenderGuard,
  styled
)(SelectLinodePanel);
