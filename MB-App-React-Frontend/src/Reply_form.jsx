import React from 'react';
import './Forums.css';
import {useNavigate} from "react-router-dom";


export default function ReplyForm ({forum_data, post_id, onClose, showToast}) {
  const navigate = useNavigate();

  function sendReply (postdata, forum_data, post_id) {

    let postendpoint = "http://localhost:5005/forums/";

    const requestOptions = {
      method: 'POST',
      headers: { 
          'Content-Type': 'application/json',
          'Accept':'*/*'
      },
      mode:'cors',
      body: postdata
      
    };
    console.log("POSTing data to API. Forum id is =" + forum_data);
    postendpoint += forum_data + '/' + post_id;
    //Post message to api.
    
   
    
   console.log("api endpont:", postendpoint);
   console.log("request options:", requestOptions);
   console.log( "postdata:", postdata, 'forum_data:', forum_data, 'post_id', post_id);

    fetch(postendpoint, requestOptions).then((response) => {
      console.log(response);
      showToast("Reply posted!", () => {
      navigate(0);;
    });
  
  });
    
  }
  
    function handleForm (e) {
      // Prevent the browser from reloading the page
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const formJson = JSON.stringify(Object.fromEntries(formData.entries()));
      console.log(formJson);
      //Post message to api.
      sendReply(formJson, forum_data, post_id);
      
    }
    return (
        <form onSubmit={handleForm}>
          
          <label>
            Messsage:
            <br />
             <textarea id="body" name="body" />
          </label>
          <br />
          <button type="submit">Post Reply</button>
          <button onClick={onClose}>Close</button>

          <hr />
        </form >
      );
}