import 'dotenv/config';
import mongoose from "mongoose";
import connectDB from "./db/index.js"
import { app,server } from "./app.js";
const PORT=process.env.PORT || 3000;
connectDB()
.then(()=>{
    server.listen(process.env.PORT || 3000,()=>{
        console.log(`Server is running at port: ${process.env.PORT}`);
        console.log(`✅ Socket.IO server is running on the same port`);
    })
})
.catch((err)=>{
    console.log("MONGO db connection failed !!!",err);
    process.exit(1);
})