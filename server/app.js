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

const sequelize = require('./util/database');
const userRoutes = require('./Routes/userRoutes');
const expenseRoutes = require('./Routes/expensRoutes');
const premiumRoutes = require('./Routes/premiumFeatures');
const purchaseRoutes = require('./Routes/purchase');
const resetPasswordRoutes = require('./Routes/resetpassword');

const User = require('./models/users');
const Expense = require('./models/expense');
const Order = require('./models/orders');
const forgotpassword = require('./models/forgotpassword');

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

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(forgotpassword);
forgotpassword.belongsTo(User)

sequelize.sync().then(result => {
    app.listen(4000);
}).catch(err => {
    console.log(err);
})