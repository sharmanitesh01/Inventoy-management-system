// Run this ONCE to set up your database with sample data
// Command: node seed.js

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const Admin    = require('./models/Admin');
const Product  = require('./models/Product');

dotenv.config();

const sampleProducts = [
  { name: 'Samsung 55" QLED TV',    quantity: 25, category: 'Electronics', price: 45000, description: '4K Smart TV' },
  { name: 'Apple iPhone 15',        quantity: 8,  category: 'Electronics', price: 79999, description: 'Latest iPhone' },
  { name: 'Sony Headphones WH-1000',quantity: 0,  category: 'Electronics', price: 12999, description: 'Noise cancelling' },
  { name: 'Nike Air Max Shoes',     quantity: 42, category: 'Sports',      price: 8999,  description: 'Running shoes' },
  { name: 'Levi\'s 501 Jeans',     quantity: 6,  category: 'Clothing',    price: 2999,  description: 'Classic fit' },
  { name: 'Basmati Rice 5kg',       quantity: 150,category: 'Food',        price: 450,   description: 'Premium quality' },
  { name: 'Wooden Study Desk',      quantity: 12, category: 'Furniture',   price: 6500,  description: 'Oak finish' },
  { name: 'React JS Handbook',      quantity: 3,  category: 'Books',       price: 599,   description: 'For beginners' },
  { name: 'Yoga Mat Premium',       quantity: 30, category: 'Sports',      price: 1299,  description: '6mm thickness' },
  { name: 'Winter Jacket',          quantity: 0,  category: 'Clothing',    price: 3499,  description: 'Water resistant' },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(' Connected to MongoDB');

  // Clear existing data
  await Admin.deleteMany();
  await Product.deleteMany();
  console.log('  Cleared old data');

  // Create admin (password will be hashed by model)
  await Admin.create({ username: 'admin', password: 'admin123', email: 'admin@stockiq.com' });
  console.log(' Admin created → username: admin | password: admin123');

  // Create sample products
  await Product.insertMany(sampleProducts);
  console.log(' 10 sample products added');

  console.log('\n Seed complete! You can now start the server.');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
