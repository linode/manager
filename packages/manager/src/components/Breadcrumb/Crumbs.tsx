import * as classNames from 'classnames';
import { LocationDescriptor } from 'history';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import Typography from 'src/components/core/Typography';
import FinalCrumb from './FinalCrumb';
import FinalCrumbPrefix from './FinalCrumbPrefix';

import { EditableProps, LabelProps } from './types';

const useStyles = makeStyles((theme: Theme) => ({
  crumbsWrapper: {
    display: 'flex',
    alignItems: 'center'
  },
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
  slash: {
    fontSize: 24,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    color: theme.color.grey1
  }
}));

export interface CrumbOverridesProps {
  position: number;
  linkTo?: LocationDescriptor;
  label?: string;
  noCap?: boolean;
}

interface Props {
  pathMap: string[];
  crumbOverrides?: CrumbOverridesProps[];
  labelTitle?: string;
  labelOptions?: LabelProps;
  onEditHandlers?: EditableProps;
}

type CombinedProps = Props;

const Crumbs: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const {
    pathMap,
    crumbOverrides,
    labelOptions,
    labelTitle,
    onEditHandlers
  } = props;

  const allCrumbsButLast = pathMap.slice(0, -1);
  const lastCrumb = pathMap.slice(-1)[0];

  return (
    <>
      {allCrumbsButLast.map((crumb: string, key: number) => {
        const link =
          '/' + pathMap.slice(0, -(pathMap.length - (key + 1))).join('/');
        const override =
          crumbOverrides && crumbOverrides.find(e => e.position === key + 1);

        return (
          <div key={key} className={classes.crumbsWrapper}>
            <Link
              to={
                crumbOverrides && override
                  ? override.linkTo
                    ? override.linkTo
                    : link
                  : link
              }
              data-qa-link
            >
              <Typography
                className={classNames({
                  [classes.crumb]: true,
                  [classes.crumbLink]: true,
                  [classes.noCap]: override && override.noCap
                })}
                data-qa-link-text
                data-testid={'link-text'}
              >
                {crumbOverrides && override
                  ? override.label
                    ? override.label
                    : crumb
                  : crumb}
              </Typography>
            </Link>
            <Typography component="span" className={classes.slash}>
              /
            </Typography>
          </div>
        );
      })}

      {/* 
        for prepending some SVG or other element before the final crumb.
        See users detail page for example
      */}
      {labelOptions && labelOptions.prefixComponent && (
        <FinalCrumbPrefix
          prefixComponent={labelOptions.prefixComponent}
          prefixStyle={labelOptions.prefixStyle}
        />
      )}

      {/* 
        the final crumb has the possibility of being a link, editable text
        or just static text
      */}
      <FinalCrumb
        crumb={labelTitle || lastCrumb}
        labelOptions={labelOptions}
        onEditHandlers={onEditHandlers}
      />

      {/* 
        for appending some SVG or other element after the final crumb.
        See support ticket detail as an example
      */}
      {labelOptions &&
        labelOptions.suffixComponent &&
        labelOptions.suffixComponent}
    </>
  );
};

export default compose<CombinedProps, Props>(React.memo)(Crumbs);
