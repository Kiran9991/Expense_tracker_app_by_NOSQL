const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const helmet = require('helmet');
const morgan = require('morgan')
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: '.env'});

const mongoose = require('mongoose');
const userRoutes = require('./Routes/user');
const expenseRoutes = require('./Routes/expense');
const premiumRoutes = require('./Routes/premium');
const purchaseRoutes = require('./Routes/purchase');
const resetPasswordRoutes = require('./Routes/resetpassword');

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'), 
    { flags: 'a'}
);

app.use(helmet())
app.use(cors());
app.use(morgan('combined', { stream: accessLogStream }));
app.use(bodyParser.json({ extended: false }));
app.use(express.json());

app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumRoutes);
app.use('/password', resetPasswordRoutes);

mongoose.connect(process.env.MONGOOSE_URL)
.then(() => {
    app.listen(3000)
    console.log('Server is connected with mongoose')
})
.catch(err => console.log(err))



