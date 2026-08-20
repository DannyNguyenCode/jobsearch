import {
  JOB_SEARCH_LOG_COLUMNS,
  jobSearchLogContactLines,
  jobSearchLogDate,
  jobSearchLogPositionLines,
} from "@/lib/job-search-log";
import type { JobApplication } from "@/lib/types";

type JobSearchLogTableProps = {
  applications: JobApplication[];
};

function Lines({ lines }: { lines: string[] }) {
  if (lines.length === 0) return <span className="text-muted">—</span>;
  return (
    <>
      {lines.map((line, index) => (
        <div key={`${index}-${line}`}>{line}</div>
      ))}
    </>
  );
}

export function JobSearchLogTable({ applications }: JobSearchLogTableProps) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          {JOB_SEARCH_LOG_COLUMNS.map((column) => (
            <th
              className="border border-base-content bg-base-200 px-2 py-2 text-left font-semibold align-bottom"
              key={column}
            >
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {applications.length === 0 ? (
          <tr>
            <td className="border border-base-content px-2 py-8 text-center text-muted" colSpan={5}>
              No applications to include in this log yet.
            </td>
          </tr>
        ) : (
          applications.map((application) => (
            <tr key={application.id}>
              <td className="border border-base-content px-2 py-2 align-top whitespace-nowrap">
                {jobSearchLogDate(application)}
              </td>
              <td className="border border-base-content px-2 py-2 align-top">{application.organization || "—"}</td>
              <td className="border border-base-content px-2 py-2 align-top">{application.location || "—"}</td>
              <td className="border border-base-content px-2 py-2 align-top">
                <Lines lines={jobSearchLogContactLines(application)} />
              </td>
              <td className="border border-base-content px-2 py-2 align-top">
                <Lines lines={jobSearchLogPositionLines(application)} />
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
