import mongoose from "mongoose";

const connectDB = async ()=>{
    try {
        mongoose.connection.on('connected', ()=> console.log("Database Connected"));

        const rawUri = process.env.MONGODB_URI?.trim();
        if(!rawUri) throw new Error("MONGODB_URI is required")

        const uriWithoutQuery = rawUri.split('?')[0];
        const hasDatabaseName = /\/[^/]+$/.test(uriWithoutQuery);
        const mongoUri = hasDatabaseName ? rawUri : `${rawUri.replace(/\/$/, '')}/car-resale`;

        await mongoose.connect(mongoUri)
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}

export default connectDB;
