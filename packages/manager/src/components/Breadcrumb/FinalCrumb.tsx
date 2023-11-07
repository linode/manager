import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import * as React from 'react';

import { EditableText } from 'src/components/EditableText/EditableText';
import { H1Header } from 'src/components/H1Header/H1Header';

import { EditableProps, LabelProps } from './types';

const useStyles = makeStyles((theme: Theme) => ({
  crumb: {
    color: theme.textColors.tableStatic,
    fontSize: '1.125rem',
    textTransform: 'capitalize',
  },
  editableContainer: {
    '& > div': {
      width: 250,
    },
    marginLeft: `-${theme.spacing()}`,
  },
  labelWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  noCap: {
    textTransform: 'initial',
  },
}));

interface Props {
  crumb: string;
  labelOptions?: LabelProps;
  onEditHandlers?: EditableProps;
}

export const FinalCrumb = React.memo((props: Props) => {
  const classes = useStyles();
  const { crumb, labelOptions, onEditHandlers } = props;

  if (onEditHandlers) {
    return (
      <EditableText
        className={classes.editableContainer}
        data-qa-editable-text
        errorText={onEditHandlers.errorText}
        labelLink={labelOptions && labelOptions.linkTo}
        onCancel={onEditHandlers.onCancel}
        onEdit={onEditHandlers.onEdit}
        text={onEditHandlers.editableTextTitle}
      />
    );
  }

  return (
    <div className={classes.labelWrapper}>
      <H1Header
        className={classNames({
          [classes.crumb]: true,
          [classes.noCap]: labelOptions && labelOptions.noCap,
        })}
        dataQaEl={crumb}
        title={crumb}
      />
    </div>
  );
});
