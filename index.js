const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");
const { MongoClient } = require("mongodb");
require('dotenv').config()
const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1dxm4.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const app = express();
app.use(cors());
app.use(bodyParser.json());

var serviceAccount = require("./configs/burj-al-arab-56aaf-firebase-adminsdk-2bj0w-f91541015f.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const port = 5000

const pass = "arabian1234";



const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  // console.log(err)
  const bookings = client.db("burjAlArab").collection("bookings");
  app.post("/addBooking", (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking).then((result) => {
      res.send(result.insertedCount > 0);
    });
    console.log(newBooking);
  });

  app.get("/bookings", (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(" ")[1];
      console.log({ idToken });

      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email
          if(tokenEmail ==queryEmail){        //error 
                                                
            bookings.find({email:queryEmail})
            .toArray((err, documents)=>{           
              res.status(200).send(documents);
          });
          }
          else{
            res.status(401).send('un authorized access');
          }
           
        })
        .catch((error) => {
          res.status(401).send('un authorized access');
        });
    }
    else{
      res.status(401).send('un authorized access')
    }

   
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port);
