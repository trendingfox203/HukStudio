import { db } from "@/lib/db";

export async function nextSortOrder(
  table: string,
  match?: { column: string; value: string },
): Promise<number> {
  const client = db();
  const where = match ? `where "${match.column}" = $1` : "";
  const params = match ? [match.value] : [];
  const { rows } = await client.query(
    `select sort_order from ${table} ${where} order by sort_order desc limit 1`,
    params,
  );
  return (rows[0]?.sort_order ?? 0) + 1;
}

export async function reorderRows(table: string, orderedIds: string[]): Promise<void> {
  const client = db();
  await Promise.all(
    orderedIds.map((id, index) =>
      client.query(`update ${table} set sort_order = $1 where id = $2`, [index, id]),
    ),
  );
}
