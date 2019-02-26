import * as React from 'react';
import { MuiThemeProvider } from 'src/components/core/styles';
import { dark, light } from 'src/themes';
import {
  Spacing,
  spacing as spacingStorage,
  theme as themeStorage
} from 'src/utilities/storage';

interface State {
  themeChoice: 'light' | 'dark';
  spacing: Spacing;
}
type RenderChildren = (
  toggle: () => void,
  spacing: () => void
) => React.ReactNode;
interface Props {
  children: RenderChildren | React.ReactNode;
}

const themes = { light, dark };

class LinodeThemeWrapper extends React.Component<Props, State> {
  state: State = {
    themeChoice: 'light',
    spacing: 'normal'
  };

  componentDidUpdate() {
    setTimeout(() => {
      document.body.classList.remove('no-transition');
    }, 500);
  }

  componentDidMount() {
    const themeSetting = themeStorage.get();
    const spacingSetting = spacingStorage.get();

    return this.setState({
      themeChoice: themeSetting,
      spacing: spacingSetting
    });
  }

  toggleTheme = () => {
    document.body.classList.add('no-transition');
    if (this.state.themeChoice === 'light') {
      this.setState({ themeChoice: 'dark' });
      themeStorage.set('dark');
    } else {
      this.setState({ themeChoice: 'light' });
      themeStorage.set('light');
    }
  };

  toggleSpacing = () => {
    console.log('toggling');
    const { spacing } = this.state;
    if (spacing === 'compact') {
      this.setState({ spacing: 'normal' });
      spacingStorage.set('normal');
    } else {
      this.setState({ spacing: 'compact' });
      spacingStorage.set('compact');
    }
  };

  render() {
    const { children } = this.props;
    const { themeChoice, spacing } = this.state;
    const theme = {
      ...themes[themeChoice],
      spacing: { unit: spacing === 'compact' ? 4 : 8 }
    };

    return (
      <MuiThemeProvider theme={theme}>
        {isRenderChildren(children)
          ? children(this.toggleTheme, this.toggleSpacing)
          : children}
      </MuiThemeProvider>
    );
  }
}
const isRenderChildren = (
  c: RenderChildren | React.ReactNode
): c is RenderChildren => {
  return typeof c === 'function';
};

export default LinodeThemeWrapper;
