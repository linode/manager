import * as classNames from 'classnames';
import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EditableText from 'src/components/EditableText';
import H1Header from 'src/components/H1Header';
import { EditableProps, LabelProps } from './types';

const useStyles = makeStyles((theme: Theme) => ({
  editableContainer: {
    marginLeft: -theme.spacing(),
  },
  labelWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  crumb: {
    color: theme.cmrTextColors.tableStatic,
    fontSize: '1.125rem',
    textTransform: 'capitalize',
  },
  noCap: {
    textTransform: 'initial',
  },
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
    <div className={classes.labelWrapper}>
      <H1Header
        title={crumb}
        className={classNames({
          [classes.crumb]: true,
          [classes.noCap]: labelOptions && labelOptions.noCap,
        })}
        dataQaEl={crumb}
      />
      {labelOptions && labelOptions.subtitle && (
        <Typography variant="body1" data-qa-label-subtitle>
          {labelOptions.subtitle}
        </Typography>
      )}
    </div>
  );
};

export default compose<CombinedProps, Props>(React.memo)(FinalCrumb);
