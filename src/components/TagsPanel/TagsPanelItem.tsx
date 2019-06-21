import Close from '@material-ui/icons/Close';
import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import Tag, { TagProps } from 'src/components/Tag';

interface Props extends TagProps {
  tagLabel: string;
  loading: boolean;
  onDelete?: (tag: string) => void;
}

type CombinedProps = Props;

/*
 * Abstraction of the Tag component for the purposes of passing the
 * delete payload to the onDelete function
 */
class TagsPanelItem extends React.Component<CombinedProps, {}> {
  handleDelete = () => {
    const { onDelete } = this.props;
    /*
     * checking loading prop to prevent user from clicking the button repeatedly
     */
    if (!onDelete || this.props.loading) {
      return;
    }
    onDelete(this.props.tagLabel);
  };

  renderIcon = () => {
    return !this.props.loading ? (
      <Close data-qa-delete-tag />
    ) : (
      <CircleProgress mini tag />
    );
  };

  render() {
    const { tagLabel, loading, onDelete, ...restOfProps } = this.props;
    return (
      <Tag
        {...restOfProps as any}
        deleteIcon={this.renderIcon()}
        onDelete={onDelete ? this.handleDelete : undefined}
        component={'button' as 'div'}
        colorVariant="lightBlue"
      />
    );
  }
}

export default TagsPanelItem;
