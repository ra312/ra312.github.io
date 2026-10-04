-- Verification executable: checks properties of the CV

import Profile.CV
import Profile.Render
import Profile.Verified

def main : IO Unit := do
  IO.println "CV verification complete."
  IO.println s!"Publications: {Profile.cv.pubs.length}"
  IO.println s!"Years in order: {Profile.groupPubsByYear Profile.cv.pubs |>.map (·.1)}"
