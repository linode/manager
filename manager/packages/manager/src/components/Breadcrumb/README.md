# Breadcrumb

The purpose of the Breadcrumb component is to add a versatile and dynamic solution for the manager navigation patterns.

## Description

The component utilizes the prop.location provided by RouteComponentProps to build the breadCrumb (based on `location.pathname`). It provides a few props for customizing the output. The last item of the crumbs is removed by default in order to pick either a custom one, an editable text component, or the default crumb we slice back in.

### Props

- `pathname` (string, required). Should be the props.location provided by react-router-dom.
- `labelTitle` (string, optional). Customize the last crumb text.
- `labelOptions` (LabelProps, optional). Provide options to customize the label overridden above. See labelOptions Props below.
- `removeCrumbX` (number, optional). Remove a crumb by specifying its actual position in the array/url.
- `crumbOverrides` (CrumbOverridesProps[], optional). The override for a crumb works by the position (required) of the crumb (index + 1). Just provide the actual position of the crumb in the array. We can either override the label or link or both. Omitted values will inherit the path default. It is an array, so we can replace as many as needed.
- `onEditHandlers` (EditableProps, optional). Provide an editable text field for the last crumb (ex: linodes and nodeBalancers details).

### labelOptions Props

- `linkTo` (string, optional). Make label a link.
- `prefixComponent` (JSX.Element | null, optional). Provides a prefix component. ex: user detail avatar.
- `prefixStyle` (CSSProperties, optional), customize the styles for the `prefixComponent`.
- `suffixComponent`: (JSX.Element | null, optional). Provides a suffix component. ex: ticket detail status chip.
- `subtitle`: (string, optional). Provide a subtitle to the label. ex: ticket detail submission information.
- `noCap`: (boolean, optional). Override the default capitalization for the label.

## Usage

The only required prop is `pathname`. Since we need it to be a string passed from RouteComponentProps, we do need to import the props along with `withRouter` for the export. ex:

```jsx
import { RouteComponentProps, withRouter } from 'react-router-dom';

type Props = RouteComponentProps<{}>;

class MyComponent extends React.Component<Props> {
  render() {
    return <Breadcrumb pathname={this.props.location.pathname} />;
  }
}

export default withRouter(MyComponent);
```

You can otherwise refer to the storybook examples to implement the breadcrumb as needed.
