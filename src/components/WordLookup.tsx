"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import WordDetail from "@/components/WordDetail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function WordLookup() {
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState([""]);
  const [searchedWords, setSearchedWords] = useState<string[]>([]);
  const [error, setError] = useState("");

  function updateInput(index: number, value: string) {
    setInputs((current) =>
      current.map((input, i) => (i === index ? value : input))
    );
    setSearchedWords([]);
    setError("");
  }

  function findMeanings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const words = [...new Set(inputs.map((word) => word.trim().toLowerCase()).filter(Boolean))];

    if (words.length === 0) {
      setError("Enter at least one word.");
      return;
    }
    if (words.some((word) => !/^[a-z]{2,40}$/.test(word))) {
      setError("Use English letters only (2–40 characters per word).");
      return;
    }

    setError("");
    setSearchedWords(words);
  }

  return (
    <div className="space-y-3">
      {!open ? (
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add a word
        </Button>
      ) : (
        <form
          onSubmit={findMeanings}
          className="space-y-3 rounded-2xl border border-border/80 bg-card p-4"
        >
          <p className="text-sm font-medium">Look up a word</p>
          <div className="space-y-2">
            {inputs.map((word, index) => (
              <Input
                key={index}
                value={word}
                onChange={(event) => updateInput(index, event.target.value)}
                placeholder="Type a word"
                aria-label={`Word ${index + 1}`}
                autoComplete="off"
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5"
              aria-label="Add another word"
              onClick={() => setInputs((current) => [...current, ""])}
            >
              <Plus className="h-4 w-4" />
              Add another
            </Button>
            <Button type="submit" size="sm" className="gap-1.5">
              <Search className="h-4 w-4" />
              Find meaning
            </Button>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </form>
      )}

      {searchedWords.length > 0 && (
        <div className="space-y-3">
          {searchedWords.map((word) => (
            <div
              key={word}
              className="space-y-2 rounded-2xl border border-border/80 bg-card p-4"
            >
              <h3 className="font-medium capitalize">{word}</h3>
              <WordDetail word={word} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
