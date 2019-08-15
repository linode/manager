import * as classNames from 'classnames';
import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import Typography from 'src/components/core/Typography';
import EditableText from 'src/components/EditableText';
import { EditableProps, LabelProps } from './types';

const useStyles = makeStyles((theme: Theme) => ({
  crumb: {
    whiteSpace: 'nowrap',
    textTransform: 'capitalize',
    ...theme.typography.h1
  },
  noCap: {
    textTransform: 'initial'
  },
  crumbLink: {
    color: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.primary.light
    }
  },
  labelWrapper: {
    display: 'flex',
    flexDirection: 'column'
  },
  labelText: {
    padding: `2px 10px`
  },
  editableContainer: {
    marginLeft: -theme.spacing(1),
    marginTop: -10,
    [theme.breakpoints.up('lg')]: {
      marginTop: -9
    }
  },
  slash: {
    fontSize: 24,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    color: theme.color.grey1
  }
}));

interface Props {
  crumb: string;
  subtitle?: string;
  labelOptions?: LabelProps;
  onEditHandlers?: EditableProps;
}

type CombinedProps = Props;

const FinalCrumb: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { crumb, labelOptions, onEditHandlers } = props;

  if (onEditHandlers) {
    return (
      <EditableText
        typeVariant="h2"
        text={onEditHandlers.editableTextTitle}
        errorText={onEditHandlers.errorText}
        onEdit={onEditHandlers.onEdit}
        onCancel={onEditHandlers.onCancel}
        labelLink={labelOptions && labelOptions.linkTo}
        data-qa-editable-text
        className={classes.editableContainer}
      />
    );
  }

  return (
    <React.Fragment>
      <div className={classes.labelWrapper}>
        <Typography
          variant="h1"
          className={classNames({
            [classes.crumb]: true,
            [classes.noCap]: labelOptions && labelOptions.noCap
          })}
          data-qa-label-text
        >
          {crumb}
        </Typography>
        {labelOptions && labelOptions.subtitle && (
          <Typography variant="body1" data-qa-label-subtitle>
            {labelOptions.subtitle}
          </Typography>
        )}
      </div>
    </React.Fragment>
  );
};

export default compose<CombinedProps, Props>(React.memo)(FinalCrumb);
