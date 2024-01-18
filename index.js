const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const objectId = require("mongodb").ObjectId;
const app = express();
const cors = require("cors");
require("dotenv").config();

const port = process.env.port || 5000;

// MiddleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.S3_BUCKET}:${process.env.SECRET_KEY}@cluster0.slr2lcz.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
// console.log(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db("NextGear_Bikes");
    const productsCollection = database.collection("products");
    const ordersCollection = database.collection("orders");
    const reviewCollection = database.collection("reviews");

    // GET Products API
    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    // Get REviews API from database
    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get Orders API from database
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const cursor = await ordersCollection.find({ email: email });
      const order = await cursor.toArray();
      res.send(order);
    });

    // Delete Api for Cancel Users orders
    app.delete("/orders:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    // POST(send) Orders API from database
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.json(result);
    });

    // Post Review API from database
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello NextGear Bikes!");
});

app.listen(port, () => {
  console.log(`NextGear Bike  listening on port ${port}`);
});
