import React, { useState } from 'react';
import { NGO } from '../types';
import {
  X,
  Building2,
  Image as ImageIcon,
  MapPin,
  Mail,
  Phone,
  Globe,
  Award,
  CheckCircle2,
  Sparkles,
  Upload,
  Calendar,
  Share2,
  Eye,
  FileText,
} from 'lucide-react';

interface OrganizationProfileModalProps {
  ngo?: NGO | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedNgo: NGO) => void;
}

const PRESET_COVERS = [
  {
    label: 'Modern Tech & Maker Workshop',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Clean Energy & Solar PV Lab',
    url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Woodworking & Precision Carpentry',
    url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Healthcare & Clinical Skills Center',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Robotics & Industrial Automation',
    url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=1200&auto=format&fit=crop&q=80',
  },
];

const PRESET_LOGOS = [
  {
    label: 'Technical Academy',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80',
  },
  {
    label: 'Green Future Foundation',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&auto=format&fit=crop&q=80',
  },
  {
    label: 'Healthcare Training Lab',
    url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=300&auto=format&fit=crop&q=80',
  },
  {
    label: 'Creative Crafts & Trade Guild',
    url: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=300&auto=format&fit=crop&q=80',
  },
];

export const OrganizationProfileModal: React.FC<OrganizationProfileModalProps> = ({
  ngo,
  isOpen,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'branding' | 'contact' | 'preview'>('details');

  // Form State
  const [name, setName] = useState(ngo?.name || '');
  const [type, setType] = useState(ngo?.type || 'Education');
  const [location, setLocation] = useState(ngo?.location || '');
  const [address, setAddress] = useState(ngo?.address || '');
  const [description, setDescription] = useState(ngo?.description || '');
  const [mission, setMission] = useState(ngo?.mission || '');
  const [establishedYear, setEstablishedYear] = useState(ngo?.establishedYear ? String(ngo.establishedYear) : '2018');
  const [accreditation, setAccreditation] = useState(
    ngo?.accreditation || 'ISO 9001:2015 & National Apprenticeship Council Verified'
  );

  // Branding & Tenant State
  const [logoUrl, setLogoUrl] = useState(ngo?.logoUrl || '');
  const [coverImageUrl, setCoverImageUrl] = useState(ngo?.coverImageUrl || '');
  const [primaryColor, setPrimaryColor] = useState(ngo?.branding?.primaryColor || '#2563EB');
  const [tagline, setTagline] = useState(ngo?.branding?.tagline || '');
  const [customSlug, setCustomSlug] = useState(ngo?.branding?.customSlug || '');
  const [primaryCategories, setPrimaryCategories] = useState<string[]>(ngo?.primaryCategories || ['Vocational Training']);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // Contact State
  const [email, setEmail] = useState(ngo?.contact?.email || ngo?.contactEmail || '');
  const [phone, setPhone] = useState(ngo?.contact?.phone || ngo?.phone || '');
  const [website, setWebsite] = useState(ngo?.contact?.website || ngo?.website || '');

  // Social Links
  const [linkedin, setLinkedin] = useState(ngo?.socialLinks?.linkedin || '');
  const [twitter, setTwitter] = useState(ngo?.socialLinks?.twitter || '');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (ngo) {
      setName(ngo.name || '');
      setType(ngo.type || 'Education');
      setLocation(ngo.location || '');
      setAddress(ngo.address || '');
      setDescription(ngo.description || '');
      setMission(ngo.mission || '');
      setEstablishedYear(ngo.establishedYear ? String(ngo.establishedYear) : '2018');
      setAccreditation(ngo.accreditation || 'ISO 9001:2015 & National Apprenticeship Council Verified');
      setLogoUrl(ngo.logoUrl || '');
      setCoverImageUrl(ngo.coverImageUrl || '');
      setPrimaryColor(ngo.branding?.primaryColor || '#2563EB');
      setTagline(ngo.branding?.tagline || '');
      setCustomSlug(ngo.branding?.customSlug || '');
      setPrimaryCategories(ngo.primaryCategories || ['Vocational Training']);
      setEmail(ngo.contact?.email || ngo.contactEmail || '');
      setPhone(ngo.contact?.phone || ngo.phone || '');
      setWebsite(ngo.contact?.website || ngo.website || '');
      setLinkedin(ngo.socialLinks?.linkedin || '');
      setTwitter(ngo.socialLinks?.twitter || '');
    }
  }, [ngo, isOpen]);

  if (!isOpen || !ngo) return null;

  // File Upload Handlers with FileReader
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setLogoUrl(reader.result);
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

    const updatedNgo: NGO = {
      ...ngo,
      name: name.trim(),
      type: type.trim(),
      location: location.trim(),
      address: address.trim() || undefined,
      description: description.trim(),
      mission: mission.trim() || undefined,
      establishedYear: parseInt(establishedYear, 10) || undefined,
      accreditation: accreditation.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
      coverImageUrl: coverImageUrl.trim() || undefined,
      branding: {
        ...(ngo.branding || {}),
        primaryColor: primaryColor || '#2563EB',
        accentColor: ngo.branding?.accentColor || '#10B981',
        tagline: tagline.trim(),
        customSlug: customSlug.trim() || ngo.branding?.customSlug || ngo.id,
      },
      primaryCategories: primaryCategories.length > 0 ? primaryCategories : ngo.primaryCategories,
      contact: {
        email: email.trim(),
        phone: phone.trim(),
        website: website.trim(),
      },
      socialLinks: {
        linkedin: linkedin.trim() || undefined,
        twitter: twitter.trim() || undefined,
      },
    };

    onSave(updatedNgo);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-gray-100 dark:border-gray-700 overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Manage Organization Profile & Branding</h2>
              <p className="text-xs text-blue-100">
                Update training center information, profile picture, banner cover, and contact channels.
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800 px-6 pt-3 space-x-2 shrink-0 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>General Info</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('branding')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'branding'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Logo & Cover Banner</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'contact'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Contact & Social</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'preview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="font-semibold">Organization details updated successfully!</span>
            </div>
          )}

          {/* TAB 1: General Details */}
          {activeTab === 'details' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Hope Vocational Training Academy"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Primary Domain / Category *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Education">Education & Vocational Trades</option>
                    <option value="Community Development">Community Development</option>
                    <option value="Environmental">Environmental & Clean Energy</option>
                    <option value="Healthcare">Healthcare & Clinical Assistance</option>
                    <option value="Technology">Technology & Advanced Manufacturing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    City & Region Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Physical Campus / Street Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 742 Harrison St, Suite 300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Center Description & Overview *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Summarize your training center's purpose, facilities, and student cohorts..."
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Mission Statement & Core Purpose
                </label>
                <textarea
                  rows={2}
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Empowering underrepresented communities through accredited vocational training and hands-on apprenticeships."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Established Year
                  </label>
                  <input
                    type="number"
                    value={establishedYear}
                    onChange={(e) => setEstablishedYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="2018"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Accreditation & Certification Body
                  </label>
                  <input
                    type="text"
                    value={accreditation}
                    onChange={(e) => setAccreditation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. State Board of Vocational Education & OSHA 10 Certified"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Branding (Logo & Cover Banner) */}
          {activeTab === 'branding' && (
            <div className="space-y-6 animate-in fade-in duration-100">
              
              {/* Profile Picture / Logo Section */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <span>Organization Logo / Profile Picture</span>
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Square image shown in directory cards, certificates, and profile badges.
                    </p>
                  </div>

                  {/* Logo Preview */}
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 border-2 border-blue-500/40 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-black text-lg text-blue-600">
                        {name ? name.slice(0, 2).toUpperCase() : 'SS'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                      Logo Image URL
                    </label>
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                      Or Upload from Device
                    </label>
                    <label className="flex items-center justify-center space-x-2 px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl cursor-pointer bg-white dark:bg-gray-700 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Select Logo File
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Preset Logo Quick Pick */}
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1.5">
                    Quick Preset Logos:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_LOGOS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setLogoUrl(p.url)}
                        className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 text-[11px] bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center space-x-1.5 transition-colors"
                      >
                        <img src={p.url} alt={p.label} className="w-3.5 h-3.5 rounded-full object-cover" />
                        <span>{p.label}</span>
                      </button>
                    ))}
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="text-[10px] text-rose-500 hover:underline px-2 py-1 font-semibold"
                      >
                        Reset to Initials
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Cover Banner Section */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center space-x-1.5">
                      <ImageIcon className="w-4 h-4 text-indigo-500" />
                      <span>Cover Banner / Header Page Image</span>
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Widescreen hero banner displayed on your public center landing page.
                    </p>
                  </div>
                </div>

                {/* Cover Banner Preview */}
                <div className="h-28 w-full rounded-xl overflow-hidden relative border border-gray-200 dark:border-gray-700">
                  {coverImageUrl ? (
                    <img
                      src={coverImageUrl}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white/70 font-semibold text-xs">
                      Default Gradient Banner Active
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/25 pointer-events-none" />
                  <div className="absolute bottom-2 left-3 text-white text-[11px] font-bold drop-shadow">
                    {name}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                      Banner Image URL
                    </label>
                    <input
                      type="url"
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      placeholder="https://example.com/banner.jpg"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                      Or Upload from Device
                    </label>
                    <label className="flex items-center justify-center space-x-2 px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl cursor-pointer bg-white dark:bg-gray-700 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Select Banner File
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Preset Cover Quick Pick */}
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1.5">
                    Curated Vocational Cover Themes:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PRESET_COVERS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCoverImageUrl(p.url)}
                        className={`px-3 py-2 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                          coverImageUrl === p.url
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400'
                        }`}
                      >
                        <img
                          src={p.url}
                          alt={p.label}
                          className="w-8 h-8 rounded-lg object-cover shrink-0"
                        />
                        <span className="text-[11px] font-medium truncate">{p.label}</span>
                      </button>
                    ))}
                  </div>
                  {coverImageUrl && (
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl('')}
                      className="text-[10px] text-rose-500 hover:underline mt-2 font-semibold block"
                    >
                      Reset to Default Gradient
                    </button>
                  )}
                </div>
              </div>

              {/* Brand Theme Color & Tagline */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center space-x-1.5 text-sm">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>Tenant Brand Identity & Portal Subdomain</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                      Primary Brand Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-9 h-9 rounded-xl border border-gray-300 dark:border-gray-600 p-0.5 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-mono"
                        placeholder="#2563EB"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                      Tenant Portal Slug
                    </label>
                    <div className="flex items-center px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs font-mono">
                      <span className="text-gray-400">skillspot.org/o/</span>
                      <input
                        type="text"
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="bg-transparent text-blue-600 dark:text-blue-400 font-bold focus:outline-hidden flex-1 ml-1"
                        placeholder="slug"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                    Tenant Tagline / Public Motto
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Empowering tomorrow's electricians and solar technicians through hands-on labs"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                  />
                </div>

                {/* Primary Skill Categories */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-650 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300">
                      Primary Skill Categories ({primaryCategories.length})
                    </label>
                    <span className="text-[10px] text-gray-400">Tags shown on directory cards</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {primaryCategories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200"
                      >
                        <span>{cat}</span>
                        <button
                          type="button"
                          onClick={() => setPrimaryCategories((prev) => prev.filter((c) => c !== cat))}
                          className="hover:text-red-500 ml-1 font-bold"
                          title="Remove"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = newCategoryInput.trim();
                          if (val && !primaryCategories.includes(val)) {
                            setPrimaryCategories((prev) => [...prev, val]);
                            setNewCategoryInput('');
                          }
                        }
                      }}
                      placeholder="Add another skill category (e.g. Clean Energy & Solar PV)"
                      className="flex-1 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = newCategoryInput.trim();
                        if (val && !primaryCategories.includes(val)) {
                          setPrimaryCategories((prev) => [...prev, val]);
                          setNewCategoryInput('');
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white text-xs font-bold transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Contact & Social Channels */}
          {activeTab === 'contact' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Contact Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="info@academy.org"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Phone Support *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="(415) 555-0199"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Official Website *
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      required
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="https://academy.org"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                  Social & Professional Profiles
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                      LinkedIn Page URL
                    </label>
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/company/hope-academy"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                      X / Twitter Profile URL
                    </label>
                    <input
                      type="url"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="https://twitter.com/hope_academy"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Live Preview */}
          {activeTab === 'preview' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <span className="text-[11px] text-gray-500 block font-medium">
                Here is how your updated center will appear on the public directory and detail page:
              </span>

              {/* Preview Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Banner */}
                <div className="h-32 w-full relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                  {coverImageUrl && (
                    <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/25" />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 dark:bg-gray-900/90 text-[10px] font-bold text-gray-800 dark:text-white">
                    {type}
                  </div>
                </div>

                {/* Profile Header */}
                <div className="p-5 pt-0">
                  <div className="flex items-end space-x-3 -mt-8 mb-3">
                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-900 shadow-md flex items-center justify-center overflow-hidden font-black text-xl text-blue-600">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        (name || 'SS').slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="pb-1">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">{name}</h3>
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{location}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                    {description}
                  </p>

                  <div className="flex flex-wrap gap-2 text-[11px] text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3">
                    <span className="flex items-center space-x-1">
                      <Mail className="w-3 h-3 text-blue-500" />
                      <span>{email}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-indigo-500" />
                      <span>{phone}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Globe className="w-3 h-3 text-emerald-500" />
                      <span>{website}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Action Controls */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <span className="text-[11px] text-gray-400">
              Changes take effect immediately across all student dashboards and search filters.
            </span>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-50 transition-all flex items-center space-x-1.5"
              >
                {isSaving ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizationProfileModal;
