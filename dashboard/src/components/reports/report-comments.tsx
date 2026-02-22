'use client';

import { useState } from 'react';
import { useAddComment } from '@/lib/hooks/use-reports';
import type { Comment } from '@/types';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ReportComments({ reportId, comments }: { reportId: string; comments: Comment[] }) {
  const [content, setContent] = useState('');
  const addComment = useAddComment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    addComment.mutate({ reportId, content }, {
      onSuccess: () => setContent(''),
    });
  };

  return (
    <div>
      <div className="space-y-3 mb-4">
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-lg bg-gray-50 border border-gray-100 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 rounded-full bg-coral-50 text-coral-500 flex items-center justify-center text-[10px] font-bold ring-1 ring-coral-100">
                {comment.author.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-[13px] font-medium text-foreground">{comment.author.name}</span>
              <span className="text-xs text-gray-400 tabular-nums">
                {format(new Date(comment.createdAt), 'MMM d, HH:mm')}
              </span>
            </div>
            <p className="text-sm text-gray-600 pl-7">{comment.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-2">No comments yet.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 h-9 text-sm"
        />
        <Button
          type="submit"
          disabled={addComment.isPending || !content.trim()}
          size="sm"
          className="bg-coral-500 hover:bg-coral-600 text-white text-[13px] h-9"
        >
          Send
        </Button>
      </form>
    </div>
  );
}
