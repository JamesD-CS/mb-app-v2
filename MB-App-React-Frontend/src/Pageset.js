import React from 'react';
import './Forums.css';

export default function Page_set({ pageChangeCallback}) {
    //const [selectedOption, setSelectedOption] = useState(postLimit);

    const handleChange = (e) => {
        let newPageLimit = e.target.value;
        //setSelectedOption(newPageLimit);
        console.log(`Option selected:`, newPageLimit);
        pageChangeCallback(newPageLimit);
      };

    return (
    <label>
      Posts Per Page:
      <select name="pagecount" defaultValue="10" onChange={handleChange} >
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="30">30</option>

      </select>
      
    </label>
  );
    
  }