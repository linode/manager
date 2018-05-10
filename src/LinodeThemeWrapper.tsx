import * as React from 'react';
import createMuiTheme from 'material-ui/styles/createMuiTheme';
import { MuiThemeProvider } from 'material-ui/styles';

import LinodeLightTheme from 'src/theme';
import LinodeDarkTheme from 'src/darkTheme';

import { init } from 'src/events';

interface Props {
}

interface State {
  themeChoice: 'light' | 'dark';
  render: boolean;
}

const lightTheme = LinodeLightTheme;
const darkTheme = {
  ...LinodeLightTheme,
  ...LinodeDarkTheme,
};

class LinodeThemeWrapper extends React.Component<Props, State> {
  state: State = {
    themeChoice: 'light',
    render: true,
  };

  themes = {
    light: createMuiTheme(lightTheme),
    dark: createMuiTheme(darkTheme),
  };

  componentDidMount() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.altKey && e.code === 'KeyD') {
        this.toggleTheme();
      }
    });

    this.themes.light.shadows.fill('none');
    this.themes.dark.shadows.fill('none');
  }

  toggleTheme = () => {
    if (this.state.themeChoice === 'light') {
      this.setState({ themeChoice: 'dark' });
    } else {
      this.setState({ themeChoice: 'light' });
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
    const theme = this.themes[themeChoice];
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
