import { useState } from 'react'
import Comment from './Comment'
import AutoTextarea from './AutoTextarea'

function CommentSection({ comments, onAddComment }) {
  const [newComment, setNewComment] = useState('')

  function addComment() {
    const text = newComment.trim()
    if (text === '') return
    onAddComment(text, null)
    setNewComment('')
  }

  return (
    <section className="comment-section" id="discussion">
      <h3>Comments</h3>

      <AutoTextarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        onSubmit={addComment}
        placeholder="Leave a comment"
      />
      <button onClick={addComment}>Post</button>

      {comments.map((comment) => (
        <Comment
          key={comment.id}
          comment={comment}
          onReply={(commentId, text) => onAddComment(text, commentId)}
        />
      ))}
    </section>
  )
}

export default CommentSection