'use client';

import { useState, useEffect, useCallback } from 'react';
import { authApi, ApiError } from '@/lib/api';

const toneOptions = ['Friendly', 'Professional', 'Casual', 'Sarcastic', 'Enthusiastic', 'Calm'];
const humorOptions = ['None', 'Subtle', 'Moderate', 'High', 'Maximum'];
const formalityOptions = ['Very Casual', 'Casual', 'Balanced', 'Formal', 'Very Formal'];

const humorToNumber: Record<string, number> = { 'None': 1, 'Subtle': 2, 'Moderate': 3, 'High': 4, 'Maximum': 5 };
const numberToHumor: Record<number, string> = { 1: 'None', 2: 'Subtle', 3: 'Moderate', 4: 'High', 5: 'Maximum' };

const formalityToNumber: Record<string, number> = { 'Very Casual': 1, 'Casual': 2, 'Balanced': 3, 'Formal': 4, 'Very Formal': 5 };
const numberToFormality: Record<number, string> = { 1: 'Very Casual', 2: 'Casual', 3: 'Balanced', 4: 'Formal', 5: 'Very Formal' };

interface PersonalityConfig {
  identity: string;
  traits: string[];
  tone: string;
  humor: number;
  formality: number;
  communicationStyle: string;
  lore: string[];
  catchphrases: string[];
}

interface PersonalityResponse {
  id?: string;
  name: string;
  config: PersonalityConfig;
}

const DEFAULT_NAME = 'NexusBot';
const DEFAULT_IDENTITY = 'A helpful and witty AI assistant for the community. Loves gaming, technology, and bad puns. Always eager to help newcomers feel welcome.';
const DEFAULT_TRAITS = ['Helpful', 'Witty', 'Knowledgeable', 'Patient'];
const DEFAULT_TONE = 'Friendly';
const DEFAULT_HUMOR = 'Moderate';
const DEFAULT_FORMALITY = 'Casual';

export default function PersonalityPage() {
  const [name, setName] = useState(DEFAULT_NAME);
  const [identity, setIdentity] = useState(DEFAULT_IDENTITY);
  const [traits, setTraits] = useState<string[]>(DEFAULT_TRAITS);
  const [traitInput, setTraitInput] = useState('');
  const [tone, setTone] = useState(DEFAULT_TONE);
  const [humor, setHumor] = useState(DEFAULT_HUMOR);
  const [formality, setFormality] = useState(DEFAULT_FORMALITY);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPersonality = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi<PersonalityResponse>('/personality');
      if (data) {
        setName(data.name || DEFAULT_NAME);
        const c = data.config;
        setIdentity(c.identity || DEFAULT_IDENTITY);
        setTraits(c.traits?.length ? c.traits : DEFAULT_TRAITS);
        setTone(c.tone || DEFAULT_TONE);
        setHumor(numberToHumor[c.humor] || DEFAULT_HUMOR);
        setFormality(numberToFormality[c.formality] || DEFAULT_FORMALITY);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        // No personality saved yet -- keep defaults
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load personality');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPersonality();
  }, [loadPersonality]);

  function addTrait() {
    const trimmed = traitInput.trim();
    if (trimmed && !traits.includes(trimmed)) {
      setTraits([...traits, trimmed]);
      setTraitInput('');
    }
  }

  function removeTrait(trait: string) {
    setTraits(traits.filter((t) => t !== trait));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await authApi('/personality', {
        method: 'PUT',
        body: {
          name,
          config: {
            identity,
            traits,
            tone,
            humor: humorToNumber[humor] ?? 3,
            formality: formalityToNumber[formality] ?? 2,
            communicationStyle: tone,
            lore: [],
            catchphrases: [],
          },
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save personality');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
        <span className="ml-3 text-sm text-text-muted">Loading personality...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">AI Persona Editor</h1>

      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
          <button onClick={() => setError(null)} className="ml-3 underline hover:no-underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bot Name */}
          <div className="rounded-xl border border-white/5 bg-background-elevated p-6">
            <label className="block text-sm font-medium text-text-secondary">Bot Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
              placeholder="Enter bot name"
            />
          </div>

          {/* Identity */}
          <div className="rounded-xl border border-white/5 bg-background-elevated p-6">
            <label className="block text-sm font-medium text-text-secondary">Identity / Backstory</label>
            <textarea
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary resize-none"
              placeholder="Describe your bot's personality and backstory..."
            />
            <p className="mt-1 text-xs text-text-muted">{identity.length} / 500 characters</p>
          </div>

          {/* Traits */}
          <div className="rounded-xl border border-white/5 bg-background-elevated p-6">
            <label className="block text-sm font-medium text-text-secondary">Personality Traits</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {traits.map((trait) => (
                <span
                  key={trait}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent-primary/10 px-3 py-1 text-xs font-medium text-accent-primary"
                >
                  {trait}
                  <button
                    onClick={() => removeTrait(trait)}
                    className="hover:text-danger"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={traitInput}
                onChange={(e) => setTraitInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTrait()}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                placeholder="Add a trait and press Enter"
              />
              <button
                onClick={addTrait}
                className="rounded-lg bg-accent-primary/10 px-4 py-2 text-sm font-medium text-accent-primary hover:bg-accent-primary/20"
              >
                Add
              </button>
            </div>
          </div>

          {/* Tone, Humor, Formality */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Tone */}
            <div className="rounded-xl border border-white/5 bg-background-elevated p-4">
              <label className="block text-sm font-medium text-text-secondary">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
              >
                {toneOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-background-elevated">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Humor */}
            <div className="rounded-xl border border-white/5 bg-background-elevated p-4">
              <label className="block text-sm font-medium text-text-secondary">Humor Level</label>
              <select
                value={humor}
                onChange={(e) => setHumor(e.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
              >
                {humorOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-background-elevated">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Formality */}
            <div className="rounded-xl border border-white/5 bg-background-elevated p-4">
              <label className="block text-sm font-medium text-text-secondary">Formality</label>
              <select
                value={formality}
                onChange={(e) => setFormality(e.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
              >
                {formalityOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-background-elevated">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-accent-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Persona'}
          </button>
        </div>

        {/* Live Preview */}
        <div className="rounded-xl border border-white/5 bg-background-elevated p-6 h-fit lg:sticky lg:top-6">
          <h3 className="text-sm font-semibold text-text-primary">Live Preview</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-primary/20 text-sm font-bold text-accent-primary">
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{name || 'Unnamed Bot'}</p>
                <p className="text-xs text-text-muted">{tone} &middot; {formality}</p>
              </div>
            </div>

            <div className="rounded-lg bg-white/5 p-4">
              <p className="text-xs text-text-muted">Sample response:</p>
              <p className="mt-2 text-sm text-text-secondary">
                {tone === 'Sarcastic'
                  ? `Oh, you need help? How shocking. I'm ${name}, and I ${humor === 'None' ? 'suppose' : 'guess'} I can assist.`
                  : tone === 'Professional'
                    ? `Hello, I'm ${name}. I'm here to assist you with any questions or concerns you may have.`
                    : `Hey there! I'm ${name}! ${humor !== 'None' ? 'Ready to help and maybe crack a joke or two. ' : ''}What can I do for you?`
                }
              </p>
            </div>

            <div>
              <p className="text-xs text-text-muted">Traits</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {traits.map((trait) => (
                  <span key={trait} className="rounded bg-white/5 px-2 py-0.5 text-xs text-text-secondary">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
