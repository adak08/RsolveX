import { classifyComplaintWithAI } from './BACKEND/src/utils/aiClassifier.js';
import dotenv from 'dotenv';
dotenv.config({ path: './BACKEND/.env' });

(async () => {
    console.log("Testing AI Classifier...");
    const res = await classifyComplaintWithAI("Big fire", "There is a fire in the building", "fire");
    console.log(res);
})();
