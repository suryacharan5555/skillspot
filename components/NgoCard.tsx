import React from 'react';
import { Link } from 'react-router-dom';
import { NGO } from '../types';
import { MapPin, BookOpen, Users, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

interface NgoCardProps {
  ngo: NGO;
}

const NgoCard: React.FC<NgoCardProps> = ({ ngo }) => {
  const getInitials = (name?: string) => {
    if (!name) return 'SS';
    return name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'SS';
  };

  // Dynamic gradient accents based on NGO domain type
  const getGradientTheme = (type: string) => {
    switch (type) {
      case 'Community Development':
        return {
          header: 'from-emerald-600 via-teal-600 to-cyan-600',
          badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          ring: 'ring-emerald-500/20',
          btn: 'hover:bg-emerald-600',
        };
      case 'Environmental':
        return {
          header: 'from-green-600 via-emerald-600 to-teal-600',
          badge: 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 border-green-200 dark:border-green-800',
          ring: 'ring-green-500/20',
          btn: 'hover:bg-green-600',
        };
      case 'Healthcare':
        return {
          header: 'from-rose-600 via-pink-600 to-orange-500',
          badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          ring: 'ring-rose-500/20',
          btn: 'hover:bg-rose-600',
        };
      default: // Education
        return {
          header: 'from-blue-600 via-indigo-600 to-cyan-500',
          badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          ring: 'ring-blue-500/20',
          btn: 'hover:bg-blue-600',
        };
    }
  };

  const theme = getGradientTheme(ngo.type);
  const coursesCount = (ngo.courses || []).length;
  const topCourses = (ngo.courses || []).slice(0, 2);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl border border-gray-100 dark:border-gray-700/80 overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-1.5">
      
      {/* Dynamic Header Banner with Custom Cover Support */}
      <div className={`h-24 w-full bg-gradient-to-r ${theme.header} relative p-4 flex justify-between items-start overflow-hidden`}>
        {ngo.coverImageUrl && (
          <img
            src={ngo.coverImageUrl}
            alt={`${ngo?.name || 'Center'} cover`}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px] pointer-events-none" />
        
        {/* Subtle decorative background circle */}
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xs pointer-events-none group-hover:scale-125 transition-transform duration-500" />
        
        {/* Verified Organization Chip */}
        <div className="relative z-10 flex items-center space-x-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-semibold tracking-wide">
          <CheckCircle2 className="w-3 h-3 text-emerald-300" />
          <span>Verified Center</span>
        </div>

        {/* Active Programs Count Badge */}
        <div className="relative z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-800 dark:text-white shadow-xs flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>{coursesCount} {coursesCount === 1 ? 'Program' : 'Programs'}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 flex-grow flex flex-col pt-0">
        {/* Avatar + Title Row with Logo Support */}
        <div className="flex items-start space-x-3 -mt-7 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-900 shadow-lg border-2 border-white dark:border-gray-700 flex items-center justify-center font-black text-lg text-blue-600 dark:text-blue-400 flex-shrink-0 group-hover:scale-105 transition-transform duration-300 overflow-hidden relative z-10">
            {ngo.logoUrl ? (
              <img
                src={ngo.logoUrl}
                alt={ngo?.name || 'Center'}
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials(ngo?.name)
            )}
          </div>
          <div className="pt-8 flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {ngo?.name || 'Vocational Center'}
            </h3>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400 flex-shrink-0" />
              <span className="truncate">{ngo.location}</span>
            </div>
          </div>
        </div>

        {/* Category Domain Badge & Primary Skill Categories */}
        <div className="mb-3 flex flex-wrap gap-1.5 items-center">
          <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${theme.badge}`}>
            {ngo.type}
          </span>
          {(ngo.primaryCategories || []).slice(0, 2).map((cat) => (
            <span
              key={cat}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 truncate max-w-[150px]"
            >
              {cat}
            </span>
          ))}
          {ngo.branding?.customSlug && (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
              o/{ngo.branding.customSlug}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed mb-4 flex-grow">
          {ngo.description}
        </p>

        {/* Programs Teaser Chips */}
        {topCourses.length > 0 && (
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 mb-4 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Featured Programs:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {topCourses.map((c) => (
                <span
                  key={c.id}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium truncate max-w-[200px]"
                >
                  📚 {c?.name || 'Program'}
                </span>
              ))}
              {coursesCount > 2 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md text-blue-600 dark:text-blue-400 font-bold">
                  +{coursesCount - 2} more
                </span>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Footer / CTA Action */}
      <div className="p-3.5 bg-gray-50/80 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium flex items-center space-x-1">
          <Users className="w-3 h-3 text-blue-500" />
          <span>Open Cohorts</span>
        </span>

        <Link
          to={`/ngo/${ngo.id}`}
          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-xs group-hover:shadow transition-all"
        >
          <span>Explore Center</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

    </div>
  );
};

export default NgoCard;
