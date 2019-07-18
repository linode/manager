// DISABLING DUE TO REAL API REQUESTS MADE IN THIS STORY

// import { storiesOf } from '@storybook/react';
// import * as React from 'react';
// import { Provider } from 'react-redux';
// import { StaticRouter } from 'react-router';

// import { images } from 'src/__data__/images';
// import { stackScripts } from 'src/__data__/stackScripts';
// import SelectStackScriptPanel from 'src/features/StackScripts/SelectStackScriptPanel';

// import ThemeDecorator from '../utilities/storybookDecorators';

// import store from 'src/store';

// interface State {
//   selectedId: number | null;
// }

// class InteractiveExample extends React.Component<{}, State> {
//   state: State = {
//     selectedId: null,
//   };

//   render() {
//     return (
//       <Provider store={store}>
//         <StaticRouter>
//           <SelectStackScriptPanel
//             publicImages={images}
//             selectedId={this.state.selectedId}
//             onSelect={(id: number) => this.setState({ selectedId: id })}
//             data={stackScripts}
//           />
//         </StaticRouter>
//       </Provider>
//     );
//   }
// }

// storiesOf('SelectStackScriptPanel', module)
//
//   .add('Example', () => (<InteractiveExample />));
