import '../styles/Container.scss'

export default function Container({ props, children }: any) {
  return (
    <div className="container">
      {children.length > 0 ? children : null}
    </div>
  );
};