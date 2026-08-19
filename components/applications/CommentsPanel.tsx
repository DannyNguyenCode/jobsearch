"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import type { ApplicationComment } from "@/lib/types";

type CommentsPanelProps = {
  applicationId: string;
  comments: ApplicationComment[];
  currentUserId?: string;
};

export function CommentsPanel({ applicationId, comments, currentUserId }: CommentsPanelProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = currentUserId ?? session?.user?.id;
  const [items, setItems] = useState(comments);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const fieldId = useId();

  function applyComments(next?: ApplicationComment[]) {
    if (next) setItems(next);
    router.refresh();
  }

  async function postComment() {
    if (!draft.trim() || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/applications/${applicationId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft.trim() }),
      });
      const result = (await response.json()) as { error?: string; application?: { comments?: ApplicationComment[] } };
      if (!response.ok) {
        setError(result.error ?? "Could not post the comment.");
        return;
      }
      setDraft("");
      applyComments(result.application?.comments);
    } catch {
      setError("Could not post the comment. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(commentId: string) {
    if (!editDraft.trim() || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/applications/${applicationId}/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: editDraft.trim() }),
      });
      const result = (await response.json()) as { error?: string; application?: { comments?: ApplicationComment[] } };
      if (!response.ok) {
        setError(result.error ?? "Could not update the comment.");
        return;
      }
      setEditingId(null);
      applyComments(result.application?.comments);
    } catch {
      setError("Could not update the comment. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteComment(commentId: string) {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/applications/${applicationId}/comments/${commentId}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as { error?: string; application?: { comments?: ApplicationComment[] } };
      if (!response.ok) {
        setError(result.error ?? "Could not delete the comment.");
        return;
      }
      applyComments(result.application?.comments);
    } catch {
      setError("Could not delete the comment. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="flex flex-col h-full">
      <div className="p-4 border-b border-outline-variant bg-base-200">
        <h2 className="font-semibold flex items-center gap-2">
          <Icon className="text-primary" name="forum" size={18} />
          Comments
        </h2>
        <p className="text-sm text-muted mt-1">Visible to the applicant and the linked recruiter.</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {items.length === 0 ? (
          <p className="text-sm text-muted">No comments yet. Start the conversation on this application.</p>
        ) : (
          items.map((comment) => {
            const own = Boolean(userId && comment.authorId && comment.authorId === userId);
            const editing = editingId === comment.id;
            return (
              <article className="bg-canvas rounded-lg p-3 border border-outline-variant" key={comment.id}>
                <div className="flex justify-between items-center mb-2 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar initials={comment.authorInitials} name={comment.author} size="xs" />
                    <span className="text-sm font-semibold truncate">{comment.author}</span>
                    {comment.authorRole ? (
                      <span className="badge badge-ghost badge-sm capitalize">{comment.authorRole}</span>
                    ) : null}
                  </div>
                  <time className="text-xs text-outline shrink-0">{comment.createdAt}</time>
                </div>
                {editing ? (
                  <div className="space-y-2">
                    <label className="sr-only" htmlFor={`${fieldId}-edit-${comment.id}`}>
                      Edit comment
                    </label>
                    <textarea
                      className="textarea w-full"
                      disabled={saving}
                      id={`${fieldId}-edit-${comment.id}`}
                      rows={3}
                      value={editDraft}
                      onChange={(event) => setEditDraft(event.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <button className="btn btn-ghost btn-xs" type="button" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary btn-xs"
                        disabled={saving || !editDraft.trim()}
                        type="button"
                        onClick={() => void saveEdit(comment.id)}
                      >
                        Save comment
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted whitespace-pre-wrap">{comment.body}</p>
                )}
                {own && !editing ? (
                  <div className="flex justify-end gap-1 mt-2">
                    <button
                      className="btn btn-ghost btn-xs"
                      type="button"
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditDraft(comment.body);
                        setError("");
                      }}
                    >
                      Edit
                    </button>
                    <button className="btn btn-ghost btn-xs text-error" type="button" onClick={() => void deleteComment(comment.id)}>
                      Delete
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>
      <form
        className="p-4 border-t border-outline-variant"
        onSubmit={(event) => {
          event.preventDefault();
          void postComment();
        }}
      >
        <label className="sr-only" htmlFor={fieldId}>
          Add a comment
        </label>
        <textarea
          className="textarea w-full"
          disabled={saving}
          id={fieldId}
          placeholder="Write a comment..."
          rows={3}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        {error ? <p className="text-error text-xs mt-2">{error}</p> : null}
        <div className="flex justify-end mt-2">
          <button className="btn btn-primary btn-sm" disabled={saving || !draft.trim()} type="submit">
            {saving ? <span className="loading loading-spinner loading-xs" /> : <Icon name="send" size={16} />}
            Post comment
          </button>
        </div>
      </form>
    </section>
  );
}
