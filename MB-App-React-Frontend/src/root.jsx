import React from 'react';
import {useState, useEffect} from  'react';
import { Link } from 'react-router-dom';


const ULComponent = ({data}) => {
  return (
  
    <ul >
      {data.map(item => {
        //return <a href={'/Forums/'+ item.forum_id+'/'+ item.forum_name}><li>{item.forum_name}</li> </a>;
        return <Link to={'/Forums/'+item.forum_id}  
        state={{ forum_id: item.forum_id, forum_name:item.forum_name, page_number:1, page_limit:10 }}>
            <li className="link">{item.forum_name}</li>
         </Link>
      })}
    </ul>
  
);

};

export default function Root() {
  const [forums, setForums] = useState([]);
  

    useEffect(() => {
      const requestOptions = {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'Accept':'*/*'
        },
        mode:'cors'
        
      };
      console.log("fetching data from API");
      fetch("http://localhost:5005/forums", requestOptions).then(response => response.json())
      .then((data) => {
        
        console.log(data);
        setForums(data);
      
      });

      }, []);
    return (
      <>
        <div id="sidebar">
          <h1>Message Board React App</h1>
          <div>
            <form id="search-form" role="search">
              <input
                id="q"
                aria-label="Search contacts"
                placeholder="Search"
                type="search"
                name="q"
              />
              <div
                id="search-spinner"
                aria-hidden
                hidden={true}
              />
              <div
                className="sr-only"
                aria-live="polite"
              ></div>
            </form>
            <form method="post">
              <button type="submit">New</button>
            </form>
          </div>
          <nav>
          <ULComponent data={forums} />

          </nav>

        </div>
        <div id="detail"></div>
      </>
    );
  }