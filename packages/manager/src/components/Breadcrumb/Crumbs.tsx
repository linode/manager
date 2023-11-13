import { Theme } from '@mui/material/styles';
import { LocationDescriptor } from 'history';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

import { Typography } from 'src/components/Typography';

import { FinalCrumb } from './FinalCrumb';
import { FinalCrumbPrefix } from './FinalCrumbPrefix';
import { EditableProps, LabelProps } from './types';

const useStyles = makeStyles()((theme: Theme) => ({
  crumb: {
    fontSize: '1.125rem',
    lineHeight: 'normal',
    textTransform: 'capitalize',
    whiteSpace: 'nowrap',
  },
  crumbLink: {
    '&:hover': {
      textDecoration: 'underline',
    },
    color: theme.textColors.tableHeader,
  },
  crumbsWrapper: {
    alignItems: 'center',
    display: 'flex',
  },
  noCap: {
    textTransform: 'initial',
  },
  slash: {
    color: theme.textColors.tableHeader,
    fontSize: 20,
    marginLeft: 2,
    marginRight: 2,
  },
}));

export interface CrumbOverridesProps {
  label?: string;
  linkTo?: LocationDescriptor;
  noCap?: boolean;
  position: number;
}

interface Props {
  crumbOverrides?: CrumbOverridesProps[];
  firstAndLastOnly?: boolean;
  labelOptions?: LabelProps;
  labelTitle?: string;
  onEditHandlers?: EditableProps;
  pathMap: string[];
}

export const Crumbs = React.memo((props: Props) => {
  const { classes, cx } = useStyles();

  const {
    crumbOverrides,
    firstAndLastOnly,
    labelOptions,
    labelTitle,
    onEditHandlers,
    pathMap,
  } = props;

  const allCrumbsButLast = pathMap.slice(0, -1);
  const firstCrumb = [pathMap[0]];
  const lastCrumb = pathMap.slice(-1)[0];
  const finalCrumbs =
    firstAndLastOnly && pathMap.length > 1 ? firstCrumb : allCrumbsButLast;

  return (
    <>
      {finalCrumbs.map((crumb: string, key: number) => {
        const link =
          '/' + pathMap.slice(0, -(pathMap.length - (key + 1))).join('/');
        const override =
          crumbOverrides && crumbOverrides.find((e) => e.position === key + 1);

        return (
          <div className={classes.crumbsWrapper} key={key}>
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
                className={cx(classes.crumb, classes.crumbLink, {
                  [classes.noCap]: override && override.noCap,
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
            <Typography className={classes.slash} component="span">
              /
            </Typography>
          </div>
        );
      })}
      {/* for prepending some SVG or other element before the final crumb. */}
      {labelOptions && labelOptions.prefixComponent && (
        <FinalCrumbPrefix
          prefixComponent={labelOptions.prefixComponent}
          prefixStyle={labelOptions.prefixStyle}
        />
      )}
      {/* the final crumb has the possibility of being a link, editable text or just static text */}
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
});
