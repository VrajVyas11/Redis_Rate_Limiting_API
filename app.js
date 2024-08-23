import "dotenv/config";
import express from "express";
import { getProductDetails, productpromise } from "./api/products.js";
import { getCashedData, rateLimiter } from "./middleware/redis.js";
 import { redis } from "./Redis/redisClient.js";

const app = express();

const PORT=process.env.PORT || 3000 

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
                overflow-x: hidden; /* Prevent horizontal overflow */
            }
            h1 {
                margin-bottom: 20px;
                font-size: 2.5rem; /* Responsive font size */
                text-align: center;
            }
            .upperButtons, .button {
                background: linear-gradient(135deg, #6a11cb, #2575fc);
                border: none;
                color: white;
                padding: 12px 24px;
                text-align: center;
                text-decoration: none;
                font-size: 1rem;
                margin: 10px;
                cursor: pointer;
                border-radius: 12px;
                transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
                box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
                border: 2px solid rgba(0,0,0,0.1);
                width: 100%; /* Ensure buttons fit within their container */
                max-width: 300px; /* Limit button width */
            }
            .button
            {
                height:60px
                }
            .upperButtons:hover, .button:hover {
                background: linear-gradient(135deg, #0033cc, #4a90e2);
                transform: scale(1.05);
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
            }
            .output.loading {
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
            .output {
                margin-top: 20px;
                padding: 20px;
                background: #fff;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                width: 100%;
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
                width: 100%; /* Ensure full-width input group */
                max-width: 600px; /* Limit input group width */
            }
            .input-group input {
                padding: 15px;
                font-size: 1rem;
                width: 80%;
                max-width: 400px;
                border-radius: 12px;
                border: 1px solid #ddd;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                text-align: center;
                transition: border-color 0.3s ease, box-shadow 0.3s ease;
                margin-bottom: 10px; /* Space between input and button */
            }
            .main {
                background: rgba(255, 255, 255, 0.5);
                backdrop-filter: blur(10px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                color: #333;
                width: 100%;
                max-width: 800px;
                display: flex;
                max-height:850px;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 20px;
                border-radius: 12px;
            }
            .container {
                display: grid;
                grid-template-columns: 1fr; /* Single column layout by default */
                gap: 20px;
                width: 100%;
                padding: 0 20px;
            }
            @media (min-width: 600px) {
                .container {
                    grid-template-columns: repeat(2, 1fr); /* Two columns on medium screens */
                }
            }
            @media (min-width: 900px) {
                .container {
                    grid-template-columns: repeat(4, 1fr); /* Four columns on large screens */
                }
            }
            .header {
                font-size: 2rem; /* Responsive font size */
            }
            @media (max-width: 600px) {
                .header {
                    font-size: 1.5rem; /* Smaller font size for small screens */
                }
                .input-group input, .button, .upperButtons {
                    font-size: 0.875rem; /* Smaller font size for buttons and inputs */
                }
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
