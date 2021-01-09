# Ejemplo básico nodejs

```node
const express = require('express')
const port = 3000

const app = express()
app.use(express.urlencoded({extended: false}));
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/mandanga', (req,res)=>{
console.log(req.body);
req.body.id='nabo';
res.status(201).json(req.body);

});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

```
