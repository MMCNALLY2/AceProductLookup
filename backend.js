const express = require('express');
const path = require('path');
const db = require('./db'); // SQLite database connection file
const app = express();
const port = 3000;

// Middleware to serve static files like index.html
app.use(express.static(path.join(__dirname)));

app.use(express.json()); // Middleware to parse JSON request bodies

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});



//------------------------------------------------------SEARCH API-------------------------------------------------------------------------
app.get('/api/products', (req, res) => {
  // Get the search query and categories filter from the URL parameters
  const query = req.query.query ? req.query.query.trim() : '';  // Trim to remove any leading/trailing whitespace
  const category = req.query.categories ? `%${req.query.categories}%` : '%';  // Categories filter, if provided

  // Log the incoming parameters to ensure they are as expected
  console.log(`Received request with query: '${query}' and category: '${category}'`);

  // Create the refined SQL patterns
  const searchPattern = `${query}%`;  // Matches 'query' at the start of the string
  const wordBoundaryPattern = `% ${query}%`;  // Matches 'query' at the start of any word within the string

  // Log the refined patterns to debug
  console.log(`Search Pattern: '${searchPattern}', Word Boundary Pattern: '${wordBoundaryPattern}'`);

  // Refined SQL query to search products based on name, SKU, and category
  const sql = `
    SELECT * FROM products
    WHERE (UPPER(name) LIKE UPPER(?) OR UPPER(name) LIKE UPPER(?) OR UPPER(sku) LIKE UPPER(?))
    AND (category IS NOT NULL AND category LIKE ?);
  `;

  // Execute the query with the parameters (name, SKU, categories)
  db.all(sql, [searchPattern, wordBoundaryPattern, searchPattern, category], (err, rows) => {
    if (err) {
      console.error('Error executing SQL query:', err.message);
      res.status(500).json({ error: err.message }); // Send the error back to the client
    } else {
      console.log('Products found:', rows); // Log the returned products
      res.json(rows); // Send the products back as a JSON response
    }
  });
});
//-----------------------------------------------------------------------------------------------------------------------------------------



//----------------------------------------------------CATEGORY API-------------------------------------------------------------------------
app.get('/api/categories', (req, res) => {
  const sql = `SELECT DISTINCT category FROM products WHERE category IS NOT NULL;`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error executing SQL query for categories:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      // Log the rows returned by the query
      console.log('Categories rows:', rows);

      // Map the rows to extract just the category names
      const categories = rows.map(row => row.category); // Use `row.category` to match the lowercase column name
      console.log('Categories array:', categories);

      res.json(categories); // Send categories as an array to the frontend
    }
  });
});
//-----------------------------------------------------------------------------------------------------------------------------------------



//------------------------------------------------------UPDATE API-------------------------------------------------------------------------
app.put('/api/products/:sku', (req, res) => {
  console.log(`Received PUT request for SKU: ${req.params.sku}`);
  console.log(`Received request body:`, req.body);

  const { sku } = req.params;
  const { name, category, newSku, location } = req.body;

  // If the SKU is being updated, modify the SQL to update the SKU as well.
  const sql = `UPDATE products SET name = ?, category = ?, sku = ?, location = ? WHERE sku = ?`;
  const params = [name, category, newSku || sku, location, sku];

  db.run(sql, params, function (err) {
    if (err) {
      console.error('Error updating product:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Product updated successfully', changes: this.changes });
    }
  });
});
//-----------------------------------------------------------------------------------------------------------------------------------------



// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);

});