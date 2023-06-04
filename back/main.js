import express from "express";
import bodyParser from "body-parser";
import { genSalt, hash, compare } from "bcrypt";
import mongoose from "mongoose";
import { AccountDto } from "./models/accountDto.js";
import { connect, Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import { imageDto } from "./models/imageDto.js";
import { generateRandomString } from "./functions/url.js";
import { imgUpload } from "./functions/images.js";
import fs from "fs";
import cors from 'cors'

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"],
  })
);

// Definir le modele
const Account = model("Account", AccountDto);
const ImageUser = model("imageUser", imageDto);

// Connect to the MongoDB database
mongoose
  .connect("mongodb+srv://robin:robin@schoolmaterialcluster.xhun1xs.mongodb.net/")
  .then(() => console.log("Connected to MongoDB database"))
  .catch((error) =>
    console.log("Error connecting to MongoDB database: ", error)
  );

// Create a new account
app.post("/account", async (request, response) => {
  try {
    const { email, password } = request.body;

    const existAccount = await Account.find({ email: email });

    if (existAccount.length > 0) {
      response.status(403).send("Compte déjà créé");
    } else {
      const salt = await genSalt(10);
      const hashedPassword = await hash(password, salt);

      const account = new Account({ email, password: hashedPassword });
      await account.save();

      response.status(201).send("Compte créé");
    }
  } catch (error) {
    console.log(error);
    response
      .status(500)
      .send("Une erreur est survenue lors de la création du compte");
  }
});

//Connexion avec token
app.post("/login", async (request, reply) => {
  const { email, password } = request.body;
  try {
    // Vérification de l'email et du mot de passe

    const user = await Account.findOne({ email });

    if (!user) {
      throw new Error("Email ou mot de passe incorrect");
    }

    const validPassword = await compare(password, user.password);

    if (!validPassword) {
      throw new Error("Email ou mot de passe incorrect");
    }

    // Si les informations d'identification sont valides, créer le jeton JWT

    const token = jwt.sign(
      { userId: user._id },

      "16UQLq1HZ3CNwhvgrarV6pMoA2CDjb4tyF",

      {
        expiresIn: "1h",
      }
    );
    reply.status(200).send({ token });
  } catch (error) {
    console.log(error);
    reply.status(401).send("Identifiants invalides");
  }
});

//delete account
app.delete("/account", async (request, reply) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(403).send("Authentification invalide");
  }

  const token = authHeader.slice(7);

  const decodedToken = jwt.verify(token, "16UQLq1HZ3CNwhvgrarV6pMoA2CDjb4tyF");

  const userId = decodedToken.userId;

  try {
    const userAccount = await Account.findById(userId);

    if (!userAccount) {
      return reply.status(404).send("Compte non trouvé");
    }

    await Account.findByIdAndDelete(userId);

    const imagesAccount = await ImageUser.find({ userId: userId });
    imagesAccount.forEach(async (element) => {
      fs.unlink(element.name, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("Le fichier a été supprimé avec succès");
      });

      await ImageUser.findByIdAndDelete(element.id);
    });
    reply.status(200).send("Compte supprimé avec succès !");
  } catch (error) {
    console.log(error);

    reply.status(401).send("Authentification invalide");
  }
});

//send image
// url image http://localhost:3000/uploads/1683917463744-ff.JPG
app.post("/images", imgUpload, async (request, reply) => {
  const authHeader = request.headers.authorization;
  const token = authHeader.slice(7);
  const decodedToken = jwt.verify(token, "16UQLq1HZ3CNwhvgrarV6pMoA2CDjb4tyF");
  const userId = decodedToken.userId;
  const userAccount = await Account.findById(userId);
  if (!userAccount) {
    return reply.status(404).send("Compte non trouvé");
  }

  const name = `uploads/${request.file.filename}`;
  const date = Date();
  const isPublic = true;
  let url = generateRandomString();
  let isUrlExist = true;
  let urlExist = await ImageUser.find({ url: url });

  if (urlExist.length == 0) {
    isUrlExist = false;
  } else {
    while (isUrlExist) {
      url = generateRandomString();
      urlExist = await ImageUser.find({ url: url });
      if (urlExist.length == 0) {
        isUrlExist = false;
      }
    }
  }
  const newImage = new ImageUser({ date, name, isPublic, url, userId });
 const image =  await newImage.save();
  reply.status(201).send({
    date: image.date,
    isPublic: image.isPublic,
    name: image.name,
    url: image.url,
    userId: image.userId,
    id: image.id,
  });
});

// delete image
app.delete("/deleteImage/:imageId", async (request, reply) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(403).status("Authentification invalide");
  }

  const token = authHeader.slice(7);

  const decodedToken = jwt.verify(token, "16UQLq1HZ3CNwhvgrarV6pMoA2CDjb4tyF");

  const userId = decodedToken.userId;

  try {
    const imageId = request.params.imageId;
    const searchimageUser = await ImageUser.findById(imageId);

    if (userId != searchimageUser.userId) {
      return reply.status(403).send("interdit de supprimer image");
    }
    fs.unlink(searchimageUser.name, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Le fichier a été supprimé avec succès");
    });
    const image = await ImageUser.findByIdAndDelete(imageId);

    if (!image) {
      return reply.status(404).send("Image non trouvée");
    }

    reply.status(200).send("Image supprimée avec succès !");
  } catch (error) {
    console.log(error);

    reply.status(401).send("Authentification invalide");
  }
});

// Get all no connecte soit isPublic true
app.get("/images", async (request, reply) => {
  try {
    const images = await ImageUser.find({ isPublic: true });
    const imageData = await Promise.all(
      images.map(async (image) => {
        return {
          id: image._id,
          name: image.name,
          date: image.date,
          isPublic: image.isPublic,
          url: image.url,
        };
      })
    );
    reply.send(imageData);
  } catch (error) {
    console.log(error);
    reply.status(500).send("Erreur serveur");
  }
});

// get all image for user
app.get("/imagesUser", async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(403).send({ response: "Authentification invalide" });
    }
    // Vérifier que l'utilisateur est connecté et que son token JWT correspond bien à l'utilisateur en question
    const token = authHeader.slice(7);

    const decodedToken = jwt.verify(
      token,
      "16UQLq1HZ3CNwhvgrarV6pMoA2CDjb4tyF"
    );

    const userId = decodedToken.userId;
    // Récupérer toutes les images, qu'elles soient publiques ou privées
    const images = await ImageUser.find({ userId: userId });

    // Construire le tableau de données à renvoyer
    const imageData = await Promise.all(
      images.map(async (image) => {
        return {
          id: image._id,
          name: image.name,
          date: image.date,
          isPublic: image.isPublic,
          url: image.url,
        };
      })
    );

    // Renvoyer les données
    reply.send(imageData);
  } catch (error) {
    console.log(error);
    reply.status(500).send({ response: "Erreur serveur" });
  }
});

// Update bool image
app.put("/images/:id", async (request, reply) => {
  try {
    // Récupérer l'identifiant de l'image à mettre à jour depuis les paramètres de l'URL
    const imageId = request.params.id;

    // Vérifier que l'utilisateur est connecté et que son token JWT correspond bien à l'utilisateur en question
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(403).send("Authentification invalide");
    }

    const token = authHeader.slice(7);

    const decodedToken = jwt.verify(
      token,
      "16UQLq1HZ3CNwhvgrarV6pMoA2CDjb4tyF"
    );

    const userId = decodedToken.userId;

    // Récupérer l'image correspondant à l'identifiant et vérifier que l'utilisateur est autorisé à la modifier
    const image = await ImageUser.findById(imageId);

    if (!image) {
      return reply.status(404).send("Image non trouvée");
    }

    if (image.userId !== userId) {
      return reply.status(403).send("Non autorisé à modifier cette image");
    }

    image.isPublic = !image.isPublic;

    await image.save();

    // Renvoyer la nouvelle version de l'image

    reply.send({
      id: image._id,
      name: image.name,
      date: image.date,
      isPublic: image.isPublic,
      url: image.url,
    });
  } catch (error) {
    console.log(error);
    reply.status(500).send("Erreur serveur");
  }
});

//Verify token
app.get("/verify-token", async (request, reply) => {
  try {
     // Vérifier que l'utilisateur est connecté et que son token JWT correspond bien à l'utilisateur en question
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(403).send({ response: "connexion refusée" });
    }

    const token = authHeader.slice(7);

    const decodedToken = jwt.verify(
      token,
      "16UQLq1HZ3CNwhvgrarV6pMoA2CDjb4tyF"
    );

    const userId = decodedToken.userId;
    if (!userId) {
      reply.status(403).send({ response: "connexion refusée" });
    } else {
      reply.status(200).send({ response: "connexion autorisée" });
    }
  }
  catch (e) {
     reply.status(403).send({ response: "connexion refusée" });
  }
})

// Start the Express server
app.listen(PORT, () => {
  console.log("Server listening on port 3000");
});

// get slug
app.get("/image/:slug", async (request, reply) => {
  try {
    const slug = request.params.slug;
    const image = await ImageUser.findOne({ url: slug });

      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return reply.status(403).send({ response: "connexion refusée" });
      }

      const token = authHeader.slice(7);

      const decodedToken = jwt.verify(
        token,
        "16UQLq1HZ3CNwhvgrarV6pMoA2CDjb4tyF"
      );

    const userId = decodedToken.userId;
    
    console.log(userId);



    if (image) {
      if (image.isPublic || (userId && userId == image.userId)) {
        reply.status(200).send({
          date: image.date,
          isPublic: image.isPublic,
          name: image.name,
          url: image.url,
          userId: image.userId,
          id: image.id,
        });
      } else {
        reply.status(403).send({ response: "rrrr" });
      }
    } else {
      reply.status(403).send({ response: "interdit" });
    }
  } catch (error) {
    console.log(error);
    reply.status(500).send({ response: "Erreur serveur" });
  }
});