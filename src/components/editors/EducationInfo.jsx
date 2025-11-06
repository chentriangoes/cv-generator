import { useEffect, useState } from 'react';

import { nanoid } from 'nanoid';

import FormBanner from './FormBanner';
import ItemBanner from './ItemBanner';

function EducationInfo(props) {
  const { data, handleSubmit, deleteEducInfo, reorderList } = props;
  const infoType = 'educationInfo';

  const emptyState = {
    institution: '',
    degreeProgram: '',
    startingYear: '',
    graduatingYear: '',
    onGoing: true,
    gpa: '',
    id: '',
    additionalInfo: [],
    currentInfoItem: '',
  };

  const [educInfo, setEducInfo] = useState(
    JSON.parse(localStorage.getItem('cvEducationInfo')) || emptyState,
  );
  
  const [editingId, setEditingId] = useState(null); // 追蹤正在編輯的項目ID

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setEducInfo((prevInfo) => ({
      ...prevInfo,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  useEffect(() => {
    localStorage.setItem('cvEducationInfo', JSON.stringify(educInfo));
  }, [educInfo]);

  const editEducInfo = (id) => {
    // 不刪除項目，只是載入資料並記錄編輯ID
    const itemToEdit = data.find((item) => item.id === id);
    // 確保載入完整的資料，包括 onGoing 狀態
    setEducInfo({
      ...itemToEdit,
      currentInfoItem: '', // 重置輸入欄位
    });
    setEditingId(id);
  };

  const submitEducInfo = (e) => {
    e.preventDefault();

    if (editingId) {
      // 如果是編輯模式，通知 App.jsx 這是編輯操作
      e.target.dataset.editingId = editingId;
      handleSubmit(e, infoType);
      setEditingId(null);
    } else {
      // 新增模式
      handleSubmit(e, infoType);
    }

    // Set local state to empty
    setEducInfo(emptyState);
  };

  const [editingAddlInfoId, setEditingAddlInfoId] = useState(null);

  const submitAddlInfo = (e) => {
    let infoContent;

    if (e.type === 'keydown' && e.key !== 'Enter') return;
    if (e.type === 'click') {
      infoContent = e.target.previousElementSibling.value;
    } else if (e.key === 'Enter') infoContent = e.target.value;

    if (!infoContent) return;

    if (editingAddlInfoId) {
      // 編輯模式：更新現有項目
      setEducInfo((prevInfo) => ({
        ...prevInfo,
        additionalInfo: prevInfo.additionalInfo.map((item) =>
          item.id === editingAddlInfoId
            ? { ...item, content: infoContent }
            : item
        ),
        currentInfoItem: '',
      }));
      setEditingAddlInfoId(null);
    } else {
      // 新增模式
      setEducInfo((prevInfo) => ({
        ...prevInfo,
        additionalInfo: [
          ...prevInfo.additionalInfo,
          {
            id: nanoid(),
            content: infoContent,
          },
        ],
        currentInfoItem: '',
      }));
    }
  };

  const editAddlInfo = (id) => {
    const itemToEdit = educInfo.additionalInfo.find((item) => item.id === id);
    if (itemToEdit) {
      setEducInfo((prevInfo) => ({
        ...prevInfo,
        currentInfoItem: itemToEdit.content,
      }));
      setEditingAddlInfoId(id);
    }
  };

  const deleteAddlInfo = (id) => {
    setEducInfo((prevInfo) => ({
      ...prevInfo,
      additionalInfo: prevInfo.additionalInfo.filter((item) => item.id !== id),
    }));
    // 如果正在編輯這個項目，取消編輯狀態
    if (editingAddlInfoId === id) {
      setEditingAddlInfoId(null);
      setEducInfo((prevInfo) => ({
        ...prevInfo,
        currentInfoItem: '',
      }));
    }
  };

  // drag/drop handlers for submitted items
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

  const submittedInfoMarkup = data.map((addedInfo, idx) => (
    <div
      key={addedInfo.id}
      data-index={idx}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <FormBanner
        id={addedInfo.id}
        handleDelete={deleteEducInfo}
        handleEdit={editEducInfo}
        mainText={addedInfo.institution}
        subText={addedInfo.degreeProgram}
        type={infoType}
      />
    </div>
  ));

  const addlInfoMarkup = educInfo.additionalInfo.map((item) => (
    <ItemBanner
      key={item.id}
      id={item.id}
      name={item.content}
      deleteItem={deleteAddlInfo}
      editItem={editAddlInfo}
      isEditing={editingAddlInfoId === item.id}
    />
  ));

  return (
    <form
      className="form form__container form__education-info"
      onSubmit={submitEducInfo}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.preventDefault();
      }}
    >
      <h1 className="form-title">Education Background</h1>
      {data.length ? (
        <div className="form-banner__container">{submittedInfoMarkup}</div>
      ) : (
        ''
      )}
      <fieldset className="form-fieldset form__education-info">
        <label className="form-label">
          <span className="form-label__title">
            University/Institution/Organization:
          </span>
          <input
            type="text"
            name="institution"
            className="form-input form-input__education-institution"
            placeholder="University of London"
            value={educInfo.institution}
            onChange={handleChange}
            required
          />
        </label>
        <label className="form-label">
          <span className="form-label__title">Program/Degree/Course:</span>
          <input
            type="text"
            name="degreeProgram"
            className="form-input form-input__degree-program"
            placeholder="Ph.D in Philosophy"
            value={educInfo.degreeProgram}
            onChange={handleChange}
            required
          />
        </label>
        <label className="form-label">
          <span className="form-label__title">Starting Year:</span>
          <input
            type="month"
            name="startingYear"
            className="form-input form-input__starting-year"
            min="1900-01"
            value={educInfo.startingYear || ''}
            onChange={handleChange}
            required
          />
        </label>
        <div className="form-label">
          <span className="form-label__title">On-going:</span>
          <div className="switch-ongoing">
            <input
              className="form-input switch-ongoing__input"
              type="checkbox"
              name="onGoing"
              id="ongoingSwitchEduc"
              onChange={handleChange}
              checked={educInfo.onGoing}
            />
            <label
              aria-hidden="true"
              className="switch-ongoing__label"
              htmlFor="ongoingSwitchEduc"
            >
              On
            </label>
            <div aria-hidden="true" className="switch-ongoing__marker" />
          </div>
        </div>
        {!educInfo.onGoing && (
          <label className="form-label">
            <span className="form-label__title">Graduating Year:</span>
            <input
              type="month"
              name="graduatingYear"
              className="form-input form-input__graduating-year"
              min="1900-01"
              value={educInfo.graduatingYear || ''}
              onChange={handleChange}
            />
          </label>
        )}
        <label className="form-label">
          <span className="form-label__title">GPA (optional):</span>
          <input
            type="text"
            name="gpa"
            className="form-input form-input__gpa"
            placeholder="3.9/4.0"
            value={educInfo.gpa}
            onChange={handleChange}
          />
        </label>

        <label className="form-label">
          <span className="form-label__title">
            Additional info (ex. awards, courses, thesis project)
          </span>

          <div className="submitted-item__container">
            {educInfo.additionalInfo.length ? addlInfoMarkup : ''}
          </div>

          <div className="form-input__items-wrapper">
            <input
              type="text"
              name="currentInfoItem"
              className="form-input form-input__addl-info-item form-input__items"
              placeholder="Press enter to submit an item..."
              value={educInfo.currentInfoItem}
              onChange={handleChange}
              onKeyDown={submitAddlInfo}
            />
            <button
              type="button"
              className="btn btn__submit-item material-symbols-outlined"
              onClick={submitAddlInfo}
            >
              add
            </button>
          </div>
        </label>
      </fieldset>
      <button type="submit" className="btn btn__submit">
        Submit education background
      </button>
    </form>
  );
}

export default EducationInfo;
