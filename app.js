import express from 'express';
import { getDbData, authCheck } from './firebaseFunctions.js'
import { getFeedData, SSE } from './routes.js'

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


app.get('/getData', authCheck, getFeedData);


app.get('/stream-devices', authCheck, SSE);




app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
