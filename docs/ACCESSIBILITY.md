# Accessibility

## Component Abstractions

### Tab Component Patterns

Currently, we have two kinds of tab component patterns- one is `TabbedPanel`, which is a more standard tabbed panel usage. This component abstraction accepts an array of `tabs` objects, each tab containing the tab display title and the associated content of that tab:

```js
<TabbedPanel
  tabs={[
    {
      title: "Tab One",
      render: (renderProps: any) => (
        <div>
          Panel 1 <button>Click Me</button>
        </div>
      )
    },
    {
      title: "Tab Two",
      render: (renderProps: any) => <div>Panel 2</div>
    },
    {
      title: "Tab Three",
      render: (renderProps: any) => <div>Panel 3</div>
    },
    {
      title: "Tab Four",
      render: (renderProps: any) => <div>Panel 4</div>
    },
    {
      title: "Tab Five",
      render: (renderProps: any) => <div>Panel 5</div>
    }
  ]}
/>
```

The other abstraction is to support app-level navigation directly on tabbable components. To utilize this pattern, ensure `Tabs` is the parent wrapping component for both `TabLinkList` and `TabPanels`. From there, one would pass `TabLinkList` an array of tab objects- these particular tabs each containing the tab display `title` and the `routeName`, for that tab. The `routeName` is used for the tab's `to` prop. Once the list is setup, you would follow ReachUI's guidelines for setup of the panel components.

```js
const tabs = [
  {
    routeName: `${url}/home`,
    title: "Home"
  },
  {
    routeName: `${url}/linodes`,
    title: "Linodes"
  }
];

<Tabs>
  <TabLinkList tabs={tabs} />
  <TabPanels>
    <TabPanel>
      <h2>Home</h2>
    </TabPanel>
    <TabPanel>
      <h2>This is a page</h2>
    </TabPanel>
  </TabPanels>
</Tabs>;
```

For either of these patterns, it should be noted the content of the panels can be another component, or multiple, and additional wrapping components can be used (ex. `React.Suspense`) so long as the descendants of `TabPanels` are exclusively `TabPanel` components.

### Further Reading

- https://reacttraining.com/reach-ui/
