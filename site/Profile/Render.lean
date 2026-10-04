-- Rendering logic to convert CV data to HTML

import Profile.Data
import Profile.Html

namespace Profile

/-- Render a link -/
def renderLink (link : Link) : Html :=
  a link.href [] [Html.text link.text]

/-- Get unique years from publications in order they appear -/
def uniqueYearsInOrder (pubs : List Pub) : List Nat :=
  let rec go (pubs : List Pub) (acc : List Nat) : List Nat :=
    match pubs with
    | [] => acc.reverse
    | p :: rest =>
      if acc.contains p.year then
        go rest acc
      else
        go rest (p.year :: acc)
  go pubs []

/-- Group publications by year in order -/
def groupPubsByYear (pubs : List Pub) : List (Nat × List Pub) :=
  let years := uniqueYearsInOrder pubs
  -- For each year, collect publications
  years.map (fun year => (year, pubs.filter (fun p => p.year == year)))

/-- Render header section -/
def renderHeader (h : Header) : Html :=
  headerE [] [
    h1 [("class", "name")] [
      Html.text s!"{h.firstName} ",
      emE [] [Html.text h.lastName]
    ],
    Html.tag "p" [("class", "tagline")] (
      h.taglines.mapIdx (fun i t =>
        if i > 0 then [Html.raw " &nbsp;·&nbsp;", Html.text t]
        else [Html.text t]
      ) |> List.flatten
    ),
    Html.tag "p" [("class", "tagline")] [
      Html.text "Endorsed by the Royal Society under the UK Global Talent route (Exceptional Promise, April 2026)"
    ],
    div [("class", "contact")] (
      [
        a h.email [] [Html.text h.email],
        renderLink h.scholar,
        renderLink h.website,
        renderLink h.github,
        Html.tag "span" [] [Html.text h.phone]
      ]
    )
  ]

/-- Render research section -/
def renderResearch (r : Research) : Html :=
  let leads := r.leads.map (fun lead => p [("class", "lead")] [Html.text lead])
  let noteLink := match r.noteLink with
    | some link =>
      [p [("class", "note-link")] [
        a link.href [("target", "_blank"), ("rel", "noopener")] [Html.text link.text]
      ]]
    | none => []
  sectionE [("id", "research")] (
    [
      h2 [("class", "section-title")] [
        span [("class", "chev")] [Html.text "›"],
        Html.text "Research"
      ],
      div [("class", "pull-quote")] [
        div [("class", "label")] [Html.text "Core question"],
        Html.text r.coreQuestion
      ]
    ] ++ leads ++ noteLink
  )

/-- Render a publication entry -/
def renderPub (pub : Pub) : Html :=
  tr [] [
    td [("class", "pub-num")] [Html.text s!"{pub.num}."],
    td [("class", "pub-cell")] [
      (match pub.link with
      | some link =>
        a link.href [("target", "_blank"), ("rel", "noopener"), ("class", "pub-title-em")] [
          Html.text link.text
        ]
      | none =>
        span [("class", "pub-title-em")] [Html.text pub.title]),
      div [("class", "pub-authors")] [Html.text pub.authors],
      div [("class", "pub-venue")] [Html.text pub.venue]
    ]
  ]

/-- Render publications section -/
def renderPublications (pubs : List Pub) : Html :=
  let pubsByYear := groupPubsByYear pubs
  let tables := pubsByYear.flatMap (fun (year, yearPubs) => [
    h3 [("class", "year-heading")] [Html.text s!"{year}"],
    table [("class", "pub-table")] (yearPubs.map renderPub)
  ])

  sectionE [("id", "publications")] (
    [
      h2 [("class", "section-title")] [
        span [("class", "chev")] [Html.text "›"],
        Html.text "Publications"
      ],
      p [("class", "pub-blurb")] [
        strong [] [Html.text "12"],
        Html.text " peer-reviewed articles, ",
        strong [] [Html.text "2"],
        Html.text " preprints; ",
        strong [] [Html.text "220+"],
        Html.text " citations; h-index ",
        strong [] [Html.text "7"],
        Html.text " (Google Scholar, 2026). For live metrics see ",
        a "https://scholar.google.com/citations?user=BAxsRYkAAAAJ&hl=en"
          [("target", "_blank"), ("rel", "noopener")] [Html.text "Google Scholar"],
        Html.text "."
      ]
    ] ++ tables
  )

/-- Render a job entry -/
def renderJob (job : Job) : Html :=
  div [("class", "entry")] [
    div [("class", "entry-year")] [
      Html.text (
        match job.endYear with
        | some year => s!"{job.startYear} – {year}"
        | none => s!"{job.startYear} – present"
      )
    ],
    div [("class", "entry-body")] [
      div [("class", "entry-title")] [Html.text job.title],
      div [("class", "entry-sub")] [Html.text job.subtitle],
      div [("class", "entry-desc")] [Html.text job.description]
    ]
  ]

/-- Render experience section -/
def renderExperience (jobs : List Job) : Html :=
  sectionE [("id", "experience")] (
    [
      h2 [("class", "section-title")] [
        span [("class", "chev")] [Html.text "›"],
        Html.text "Experience"
      ]
    ] ++ (jobs.map renderJob)
  )

/-- Render a degree entry -/
def renderDegree (deg : Degree) : Html :=
  let desc := match deg.description with
    | some d => [div [("class", "entry-desc")] [Html.text d]]
    | none => []
  div [("class", "entry")] [
    div [("class", "entry-year")] [
      Html.text s!"{deg.startYear} – {deg.endYear}"
    ],
    div [("class", "entry-body")] (
      [
        div [("class", "entry-title")] [Html.text deg.title],
        div [("class", "entry-sub")] [Html.text deg.subtitle]
      ] ++ desc
    )
  ]

/-- Render education section -/
def renderEducation (degrees : List Degree) : Html :=
  sectionE [("id", "education")] (
    [
      h2 [("class", "section-title")] [
        span [("class", "chev")] [Html.text "›"],
        Html.text "Education"
      ]
    ] ++ (degrees.map renderDegree)
  )

/-- Render a talk entry -/
def renderTalk (talk : Talk) : Html :=
  div [("class", "entry")] [
    div [("class", "entry-year")] [
      Html.text s!"{talk.month} {talk.year}"
    ],
    div [("class", "entry-body")] [
      div [("class", "entry-title")] [Html.text talk.title],
      div [("class", "entry-sub")] [Html.text talk.subtitle]
    ]
  ]

/-- Render talks section -/
def renderTalks (talks : List Talk) : Html :=
  sectionE [("id", "talks")] (
    [
      h2 [("class", "section-title")] [
        span [("class", "chev")] [Html.text "›"],
        Html.text "Selected Invited Talks"
      ]
    ] ++ (talks.map renderTalk)
  )

/-- Render a grant entry -/
def renderGrant (grant : Grant) : Html :=
  div [("class", "entry")] [
    div [("class", "entry-year")] [
      Html.text (
        match grant.endYear with
        | some year => s!"{grant.startYear} – {year}"
        | none => s!"{grant.startYear}"
      )
    ],
    div [("class", "entry-body")] [
      div [("class", "entry-title")] [Html.text grant.title],
      div [("class", "entry-sub")] [Html.text grant.subtitle],
      div [("class", "entry-desc")] [Html.text grant.description]
    ]
  ]

/-- Render funding section -/
def renderFunding (grants : List Grant) : Html :=
  sectionE [("id", "funding")] (
    [
      h2 [("class", "section-title")] [
        span [("class", "chev")] [Html.text "›"],
        Html.text "Awards &amp; Funding"
      ]
    ] ++ (grants.map renderGrant)
  )

/-- Render a teaching entry -/
def renderTeachingEntry (teaching : Teaching) : Html :=
  div [("class", "entry")] [
    div [("class", "entry-year")] [
      Html.text (
        match teaching.endYear with
        | some year => s!"{teaching.startYear} – {year}"
        | none => s!"{teaching.startYear} – present"
      )
    ],
    div [("class", "entry-body")] [
      div [("class", "entry-title")] [Html.text teaching.title],
      div [("class", "entry-sub")] [Html.text teaching.subtitle],
      div [("class", "entry-desc")] [Html.text teaching.description]
    ]
  ]

/-- Render teaching section -/
def renderTeaching (teachings : List Teaching) (collaborators : String) : Html :=
  sectionE [("id", "teaching")] (
    [
      h2 [("class", "section-title")] [
        span [("class", "chev")] [Html.text "›"],
        Html.text "Teaching &amp; Service"
      ]
    ] ++ (teachings.map renderTeachingEntry) ++ [
      h3 [("class", "subheading")] [Html.text "Academic collaborations"],
      p [("class", "collab-list")] [Html.text collaborators]
    ]
  )

/-- Render navigation -/
def renderNav : Html :=
  navE [] [
    ul [] [
      li [] [a "blog/index.html" [] [Html.text "Blog"]],
      li [] [a "#research" [] [Html.text "Research"]],
      li [] [a "#publications" [] [Html.text "Publications"]],
      li [] [a "#experience" [] [Html.text "Experience"]],
      li [] [a "#education" [] [Html.text "Education"]],
      li [] [a "#talks" [] [Html.text "Talks"]],
      li [] [a "#funding" [] [Html.text "Funding"]],
      li [] [a "#teaching" [] [Html.text "Teaching"]]
    ]
  ]

/-- Render footer -/
def renderFooter : Html :=
  footerE [] [
    Html.text "© 2026 Rauan Akylzhanov"
  ]

/-- Render the complete CV to HTML -/
def renderCV (cv : CV) : Html :=
  htmlE "en" [
    headE [
      Html.tag "meta" [("charset", "UTF-8")] [],
      Html.tag "meta" [("name", "viewport"), ("content", "width=device-width, initial-scale=1.0")] [],
      titleE "Dr Rauan Akylzhanov — Mathematician: Spectral Theory & Noncommutative Analysis",
      metaE "description" "Personal site of Dr Rauan Akylzhanov — mathematician working on noncommutative harmonic analysis, spectral theory and the mathematics of deep learning.",
      Html.tag "link" [("rel", "preconnect"), ("href", "https://fonts.googleapis.com")] [],
      Html.tag "link" [("rel", "preconnect"), ("href", "https://fonts.gstatic.com"), ("crossorigin", "")] [],
      Html.tag "link" [("rel", "stylesheet"), ("href", "https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,300;0,400;0,600;1,400&display=swap")] [],
      Html.tag "link" [("rel", "stylesheet"), ("href", "assets/site.css")] []
    ],
    bodyE [
      renderNav,
      div [("class", "page")] [
        renderHeader cv.header,
        renderResearch cv.research,
        renderPublications cv.pubs,
        renderExperience cv.experience,
        renderEducation cv.education,
        renderTalks cv.talks,
        renderFunding cv.funding,
        renderTeaching cv.teaching cv.collaborators,
        renderFooter
      ]
    ]
  ]

end Profile
