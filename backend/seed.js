// node seed.js  — seeds platform owner + one demo company + sample products
const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const User    = require('./models/User');
const Tenant  = require('./models/Tenant');
const Product = require('./models/Product');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  await User.deleteMany();
  await Tenant.deleteMany();
  await Product.deleteMany();
  console.log('🗑️  Cleared existing data');

  // 1. Platform owner (no tenantId)
  const platformOwner = await User.create({
    tenantId: null,
    fullName: 'StockIQ Admin',
    username: 'superadmin',
    email:    'superadmin@stockiq.com',
    password: 'super123',
    role:     'platform_owner',
    permissions: ['*'],
  });
  console.log('👑 Platform owner → username: superadmin | password: super123');

  // 2. Demo company tenant
  const tenant = new Tenant({
    companyName:  'Gyan Enterprises',
    ownerName:    'Gyan Singh',
    email:        'gyan@gyanenterprises.com',
    phone:        '9876543210',
    businessType: 'Retail',
    plan:         'pro',
  });
  tenant.applyPlanLimits();
  await tenant.save();
  console.log(`🏢 Demo company created: ${tenant.companyName} (ID: ${tenant._id})`);

  // 3. Company owner
  const companyOwner = await User.create({
    tenantId:  tenant._id,
    fullName:  'Gyan Singh',
    username:  'gyanadmin',
    email:     'gyan@gyanenterprises.com',
    password:  'gyan123',
    role:      'company_owner',
  });
  console.log('👤 Company owner → username: gyanadmin | password: gyan123');

  // 4. Staff user
  const staffUser = await User.create({
    tenantId:  tenant._id,
    fullName:  'Rahul Kumar',
    username:  'rahul',
    email:     'rahul@gyanenterprises.com',
    password:  'rahul123',
    role:      'staff',
    createdBy: companyOwner._id,
  });
  console.log('👥 Staff user → username: rahul | password: rahul123');

  // 5. Sample products for demo company
  // const products = [
  //   { name: 'Samsung 55" QLED TV',     quantity: 25,  category: 'Electronics', price: 45000, description: '4K Smart TV' },
  //   { name: 'Apple iPhone 15',          quantity: 8,   category: 'Electronics', price: 79999, description: 'Latest iPhone' },
  //   { name: 'Sony Headphones WH-1000',  quantity: 0,   category: 'Electronics', price: 12999, description: 'Noise cancelling' },
  //   { name: 'Nike Air Max',             quantity: 42,  category: 'Sports',      price: 8999,  description: 'Running shoes' },
  //   { name: "Levi's 501 Jeans",         quantity: 6,   category: 'Clothing',    price: 2999,  description: 'Classic fit' },
  //   { name: 'Basmati Rice 5kg',         quantity: 150, category: 'Food',        price: 450,   description: 'Premium quality' },
  //   { name: 'Wooden Study Desk',        quantity: 12,  category: 'Furniture',   price: 6500,  description: 'Oak finish' },
  //   { name: 'React JS Handbook',        quantity: 3,   category: 'Books',       price: 599,   description: 'For beginners' },
  //   { name: 'Yoga Mat Premium',         quantity: 30,  category: 'Sports',      price: 1299,  description: '6mm thickness' },
  //   { name: 'Winter Jacket',            quantity: 0,   category: 'Clothing',    price: 3499,  description: 'Water resistant' },
  // ];

  // await Product.insertMany(products.map(p => ({ ...p, tenantId: tenant._id, createdBy: companyOwner._id })));
  // console.log('📦 10 sample products added');

  console.log('\n✅ Seed complete!\n');
  console.log('─────────────────────────────────────────────');
  console.log('  PLATFORM OWNER:  superadmin / super123');
  console.log('  COMPANY ADMIN:   gyanadmin  / gyan123');
  console.log('  STAFF:           rahul      / rahul123');
  console.log('─────────────────────────────────────────────\n');
  process.exit(0);
};

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
