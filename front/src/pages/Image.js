import React, { useEffect, useState } from 'react'
import {useLocation} from 'react-router-dom';
import './style/Image.css';

function Image() {
    
    const [image, setImage] = useState(null)
    console.log("mon image",image?.name)
    const path = window.location.pathname;
    const ImageSlug = path.split("/")[2];
    const token = localStorage.getItem("token")
    useEffect(() => {
    fetch(`http://localhost:3001/image/${ImageSlug}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Error: " + response.status);
        }
      })
      .then((data) => {
        setImage(data)
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    }, [])
    
     
    return ( <>
    <div className="image-container">
        {image && (
            <img className="image" src={"http://localhost:3001/" + image.name}/>
        )}
    </div>
    
    </> );
}

export default Image;