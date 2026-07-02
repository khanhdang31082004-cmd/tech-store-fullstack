const fs = require('fs');

const sqlContent = fs.readFileSync('clean_products.sql', 'utf8');
const lines = sqlContent.split('\n');

let currentCategoryId = 1;
let currentStoreId = 1;

let productsToInsert = [];
let currentProduct = null;

for (let line of lines) {
  if (line.includes('-- LAPTOP')) currentCategoryId = 1;
  else if (line.includes('-- ĐIỆN THOẠI')) currentCategoryId = 2;
  else if (line.includes('-- PLAYSTATION')) currentCategoryId = 3;
  else if (line.includes('-- BÀN PHÍM CƠ')) currentCategoryId = 4;
  else if (line.includes('-- CHUỘT GAMING')) currentCategoryId = 5;
  else if (line.includes('-- MÀN HÌNH')) currentCategoryId = 6;
  else if (line.includes('-- TAI NGHE')) currentCategoryId = 7;
  else if (line.includes('-- SSD')) currentCategoryId = 8;
  else if (line.includes('-- PHỤ KIỆN MÁY TÍNH')) currentCategoryId = 9;

  if (line.startsWith('UPDATE products SET')) {
    currentProduct = { category_id: currentCategoryId };
  } else if (currentProduct) {
    if (line.includes("product_name = '")) {
      currentProduct.product_name = line.split("product_name = '")[1].split("',")[0];
    } else if (line.includes("description  = '")) {
      currentProduct.description = line.split("description  = '")[1].split("',")[0];
    } else if (line.includes("image_url    = '")) {
      currentProduct.image_url = line.split("image_url    = '")[1].split("'")[0];
    } else if (line.startsWith('WHERE id = ')) {
      currentProduct.id = parseInt(line.split('WHERE id = ')[1].split(';')[0]);
      productsToInsert.push(currentProduct);
      currentProduct = null;
    }
  }
}

let sqlOutput = `INSERT IGNORE INTO products (id, product_name, description, price, image_url, stock_quantity, category_id, store_id) VALUES\n`;

const values = productsToInsert.map(p => {
  // Give them a random price and stock since clean_products doesn't have it
  // price between 1,000,000 and 20,000,000
  const price = Math.floor(Math.random() * 20 + 1) * 1000000;
  const stock = Math.floor(Math.random() * 50) + 10;
  // Alternating store id 1 and 2
  const storeId = p.id % 2 === 0 ? 2 : 1;
  return `(${p.id}, '${p.product_name.replace(/'/g, "''")}', '${p.description.replace(/'/g, "''")}', ${price}, '${p.image_url}', ${stock}, ${p.category_id}, ${storeId})`;
});

sqlOutput += values.join(',\n') + ';\n';
// also delete duplicates and garbage again just in case
sqlOutput += `
DELETE p1 FROM products p1
INNER JOIN products p2 
WHERE p1.product_name = p2.product_name AND p1.id < p2.id;

DELETE FROM products 
WHERE LENGTH(product_name) < 5 
   OR image_url IS NULL 
   OR image_url = ''
   OR image_url NOT LIKE 'http%';
`;

fs.writeFileSync('do_restore.sql', sqlOutput);
console.log('Created do_restore.sql with ' + productsToInsert.length + ' products');
