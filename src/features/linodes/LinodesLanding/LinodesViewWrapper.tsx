import { splitAt } from 'ramda';
import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';

import Grid from 'src/components/Grid';
import ShowMore from 'src/components/ShowMore';
import Table from 'src/components/Table';
import TableRow from 'src/components/TableRow';
import Tag from 'src/components/Tag';

import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';

import LinodeCard from './LinodeCard';
import LinodeRow from './LinodeRow';

interface Props {
  view: 'grid' | 'list';
  linodes: Linode.EnhancedLinode[];
  images: Linode.Image[];
  openConfigDrawer: (c: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
  toggleConfirmation: (bootOption: Linode.BootAction,
    linodeId: number, linodeLabel: string) => void;
}

type ClassNames = 'row'
  | 'tag';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => {
  return ({
    row: {
      display: 'flex',
      alignItems: 'center',
    },
    tag: {
      color: theme.palette.text.primary,
      fontSize: '.9rem',
    },
  });
};

const safeGetImageLabel = (images: Linode.Image[], slug: string | null): string => {
  if (!slug) {
    return 'No Image'
  }
  const iv = images.find((i) => i.id === slug);
  return iv ? iv.label : 'Unknown Image';
};

type CombinedProps = Props & WithStyles<ClassNames>;

class LinodesViewWrapper extends React.Component<CombinedProps, {}> {
  renderTag = (tags: string[]) => {
    const { classes } = this.props;
    return tags.map(eachTag => {
      return (
        <Tag
          className={classes.row}
          label={eachTag}
          key={eachTag}
          variant="gray"
        />
      )
    })
  }

  renderMoreTags = (tags: string[]) => {
    return (
      <ShowMore
        items={tags}
        render={this.renderTag}
      />
    )
  }

  renderTagsAndMoreTags = (linodeTags: string[]) => {
    const [visibleTags, additionalTags] = splitAt(3, linodeTags);
    return (
      <React.Fragment>
        {
          visibleTags.map(eachTag => {
            return (
              <Tag
                label={eachTag}
                key={eachTag}
                variant="gray"
              />
            )
          })
        }
        {!!additionalTags.length && this.renderMoreTags(additionalTags)}
      </React.Fragment>
    )
  }

  renderCards = () => {
    const { linodes, images, openConfigDrawer, toggleConfirmation } = this.props;

    return (
      <Grid container>
        {linodes.map(linode =>
          <LinodeCard
            key={linode.id}
            linodeId={linode.id}
            linodeStatus={linode.status}
            linodeIpv4={linode.ipv4}
            linodeIpv6={linode.ipv6}
            linodeRegion={linode.region}
            linodeType={linode.type}
            linodeNotification={linode.notification}
            linodeLabel={linode.label}
            linodeBackups={linode.backups}
            linodeTags={linode.tags}
            linodeRecentEvent={linode.recentEvent}
            imageLabel={safeGetImageLabel(images, linode.image)}
            openConfigDrawer={openConfigDrawer}
            linodeSpecDisk={linode.specs.disk}
            linodeSpecMemory={linode.specs.memory}
            linodeSpecVcpus={linode.specs.vcpus}
            linodeSpecTransfer={linode.specs.transfer}
            toggleConfirmation={toggleConfirmation}
            renderTagsAndMoreTags={this.renderTagsAndMoreTags}
          />,
        )}
      </Grid>
    )
  }

  renderRows = () => {
    const { linodes, openConfigDrawer, toggleConfirmation } = this.props;

    return (
      <Paper>
        <Grid container className="my0">
          <Grid item xs={12} className="py0">
            <Table arial-label="List of Linodes">
              <TableHead data-qa-table-head>
                <TableRow>
                  <TableCell>Linode</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>IP Addresses</TableCell>
                  <TableCell>Region</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {linodes.map(linode =>
                  <LinodeRow
                    key={linode.id}
                    linodeId={linode.id}
                    linodeType={linode.type}
                    linodeStatus={linode.status}
                    linodeIpv4={linode.ipv4}
                    linodeIpv6={linode.ipv6}
                    linodeRegion={linode.region}
                    linodeNotification={linode.notification}
                    linodeLabel={linode.label}
                    linodeBackups={linode.backups}
                    linodeTags={linode.tags}
                    linodeRecentEvent={linode.recentEvent}
                    openConfigDrawer={openConfigDrawer}
                    toggleConfirmation={toggleConfirmation}
                    renderTagsAndMoreTags={this.renderTagsAndMoreTags}
                  />,
                )}
              </TableBody>
            </Table>
          </Grid>
        </Grid>
      </Paper>
    )
  }

  render() {
    const { view } = this.props;
    return (
      <React.Fragment>
        {(view === 'grid')
          ? this.renderCards()
          : this.renderRows()}
      </React.Fragment>
    );
  }
};

export default withStyles(styles, { withTheme: true })(LinodesViewWrapper);
