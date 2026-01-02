import React from 'react';


const StatCard = ({ title, value, icon: Icon, gradient, color, onClick }) => {
    const getGradient = () => {
        if (gradient) return gradient;
        switch (color) {
            case 'blue': return 'bg-gradient-to-br from-blue-500 to-blue-600';
            case 'emerald': return 'bg-gradient-to-br from-emerald-500 to-emerald-600';
            case 'amber': return 'bg-gradient-to-br from-amber-500 to-amber-600';
            case 'purple': return 'bg-gradient-to-br from-purple-500 to-purple-600';
            case 'red': return 'bg-gradient-to-br from-red-500 to-red-600';
            default: return 'bg-gradient-to-br from-slate-700 to-slate-800';
        }
    };

    const bgClass = getGradient();

    return (
        <div
            onClick={onClick}
            className={`${bgClass} rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden group cursor-pointer relative`}
        >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>

            <div className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-xs font-bold text-white/80 uppercase tracking-wider mb-1">
                            {title}
                        </p>
                        <h3 className="text-4xl font-extrabold text-white tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">
                            {value}
                        </h3>
                    </div>

                    <div className="flex-shrink-0 ml-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-inner group-hover:bg-white/30 transition-colors duration-300">
                            {Icon && <Icon className="w-6 h-6 text-white" />}
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
    );
};

export default StatCard;
