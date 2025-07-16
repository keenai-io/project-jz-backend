// import {Row} from "read-excel-file";
// import {useReactTable} from "@tanstack/react-table";
//
// export default function PreviewTable(rows: Row[]) {
//   const table = useReactTable({
//     data: rows
//   })
//
//   return <table>
//     <thead>
//     {table.getHeaderGroups().map(headerGroup => (
//       <tr key={headerGroup.id}>
//         {headerGroup.headers.map(header => (
//           <th key={header.id}>{header.id}</th>
//         ))}
//       </tr>
//     ))}
//     </thead>
//     <tbody>
//     {table.getRowModel().rows.map(row => (
//       <tr key={row.id}>
//         {row.getVisibleCells().map(cell => (
//           <td key={cell.id}>{cell.getValue()}</td>
//         ))}
//       </tr>
//     ))}
//     </tbody>
//   </table>
// }
