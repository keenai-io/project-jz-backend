import {DocumentPlusIcon} from "@heroicons/react/24/outline";
import {TrashIcon} from "@heroicons/react/16/solid";
import clsx from "clsx";

export default function FileListItem({name, selected, onClick, onDelete}: {
  name: string,
  selected?: boolean,
  onClick: () => void,
  onDelete: () => void
}) {
  return (
    <div onClick={onClick} className={clsx(selected && 'border-2 rounded-md', 'flex items-baseline')}>
      <div className="file-list-item__icon">
        <DocumentPlusIcon className='h-10'/>
      </div>
      <div className="file-list-item__name">{name}</div>
      <TrashIcon onClick={onDelete} className='h-10 ml-auto cursor-pointer'/>
    </div>
  );
}
