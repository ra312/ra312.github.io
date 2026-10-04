-- Main executable to generate the CV HTML

import Profile.CV
import Profile.Render

def main : IO Unit := do
  let html := Profile.renderCV Profile.cv
  let rendered := Profile.renderHtml html

  -- Add DOCTYPE manually
  let fullHtml := s!"<!DOCTYPE html>\n{rendered}"

  -- Paths relative to the parent directory of site/
  let siteDir := "/Users/daocode/ra312.github.io/site"
  let distDir := "/Users/daocode/ra312.github.io/dist"

  try
    IO.FS.createDirAll distDir
  catch e => do
    IO.println s!"Warning: could not create {distDir}: {e}"

  -- Write the HTML file
  try
    IO.FS.writeFile s!"{distDir}/index.html" fullHtml
    IO.println s!"Generated {distDir}/index.html"
  catch e => do
    IO.println s!"Error writing index.html: {e}"

  -- Copy CSS file
  try
    let cssDir := s!"{distDir}/assets"
    IO.FS.createDirAll cssDir
    let cssContent <- IO.FS.readFile s!"{siteDir}/assets/site.css"
    IO.FS.writeFile s!"{cssDir}/site.css" cssContent
    IO.println s!"Copied assets/site.css"
  catch e => do
    IO.println s!"Warning: could not copy CSS: {e}"
