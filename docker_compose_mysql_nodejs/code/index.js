const express = require('express')
const jwt = require('jsonwebtoken');

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

// body-parser killer ;-)
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(express.static('public'));



const verificarAuth = (req, res, next) => {
    
  const token = req.headers.token || req.query.token

  jwt.verify(token, 'secretito', (err, decoded) => {

      if(err) {
          return res.status(401).json({
              mensaje: 'Error de token',
              err
          })
      }

      // Creamos una nueva propiedad con la info del usuario
      req.usuario = decoded.data; //data viene al generar el token en login.js
      next();

  });

}


app.get('/', async (req, res) => {
  // res.send('Hello Worldsa11!')
  // db.schema.raw('select email from usuarios').then(data=>console.log(data.rows));
  // const usuarios = await db.schema.raw('select email,password from usuarios where id = 1');
  const usuarios = await db.select('email','password').from('usuarios').where({id:2});
  
  if (usuarios.length) {
    const {email, password} = usuarios[0];
    return res.json({email,password});    
  }
  res.status(404).json({msg: 'Registro no encontrado'});

});

app.post('/login', async (req,res)=>{

  
  // req.body.colega = 'juanra';
  // console.log("pues", req.body)
  // res.json(req.body);

  let user = {userid: 123456, email: req.body.email};
  let token = jwt.sign({data: user}, 'secretito', {expiresIn: 3600})
  return res.json({
      user,
      token
  })

});



app.get('/privado', verificarAuth, async (req,res)=>{

  res.json({msg: 'mensaje privado ok'});

});

app.post('/mandanga', (req,res)=>{
console.log(req.body);
req.body.id='miide';
res.status(201).json(req.body);

});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})