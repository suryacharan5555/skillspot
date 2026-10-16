import React, { useState, useEffect } from 'react';
import { User } from '../types';
import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  Briefcase,
  Sparkles,
  Upload,
  CheckCircle2,
  Building,
  GraduationCap,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react';

interface UserProfileModalProps {
  user?: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updates: Partial<User>) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
];

const PRESET_USER_COVERS = [
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1000&auto=format&fit=crop&q=80',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [coverImageUrl, setCoverImageUrl] = useState(user?.coverImageUrl || '');
  const [tradeSpecialization, setTradeSpecialization] = useState(
    user?.tradeSpecialization || (user?.role === 'student' ? 'Electrical & Solar Installation' : '')
  );
  const [location, setLocation] = useState(user?.location || 'San Francisco, CA');
  const [companyName, setCompanyName] = useState(user?.companyName || '');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
      setCoverImageUrl(user.coverImageUrl || '');
      setTradeSpecialization(
        user.tradeSpecialization || (user.role === 'student' ? 'Electrical & Solar Installation' : '')
      );
      setLocation(user.location || 'San Francisco, CA');
      setCompanyName(user.companyName || '');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCoverImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updates: Partial<User> = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      bio: bio.trim() || undefined,
      avatarUrl: avatarUrl.trim() || undefined,
      coverImageUrl: coverImageUrl.trim() || undefined,
      tradeSpecialization: tradeSpecialization.trim() || undefined,
      location: location.trim() || undefined,
      companyName: companyName.trim() || undefined,
    };

    onSave(updates);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col border border-gray-100 dark:border-gray-700 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Edit Your Personal Profile</h3>
              <p className="text-xs text-blue-100 capitalize">
                {user.role} Account • Update contact, photo, and preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="font-semibold">Profile updated successfully!</span>
            </div>
          )}

          {/* Profile Picture & Banner Preview */}
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 p-3 pt-0">
            {/* Cover header */}
            <div className="h-20 -mx-3 mb-2 relative bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 overflow-hidden">
              {coverImageUrl && (
                <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black/20" />
            </div>

            <div className="flex items-end justify-between -mt-8 mb-2">
              <div className="flex items-end space-x-3">
                <div className="w-16 h-16 rounded-2xl border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-700 overflow-hidden shadow-md flex items-center justify-center font-bold text-lg text-blue-600">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    (name || user.name || 'SS').slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="pb-1">
                  <div className="font-bold text-gray-900 dark:text-white text-sm">{name || 'Your Name'}</div>
                  <div className="text-[11px] text-gray-400 capitalize">{user.role}</div>
                </div>
              </div>
            </div>

            {/* Avatar & Cover actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-200/60 dark:border-gray-700">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                  Profile Picture (Avatar)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="Avatar image URL..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                  />
                  <label className="p-1.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 cursor-pointer bg-white dark:bg-gray-700">
                    <Upload className="w-3.5 h-3.5 text-blue-500" />
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                </div>
                {/* Presets */}
                <div className="flex items-center space-x-1.5 mt-1.5">
                  <span className="text-[10px] text-gray-400">Presets:</span>
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className="w-5 h-5 rounded-full overflow-hidden hover:scale-110 transition-transform ring-1 ring-gray-300"
                    >
                      <img src={url} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="text-[10px] text-rose-500 hover:underline pl-1"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                  Cover Banner
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="Banner image URL..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                  />
                  <label className="p-1.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 cursor-pointer bg-white dark:bg-gray-700">
                    <Upload className="w-3.5 h-3.5 text-indigo-500" />
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                  </label>
                </div>
                {/* Cover presets */}
                <div className="flex items-center space-x-1.5 mt-1.5">
                  <span className="text-[10px] text-gray-400">Presets:</span>
                  {PRESET_USER_COVERS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCoverImageUrl(url)}
                      className="w-7 h-4 rounded-sm overflow-hidden hover:scale-110 transition-transform border border-gray-300"
                    >
                      <img src={url} alt="preset cover" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {coverImageUrl && (
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl('')}
                      className="text-[10px] text-rose-500 hover:underline pl-1"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* User Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 012-3456"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                City / Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Austin, TX"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {user.role === 'employer' ? (
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Company / Organization Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Apex Solar Solutions Inc."
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          ) : (
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Trade Specialization / Primary Focus
              </label>
              <input
                type="text"
                value={tradeSpecialization}
                onChange={(e) => setTradeSpecialization(e.target.value)}
                placeholder="e.g. Clean Energy Tech, CNC Machining, HVAC Repair"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Bio & Professional Summary
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell instructors and hiring employers about your hands-on experience, goals, and trade passions..."
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileModal;
