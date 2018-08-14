import * as React from 'react';

import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import LinodeDarkTheme from 'src/darkTheme';
import { init } from 'src/events';
import LinodeLightTheme from 'src/theme';

interface Props {
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
    const storedThemeChoice = window.localStorage.getItem('themeChoice');
    if (storedThemeChoice === 'dark') {
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
      window.localStorage.setItem('themeChoice', 'dark');
    } else {
      this.setState({ themeChoice: 'light' });
      window.localStorage.setItem('themeChoice', 'light');
    }

    /**
     * This re-renders the "themed" children upon theme change.
     * It's a workaround for some theme styles not being applied
     * upon switching the theme. Perhaps when we fully type our
     * theme using module augmentation, then we can remove this.
     * For now, it's fine, because switching the theme is rare.
     */
    this.setState(
      { render: false },
      () => { this.setState({ render: true }); init(); },
    );
  }

  render() {
    const { themeChoice, render } = this.state;
    const theme = themes[themeChoice];
    return (
      <React.Fragment>
        {render &&
          <MuiThemeProvider theme={theme}>
            {React.cloneElement(
              this.props.children as Linode.TodoAny,
              {
                toggleTheme: () => this.toggleTheme(),
              },
            )}
          </MuiThemeProvider>
        }
      </React.Fragment>
    );
  }
}

export default LinodeThemeWrapper;
