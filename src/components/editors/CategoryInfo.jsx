import { useEffect, useState } from 'react';

import { nanoid } from 'nanoid';

import FormBanner from './FormBanner';
import ItemBanner from './ItemBanner';

function CategoryInfo(props) {
  const { data, handleSubmit, handleDelete, infoType, reorderList } = props;

  const emptyState = { category: '', items: [], currentItem: '', id: '' };

  const [categoryInfo, setCategoryInfo] = useState(
    JSON.parse(localStorage.getItem(`cv${infoType}`)) || emptyState,
  );
  
  const [editingId, setEditingId] = useState(null); // 追蹤正在編輯的項目ID

  useEffect(() => {
    localStorage.setItem(`cv${infoType}`, JSON.stringify(categoryInfo));
  }, [categoryInfo, infoType]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCategoryInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  const editCategoryInfo = (id) => {
    // 不刪除項目，只是載入資料並記錄編輯ID
    const target = data.find((item) => item.id === id);
    setCategoryInfo({
      ...target,
      items: target.items || [],
      currentItem: '',
    });
    setEditingId(id);
  };

  const submitCategoryInfo = (e) => {
    e.preventDefault();

    if (!categoryInfo.category) return;

    if (editingId) {
      // 如果是編輯模式，通知 App.jsx 這是編輯操作
      e.target.dataset.editingId = editingId;
      handleSubmit(e, infoType);
      setEditingId(null);
    } else {
      // 新增模式
      handleSubmit(e, infoType);
    }
    
    setCategoryInfo(emptyState);
  };

  const [editingItemId, setEditingItemId] = useState(null);

  const submitItem = (e) => {
    let targetElement;

    if (e.type === 'keydown' && e.key !== 'Enter') return;

    e.preventDefault();

    if (e.type === 'click') {
      targetElement = e.target.previousElementSibling;
    } else if (e.key === 'Enter') {
      targetElement = e.target;
    }

    if (!targetElement.value) return;

    if (editingItemId) {
      // 編輯模式：更新現有項目
      setCategoryInfo((prevInfo) => ({
        ...prevInfo,
        items: prevInfo.items.map((item) =>
          item.id === editingItemId
            ? { ...item, content: targetElement.value }
            : item
        ),
        currentItem: '',
      }));
      setEditingItemId(null);
    } else {
      // 新增模式
      setCategoryInfo((prevInfo) => ({
        ...prevInfo,
        items: [
          ...prevInfo.items,
          {
            id: nanoid(),
            content: targetElement.value,
          },
        ],
        currentItem: '',
      }));
    }
  };

  const editItem = (id) => {
    const itemToEdit = categoryInfo.items.find((item) => item.id === id);
    if (itemToEdit) {
      setCategoryInfo((prevInfo) => ({
        ...prevInfo,
        currentItem: itemToEdit.content,
      }));
      setEditingItemId(id);
    }
  };

  const deleteItem = (id) => {
    setCategoryInfo((prevInfo) => ({
      ...prevInfo,
      items: prevInfo.items.filter((item) => item.id !== id),
    }));
    // 如果正在編輯這個項目，取消編輯狀態
    if (editingItemId === id) {
      setEditingItemId(null);
      setCategoryInfo((prevInfo) => ({
        ...prevInfo,
        currentItem: '',
      }));
    }
  };

  const itemBanners = (categoryInfo.items || []).map((item) => (
    <ItemBanner
      key={item.id}
      id={item.id}
      name={item.content}
      deleteItem={deleteItem}
      editItem={editItem}
      isEditing={editingItemId === item.id}
    />
  ));

  const handleDragStart = (e) => {
    const idx = e.currentTarget.dataset.index;
    if (idx === undefined) return;
    e.dataTransfer.setData('text/plain', idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const sourceIndex = Number(e.dataTransfer.getData('text/plain'));
    const destIndex = Number(e.currentTarget.dataset.index);
    if (Number.isNaN(sourceIndex) || Number.isNaN(destIndex)) return;
    if (sourceIndex === destIndex) return;
    if (reorderList) reorderList(infoType, sourceIndex, destIndex);
  };

  const submittedCategoryMarkup = data.map((submittedInfo, idx) => (
    <div
      key={submittedInfo.id}
      data-index={idx}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <FormBanner
        id={submittedInfo.id}
        handleDelete={handleDelete}
        handleEdit={editCategoryInfo}
        mainText={submittedInfo.category}
        subText={submittedInfo.items && submittedInfo.items.length > 0 ? submittedInfo.items[0].content : 'No items'}
        type={infoType}
      />
    </div>
  ));

  return (
    <form
      className="form form__container form__other-info"
      onSubmit={submitCategoryInfo}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.preventDefault();
      }}
    >
      <h1 className="form-title">
        {infoType === 'skillsInfo' ? 'Technical Skills' : 'Other Info'}
      </h1>
      <span className="form-subtitle">
        {infoType === 'skillsInfo'
          ? "Showcase the most relevant skills applicable to the job you're applying for"
          : "Only fill this out if it's important to the job you're applying for or if your CV still has space in the preview"}
      </span>

      {data.length ? (
        <div className="form-banner__container">{submittedCategoryMarkup}</div>
      ) : (
        ''
      )}

      <fieldset className="form-fieldset form__other-info">
        <label className="form-label">
          <span className="form-label__title">
            {infoType === 'skillsInfo'
              ? ' Add a skill category'
              : ' Add a category (ex. Languages/Awards)'}
          </span>
          <input
            type="text"
            name="category"
            className="form-input form-input__item-category"
            placeholder={infoType === 'skillsInfo' ? 'Design' : 'Languages'}
            value={categoryInfo.category}
            onChange={handleChange}
            required
          />
        </label>

        {categoryInfo.category && (
          <label className="form-label">
            <span className="form-label__title">
              Add {infoType === 'skillsInfo' ? 'a skill' : 'an item'} in{' '}
              {categoryInfo.category}
            </span>
            <div className="form-input__submitted-items">
              <div className="submitted-item__container">
                {categoryInfo.items.length ? itemBanners : ''}
              </div>

              <div className="form-input__items-wrapper">
                <input
                  type="text"
                  name="currentItem"
                  className="form-input form-input__items form-input__cumulative"
                  placeholder={
                    infoType === 'skillsInfo' ? 'Photoshop' : 'English(Fluent)'
                  }
                  onKeyDown={submitItem}
                  onChange={handleChange}
                  value={categoryInfo.currentItem}
                />
                <button
                  type="button"
                  className="btn btn__submit-item material-symbols-outlined"
                  onClick={submitItem}
                >
                  add
                </button>
              </div>
            </div>
          </label>
        )}
      </fieldset>

      <button type="submit" className="btn btn__submit">
        Submit {infoType === 'skillsInfo' ? 'skill info' : 'info'}
      </button>
    </form>
  );
}

export default CategoryInfo;
