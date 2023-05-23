import '../styles/Block.scss'

export default function Block({ props, children }: any) {
    return (
        <div className="block" style={props[0].css[0]}>
            {children.length > 0 ? children : null}
        </div>
    );
};