import React, { useState } from "react";
import { Check, Clipboard, Terminal } from "lucide-react";

export function DatabaseMigrations() {
  const [copied, setCopied] = useState(false);

  const migrationSQL = `-- 1. Enable pgvector extension for semantic matching
create extension if not exists vector;

-- 2. Create profiles table storing academic records & embeddings
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  role text,
  institution text,
  skills text[],
  interests text[],
  about text,
  intent text not null,
  embedding vector(1536), -- 1536-dim OpenAI or 768-dim Gemini embeddings (adjust dimensions accordingly)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Set up Row Level Security (RLS) policies
alter table public.profiles enable row level security;

create policy "Profiles are viewable by anyone" 
  on public.profiles for select 
  using (true);

create policy "Users can update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

create policy "Users can insert their own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- 4. Create high-efficiency vector index for rapid matchmaking (using cosine distance)
create index on public.profiles using hnsw (embedding vector_cosine_ops);

-- 5. Create core RPC similarity match function for cosine comparison
create or replace function match_collaborators (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  exclude_user_id uuid
)
returns table (
  id uuid,
  name text,
  role text,
  institution text,
  skills text[],
  interests text[],
  about text,
  intent text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    profiles.id,
    profiles.name,
    profiles.role,
    profiles.institution,
    profiles.skills,
    profiles.interests,
    profiles.about,
    profiles.intent,
    1 - (profiles.embedding <=> query_embedding) as similarity -- Calculate Cosine Similarity
  from profiles
  where 
    profiles.id <> exclude_user_id
    and 1 - (profiles.embedding <=> query_embedding) > match_threshold
  order override order to profiles.embedding <=> query_embedding asc
  limit match_count;
end;
$$;`;

  const handleCopy = () => {
    navigator.clipboard.writeText(migrationSQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface-container-low border border-border-light rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-primary" />
          <h3 className="font-serif text-lg font-bold text-primary">Supabase Database Setup</h3>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs border border-border-light bg-surface-container-lowest hover:bg-surface-container duration-150 px-3 py-1.5 rounded text-primary font-sans font-medium"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-600" />
              <span className="text-green-600">Copied SQL</span>
            </>
          ) : (
            <>
              <Clipboard className="w-3.5 h-3.5" />
              <span>Copy SQL Migration</span>
            </>
          )}
        </button>
      </div>
      <p className="text-sm text-on-surface-variant leading-relaxed">
        Run this SQL script directly inside your <strong>Supabase SQL Editor</strong> to enable the 
        <code>pgvector</code> extension, create the academic <code>profiles</code> table with vector support, and initialize the custom Cosine Distance matching function.
      </p>
      <div className="relative">
        <pre className="text-xs font-mono text-zinc-800 bg-surface-container-lowest p-4 rounded-lg overflow-x-auto max-h-72 border border-border-light">
          {migrationSQL}
        </pre>
      </div>
    </div>
  );
}
