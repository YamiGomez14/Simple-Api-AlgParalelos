const app = require ('express')();
var bodyParser=require('body-parser')
const mongoose=require('mongoose')
const cluster = require('node:cluster');
const totalCPUs = require('node:os').cpus().length;
const process = require('node:process');

if (cluster.isMaster) {
    console.log(`Numeros de CPU ${totalCPUs}`);
    console.log(`Principal ${process.pid} corre`);
  
    // Fork workers.
    for (let i = 0; i < totalCPUs; i++) {
      cluster.fork();
    }
  
    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} muerto`);
      cluster.fork();
    });
  
  } else {
    Inicio();
  }

function Inicio() {
mongoose.connect('mongodb://localhost:27017/dog_api',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

const db=mongoose.connection
db.on('error',console.error.bind(console, 'Error de conexion'));

const dogSchema= new mongoose.Schema({

  name: String,
  breed:String,
  age: Number
  
})

const Dog= mongoose.model('Dog',dogSchema)
const PORT=3000;

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

// Array 



app.get("/", (req,res)=>{

  Dog.find(req.params.id,(err,dogs)=>{
    res.json(dogs)
  })

})

app.get("/dogs/:id", (req,res)=>{
    Dog.findById(req.params.id,(err,dogs)=>{
      res.json(dogs)
    })
    //res.json(Personas[parseInt(req.params.id)-1])
  
  })

  app.post("/dogs",(req,res)=>{
    const dog= new Dog({
        name:req.body.name,
        breed:req.body.breed,
        age:req.body.age
    })
    dog.save((err)=>{
        res.json(dog)
    })
  })
  //Actualizar
  app.put("/dogs/:id",(req,res)=>{
  
    const update=req.body
    Dog.findByIdAndUpdate(req.params.id,req.body,(err)=>{
        res.json({message:"actualizando"})
    })
    
  })

  app.delete("/dogs/:id",(req,res)=>{

    Dog.findByIdAndDelete(req.params.id,req.body,(err)=>{
        res.json({message:"Eliminado"})
    })

  })


app.listen(

    PORT,
    ()=> console.log(`Esta corriendo en el puerto ${PORT}`)

)
}