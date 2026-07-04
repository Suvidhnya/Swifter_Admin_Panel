'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth, useProtectedRoute } from '@/hooks/useAuth';
import api from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const isProtected = useProtectedRoute();
  const { user, verifyToken } = useAuth();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isProtected) {
    return null;
  }

  const getInitials = (firstName = '', lastName = '') =>
    `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      return;
    }
    const userId = user.id || user._id;
    if (!userId) {
      setMessage('Unable to identify current user.');
      return;
    }
    if (!avatarFile) {
      setMessage('Please choose an image file to upload.');
      return;
    }

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      await api.post(`/users/${userId}/avatar`, formData);

      setMessage('Profile image uploaded successfully.');
      await verifyToken();
    } catch (error) {
      console.error('Failed to upload profile image:', error);
      setMessage('Unable to upload profile image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-2">Update your avatar and view your current account details.</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-24 h-24 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold">
                  {getInitials(user?.firstName || '', user?.lastName || '')}
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Signed in as</p>
                <h2 className="text-xl font-semibold text-gray-900">{user?.firstName} {user?.lastName}</h2>
                <p className="text-sm text-gray-600">{user?.email}</p>
                <p className="text-sm text-gray-600 capitalize">{user?.role.replace('_', ' ')}</p>
              </div>
            </div>

            <form onSubmit={handleUpload} className="space-y-4 w-full max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Profile Image</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-gray-600"
                />
              </div>
              {message && <p className="text-sm text-green-600">{message}</p>}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full inline-flex justify-center items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Upload Image'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
