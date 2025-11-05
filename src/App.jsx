import { useEffect, useState } from 'react';

import { nanoid } from 'nanoid';

import Editor from './components/editors/Editor';
import Preview from './components/preview/Preview';

function App() {
  const [formData, setFormData] = useState(
    JSON.parse(localStorage.getItem('cvFormData')) || {
      basicInfo: {
        firstName: '',
        lastName: '',
        age: '',
        occupation: '',
        selfSummary: '',
      },
      contactInfo: {
        email: '',
        phoneNumber: '',
        location: '',
        website: '',
      },
      educationInfo: [],
      experienceInfo: [],
      skillsInfo: [],
      otherInfo: [],
    },
  );

  const [previewVisible, setPreviewVisibility] = useState(true);

  useEffect(() => {
    localStorage.setItem('cvFormData', JSON.stringify(formData));
  }, [formData]);

  const togglePreview = () => {
    setPreviewVisibility((prevState) => !prevState);
  };

  const printPreview = () => {
    window.print();
  };

  const handleBasicInfoChanges = (e) => {
    const { name, value } = e.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      basicInfo: {
        ...prevFormData.basicInfo,
        [name]: value,
      },
    }));
  };

  const handleContactInfoChanges = (e) => {
    const { name, value } = e.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      contactInfo: {
        ...prevFormData.contactInfo,
        [name]: value,
      },
    }));
  };

  const submitBackgroundInfo = (e, type) => {
    e.preventDefault();

    const parentEl = e.target.closest('form');
    const { editingId } = e.target.dataset;

    const newInfo = [...parentEl.querySelectorAll('input, textarea')]
      .filter((field) => field.name !== 'currentInfoItem') // 排除 currentInfoItem
      .map((field) => ({
        [field.name]: field.type === 'checkbox' ? field.checked : field.value,
      }))
      .reduce((obj, item) => Object.assign(obj, { ...item }));

    const addlInfo = [
      ...parentEl.querySelectorAll('.submitted-item__name'),
    ].map((el) => ({ id: el.dataset.id, content: el.textContent }));

    if (editingId) {
      // 編輯模式：更新現有項目
      setFormData((prevFormData) => ({
        ...prevFormData,
        [type]: prevFormData[type].map((item) =>
          item.id === editingId
            ? {
                ...newInfo,
                id: editingId,
                additionalInfo: addlInfo,
                currentInfoItem: '',
              }
            : item
        ),
      }));
    } else {
      // 新增模式：添加新項目
      setFormData((prevFormData) => ({
        ...prevFormData,
        [type]: [
          ...prevFormData[type],
          {
            ...newInfo,
            id: nanoid(),
            additionalInfo: addlInfo,
            currentInfoItem: '',
          },
        ],
      }));
    }
  };

  const deleteBackgroundInfo = (id, type) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [type]: prevFormData[type].filter((item) => item.id !== id),
    }));
  };

  const submitCategoryInfo = (e, type) => {
    e.preventDefault();

    const parentEl = e.target.closest('form');
    const { editingId } = e.target.dataset;

    const category = parentEl.querySelector('.form-input__item-category').value;
    const submittedItems = [
      ...parentEl.querySelectorAll('.submitted-item__name'),
    ].map((el) => ({ content: el.textContent, id: el.dataset.id }));

    if (!category) return;

    if (editingId) {
      // 編輯模式：更新現有項目
      setFormData((prevFormData) => ({
        ...prevFormData,
        [type]: prevFormData[type].map((item) =>
          item.id === editingId
            ? {
                category,
                items: submittedItems,
                id: editingId,
              }
            : item
        ),
      }));
    } else {
      // 新增模式：添加新項目
      setFormData((prevFormData) => ({
        ...prevFormData,
        [type]: [
          ...prevFormData[type],
          {
            category,
            items: submittedItems,
            id: nanoid(),
          },
        ],
      }));
    }
  };

  const deleteCategoryInfo = (id, type) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [type]: prevFormData[type].filter((item) => item.id !== id),
    }));
  };

  // Reorder items in any top-level list stored on formData
  // type: string (educationInfo | experienceInfo | skillsInfo | otherInfo)
  // sourceIndex, destinationIndex: numeric indices within the array
  const reorderList = (type, sourceIndex, destinationIndex) => {
    setFormData((prevFormData) => {
      const list = Array.from(prevFormData[type] || []);
      if (!list.length) return prevFormData;
      if (sourceIndex < 0 || sourceIndex >= list.length) return prevFormData;
      if (destinationIndex < 0 || destinationIndex > list.length) return prevFormData;

      const [moved] = list.splice(sourceIndex, 1);
      list.splice(destinationIndex, 0, moved);

      return {
        ...prevFormData,
        [type]: list,
      };
    });
  };

  return (
    <div className="App">
      <Editor
        formData={formData}
        handleBasicInfoChanges={handleBasicInfoChanges}
        handleContactInfoChanges={handleContactInfoChanges}
        submitBackgroundInfo={submitBackgroundInfo}
        deleteBackgroundInfo={deleteBackgroundInfo}
        submitCategoryInfo={submitCategoryInfo}
        deleteCategoryInfo={deleteCategoryInfo}
        reorderList={reorderList}
      />
      {previewVisible && <Preview formData={formData} />}
      <div className="btn-container__preview">
        <button
          className="btn__toggle-preview material-symbols-outlined"
          type="button"
          onClick={togglePreview}
        >
          visibility
        </button>
        {previewVisible && (
          <button
            type="button"
            className="btn__print-preview material-symbols-outlined"
            onClick={printPreview}
          >
            print
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
