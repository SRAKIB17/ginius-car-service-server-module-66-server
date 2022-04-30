const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const jwt = require('jsonwebtoken');


const app = express()
const cors = require('cors');
require('dotenv').config()

// midleware
app.use(cors())
app.use(express.json())

const port = process.env.PORT || 5000;



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p2fiq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// const uri = "mongodb+srv://ginius:3uEOWtNowoE3W3bk@cluster0.p2fiq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization
    if (!authorization) {
        return res.status(401).send({ message: 'unauthorization access' })
    }
    const token = authorization.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'forbidden accesss' })
        }
        req.decoded = decoded?.email
        next()

    })
}

const run = async () => {
    try {
        await client.connect()
        const serviceCollection = client.db('giniusCar').collection('service');

        const orderCollection = client.db('giniusCar').collection('order');

        // auth related 
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            })
            res.send(accessToken)

        })
        // services api 
        //    for get service post 
        app.get('/service', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const service = await cursor.toArray()
            res.send(service)
        })

        app.get('/service/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query);
            res.send(service)

        })
        // for post method 
        app.post('/service', async (req, res) => {
            const newService = req.body
            const result = await serviceCollection.insertOne(newService)
            res.send(result)
        })
        // for delete service 
        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await serviceCollection.deleteOne(query)
            res.send(result)
        })

        // orderCollection 
        app.get('/order', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            const { email } = req.query;
            if (email === decoded) {
                const query = { email: email }
                const cursor = orderCollection.find(query)
                const orders = await cursor.toArray()
                res.send(orders)
            }
            else {
                res.status(403).send({
                    message: '403 Forbidden' })
            }

        })

        // for order 
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result)
        })

    }
    finally {
        // client.close()

    }
}
run().catch(console.dir)


app.get('/', async (req, res) => {
    res.send('YES get it')
})
app.get('/here', async(req, res)=>{
    res.send('<h1>HELLO HERO </h1>')
})

app.listen(port, () => {
    console.log('listenning   port successful')
})