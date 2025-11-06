function OtherInfoView(props) {
  const { data } = props;

  const otherInfoMarkup = data.map((info) => {
    const items = info.items || [];
    return (
      <section key={info.id} className="preview-area preview-area__other-info">
        <h1 className="preview-title">{info.category}</h1>
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="preview__category-item">
              {item.content}
            </div>
          ))
        ) : (
          <div className="preview__category-item">No items added</div>
        )}
      </section>
    );
  });

  return otherInfoMarkup;
}

export default OtherInfoView;
