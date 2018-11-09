import * as React from 'react';

import Select, { NoOptionsMessageProps } from 'src/components/EnhancedSelect/Select';
import tagsHoc, { TagObject } from 'src/features/linodes/LinodesCreate/tagsHoc';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';


interface Props {
  tagObject?: TagObject;
  tagError?: string;
}

class TagsInput extends React.Component<Props> {

  getEmptyMessage = (value:NoOptionsMessageProps) => {
    const { getLinodeTagList } = this.props.tagObject!.actions;
    const tags = getLinodeTagList();
    if (tags.includes(value.inputValue)) { return 'This tag is already selected.'}
    else { return "No results." }
  }

  render() {
    if (!this.props.tagObject) { return null; }
    const { accountTags, actions, errors, selectedTags } = this.props.tagObject;
    const hasErrorFor = getAPIErrorFor({ label: 'label' }, errors);
    // Label refers to the tag label, not the Linode label
    const labelError = hasErrorFor('label');
    const generalError = hasErrorFor('none');
    const { tagError } = this.props;
    return (
      <Select
        variant='creatable'
        isMulti={true}
        label={"Add Tags"}
        options={accountTags}
        placeholder={"Type to choose or create a tag."}
        errorText={labelError || tagError || generalError}
        value={selectedTags}
        onChange={actions.addTag}
        createNew={actions.createTag}
        noOptionsMessage={this.getEmptyMessage}
      />
    )
  }
}
export default tagsHoc(TagsInput);
