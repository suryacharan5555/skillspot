import React, { useState, useMemo } from 'react';
import { useData } from '../data/DataContext';
import NgoCard from '../components/NgoCard';
import NgoCardSkeleton from '../components/NgoCardSkeleton';
import DataFetchError from '../components/DataFetchError';
import { NGO, User } from '../types';
import { supabase } from '../lib/supabaseClient';

// --- Icons for new sections ---
const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const ClipboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;


const RegistrationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
    const { fetchNgos, fetchUsers } = useData();
    
    const [ngoName, setNgoName] = useState('');
    const [ngoDescription, setNgoDescription] = useState('');
    const [ngoLocation, setNgoLocation] = useState('');
    const [ngoType, setNgoType] = useState<'Community Development' | 'Education' | 'Environmental' | 'Healthcare'>('Education');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactWebsite, setContactWebsite] = useState('');
    const [adminName, setAdminName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (adminPassword !== adminConfirmPassword) {
            setError('Admin passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            // Check if admin email already exists
            const { data: existingUser } = await supabase.from('users').select('id').eq('email', adminEmail).single();
            if (existingUser) {
                setError('An admin with this email already exists.');
                setIsLoading(false);
                return;
            }

            const ngoId = ngoName.toLowerCase().replace(/\s+/g, '-');
            const newNgo: Omit<NGO, 'courses' | 'reviews'> = {
                id: ngoId,
                name: ngoName,
                description: ngoDescription,
                location: ngoLocation,
                type: ngoType,
                contact: { email: contactEmail, phone: contactPhone, website: contactWebsite },
            };

            const { error: ngoError } = await supabase.from('ngos').insert({ ...newNgo, courses: [] });
            if (ngoError) throw ngoError;
            
            const newAdmin: Omit<User, 'id'> = {
                name: adminName,
                email: adminEmail,
                password: adminPassword, // In a real app, hash this on the server.
                role: 'admin',
                ngoId: ngoId,
            };

            const { error: userError } = await supabase.from('users').insert(newAdmin);
            if (userError) throw userError;

            // Refetch data to update the UI
            await Promise.all([fetchNgos(), fetchUsers()]);
            onClose();

        } catch (err: any) {
            setError(err.message || 'Failed to register NGO.');
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isOpen) return null;
    
    const inputClasses = "w-full px-4 py-2 border rounded-lg bg-white text-gray-900 border-gray-300 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Register Your NGO</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* NGO Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-600 text-gray-900 dark:text-white">NGO Information</h3>
                            <input type="text" placeholder="NGO Name" value={ngoName} onChange={e => setNgoName(e.target.value)} required className={inputClasses} />
                            <textarea placeholder="Description" value={ngoDescription} onChange={e => setNgoDescription(e.target.value)} required className={inputClasses} rows={3}></textarea>
                            <input type="text" placeholder="Location (e.g., City, State)" value={ngoLocation} onChange={e => setNgoLocation(e.target.value)} required className={inputClasses} />
                            <select value={ngoType} onChange={e => setNgoType(e.target.value as any)} className={inputClasses}>
                                <option value="Education">Education</option>
                                <option value="Community Development">Community Development</option>
                                <option value="Environmental">Environmental</option>
                                <option value="Healthcare">Healthcare</option>
                            </select>
                             <input type="email" placeholder="Contact Email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required className={inputClasses} />
                            <input type="tel" placeholder="Contact Phone" value={contactPhone} onChange={e => setContactPhone(e.target.value)} required className={inputClasses} />
                            <input type="url" placeholder="Website URL" value={contactWebsite} onChange={e => setContactWebsite(e.target.value)} required className={inputClasses} />
                        </div>
                        {/* Admin Details */}
                        <div className="space-y-4">
                             <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-600 text-gray-900 dark:text-white">Admin Account</h3>
                             <input type="text" placeholder="Admin Full Name" value={adminName} onChange={e => setAdminName(e.target.value)} required className={inputClasses} />
                             <input type="email" placeholder="Admin Email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required className={inputClasses} />
                             <input type="password" placeholder="Admin Password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required className={inputClasses} />
                             <input type="password" placeholder="Confirm Admin Password" value={adminConfirmPassword} onChange={e => setAdminConfirmPassword(e.target.value)} required className={inputClasses} />
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-500 text-center mt-4">{error}</p>}
                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
                            {isLoading ? 'Registering...' : 'Register'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const HomePage: React.FC = () => {
  const { ngos, enrollments, loading, error } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const stats = useMemo(() => {
    const totalNgos = ngos.length;
    const totalCourses = ngos.reduce((acc, ngo) => acc + (ngo.courses?.length || 0), 0);
    const approvedEnrollments = enrollments.filter(e => e.status === 'Approved').length;
    return { totalNgos, totalCourses, approvedEnrollments };
  }, [ngos, enrollments]);

  const uniqueNgoTypes = useMemo(() => {
    const types = new Set(ngos.map(ngo => ngo.type));
    return ['All', ...Array.from(types)];
  }, [ngos]);
  
  const uniqueLocations = useMemo(() => {
    const locations = new Set(ngos.map(ngo => ngo.location));
    return ['', ...Array.from(locations)];
  }, [ngos]);

  const filteredNgos = useMemo(() => {
    return ngos.filter(ngo => {
      const matchesSearch = ngo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ngo.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'All' || ngo.type === typeFilter;
      const matchesLocation = locationFilter === '' || ngo.location === locationFilter;
      
      return matchesSearch && matchesType && matchesLocation;
    });
  }, [ngos, searchTerm, typeFilter, locationFilter]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, index) => <NgoCardSkeleton key={index} />)}
        </div>
      );
    }

    if (error) {
      return <DataFetchError error={error} />;
    }

    if (filteredNgos.length === 0) {
      return <p className="text-center text-gray-500 dark:text-gray-400 text-lg mt-8">No NGOs found matching your criteria.</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredNgos.map((ngo: NGO) => (
          <NgoCard key={ngo.id} ngo={ngo} />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="space-y-16">
        {/* --- HERO SECTION --- */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">Empowering Skills, Building Futures</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover opportunities for skill development. Connect with NGOs making a real impact in communities.
          </p>
          <div className="mt-8">
            <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105"
            >
                Register Your NGO
            </button>
          </div>
        </div>
        
        {/* --- IMPACT STATISTICS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-center space-x-4">
                <BuildingIcon />
                <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.totalNgos}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Partner NGOs</p>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-center space-x-4">
                <BookIcon />
                <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.totalCourses}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Courses Offered</p>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-center space-x-4">
                <UsersIcon />
                <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.approvedEnrollments}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Students Empowered</p>
                </div>
            </div>
        </div>

        {/* --- HOW IT WORKS --- */}
        <div className="bg-blue-600 dark:bg-blue-800 text-white p-8 rounded-lg">
            <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center">
                    <div className="bg-blue-500 dark:bg-blue-700 p-4 rounded-full mb-4"><SearchIcon /></div>
                    <h3 className="text-xl font-semibold mb-2">1. Discover NGOs</h3>
                    <p className="text-blue-200">Explore a directory of trusted organizations offering valuable skill-based courses.</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="bg-blue-500 dark:bg-blue-700 p-4 rounded-full mb-4"><ClipboardIcon /></div>
                    <h3 className="text-xl font-semibold mb-2">2. Enroll in Courses</h3>
                    <p className="text-blue-200">Find a course that fits your goals and submit your enrollment request with a single click.</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="bg-blue-500 dark:bg-blue-700 p-4 rounded-full mb-4"><ChartIcon /></div>
                    <h3 className="text-xl font-semibold mb-2">3. Grow Your Skills</h3>
                    <p className="text-blue-200">Gain new abilities, receive guidance from experts, and build your future.</p>
                </div>
            </div>
        </div>


        {/* --- NGO DIRECTORY LISTING --- */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">Our Partner NGOs</h2>
          <div className="sticky top-16 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm py-4 z-40">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-white text-gray-900 border-gray-300 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
              />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-white text-gray-900 border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                {uniqueNgoTypes.map(type => <option key={type} value={type}>{type === 'All' ? 'All Types' : type}</option>)}
              </select>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-white text-gray-900 border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                {uniqueLocations.map(location => <option key={location} value={location}>{location === '' ? 'All Locations' : location}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-8">
            {renderContent()}
          </div>
        </div>
      </div>
      <RegistrationModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} />
    </>
  );
};

export default HomePage;