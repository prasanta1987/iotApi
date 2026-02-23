import express from 'express';
import { authCheck } from './helperFunctions/firebaseFunctions.js'
import { getFeedData, setFeedData, SSE } from './routes/fireBaseRoutes.js'
import { multipleSpotData, singleSpotData } from './routes/stockDataRoute.js'

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


// Firebase Routs
app.post('/liveData', authCheck, SSE);
app.get('/getData', authCheck, getFeedData);
// app.get('/setData', authCheck, setFeedData);


// Money Control Routes
app.get('/spots', multipleSpotData);
app.get('/spot', singleSpotData);



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
