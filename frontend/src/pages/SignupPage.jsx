import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const navigate = useNavigate();
  const { login: setSession } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const data = await signup(form);
      setSession(data.user, data.token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-hero px-6 py-12">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
        <div className="card glass p-6">
          <h2 className="text-2xl font-semibold text-ink">Create your LifeLens</h2>
          <p className="mt-2 text-sm text-slate-500">Start a premium journaling ritual in minutes.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm focus:outline-none"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm focus:outline-none"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm focus:outline-none"
              required
            />
            {error && <p className="text-sm text-rose-500">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-glow"
            >
              Create account
            </button>
          </form>
          <p className="mt-6 text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-slate-900">
              Sign in
            </Link>
          </p>
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Premium Ritual</p>
          <h1 className="mt-4 text-4xl font-semibold text-ink">
            Build a mindful archive of your best moments.
          </h1>
          <p className="mt-4 text-slate-600">
            LifeLens keeps your reflections secure, insightful, and beautifully organized.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-600">
            <div className="rounded-2xl bg-white/70 px-4 py-3 shadow">AI summaries</div>
            <div className="rounded-2xl bg-white/70 px-4 py-3 shadow">Mood analytics</div>
            <div className="rounded-2xl bg-white/70 px-4 py-3 shadow">Voice capture</div>
            <div className="rounded-2xl bg-white/70 px-4 py-3 shadow">Weekly review</div>
          </div>
        </div>
      </div>
    </div>
  );
}

