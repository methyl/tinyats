import { useState } from "react";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";

type Comment = {
  id: string;
  body: string;
  createdAt: number;
  author?: { id: string; email?: string };
};

type CommentSectionProps = {
  comments: Comment[];
  candidateId: string;
  currentUserId: string;
  hasCommentAccess: boolean;
  hasEditAccess: boolean;
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(diff / 86400000);
  return `${days}d ago`;
}

export function CommentSection({
  comments,
  candidateId,
  currentUserId,
  hasCommentAccess,
  hasEditAccess,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");

  const sorted = [...comments].sort((a, b) => a.createdAt - b.createdAt);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    db.transact(
      db.tx.comments[id()]
        .update({ body: newComment.trim(), createdAt: Date.now() })
        .link({ candidate: candidateId, author: currentUserId })
    );
    setNewComment("");
  };

  const handleDelete = (commentId: string) => {
    db.transact(db.tx.comments[commentId].delete());
  };

  const handleSaveEdit = (commentId: string) => {
    if (!editBody.trim()) return;
    db.transact(db.tx.comments[commentId].update({ body: editBody.trim() }));
    setEditingId(null);
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      {sorted.map((comment) => {
        const isAuthor = comment.author?.id === currentUserId;
        const canEdit = isAuthor;
        const canDelete = isAuthor || hasEditAccess;

        return (
          <div key={comment.id} className="mb-2 last:mb-0">
            {editingId === comment.id ? (
              <div className="flex gap-1">
                <input
                  type="text"
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit(comment.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="flex-1 text-[13px] px-2 py-1 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveEdit(comment.id)}
                  className="text-[11px] text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="group">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[12px] font-medium text-gray-700">
                    {comment.author?.email?.split("@")[0] ?? "User"}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {timeAgo(comment.createdAt)}
                  </span>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                    {canEdit && (
                      <button
                        onClick={() => {
                          setEditingId(comment.id);
                          setEditBody(comment.body);
                        }}
                        className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-[11px] text-gray-400 hover:text-red-500 cursor-pointer"
                      >
                        Del
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[13px] text-gray-600 leading-[1.4]">{comment.body}</p>
              </div>
            )}
          </div>
        );
      })}

      {hasCommentAccess && (
        <form onSubmit={handleSubmit} className="mt-2 flex gap-1">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 text-[13px] px-2 py-1 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-gray-50"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="text-[12px] font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-300 cursor-pointer disabled:cursor-default px-1"
          >
            Post
          </button>
        </form>
      )}
    </div>
  );
}
