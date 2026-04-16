import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, Phone, Calendar, Chrome } from 'lucide-react';
import { fetchApi } from '../utils/api';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  isConfigured as firebaseConfigured,
} from '../firebase';

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Exchange a Firebase ID token for our app JWT
  const exchangeFirebaseToken = async (firebaseUser, extra = {}) => {
    const idToken = await firebaseUser.getIdToken();
    const data = await fetchApi('/auth/firebase', {
      method: 'POST',
      body: JSON.stringify({ idToken, ...extra }),
    });
    onLogin(data.user, data.token);
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    if (!firebaseConfigured) return;
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await exchangeFirebaseToken(result.user);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Firebase Email/Password submit (login or register)
  const handleFirebaseSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (isLogin) {
        const credential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        await exchangeFirebaseToken(credential.user);
      } else {
        const credential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(credential.user, { displayName: formData.name });
        await exchangeFirebaseToken(credential.user, { phone: formData.phone, dob: formData.dob });
      }
    } catch (err) {
      setError(err.message?.replace('Firebase: ', '') || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Classic backend login/register (fallback when Firebase not configured)
  const handleClassicSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const data = await fetchApi(endpoint, {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!firebaseConfigured || !formData.email) return;
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, formData.email);
      setInfo('Password reset email sent! Check your inbox.');
      setShowReset(false);
    } catch (err) {
      setError(err.message?.replace('Firebase: ', '') || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  // Use Firebase auth when configured, otherwise fall back to classic
  const handleSubmit = firebaseConfigured ? handleFirebaseSubmit : handleClassicSubmit;

  return (
    <div className="pt-28 pb-20 min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-white/60 font-medium">
            {isLogin
              ? 'Enter your credentials to access your account.'
              : 'Join MUSCLE UP to start your fitness journey.'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-rose-500/10 border border-rose-500/50 rounded-xl text-rose-400 text-sm font-semibold text-center">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-5 p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-xl text-emerald-400 text-sm font-semibold text-center">
            {info}
          </div>
        )}

        {/* Google Sign-In */}
        {firebaseConfigured && (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-zinc-900 font-bold rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50 mb-5"
            >
              <Chrome className="w-5 h-5 text-rose-500" />
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-zinc-500 font-medium">or with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          </>
        )}

        {/* Email/Password Form */}
        {!showReset ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    required
                    onChange={handleChange}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    onChange={handleChange}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="date"
                    name="dob"
                    onChange={handleChange}
                    className="w-full bg-transparent border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            {isLogin && firebaseConfigured && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowReset(true)}
                  className="text-xs text-zinc-500 hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors mt-2 disabled:opacity-50"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        ) : (
          /* Password Reset Form */
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <p className="text-sm text-zinc-400 text-center mb-2">
              Enter your email and we'll send a reset link.
            </p>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Email'}
            </button>
            <button
              type="button"
              onClick={() => setShowReset(false)}
              className="w-full py-2 text-sm text-zinc-500 hover:text-white transition-colors"
            >
              Back to Sign In
            </button>
          </form>
        )}

        {!showReset && (
          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); setInfo(''); }}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Sign In'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
