import React from 'react';
import './Forums.css';
import { Link } from 'react-router-dom';

/* This function generates the page numbers for navigating the paginated post results returned from the api */
export default function PageView({current_page, post_count, post_limit, page_number_callback, forumid, forumName}) {

    let pages = Math.ceil(post_count/post_limit)
    console.log("pages:", pages);
    let page_array= Array.from({length: pages}, (x, i) => i + 1)

    const pageOnClick=(event)=>{
      let pagenum = event.target.id;
      console.log("page clicked:", pagenum);
      event.target.className = "page-counter";
      page_number_callback(Number(pagenum));
    }
  
    //generate page numbers
    const pageList= page_array.map((page_number) => {
      if(page_number === current_page){
        return(
          <li className="page-counter">
            {String(page_number)}
          </li>
        )
      }else {
        return(
          
          <Link to={'/Forums/'+forumid} state={{ forum_id: forumid, forum_name:forumName, page_number:page_number, page_limit:post_limit }}>
            <li id = {page_number}className="link" onClick={pageOnClick} >
              {String(page_number)}
            </li>
          </Link>
        )
      }
  });
    

    return(
      <div className="page-container">
        <ul>
            {pageList}
        </ul>
      </div>
    );


}