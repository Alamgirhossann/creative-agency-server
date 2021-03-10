const express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s5oej.mongodb.net/${process.env.DB_NAME}retryWrites=true&w=majority`;

const app = express()
app.use(express.static('doctors'));
app.use(fileUpload());
app.use(bodyParser.json())
app.use(cors())
const port = 4000

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const reviewCollection = client.db("creativeAgency").collection("review");
  const servicesCollection = client.db("creativeAgency").collection("services");
  const ordersCollection = client.db("creativeAgency").collection("orders");
  const adminCollection = client.db("creativeAgency").collection("admin");

  app.post('/review', (req, res) => {
    const data = req.body;
    reviewCollection.insertOne(data)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.post('/admin', (req, res) => {
    const admin = req.body;
    adminCollection.insertOne(admin)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.find({email:email})
      .toArray((err, admin)=>{
        res.send(admin.length > 0)
      })
  })

  app.post('/services', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
      contentType:file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };
      servicesCollection.insertOne({ title, description, image })
        .then(result => {
          res.send(result.insertedCount > 0)
        })
  })

  app.post('/order', (req, res) => {
     const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const design = req.body.design;
    const detail = req.body.detail;
    const price = req.body.price;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    console.log( name, email, design, detail, price, file);

    var image = {
      contentType:file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };
      ordersCollection.insertOne({name, email,design, detail, price, image})
        .then(result => {
          res.send(result.insertedCount > 0)
        })
  })

  app.get('/feedBack', (req, res) => {
    reviewCollection.find({}).limit(5)
      .toArray((error, documents) => {
        res.send(documents)
      })
  })

  app.get('/service', (req, res) => {
    servicesCollection.find({}).limit(5)
      .toArray((error, documents) => {
        res.send(documents)
      })
  })

  app.get('/orders', (req, res) => {
    ordersCollection.find({email:req.query.email})
      .toArray((error, documents) => {
         res.send(documents)
      })
  })

  app.get('/allOrders', (req, res) => {
    ordersCollection.find({})
      .toArray((error, documents) => {
        res.send(documents)
      })
  })

  console.log('database connected');

});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port)