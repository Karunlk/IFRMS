import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Check, X, Zap, Shield, Star, Lock } from 'lucide-react';
import { fetchApi } from '../utils/api';
import { useToast } from '../context/ToastContext';

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 499,
    color: 'text-blue-400',
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/10',
    icon: Zap,
    features: ['Access to gym floor', 'Basic equipment usage', 'Locker room access', '1 fitness assessment/month'],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 999,
    color: 'text-rose-400',
    border: 'border-rose-500/40',
    bg: 'bg-rose-500/10',
    icon: Star,
    popular: true,
    features: ['Everything in Basic', '2 trainer sessions/month', 'Group fitness classes', 'Nutrition consultation', 'Progress tracking'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 1999,
    color: 'text-yellow-400',
    border: 'border-yellow-500/40',
    bg: 'bg-yellow-500/10',
    icon: Shield,
    features: ['Everything in Standard', 'Unlimited trainer sessions', 'Personal workout plan', 'Diet & nutrition plan', 'Priority equipment access', '24/7 gym access'],
  },
];

export default function PaymentModal({ onClose, onSuccess, currentPlan, expiryDate }) {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan || 'basic');
  const [months, setMonths] = useState(1);
  const [step, setStep] = useState('plans'); // plans | payment | processing | success
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const plan = PLANS.find(p => p.id === selectedPlan);
  const total = plan ? plan.price * months : 0;

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStep('processing');

    try {
      // Step 1: Create payment intent
      const intentRes = await fetchApi('/payments/create-intent', {
        method: 'POST',
        body: JSON.stringify({ plan: selectedPlan, months })
      });

      // Step 2: In mock mode, skip Stripe.js and directly confirm
      const confirmRes = await fetchApi('/payments/confirm', {
        method: 'POST',
        body: JSON.stringify({
          paymentIntentId: intentRes.paymentIntentId,
          plan: selectedPlan,
          months
        })
      });

      setStep('success');
      toast.success(`Membership renewed! Valid until ${new Date(confirmRes.newExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`);
      if (onSuccess) onSuccess(confirmRes);
    } catch (err) {
      toast.error(err.message || 'Payment failed. Please try again.');
      setStep('payment');
    } finally {
      setLoading(false);
    }
  };

  const formatCard = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return cleaned;
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500/20 rounded-2xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold">Renew Membership</h2>
              {expiryDate && (
                <p className="text-xs text-zinc-500">
                  Current plan: <span className="text-zinc-300 capitalize">{currentPlan}</span> · Expires: {new Date(expiryDate).toLocaleDateString('en-IN')}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Plan Selection */}
          {step === 'plans' && (
            <motion.div key="plans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
              <h3 className="text-lg font-bold mb-6">Choose Your Plan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {PLANS.map(p => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedPlan === p.id
                        ? `${p.border} ${p.bg}`
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-rose-500 text-white text-xs font-bold rounded-full">
                        POPULAR
                      </span>
                    )}
                    <div className={`w-8 h-8 rounded-xl ${p.bg} flex items-center justify-center mb-3`}>
                      <p.icon className={`w-4 h-4 ${p.color}`} />
                    </div>
                    <div className="font-bold text-lg mb-1">{p.name}</div>
                    <div className={`text-2xl font-extrabold ${p.color} mb-3`}>₹{p.price}<span className="text-sm font-medium text-zinc-400">/mo</span></div>
                    <ul className="space-y-1">
                      {p.features.slice(0, 3).map(f => (
                        <li key={f} className="flex items-start gap-2 text-xs text-zinc-400">
                          <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${p.color}`} /> {f}
                        </li>
                      ))}
                    </ul>
                    {selectedPlan === p.id && (
                      <div className={`absolute top-3 right-3 w-5 h-5 rounded-full ${p.bg} border ${p.border} flex items-center justify-center`}>
                        <Check className={`w-3 h-3 ${p.color}`} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Duration */}
              <div className="mb-6">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 block">Duration</label>
                <div className="flex gap-3">
                  {[1, 3, 6, 12].map(m => (
                    <button
                      key={m}
                      onClick={() => setMonths(m)}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                        months === m
                          ? 'bg-white text-black'
                          : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                      }`}
                    >
                      {m === 12 ? '1 Year' : `${m} Mo`}
                      {m >= 3 && <span className="block text-xs font-normal opacity-70">{m === 3 ? 'Save 5%' : m === 6 ? 'Save 10%' : 'Save 15%'}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-400">{plan?.name} Plan × {months} month{months > 1 ? 's' : ''}</span>
                  <span>₹{total}</span>
                </div>
                {months >= 3 && (
                  <div className="flex justify-between text-sm mb-2 text-green-500">
                    <span>Discount ({months === 3 ? '5' : months === 6 ? '10' : '15'}%)</span>
                    <span>-₹{Math.round(total * (months === 3 ? 0.05 : months === 6 ? 0.10 : 0.15))}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-lg pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-rose-400">₹{months >= 3 ? Math.round(total * (1 - (months === 3 ? 0.05 : months === 6 ? 0.10 : 0.15))) : total}</span>
                </div>
              </div>

              <button
                onClick={() => setStep('payment')}
                className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                Continue to Payment <CreditCard className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* Step 2: Payment Form */}
          {step === 'payment' && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6">
              <button onClick={() => setStep('plans')} className="text-sm text-zinc-400 hover:text-white mb-6 flex items-center gap-2 transition-colors">
                ← Back to plans
              </button>
              <h3 className="text-lg font-bold mb-2">Payment Details</h3>
              <p className="text-sm text-zinc-500 mb-6 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Secured with 256-bit SSL encryption
              </p>

              {/* Plan summary bar */}
              <div className={`flex items-center justify-between p-4 rounded-2xl border ${plan?.border} ${plan?.bg} mb-6`}>
                <div>
                  <div className="font-bold capitalize">{plan?.name} Plan · {months} month{months > 1 ? 's' : ''}</div>
                  <div className="text-xs text-zinc-400">Membership renewal</div>
                </div>
                <div className={`text-xl font-extrabold ${plan?.color}`}>
                  ₹{months >= 3 ? Math.round(total * (1 - (months === 3 ? 0.05 : months === 6 ? 0.10 : 0.15))) : total}
                </div>
              </div>

              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="Name on card"
                    required
                    value={cardDetails.name}
                    onChange={e => setCardDetails({ ...cardDetails, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      required
                      value={cardDetails.number}
                      onChange={e => setCardDetails({ ...cardDetails, number: formatCard(e.target.value) })}
                      maxLength={19}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                    <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      required
                      value={cardDetails.expiry}
                      onChange={e => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })}
                      maxLength={5}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">CVV</label>
                    <input
                      type="text"
                      placeholder="•••"
                      required
                      value={cardDetails.cvv}
                      onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      maxLength={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <p className="text-xs text-zinc-500 mb-4 text-center">
                    🔒 This is a demo environment. No real payment will be processed.
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-5 h-5" />
                    Pay ₹{months >= 3 ? Math.round(total * (1 - (months === 3 ? 0.05 : months === 6 ? 0.10 : 0.15))) : total}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Processing */}
          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <div className="w-20 h-20 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
              </div>
              <h3 className="text-xl font-bold mb-2">Processing Payment</h3>
              <p className="text-zinc-400">Please wait while we process your payment...</p>
            </motion.div>
          )}

          {/* Success */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-10 h-10 text-green-500" />
              </motion.div>
              <h3 className="text-2xl font-extrabold mb-2">Payment Successful!</h3>
              <p className="text-zinc-400 mb-8">Your <span className="text-white font-bold capitalize">{selectedPlan}</span> membership has been renewed for {months} month{months > 1 ? 's' : ''}.</p>
              <button
                onClick={onClose}
                className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-colors"
              >
                Back to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
