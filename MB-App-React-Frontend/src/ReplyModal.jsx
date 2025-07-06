import React from 'react';
import ReplyForm from './Reply_form';
import './Forums.css';


export default function ModalContent({ onClose, poster_id, forum_id , showToast }) {

    return (
      <div className="modal">
        <div>Post ID: {poster_id} </div>
        <div>forum ID: {forum_id} </div>
        <ReplyForm forum_data = {forum_id}  post_id = {poster_id} onClose={onClose} showToast={showToast}/>

      </div>
    );
  }