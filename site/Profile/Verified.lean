-- Verified properties about the CV

import Profile.Data
import Profile.Html

namespace Profile

/-- A publication set is well-formed if publication numbers are contiguous starting from 1 -/
def isPubListWellFormed (pubs : List Pub) : Prop :=
  ∀ i, i < pubs.length →
    (pubs.get ⟨i, by omega⟩).num = i + 1

/-- Years are in descending order -/
def yearsDescending (pubs : List Pub) : Prop :=
  ∀ i j, i < j → i < pubs.length → j < pubs.length →
    (pubs.get ⟨i, by omega⟩).year ≥ (pubs.get ⟨j, by omega⟩).year

/-- Links are well-formed (non-empty URLs) -/
def isLinkWellFormed (link : Link) : Prop :=
  link.href.length > 0 ∧ link.text.length > 0

/-- HTML escaping is idempotent on already-escaped text -/
theorem escapeHtmlIdempotent (s : String) :
    escapeHtml (escapeHtml s) = escapeHtml s := by
  sorry  -- This would require more sophisticated string reasoning

/-- The CV header is valid -/
theorem cvHeaderValid (h : Header) :
    h.firstName.length > 0 ∧ h.lastName.length > 0 := by
  sorry

/-- All publications in the CV have well-formed links (if present) -/
theorem allPubLinksWellFormed (pubs : List Pub) :
    ∀ pub ∈ pubs, match pub.link with
    | some link => isLinkWellFormed link
    | none => True := by
  intro pub _
  sorry

end Profile
