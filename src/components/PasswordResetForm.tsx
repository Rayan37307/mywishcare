import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const PasswordResetForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [isFormValid, setIsFormValid] = useState(true);
  
  const key = searchParams.get('key') || '';
  const login = searchParams.get('login') || '';
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if required parameters are present
    if (!key || !login) {
      toast.error('Invalid password reset link. Please try again.');
      // Redirect to login or home page
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  }, [key, login, navigate]);

  const validatePassword = (password: string) => {
    // At least 8 characters, contains uppercase, lowercase, and number
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    return hasMinLength && hasUpperCase && hasLowerCase && hasNumbers;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    // Validate password strength
    if (!validatePassword(password)) {
      setIsFormValid(false);
      toast.error('Password must be at least 8 characters with uppercase, lowercase, and number');
      return;
    }

    setLoading(true);
    
    try {
      // Call your custom WordPress endpoint to reset the password
      // Note: The reset password action might not need a nonce, unlike the request password reset action
      const response = await fetch('https://wishcarebd.com/wp-admin/admin-ajax.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=custom_reset_password&key=${encodeURIComponent(key)}&login=${encodeURIComponent(login)}&password=${encodeURIComponent(password)}`,
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Password reset successfully!');
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/'); // Redirect to home or login page
        }, 2000);
      } else {
        toast.error(data.data || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30">
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 right-6 z-50 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-md w-10 h-10 flex items-center justify-center backdrop-blur-md border border-gray-200 transition"
      >
        ✕
      </button>
      <div className="bg-gradient-to-b from-pink-100 via-[#EBE4FD] to-[#EBE4FD] p-6 backdrop-blur-[50px] rounded-lg w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Reset Your Password</h2>
          <p className="text-sm text-gray-600 mt-2">Enter your new password below</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-left text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className={`flex items-center w-full border ${isFormValid ? 'border-gray-300' : 'border-red-500'} bg-gray-50 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400`}>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (!validatePassword(e.target.value)) {
                    setIsFormValid(false);
                  } else {
                    setIsFormValid(true);
                  }
                }}
                className="flex-1 px-3 py-2 outline-none border-none bg-transparent"
                placeholder="Enter new password"
                required
              />
            </div>
            {!isFormValid && (
              <p className="text-xs text-red-500 mt-1">
                Password must be at least 8 characters with uppercase, lowercase, and number
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-left text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="flex items-center w-full border border-gray-300 bg-gray-50 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400">
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flex-1 px-3 py-2 outline-none border-none bg-transparent"
                placeholder="Confirm new password"
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !key || !login}
            className="w-full bg-transparent border border-gray-300 text-black font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        
        <p className="mt-4 text-xs text-gray-500 text-center">
          After resetting your password, you'll be redirected to the login page.
        </p>
      </div>
    </div>
  );
};

export default PasswordResetForm;