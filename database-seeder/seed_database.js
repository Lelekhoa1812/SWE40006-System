// This script is used to seed the MongoDB Atlas database with mock data for the Medical Messenger project.
// To run: node seed_database.js

const { MongoClient, ObjectId } = require('mongodb');

// --- Configuration ---
const uri = "mongodb+srv://medical-messenger-dev-user:MedicalMessenger@medicalmessengerdev.zgksfb6.mongodb.net/?retryWrites=true&w=majority&appName=MedicalMessengerDev";
const dbName = 'medical-messenger-db';

const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log("Successfully connected to MongoDB Atlas.");

        const db = client.db(dbName);

        console.log("Dropping existing collections for a clean seed...");
        await db.collection('messages').drop().catch(e => console.log("messages collection didn't exist, skipping drop."));
        await db.collection('subscriptions').drop().catch(e => console.log("subscriptions collection didn't exist, skipping drop."));
        await db.collection('doctors').drop().catch(e => console.log("doctors collection didn't exist, skipping drop."));
        await db.collection('users').drop().catch(e => console.log("users collection didn't exist, skipping drop."));

        const drCarterUserId = new ObjectId();
        const drBenstoneUserId = new ObjectId();
        const alicePatientId = new ObjectId();
        const bobPatientId = new ObjectId();
        const charliePatientId = new ObjectId();

        const users = [
            { _id: drCarterUserId, email: "emily.carter@health.dev", password_hash: "$2b$10$...", role: "doctor", createdAt: new Date() },
            { _id: drBenstoneUserId, email: "dr.benstone@health.dev", password_hash: "$2b$10$...", role: "doctor", createdAt: new Date() },
            { _id: alicePatientId, email: "alice@example.com", password_hash: "$2b$10$...", role: "patient", createdAt: new Date() },
            { _id: bobPatientId, email: "bob@example.com", password_hash: "$2b$10$...", role: "patient", createdAt: new Date() },
            { _id: charliePatientId, email: "charlie@example.com", password_hash: "$2b$10$...", role: "patient", createdAt: new Date() }
        ];

        const doctors = [
            { user_id: drCarterUserId, full_name: "Dr. Emily Carter", specialties: ["Psychology"], bio: "Specializing in cognitive behavioral therapy.", status: "active" },
            { user_id: drBenstoneUserId, full_name: "Dr. Benstone", specialties: ["Otorhinolaryngology", "General Practice"], bio: "Expert in ear, nose, and throat conditions.", status: "active" }
        ];

        const subscriptions = [
            { patient_id: alicePatientId, doctor_id: drCarterUserId, status: "approved", createdAt: new Date() },
            { patient_id: bobPatientId, doctor_id: drCarterUserId, status: "requested", createdAt: new Date() },
            { patient_id: charliePatientId, doctor_id: drBenstoneUserId, status: "approved", createdAt: new Date() },
            { patient_id: alicePatientId, doctor_id: drBenstoneUserId, status: "denied", createdAt: new Date() }
        ];

        console.log("Inserting data...");
        await db.collection('users').insertMany(users);
        await db.collection('doctors').insertMany(doctors);
        await db.collection('subscriptions').insertMany(subscriptions);

        const approvedSub = await db.collection('subscriptions').findOne({ patient_id: alicePatientId, doctor_id: drCarterUserId, status: "approved" });

        if (approvedSub) {
            const messages = [
                { from_user_id: alicePatientId, to_user_id: drCarterUserId, subscription_id: approvedSub._id, body: "Hi Dr. Carter, I'd like to book an appointment.", createdAt: new Date() },
                { from_user_id: drCarterUserId, to_user_id: alicePatientId, subscription_id: approvedSub._id, body: "Hello Alice, of course. My receptionist will be in touch shortly.", createdAt: new Date() }
            ];
            await db.collection('messages').insertMany(messages);
        }

        console.log("Database seeding completed successfully!");

    } finally {
        await client.close();
    }
}

run().catch(console.dir);