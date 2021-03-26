const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config()


const app = express()


const port = 4000;

app.use(cors());
app.use(bodyParser.json());


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6i5ol.mongodb.net/burj-al-arab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const serviceAccount = require("./configs/burj-al-arab-c2014-firebase-adminsdk-o9zv1-1d46b05b37.json");

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
  

client.connect(err => {
  const bookingCollection = client.db("burj-al-arab").collection("booking");

  app.post('/addBooking', (req, res)=>{
    const newBooking = req.body;
   bookingCollection.insertOne(newBooking)
   .then(result=>{
     console.log(result)
     res.send(result.insertedCount > 0);
   })
  });

  app.get('/booking', (req, res) => {
    const bearer = req.headers.authorization;
    if(bearer && bearer.startsWith('Bearer')){
      const idToken = bearer.split(' ')[1];
      admin
      .auth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        const tokenEmail = decodedToken.email;
        if (tokenEmail === req.query.email){
          bookingCollection.find({email: req.query.email})
          .toArray((err, documents)=>{
            res.status(200).send(documents);
          })
        }
        else{
          res.status(401).send('un authorization access')
        }
      })
      .catch((error) => {
        res.status(401).send('un authorization access')
      });

    }
    else{
      res.status(401).send('un authorization access')
    }
  })
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.listen(port);