import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Conexión a MongoDB exitosa");          
    } catch (error) {
        console.error("Error de conexión a MongoDB:", error);
    }
};
