function ItemBanner(props) {
  const { id, name, deleteItem, editItem, isEditing } = props;

  return (
    <div 
      key={id} 
      className="submitted-item__wrapper" 
      style={{ 
        backgroundColor: 'var(--color-input-outline)',
        opacity: isEditing ? 0.9 : 1
      }}
    >
      <span 
        className="submitted-item__name" 
        data-id={id}
        onClick={() => editItem && editItem(id)}
        onKeyDown={(e) => {
          if (editItem && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            editItem(id);
          }
        }}
        role="button"
        tabIndex={0}
        style={{ cursor: editItem ? 'pointer' : 'default' }}
      >
        {name}
      </span>
      <button
        className="submitted-item__delete btn-icon material-symbols-outlined"
        type="button"
        onMouseDown={() => deleteItem(id)}
      >
        close
      </button>
    </div>
  );
}

export default ItemBanner;
