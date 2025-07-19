// generic tree item component
export interface TreeItemData {
    id: string;
    label: string;
    description?: string; // optional description for the item
    children?: TreeItemData[]; // it is element children however in our case it will contains the data from the parents
}

interface TreeProps {
    root: TreeItemData;
    onClick?: (id: string) => void; // optional click handler for the root item
}

interface TreeItemProps extends TreeItemData {
    onClick?: (id: string) => void; // optional click handler for the item
}
const TreeItem = ({ id, label, description, children, onClick }: TreeItemProps) => {
    return (
        <li>
            <span onClick={() => onClick?.(id)} className={`bg-white/80 rounded-lg ${onClick ? 'cursor-pointer' : ''} p-2 block`}>
                <div className="truncate text-sm">{label}</div>
                {description && <div className="text-sm text-gray-500 truncate">{description}</div>}
            </span>
            {children && children.length > 0 && (
                <ul>
                    {children.map(child => (
                        <TreeItem key={child.id} {...child} onClick={onClick} />
                    ))}
                </ul>
            )}
        </li>
    );
};

export const Tree = ({ root, onClick }: TreeProps) => {
    return (
        <div style={{ textAlign: 'center' }}>
            <ul className="tree -vertical -centered">
                <TreeItem
                    {...root}
                    onClick={onClick}
                />
          </ul>  
        </div>
    );
};