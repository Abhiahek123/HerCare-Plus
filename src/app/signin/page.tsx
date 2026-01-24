"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Check } from "lucide-react";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

export default function SignInPage() {
  const [showGoogleConfirm, setShowGoogleConfirm] = useState(false);

  const handleLocalLogin = () => {
    localStorage.setItem("hercare_auth_mode", "local");
    window.history.back();
  };

  const handleGoogleLogin = () => {
    setShowGoogleConfirm(true);
  };

  const confirmGoogleLogin = () => {
    localStorage.setItem("hercare_auth_mode", "google");
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 pt-20 pb-24 px-6">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Shield size={40} className="text-purple-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Save your space (optional)
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
            You can use HerCare⁺ without signing in.<br />
            Sign in <strong>only if</strong> you want your data saved securely.
          </p>
        </motion.div>

        <div className="space-y-4">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={handleGoogleLogin}
            className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 rounded-2xl p-5 flex items-center gap-4 transition-all shadow-sm hover:shadow-md group"
          >
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-2xl">🔐</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-800 mb-0.5">Continue with Google</p>
              <p className="text-xs text-gray-500">Sync across your devices</p>
            </div>
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs text-center text-gray-500 -mt-2 px-4"
          >
            We only access your email to create a secure account.
          </motion.p>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={handleLocalLogin}
            className="w-full bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-300 rounded-2xl p-5 transition-all shadow-sm hover:shadow-md group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                <Lock size={20} className="text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-purple-900 mb-0.5">Continue on this device</p>
                <p className="text-xs text-purple-700">Maximum privacy (recommended)</p>
              </div>
            </div>

            <div className="space-y-2 pl-14">
              <div className="flex items-center gap-2 text-xs text-purple-700">
                <Check size={14} className="shrink-0" />
                <span>Data stored on your device only</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-purple-700">
                <Check size={14} className="shrink-0" />
                <span>Encrypted and private</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-purple-700">
                <Check size={14} className="shrink-0" />
                <span>Not uploaded to servers</span>
              </div>
            </div>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center space-y-3"
        >
          <button
            onClick={() => window.history.back()}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            Skip for now
          </button>
          <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
            You can always sign in later from the menu. HerCare⁺ works perfectly without an account.
          </p>
        </motion.div>
      </div>

      <AnimatePresence>
        {showGoogleConfirm && (
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGoogleConfirm(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
            >
              <div className="bg-white rounded-[28px] shadow-2xl max-w-sm w-full p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Shield size={32} className="text-green-600" />
                </div>

                <h2 className="text-xl font-bold text-center text-gray-800 mb-3">
                  You're in control
                </h2>
                <p className="text-sm text-center text-gray-600 mb-6">
                  Before we connect to Google, here's what you should know:
                </p>

                <div className="space-y-3 mb-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-start gap-3 p-3 bg-green-50 rounded-xl"
                  >
                    <Check size={18} className="text-green-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-green-900">
                      <strong>Anonymous mode</strong> still enabled
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl"
                  >
                    <Check size={18} className="text-purple-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-purple-900">
                      <strong>No health data</strong> shared with Google
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-start gap-3 p-3 bg-pink-50 rounded-xl"
                  >
                    <Check size={18} className="text-pink-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-pink-900">
                      You can <strong>delete account</strong> anytime
                    </p>
                  </motion.div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={confirmGoogleLogin}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all"
                  >
                    Continue safely
                  </button>
                  <button
                    onClick={() => setShowGoogleConfirm(false)}
                    className="w-full text-gray-500 py-3 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
