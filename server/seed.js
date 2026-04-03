const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ResourceData = require('./models/ResourceData');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Seed admin user
        const adminEmail = 'admin@smartcity.edu';
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({ email: adminEmail, password: hashedPassword, role: 'admin' });
            console.log('Created admin user: admin@smartcity.edu / admin123');
        }

        // Seed historical data
        const types = ['electricity', 'water', 'wifi', 'waste'];
        const baseValues = { electricity: 120, water: 300, wifi: 50, waste: 40 };
        const departments = ['Hostel A', 'Hostel B', 'Main Block', 'Library'];
        
        // Only seed if empty to prevent duplicating on multiple runs
        const count = await ResourceData.estimatedDocumentCount();
        if (count > 0) {
            console.log(`Database already has ${count} records. Skipping data generation.`);
             return;
        }

        const dataArray = [];
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        for (let i = 30; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            for (const type of types) {
                for (const dept of departments) {
                   const variation = Math.random() * 0.2 - 0.1; // +/- 10%
                   let value = baseValues[type] * (1 + variation);
                   
                   if (date.getDate() < 5) value *= 1.15;

                   dataArray.push({
                        type,
                        value: Math.round(value * 100) / 100,
                        date,
                        department: dept
                   });
                }
            }
        }
        
        await ResourceData.insertMany(dataArray);
        console.log('Seeded historical data successfully. Count:', dataArray.length);

    } catch (error) {
        console.error('Error seeding data', error);
    } finally {
        mongoose.connection.close();
    }
};

seedData();
