import React, { useState, useMemo } from 'react';
import NgoCard from '../components/NgoCard';
import { NGOS, NGO_TYPES, LOCATIONS } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { NGO, User } from '../types';

const RegisterNgoModal: React.FC<{
  setShowModal: (show: boolean) => void;
  setNgos: React.Dispatch<React.SetStateAction<NGO[]>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}> = ({ setShowModal, setNgos, setUsers }) => {
    const [formData, setFormData] = useState({
        ngoName: '',
        location: '',
        website: '',
        type: NGO_TYPES[0] || '',
        description: '',
        missionStatement: '',
        contactEmail: '',
        password: '',
    });
    const [logoDataUrl, setLogoDataUrl] = useState('');
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoDataUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (Object.values(formData).some(val => val === '') || !logoDataUrl) {
            setError('All fields, including the logo, are required.');
            return;
        }
        
        const newNgoId = formData.ngoName.toLowerCase().replace(/\s+/g, '-');
        const newNgo: NGO = {
            id: newNgoId,
            name: formData.ngoName,
            contact: { email: formData.contactEmail, person: 'Admin', website: formData.website },
            courses: [],
            logoUrl: logoDataUrl,
            bannerUrl: `https://picsum.photos/seed/${newNgoId}-banner/1200/400`,
            location: formData.location,
            category: 'General',
            type: formData.type,
            description: formData.description,
            missionStatement: formData.missionStatement,
        };
        const newAdmin: User = {
            id: `user-${Date.now()}`,
            name: `${formData.ngoName} Admin`,
            email: formData.contactEmail,
            password: formData.password,
            role: 'admin',
            ngoId: newNgoId,
        };
        setNgos(prev => [...prev, newNgo]);
        setUsers(prev => [...prev, newAdmin]);
        setIsSuccess(true);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-2xl w-full transform transition-all">
                {isSuccess ? (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">Registration Successful!</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-6">Your NGO has been added to SkillSpot. You can now log in with the admin credentials you created.</p>
                        <button onClick={() => setShowModal(false)} className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-semibold">Close</button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Register Your NGO & Admin Account</h2>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="ngoName" placeholder="NGO Name" value={formData.ngoName} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" required />
                                <input name="contactEmail" type="email" placeholder="Admin Contact Email" value={formData.contactEmail} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" required />
                                <input name="location" placeholder="Location (e.g., City, Country)" value={formData.location} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" required />
                                <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600">
                                    {NGO_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                                <input name="website" placeholder="NGO Website URL" value={formData.website} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" required />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NGO Logo</label>
                                    <input type="file" onChange={handleFileChange} accept="image/*" className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800" required />
                                </div>
                                <textarea name="description" placeholder="Short Description (for the card)" value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg md:col-span-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" rows={2} required />
                                <textarea name="missionStatement" placeholder="Mission Statement (for the detail page)" value={formData.missionStatement} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg md:col-span-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" rows={3} required />
                                <input name="password" type="password" placeholder="Admin Password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg md:col-span-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" required />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <div className="flex justify-end space-x-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 font-semibold">Cancel</button>
                                <button type="submit" className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-semibold">Submit Registration</button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  const [ngos, setNgos] = useLocalStorage<NGO[]>('skillspot_ngos', NGOS);
  const [, setUsers] = useLocalStorage<User[]>('skillspot_users', []);

  const filteredNgos = useMemo(() => {
    return ngos.filter(ngo => {
      const matchesSearch = ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ngo.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'All' || ngo.type === selectedType;
      const matchesLocation = selectedLocation === 'All' || ngo.location.toLowerCase().includes(selectedLocation.toLowerCase());
      return matchesSearch && matchesType && matchesLocation;
    });
  }, [searchQuery, selectedType, selectedLocation, ngos]);

  return (
    <div className="space-y-8">
      <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">Welcome to SkillSpot 2.0</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
          A unified platform connecting NGOs, trainers, and learners. Discover organizations making a difference and join a community dedicated to growth.
        </p>
        <button onClick={() => setShowRegisterModal(true)} className="mt-6 inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105">
          Register your NGO
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md sticky top-16 z-40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search NGOs by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="All">All Types</option>
            {NGO_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="All">All Locations</option>
            {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </div>
      </div>

      {filteredNgos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNgos.map(ngo => (
            <NgoCard key={ngo.id} ngo={ngo} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <p className="text-xl text-gray-600 dark:text-gray-400">No NGOs found matching your criteria.</p>
        </div>
      )}

      {showRegisterModal && <RegisterNgoModal setShowModal={setShowRegisterModal} setNgos={setNgos} setUsers={setUsers} />}
    </div>
  );
};

export default HomePage;