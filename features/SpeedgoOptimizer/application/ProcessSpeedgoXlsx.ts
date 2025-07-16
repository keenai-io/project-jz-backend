import readXlsxFile from "read-excel-file";

export default async function ProcessSpeedgoXlsx(file: File) {
  const rows = await readXlsxFile(file)
  return rows
}
