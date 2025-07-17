import {ColumnDef, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {useIntlayer} from "next-intlayer";
import {RowData} from "@tanstack/table-core";

export default function PreviewTable({rows}: { rows: RowData[] }) {
  const content = useIntlayer<'previewTable'>('previewTable')
  const columnKeys = Object.keys(rows[0] as object);
  const columns: ColumnDef<RowData>[] = columnKeys.map(key => ({
    accessorKey: key,
    header: content.TableHeader[key as keyof typeof content.TableHeader] as string,
  }));
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <table className="w-full border-collapse border border-gray-200">
      <thead>
      {table.getHeaderGroups().map(headerGroup => (
        <tr key={headerGroup.id} className="bg-gray-100">
          {headerGroup.headers.map(header => (
            <th key={header.id} className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap">
              {header.column.columnDef.header as string}
            </th>
          ))}
        </tr>
      ))}
      </thead>
      <tbody>
      {table.getRowModel().rows.map(row => (
        <tr key={row.id} className="even:bg-gray-50">
          {row.getVisibleCells().map(cell => (
            <td key={cell.id} className="border border-gray-300 px-2 py-1 whitespace-nowrap">
              {cell.getValue() as string}
            </td>
          ))}
        </tr>
      ))}
      </tbody>
    </table>
  )
}
