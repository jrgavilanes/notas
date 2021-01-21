const express = require('express')
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');
const saltRounds = 10;

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

  const {email, password } = req.body;

  let datos = await db('usuarios').where({email,}).select('id','password','email');
  if (datos.length>0) {
    const userid = datos[0].id;
    const password_encriptado = datos[0].password;
    const email_almacenado = datos[0].email;
    console.log('llega', userid, password_encriptado);
    const valida = await bcrypt.compare(password, password_encriptado);
    if (valida && email===email_almacenado) {
      const user = {userid, email};
      let token = jwt.sign({data: user}, 'secretito', {expiresIn: 3600})
      return res.json({
        // user,
        token
      });
    } else {
      return res.status(404).json({msg: 'Usuario no válido'});
    }
  } else {
    return res.status(404).json({msg: 'Usuario no válido'});
  }
  

  // let user = {userid: 123456, email: req.body.email};
  // let token = jwt.sign({data: user}, 'secretito', {expiresIn: 3600})
  // return res.json({
  //     user,
  //     token
  // })

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



app.post('/register', async (req,res)=>{

  try {

    // console.log('llega', req.body);
    const {email, password } = req.body;

    const salt = await bcrypt.genSalt(saltRounds);
    const password_encriptado = await bcrypt.hash(password, salt);
  

    let userid = await db('usuarios').insert({email: email, password: password_encriptado});
    userid = userid[0];

    // console.log('pues', respuesta[0]);
    // res.send(respuesta)

    const user = {userid, email};
    let token = jwt.sign({data: user}, 'secretito', {expiresIn: 3600})
    return res.json({
        // user,
        token
    });

    
  } catch (error) {

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({msg:'cuenta de email ya existe'});
    }

    return res.status(400).json({msg:'No se ha podido registrar al usuario'});
    
  }

});
