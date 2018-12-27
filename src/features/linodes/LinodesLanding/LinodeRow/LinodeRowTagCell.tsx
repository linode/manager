import * as React from 'react';
import { compose, withStateHandlers } from 'recompose';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import TableCell from 'src/components/TableCell';

import LinodeRowTags from './LinodeRowTags';

import Tooltip from 'src/components/core/Tooltip';

type ClassNames =
  | 'root'
  | 'tagLink'
  | 'wrapper'

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    width: '15%',
    height: '100%',
    paddingTop: '0 !important',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    },
  },
  tagLink: {
    color: `${theme.color.blueDTwhite} !important`,
  },
  wrapper: {
    width: '100% !important',
    height: '100% !important',
  }
});

interface Props {
  tags: string[];
}

interface HandlerProps {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

type CombinedProps = Props & HandlerProps & WithStyles<ClassNames>;

const LinodeRowTagCell: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, close, isOpen, open, tags } = props;

  return (
    <TableCell parentColumn="Tags" className={classes.root}>
      {tags.length > 0
        ? <Tooltip
            title={<LinodeRowTags tags={tags} />}
            placement="bottom-start"
            leaveDelay={50}
            onOpen={open}
            onClose={close}
            open={isOpen}
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

const handlers = withStateHandlers({ isOpen: false },
  {
    open: () => () => ({ isOpen: true }),
    close: () => () => ({ isOpen: false })
  });

const enhanced = compose<CombinedProps, Props>(
  styled,
  handlers,
)(LinodeRowTagCell);

export default enhanced;
