import { Outlet } from "react-router-dom";
import {useState, useEffect} from  'react';
import { Link } from 'react-router-dom';

const NavBar = ({data}) => {
  return (
  
    <ul >
      {data.map(item => (
        <li key={item.forum_id} >
          <Link 
            to={`/Forums/${item.forum_id}`}
            className="link"
            state={{
              forum_id: item.forum_id,
              forum_name: item.forum_name,
              page_number: 1,
              page_limit: 10,
            }}
          >
            {item.forum_name}
          </Link>
        </li>
      ))}

      <li>
        <Link to = '/' className = "link">Home</Link>
      </li>
    </ul>
  
);

};

export default function Layout() {
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

        {/* put your search / "New" button here too if you want global */}
        <nav>
          <NavBar data={forums} />
        </nav>
      </div>

      {/* every child route renders here */}
      <div id="detail">
        <Outlet />
      </div>
    </>
    );
  }
