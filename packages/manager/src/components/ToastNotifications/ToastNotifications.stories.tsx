import { storiesOf } from '@storybook/react';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import Button from 'src/components/Button';
import Snackbar from 'src/components/SnackBar';
import ThemeDecorator from '../../utilities/storybookDecorators';

interface Props {
  onClick: (variant: string) => void;
  variant: string;
}

class MyButton extends React.PureComponent<Props> {
  render() {
    const { variant } = this.props;
    const handleClick = () => {
      // just call the onClick with the provided variant
      this.props.onClick(variant);
    };
    return <Button onClick={handleClick}>{variant}</Button>;
  }
}

class Example extends React.PureComponent<WithSnackbarProps, {}> {
  render() {
    const { enqueueSnackbar } = this.props;
    const variants = ['default', 'success', 'warning', 'error', 'info'];

    // enqueueSnackbar comes from the notistack library and triggers the toast to appear
    const showToast = (variant: any) =>
      enqueueSnackbar(
        'Toast message. This will auto destruct after four seconds.',
        {
          variant
        }
      );

    return (
      <React.Fragment>
        {variants.map(eachVariant => {
          // map over each variant and show a button for each
          return (
            <MyButton
              key={eachVariant}
              variant={eachVariant}
              onClick={showToast}
            />
          );
        })}
      </React.Fragment>
    );
  }
}

const Enhanced = withSnackbar(Example);

storiesOf('Toast Notification', module)
  .addDecorator(ThemeDecorator)
  .add('Default', () => (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      maxSnack={3}
      autoHideDuration={4000}
      data-qa-toast
      hideIconVariant={true}
    >
      <Enhanced />
    </Snackbar>
  ));
