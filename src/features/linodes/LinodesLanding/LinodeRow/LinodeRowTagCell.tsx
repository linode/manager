import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ShowMore from 'src/components/ShowMore';
import TableCell from 'src/components/TableCell';
import Tag from 'src/components/Tag';

type ClassNames =
  'icon'
  | 'noBackupText'
  | 'root'
  | 'wrapper'
  | 'backupLink';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  icon: {
    fontSize: 18,
    fill: theme.color.grey1,
  },
  noBackupText: {
    marginRight: '8px',
  },
  root: {
    width: '15%',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    },
  },
  wrapper: {
    display: 'flex',
    alignContent: 'center',
  },
  backupLink: {
    display: 'flex'
  }
});

interface Props {
  tags: string[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const renderTags = (tags: string[]) =>
  tags.map((tag, idx) => <Tag key={`linode-row-tag-item-${idx}`} colorVariant='lightBlue' label={tag} />)

const LinodeRowTagCell: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, tags } = props;

  return (
    <TableCell parentColumn="Tags" className={classes.root}>
      {tags.length > 0
        ? <ShowMore
            items={tags}
            render={renderTags}
            asLink
          >
            <a>{tags.length}</a>
          </ShowMore>
        : <Typography>0</Typography>

      }

    </TableCell>
  )
};

const styled = withStyles(styles);

export default styled(LinodeRowTagCell);
