'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useRequireRole } from '@/hooks/useAuth';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { Setting } from '@/types';

export default function Settings() {
  useRequireRole(['super_admin']);

  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: ''
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingKey) {
        await api.put(`/settings/${editingKey}`, {
          value: formData.value,
          description: formData.description
        });
      } else {
        await api.post('/settings', formData);
      }
      setShowForm(false);
      setEditingKey(null);
      setFormData({
        key: '',
        value: '',
        description: ''
      });
      fetchSettings();
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('Are you sure you want to delete this setting?')) return;
    try {
      await api.delete(`/settings/${key}`);
      fetchSettings();
    } catch (error) {
      console.error('Failed to delete setting:', error);
    }
  };

  const handleEdit = (setting: Setting) => {
    setFormData({
      key: setting.key,
      value: String(setting.value),
      description: setting.description
    });
    setEditingKey(setting.key);
    setShowForm(true);
  };

  const parseValue = (value: any) => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage system configuration and settings</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingKey(null);
              setFormData({
                key: '',
                value: '',
                description: ''
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus size={20} />
            New Setting
          </button>
        </div>

        {/* Warning */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-900">System Settings</p>
            <p className="text-sm text-yellow-800 mt-1">Changes to these settings affect the entire application. Proceed with caution.</p>
          </div>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="bg-white border-b p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {editingKey ? 'Edit Setting' : 'New Setting'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Setting Key *
                  </label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    placeholder="e.g., app_name"
                    disabled={!!editingKey}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                  />
                  <p className="text-xs text-gray-600 mt-1">Use lowercase with underscores (e.g., max_users)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Value *
                  </label>
                  <input
                    type="text"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="e.g., Swifter Admin"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-600 mt-1">Can be text, number, or JSON</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this setting does..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    {editingKey ? 'Update' : 'Create'} Setting
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {settings.length > 0 ? (
            settings.map(setting => (
              <div key={setting.key} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-500">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">
                      {setting.key.replace(/_/g, ' ')}
                    </h3>
                    {setting.description && (
                      <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(setting)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(setting.key)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium">Value:</p>
                  <p className="text-sm font-mono text-gray-900 break-all mt-1">{parseValue(setting.value)}</p>
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  Last updated by: {setting.updatedBy}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12">
              <p className="text-gray-600">No settings configured yet</p>
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingKey(null);
                }}
                className="mt-4 px-4 py-2 text-primary-600 hover:text-primary-700"
              >
                Create first setting
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
