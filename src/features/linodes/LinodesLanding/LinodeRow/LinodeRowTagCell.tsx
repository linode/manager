import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import TableCell from 'src/components/TableCell';

import LinodeRowTags from './LinodeRowTags';

import Tooltip from 'src/components/core/Tooltip';

type ClassNames =
  | 'root'
  | 'tagLink'
  | 'wrapper';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    width: '8%',
    height: '20px !important',
    paddingTop: '0 !important',
    paddingBottom: '0 !important',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    },
  },
  tagLink: {
    color: `${theme.color.blueDTwhite} !important`,
  },
  wrapper: {},
});

interface Props {
  tags: string[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const LinodeRowTagCell: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, tags } = props;

  return (
    <TableCell parentColumn="Tags" className={classes.root}>
      {tags.length > 0
        ? <Tooltip
            title={<LinodeRowTags tags={tags} />}
            placement="bottom-start"
            leaveDelay={50}
            interactive={true}
          >
            <div className={classes.wrapper}>
              <a className={classes.tagLink}>{tags.length}</a>
            </div>
          </Tooltip>
        : <Typography>0</Typography>
      }
    </TableCell>
  )
};

const styled = withStyles(styles);

export default styled(LinodeRowTagCell);
