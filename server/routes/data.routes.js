const express = require('express');
const axios = require('axios');
const ResourceData = require('../models/ResourceData');
const Alert = require('../models/Alert');
const auth = require('../middleware/authMiddleware');

const router = express.Router();
router.use(auth);

// Helper for consistency
const getDateString = (dateObj) => dateObj.toISOString().split('T')[0];

router.get('/dashboard/summary', async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await ResourceData.find({ user: userId }).sort({ date: 1, startTime: 1 });
        
        // Define timelines
        const today = getDateString(new Date());
        const past7Days = [];
        const prev7Days = [];
        
        for(let i=0; i<7; i++){
             let d = new Date();
             d.setDate(d.getDate() - i);
             past7Days.push(getDateString(d));
        }
        for(let i=7; i<14; i++){
             let d = new Date();
             d.setDate(d.getDate() - i);
             prev7Days.push(getDateString(d));
        }

        const currentDay = {};
        const weekly = {};
        const activeTypes = new Set();
        const fullData = { electricity: [], water: [], wifi: [], waste: [] };

        ['electricity', 'water', 'wifi', 'waste'].forEach(type => {
             const typeData = data.filter(d => d.type === type);
             if (typeData.length > 0) activeTypes.add(type);
             
             // Track full mapping
             fullData[type] = typeData;

             // Sums
             const sumToday = typeData.filter(d => d.date === today).reduce((acc, d) => acc + d.value, 0);
             const sumWeek = typeData.filter(d => past7Days.includes(d.date)).reduce((acc, d) => acc + d.value, 0);
             const sumPrevWeek = typeData.filter(d => prev7Days.includes(d.date)).reduce((acc, d) => acc + d.value, 0);

             let change = 0;
             if (sumPrevWeek > 0) {
                  change = ((sumWeek - sumPrevWeek) / sumPrevWeek) * 100;
             } else if (sumWeek > 0) {
                  change = 100; 
             }

             currentDay[type] = sumToday;
             weekly[type] = {
                  total: sumWeek,
                  change: change.toFixed(1)
             };
        });

        res.json({ 
             currentDay, 
             weekly, 
             activeTypes: Array.from(activeTypes),
             fullData 
        });
    } catch (error) {
         res.status(500).json({ message: 'Error charting dashboard.' });
    }
});

router.post('/add', async (req, res) => {
    try {
        const { type, value, department, date, isFullDay, startTime, endTime } = req.body;
        const selectedDate = date || getDateString(new Date());

        let record = await ResourceData.findOne({
            user: req.user.id,
            type,
            date: selectedDate,
            department,
            isFullDay,
            startTime: isFullDay ? null : startTime,
            endTime: isFullDay ? null : endTime
        });

        if (record) {
            record.value = value;
            await record.save();
        } else {
            record = new ResourceData({ 
                user: req.user.id, 
                type, value, department, 
                date: selectedDate, isFullDay, 
                startTime: isFullDay ? null : startTime, 
                endTime: isFullDay ? null : endTime 
            });
            await record.save();
        }

        try {
             const mlRes = await axios.post(`${process.env.ML_API_URL}/detect_anomaly`, {
                  type, value, department
             });
             if (mlRes.data && mlRes.data.anomaly) {
                  const newAlert = new Alert({
                      user: req.user.id,
                      message: `${type.toUpperCase()} usage unusually high in ${department} on ${selectedDate}. Metric hit ${value}.`,
                      level: 'critical'
                  });
                  await newAlert.save();
             }
        } catch (mlErr) {
             console.error("ML Service unreachable or error:", mlErr.message);
        }

        res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ message: 'Error adding data' });
    }
});

router.get('/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const data = await ResourceData.find({ user: req.user.id, type }).sort({ date: 1 });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data' });
    }
});

router.get('/predict/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const data = await ResourceData.find({ user: req.user.id, type }).sort({ date: 1 });
        
        // Linear regression expects consistent timeseries, aggregate by date.
        const dailyAgg = {};
        data.forEach(d => {
             if(!dailyAgg[d.date]) dailyAgg[d.date] = 0;
             dailyAgg[d.date] += d.value;
        });

        const sortedDates = Object.keys(dailyAgg).sort();
        
        if (sortedDates.length < 5) {
             return res.json({ prediction: null, message: 'Not enough daily data for prediction' });
        }

        const mlData = sortedDates.map(date => ({ value: dailyAgg[date], date }));

        const mlRes = await axios.post(`${process.env.ML_API_URL}/predict`, {
            data: mlData
        });

        res.json({ prediction: mlRes.data.prediction });
    } catch (error) {
        res.status(500).json({ message: 'Error predicting data' });
    }
});

module.exports = router;
