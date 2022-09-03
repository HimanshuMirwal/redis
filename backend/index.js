const express = require("express");
const axios = require("axios");
const cors = require("cors");
const Redis = require("redis");
const app = express()
app.use(express.json())
app.use(cors())
const client = Redis.createClient(6379, "127.0.0.1");
client.connect();
client.on("connect", (err) => {
    console.log("redis connected.")
})
app.get("/", async (req, res) => {
    const data = await getorsetdata("products","https://fakestoreapi.com/products");
    res.json(data);
})
app.get("/:id", async (req, res) => {
    console.log(req.params.id);
    const id =req.params.id;
    const data = await getorsetdata(`products:${id}`,`https://fakestoreapi.com/products/${id}`);
    res.json(data);
})

async function getorsetdata(key, url){
    try {
        const products = await client.get(key);
        if (products) {
            console.log("data is send from cache --------->")
            return (JSON.parse(products))
        } else {
            console.log("we are in else block data will be send from databse-------------->")
            try {
                const { data } = await axios.get(url)
                console.log(data);
                client.setEx(key,60, JSON.stringify(data))
                return data; 
            } catch (error) {
                return error;
            }
        }
    } catch (error) {
        console.log("Error in get and set frunction from index.js"+error)
    }
}

app.listen(5000, (error) => {
    if (!error) {
        console.log("server is on 5000")
        return
    }
    console.log(error)
})