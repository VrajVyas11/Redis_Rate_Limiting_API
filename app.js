import express from "express";
import { getProductDetails, productpromise } from "./api/products.js";
import { getCashedData, rateLimiter } from "./middleware/redis.js";
import { redis } from "./Redis/redisClient.js";

const app = express();



redis.on("connect", () => {
    console.log("Redis connected");
});


// Serve the API Rate Limiting Test Interface HTML
app.get("/", rateLimiter({ limit: 30, timer: 300, keys: "home" }), (req, res) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Rate Limiting Test Interface</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #f06, #a8e063);
                color: #333;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            h1 {
                margin-bottom: 20px;
            }
.upperButtons {
    background: linear-gradient(135deg, #6a11cb, #2575fc); /* Smooth blue gradient with a darker shade for contrast */
    border: none;
    color: white;
    padding: 12px 24px; 
    text-align: center;
    text-decoration: none;
    font-size: 16px; 
    margin: 10px;
    cursor: pointer;
    border-radius: 12px; 
    transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2); 
    border: 2px solid rgba(0,0,0,0.1); 
}

.upperButtons:hover {
    background: linear-gradient(135deg, #0033cc, #4a90e2); /* Reversed gradient on hover for a dynamic effect */
    transform: scale(1.05); /* Slight scale up on hover for emphasis */
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3); /* Enhanced shadow on hover for depth */
}


.button  {
    background: linear-gradient(135deg, #6a11cb, #2575fc); /* Smooth blue gradient */
    border: none;
    color: white;
    width:90%;
    padding: 15px 30px;
    text-align: center;
    text-decoration: none;
    font-size: 18px; /* Slightly larger font for better readability */
    margin: 10px;
    cursor: pointer;
    border-radius: 10px; /* More rounded for a modern look */
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Added shadow for depth */
}

.button:hover {
    transform: scale(1.05); /* Slightly smaller scale for a subtle effect */
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3); /* Deeper shadow on hover */
}

                        .output.loading{
            border: 4px solid rgba(0,0,0,0.1);
            border-left: 4px solid #333;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
                      .output.loading {
            display: flex;
            justify-content: center;
            align-items: center;
        }
            .output {
                margin-top: 20px;
                padding: 20px;
                background: #fff;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                width: 80%;
                max-width: 600px;
                text-align: left;
                white-space: pre-wrap;
                max-height: 400px;
                overflow-y: auto;
            }
            .input-group {
                margin-top: 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
.input-group input {
    padding: 15px;
    font-size: 18px;
width:80%;
    border-radius: 12px;
    border: 1px solid #ddd;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    text-align: center;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.main {
    background: rgba(255, 255, 255, 0.5); /* Semi-transparent background */
    backdrop-filter: blur(10px); /* Apply blur effect */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Enhanced shadow for more depth */
    color: #333; /* Darker text color for readability */
    width: fit-content;
    height: fit-content;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center; /* Center content horizontally */
    padding: 20px; /* Add padding for spacing */
    border-radius: 12px; /* Rounded corners for a modern look */
}

.container {
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* Two columns of equal width */
    gap: 20px; /* Adjust the space between items */
    width: 100%;
    max-width: 1200px;
    padding: 0 20px;
}

.header{
font-size:50px;
}

        </style>
    </head>
    <body>
    <div class="main">
        <h1 class="header">Redis API Rate Limiting Test Interface</h1>
<div class="container">

        <button class="upperButtons" onclick="homepage('/')">Refresh Home</button>
<button class="upperButtons" onclick="testApi('/products')">Get Products</button>

        <div class="input-group">
            <input type="number" id="productIdDetails" placeholder="Enter Product ID for Details" min="1">
            <button class="button" onclick="fetchProductDetails()">Get Product Details</button>
        </div>

        <div class="input-group">
            <input type="number" id="productIdOrder" placeholder="Enter Product ID for Order" min="1">
            <button class="button" onclick="placeOrder()">Place Order</button>
        </div>
</div>
        <div class="output" id="output"></div>

        <script>
        async function homepage(url) {
                try {
                document.getElementById('output').innerText = "";
                output.classList.add('loading');
                                    const response = await fetch(url);
                    output.classList.remove('loading');
                        document.getElementById('output').innerText = "Welcome to home page...This also has rate limiting implemented on it";
                        return
                } catch (error) {
                    document.getElementById('output').innerText = 'Error: ' + error.message + '\\n\\n';
                }
            }
            async function testApi(url) {
                try {
                document.getElementById('output').innerText = "";
                output.classList.add('loading');
                    const response = await fetch(url);
                    const data = await response.json();
                    output.classList.remove('loading');
                    if (data.status === 429) {
                        document.getElementById('output').innerText = \`\${data.message}\`;
                        return;
                    }
                    document.getElementById('output').innerText = JSON.stringify(data, null, 2) + '\\n\\n';
                } catch (error) {
                    document.getElementById('output').innerText = 'Error: ' + error.message + '\\n\\n';
                }
            }

            async function fetchProductDetails() {
                const productId = document.getElementById('productIdDetails').value;
                if (!productId) {
                    alert('Please enter a product ID');
                    return;
                }
                try {
                document.getElementById('output').innerText = "";
                output.classList.add('loading');
                const response = await fetch(\`/product/\${productId}\`);
                const data = await response.json();
                output.classList.remove('loading');
                    if (data.status === 429) {
                        document.getElementById('output').innerText = \`\${data.message}\`;
                        return;
                    }
                    document.getElementById('output').innerText = JSON.stringify(data, null, 2) + '\\n\\n';
                } catch (error) {
                    document.getElementById('output').innerText = 'Error: ' + error.message + '\\n\\n';
                }
            }

            async function placeOrder() {
                const productId = document.getElementById('productIdOrder').value;
                if (!productId) {
                    alert('Please enter a product ID');
                    return;
                }
                try {
                document.getElementById('output').innerText = "";
                output.classList.add('loading');
                    const response = await fetch(\`/order/\${productId}\`);
                  const data = await response.json();
                  output.classList.remove('loading');
                    if (data.status === 429) {
                        document.getElementById('output').innerText = \`\${data.message}\`;
                        return;
                    }
                    document.getElementById('output').innerText = JSON.stringify(data, null, 2) + '\\n\\n';
                } catch (error) {
                    document.getElementById('output').innerText = 'Error: ' + error.message + '\\n\\n';
                }
            }
        </script>
        </div>
    </body>
    </html>
    `;
    res.send(htmlContent);
});

app.get("/products", rateLimiter({ limit: 5, timer: 20, keys: "products" }), getCashedData("products"), async (req, res) => {
    let products = await productpromise();
    console.log("No cached data, fetching new products.");
    await redis.setex("products", 20, JSON.stringify(products));
    res.json({ products });
});

app.get("/product/:id", rateLimiter({ limit: 5, timer: 20, keys: "product" }), async (req, res) => {
    const id = req.params.id;
    const key = `product:${id}`;
    let product = await redis.get(key);

    if (product) {
        product = JSON.parse(product);
    } else {
        product = await getProductDetails(id);
        await redis.setex(key, 20, JSON.stringify(product));
    }

    res.json({ product });
});

app.get("/order/:id", rateLimiter({ limit: 5, timer: 20, keys: "order" }), async (req, res) => {
    const productID = req.params.id;
    const key = `product:${productID}`;

    // Deleting cached memory after placing the order
    await redis.del(key);

    res.json({
        message: `Order placed successfully, product ID: ${productID} is ordered.`
    });
});

app.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});
