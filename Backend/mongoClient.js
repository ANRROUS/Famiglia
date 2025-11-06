import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://Luna:452NITi27J$i@famiglia.19qcnvr.mongodb.net/FamigliaDB?retryWrites=true&w=majority&appName=Famiglia");
        console.log("Conexión a MongoDB exitosa");          
    } catch (error) {
        console.error("Error de conexión a MongoDB:", error);
    }
};
