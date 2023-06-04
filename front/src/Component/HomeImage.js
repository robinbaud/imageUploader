import React, { useEffect, useState } from "react";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import Button from "@mui/material/Button";
import "../pages/style/Gallery.css"; // Assurez-vous d'importer le fichier CSS approprié
import { useNavigate } from "react-router-dom";

export default function Gallery() {
  const [ImageData, setImageData] = useState([]);
  const token = localStorage.getItem("token");
  const Navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3001/images", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Erreur lors de la requête");
        }
        return response.json();
      })
      .then(data => {
        console.log("la liste des fichiers", data);
        setImageData(data);
      })
      .catch(error => {
        console.error("Erreur:", error);
      });
  }, []);

  const toggleImagePrivacy = (imageId) => {
    // Envoyez une requête pour changer l'état de l'image en privé ou public
    // Utilisez la méthode appropriée (PUT ou PATCH) pour mettre à jour l'état de l'image
    // Mettez à jour l'état de l'image dans le tableau ImageData en conséquence
    // Par exemple, vous pouvez utiliser une requête comme celle-ci :
    fetch(`http://localhost:3001/images/${imageId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ private: true }) // Modifiez la valeur de `private` selon vos besoins
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Erreur lors de la requête");
        }
        return response.json();
      })
      .then(data => {
        // Mettez à jour l'état de l'image dans le tableau ImageData
        const updatedImageData = ImageData.map(image =>
          image.id === imageId ? { ...image, private: true } : image
        );
        setImageData(updatedImageData);
      })
      .catch(error => {
        console.error("Erreur:", error);
      });
  };

  console.log(ImageData);

  return (
    
    <div>
      <ImageList className="ImageList" sx={{ width: "auto", height: "auto" }} cols={3}>

        {ImageData.map((image, index) => (

          
          <ImageListItem key={index} onClick={() => Navigate(`/image/${image.url}`, { state: image })}>
            {/* Affiche un indicateur "Privé" si l'image est privée */}
            {image.private ? (
              <span className="private-indicator">Privé</span>
            ) : null}
            <img
              className="imagehome"
              src={"http://localhost:3001/" + image.name}
              alt={"http://localhost:3001/" + image.url}
            />
            {/* Affiche un bouton pour changer la confidentialité de l'image */}
           
          </ImageListItem>

        ))}
      </ImageList>
    </div>
  );
  
}