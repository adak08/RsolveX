//Mongodb connection string
export const MONGODB_URI=process.env.MONGODB_URI;

//Port for server
export const PORT = process.env.PORT||3000;
export const DB_NAME=process.env.DB_NAME;

export const COMPLAINT_CATEGORIES = ["road", "water", "electricity", "sanitation", "other"];

export const STAFF_AVAILABILITY_STATUSES = ["available", "busy", "offline", "on-leave"];