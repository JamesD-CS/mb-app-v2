import React from 'react';
import './Forums.css';
import { createPortal } from 'react-dom';
import {useState } from  'react';
import ModalContent from './ReplyModal.jsx';


export default function PostView  ({data, forum_id}) {

  const [toastMessage, setToastMessage] = useState('');
  const TOAST_DURATION = 3000;

  const showToast = (message, onFinish = () => {}) => {
  setToastMessage(message);

  setTimeout(() => {
    setToastMessage('');
    onFinish(); // Called after toast fades out
  }, TOAST_DURATION); //
};

const modalRoot =
  typeof document !== 'undefined'
    ? document.getElementById('modal-root')
    : null;

  const ReplyPortal = ({div_id, poster_id, forum_id}) => {
    const [showModal, setShowModal] = useState(false);

     if (!modalRoot) {
    // Fallback: render inline if for some reason modal-root isn't there
    return (
      <>
        {!showModal && (
          <button onClick={() => setShowModal(true)}>
            Reply
          </button>
        )}
        {showModal && (
          <ModalContent
            onClose={() => setShowModal(false)}
            poster_id={poster_id}
            forum_id={forum_id}
            showToast={showToast}
          />
        )}
      </>
    );
  }
    return (
      <>
        {!showModal &&
        <button onClick={() => setShowModal(true)}>
          Reply
        </button>
        }
        {showModal && createPortal(
          <ModalContent onClose={() => setShowModal(false)}  poster_id = {poster_id} forum_id={forum_id} showToast={showToast} />,
          document.getElementById(div_id)
        )}
      </>
    );
  }

    const ReplyRows = ({ replies, level = 0 }) => {
      if (!Array.isArray(replies)) return null;

      return replies.map((reply) => (
        <div
          key={reply.poster_id}
          className="reply-block"
          style={{ marginLeft: `${level * 20}px` }} // Indent based on depth
        >
          <div className="reply-header">
            <span><strong>ID:</strong> {reply.poster_id}</span>
            <span><strong>Time:</strong> {reply.post_time}</span>
          </div>
          <div className="reply-body">{reply.body}</div>
          <div id={reply.poster_id}>
            <ReplyPortal
              div_id={reply.poster_id}
              poster_id={reply.poster_id}
              forum_id={forum_id}
            />
          </div>

          {/* Recurse into deeper replies with level + 1 */}
          <ReplyRows replies={reply.replies} level={level + 1} />
        </div>
      ));
    };
  
  const DisplayData = data.map((post) => (

    <div key={post.poster_id} className="post-block">
      <div className="post-header">
        <span><strong>ID:</strong> {post.poster_id}</span>
        <span><strong>Time:</strong> {post.post_time}</span>
      </div>
      <div className="post-title">
        <strong>Title:</strong> {post.title}
      </div>
      <div className="post-body">{post.body}</div>
      <div id={post.poster_id}>
        <ReplyPortal
          div_id={post.poster_id}
          poster_id={post.poster_id}
          forum_id={forum_id}
        />
      </div>

      {/* Render replies recursively */}
      <ReplyRows replies={post.replies} level={1} />
    </div>
));

  
    return(
        <div>

          {toastMessage && <div className="toast fade-in-out">{toastMessage}</div>}
          {DisplayData}
  
        </div>
    )
  };
  