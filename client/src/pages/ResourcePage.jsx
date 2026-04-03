import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Database, Save, BrainCircuit, ShieldAlert, Clock, DownloadCloud } from 'lucide-react';

const ResourcePage = ({ type: propType }) => {
    const { type: paramType } = useParams();
    const type = propType || paramType;
    
    const [data, setData] = useState([]);
    const [prediction, setPrediction] = useState(null);
    const [newValue, setNewValue] = useState('');
    const [department, setDepartment] = useState('Hostel A');
    
    const todayStr = new Date().toISOString().split('T')[0];

    const [date, setDate] = useState(todayStr);
    const [isFullDay, setIsFullDay] = useState(true);
    const [startTime, setStartTime] = useState('10:00');
    const [endTime, setEndTime] = useState('14:00');

    const [exportRange, setExportRange] = useState('weekly');
    const [customStartDate, setCustomStartDate] = useState(todayStr);
    const [customEndDate, setCustomEndDate] = useState(todayStr);

    const fetchData = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/data/${type}`);
            setData(res.data);
            
            const predRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/data/predict/${type}`);
            setPrediction(predRes.data.prediction);
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [type]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/data/add`, {
                type,
                value: Number(newValue),
                department,
                date,
                isFullDay,
                startTime: isFullDay ? null : startTime,
                endTime: isFullDay ? null : endTime
            });
            setNewValue('');
            fetchData();
        } catch (error) {
            alert('Failed to execute protocol.');
        }
    };

    const config = { unit: type === 'electricity' ? 'kWh' : type === 'water' ? 'L' : type === 'wifi' ? 'GB' : 'kg' };

    const uniqueDates = [...new Set(data.map(d => d.date))].sort();
    const uniqueDepartments = [...new Set(data.map(d => d.department))];
    
    const getEcoShade = (idx) => {
        // Use highly contrasting eco-friendly colors for clear line distinction
        const shades = ['#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6', '#ec4899'];
        return shades[idx % shades.length];
    };
                         
    const chartData = {
        labels: uniqueDates,
        datasets: uniqueDepartments.map((dept, idx) => {
            const color = getEcoShade(idx);
            return {
                label: `${dept}`,
                data: uniqueDates.map(date => {
                    const entries = data.filter(d => d.date === date && d.department === dept);
                    return entries.reduce((sum, curr) => sum + curr.value, 0);
                }),
                borderColor: color,
                backgroundColor: 'white',
                borderWidth: 2,
                tension: 0.1,
                fill: false,
                pointBackgroundColor: 'white',
                pointBorderColor: color,
                pointBorderWidth: 2
            };
        })
    };

    const handleDownloadCSV = () => {
        let filteredData = [...data];
        const today = new Date(todayStr);

        if (exportRange === 'weekly') {
            const lastWeek = new Date(today);
            lastWeek.setDate(today.getDate() - 7);
            filteredData = filteredData.filter(d => new Date(d.date) >= lastWeek && new Date(d.date) <= today);
        } else if (exportRange === 'monthly') {
            const lastMonth = new Date(today);
            lastMonth.setMonth(today.getMonth() - 1);
            filteredData = filteredData.filter(d => new Date(d.date) >= lastMonth && new Date(d.date) <= today);
        } else if (exportRange === 'custom') {
            if (customStartDate) filteredData = filteredData.filter(d => new Date(d.date) >= new Date(customStartDate));
            if (customEndDate) {
                const logicalEnd = new Date(customEndDate) > today ? today : new Date(customEndDate);
                filteredData = filteredData.filter(d => new Date(d.date) <= logicalEnd);
            }
        }

        if (filteredData.length === 0) return alert("System Error: No valid data matrices identified in range.");

        const headers = ['Date', 'Scope', 'Start Time', 'End Time', 'Department', `Value (${config.unit})`];
        const rows = filteredData.map(d => [
            d.date, d.isFullDay ? 'Absolute Block' : 'Span Track', d.startTime || 'N/A', d.endTime || 'N/A', d.department, d.value
        ]);

        const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${type}_matrix_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formInputClass = "w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm font-mono text-xs uppercase tracking-wider";

    return (
        <div className="space-y-10 pb-10 max-w-7xl mx-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-6">
                <div>
                   <h1 className="text-3xl font-black text-slate-900 tracking-tight capitalize">{type} Subsystem</h1>
                   <p className="text-emerald-600 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Operational Tracking Protocol</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <h2 className="text-sm font-bold text-slate-900 mb-8 flex items-center gap-3 border-b border-slate-100 pb-4 uppercase tracking-widest">
                        <Database size={18} className="text-emerald-500" /> Manual Data Input
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Target Date</label>
                                <input type="date" max={todayStr} className={formInputClass} value={date} onChange={(e) => setDate(e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Sector</label>
                                <select className={formInputClass} value={department} onChange={(e) => setDepartment(e.target.value)}>
                                    <option>Hostel A</option><option>Hostel B</option><option>Main Academic Block</option><option>Library</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-1 h-full bg-slate-300"></div>
                             <div className="flex items-center justify-between mb-5">
                                 <label className="text-xs text-slate-700 font-bold uppercase tracking-widest">Measurement Scope</label>
                                 <label className="flex items-center cursor-pointer relative">
                                    <input type="checkbox" className="sr-only" checked={!isFullDay} onChange={() => setIsFullDay(!isFullDay)} />
                                    <div className={`w-12 h-6 rounded-full shadow-inner transition-colors ${!isFullDay ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                    <div className={`absolute w-4 h-4 bg-white rounded-full transition-transform ${!isFullDay ? 'translate-x-7' : 'translate-x-1'} top-1 shadow-md`}></div>
                                 </label>
                             </div>
                             
                             <p className="text-[10px] font-mono text-slate-500 mb-4 uppercase tracking-widest border-t border-slate-200 pt-3">
                                 {!isFullDay ? 'Targeting specific time boundaries.' : 'Mapping absolute 24-hour cycle variable.'}
                             </p>

                             {!isFullDay && (
                                 <div className="flex gap-5">
                                     <div className="flex-1">
                                         <label className="block text-[10px] font-bold text-emerald-600 mb-2 uppercase tracking-widest">Start Node</label>
                                         <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={formInputClass} required />
                                     </div>
                                     <div className="flex-1">
                                         <label className="block text-[10px] font-bold text-emerald-600 mb-2 uppercase tracking-widest">End Node</label>
                                         <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={formInputClass} required />
                                     </div>
                                 </div>
                             )}
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Telemetry Output ({config.unit})</label>
                            <input 
                                type="number" 
                                className={`${formInputClass} text-emerald-600 font-bold text-base bg-white`}
                                placeholder={`Input ${config.unit}`}
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black uppercase tracking-widest py-4 rounded-lg transition-all shadow-md mt-4 flex justify-center items-center gap-3">
                            <Save size={18} /> Execute Data Write
                        </button>
                    </form>
                </div>

                <div className="flex flex-col gap-8">
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden flex-1 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        <div className="z-10 h-full flex flex-col">
                            <h2 className="text-sm font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4 flex items-center gap-3 uppercase tracking-widest">
                                <BrainCircuit size={18} className="text-emerald-500" /> Statistical Extrapolation
                            </h2>
                            {prediction ? (
                                <div className="flex-1 flex flex-col justify-center">
                                    <h3 className="text-5xl font-black text-emerald-600 mb-4 drop-shadow-sm">
                                        {prediction.toFixed(2)} <span className="text-xl font-bold text-slate-400 tracking-widest uppercase">{config.unit}</span>
                                    </h3>
                                    <p className="text-slate-500 text-xs font-mono uppercase tracking-wider leading-relaxed border-l-2 border-emerald-500/30 pl-4">
                                        Calculated expected operational limit for subsequent cycle based on ML arrays.
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-slate-50 p-5 border border-slate-200 rounded-lg mt-4 flex items-start gap-4">
                                    <ShieldAlert className="text-slate-400 mt-0.5 shrink-0" size={20} />
                                    <p className="text-slate-500 text-[10px] font-mono tracking-widest uppercase leading-loose">
                                        Regression algorithms require min. 5 chronological blocks mapped to current security ID before releasing forecast matrix.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4 uppercase tracking-widest">
                            <DownloadCloud size={18} className="text-emerald-500" /> Backup Extractor
                        </h2>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Time Boundary Range</label>
                                <select className={formInputClass} value={exportRange} onChange={(e) => setExportRange(e.target.value)}>
                                    <option value="weekly">Rolling 7-Day Matrix</option>
                                    <option value="monthly">Rolling 30-Day Matrix</option>
                                    <option value="custom">Explicit Block Definition</option>
                                </select>
                            </div>

                            {exportRange === 'custom' && (
                                <div className="flex gap-4">
                                     <div className="flex-1">
                                         <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Start Limit</label>
                                         <input type="date" max={todayStr} value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className={formInputClass} />
                                     </div>
                                     <div className="flex-1">
                                         <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">End Limit</label>
                                         <input type="date" max={todayStr} value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className={formInputClass} />
                                     </div>
                                </div>
                            )}

                            <button onClick={handleDownloadCSV} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg transition-colors border border-slate-200 mt-2 flex items-center justify-center gap-3 hover:text-emerald-600 hover:border-emerald-200 shadow-sm">
                                <DownloadCloud size={16} /> Compile CSV Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mt-8">
                <h2 className="text-sm font-bold text-slate-900 mb-8 flex items-center gap-3 border-b border-slate-100 pb-4 uppercase tracking-widest">
                    <Clock size={18} className="text-emerald-500" /> Historical Vector Graphics
                </h2>
                {data.length > 0 ? (
                    <Line data={chartData} options={{ responsive: true, plugins: { legend: { labels: { color: '#64748b', font: { family: 'sans-serif', weight: 'bold' } } } }, scales: { x: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b', font: { family: 'monospace' } } }, y: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b', font: { family: 'monospace' } } } } }} height={80} />
                ) : (
                    <div className="h-56 flex items-center justify-center border border-dashed border-slate-300 rounded-xl text-slate-400 bg-slate-50 font-mono tracking-widest uppercase text-[10px]">
                        Insufficient parameters currently tracked.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResourcePage;
