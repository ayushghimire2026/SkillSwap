import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlineX, HiOutlineUpload, HiOutlineTrash } from 'react-icons/hi';

const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    skillsOffered: user?.skillsOffered || [],
    skillsWanted: user?.skillsWanted || [],
    availability: user?.availability || [],
  });
  const [newSkillOffered, setNewSkillOffered] = useState({ name: '', level: 'intermediate', category: '' });
  const [newSkillWanted, setNewSkillWanted] = useState({ name: '', level: 'intermediate' });
  const [newAvail, setNewAvail] = useState({ day: 'monday', startTime: '09:00', endTime: '17:00' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const addSkillOffered = () => {
    if (!newSkillOffered.name.trim()) return;
    setForm(prev => ({ ...prev, skillsOffered: [...prev.skillsOffered, { ...newSkillOffered }] }));
    setNewSkillOffered({ name: '', level: 'intermediate', category: '' });
  };

  const addSkillWanted = () => {
    if (!newSkillWanted.name.trim()) return;
    setForm(prev => ({ ...prev, skillsWanted: [...prev.skillsWanted, { ...newSkillWanted }] }));
    setNewSkillWanted({ name: '', level: 'intermediate' });
  };

  const removeSkillOffered = (idx) => setForm(prev => ({ ...prev, skillsOffered: prev.skillsOffered.filter((_, i) => i !== idx) }));
  const removeSkillWanted = (idx) => setForm(prev => ({ ...prev, skillsWanted: prev.skillsWanted.filter((_, i) => i !== idx) }));

  const addAvailability = () => {
    setForm(prev => ({ ...prev, availability: [...prev.availability, { ...newAvail }] }));
  };

  const removeAvailability = (idx) => setForm(prev => ({ ...prev, availability: prev.availability.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await userAPI.updateProfile(form);
      updateUser(data.user);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => navigate(`/profile/${user._id}`), 1000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await userAPI.updateAvatar(formData);
      updateUser({ ...user, avatar: data.avatar });
      setMessage({ type: 'success', text: 'Avatar updated!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload avatar' });
    } finally {
      setUploading(false);
    }
  };

  const handlePortfolioUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      for (const file of files) formData.append('files', file);
      await userAPI.uploadPortfolio(formData);
      setMessage({ type: 'success', text: 'Portfolio updated!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload files' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title mb-6">Edit Profile</h1>

        {message.text && (
          <div className={`mb-4 p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Avatar */}
          <div className="card p-6">
            <h3 className="section-title mb-4">Avatar</h3>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user?.name?.[0]}
              </div>
              <label className="btn-secondary text-sm cursor-pointer">
                <HiOutlineUpload className="w-4 h-4 inline mr-2" />
                {uploading ? 'Uploading...' : 'Upload Photo'}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Basic Info */}
          <div className="card p-6">
            <h3 className="section-title mb-4">Basic Info</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Bio</label>
                <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={3} className="input-field resize-none" placeholder="Tell others about yourself..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Location</label>
                <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="input-field" placeholder="e.g. San Francisco, CA" />
              </div>
            </div>
          </div>

          {/* Skills Offered */}
          <div className="card p-6">
            <h3 className="section-title mb-4">Skills I Can Teach</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {form.skillsOffered.map((skill, i) => (
                <span key={i} className="badge-skill flex items-center gap-1">
                  {skill.name} ({skill.level})
                  <button onClick={() => removeSkillOffered(i)} className="hover:text-red-500"><HiOutlineX className="w-3.5 h-3.5" /></button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <input type="text" value={newSkillOffered.name} onChange={e => setNewSkillOffered({...newSkillOffered, name: e.target.value})}
                className="input-field flex-1 min-w-[140px]" placeholder="Skill name" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkillOffered())} />
              <select value={newSkillOffered.level} onChange={e => setNewSkillOffered({...newSkillOffered, level: e.target.value})}
                className="input-field w-auto">
                {SKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <button onClick={addSkillOffered} className="btn-primary text-sm px-4"><HiOutlinePlus className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Skills Wanted */}
          <div className="card p-6">
            <h3 className="section-title mb-4">Skills I Want to Learn</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {form.skillsWanted.map((skill, i) => (
                <span key={i} className="badge-wanted flex items-center gap-1">
                  {skill.name}
                  <button onClick={() => removeSkillWanted(i)} className="hover:text-red-500"><HiOutlineX className="w-3.5 h-3.5" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newSkillWanted.name} onChange={e => setNewSkillWanted({...newSkillWanted, name: e.target.value})}
                className="input-field flex-1" placeholder="Skill name" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkillWanted())} />
              <button onClick={addSkillWanted} className="btn-primary text-sm px-4"><HiOutlinePlus className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Availability */}
          <div className="card p-6">
            <h3 className="section-title mb-4">Availability</h3>
            {form.availability.length > 0 && (
              <div className="space-y-2 mb-4">
                {form.availability.map((slot, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-surface-50 dark:bg-surface-900/50">
                    <span className="capitalize text-sm font-medium text-surface-700 dark:text-surface-300 w-24">{slot.day}</span>
                    <span className="text-sm text-surface-500">{slot.startTime} - {slot.endTime}</span>
                    <button onClick={() => removeAvailability(i)} className="ml-auto text-surface-400 hover:text-red-500"><HiOutlineTrash className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <select value={newAvail.day} onChange={e => setNewAvail({...newAvail, day: e.target.value})} className="input-field w-auto capitalize">
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input type="time" value={newAvail.startTime} onChange={e => setNewAvail({...newAvail, startTime: e.target.value})} className="input-field w-auto" />
              <input type="time" value={newAvail.endTime} onChange={e => setNewAvail({...newAvail, endTime: e.target.value})} className="input-field w-auto" />
              <button onClick={addAvailability} className="btn-primary text-sm px-4"><HiOutlinePlus className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Portfolio Upload */}
          <div className="card p-6">
            <h3 className="section-title mb-4">Portfolio</h3>
            <label className="btn-secondary text-sm cursor-pointer inline-flex items-center gap-2">
              <HiOutlineUpload className="w-4 h-4" />
              Upload Files (images, docs, videos)
              <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.mp4" onChange={handlePortfolioUpload} className="hidden" />
            </label>
          </div>

          {/* Save */}
          <div className="flex gap-3 justify-end">
            <button onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
