/**
 * The point of this component is to render some content in an iframe
 * This example comes straight from https://github.com/mui-org/material-ui/issues/13625#issuecomment-439612039
 * but requires that we upgrade to MUIv4
 *
 * Please note. This example does not work: https://github.com/mui-org/material-ui/issues/13625#issuecomment-461304324
 * because we have amended our base MUI theme with extra properties so we end up with
 * errors such as "theme.bg is undefined"
 */

// import NoSsr from '@material-ui/core/NoSsr'
import { WithStyles, WithTheme } from '@material-ui/core/styles';
// import { jssPreset, StylesProvider } from '@material-ui/styles'
// import { create } from 'jss';
// import rtl from 'jss-rtl';
// import { pathOr } from 'ramda'
import * as React from 'react';
// import Frame from 'react-frame-component';
import { compose } from 'recompose';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {}
  });

type CombinedProps = WithStyles<ClassNames> & WithTheme;

// let contentDocument: any;
// let contentWindow: any;

const _Frame: React.FC<CombinedProps> = props => {
  // const { children, classes } = props;

  // const handleRef = (ref: any) => {
  //   const newContentDocument = pathOr(null, ['node', 'contentDocument'], ref);
  //   const newContentWindow = pathOr(null, ['node', 'contentWindow'], ref);

  //   if(!!newContentDocument) {
  //     contentDocument = newContentDocument
  //   }

  //   if(!!newContentWindow) {
  //     contentWindow = newContentWindow;
  //   }
  // }

  // const [isReady, setReady] = React.useState<boolean>(false);
  // const [jss, setJss] = React.useState<any>(undefined);
  // const [sheetsManager, setSheetsManager] = React.useState<any>(undefined);
  // const [container, setContainer] = React.useState<any>(undefined);

  // const contentDidMount = () => {
  //   setReady(true);
  //   setJss(create({
  //     plugins: [...jssPreset().plugins, rtl()],
  //     insertionPoint: contentWindow['demo-frame-jss']
  //   }));
  //   setSheetsManager(new Map());
  //   setContainer(contentDocument.body);
  // }

  // const contentDidUpdate = () => {
  //   contentDocument.body.dir = props.theme.direction
  // }

  return (
    <div />
    // <NoSsr>
    //   <Frame
    //     ref={handleRef}
    //     className={classes.root}
    //     contentDidMount={contentDidMount}
    //     contentDidUpdate={contentDidUpdate}
    //   >
    //     <div id="demo-frame-jss" />
    //     {isReady ? (
    //       <StylesProvider jss={jss} sheetsManager={sheetsManager}>
    //         {React.cloneElement(children as React.DetailedReactHTMLElement<any, HTMLElement>, {
    //           container,
    //         })}
    //       </StylesProvider>
    //     ) : null}
    //   </Frame>
    // </NoSsr>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default compose<CombinedProps, {}>(
  styled,
  React.memo
)(_Frame);
