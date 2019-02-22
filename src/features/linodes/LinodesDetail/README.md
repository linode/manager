# LinodesDetail

The purpose of LinodesDetail is displaying the header, routing, and the creation and implementation of a context.

# Linode Detail Context

The Linode Detail Context contains an extended Linode property and preconfigured handlers for that specific Linode. This context is made available to nested components by the [React ContextAPI](https://reactjs.org/docs/context.html).

The Linode Detail Context is availble to any component rendered below the LinodesDetail component via [withLinodeDetailContext](linodeDetailContext.tsx#149) high-order component or the [LinodeDetailContextConsumer](linodeDetailContext.tsx#147).

## Context Data

The current Linode details, events, notifications, volumes, disks, and configs (so far) are provided on the `linode` property. This data is currently created by LinodeDetail.container, but the context doesn't care where it comes from. You could easily swap out the source of this information.

## Context Handlers

The context also exposes handlers that are preconfigured for the current Linode. Normally to update a Linode you would invoke `updateLinode(123, { label: 'whatever' })` but we've preconfigured the request to be `updateLinode({ label: 'whatever '})`. `updateLinode` already has the ID by creating an anoymous fascade function. This can be found in [linodeDetailContext.tsx](linodeDetailContext.tsx#L104).

## Usage

### withLinodeDetailContext.

withLinodeDetailContext is a high-order component that takes a function which allows you to map the Linode Detail Context object to props.

```jsx
// src/features/linodes/LinodesDetail/MyComponent.tsx
/** Hooks used for berevity, they are not used in this PR. */
import { withLinodeDetailContext } from './context'

const MyComponent = (props) => {
  const { linode, updateLinode } = props;
  const [newLabel, setNewLabel] = useState(linode.label);

  return  (
    <h1>Rename {linode.label}</h1>
    <input onChange={(e) => setLabel(e.target.value)} value={label} />
    <button onClick={() => updateLinode({ label: newLabel })}>Submit</button>
  )
};

const enhanced = withLinodeDetailContext(({ linode, updateLinode }) => ({
  linode,
  updateLinode,
}));

export default enhanced(myComponent);
```

### LinodeDetailContextConsumer.

The `LinodeDetailContextConsumer` is a render function as children component which allows you to subscribe the wrapped component to prop changes.

```jsx
// src/features/linodes/LinodesDetail/MyComponent.tsx
/** Hooks used for berevity, they are not used in this PR. */
import { LinodeDetailContextConsumer } from './context'

const MyComponent = (props) => {
  const [newLabel, setNewLabel] = useState(linode.label);

  return  (
    <LinodeDetailContextConsumer>
      {({ linode, updateLinode }) => (
        <h1>Rename {linode.label}</h1>
        <input onChange={(e) => setLabel(e.target.value)} value={label} />
        <button onClick={() => updateLinode({ label: newLabel })}>Submit</button>
      )}
    </LinodeDetailContextConsumer>
  )
};

export default myComponent;
```

### useLinodeDetailContext (NYI)

**N**ot **Y**et **I**mplemented - This is an example of what the Linode Detail Context usage could look like with hooks. This is possible, with all of 1 line of code, but you should wait for Enzyme to be updated for Hooks or agree on a [new testing strategy](https://github.com/kentcdodds/react-testing-library).

```jsx
// src/features/linodes/LinodesDetail/MyComponent.tsx
import { LinodeDetailContextConsumer } from './context';

const MyComponent = props => {
  const [newLabel, setNewLabel] = useState(linode.label);
  const { linode, updateLinode } = useLinodeDetailContext();

  return (
    <>
      <h1>Rename {linode.label}</h1>
      <input onChange={e => setLabel(e.target.value)} value={label} />
      <button onClick={() => updateLinode({ label: newLabel })}>Submit</button>
    </>
  );
};

export default myComponent;
```

# LinodesDetail Container

_Note: This could probably be better named._

LinodesDetail.container will create a data object or rendering a error/loading/empty state component based on the state of Redux.

The LinodesDetail.container file exists to build an extended Linode object, or render a loading, error, or empty components given the state of Redux.

The LinodesDetail.container file exists to build an extended Linode object, or render a
loading, error, or empty components given the state of that object.

1. Request all the configs for the Linode. If the linodeId changes we make the request again. No additional props are injected.

2. Request all the disks for the Linode. If the linodeId changes we make the request again. No additional props are injected.

3. Combine error states of relevant requests. Render the ErrorState component if any error is defined. This is an early return. No additional props are injected.

4. Combine loading states of relevant requests. Render the CircleProgress if any are true. This is an early return. No additional props are injected.

5. Finally if the Linode object is defined, we merge the secondary data onto the Linode and pass it as a prop `linode` to the wrapped component. Render the NotFound component if the Linode object is undefined, as it was not found in Redux.

The maybeRenderError, maybeRenderLoading, and maybeWithExtendedLinode all use Recompose's [branch](https://github.com/acdlite/recompose/blob/master/docs/API.md#branch) function. This is a great way to early return and prevent unnecessary computation.

# A Working Work in Progress

Not all nested components have been updated to make use of this new pattern. The LinodeConfigSelectionDrawer could probably benefit from some work. Any nested components that are directly requesting the Linode, configs, or disks (or really any data at this point) should probably be going through Redux, and thus the context.

Should we add `_backups`? Probably.
Should we add `_networking`? Probably.

Have a look at disks and configs state management. Notice a very obvious pattern? Would could extract that to some sort of factory pattern. But should we? The indirection comes at cost.

# Todo

The following requests are not on the Linode Context Detail. Each should be reviewed for their effect on the state of the Linode and maybe added as preconfigured handlers. The more information you pump through the Store the more reactive you can make the application.

- [ ] getLinode
- [ ] deleteLinode
- [ ] getBackups
- [ ] createSnapshot
- [ ] cancelBackups
- [ ] enableBackups
- [ ] getBackup
- [ ] restoreBackup
- [ ] bootLinode
- [ ] cloneLinode
- [ ] resetDiskRootPassword
- [ ] getNetworkingInformation
- [ ] allocateIPv4Address
- [ ] getIPAddress
- [ ] updateIPAddress
- [ ] deleteIPAddress
- [ ] initiatePendingMigration
- [ ] updateLinode
- [ ] rebootLinode
- [ ] rebuildLinode
- [ ] rescueLinode
- [ ] resizeLinode
- [ ] shutdownLinode
- [ ] viewLinodeStats
- [ ] viewLinodeYYMMStatis
