// Run this ONCE to set up your database with sample data
// Command: node seed.js  (from inside the backend/ folder)

const dotenv   = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Admin    = require('./models/Admin');
const Product  = require('./models/Product');

dotenv.config();

const sampleProducts = [
  { name: 'Samsung 55" QLED TV',      quantity: 25, category: 'Electronics', price: 45000,  description: '4K Smart TV' },
  { name: 'Apple iPhone 15',           quantity: 8,  category: 'Electronics', price: 79999,  description: 'Latest iPhone' },
  { name: 'Sony Headphones WH-1000',   quantity: 0,  category: 'Electronics', price: 12999,  description: 'Noise cancelling' },
  { name: 'Nike Air Max Shoes',         quantity: 42, category: 'Sports',      price: 8999,   description: 'Running shoes' },
  { name: "Levi's 501 Jeans",          quantity: 6,  category: 'Clothing',    price: 2999,   description: 'Classic fit' },
  { name: 'Basmati Rice 5kg',          quantity: 150,category: 'Food',        price: 450,    description: 'Premium quality' },
  { name: 'Wooden Study Desk',         quantity: 12, category: 'Furniture',   price: 6500,   description: 'Oak finish' },
  { name: 'React JS Handbook',         quantity: 3,  category: 'Books',       price: 599,    description: 'For beginners' },
  { name: 'Yoga Mat Premium',          quantity: 30, category: 'Sports',      price: 1299,   description: '6mm thickness' },
  { name: 'Winter Jacket',             quantity: 0,  category: 'Clothing',    price: 3499,   description: 'Water resistant' },
];

const seed = async () => {
  try {
    await connectDB();

    await Admin.deleteMany();
    await Product.deleteMany();
    console.log('🗑️  Old data removed');

    // Password gets auto-hashed by Admin model pre-save hook
    await Admin.create({
      username: 'admin',
      password: 'admin123',
      email:    'admin@stockiq.com',
    });
    console.log('👤 Admin created  →  username: admin  |  password: admin123');

    await Product.insertMany(sampleProducts);
    console.log('📦 10 sample products inserted');

    console.log('\n✅ Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seed();
