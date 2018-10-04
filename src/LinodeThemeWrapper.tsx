import * as React from 'react';

import { MuiThemeProvider } from '@material-ui/core/styles';

import { dark, light } from 'src/themes';
import { theme as themeStorage } from 'src/utilities/storage';

interface State {
  themeChoice: 'light' | 'dark';
}

const themes = { light, dark }

class LinodeThemeWrapper extends React.Component<{}, State> {
  state: State = {
    themeChoice: 'light',
  };

  componentDidMount() {
    if (themeStorage.get() === 'dark') {
      return this.setState({ themeChoice: 'dark' });
    }

    return this.setState({ themeChoice: 'light' });
  }

  toggleTheme = () => {
    if (this.state.themeChoice === 'light') {
      this.setState({ themeChoice: 'dark' });
      themeStorage.set('dark');
    } else {
      this.setState({ themeChoice: 'light' });
      themeStorage.set('light');
    }
  }

  render() {
    const { themeChoice } = this.state;
    const theme = themes[themeChoice];
    return (
      <MuiThemeProvider theme={theme}>
        {React.cloneElement(this.props.children as any, { toggleTheme: this.toggleTheme })}
      </MuiThemeProvider>
    );
  }
}

export default LinodeThemeWrapper;
