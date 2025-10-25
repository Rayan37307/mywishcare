// src/components/OTPAuthModal.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { otpAuthService } from '../services/otpAuthService';
import { Link } from 'react-router-dom';

interface OTPAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OTPAuthModal: React.FC<OTPAuthModalProps> = ({ isOpen, onClose }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  const { refetchUser } = useAuth();

  // Normalize and validate phone input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d]/g, ''); // Only numbers
    if (value.startsWith('91')) value = value.slice(2);
    if (value.length > 10) value = value.slice(0, 10);
    setPhone(value);
  };

  const fullPhone = `+91${phone}`;

  const startCountdown = () => {
    setCountdown(30);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const result = await otpAuthService.sendOTP(fullPhone);
      if (result.success) {
        setMessage(result.message || 'OTP sent successfully!');
        setStep('otp');
        startCountdown();
      } else setError(result.error || 'Failed to send OTP');
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await otpAuthService.verifyOTP(fullPhone, otp);
      if (result.error) setError(result.error);
      else if (result.user) {
        setMessage('Authenticated successfully! Redirecting...');
        refetchUser();
        setTimeout(onClose, 1500);
      }
    } catch {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const result = await otpAuthService.sendOTP(fullPhone);
      if (result.success) {
        setMessage('OTP resent successfully!');
        startCountdown();
      } else setError(result.error || 'Failed to resend OTP');
    } catch {
      setError('Error resending OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setStep('phone');
    setPhone('');
    setOtp('');
    setError('');
    setMessage('');
    setCountdown(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
       <button
      onClick={handleCancel}
      className="absolute top-6 right-6 z-50 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-md w-10 h-10 flex items-center justify-center backdrop-blur-md border border-gray-200 transition"
    >
      ✕
    </button>
      <div className="bg-gradient-to-b from-gray-900/20 via-[#EBE4FD] to-[#EBE4FD] p-6 backdrop-blur-[50px] rounded-lg w-full max-w-5xl h-[400px] overflow-hidden flex flex-col md:flex-row">
        {/* Left Image */}
        <div className="w-full md:w-2/3 flex items-center justify-center">
          <img
            src="/authlogo.png"
            alt="Authentication"
            className="w-[40%] h-auto object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'%3E%3Crect width='200' height='300' fill='%23e0e0e0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%23999'%3EAuthentication%3C/text%3E%3C/svg%3E";
            }}
          />
        </div>

        {/* Right Form */}
        <div className="w-full md:w-1/3 px-4 flex flex-col justify-center rounded-lg bg-[#EBE4FD]">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm">{message}</div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="flex flex-col justify-center text-center">
              <div className="mb-4">
                <h1 className="text-xl text-center">Login</h1>
                <label
                  htmlFor="phone"
                  className="block text-md font-medium text-gray-700 mb-8 mt-4"
                >
                  Mobile Number
                </label>

                <div className="flex items-center w-full border border-gray-300 bg-gray-50 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400">
                  <div className="flex items-center px-3 gap-2">
                    <img
                      src="https://flagcdn.com/w20/in.png"
                      alt="India Flag"
                      className="w-5 h-5 object-cover rounded-sm"
                    />
                    <span className="text-gray-700 font-medium">+91</span>
                  </div>
                  <div className="h-6 w-px bg-gray-300 mx-2"></div>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="flex-1 px-3 py-2 outline-none border-none bg-transparent"
                    placeholder="Enter Mobile Number"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="w-full bg-transparent border border-gray-300 text-black font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="flex flex-col justify-center flex-grow">
              <div className="mb-4">
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Enter OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, ''))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-transparent border border-gray-300 text-black font-bold py-2 px-4 rounded-md focus:outline-none disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading || countdown > 0}
                className={`mt-3 w-full text-blue-600 hover:text-blue-800 text-sm ${countdown > 0 ? 'opacity-50' : ''}`}
              >
                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
              </button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="mt-3 w-full text-gray-600 hover:text-gray-800 text-sm"
              >
                Use different number
              </button>
            </form>
          )}

          <p className="mt-4 text-xs text-gray-500 text-center">
            I accept that I have read & understood Gokwik's Privacy Policy and T&Cs.
          </p>
          <Link
            to="/"
            className="underline text-xs text-center text-gray-400 mt-10 mb-4"
          >
            Trouble logging in?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OTPAuthModal;