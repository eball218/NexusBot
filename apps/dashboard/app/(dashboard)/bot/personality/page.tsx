'use client';

import { useState } from 'react';

const toneOptions = ['Friendly', 'Professional', 'Casual', 'Sarcastic', 'Enthusiastic', 'Calm'];
const humorOptions = ['None', 'Subtle', 'Moderate', 'High', 'Maximum'];
const formalityOptions = ['Very Casual', 'Casual', 'Balanced', 'Formal', 'Very Formal'];

export default function PersonalityPage() {
  const [name, setName] = useState('NexusBot');
  const [identity, setIdentity] = useState(
    'A helpful and witty AI assistant for the community. Loves gaming, technology, and bad puns. Always eager to help newcomers feel welcome.'
  );
  const [traits, setTraits] = useState(['Helpful', 'Witty', 'Knowledgeable', 'Patient']);
  const [traitInput, setTraitInput] = useState('');
  const [tone, setTone] = useState('Friendly');
  const [humor, setHumor] = useState('Moderate');
  const [formality, setFormality] = useState('Casual');
  const [saved, setSaved] = useState(false);

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

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">AI Persona Editor</h1>

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
            className="rounded-lg bg-accent-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-primary/90 transition-colors"
          >
            {saved ? 'Saved!' : 'Save Persona'}
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
