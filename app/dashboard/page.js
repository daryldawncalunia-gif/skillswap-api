'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [swapRequests, setSwapRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false); // NEW
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [avgRating, setAvgRating] = useState('4.8');
  const [reviewCount, setReviewCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/auth/check', { credentials: 'include' });
      if (!res.ok) throw new Error('Not authenticated');
      const data = await res.json();
      setUser(data.user);

      const skillsRes = await fetch(`/api/skills?userId=${data.user.id}`);
      if (skillsRes.ok) {
        const skillsData = await skillsRes.json();
        setSkills(skillsData.skills || []);
      }
      // fetch ratings/summary
      fetchRatings();
    } catch (error) {
      console.log('fetchUserData error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async () => {
    try {
      const res = await fetch('/api/ratings/list');
      if (!res.ok) return;
      const data = await res.json();
      setAvgRating(data.average || '0.00');
      setReviewCount(data.count || 0);
    } catch (err) {
      console.error('Fetch ratings error:', err);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/skills/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill_name: newSkill }),
        credentials: 'include'
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setNewSkill('');
        await fetchUserData();
      } else {
        alert(json.error || 'Failed to add skill');
      }
    } catch (err) {
      console.error('Add skill fetch error', err);
      alert('Network or server error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const res = await fetch('/api/upload/profile', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok) {
        alert('Profile picture uploaded successfully!');
        setProfileImage(data.filepath);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    }
  };


  const handleSendMessage = async () => {
    const receiverId = document.getElementById('receiverId')?.value;
    const messageText = document.getElementById('messageText')?.value;
    
    if (!receiverId || !messageText?.trim()) {
      alert('Please enter receiver ID and message');
      return;
    }
    
    setSendingMessage(true);
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          receiver_id: parseInt(receiverId), 
          message: messageText 
        }),
        credentials: 'include'
      });
      
      const data = await res.json();
      if (res.ok) {
        alert('Message sent successfully!');
        document.getElementById('messageText').value = '';
      } else {
        alert(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      alert('Network error. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
  };

  const handleEditSkill = (skill) => {
    console.log('Edit clicked', skill);
  };

  const handleRemoveSkill = async (skill) => {
    if (!confirm(`Remove "${skill.skill_name}"?`)) return;
    setRemovingId(skill.id);
    try {
      const res = await fetch('/api/skills/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId: skill.id }),
        credentials: 'include'
      });
      if (res.ok) {
        await fetchUserData();
      } else {
        const json = await res.json().catch(() => ({}));
        alert(json.error || 'Failed to remove skill');
      }
    } catch (err) {
      console.error('Remove skill fetch error', err);
      alert('Network or server error.');
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">SkillSwap</h1>
              <div className="ml-10 flex space-x-4">
                <button type="button" onClick={() => setActiveTab('overview')}
                  className={`px-3 py-2 rounded-md ${activeTab === 'overview' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  Overview
                </button>
                <button type="button" onClick={() => setActiveTab('skills')}
                  className={`px-3 py-2 rounded-md ${activeTab === 'skills' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  My Skills
                </button>
                <button type="button" onClick={() => setActiveTab('requests')}
                  className={`px-3 py-2 rounded-md ${activeTab === 'requests' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  Swap Requests
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, <strong>{user?.name}</strong>!</span>
              <button type="button" onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">My Skills</h3>
                  <p className="text-3xl font-bold text-blue-600">{skills.length}</p>
                  <p className="text-gray-600 mt-2">Skills you can teach others</p>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                  <h3 className="text-lg font-semibold text-green-700 mb-2">Swap Requests</h3>
                  <p className="text-3xl font-bold text-green-600">{swapRequests.length}</p>
                  <p className="text-gray-600 mt-2">Pending skill exchanges</p>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                  <h3 className="text-lg font-semibold text-purple-700 mb-2">Community Rating</h3>
                  <p className="text-3xl font-bold text-purple-600">{avgRating}★</p>
                  <p className="text-gray-600 mt-2">Based on {reviewCount} reviews</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white">
                <h3 className="text-xl font-bold mb-4">Ready to Swap Skills?</h3>
                <p className="mb-6">Find someone who has skills you want to learn, and offer your expertise in return!</p>
                <Link 
                  href="/browse" 
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
                >
                  Browse Available Skills →
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">My Skills</h2>

              <form onSubmit={handleAddSkill} className="mb-8">
                <div className="flex gap-2">
                  <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="What skill can you teach? (e.g., Guitar lessons, Photoshop, Cooking)"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button type="submit" disabled={isSubmitting}
                    className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isSubmitting ? 'Adding…' : 'Add Skill'}
                  </button>
                </div>
                <p className="text-gray-500 text-sm mt-2">Add skills you're willing to teach others</p>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skills.length > 0 ? (
                  skills.map((skill, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-gray-800">{skill.skill_name}</h4>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Active</span>
                      </div>
                      {skill.description && <p className="text-gray-600 text-sm mt-2">{skill.description}</p>}
                      <div className="mt-4 flex justify-between">
                        <button type="button" onClick={() => handleEditSkill(skill)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          disabled={removingId === skill.id}
                          className={`text-red-600 hover:text-red-800 text-sm ${removingId === skill.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {removingId === skill.id ? 'Removing…' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8">
                    <div className="text-gray-400 mb-4">🎯</div>
                    <p className="text-gray-600">No skills added yet. Add your first skill above!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Swap Requests</h2>
              
              {swapRequests.length > 0 ? (
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">John wants to learn: <span className="text-blue-600">Photoshop Editing</span></h4>
                        <p className="text-gray-600 text-sm mt-1">Offers: Guitar lessons in exchange</p>
                        <p className="text-gray-500 text-xs mt-2">Sent 2 days ago</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                          Accept
                        </button>
                        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🤝</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No swap requests yet</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    When someone wants to learn a skill you offer, you'll see swap requests here.
                  </p>
                  <button className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                    Browse Skills to Request
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-800 mb-3">📤 Upload Profile Picture</h3>
            <p className="text-gray-600 text-sm mb-4">Make your profile more recognizable</p>
            <input
              type="file"
              id="profileUpload"
              accept="image/*"
              onChange={handleProfileUpload}
              className="hidden"
            />
            <label 
              htmlFor="profileUpload"
              className="block w-full bg-gray-100 text-gray-700 py-2 rounded text-center hover:bg-gray-200 cursor-pointer"
            >
              Choose File
            </label>
            {profileImage && (
              <div className="mt-3">
                <p className="text-green-600 text-sm">✓ Uploaded successfully!</p>
              </div>
            )}
          </div>
          
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-800 mb-3">💬 Send Message</h3>
            <p className="text-gray-600 text-sm mb-4">Send message to another user (demo: use ID 2)</p>
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Receiver User ID (try 2)"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                id="receiverId"
                defaultValue="2"
              />
              <textarea
                placeholder="Your message..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                rows="2"
                id="messageText"
              />
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage}
                className={`w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 ${sendingMessage ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {sendingMessage ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
          
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-800 mb-3">⭐ Give Feedback</h3>
            <p className="text-gray-600 text-sm mb-4">Rate your recent skill swaps</p>
            <button
              type="button"
              onClick={() => setShowFeedbackModal(true)}
              className="w-full bg-yellow-50 text-yellow-700 py-2 rounded hover:bg-yellow-100"
            >
              Rate Experience
            </button>
          </div>
        </div>
        
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowFeedbackModal(false)} />
            <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-lg">
              <h3 className="text-lg font-semibold mb-3">Give Feedback</h3>
              <p className="text-sm text-gray-600 mb-4">Rate your experience (1-5) and leave a comment.</p>
              <div className="flex items-center space-x-3 mb-4">
                {[1,2,3,4,5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRatingValue(n)}
                    className={`px-3 py-2 rounded ${ratingValue === n ? 'bg-yellow-300' : 'bg-gray-100'}`}
                  >
                    {n}★
                  </button>
                ))}
              </div>
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 mb-4"
                rows={4}
                placeholder="Optional comment"
              />
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowFeedbackModal(false)} className="px-4 py-2 rounded border">Cancel</button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/ratings/add', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ score: ratingValue, comment: feedbackComment }),
                        credentials: 'include'
                      });
                      const data = await res.json().catch(() => ({}));
                      if (res.ok) {
                        alert('Thank you for your feedback');
                        setShowFeedbackModal(false);
                        setFeedbackComment('');
                        setRatingValue(5);
                        fetchRatings();
                      } else {
                        alert(data.error || 'Failed to submit feedback');
                      }
                    } catch (err) {
                      console.error('Submit feedback error:', err);
                      alert('Network error. Please try again.');
                    }
                  }}
                  className="px-4 py-2 rounded bg-yellow-400 text-white"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}