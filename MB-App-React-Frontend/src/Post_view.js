import React from 'react';
import './Forums.css';
import { createPortal } from 'react-dom';
import {useState } from  'react';
import ModalContent from './ReplyModal.js';


export default function PostView  ({data, forum_id}) {

  const ReplyPortal = ({div_id, poster_id, forum_id}) => {
    const [showModal, setShowModal] = useState(false);
    return (
      <>
        {!showModal &&
        <button onClick={() => setShowModal(true)}>
          Reply
        </button>
        }
        {showModal && createPortal(
          <ModalContent onClose={() => setShowModal(false)}  poster_id = {poster_id} forum_id={forum_id} />,
          document.getElementById(div_id)
        )}
      </>
    );
  }

    const ReplyRows = ({replies, colspan}) =>{

      let replyrows = [];

        if (!Array.isArray(replies)) return [];
        replies.map((reply) =>{
          
          replyrows.push(
  
              <table className="reply-table">
                <tbody>
                <tr>
                  <td colSpan = {colspan +1} className='hidden'></td>
                  <td>ID:</td>
                  <td>{reply.poster_id}</td>
                  <td>Time:</td>
                  <td>{reply.post_time}</td>
                </tr>
                <tr>
                  <td colSpan = {colspan} className='hidden'></td>
                  <td colSpan={colspan + 1}>{reply.body}</td>
                </tr>
                <tr>
                  <td colSpan = {colspan} className='hidden'></td>
                  <td>
                    <div id = {reply.poster_id}> 
                      <ReplyPortal div_id={reply.poster_id} poster_id = {reply.poster_id} forum_id={forum_id}/>          
                    </div>
                  </td>
                </tr>  
              </tbody>
            </table>
          )
        })
      
      return replyrows;
      
    };
  
    const DisplayData=data.map(
        (post)=>{
  
         //console.log("inside first level map function post replies are:", post.replies);
         //console.log("data inside displaydata is:", data);
            return(
              <div id = {post.poster_id}>
              <table >
                <tbody>
                  <tr>
                      <td>ID:</td>
                      <td>{post.poster_id}</td>
                      <td>Time:</td>
                      <td>{post.post_time}</td>
                  </tr>
                  <tr>
                      <td>Title:</td>
                      <td>{post.title}</td>
                  </tr>
                  <tr>
                      <td colSpan={2}>{post.body}</td>
                  </tr>
                  <tr>
                    <td>
                      <div id = {post.poster_id}>
                        <ReplyPortal div_id={post.poster_id} poster_id={post.poster_id} forum_id={forum_id} />  
                      </div>
                    </td>
                  </tr>
               
              </tbody>
              </table>
              <ReplyRows replies={post.replies} colspan ={1}/>
              </div>
              
            )
        }
    )
  
    return(
        <div>
            
                    {DisplayData}
  
        </div>
    )
  };
  