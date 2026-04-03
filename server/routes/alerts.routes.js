const express = require('express');
const Alert = require('../models/Alert');
const auth = require('../middleware/authMiddleware');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
    try {
        const alerts = await Alert.find({ user: req.user.id }).sort({ timestamp: -1 }).limit(10);
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching alerts' });
    }
});

module.exports = router;
