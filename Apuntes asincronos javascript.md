# Apuntes asíncronos Javascript

## Promesas

```javascript
// #1) Create a promise that resolves in 4 seconds and returns "success" string

const myPromise = new Promise((resolve, reject)=>{
  setTimeout(() => {
    try {
      resolve("success");
    } catch (error) {
      reject(error)
    }
  }, 4000);
});

// #2) Run the above promise and make it console.log "success"

myPromise.then(data=>console.log(data));


// #3) Read about Promise.resolve() and Promise.reject(). How can you make
// the above promise shorter with Promise.resolve() and console loggin "success"

const myPromise = Promise.resolve(()=>console.log("success"));

```


## Async / await
```javascript
const urls = [
    'https://jsonplaceholder.typicode.com/users',
    'https://jsonplaceholder.typicode.com/posts',
    'https://jsonplaceholder.typicode.com/albums'
]
  
async function getData(urls) {    
    
    const [usuarios, posts, albums] = await Promise.all(urls.map(reg=>fetch(reg).then(d=>d.json())))
    console.log('Flipas', usuarios, posts, albums)
    
    resultado = []
    for (let url of urls) {
        let data = await fetch(url)        
        resultado.push(await data.json())
    }
    console.log(resultado)

}

getData(urls).then(e=>console.log(e)).catch(e=>console.log('error', e))
```
