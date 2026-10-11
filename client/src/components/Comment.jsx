import { useState } from 'react'
import AutoTextarea from './AutoTextarea'

function Comment({ comment, onReply }) {
  const [replying, setReplying] = useState(false)
  const [replyText, setReplyText] = useState('')

  function submitReply() {
    if (replyText.trim() === '') return
    onReply(comment.id, replyText)
    setReplyText('')
    setReplying(false)
  }

  return (
    <div className="comment">
      <p className="comment-author">
        <strong>{comment.author}</strong> <span>{comment.role}</span>
      </p>
      <p>{comment.text}</p>

      <button onClick={() => setReplying(!replying)}>Reply</button>

      {comment.replies.length > 0 && (
        <div className="replies">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="reply">
              <p className="comment-author">
                <strong>{reply.author}</strong> <span>{reply.role}</span>
              </p>
              <p>{reply.text}</p>
            </div>
          ))}
        </div>
      )}

      {replying && (
        <div className="reply-box">
          <AutoTextarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onSubmit={submitReply}
            placeholder="Write a reply"
          />
          <button onClick={submitReply}>Send</button>
        </div>
      )}
    </div>
  )
}

export default Comment