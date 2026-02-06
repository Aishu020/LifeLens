import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: setSession } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const data = await login(form);
      setSession(data.user, data.token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-hero px-6 py-12">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">LifeLens</p>
          <h1 className="mt-4 text-4xl font-semibold text-ink">
            Your memories, elevated with AI clarity.
          </h1>
          <p className="mt-4 text-slate-600">
            Capture your story with a premium journal, meaningful insights, and calming analytics.
          </p>
          <div className="mt-6 flex gap-3">
            <div className="rounded-2xl bg-white/70 px-4 py-3 text-sm text-slate-600 shadow">
              Mood tracking
            </div>
            <div className="rounded-2xl bg-white/70 px-4 py-3 text-sm text-slate-600 shadow">
              AI reflections
            </div>
          </div>
        </div>
        <div className="card glass p-6">
          <h2 className="text-2xl font-semibold text-ink">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500">Log in to continue your timeline.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              Sign in
            </button>
          </form>
          <p className="mt-6 text-sm text-slate-500">
            New here?{" "}
            <Link to="/signup" className="font-semibold text-slate-900">
              Create an account
            </Link>
          </p>
          <p className="mt-4 text-xs text-slate-400">
            Demo: demo@lifelens.ai / password123
          </p>
        </div>
      </div>
    </div>
  );
}

