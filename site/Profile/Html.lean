-- Simple HTML DSL for rendering

namespace Profile

inductive Html where
  | text : String → Html          -- Escaped text
  | raw : String → Html           -- Unescaped raw HTML
  | tag : String → List (String × String) → List Html → Html
  | doctype : Html
  | comment : String → Html
  deriving BEq, Repr

/-- Void HTML tags that should be self-closed -/
def voidTags : List String :=
  ["area", "base", "br", "col", "embed", "hr", "img", "input",
   "link", "meta", "param", "source", "track", "wbr"]

/-- Escape special HTML characters -/
def escapeHtml (s : String) : String :=
  s.replace "&" "&amp;"
   |>.replace "<" "&lt;"
   |>.replace ">" "&gt;"
   |>.replace "\"" "&quot;"
   |>.replace "'" "&#39;"

/-- Render HTML to string -/
def renderHtml : Html → String
  | Html.text s => escapeHtml s
  | Html.raw s => s
  | Html.doctype => "<!DOCTYPE html>"
  | Html.comment s => s!"<!-- {escapeHtml s} -->"
  | Html.tag name attrs children =>
    let attrStr := String.intercalate " " (attrs.map fun (k, v) => s!"{k}=\"{escapeHtml v}\"")
    let isVoid := voidTags.contains name
    if children.isEmpty && isVoid then
      -- Self-close only void tags
      if attrStr.isEmpty then
        s!"<{name}>"
      else
        s!"<{name} {attrStr}>"
    else if children.isEmpty then
      -- Empty non-void tag
      if attrStr.isEmpty then
        s!"<{name}></{name}>"
      else
        s!"<{name} {attrStr}></{name}>"
    else
      -- Non-empty tag
      let childStr := String.intercalate "" (children.map renderHtml)
      if attrStr.isEmpty then
        s!"<{name}>{childStr}</{name}>"
      else
        s!"<{name} {attrStr}>{childStr}</{name}>"

/-- Convenience functions for common tags -/

def div (attrs : List (String × String) := []) (children : List Html) : Html :=
  Html.tag "div" attrs children

def p (attrs : List (String × String) := []) (children : List Html) : Html :=
  Html.tag "p" attrs children

def span (attrs : List (String × String) := []) (children : List Html) : Html :=
  Html.tag "span" attrs children

def a (href : String) (attrs : List (String × String) := []) (children : List Html) : Html :=
  Html.tag "a" (("href", href) :: attrs) children

def h1 (attrs : List (String × String) := []) (children : List Html) : Html :=
  Html.tag "h1" attrs children

def h2 (attrs : List (String × String) := []) (children : List Html) : Html :=
  Html.tag "h2" attrs children

def h3 (attrs : List (String × String) := []) (children : List Html) : Html :=
  Html.tag "h3" attrs children

def navE (attrs : List (String × String) := []) (children : List Html) : Html :=
  Html.tag "nav" attrs children

def ul (attrs : List (String × String) := []) (children : List Html) : Html :=
  Html.tag "ul" attrs children

def li (attrs : List (String × String) := []) (children : List Html) : Html :=
  Html.tag "li" attrs children

def sectionE (attrs : List (String × String) := []) (children : List Html) : Html :=
  Html.tag "section" attrs children

def table (attrs : List (String × String) := []) (children : List Html) : Html :=
  Html.tag "table" attrs children

def tr (attrs : List (String × String) := []) (children : List Html) : Html :=
  Html.tag "tr" attrs children

def td (attrs : List (String × String) := []) (children : List Html) : Html :=
  Html.tag "td" attrs children

def emE (attrs : List (String × String) := []) (children : List Html) : Html :=
  Html.tag "em" attrs children

def strong (attrs : List (String × String) := []) (children : List Html) : Html :=
  Html.tag "strong" attrs children

def headerE (attrs : List (String × String) := []) (children : List Html) : Html :=
  Html.tag "header" attrs children

def footerE (attrs : List (String × String) := []) (children : List Html) : Html :=
  Html.tag "footer" attrs children

def styleE (content : String) : Html :=
  Html.tag "style" [] [Html.text content]

def linkE (rel : String) (href : String) : Html :=
  Html.tag "link" [("rel", rel), ("href", href)] []

def metaE (name : String) (content : String) : Html :=
  Html.tag "meta" [("name", name), ("content", content)] []

def titleE (content : String) : Html :=
  Html.tag "title" [] [Html.text content]

def headE (children : List Html) : Html :=
  Html.tag "head" [] children

def bodyE (children : List Html) : Html :=
  Html.tag "body" [] children

def htmlE (lang : String) (children : List Html) : Html :=
  Html.tag "html" [("lang", lang)] children

def small (content : String) : Html :=
  Html.tag "small" [("style", "font-weight:400")] [Html.text content]

def sup (content : String) : Html :=
  Html.tag "sup" [] [Html.text content]

def sub (content : String) : Html :=
  Html.tag "sub" [] [Html.text content]

end Profile
