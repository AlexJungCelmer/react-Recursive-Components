export default function Text({ props, children }: any) {
  return (
    <div className="text">
      <div dangerouslySetInnerHTML={{ __html: props[0].content }} ></div>

      {children.length > 0 ? children : null}
    </div>
  );
};