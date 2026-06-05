import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NeuralBackground from '../components/ui/NeuralBackground';
import GlassCard from '../components/ui/GlassCard';

function ShieldLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="electric-glow flex-shrink-0">
      <path d="M50 10L15 25V50C15 72.5 30 92.5 50 100C70 92.5 85 72.5 85 50V25L50 10Z" stroke="#0066FF" strokeWidth="4" strokeLinejoin="round"/>
      <circle cx="50" cy="50" r="12" stroke="#0066FF" strokeWidth="3"/>
      <path d="M50 38V28" stroke="#0066FF" strokeWidth="2" strokeLinecap="round"/>
      <path d="M50 72V62" stroke="#0066FF" strokeWidth="2" strokeLinecap="round"/>
      <path d="M62 50L72 50" stroke="#0066FF" strokeWidth="2" strokeLinecap="round"/>
      <path d="M28 50L38 50" stroke="#0066FF" strokeWidth="2" strokeLinecap="round"/>
      <path d="M41 41L34 34" stroke="#0066FF" strokeWidth="2" strokeLinecap="round"/>
      <path d="M59 59L66 66" stroke="#0066FF" strokeWidth="2" strokeLinecap="round"/>
      <path d="M41 59L34 66" stroke="#0066FF" strokeWidth="2" strokeLinecap="round"/>
      <path d="M59 41L66 34" stroke="#0066FF" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function InputField({ id, icon, type = 'text', value, onChange, placeholder, required, children }) {
  return (
    <div className="relative">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
        {icon}
      </span>
      {children ?? (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="
            w-full pl-10 pr-4 py-3
            bg-[#0A0A0A] border border-outline-variant rounded-xl
            text-on-surface placeholder:text-on-surface-variant/40
            focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/50
            transition-all text-body-sm
          "
        />
      )}
    </div>
  );
}

function Alert({ type, message }) {
  const isError = type === 'error';
  return (
    <div className={`flex gap-2 p-3 rounded-xl text-body-sm border ${
      isError
        ? 'bg-error/10 border-error/20 text-error'
        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
    }`}>
      <span className="material-symbols-outlined text-[18px]">
        {isError ? 'error' : 'check_circle'}
      </span>
      {message}
    </div>
  );
}

function Tab({ id, label, active, onClick }) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
        active
          ? 'bg-primary-container text-on-primary-container shadow-sm'
          : 'text-on-surface-variant hover:text-on-surface'
      }`}
    >
      {label}
    </button>
  );
}

// Defined at module level to prevent input element remounting and losing focus on keystroke.
function PasswordInput({ id, value, onChange, placeholder = '\u00b7\u00b7\u00b7\u00b7\u00b7\u00b7\u00b7\u00b7', showPassword, setShowPassword }) {
  return (
    <div className="relative">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
        lock
      </span>
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
        className="
          w-full pl-10 pr-12 py-3
          bg-[#0A0A0A] border border-outline-variant rounded-xl
          text-on-surface placeholder:text-on-surface-variant/40
          focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/50
          transition-all text-body-sm
        "
      />
      <button
        type="button"
        onClick={() => setShowPassword((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
        tabIndex={-1}
      >
        <span className="material-symbols-outlined text-[20px]">
          {showPassword ? 'visibility_off' : 'visibility'}
        </span>
      </button>
    </div>
  );
}

export default function LoginPage() {
  const { login, register, roleOptions, isRoleCatalogLoading, roleCatalogError } = useAuth();

  const [activeTab, setActiveTab] = useState('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('sales');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const [formError,   setFormError]   = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isLoading,   setIsLoading]   = useState(false);

  useEffect(() => {
    if (roleOptions.length > 0) {
      setSelectedRole((current) =>
        roleOptions.some((option) => option.value === current)
          ? current
          : roleOptions[0].value
      );
    }
  }, [roleOptions]);

  function switchTab(tab) {
    setActiveTab(tab);
    setFormError('');
    setFormSuccess('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsLoading(true);

    const result = await login(email, password);
    if (!result.success) setFormError(result.error);

    setIsLoading(false);
  }

  async function handleRegister(e) {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);

    const result = await register(email, password, selectedRole);
    if (result.success) {
      setFormSuccess(result.message || 'Account created! You can now sign in.');
      setTimeout(() => switchTab('login'), 2000);
    } else {
      setFormError(result.error);
    }

    setIsLoading(false);
  }

  return (
    <main className="flex min-h-screen bg-background overflow-hidden">
      <section className="w-full lg:w-[480px] xl:w-[540px] flex flex-col justify-between p-8 md:p-12 z-10 bg-background">
        <div className="flex items-center gap-3">
          <ShieldLogo size={40} />
          <span className="font-bold text-primary tracking-tight text-xl">QueryShield AI</span>
        </div>

        <GlassCard className="p-8 md:p-10 rounded-xl my-8">
          <header className="mb-6">
            <h1 className="font-headline-lg text-headline-lg mb-1 text-on-surface">
              {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-body-sm text-on-surface-variant">
              Secure AI-Powered Database Intelligence
            </p>
          </header>

          <div className="flex gap-1 p-1 bg-surface-container-low rounded-xl mb-6">
            <Tab id="tab-signin"  label="Sign In"  active={activeTab === 'login'}    onClick={() => switchTab('login')} />
            <Tab id="tab-signup"  label="Sign Up"  active={activeTab === 'register'} onClick={() => switchTab('register')} />
          </div>

          {formError   && <div className="mb-4"><Alert type="error"   message={formError}   /></div>}
          {formSuccess && <div className="mb-4"><Alert type="success" message={formSuccess} /></div>}

          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="login-email" className="text-body-sm font-medium text-on-surface-variant uppercase tracking-wider">
                  Work Email
                </label>
                <InputField id="login-email" icon="mail">
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                    className="
                      w-full pl-10 pr-4 py-3
                      bg-[#0A0A0A] border border-outline-variant rounded-xl
                      text-on-surface placeholder:text-on-surface-variant/40
                      focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/50
                      transition-all text-body-sm
                    "
                  />
                </InputField>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label htmlFor="login-password" className="text-body-sm font-medium text-on-surface-variant uppercase tracking-wider">
                    Password
                  </label>
                  <a href="#" className="text-body-sm text-primary hover:underline">Forgot password?</a>
                </div>
                <PasswordInput
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
              </div>

              <button
                id="sign-in-btn"
                type="submit"
                disabled={isLoading}
                className="
                  w-full py-4 mt-2
                  bg-primary-container text-on-primary-container
                  font-semibold text-base rounded-xl
                  neon-glow-primary
                  flex items-center justify-center gap-2
                  disabled:opacity-60 disabled:cursor-not-allowed
                  active:scale-[0.98] transition-all
                "
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Authenticating…</span>
                  </>
                ) : (
                  <>
                    <span>Secure Sign In</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>

              <p className="text-center text-body-sm text-on-surface-variant">
                No account?{' '}
                <button type="button" onClick={() => switchTab('register')} className="text-primary hover:underline font-medium">
                  Create one
                </button>
              </p>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="reg-email" className="text-body-sm font-medium text-on-surface-variant uppercase tracking-wider">
                  Work Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">mail</span>
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                    className="
                      w-full pl-10 pr-4 py-3
                      bg-[#0A0A0A] border border-outline-variant rounded-xl
                      text-on-surface placeholder:text-on-surface-variant/40
                      focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/50
                      transition-all text-body-sm
                    "
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="reg-role" className="text-body-sm font-medium text-on-surface-variant uppercase tracking-wider">
                  Your Role
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">badge</span>
                  <select
                    id="reg-role"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    disabled={isRoleCatalogLoading && roleOptions.length === 0}
                    className="
                      w-full pl-10 pr-4 py-3
                      bg-[#0A0A0A] border border-outline-variant rounded-xl
                      text-on-surface appearance-none text-body-sm
                      focus:outline-none focus:border-primary-container
                      cursor-pointer transition-colors
                    "
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="reg-password" className="text-body-sm font-medium text-on-surface-variant uppercase tracking-wider">
                  Password <span className="text-on-surface-variant/50 normal-case">(min 8 chars)</span>
                </label>
                <PasswordInput
                  id="reg-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="reg-confirm-password" className="text-body-sm font-medium text-on-surface-variant uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">lock_reset</span>
                  <input
                    id="reg-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="
                      w-full pl-10 pr-4 py-3
                      bg-[#0A0A0A] border border-outline-variant rounded-xl
                      text-on-surface placeholder:text-on-surface-variant/40
                      focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/50
                      transition-all text-body-sm
                    "
                  />
                </div>
              </div>

              <button
                id="sign-up-btn"
                type="submit"
                disabled={isLoading}
                className="
                  w-full py-4 mt-1
                  bg-primary-container text-on-primary-container
                  font-semibold text-base rounded-xl
                  neon-glow-primary
                  flex items-center justify-center gap-2
                  disabled:opacity-60 disabled:cursor-not-allowed
                  active:scale-[0.98] transition-all
                "
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Creating Account…</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">person_add</span>
                    <span>Create Account</span>
                  </>
                )}
              </button>

              <p className="text-center text-body-sm text-on-surface-variant">
                Already have an account?{' '}
                <button type="button" onClick={() => switchTab('login')} className="text-primary hover:underline font-medium">
                  Sign in
                </button>
              </p>
            </form>
          )}
        </GlassCard>

        <div className="flex flex-wrap items-center justify-between gap-4 opacity-50">
          {[
            { icon: 'security',             label: 'JWT AUTH' },
            { icon: 'verified_user',        label: 'SQL VALIDATION' },
            { icon: 'admin_panel_settings', label: 'RBAC ENFORCED' },
          ].map((badge) => (
            <div key={badge.label} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">{badge.icon}</span>
              <span className="font-mono text-[11px] tracking-tight">{badge.label}</span>
            </div>
          ))}
        </div>

        {(isRoleCatalogLoading || roleCatalogError) && (
          <div className="mt-5 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
            {isRoleCatalogLoading && <p>Loading backend role catalog…</p>}
            {roleCatalogError && <p>{roleCatalogError}</p>}
          </div>
        )}
      </section>

      <section className="hidden lg:flex flex-1 relative overflow-hidden">
        <NeuralBackground>
          <div className="w-full max-w-xl px-10 space-y-5">
            <GlassCard className="p-7 rounded-xl transform -rotate-2 translate-x-4">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="status-dot-active" />
                  <span className="font-mono text-primary text-[13px]">
                    AI ENGINE: SECURE_QUERY_v4.2
                  </span>
                </div>
                <span className="font-mono text-[11px] opacity-40">JWT VERIFIED</span>
              </div>
              <div className="space-y-2.5 opacity-70">
                <div className="h-px bg-gradient-to-r from-primary/40 to-transparent w-[90%] rounded" />
                <div className="h-px bg-gradient-to-r from-primary/20 to-transparent w-[70%] rounded" />
                <div className="h-px bg-gradient-to-r from-primary/60 to-transparent w-[85%] rounded" />
              </div>
            </GlassCard>

            <div className="flex justify-center py-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/15 blur-3xl rounded-full scale-150" />
                <GlassCard className="w-44 h-44 rounded-full flex items-center justify-center border-2 border-primary/30 relative">
                  <span className="material-symbols-outlined text-[90px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    shield
                  </span>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full shadow-[0_0_12px_#b3c5ff]" />
                  <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-secondary-container rounded-full shadow-[0_0_8px_#00eefc]" />
                </GlassCard>
              </div>
            </div>

            <GlassCard className="p-6 rounded-xl transform rotate-1 -translate-x-6 border border-primary/10">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-px h-10 bg-gradient-to-b from-primary/50 to-transparent" />
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>
                <div>
                  <h4 className="text-on-surface font-semibold text-sm mb-1">
                    Zero-Trust Authentication
                  </h4>
                  <p className="text-on-surface-variant text-[13px] leading-relaxed">
                    Every request verified via signed JWT.
                    Roles enforced server-side — never trusted from the client.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </NeuralBackground>
      </section>
    </main>
  );
}

