export const productpromise = ()=> new Promise((resolve,reject)=>{
    setTimeout(()=>{
        resolve([
            {
                id:1,
                name:"Product 1",
                price:200,
            },
            {
                id:2,
                name:"Product 2",
                price:1200,
            },
            {
                id:3,
                name:"Product 3",
                price:500,
            },
            ]
        )
    },2000)
})



export const getProductDetails = (id)=> new Promise((resolve,reject)=>{
    setTimeout(()=>{
        resolve([
            {
                id:id,
                name:`Product ${id}`,
                price:Math.floor(Math.random()*id*100),
            }
            ]
        )
    },2000)
})
