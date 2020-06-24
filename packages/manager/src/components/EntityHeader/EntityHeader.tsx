import * as React from 'react';
import { makeStyles } from 'src/components/core/styles';
import HeaderBreadCrumb, { BreadCrumbProps } from './HeaderBreadCrumb';

export interface HeaderProps extends BreadCrumbProps {
  actions: JSX.Element;
  body: JSX.Element;
}

const useStyles = makeStyles(() => ({
  root: {
    justifyContent: 'space-between'
  },
  chip: {
    '& .MuiChip-root': {
      height: 30,
      borderRadius: 15,
      marginTop: 1,
      marginRight: 10,
      fontSize: '.875rem',
      letterSpacing: '.5px',
      minWidth: 130
    }
  }
}));

export const EntityHeader: React.FC<HeaderProps> = props => {
  const { actions, body, iconType, parentLink, parentText, title } = props;
  const classes = useStyles();

  return (
    <div className={`${classes.root} flexCenter`}>
      <div className="flexCenter">
        <HeaderBreadCrumb
          iconType={iconType}
          title={title}
          parentLink={parentLink}
          parentText={parentText}
        />
        {body && <div className={classes.chip}>{body}</div>}
      </div>
      <div>{actions}</div>
    </div>
  );
};

export default EntityHeader;
