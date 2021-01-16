const express = require('express')
const port = 5000

const db = require('knex')({
  client: 'mysql',
  connection: {
      host : process.env.DB_HOST,
      user : process.env.DB_USER,
      password : process.env.DB_PASSWORD,
      database : process.env.DB_DATABASE
  }
});

const app = express()
app.use(express.urlencoded({extended: false}));
app.use(express.json());


app.get('/', async (req, res) => {
  // res.send('Hello Worldsa11!')
  // db.schema.raw('select email from usuarios').then(data=>console.log(data.rows));
  // const usuarios = await db.schema.raw('select email,password from usuarios where id = 1');
  const usuarios = await db.select('email','password').from('usuarios').where({id:99});
  
  if (usuarios.length) {
    const {email, password} = usuarios[0];
    return res.json({email,password});    
  }
  res.status(404).json({msg: 'Registro no encontrado'})

  
})

app.post('/mandanga', (req,res)=>{
console.log(req.body);
req.body.id='nabo';
res.status(201).json(req.body);

});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})