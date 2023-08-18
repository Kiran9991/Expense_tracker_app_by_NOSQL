const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
dotenv.config({ path: '.env'});

const db = require('./util/database');
const userRoutes = require('./Routes/user');
const expenseRoutes = require('./Routes/expense');
const premiumRoutes = require('./Routes/premium');
const purchaseRoutes = require('./Routes/purchase');
const resetPasswordRoutes = require('./Routes/resetpassword');

app.use(cors());
app.use(bodyParser.json({ extended: false }));
app.use(express.json());

app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumRoutes);
app.use('/password', resetPasswordRoutes);

db().then(() => {
    app.listen(3000, () => {
        console.log('Server is listening on port 3000')
    })
}).catch(err => {
    console.log(err)
})



