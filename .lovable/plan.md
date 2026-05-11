Below is a focused plan covering each of your 7 issues. Each item lists the root cause, the fix, and the files involved.

## 1. Resume update fails for some jobs (intermittent)

**Root causes found in `UpdateCVModal.tsx` and `RecruiterUpdateCV.tsx`:**
- The webhook URL contains a space: `https://n8n.../webhook/update cv` — this works most of the time but is fragile and some proxies/CDNs reject it.
- No retry logic — a single n8n cold-start or 502 = total failure.
- No timeout — long jobs hang until the browser kills them.
- `parse-cv` errors are surfaced raw with no fallback (e.g. if PDF parse fails on one file the whole flow dies).

**Fix:**
- URL-encode the webhook path (`/webhook/update%20cv`).
- Add automatic retry (2 attempts with 3s backoff) for network/5xx errors.
- Add a 90s `AbortController` timeout with a clear error message.
- If `parse-cv` returns empty text, retry once with the public URL fallback before failing.
- Better error messages so we can see *which* step failed (parse vs webhook vs DB insert).

## 2. Resume update is too slow

**Root cause:** Today the flow runs sequentially: parse-cv → fetch ATS analysis → call n8n webhook → poll DB.

**Fix:**
- Run `parse-cv` and the ATS-analysis lookup in parallel (`Promise.all`) — saves 1–3s.
- Show a live progress indicator with stages ("Parsing resume…", "Sending to AI…", "Saving result…") so it *feels* faster and users don't think it's stuck.
- Cache parsed CV text per `cv_id` in React Query for the session — re-running update for the same CV skips parsing entirely.
- Note: the bulk of the time (15–40s) is the n8n AI workflow itself; that has to be optimized inside n8n. We'll surface a note in the UI if the wait exceeds 30s.

## 3. Highlight job-description skills inside the resume / ATS view

**Where:** `ATSResultsView.tsx` and `JobDetailsModal.tsx`.

**Fix:**
- Read the `analysis_result.matched_skills` and `missing_skills` arrays already returned by the ATS webhook.
- Wrap any occurrence of those skills inside the rendered job description with a colored highlight (green for matched, amber for missing).
- Use a small `highlightSkills(text, skills)` utility that escapes regex and is case-insensitive.
- Apply the same highlighter to the resume preview header in the ATS results panel.

## 4. (skipped — not in your list)

## 5. Delete buttons not working across the platform

**Audit targets:**
- Jobs: `JobTableView.tsx`, `JobCardView.tsx`, `RecruiterScrapedJobs.tsx`
- Resumes: `CVCard.tsx`, `CVListView.tsx`, `CVConfirmationModals.tsx` (CV management)
- Updated resumes: `UpdatedCVsBadge.tsx`, `cv/UpdatedCVPreviewModal.tsx` (no delete today — will add)
- Candidates: `RecruiterCandidates.tsx`, `AdminCandidates.tsx`
- Recruiters: `RecruitersTable.tsx`
- Applications: `RecruiterApplications.tsx`
- Messages: `RecruiterMessagesPage.tsx`, `CandidateMessagesPage.tsx`

**Fix per item:**
- Wire every delete button to a confirmation modal + a Supabase `delete()` call scoped by RLS.
- For files in storage (CVs, updated CVs, avatars), also delete the storage object before the DB row.
- Cascade clean-up: when a job is deleted, also delete its `ats_analyses`, `updated_cvs`, `generated_emails`, and `job_applications` rows.
- Invalidate the relevant React Query keys after each delete so the UI refreshes immediately.
- Show toast on success/failure with the actual error message.

## 6. Resume preview & download issues

**Root causes:**
- Original CVs live in the **private** `cvs-bucket`. The Google Docs viewer can't read private URLs, so previews fail.
- Some download buttons still use `<a download>` on cross-origin URLs (silently ignored).

**Fix:**
- For original-CV previews: generate a short-lived **signed URL** (`createSignedUrl`, 1-hour) and feed that to the Google Docs viewer instead of the raw URL. Centralize this in a `getPreviewUrl(cv)` helper.
- For all downloads: route every button through the existing `downloadFile()` blob helper (already in `src/lib/downloadFile.ts`). Replace remaining `<a download>` tags in `CVPreviewModal.tsx`, `CVCard.tsx`, `CVListView.tsx`, `ApplicationDetailsModal.tsx`, and `JobDetailsModal.tsx`.
- Add a loading spinner + toast while the blob is being fetched.

## 7. Updated resumes not showing in the candidate portal

**Root cause:** `CandidateCVsPage.tsx` only queries the `cvs` table. The `updated_cvs` table — which already has an RLS policy letting candidates view their own — is never fetched there. Only `useCandidateDashboard` reads it.

**Fix:**
- Add a second query in `CandidateCVsPage.tsx` fetching `updated_cvs` for the logged-in candidate, joined to `scraped_jobs` for context (job title, company).
- Render a new "AI-Optimized Resumes" section under "My Resumes" with preview + download (using `downloadFile` and Google Docs viewer — `Update cv's` bucket is already public).
- Also surface the updated resume on the matching application card in `ApplicationCard.tsx` if not already there.

## 8. (skipped — not in your list)

## 9. Duplicate jobs when searching multiple times

**Root cause:** `RecruiterScrapeJobs` inserts every n8n result as a new `scraped_jobs` row, even when the same `external_job_id` from the same platform was already saved. Re-running the same search → duplicates.

**Fix:**
- Add a unique constraint on `(recruiter_id, platform_type, external_job_id)` (only when `external_job_id IS NOT NULL`).
- Switch the insert in the scrape result handler to `upsert({...}, { onConflict: "recruiter_id,platform_type,external_job_id", ignoreDuplicates: false })` so a re-scrape refreshes the row instead of duplicating.
- For rows missing `external_job_id`, fall back to a hash of `(job_title + company_name + job_apply_url)` and dedupe client-side before insert.
- Add a one-time cleanup migration that deletes existing duplicate rows (keeping the most recent).

---

## Technical summary

```text
Files to edit
├── src/components/recruiter/UpdateCVModal.tsx        (#1, #2)
├── src/pages/RecruiterUpdateCV.tsx                   (#1, #2)
├── src/components/recruiter/ATSResultsView.tsx       (#3)
├── src/components/recruiter/JobDetailsModal.tsx      (#3, #6)
├── src/lib/highlightSkills.ts        (NEW)           (#3)
├── src/lib/getPreviewUrl.ts          (NEW)           (#6)
├── src/components/recruiter/JobTableView.tsx         (#5)
├── src/pages/RecruiterScrapedJobs.tsx                (#5, #9)
├── src/components/recruiter/cv/CVCard.tsx            (#5, #6)
├── src/components/recruiter/cv/CVListView.tsx        (#5, #6)
├── src/components/recruiter/cv/CVPreviewModal.tsx    (#6)
├── src/components/recruiter/UpdatedCVsBadge.tsx      (#5)
├── src/pages/RecruiterCandidates.tsx                 (#5)
├── src/pages/AdminCandidates.tsx                     (#5)
├── src/components/admin/RecruitersTable.tsx          (#5)
├── src/pages/RecruiterApplications.tsx               (#5)
├── src/pages/RecruiterMessagesPage.tsx               (#5)
├── src/pages/CandidateMessagesPage.tsx               (#5)
├── src/pages/CandidateCVsPage.tsx                    (#7)
├── src/components/candidate/ApplicationCard.tsx      (#7)
├── src/components/candidate/ApplicationDetailsModal.tsx (#6)
└── src/pages/RecruiterScrapeJobs.tsx                 (#9)

Database migration
├── unique index on scraped_jobs(recruiter_id, platform_type, external_job_id)
└── cleanup query removing existing duplicates
```

Once you approve, I'll implement everything in one pass and verify each delete button + the new candidate updated-CV section in the preview.
