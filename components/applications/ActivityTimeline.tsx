import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import type { TimelineEvent } from "@/lib/types";

const TONE: Record<NonNullable<TimelineEvent["tone"]>, string> = {
  primary: "bg-primary text-primary-content",
  secondary: "bg-secondary/20 text-secondary",
  success: "bg-success/20 text-secondary",
  neutral: "bg-base-300 text-muted",
};

export function ActivityTimeline({
  events,
  title = "Activity",
  variant = "list",
  bare = false,
}: {
  events: TimelineEvent[];
  title?: string;
  variant?: "list" | "cards";
  bare?: boolean;
}) {
  const body =
    events.length === 0 ? (
      <p className="text-sm text-muted">No activity recorded yet.</p>
    ) : variant === "cards" ? (
      <ol className="space-y-6">
        {events.map((event, index) => (
          <li className={`flex gap-4 ${index > 0 ? "opacity-80 hover:opacity-100" : ""}`} key={event.id}>
            <div className="relative shrink-0 w-8 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 border-base-200 ${TONE[event.tone ?? "neutral"]}`}
              >
                <Icon name={event.icon} size={16} />
              </div>
              {index < events.length - 1 ? (
                <span className="w-px flex-1 bg-outline-variant mt-1" aria-hidden />
              ) : null}
            </div>
            <article className="card-surface p-6 flex-1 mb-1">
              <div className="flex justify-between items-start gap-3 mb-2">
                <h3 className="font-semibold">{event.title}</h3>
                <time className="text-sm text-muted shrink-0">{event.timestamp}</time>
              </div>
              <p className="text-muted">{event.description}</p>
              {event.note ? (
                <div className="flex gap-3 mt-4 pt-4 border-t border-outline-variant">
                  <Avatar initials={event.note.authorInitials} name={event.note.author} size="xs" />
                  <blockquote className="bg-base-200 p-3 rounded-lg rounded-tl-none text-sm italic text-muted">
                    <span className="not-italic font-medium text-base-content block mb-1">
                      {event.note.author}
                    </span>
                    “{event.note.body}”
                  </blockquote>
                </div>
              ) : null}
            </article>
          </li>
        ))}
      </ol>
    ) : (
      <ol className="relative space-y-5 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-outline-variant">
        {events.map((event) => (
          <li className="relative pl-10" key={event.id}>
            <div
              className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${TONE[event.tone ?? "neutral"]}`}
            >
              <Icon name={event.icon} size={16} />
            </div>
            <p className="text-xs text-muted mb-1">{event.timestamp}</p>
            <p className="font-medium">{event.title}</p>
            <p className="text-sm text-muted">{event.description}</p>
            {event.note ? (
              <div className="mt-3 flex gap-2">
                <Avatar initials={event.note.authorInitials} name={event.note.author} size="xs" />
                <blockquote className="bg-base-200 p-3 rounded-lg rounded-tl-none text-sm italic text-muted">
                  <span className="not-italic font-medium text-base-content block mb-1">
                    {event.note.author}
                  </span>
                  “{event.note.body}”
                </blockquote>
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    );

  if (bare) {
    return (
      <section>
        {title ? (
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Icon name="forum" size={18} />
            {title}
          </h2>
        ) : (
          <h2 className="sr-only">Timeline</h2>
        )}
        {body}
      </section>
    );
  }

  return (
    <section className="card-surface p-6 h-full">
      <h2 className="font-semibold mb-4 flex items-center gap-2">
        <Icon name="history" size={18} />
        {title}
      </h2>
      {body}
    </section>
  );
}