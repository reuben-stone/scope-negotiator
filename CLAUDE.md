@AGENTS.md

## Authorship, Engineering Judgement & Commit Discipline

This repository should read as a thoughtfully designed and engineered product built by a senior engineer using AI-assisted development, not as a sequence of AI-generated outputs.

### Core rule

AI assists implementation. Human product and engineering judgement owns the repository.

Before making changes, preserve the existing product intent, architecture, visual language and scope. Do not introduce features, abstractions, dependencies, patterns or visual treatments simply because they are common, convenient or "best practice."

Every change should have a clear reason connected to the product we are building.

### Commit discipline

Commit messages must describe the actual engineering or product change and its purpose.

Prefer concise, conventional messages such as:

- `feat: add stepped context workflow`
- `feat: preserve scope context across navigation`
- `fix: retain feature brief when returning to previous step`
- `refactor: derive context navigation from workflow config`
- `a11y: move focus on context step transitions`
- `style: refine context workspace hierarchy`
- `test: cover mode-specific context navigation`

Avoid vague or artificial messages such as:

- `improve UI`
- `enhance user experience`
- `update components`
- `implement requested changes`
- `add various improvements`
- `polish app`
- `AI improvements`
- `Claude changes`

Do not mention Claude, prompts, generated code or the implementation conversation in commit messages unless AI integration itself is the feature being changed.

### Commit boundaries

Create commits around coherent engineering decisions, not around individual prompts or arbitrary batches of generated files.

A commit should normally answer:

1. What changed?
2. What product or engineering behaviour does it introduce, fix or clarify?
3. Can this commit be understood independently from the AI conversation that produced it?

Do not create unnecessary micro-commits for trivial generated changes, and do not combine unrelated work into a giant "update" commit.

### Code quality

Do not leave behind evidence of implementation-by-prompt:

- no comments explaining instructions from the conversation
- no placeholder abstractions created speculatively
- no unnecessary defensive code
- no duplicated logic caused by iterative generation
- no generic components without a real reuse case
- no unused helpers, types or imports
- no excessive comments describing obvious code
- no arbitrary dependencies
- no inconsistent naming or architectural patterns

Comments should explain non-obvious engineering decisions, constraints or trade-offs, not narrate what the code does.

### Product quality

Before considering a change complete, ask:

> Does this feel like a deliberate part of Scope Negotiator, or like something that was generated because it could be?

If it does not strengthen the specific product workflow, architecture or visual system, do not add it.

When requirements are ambiguous, prefer the smallest coherent implementation and surface the decision rather than inventing additional product scope.

### Final review before committing

Before each commit:

- review the diff as a senior engineer
- remove accidental complexity and generated residue
- check naming against the existing domain language
- verify the change fits the established architecture
- verify accessibility where UI behaviour changed
- run relevant tests/typecheck/lint
- ensure the commit contains one coherent change
- write the commit message from the product/engineering outcome, not from the prompt that initiated it

The goal is not to disguise AI assistance.

The goal is for AI assistance to remain subordinate to clear human product decisions, engineering judgement and deliberate repository history.
