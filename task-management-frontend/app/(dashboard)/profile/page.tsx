'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  changeMyPassword,
  getMyProfile,
  Profile,
  updateMyProfile,
} from '@/lib/api';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  async function loadProfile() {
    try {
      const response = await getMyProfile();
      setProfile(response);
      setName(response.name);
    } catch (profileError) {
      setError(profileError instanceof Error ? profileError.message : 'Unable to load profile');
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function handleNameUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSavingName(true);

    try {
      const updated = await updateMyProfile({ name });
      setProfile(updated);
      setSuccess('Profile name updated successfully.');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update name');
    } finally {
      setIsSavingName(false);
    }
  }

  async function handlePasswordUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSavingPassword(true);

    try {
      await changeMyPassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setSuccess('Password changed successfully.');
    } catch (passwordError) {
      setError(passwordError instanceof Error ? passwordError.message : 'Could not change password');
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <section className="stack">
      <h1 className="page-title">Profile</h1>

      {error ? <p className="error">{error}</p> : null}
      {success ? <p className="info">{success}</p> : null}

      {!profile ? (
        <p className="info">Loading profile...</p>
      ) : (
        <>
          <article className="card stack">
            <h3>Account Information</h3>
            <div className="profile-row">
              <span>Email</span>
              <strong>{profile.email}</strong>
            </div>
            <div className="profile-row">
              <span>Role</span>
              <strong>{profile.role}</strong>
            </div>
            <div className="profile-row">
              <span>Joined</span>
              <strong>{new Date(profile.createdAt).toLocaleString()}</strong>
            </div>
          </article>

          <form className="card stack" onSubmit={handleNameUpdate}>
            <h3>Edit Name</h3>
            <div className="field">
              <label htmlFor="profile-name">Name</label>
              <input
                id="profile-name"
                className="input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={2}
                maxLength={80}
                required
              />
            </div>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" type="submit" disabled={isSavingName}>
                {isSavingName ? 'Saving...' : 'Save Name'}
              </button>
            </div>
          </form>

          <form className="card stack" onSubmit={handlePasswordUpdate}>
            <h3>Change Password</h3>
            <div className="field">
              <label htmlFor="current-password">Current Password</label>
              <input
                id="current-password"
                className="input"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                minLength={6}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                className="input"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                minLength={6}
                required
              />
            </div>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" type="submit" disabled={isSavingPassword}>
                {isSavingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </>
      )}
    </section>
  );
}
