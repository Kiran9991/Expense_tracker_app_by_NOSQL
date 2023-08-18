const User = require('../models/users');
const sequelize = require('../util/database');

const userLeaderBoard = async(req, res) => {
    const t = await sequelize.transaction();
    try {
        const leaderboardofusers = await User.findAll({
            
            order: [['totalExpenses', 'DESC']]
        },{transaction:t});
        await t.commit();
        res.status(200).json(leaderboardofusers)
    }catch(err) {
        t.rollback();
        console.log(err)
        res.status(500).json(err)
    }
}

module.exports = {
    userLeaderBoard
}