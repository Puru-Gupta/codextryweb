export function DataTable({ rows }) {
  const headers = Object.keys(rows[0] || {});

  return (
    <div className="glass-panel overflow-hidden rounded-[28px]">
      <table className="min-w-full divide-y divide-white/10 text-left text-sm">
        <thead className="bg-white/5 text-slate-300">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-medium capitalize">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-slate-400">
          {rows.map((row, index) => (
            <tr key={index} className="transition hover:bg-white/5">
              {headers.map((header) => (
                <td key={header} className="px-4 py-3">
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
