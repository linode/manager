import { DndContext } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Dialog, Stack } from '@linode/ui';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import * as React from 'react';

import type { DragEndEvent } from '@dnd-kit/core';
import type { MockPresetExtra } from 'src/mocks/types';

interface ExtraPresetListProps<T> {
  customData: null | T[] | undefined;
  isEnabled: boolean;
  itemTemplates: Record<string, () => T> & { Default: () => T };
  onFormChange?: (data: null | T[] | undefined) => void;
  onTogglePreset: (
    e: React.ChangeEvent<HTMLInputElement>,
    presetId: string
  ) => void;
  preset: MockPresetExtra;
  renderItemBox: (options: {
    index: number;
    item: T;
    onDelete: () => void;
    onEdit: (updater: (prev: T) => T) => void;
  }) => JSX.Element;
  saveDataToLocalStorage: (item: null | T[]) => void;
  setMSWData: (item: null | T[]) => void;
}

export const ExtraPresetList = <T extends object>({
  customData,
  isEnabled,
  onFormChange,
  onTogglePreset,
  itemTemplates,
  preset,
  renderItemBox,
  saveDataToLocalStorage,
  setMSWData,
}: ExtraPresetListProps<T>) => {
  const [formData, setFormData] = React.useState<T[]>(customData ?? []);
  const [isEditing, setIsEditing] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>();

  React.useEffect(() => {
    if (!isEnabled) {
      setFormData([]);
      setMSWData(null);
    } else if (isEnabled && customData) {
      setFormData(customData);
      setMSWData(customData);
    }
  }, [customData, isEnabled, setMSWData]);

  const handleTogglePreset = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.checked) {
        saveDataToLocalStorage(null);
      } else {
        saveDataToLocalStorage(formData);
      }
      onTogglePreset(e, preset.id);
    },
    [formData, onTogglePreset, preset.id, saveDataToLocalStorage]
  );

  const handleInputChange = React.useCallback(
    (updatedItems: T[]) => {
      setFormData(updatedItems);
      if (isEnabled) {
        onFormChange?.(updatedItems);
      }
    },
    [isEnabled, onFormChange]
  );

  const handleAddItem = React.useCallback(() => {
    const templateBuilder = selectedTemplate && itemTemplates[selectedTemplate];
    const newItem = templateBuilder
      ? templateBuilder()
      : itemTemplates['Default']();
    handleInputChange([newItem, ...formData]);
  }, [formData, handleInputChange, itemTemplates, selectedTemplate]);

  const handleMoveItem = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (active && over && active.id !== over.id) {
        handleInputChange(
          arrayMove(formData, Number(active.id), Number(over.id))
        );
      }
    },
    [formData, handleInputChange]
  );

  return (
    <li className="dev-tools__list-box__separator has-button">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <label title={preset.desc || preset.label}>
            <input
              checked={isEnabled}
              onChange={handleTogglePreset}
              type="checkbox"
            />
            {preset.label}
          </label>
        </div>
        {isEnabled && (
          <div>
            <button
              className="dev-tools-button small"
              onClick={() => setIsEditing(true)}
            >
              edit
            </button>
          </div>
        )}
      </div>
      {isEnabled && isEditing && (
        <Dialog
          fullWidth
          onClose={() => setIsEditing(false)}
          open={isEditing}
          title={`Edit ${preset.label}`}
        >
          <h3>
            {formData.length} custom item{formData.length !== 1 && 's'}
          </h3>

          <Stack gap={1}>
            <div className="dev-tools__modal-form dev-tools__modal__rectangle-group">
              <FieldWrapper>
                <label>
                  Add from template
                  <select
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    value={selectedTemplate}
                  >
                    {Object.keys(itemTemplates).map((label) => (
                      <option key={label} value={label}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </FieldWrapper>
              <button onClick={handleAddItem} style={{ marginBottom: 10 }}>
                + Add New {preset.label}
              </button>
            </div>

            <DndContext onDragEnd={handleMoveItem}>
              <div
                style={{
                  height: '50vh',
                  overflow: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <SortableContext
                  items={formData.map((_, index) => String(index))} // we have to use a string bc Sortable doesn't like id=0
                  strategy={verticalListSortingStrategy}
                >
                  {formData.map((item, index) =>
                    renderItemBox({
                      item,
                      index,
                      onDelete: () =>
                        handleInputChange(
                          formData.filter((_, i) => i !== index)
                        ),
                      onEdit: (updater) =>
                        handleInputChange(
                          formData.map((item, i) =>
                            i === index ? updater(item) : item
                          )
                        ),
                    })
                  )}
                </SortableContext>
              </div>
            </DndContext>
            <div>
              <button onClick={() => setIsEditing(false)}>Done</button>
            </div>
          </Stack>
        </Dialog>
      )}
    </li>
  );
};

const FieldWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="dev-tools__modal-form__field">{children}</div>;
};

interface ItemBoxProps<T> {
  editItem: (updater: (prev: T) => T) => void;
  formFields: (
    onChange: (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => void
  ) => JSX.Element[];
  id: string;
  item: T;
  onDelete: () => void;
  summary: JSX.Element;
}

export const ItemBox = <T extends object>({
  onDelete,
  editItem,
  id,
  summary,
  formFields,
}: ItemBoxProps<T>) => {
  const [isCollapsed, setIsCollapsed] = React.useState(true);

  const {
    active,
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const isActive = Boolean(active);

  // dnd-kit styles
  const dndStyles = {
    position: 'relative',
    transform: CSS.Translate.toString(transform),
    transition: isActive ? transition : 'none',
    zIndex: isDragging ? 9999 : 0,
  } as const;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    const checkboxValue: boolean | undefined =
      e.target.type === 'checkbox' && 'checked' in e.target
        ? e.target.checked
        : undefined;

    editItem((prev) => ({
      ...prev,
      [name]: checkboxValue ?? (value || null),
    }));
  };

  return (
    <div
      className="dev-tools__modal__rectangle-group"
      ref={setNodeRef}
      style={dndStyles}
    >
      <div className="dev-tools__modal__controls">
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <DragIndicatorIcon
            {...listeners}
            {...attributes}
            style={{ cursor: isActive ? 'grabbing' : 'grab' }}
          />
          <div>
            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              style={{ width: 90 }}
            >
              {isCollapsed ? '► Expand' : '▼ Collapse'}
            </button>
          </div>
          {summary}
        </div>
        <div>
          <button onClick={onDelete}>Delete</button>
        </div>
      </div>
      {!isCollapsed && (
        <form className="dev-tools__modal-form dev-tools__modal-form__no-max-height">
          {formFields(handleInputChange).map((field, index) => (
            <FieldWrapper key={index}>{field}</FieldWrapper>
          ))}
        </form>
      )}
    </div>
  );
};
