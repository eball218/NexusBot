'use client';

import { useState } from 'react';

const defaultTraits = ['Friendly', 'Helpful', 'Witty', 'Professional'];

export default function PersonalityPage() {
  const [botName, setBotName] = useState('NexusAdmin Bot');
  const [identity, setIdentity] = useState(
    'You are the official NexusBot admin assistant. You help moderate channels, answer community questions, and keep conversations productive and positive.'
  );
  const [traits, setTraits] = useState(defaultTraits);
  const [newTrait, setNewTrait] = useState('');
  const [tone, setTone] = useState('balanced');
  const [humor, setHumor] = useState('moderate');
  const [formality, setFormality] = useState('semi-formal');

  const addTrait = () => {
    const trimmed = newTrait.trim();
    if (trimmed && !traits.includes(trimmed)) {
      setTraits([...traits, trimmed]);
      setNewTrait('');
    }
  };

  const removeTrait = (trait: string) => {
    setTraits(traits.filter((t) => t !== trait));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Personality Editor</h1>
        <p className="mt-1 text-sm text-text-secondary">Customize your bot&apos;s identity and behavior.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Bot Name */}
        <div>
          <label className="block text-sm font-medium text-text-primary">Bot Name</label>
          <input
            type="text"
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/5 bg-background-elevated px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:border-accent-primary focus:outline-none"
          />
        </div>

        {/* Identity */}
        <div>
          <label className="block text-sm font-medium text-text-primary">Identity / System Prompt</label>
          <textarea
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-white/5 bg-background-elevated px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:border-accent-primary focus:outline-none"
          />
        </div>

        {/* Traits */}
        <div>
          <label className="block text-sm font-medium text-text-primary">Personality Traits</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {traits.map((trait) => (
              <span
                key={trait}
                className="inline-flex items-center gap-1 rounded-full bg-accent-primary/10 px-3 py-1 text-xs font-medium text-accent-primary"
              >
                {trait}
                <button
                  onClick={() => removeTrait(trait)}
                  className="ml-0.5 text-accent-primary/60 hover:text-accent-primary"
                >
                  x
                </button>
              </span>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newTrait}
              onChange={(e) => setNewTrait(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTrait()}
              placeholder="Add a trait..."
              className="flex-1 rounded-lg border border-white/5 bg-background-elevated px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-accent-primary focus:outline-none"
            />
            <button
              onClick={addTrait}
              className="rounded-lg bg-accent-primary/10 px-3 py-2 text-sm font-medium text-accent-primary hover:bg-accent-primary/20"
            >
              Add
            </button>
          </div>
        </div>

        {/* Tone */}
        <div>
          <label className="block text-sm font-medium text-text-primary">Tone</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/5 bg-background-elevated px-4 py-2.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
          >
            <option value="friendly">Friendly</option>
            <option value="balanced">Balanced</option>
            <option value="authoritative">Authoritative</option>
            <option value="casual">Casual</option>
          </select>
        </div>

        {/* Humor */}
        <div>
          <label className="block text-sm font-medium text-text-primary">Humor Level</label>
          <select
            value={humor}
            onChange={(e) => setHumor(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/5 bg-background-elevated px-4 py-2.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
          >
            <option value="none">None</option>
            <option value="subtle">Subtle</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Formality */}
        <div>
          <label className="block text-sm font-medium text-text-primary">Formality</label>
          <select
            value={formality}
            onChange={(e) => setFormality(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/5 bg-background-elevated px-4 py-2.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
          >
            <option value="casual">Casual</option>
            <option value="semi-formal">Semi-formal</option>
            <option value="formal">Formal</option>
          </select>
        </div>

        {/* Save */}
        <button className="rounded-lg bg-accent-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-primary/80">
          Save Personality
        </button>
      </div>
    </div>
  );
}
