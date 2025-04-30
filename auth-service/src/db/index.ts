import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

const connectDB = async () => {
    try {
        const instance = await mongoose.connect(`${process.env.MONGO_URI!}/${process.env.DB_NAME}`)
        console.error("MongoDB connected:", instance.connection.host);
    } catch (error) {
        console.log("MongoDB connection error(catch): ", error);
        process.exit(1);
    }
}
export default connectDB;