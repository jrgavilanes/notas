const express = require('express')
const port = 5000

const app = express()
app.use(express.urlencoded({extended: false}));
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Hello Worldsa!')
})

app.post('/mandanga', (req,res)=>{
console.log(req.body);
req.body.id='nabo';
res.status(201).json(req.body);

});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})