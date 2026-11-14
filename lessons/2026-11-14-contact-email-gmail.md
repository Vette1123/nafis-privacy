# Contact email moved to Gmail

**What.** The owner's main contact email is booogado@gmail.com from 14 Nov 2026. Every
public contact in Rafiq, Masareef and Nafis (the in-app feedback and request mail, the
privacy, terms and delete-data pages, the generated bank pages, store review contact,
marketing replies) now reads it. The git commit identity stays boogado@yahoo.com: the
owner moved the contact, not the author.

**Mistakes.** The first sweep excluded paths with `':!__tests__/...'`; git reads `:!_` as
pathspec magic and the whole command died, changing nothing. Use `':(exclude)path'`.

**What worked.** One `git grep -l | sed` per repo with the history excluded (old plans,
the commit-identity rule, test comments naming whose SMS a regression came from, the
tracker log), then the repo's own generator `--check` to prove generated pages and their
source still agree.

**Rules.** A contact change is a sweep of every repo that ships to the public, generators
and their output together; history that records what was true at the time is left alone.
