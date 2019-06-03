import * as React from 'react';
import { ThemeProvider } from 'src/components/core/styles';
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
    const { spacing } = this.state;
    if (spacing === 'compact') {
      spacingStorage.set('normal');
      this.setState({ spacing: 'normal' });
    } else {
      spacingStorage.set('compact');
      this.setState({ spacing: 'compact' });
    }
  };

  render() {
    const { children } = this.props;
    const { themeChoice } = this.state;
    const theme = themes[themeChoice];

    return (
      <MuiThemeProvider theme={theme()}>
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
