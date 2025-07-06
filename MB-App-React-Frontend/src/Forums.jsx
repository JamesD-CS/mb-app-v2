import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PageSet from './Pageset.jsx';
import PageView from './PageView.jsx';
import PostView from './Post_view.jsx';
import './Forums.css';

function requestBuilder(base, forumId, limit, page) {
  return `${base}${forumId}?page_limit=${limit}&page=${page}`;
}

const PostForm = ({ forum_data, post_id, showToast }) => {
  const navigate = useNavigate();
  const isNew = post_id === "";

  const handlePost = async (e) => {
    e.preventDefault();
    const formJson = JSON.stringify(Object.fromEntries(new FormData(e.target).entries()));
    const endpoint = `http://localhost:5005/forums/${forum_data}${isNew ? "" : `/${post_id}`}`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: '*/*' },
        mode: 'cors',
        body: formJson,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showToast('Message Posted!', () => navigate(0));
    } catch (err) {
      console.error('Post failed:', err);
    }
  };

  return (
    
    <div>
      <form onSubmit={handlePost}>
        {isNew && (
          <>
            <label htmlFor="title">Title:</label>
            <input id="title" name="title" />
            <hr />
          </>
        )}
        <label htmlFor="body">Message:</label><br />
        <textarea id="body" name="body" /><br /><br />
        <button type="submit">{isNew ? 'Post Message' : 'Post Reply'}</button>
        <hr />
      </form>
    </div>
  );
};

export default function Forums() {
  const { forumId } = useParams();
  const { state: { forum_name: forumName, page_limit, page_number } } = useLocation();
  const [postData, setPostData] = useState([]);
  const [postCount, setPostCount] = useState(0);
  const [postLimit, setPostLimit] = useState(page_limit);
  const [pageNumber, setPageNumber] = useState(page_number);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg, onFinish) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
      onFinish();
    }, 3000);
  };

  const fetchData = async (url) => {
    try {
      const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, mode: 'cors' });
      const data = await res.json();
      setPostData(data.posts);
      setPostCount(data.total_posts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const limit = postLimit > 0 ? postLimit : page_limit;
    const url = requestBuilder('http://localhost:5005/forums/', forumId, limit, pageNumber);
    fetchData(url);
  }, [forumId, page_limit, postLimit, pageNumber]);

  return (
    <div className="App">
      <h1>Message board app</h1>
      <h2>Forum: {forumName}</h2>
      <PostForm forum_data={forumId} post_id="" showToast={showToast} />
      {toastMessage && <div className="toast fade-in-out">{toastMessage}</div>}
      <div>Page Count: {postLimit}</div>
      <div>Total Posts: {postCount}</div>
      <PageView
        current_page={pageNumber}
        post_count={postCount}
        post_limit={postLimit}
        page_number_callback={setPageNumber}
        forumid={forumId}
        forumName={forumName}
      />
      <PageSet pageChangeCallback={setPostLimit} />
      <PostView data={postData} forum_id={forumId} />
    </div>
  );
}
