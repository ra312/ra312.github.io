-- Profile data structures for CV rendering

namespace Profile

/-- A hyperlink -/
structure Link where
  text : String
  href : String
  deriving BEq, Repr

/-- A publication entry -/
structure Pub where
  num : Nat
  title : String
  authors : String
  venue : String
  link : Option Link
  year : Nat
  deriving BEq, Repr

/-- A professional experience entry -/
structure Job where
  startYear : Nat
  endYear : Option Nat  -- None means "present"
  title : String
  subtitle : String
  description : String
  deriving BEq, Repr

/-- An education entry -/
structure Degree where
  startYear : Nat
  endYear : Nat
  title : String
  subtitle : String
  description : Option String
  deriving BEq, Repr

/-- An invited talk entry -/
structure Talk where
  month : String
  year : Nat
  title : String
  subtitle : String
  deriving BEq, Repr

/-- A grant/award entry -/
structure Grant where
  startYear : Nat
  endYear : Option Nat
  title : String
  subtitle : String
  description : String
  deriving BEq, Repr

/-- A teaching entry -/
structure Teaching where
  startYear : Nat
  endYear : Option Nat
  title : String
  subtitle : String
  description : String
  deriving BEq, Repr

/-- CV header information -/
structure Header where
  firstName : String
  lastName : String
  taglines : List String
  email : String
  scholar : Link
  website : Link
  github : Link
  phone : String
  deriving BEq, Repr

/-- Research section metadata -/
structure Research where
  coreQuestion : String
  leads : List String
  noteLink : Option Link
  deriving BEq, Repr

/-- The complete CV -/
structure CV where
  header : Header
  research : Research
  pubs : List Pub
  experience : List Job
  education : List Degree
  talks : List Talk
  funding : List Grant
  teaching : List Teaching
  collaborators : String
  deriving BEq, Repr

end Profile
