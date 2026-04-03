import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const LiveUsageCard = ({ title, value, unit, change, type }) => {
    const isIncrease = change >= 0;

    return (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
            <h3 className="text-slate-500 font-bold text-xs mb-3 uppercase tracking-widest">{title}</h3>
            
            <div className="flex items-end gap-2 mb-5">
                <span className="text-4xl font-black text-slate-900 tracking-tight">
                    {value}
                </span>
                <span className="text-emerald-600 font-bold pb-1 text-sm tracking-widest">{unit}</span>
            </div>
            
            <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider ${isIncrease ? 'text-red-600 bg-red-50 border border-red-100' : 'text-teal-700 bg-teal-50 border border-teal-100'}`}>
                    {isIncrease ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(change)}%
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Aggregate Shift</span>
            </div>
        </div>
    );
};

export default LiveUsageCard;
