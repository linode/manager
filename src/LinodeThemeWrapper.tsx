import * as React from 'react';

import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import LinodeDarkTheme from 'src/darkTheme';
import { init } from 'src/events';
import LinodeLightTheme from 'src/theme';

import { theme as themeStorage } from 'src/utilities/storage';

type RenderChildrenFunction = (toggleTheme: () => void) => React.ReactNode;

interface Props {
  children?: RenderChildrenFunction | React.ReactNode;
}

interface State {
  themeChoice: 'light' | 'dark';
  render: boolean;
}

const lightTheme = createMuiTheme(LinodeLightTheme);
const darkTheme = createMuiTheme({
  ...LinodeLightTheme,
  ...LinodeDarkTheme,
});

const themes = {
  light: lightTheme,
  dark: darkTheme,
}

themes.light.shadows.fill('none');
themes.dark.shadows.fill('none');

class LinodeThemeWrapper extends React.Component<Props, State> {
  state: State = {
    themeChoice: 'light',
    render: true,
  };

  componentDidMount() {
    if (themeStorage.get() === 'dark') {
      this.setState({
        themeChoice: 'dark'
      });
    }
    else {
      this.setState({
        themeChoice: 'light'
      });
    }

    this.forceUpdate();
  }

  toggleTheme = () => {
    if (this.state.themeChoice === 'light') {
      this.setState({ themeChoice: 'dark' });
      themeStorage.set('dark');
    } else {
      this.setState({ themeChoice: 'light' });
      themeStorage.set('light');
    }

    /**
     * This re-renders the "themed" children upon theme change.
     * It's a workaround for some theme styles not being applied
     * upon switching the theme. Perhaps when we fully type our
     * theme using module augmentation, then we can remove this.
     * For now, it's fine, because switching the theme is rare.
     *
     * 2018-09-06: We may be able to remove render and init().
     */
    this.setState(
      { render: false },
      () => { this.setState({ render: true }); init(); },
    );
  }

  renderChildren = () => {
    const { children } = this.props;

    /** There are no children so bail. */
    if (!children) { return; }

    /** Render Children */
    if (typeof children === 'function') {
      return children(this.toggleTheme);
    }

    /** Non Render-Children Pattern */
    return children;
  }

  render() {
    const { themeChoice, render } = this.state;
    const theme = themes[themeChoice];
    return (
      <React.Fragment>
        {render &&
          <MuiThemeProvider theme={theme}>
            {this.renderChildren()}
          </MuiThemeProvider>
        }
      </React.Fragment>
    );
  }
}

export default LinodeThemeWrapper;
