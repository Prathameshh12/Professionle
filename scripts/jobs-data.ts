import type { JobSeed } from "../src/types";

// 15 jobs. Each gets a full prose profile the LLM reasons over at answer time,
// a set of overlapping category tags, two hints, and a ~20-entry FAQ cache
// covering the most predictable question shapes so most real play never hits
// the LLM at all. Tune profile_prose and the FAQ list as real question_log
// data comes in.

export const JOBS: JobSeed[] = [
  {
    title: "Architect",
    synonyms: ["building designer", "building architect"],
    difficulty: "medium",
    tags: ["design", "construction", "creative", "engineering-adjacent", "professional services"],
    profile_prose: `An architect designs buildings and the spaces around them, balancing how a
building looks with how it functions, what it costs, and what local building codes allow. Most
of the working week happens indoors: sketching concepts, drafting detailed plans in CAD software
like Revit or AutoCAD, building physical or digital models, and sitting in meetings with clients,
engineers, and council planners. Site visits happen but are occasional, usually to check that
construction matches the drawings rather than to do physical labour. Becoming an architect takes
a five-year accredited degree followed by a period of supervised practical experience and a
formal registration exam; the title "architect" is legally protected in most countries and can't
be used without that licence. The job is genuinely creative but heavily constrained: budgets,
structural limits, zoning laws, and client taste all shape the final design as much as artistic
vision does, so it sits closer to "constrained creative professional" than "free artist." A
common misconception is confusing architects with structural engineers — the engineer runs the
load calculations and specifies beams and foundations, while the architect designs the layout,
form, and experience of the space and coordinates the wider design team. Architects work closely
with clients throughout a project, from an initial brief through design revisions to handover,
making it a client-facing role rather than a solitary one, and they typically work as part of a
firm alongside other architects, drafters, and interns. Pay is solid once licensed but modest
relative to the years of training required. It overlaps with interior design, urban planning,
landscape architecture, and construction management, and increasingly involves sustainability
and energy-efficiency knowledge. It is not a physically dangerous job, does not require a
uniform, and does not typically involve heavy travel, though larger firms may have architects
visit sites in other cities occasionally.`,
    hint_1: "This job needs years of formal study and a licensing exam before you can legally use the job title.",
    hint_2: "You spend most of your time indoors drawing up plans on a computer, with occasional visits to a construction site.",
    faq: [
      { question: "Do you work indoors?", answer: "yes" },
      { question: "Do you work outdoors?", answer: "sometimes" },
      { question: "Is it mostly desk work?", answer: "yes" },
      { question: "Is it a hands-on job?", answer: "sometimes" },
      { question: "Do you need a university degree?", answer: "yes" },
      { question: "Do you need a special license or certification?", answer: "yes" },
      { question: "Is it a creative job?", answer: "yes" },
      { question: "Is it a conventional job?", answer: "sometimes" },
      { question: "Is it dangerous?", answer: "no" },
      { question: "Is it physically demanding?", answer: "no" },
      { question: "Do you work with the public or clients?", answer: "yes" },
      { question: "Do you usually work alone?", answer: "not_really" },
      { question: "Do you work as part of a team?", answer: "yes" },
      { question: "Is it well paid?", answer: "yes" },
      { question: "Do you wear a uniform?", answer: "no" },
      { question: "Does the job involve travel?", answer: "sometimes" },
      { question: "Does it involve science?", answer: "sometimes" },
      { question: "Does it involve technology?", answer: "yes" },
      { question: "Do you work with animals?", answer: "no" },
      { question: "Do you work with children?", answer: "no" },
      { question: "Are you employed by someone else?", answer: "yes" },
      { question: "Is it in the entertainment industry?", answer: "no" },
      { question: "Is it a job kids commonly dream of doing?", answer: "not_really" },
      { question: "Do you work regular business hours?", answer: "sometimes" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
    ],
  },
  {
    title: "Commercial Airline Pilot",
    synonyms: ["airline pilot", "pilot", "commercial pilot", "captain"],
    difficulty: "easy",
    tags: ["aviation", "transport", "travel", "safety-critical"],
    profile_prose: `A commercial airline pilot flies passenger or cargo aircraft on scheduled
routes, working from a flight deck alongside a co-pilot and in constant coordination with cabin
crew, air traffic control, and airline operations. The job is highly technical and safety-focused
rather than creative: much of it is procedure, checklists, monitoring automated systems, and
making judgment calls around weather, fuel, and routing, with hands-on manual flying concentrated
in takeoff and landing. Training is long and expensive — a commercial pilot's licence, an
instrument rating, and typically an airline transport pilot licence, plus type-rating on specific
aircraft, take several years and significant flight hours before an airline will hire someone,
and pilots keep training and re-certifying throughout their careers with simulator checks. It is
a uniformed, highly visible public-facing job in the sense that pilots interact with passengers
and represent the airline, but the actual work in the air is a small, focused team of two or
three, not a crowd. Travel is central to the job by definition, including irregular hours,
time-zone changes, and nights away from home on longer routes, which is one of its biggest
lifestyle trade-offs. It's physically undemanding day to day but mentally demanding, requiring
sustained alertness and quick decision-making under regulation-heavy conditions. Pay varies
enormously by seniority and airline, starting modest at regional carriers and becoming
excellent at major airlines after years of seniority. It's not dangerous in the sense of routine
injury risk, but the consequences of error are severe, which is why the entire profession is
built around redundancy, checklists, and rigorous standards. It overlaps with the broader
aviation industry, including engineering, air traffic control, and the military, from which
many pilots originally trained.`,
    hint_1: "Getting into this job requires years of expensive training and multiple licences before anyone will hire you.",
    hint_2: "You work in a small team in a cockpit, and irregular hours and time-zone changes come with the territory.",
    faq: [
      { question: "Do you work indoors?", answer: "yes" },
      { question: "Do you work outdoors?", answer: "no" },
      { question: "Is it mostly desk work?", answer: "not_really" },
      { question: "Is it a hands-on job?", answer: "sometimes" },
      { question: "Do you need a university degree?", answer: "not_really" },
      { question: "Do you need a special license or certification?", answer: "yes" },
      { question: "Is it a creative job?", answer: "no" },
      { question: "Is it a conventional job?", answer: "yes" },
      { question: "Is it dangerous?", answer: "not_really" },
      { question: "Is it physically demanding?", answer: "no" },
      { question: "Do you work with the public or clients?", answer: "sometimes" },
      { question: "Do you usually work alone?", answer: "no" },
      { question: "Do you work as part of a team?", answer: "yes" },
      { question: "Is it well paid?", answer: "yes" },
      { question: "Do you wear a uniform?", answer: "yes" },
      { question: "Does the job involve travel?", answer: "yes" },
      { question: "Does it involve science?", answer: "sometimes" },
      { question: "Does it involve technology?", answer: "yes" },
      { question: "Do you work with animals?", answer: "no" },
      { question: "Do you work with children?", answer: "no" },
      { question: "Are you employed by someone else?", answer: "yes" },
      { question: "Is it in the entertainment industry?", answer: "no" },
      { question: "Is it a job kids commonly dream of doing?", answer: "yes" },
      { question: "Do you work regular business hours?", answer: "no" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
    ],
  },
  {
    title: "Wildlife Veterinarian",
    synonyms: ["wildlife vet", "zoo veterinarian", "vet", "veterinarian"],
    difficulty: "medium",
    tags: ["medical", "animals", "outdoors", "science", "conservation"],
    profile_prose: `A wildlife veterinarian diagnoses, treats, and helps conserve wild and
exotic animals, working in settings like zoos, wildlife rescue centres, national parks, or
research field sites rather than a typical suburban vet clinic. The role mixes hands-on medical
work — sedating and examining animals, performing surgery, treating injuries and disease — with
fieldwork like tracking animal populations, taking samples for disease surveillance, and
sometimes tranquilliser-dart work on animals too large or dangerous to handle directly. It
requires a full veterinary degree, which is highly competitive and takes five to six years, plus
often additional specialisation in wildlife or exotic-animal medicine. Physical demands are high:
the job can involve long days outdoors, travel to remote sites, and working with animals that can
be genuinely dangerous if a sedation or restraint goes wrong. It's a hands-on, practical job far
more than a desk job, though there is real science underpinning every decision — pharmacology,
anatomy, epidemiology — and paperwork/record-keeping is a real if smaller part of the week. It
isn't especially client-facing in the way a suburban vet is, since the "clients" are usually zoo
staff, park rangers, or conservation organisations rather than pet owners, though some
wildlife vets do public education. Pay is generally lower than small-animal veterinary
practice, reflecting the nonprofit and government funding much of wildlife medicine depends on.
It overlaps heavily with conservation biology, ecology, and environmental science, and common
misconceptions include assuming it's mostly about "playing with cute animals" — in reality a
large part of the job is disease management, population health, and difficult decisions
around injured or dying wildlife. It is not part of the entertainment industry, though zoo-based
wildlife vets do work in visitor-facing institutions.`,
    hint_1: "This job needs a full university medical degree in the same family as one for treating people, just for animals instead.",
    hint_2: "A lot of the work happens outdoors or in a zoo/park setting, and some of the patients could genuinely hurt you if things go wrong.",
    faq: [
      { question: "Do you work indoors?", answer: "sometimes" },
      { question: "Do you work outdoors?", answer: "yes" },
      { question: "Is it mostly desk work?", answer: "no" },
      { question: "Is it a hands-on job?", answer: "yes" },
      { question: "Do you need a university degree?", answer: "yes" },
      { question: "Do you need a special license or certification?", answer: "yes" },
      { question: "Is it a creative job?", answer: "not_really" },
      { question: "Is it a conventional job?", answer: "not_really" },
      { question: "Is it dangerous?", answer: "sometimes" },
      { question: "Is it physically demanding?", answer: "yes" },
      { question: "Do you work with the public or clients?", answer: "sometimes" },
      { question: "Do you usually work alone?", answer: "not_really" },
      { question: "Do you work as part of a team?", answer: "yes" },
      { question: "Is it well paid?", answer: "not_really" },
      { question: "Do you wear a uniform?", answer: "sometimes" },
      { question: "Does the job involve travel?", answer: "sometimes" },
      { question: "Does it involve science?", answer: "yes" },
      { question: "Does it involve technology?", answer: "sometimes" },
      { question: "Do you work with animals?", answer: "yes" },
      { question: "Are you employed by someone else?", answer: "yes" },
      { question: "Do you work with children?", answer: "no" },
      { question: "Is it in the entertainment industry?", answer: "no" },
      { question: "Is it a job kids commonly dream of doing?", answer: "yes" },
      { question: "Do you work regular business hours?", answer: "not_really" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
    ],
  },
  {
    title: "Video Game Designer",
    synonyms: ["game designer", "video game designer", "game developer"],
    difficulty: "easy",
    tags: ["creative", "technology", "entertainment", "media"],
    profile_prose: `A video game designer shapes how a game plays: its rules, systems, levels,
progression, and the moment-to-moment feel of interacting with it, as distinct from a programmer
who writes the underlying code or an artist who creates visuals. Day to day work includes writing
design documents, building levels or systems in an editor, running and analysing playtests, and
collaborating closely with programmers, artists, writers, and producers in an iterative back-and-
forth. It's a desk-based, indoor, computer-heavy job, and while it's genuinely creative, it's also
highly analytical: a lot of the work is about balance, pacing, and player psychology rather than
free-form artistic expression, so it sits in an unconventional but structured creative space. No
specific university degree is legally required, unlike medicine or architecture, though many
designers hold degrees in game design, computer science, or related fields, and breaking in is
competitive and often starts in QA testing or a related junior role. It's not physically demanding
or dangerous, and doesn't require a uniform or licence. Designers usually work as part of a larger
development team rather than alone, and the job is very much part of the entertainment and media
industry. Hours can be irregular, especially "crunch" periods before a game ships, which is a
well-known downside of the industry. Pay varies widely: modest at small indie studios, solid to
excellent at large AAA studios, and highly variable for solo/indie developers who also handle
design themselves. A common misconception is that game designers spend their day playing games for
fun — in reality most playtesting is structured, repetitive, and focused on finding problems
rather than enjoying the game. It overlaps with software development, UX design, psychology, and
storytelling, and does not typically involve travel, science in the traditional sense, or work
with animals or children.`,
    hint_1: "You don't need a specific licence or protected degree to do this job, but it's a competitive field to break into.",
    hint_2: "The job is about designing rules and systems for something people play — most of your day is spent at a computer, not actually playing for fun.",
    faq: [
      { question: "Do you work indoors?", answer: "yes" },
      { question: "Do you work outdoors?", answer: "no" },
      { question: "Is it mostly desk work?", answer: "yes" },
      { question: "Is it a hands-on job?", answer: "not_really" },
      { question: "Do you need a university degree?", answer: "not_really" },
      { question: "Do you need a special license or certification?", answer: "no" },
      { question: "Is it a creative job?", answer: "yes" },
      { question: "Is it a conventional job?", answer: "not_really" },
      { question: "Is it dangerous?", answer: "no" },
      { question: "Is it physically demanding?", answer: "no" },
      { question: "Do you work with the public or clients?", answer: "not_really" },
      { question: "Do you usually work alone?", answer: "not_really" },
      { question: "Do you work as part of a team?", answer: "yes" },
      { question: "Is it well paid?", answer: "sometimes" },
      { question: "Do you wear a uniform?", answer: "no" },
      { question: "Does the job involve travel?", answer: "no" },
      { question: "Does it involve science?", answer: "not_really" },
      { question: "Does it involve technology?", answer: "yes" },
      { question: "Do you work with animals?", answer: "no" },
      { question: "Do you work with children?", answer: "no" },
      { question: "Are you employed by someone else?", answer: "yes" },
      { question: "Is it in the entertainment industry?", answer: "yes" },
      { question: "Is it a job kids commonly dream of doing?", answer: "yes" },
      { question: "Do you work regular business hours?", answer: "sometimes" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
    ],
  },
  {
    title: "Marine Biologist",
    synonyms: ["marine scientist", "oceanographer"],
    difficulty: "medium",
    tags: ["science", "outdoors", "research", "conservation", "animals"],
    profile_prose: `A marine biologist studies ocean life and ecosystems, which in practice
splits between fieldwork — diving, boat surveys, tagging animals, collecting water and tissue
samples — and a large amount of lab and desk work analysing data, writing up findings, and
applying for research funding. Contrary to the popular image, most marine biologists spend more
time at a computer or lab bench than in the water; fieldwork is often seasonal or occasional
rather than constant. A university degree is required at minimum, and most research or academic
roles need a postgraduate degree (Master's or PhD), especially for anyone wanting to lead their
own research rather than work as a field or lab technician. The job is genuinely scientific:
statistics, biology, chemistry, and increasingly data science and modelling all play a role. It's
moderately physically demanding when fieldwork is happening — diving certifications are common
requirement — but not dangerous in a routine sense, beyond normal ocean/diving safety
considerations. Marine biologists usually work as part of a research team or institution
(universities, government agencies, conservation NGOs, aquariums) rather than alone, though
individual projects can involve solo data analysis. It is not a particularly well-paid field
relative to the years of study required, especially in academia and conservation, where funding
is often limited and short-term contracts are common. It overlaps with ecology, environmental
science, conservation policy, and sometimes public education work at aquariums. It doesn't
require a uniform in an office sense, though wetsuits and field gear count as functional
"uniforms" during fieldwork. It's not part of the entertainment industry, doesn't typically
involve children as part of the core job (aside from occasional public outreach), and travel to
field sites, conferences, or remote coastlines is a real and expected part of the career.`,
    hint_1: "Most people picture this job as constant diving, but in reality far more of the working week happens at a desk or lab bench than in the ocean.",
    hint_2: "A postgraduate degree is more or less expected if you want to lead your own research rather than support someone else's.",
    faq: [
      { question: "Do you work indoors?", answer: "sometimes" },
      { question: "Do you work outdoors?", answer: "sometimes" },
      { question: "Is it mostly desk work?", answer: "sometimes" },
      { question: "Is it a hands-on job?", answer: "sometimes" },
      { question: "Do you need a university degree?", answer: "yes" },
      { question: "Do you need a special license or certification?", answer: "sometimes" },
      { question: "Is it a creative job?", answer: "not_really" },
      { question: "Is it a conventional job?", answer: "not_really" },
      { question: "Is it dangerous?", answer: "not_really" },
      { question: "Is it physically demanding?", answer: "sometimes" },
      { question: "Do you work with the public or clients?", answer: "not_really" },
      { question: "Do you usually work alone?", answer: "sometimes" },
      { question: "Do you work as part of a team?", answer: "yes" },
      { question: "Is it well paid?", answer: "not_really" },
      { question: "Do you wear a uniform?", answer: "sometimes" },
      { question: "Does the job involve travel?", answer: "yes" },
      { question: "Does it involve science?", answer: "yes" },
      { question: "Does it involve technology?", answer: "sometimes" },
      { question: "Do you work with animals?", answer: "yes" },
      { question: "Do you work with children?", answer: "not_really" },
      { question: "Are you employed by someone else?", answer: "yes" },
      { question: "Is it in the entertainment industry?", answer: "no" },
      { question: "Is it a job kids commonly dream of doing?", answer: "yes" },
      { question: "Do you work regular business hours?", answer: "not_really" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
    ],
  },
  {
    title: "Forensic Accountant",
    synonyms: ["fraud investigator", "forensic auditor"],
    difficulty: "hard",
    tags: ["finance", "investigation", "professional services", "law-adjacent"],
    profile_prose: `A forensic accountant investigates financial records to uncover fraud,
embezzlement, money laundering, or financial misconduct, often for law firms, government
agencies, insurers, or corporate legal teams, and sometimes gives expert testimony in court. The
work is entirely desk-based and analytical: combing through transactions, spreadsheets, and
accounting records, reconstructing what actually happened financially, and writing detailed
reports that can withstand legal scrutiny. It requires an accounting or finance degree at
minimum, and most practitioners hold a professional accounting qualification (like CPA or
equivalent) plus additional forensic/fraud-examiner certification. It is not physically
demanding or dangerous, doesn't involve a uniform, and rarely involves travel beyond occasional
site visits or court appearances. Despite the word "forensic," it has nothing to do with crime
scenes, bodies, or physical evidence — it's a common misconception people confuse it with
forensic science or forensic pathology. The role is genuinely investigative and detective-like
in spirit, just applied to numbers and paper trails instead of physical clues, which makes it
more intellectually "unconventional" than routine bookkeeping despite looking, from the outside,
like ordinary accounting. Forensic accountants work both independently on specific case files and
as part of larger investigation or litigation-support teams, and the job is client-facing in a
professional sense — lawyers, company boards, and sometimes courts are the audience for the work,
even if there's no day-to-day public interaction. Pay is generally strong, reflecting the
specialised accounting/legal skill set required. It overlaps with law, criminology, corporate
compliance, and cybersecurity in cases involving digital financial fraud. It does not involve
animals, children, science in the traditional sense, or the entertainment industry, and hours are
mostly regular except during active litigation deadlines.`,
    hint_1: "Despite the name, this job has nothing to do with crime scenes or bodies — the \"evidence\" here is spreadsheets and transaction records.",
    hint_2: "You need a full accounting qualification for this role, and the work often ends with a report that could be used as evidence in court.",
    faq: [
      { question: "Do you work indoors?", answer: "yes" },
      { question: "Do you work outdoors?", answer: "no" },
      { question: "Is it mostly desk work?", answer: "yes" },
      { question: "Is it a hands-on job?", answer: "no" },
      { question: "Do you need a university degree?", answer: "yes" },
      { question: "Do you need a special license or certification?", answer: "yes" },
      { question: "Is it a creative job?", answer: "no" },
      { question: "Is it a conventional job?", answer: "sometimes" },
      { question: "Is it dangerous?", answer: "no" },
      { question: "Is it physically demanding?", answer: "no" },
      { question: "Do you work with the public or clients?", answer: "yes" },
      { question: "Do you usually work alone?", answer: "sometimes" },
      { question: "Do you work as part of a team?", answer: "yes" },
      { question: "Is it well paid?", answer: "yes" },
      { question: "Do you wear a uniform?", answer: "no" },
      { question: "Does the job involve travel?", answer: "not_really" },
      { question: "Does it involve science?", answer: "no" },
      { question: "Does it involve technology?", answer: "yes" },
      { question: "Do you work with animals?", answer: "no" },
      { question: "Do you work with children?", answer: "no" },
      { question: "Are you employed by someone else?", answer: "yes" },
      { question: "Is it in the entertainment industry?", answer: "no" },
      { question: "Is it a job kids commonly dream of doing?", answer: "not_really" },
      { question: "Do you work regular business hours?", answer: "yes" },
      { question: "Is it a job most people have heard of?", answer: "not_really" },
    ],
  },
  {
    title: "Stand-up Comedian",
    synonyms: ["comedian"],
    difficulty: "easy",
    tags: ["entertainment", "performance", "creative", "media"],
    profile_prose: `A stand-up comedian writes and performs comedic material live in front of an
audience, typically in comedy clubs, theatres, or increasingly on tour and via streamed or
recorded specials. The core work is creative and highly personal: writing jokes and bits, testing
them at small "open mic" nights, refining timing and delivery based on real audience reaction, and
gradually building a set. It's a performance job through and through, meaning it's public-facing
in the most direct way possible — the audience is right there, reacting in real time, which makes
it emotionally demanding even though it's not physically dangerous or strenuous. There's no
degree, licence, or formal qualification required at all; it's one of the most purely merit- and
persistence-based careers, built through years of unpaid or low-paid stage time before any real
income arrives. Most comedians work essentially alone as a business — writing their own material,
booking their own gigs early on — even though the wider industry (agents, club bookers, tour
managers, other comedians) forms a loose community around them. Hours are irregular by nature: gigs
happen at night, often late, and touring comedians travel extensively. Pay is extremely
inconsistent — very low or nonexistent for most people who try it, moderate for working club
comedians, and very high only for the small number who reach TV, streaming specials, or arena
tours, so "is it well paid" genuinely depends on career stage. It's squarely part of the
entertainment industry and does not involve science, animals, children as a core audience
(though some comedians do family-friendly work), or any uniform. It overlaps with acting,
writing, and podcasting, since many comedians branch into those adjacent media as their careers
develop.`,
    hint_1: "There's no degree or licence for this job at all — it's built almost entirely on stage time and persistence.",
    hint_2: "Pay for this job swings wildly: most people who try it make very little, but the rare few who break through can do extremely well.",
    faq: [
      { question: "Do you work indoors?", answer: "yes" },
      { question: "Do you work outdoors?", answer: "no" },
      { question: "Is it mostly desk work?", answer: "not_really" },
      { question: "Is it a hands-on job?", answer: "no" },
      { question: "Do you need a university degree?", answer: "no" },
      { question: "Do you need a special license or certification?", answer: "no" },
      { question: "Is it a creative job?", answer: "yes" },
      { question: "Is it a conventional job?", answer: "no" },
      { question: "Is it dangerous?", answer: "no" },
      { question: "Is it physically demanding?", answer: "no" },
      { question: "Do you work with the public or clients?", answer: "yes" },
      { question: "Do you usually work alone?", answer: "yes" },
      { question: "Do you work as part of a team?", answer: "not_really" },
      { question: "Is it well paid?", answer: "sometimes" },
      { question: "Do you wear a uniform?", answer: "no" },
      { question: "Does the job involve travel?", answer: "sometimes" },
      { question: "Does it involve science?", answer: "no" },
      { question: "Does it involve technology?", answer: "not_really" },
      { question: "Do you work with animals?", answer: "no" },
      { question: "Do you work with children?", answer: "no" },
      { question: "Are you employed by someone else?", answer: "yes" },
      { question: "Is it in the entertainment industry?", answer: "yes" },
      { question: "Is it a job kids commonly dream of doing?", answer: "sometimes" },
      { question: "Do you work regular business hours?", answer: "no" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
    ],
  },
  {
    title: "Structural Engineer",
    synonyms: ["civil structural engineer"],
    difficulty: "medium",
    tags: ["engineering-adjacent", "construction", "science", "professional services"],
    profile_prose: `A structural engineer calculates and designs the "skeleton" of buildings and
other structures — beams, columns, foundations, load paths — to make sure they stand up safely
under their own weight, occupants, weather, and events like earthquakes. Work is mostly desk-based
using specialised engineering software to model loads and stresses, combined with report-writing
and coordination with architects and construction teams, plus periodic site visits to inspect
construction or existing structures. A university engineering degree is required, along with
professional chartered/licensed engineer status in most countries before someone can independently
sign off on structural designs, similar in spirit to an architect's registration requirement. The
job is technical and calculation-heavy rather than creative in an artistic sense, though there is
real problem-solving and design judgment involved, especially on unusual or ambitious buildings —
so it's more "conventional professional" than "unconventional creative," in contrast with the
architects they work alongside. It is not physically dangerous or demanding day to day, though
site visits sometimes mean hard hats, scaffolding, and construction environments. Structural
engineers work closely with architects, other engineers, and contractors as part of a wider
project team rather than alone, and while there is client interaction, it's less central and less
frequent than for an architect. Pay is solid and generally comparable to or slightly above
architecture given the additional licensing bar. It overlaps with civil engineering, architecture,
and construction management, and a common misconception is that structural engineers design how
buildings look — that's the architect's job; the engineer's job is making sure it doesn't fall
down. It doesn't involve animals, children, travel beyond occasional site work, or the
entertainment industry.`,
    hint_1: "This job is about making sure a building doesn't fall down, not about how it looks — that part belongs to someone else on the team.",
    hint_2: "You need an engineering degree and, in most places, formal chartered/licensed status before you can sign off on a design yourself.",
    faq: [
      { question: "Do you work indoors?", answer: "yes" },
      { question: "Do you work outdoors?", answer: "sometimes" },
      { question: "Is it mostly desk work?", answer: "yes" },
      { question: "Is it a hands-on job?", answer: "not_really" },
      { question: "Do you need a university degree?", answer: "yes" },
      { question: "Do you need a special license or certification?", answer: "yes" },
      { question: "Is it a creative job?", answer: "not_really" },
      { question: "Is it a conventional job?", answer: "yes" },
      { question: "Is it dangerous?", answer: "no" },
      { question: "Is it physically demanding?", answer: "no" },
      { question: "Do you work with the public or clients?", answer: "sometimes" },
      { question: "Do you usually work alone?", answer: "not_really" },
      { question: "Do you work as part of a team?", answer: "yes" },
      { question: "Is it well paid?", answer: "yes" },
      { question: "Do you wear a uniform?", answer: "no" },
      { question: "Does the job involve travel?", answer: "not_really" },
      { question: "Does it involve science?", answer: "yes" },
      { question: "Does it involve technology?", answer: "yes" },
      { question: "Do you work with animals?", answer: "no" },
      { question: "Do you work with children?", answer: "no" },
      { question: "Are you employed by someone else?", answer: "yes" },
      { question: "Is it in the entertainment industry?", answer: "no" },
      { question: "Is it a job kids commonly dream of doing?", answer: "not_really" },
      { question: "Do you work regular business hours?", answer: "yes" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
    ],
  },
  {
    title: "Sommelier",
    synonyms: ["wine steward", "wine expert"],
    difficulty: "hard",
    tags: ["hospitality", "food and drink", "sensory", "service"],
    profile_prose: `A sommelier is a trained wine professional, usually working in a restaurant,
hotel, or wine retailer, responsible for building and managing a wine list, pairing wines with
food, training other staff, and guiding guests through wine choices at the table. The job blends
sensory expertise — tasting and evaluating wine for quality, origin, and style — with hospitality
and sales skills, since a large part of the role is talking to guests and reading what they'll
enjoy rather than working alone with bottles. It's mostly an indoor, on-your-feet, client-facing
role rather than desk work, and while there's no legally required degree, serious sommeliers
pursue rigorous certification programs (such as the Court of Master Sommeliers or WSET) that can
take years and involve notoriously difficult blind-tasting exams. It is not physically dangerous,
though the job can involve long hours on your feet during service and evening/weekend shifts are
standard, since restaurants are busiest then. It's a genuinely skilled, somewhat unconventional
profession that surprises people with how technical and academic it is — top-level sommeliers
study geography, chemistry, and history of wine regions as seriously as any academic subject,
which is a common misconception people underestimate. Sommeliers usually work as part of a
restaurant or hospitality team, reporting to management while also training junior wait staff. Pay
ranges widely: modest for junior or restaurant-level sommeliers, quite strong for head sommeliers
at top establishments or those who move into wine buying, consulting, or education. It overlaps
with hospitality management, wine-making, and food and beverage more broadly, and does not
involve animals, children, travel as a core requirement (though wine-region trips are a nice
perk for some), or the entertainment industry.`,
    hint_1: "There's no required degree for this job, but the top-level certification exams are notoriously difficult, involving blind-tasting under pressure.",
    hint_2: "Most of your working time is spent on your feet talking to restaurant guests, not sitting somewhere quietly tasting wine alone.",
    faq: [
      { question: "Do you work indoors?", answer: "yes" },
      { question: "Do you work outdoors?", answer: "no" },
      { question: "Is it mostly desk work?", answer: "no" },
      { question: "Is it a hands-on job?", answer: "sometimes" },
      { question: "Do you need a university degree?", answer: "no" },
      { question: "Do you need a special license or certification?", answer: "sometimes" },
      { question: "Is it a creative job?", answer: "not_really" },
      { question: "Is it a conventional job?", answer: "not_really" },
      { question: "Is it dangerous?", answer: "no" },
      { question: "Is it physically demanding?", answer: "sometimes" },
      { question: "Do you work with the public or clients?", answer: "yes" },
      { question: "Do you usually work alone?", answer: "no" },
      { question: "Do you work as part of a team?", answer: "yes" },
      { question: "Is it well paid?", answer: "sometimes" },
      { question: "Do you wear a uniform?", answer: "sometimes" },
      { question: "Does the job involve travel?", answer: "not_really" },
      { question: "Does it involve science?", answer: "sometimes" },
      { question: "Does it involve technology?", answer: "no" },
      { question: "Do you work with animals?", answer: "no" },
      { question: "Do you work with children?", answer: "no" },
      { question: "Are you employed by someone else?", answer: "yes" },
      { question: "Is it in the entertainment industry?", answer: "no" },
      { question: "Is it a job kids commonly dream of doing?", answer: "not_really" },
      { question: "Do you work regular business hours?", answer: "no" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
    ],
  },
  {
    title: "Funeral Director",
    synonyms: ["undertaker", "mortician"],
    difficulty: "hard",
    tags: ["service", "ceremonial", "hospitality-adjacent"],
    profile_prose: `A funeral director organises and oversees funerals and memorial services,
working directly with grieving families to arrange everything from body preparation and transport
to the ceremony, paperwork, and coordination with cemeteries, crematoriums, and religious or
civil celebrants. It's a deeply client-facing role, but the "clients" are people in the middle of
loss, which makes emotional steadiness, empathy, and calm professionalism as important as any
technical skill. The work mixes practical, hands-on tasks (some funeral directors also perform
embalming, though in many funeral homes embalming is a separate specialised role) with
administrative work — paperwork, permits, scheduling, and managing suppliers like florists and
caterers. Requirements vary by country: some places require formal mortuary science
qualifications and licensing, especially for embalming, while general funeral direction and
arrangement work has lighter formal requirements but still typically involves structured training
or apprenticeship. It is not physically dangerous, though it can be emotionally demanding and
irregular in hours, since death and grieving families don't follow a 9-to-5 schedule. Funeral
directors usually work as part of a small funeral home team rather than alone, and it is not a
job most people fantasise about as children, despite being essential and often quite respected
within a community. Pay is generally moderate and stable, reflecting steady, predictable demand
for the service rather than boom-and-bust cycles. It overlaps with healthcare/mortuary science,
religious and ceremonial services, and event planning, given the logistics involved in running a
service. It does not involve animals, children as a target audience, travel beyond local
transport, or the entertainment industry, and does not require a university degree in most
jurisdictions, though specific licensing/training requirements do apply.`,
    hint_1: "This job is deeply people-facing, but the people you're serving are almost always in the middle of grief rather than ordinary customers.",
    hint_2: "Hours are irregular because the core need this job responds to doesn't happen on a schedule.",
    faq: [
      { question: "Do you work indoors?", answer: "yes" },
      { question: "Do you work outdoors?", answer: "sometimes" },
      { question: "Is it mostly desk work?", answer: "not_really" },
      { question: "Is it a hands-on job?", answer: "sometimes" },
      { question: "Do you need a university degree?", answer: "not_really" },
      { question: "Do you need a special license or certification?", answer: "sometimes" },
      { question: "Is it a creative job?", answer: "not_really" },
      { question: "Is it a conventional job?", answer: "not_really" },
      { question: "Is it dangerous?", answer: "no" },
      { question: "Is it physically demanding?", answer: "sometimes" },
      { question: "Do you work with the public or clients?", answer: "yes" },
      { question: "Do you usually work alone?", answer: "not_really" },
      { question: "Do you work as part of a team?", answer: "yes" },
      { question: "Is it well paid?", answer: "sometimes" },
      { question: "Do you wear a uniform?", answer: "sometimes" },
      { question: "Does the job involve travel?", answer: "no" },
      { question: "Does it involve science?", answer: "not_really" },
      { question: "Does it involve technology?", answer: "no" },
      { question: "Do you work with animals?", answer: "no" },
      { question: "Do you work with children?", answer: "no" },
      { question: "Are you employed by someone else?", answer: "yes" },
      { question: "Is it in the entertainment industry?", answer: "no" },
      { question: "Is it a job kids commonly dream of doing?", answer: "no" },
      { question: "Do you work regular business hours?", answer: "no" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
    ],
  },
  {
    title: "Cybersecurity Analyst",
    synonyms: ["security analyst", "infosec analyst", "SOC analyst"],
    difficulty: "medium",
    tags: ["technology", "security", "investigation", "professional services"],
    profile_prose: `A cybersecurity analyst protects an organisation's computer systems and data
from attacks, working to monitor networks for suspicious activity, investigate security incidents,
patch vulnerabilities, and help design defences before problems happen. It's an entirely desk-
based, indoor, computer-heavy job, often involving long stretches watching dashboards and alerts,
punctuated by intense bursts of activity when responding to an actual incident or breach — closer
in feel to digital detective work than routine IT support. A university degree in computer
science or a related field is common but not always strictly required; industry certifications
(like Security+, CISSP, or OSCP) often matter as much or more than a formal degree, and many
analysts enter the field through general IT roles first. It is not physically demanding or
dangerous, doesn't require a uniform, and doesn't typically involve travel, animals, or children.
Analysts usually work as part of a security team (often called a SOC, or security operations
centre) rather than alone, though individual investigations can involve solo deep-dives into logs
and systems. Some roles require on-call shifts or overnight coverage, since attacks and incidents
don't wait for business hours, so "regular hours" varies by employer. Pay is generally strong,
reflecting high demand and a persistent skills shortage in the field. It's a technical rather than
traditionally creative job, though good analysts do need creative, adversarial thinking to
anticipate how an attacker might try to break in — sometimes described as "thinking like a
hacker." It overlaps with software engineering, IT infrastructure, law enforcement (in cases
involving cybercrime investigation), and increasingly with fields like forensic accounting when
fraud has a digital angle. It is not part of the entertainment industry, and a common
misconception (fuelled by film and TV) is that the job looks like fast-typing dramatic hacking
scenes — in reality it's mostly methodical log analysis, documentation, and process.`,
    hint_1: "Industry certifications often matter as much as a university degree for getting into this field.",
    hint_2: "The job is mostly quiet monitoring and log analysis, punctuated by intense bursts of activity when something actually goes wrong.",
    faq: [
      { question: "Do you work indoors?", answer: "yes" },
      { question: "Do you work outdoors?", answer: "no" },
      { question: "Is it mostly desk work?", answer: "yes" },
      { question: "Is it a hands-on job?", answer: "not_really" },
      { question: "Do you need a university degree?", answer: "sometimes" },
      { question: "Do you need a special license or certification?", answer: "sometimes" },
      { question: "Is it a creative job?", answer: "not_really" },
      { question: "Is it a conventional job?", answer: "not_really" },
      { question: "Is it dangerous?", answer: "no" },
      { question: "Is it physically demanding?", answer: "no" },
      { question: "Do you work with the public or clients?", answer: "not_really" },
      { question: "Do you usually work alone?", answer: "sometimes" },
      { question: "Do you work as part of a team?", answer: "yes" },
      { question: "Is it well paid?", answer: "yes" },
      { question: "Do you wear a uniform?", answer: "no" },
      { question: "Does the job involve travel?", answer: "no" },
      { question: "Does it involve science?", answer: "not_really" },
      { question: "Does it involve technology?", answer: "yes" },
      { question: "Do you work with animals?", answer: "no" },
      { question: "Do you work with children?", answer: "no" },
      { question: "Is it in the entertainment industry?", answer: "no" },
      { question: "Are you employed by someone else?", answer: "yes" },
      { question: "Is it a job kids commonly dream of doing?", answer: "not_really" },
      { question: "Do you work regular business hours?", answer: "sometimes" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
    ],
  },
  {
    title: "Professional Chef",
    synonyms: ["head chef", "executive chef", "cook"],
    difficulty: "easy",
    tags: ["food and drink", "hospitality", "service", "creative"],
    profile_prose: `A professional chef plans, prepares, and oversees the cooking of food in a
restaurant, hotel, or other commercial kitchen, moving up over a career from junior line cook
through stations to sous chef and eventually head or executive chef, who designs menus and manages
the whole kitchen team. The job is intensely hands-on and physical: standing for long shifts,
working in a hot, fast-paced environment, handling knives and hot equipment, and coordinating
tightly timed output during service so dozens of dishes come out correctly and together. No
university degree or formal licence is required — many chefs learn on the job through
apprenticeship-style kitchen experience, though culinary school is a common and often faster
path in. It's genuinely creative, especially at the menu-design and head-chef level, but junior
roles are far more about speed, consistency, and following recipes precisely than free
experimentation. Hours are notoriously demanding: evenings, weekends, and holidays are often the
busiest times, the opposite of a typical office schedule, and the job has a reputation (partly
deserved) for being physically and mentally gruelling, especially in high-end kitchens. Chefs
work as part of a tightly coordinated team with a clear hierarchy, rather than alone, and while
head chefs sometimes interact with guests, most of the role happens behind the scenes rather than
front-of-house. Pay varies hugely: modest for junior line cooks, and only strong at the head-chef
or celebrity-chef level, so most working chefs are not highly paid relative to the physical
demands of the job. It overlaps with hospitality management, food science/nutrition to a lesser
extent, and increasingly with media for chefs who move into television, cookbooks, or content
creation. It doesn't involve animals, children, or significant travel as standard, though some
chefs do consult or open restaurants internationally.`,
    hint_1: "No university degree is required for this job — most people learn through hands-on kitchen experience or a culinary school apprenticeship.",
    hint_2: "The busiest hours for this job are evenings, weekends, and holidays, exactly when most other jobs are quietest.",
    faq: [
      { question: "Do you work indoors?", answer: "yes" },
      { question: "Do you work outdoors?", answer: "no" },
      { question: "Is it mostly desk work?", answer: "no" },
      { question: "Is it a hands-on job?", answer: "yes" },
      { question: "Do you need a university degree?", answer: "no" },
      { question: "Do you need a special license or certification?", answer: "no" },
      { question: "Is it a creative job?", answer: "sometimes" },
      { question: "Is it a conventional job?", answer: "not_really" },
      { question: "Is it dangerous?", answer: "sometimes" },
      { question: "Is it physically demanding?", answer: "yes" },
      { question: "Do you work with the public or clients?", answer: "not_really" },
      { question: "Do you usually work alone?", answer: "no" },
      { question: "Do you work as part of a team?", answer: "yes" },
      { question: "Is it well paid?", answer: "not_really" },
      { question: "Do you wear a uniform?", answer: "yes" },
      { question: "Does the job involve travel?", answer: "no" },
      { question: "Does it involve science?", answer: "not_really" },
      { question: "Does it involve technology?", answer: "no" },
      { question: "Do you work with animals?", answer: "no" },
      { question: "Do you work with children?", answer: "no" },
      { question: "Is it in the entertainment industry?", answer: "not_really" },
      { question: "Is it a job kids commonly dream of doing?", answer: "yes" },
      { question: "Do you work regular business hours?", answer: "no" },
      { question: "Are you employed by someone else?", answer: "yes" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
    ],
  },
  {
    title: "Long-haul Truck Driver",
    synonyms: ["truck driver", "truckie", "lorry driver"],
    difficulty: "easy",
    tags: ["transport", "logistics", "solo work"],
    profile_prose: `A long-haul truck driver transports goods over long distances by road, often
crossing state or national borders, spending most working hours alone in the cab and away from
home for days or weeks at a time. The job is physically sedentary in the sense of sitting for
long stretches, but demanding in other ways: irregular sleep, long hours governed by
legally mandated rest-break rules, and the responsibility of handling a large, heavy vehicle
safely in all weather and traffic conditions. Training requires a specific heavy-vehicle driving
licence (with different classes depending on vehicle size and cargo type, such as hazardous
materials endorsements), which is a real barrier to entry but doesn't require a university degree
or years of academic study — it's more like structured practical certification. It is not a
desk job, though there is real solo "downtime" in the cab, and much of the actual driving,
loading/unloading coordination, and paperwork (logs, delivery documentation) is done independently
rather than as part of a close team, even though drivers are part of a wider logistics company.
It's not typically dangerous in a violent sense, but does carry real physical risk from road
accidents and fatigue, which is why regulations around rest breaks exist. Pay is moderate to
decent depending on region, route type, and experience, and is often structured around distance
or delivery targets rather than a flat hourly wage. The job is essential to a functioning economy
but doesn't have much public visibility or glamour, and it is not something most children dream of
doing. It overlaps with logistics and supply chain more broadly, and does not involve animals,
children, science, technology beyond vehicle systems and GPS/logistics software, or the
entertainment industry. Travel is the literal core of the job, by definition.`,
    hint_1: "This job needs a specific practical licence, not a university degree, and most of the working day is spent alone.",
    hint_2: "Being away from home for days or weeks at a time, covering long distances, is simply part of what this job is.",
    faq: [
      { question: "Do you work indoors?", answer: "not_really" },
      { question: "Do you work outdoors?", answer: "not_really" },
      { question: "Is it mostly desk work?", answer: "no" },
      { question: "Is it a hands-on job?", answer: "sometimes" },
      { question: "Do you need a university degree?", answer: "no" },
      { question: "Do you need a special license or certification?", answer: "yes" },
      { question: "Is it a creative job?", answer: "no" },
      { question: "Is it a conventional job?", answer: "yes" },
      { question: "Is it dangerous?", answer: "sometimes" },
      { question: "Is it physically demanding?", answer: "sometimes" },
      { question: "Do you work with the public or clients?", answer: "not_really" },
      { question: "Do you usually work alone?", answer: "yes" },
      { question: "Do you work as part of a team?", answer: "not_really" },
      { question: "Is it well paid?", answer: "sometimes" },
      { question: "Do you wear a uniform?", answer: "no" },
      { question: "Does the job involve travel?", answer: "yes" },
      { question: "Does it involve science?", answer: "no" },
      { question: "Does it involve technology?", answer: "sometimes" },
      { question: "Do you work with animals?", answer: "no" },
      { question: "Do you work with children?", answer: "no" },
      { question: "Is it in the entertainment industry?", answer: "no" },
      { question: "Is it a job kids commonly dream of doing?", answer: "not_really" },
      { question: "Do you work regular business hours?", answer: "no" },
      { question: "Are you employed by someone else?", answer: "yes" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
    ],
  },
  {
    title: "Museum Curator",
    synonyms: ["curator"],
    difficulty: "hard",
    tags: ["culture", "research", "education", "arts"],
    profile_prose: `A museum curator researches, selects, and manages a museum or gallery's
collection, deciding what gets acquired, how objects are cared for, and how exhibitions are
researched, designed, and presented to the public. Much of the job is desk- and research-based —
reading, writing exhibition text and catalogues, corresponding with lenders and other
institutions, and managing collection records — combined with more hands-on work handling and
assessing objects, and close collaboration with conservators, designers, and educators when
building an exhibition. A relevant postgraduate degree (often a Master's in art history,
archaeology, museum studies, or a related specialist field) is close to essential for most
curatorial roles, reflecting how research-heavy and specialised the work is. It is not physically
dangerous or demanding in a general sense, though handling fragile or valuable objects requires
care and sometimes specific handling training. Curators work as part of a wider museum team —
conservators, registrars, educators, designers, directors — rather than alone, even though
individual research projects can be solitary. It is client-facing in an indirect sense: the
"audience" is the visiting public and sometimes donors or lending institutions, rather than
day-to-day one-on-one clients. Pay is generally modest relative to the level of education
required, reflecting the nonprofit/public-sector funding of most museums, and jobs are
competitive relative to the number of positions available. It overlaps with academic research,
art history, archaeology, history, and increasingly digital collections management. It is not
part of the entertainment industry, though museums do compete for visitor attention in similar
ways to other cultural and leisure destinations, and some curatorial work does involve public
talks or education programs that bring curators into contact with school groups or children. It
doesn't typically require extensive travel, though research trips, loans, and conferences do
happen periodically, and it doesn't involve animals except in the case of natural history museum
specimens.`,
    hint_1: "A postgraduate degree in a specialist field is close to essential for this job — it's a research career as much as anything else.",
    hint_2: "The job is about deciding what belongs in a collection and how to present it to the public, not just protecting old objects behind glass.",
    faq: [
      { question: "Do you work indoors?", answer: "yes" },
      { question: "Do you work outdoors?", answer: "no" },
      { question: "Is it mostly desk work?", answer: "yes" },
      { question: "Is it a hands-on job?", answer: "sometimes" },
      { question: "Do you need a university degree?", answer: "yes" },
      { question: "Do you need a special license or certification?", answer: "not_really" },
      { question: "Is it a creative job?", answer: "sometimes" },
      { question: "Is it a conventional job?", answer: "not_really" },
      { question: "Is it dangerous?", answer: "no" },
      { question: "Is it physically demanding?", answer: "no" },
      { question: "Do you work with the public or clients?", answer: "sometimes" },
      { question: "Do you usually work alone?", answer: "sometimes" },
      { question: "Do you work as part of a team?", answer: "yes" },
      { question: "Is it well paid?", answer: "not_really" },
      { question: "Do you wear a uniform?", answer: "no" },
      { question: "Does the job involve travel?", answer: "sometimes" },
      { question: "Does it involve science?", answer: "not_really" },
      { question: "Does it involve technology?", answer: "not_really" },
      { question: "Do you work with animals?", answer: "no" },
      { question: "Do you work with children?", answer: "sometimes" },
      { question: "Is it in the entertainment industry?", answer: "no" },
      { question: "Is it a job kids commonly dream of doing?", answer: "not_really" },
      { question: "Do you work regular business hours?", answer: "yes" },
      { question: "Are you employed by someone else?", answer: "yes" },
      { question: "Is it a job most people have heard of?", answer: "sometimes" },
    ],
  },
  {
    title: "Firefighter",
    synonyms: ["fire fighter", "fireman", "firewoman"],
    difficulty: "easy",
    tags: ["emergency services", "public safety", "physical"],
    profile_prose: `A firefighter responds to fires, vehicle accidents, medical emergencies, and
a wide range of other rescue and hazard situations, working shifts at a fire station and
deploying rapidly when a call comes in. Physical fitness is central to the job — firefighters
must pass and maintain demanding fitness standards, since the work involves carrying heavy
equipment, forcing entry into buildings, working in extreme heat, and physically rescuing people.
Training is intensive and practical rather than academic: recruits go through a fire academy
covering firefighting techniques, hazardous materials handling, and often basic emergency
medical skills, and while a university degree isn't typically required, the selection and
training process is competitive and rigorous. It is genuinely dangerous, involving real risk of
injury, smoke inhalation, and worse, which is why extensive safety protocol and equipment
(uniforms, breathing apparatus) are core to how the job is done — it's one of the more clearly
"dangerous and physical" jobs there is. Firefighters work tightly as part of a crew rather than
alone, with strong emphasis on teamwork and trust, since safety depends on coordinated action.
Shifts are irregular, often including 24-hour rotations and being on-call overnight at the
station, the opposite of a standard 9-to-5. Pay is moderate and typically set by public-sector
pay scales, reflecting that most firefighters work for government or municipal fire services.
It's a job with high public visibility and trust, commonly listed among the most respected
professions, and is a very common "dream job" for children, unlike many of the other jobs in
this game. It overlaps with paramedic/emergency medical services, since many firefighters are
cross-trained in basic medical response, and with hazardous-materials response and disaster
management. It does not involve animals as a core part of the job (aside from occasional animal
rescues), does not typically require travel beyond the local response area, and is not part of
the entertainment industry, science, or creative fields.`,
    hint_1: "Physical fitness standards for this job are demanding and have to be maintained throughout the whole career, not just passed once.",
    hint_2: "Shifts for this job are irregular, often 24-hour rotations, since emergencies obviously don't wait for a convenient time.",
    faq: [
      { question: "Do you work indoors?", answer: "sometimes" },
      { question: "Do you work outdoors?", answer: "sometimes" },
      { question: "Is it mostly desk work?", answer: "no" },
      { question: "Is it a hands-on job?", answer: "yes" },
      { question: "Do you need a university degree?", answer: "no" },
      { question: "Do you need a special license or certification?", answer: "yes" },
      { question: "Is it a creative job?", answer: "no" },
      { question: "Is it a conventional job?", answer: "yes" },
      { question: "Is it dangerous?", answer: "yes" },
      { question: "Is it physically demanding?", answer: "yes" },
      { question: "Do you work with the public or clients?", answer: "yes" },
      { question: "Do you usually work alone?", answer: "no" },
      { question: "Do you work as part of a team?", answer: "yes" },
      { question: "Is it well paid?", answer: "sometimes" },
      { question: "Do you wear a uniform?", answer: "yes" },
      { question: "Does the job involve travel?", answer: "no" },
      { question: "Does it involve science?", answer: "not_really" },
      { question: "Does it involve technology?", answer: "not_really" },
      { question: "Do you work with animals?", answer: "sometimes" },
      { question: "Do you work with children?", answer: "not_really" },
      { question: "Is it in the entertainment industry?", answer: "no" },
      { question: "Is it a job kids commonly dream of doing?", answer: "yes" },
      { question: "Do you work regular business hours?", answer: "no" },
      { question: "Are you employed by someone else?", answer: "yes" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
    ],
  },
    {
    title: "Software Engineer",
    synonyms: ["programmer", "developer", "coder", "software developer"],
    difficulty: "easy",
    tags: ["technology", "professional services", "creative"],
    profile_prose: `A software engineer designs, builds, and maintains the applications, websites,
and systems that run on computers and phones, writing and testing code, fixing bugs, and working
with a team through the whole lifecycle of a product from planning to release. The job is almost
entirely desk-based and computer-heavy: most of the working day is spent reading and writing
code, reviewing teammates' code, and sitting in planning or design meetings, with very little
that could be called physically hands-on in the traditional sense. Unlike medicine, law, or
architecture, there is no legally required degree or licence to call yourself a software
engineer — many people enter through a computer science degree, but a large and growing number
are self-taught or came through short intensive coding bootcamps instead, and what actually gets
someone hired is demonstrated skill more than a specific credential. It's genuinely one of the
more well-paid jobs without a required professional licence, though pay varies a lot by company,
location, and specialisation. Software engineers can work in essentially any industry — finance,
healthcare, gaming, retail, government, entertainment — since almost every modern company needs
software somewhere, which makes the field harder to pin down by "field" alone. It's not
physically dangerous or demanding, doesn't require a uniform, and remote or hybrid work is
common, though most roles are part of a team rather than solo work, with regular collaboration
between engineers, designers, and product managers. Hours are usually fairly regular, though
deadlines can create occasional crunch. A common misconception, driven by film and TV, is that
the job looks like constant fast typing and hacking — in reality a lot of the work is slower and
more deliberate: understanding requirements, debugging patiently, and reviewing other people's
work. It overlaps heavily with cybersecurity, data science, and game design, and increasingly
involves working alongside AI tools as part of the normal workflow rather than instead of them.`,
    hint_1: "There's no legally required degree or licence for this job — a growing number of people get in through self-teaching or short coding bootcamps instead.",
    hint_2: "This job could sit inside almost any industry at all, since nearly every modern company needs it somewhere — that's part of what makes it tricky to pin down.",
    faq: [
      { question: "Do you work indoors?", answer: "yes" },
      { question: "Do you work outdoors?", answer: "no" },
      { question: "Is it mostly desk work?", answer: "yes" },
      { question: "Is it a hands-on job?", answer: "not_really" },
      { question: "Do you need a university degree?", answer: "not_really" },
      { question: "Do you need a special license or certification?", answer: "no" },
      { question: "Is it a creative job?", answer: "sometimes" },
      { question: "Is it a conventional job?", answer: "not_really" },
      { question: "Is it dangerous?", answer: "no" },
      { question: "Is it physically demanding?", answer: "no" },
      { question: "Do you work with the public or clients?", answer: "not_really" },
      { question: "Do you usually work alone?", answer: "not_really" },
      { question: "Do you work as part of a team?", answer: "yes" },
      { question: "Is it well paid?", answer: "yes" },
      { question: "Do you wear a uniform?", answer: "no" },
      { question: "Does the job involve travel?", answer: "no" },
      { question: "Does it involve science?", answer: "not_really" },
      { question: "Does it involve technology?", answer: "yes" },
      { question: "Do you work with animals?", answer: "no" },
      { question: "Do you work with children?", answer: "no" },
      { question: "Is it in the entertainment industry?", answer: "not_really" },
      { question: "Are you employed by someone else?", answer: "yes" },
      { question: "Do you work regular business hours?", answer: "sometimes" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
    ],
  },
  {
    title: "Lawyer",
    synonyms: ["attorney", "solicitor", "barrister"],
    difficulty: "easy",
    tags: ["law", "professional services", "investigation-adjacent"],
    profile_prose: `A lawyer advises clients on legal matters, represents them in disputes, and
drafts and reviews contracts and other legal documents, working in areas as different as
corporate law, criminal defence, family law, or property law, which makes the day-to-day
experience vary a lot depending on specialisation. Becoming a lawyer requires a specific law
degree followed by a formal licensing process (commonly called being admitted to the bar), making
it one of the more heavily regulated professions, similar in spirit to medicine or architecture in
that the title itself is legally protected. Much of the actual work is desk-based: research,
writing, reviewing documents, and negotiating on a client's behalf, and this is true even for
lawyers whose specialty eventually involves courtroom work — court appearances are a real part of
the job for litigators and criminal lawyers, but corporate and transactional lawyers might rarely
or never set foot in a courtroom, which is a common misconception fuelled by how heavily TV and
film focus on the dramatic courtroom side of the profession. It's a client-facing profession,
since lawyers exist to represent someone else's interests, and while lawyers often work as part of
a firm alongside other lawyers and support staff, individual cases and client relationships are
usually the responsibility of one lawyer rather than a shared team effort. It is not physically
dangerous or demanding, doesn't require a uniform beyond professional attire (or robes in some
court settings), and is not typically well known for regular hours — heavy workloads and tight
deadlines are a well-documented feature of the profession, especially early in a lawyer's career.
Pay is generally strong, though it varies enormously between a small local practice and a top
corporate firm. It overlaps with politics, business, and law enforcement, and does not involve
science, animals, or the entertainment industry.`,
    hint_1: "This job needs a specific law degree and a formal licensing process before you can practice — the title itself is legally protected.",
    hint_2: "Whether this job involves regular courtroom appearances really depends on the specialty — some lawyers rarely see the inside of a courtroom at all.",
    faq: [
      { question: "Do you work indoors?", answer: "yes" },
      { question: "Do you work outdoors?", answer: "no" },
      { question: "Is it mostly desk work?", answer: "yes" },
      { question: "Is it a hands-on job?", answer: "no" },
      { question: "Do you need a university degree?", answer: "yes" },
      { question: "Do you need a special license or certification?", answer: "yes" },
      { question: "Is it a creative job?", answer: "not_really" },
      { question: "Is it a conventional job?", answer: "yes" },
      { question: "Is it dangerous?", answer: "no" },
      { question: "Is it physically demanding?", answer: "no" },
      { question: "Do you work with the public or clients?", answer: "yes" },
      { question: "Do you usually work alone?", answer: "sometimes" },
      { question: "Do you work as part of a team?", answer: "sometimes" },
      { question: "Is it well paid?", answer: "yes" },
      { question: "Do you wear a uniform?", answer: "sometimes" },
      { question: "Does the job involve travel?", answer: "not_really" },
      { question: "Does it involve science?", answer: "no" },
      { question: "Does it involve technology?", answer: "sometimes" },
      { question: "Do you work with animals?", answer: "no" },
      { question: "Do you work with children?", answer: "no" },
      { question: "Is it in the entertainment industry?", answer: "no" },
      { question: "Are you employed by someone else?", answer: "sometimes" },
      { question: "Do you work regular business hours?", answer: "not_really" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
    ],
  },
  {
    title: "Professional Cricketer",
    synonyms: ["cricketer", "cricket player"],
    difficulty: "easy",
    tags: ["sports", "entertainment", "physical"],
    profile_prose: `A professional cricketer plays cricket at a competitive level for a club,
state/domestic team, national side, or in franchise tournaments, earning a living through
contracts, match fees, and sponsorships rather than a standard salaried job. Matches vary
enormously in length depending on format: a Twenty20 game is over in a few hours, while a Test
match can run across five full days, and professional players often need to be capable across
multiple formats. It's a genuinely physical, outdoor job for the most part, involving intense
fitness training, practice sessions, and travel for matches and tours, sometimes internationally
for long stretches. There is no university degree required at all — top players are typically
identified and developed from a young age through school cricket, academies, and domestic
competition pathways rather than formal education, and skill and performance matter far more than
any credential. Pay varies enormously by level: domestic or lower-tier professional cricketers
often earn modestly and may need other income, while top international players and those selected
for major franchise leagues can earn very large sums. It's a team sport, so most of a cricketer's
competitive life is spent working closely with teammates and coaching staff, even though
individual performance (batting or bowling figures) is closely tracked and celebrated. The job
carries real public visibility, especially in cricket-strong nations like Australia, India,
England, Pakistan, and the West Indies, and is a common childhood dream job in those countries.
It's not particularly dangerous in a serious sense, though impact injuries from the ball or
physical strain are a normal occupational risk. It doesn't involve a fixed uniform in the office
sense, though team kit is standard, and it doesn't involve science, animals, or children as core
parts of the job.`,
    hint_1: "There's no university degree for this job at all — top players are usually spotted and developed from a young age through academies and domestic competition instead.",
    hint_2: "Depending on the match format, a single day at this job could be over in a few hours, or could be one day out of a match that runs five days straight.",
    faq: [
      { question: "Do you work indoors?", answer: "no" },
      { question: "Do you work outdoors?", answer: "yes" },
      { question: "Is it mostly desk work?", answer: "no" },
      { question: "Is it a hands-on job?", answer: "yes" },
      { question: "Do you need a university degree?", answer: "no" },
      { question: "Do you need a special license or certification?", answer: "no" },
      { question: "Is it a creative job?", answer: "not_really" },
      { question: "Is it a conventional job?", answer: "no" },
      { question: "Is it dangerous?", answer: "not_really" },
      { question: "Is it physically demanding?", answer: "yes" },
      { question: "Do you work with the public or clients?", answer: "not_really" },
      { question: "Do you usually work alone?", answer: "no" },
      { question: "Do you work as part of a team?", answer: "yes" },
      { question: "Is it well paid?", answer: "sometimes" },
      { question: "Do you wear a uniform?", answer: "yes" },
      { question: "Does the job involve travel?", answer: "yes" },
      { question: "Does it involve science?", answer: "no" },
      { question: "Does it involve technology?", answer: "not_really" },
      { question: "Do you work with animals?", answer: "no" },
      { question: "Do you work with children?", answer: "no" },
      { question: "Is it in the entertainment industry?", answer: "yes" },
      { question: "Are you employed by someone else?", answer: "yes" },
      { question: "Is it a job kids commonly dream of doing?", answer: "yes" },
      { question: "Do you work regular business hours?", answer: "no" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
      { question: "Does it involve a ball?", answer: "yes" },
      { question: "Is it a team sport?", answer: "yes" },
      { question: "Do you play with a bat?", answer: "yes" },
      { question: "Is it popular in Australia?", answer: "yes" },
    ],
  },
  {
    title: "Professional Footballer",
    synonyms: ["soccer player", "football player", "footballer"],
    difficulty: "easy",
    tags: ["sports", "entertainment", "physical"],
    profile_prose: `A professional footballer (soccer player) plays the sport competitively for a
club and, for the most talented, a national team, earning income through club contracts, match
bonuses, and sponsorship deals rather than a conventional salary. It's an outdoor, physically
demanding job built around intense fitness, technical training, and regular matches, with a
season structure that includes travel for away games and, for top players, international
tournaments. There's no university degree involved at all — players are almost always identified
very young and developed through club academies rather than formal education, meaning the career
path looks completely different from almost any other profession in this game. It's the single
most globally popular sport, played and watched in nearly every country, which makes it one of the
most universally recognised jobs there is. Pay is extraordinarily skewed: a small number of top
players at major clubs earn enormous sums, while the vast majority of professional footballers,
especially in lower leagues, earn far more modest and sometimes precarious incomes. It's
fundamentally a team sport, requiring constant coordination with teammates and coaching staff,
even though individual skill and goals are what most fans remember. The job carries genuine
injury risk — collisions, sprains, and long-term physical wear are a well-known occupational
hazard, especially given how physically intense a match is. It doesn't involve a uniform beyond
team kit, doesn't require regular business hours (training schedules and match days set the
rhythm instead), and is one of the most common "dream jobs" cited by children worldwide. It
doesn't involve science, animals, desk work, or the entertainment industry in the media-production
sense, though top players do have significant media and endorsement presence.`,
    hint_1: "This job has no university pathway at all — players are almost always spotted very young and developed through club academies instead of school or college.",
    hint_2: "Pay for this job is extremely skewed: a small number of top names earn enormous amounts, while most people doing it professionally earn far more modestly.",
    faq: [
      { question: "Do you work indoors?", answer: "no" },
      { question: "Do you work outdoors?", answer: "yes" },
      { question: "Is it mostly desk work?", answer: "no" },
      { question: "Is it a hands-on job?", answer: "yes" },
      { question: "Do you need a university degree?", answer: "no" },
      { question: "Do you need a special license or certification?", answer: "no" },
      { question: "Is it a creative job?", answer: "not_really" },
      { question: "Is it a conventional job?", answer: "no" },
      { question: "Is it dangerous?", answer: "sometimes" },
      { question: "Is it physically demanding?", answer: "yes" },
      { question: "Do you work with the public or clients?", answer: "not_really" },
      { question: "Do you usually work alone?", answer: "no" },
      { question: "Do you work as part of a team?", answer: "yes" },
      { question: "Is it well paid?", answer: "sometimes" },
      { question: "Do you wear a uniform?", answer: "yes" },
      { question: "Does the job involve travel?", answer: "yes" },
      { question: "Does it involve science?", answer: "no" },
      { question: "Does it involve technology?", answer: "no" },
      { question: "Do you work with animals?", answer: "no" },
      { question: "Do you work with children?", answer: "no" },
      { question: "Is it in the entertainment industry?", answer: "not_really" },
      { question: "Are you employed by someone else?", answer: "yes" },
      { question: "Is it a job kids commonly dream of doing?", answer: "yes" },
      { question: "Do you work regular business hours?", answer: "no" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
      { question: "Does it involve a ball?", answer: "yes" },
      { question: "Is it a team sport?", answer: "yes" },
      { question: "Is it popular in Australia?", answer: "sometimes" },
    ],
  },
  {
    title: "Professional Tennis Player",
    synonyms: ["tennis player"],
    difficulty: "easy",
    tags: ["sports", "entertainment", "physical"],
    profile_prose: `A professional tennis player competes individually on a global tour, earning
income through tournament prize money, coaching/travel-cost trade-offs, and sponsorship rather
than any kind of salary. Unlike football or cricket, tennis is an individual sport, not a team
one — a player's success or failure on court rests entirely on their own performance, even though
most professionals do travel with a small personal team of coaches, physiotherapists, and
sometimes a hitting partner. The career is built from a young age through intensive training and
junior tournament circuits rather than university, and requires exceptional discipline and
fitness maintained year-round. Travel is enormous and constant, arguably more so than most other
professional sports, since the tour moves between countries and continents week after week across
surfaces like grass, clay, and hard court — some tournaments are outdoors, others are played
indoors, so it's genuinely mixed rather than one or the other. Pay is famously top-heavy: a small
number of highly ranked players earn very large amounts through prize money and endorsements,
while a large portion of lower-ranked professional players actually operate at a financial loss
once travel, coaching, and accommodation costs are accounted for, since prize money outside the
top tiers of tournaments is modest. It's physically demanding, involving long, intense matches
and a packed year-round schedule with limited off-season. It doesn't involve a fixed uniform
beyond tournament dress codes (all-white at Wimbledon, for example), doesn't involve science,
animals, or children as core parts of the job, and carries genuine public visibility for
top-ranked players specifically, though far less so for the majority of the professional field.`,
    hint_1: "Unlike most professional sports, this one is played individually rather than as a team — the responsibility is entirely on one person's shoulders during a match.",
    hint_2: "Travel for this job is relentless, arguably more so than almost any other career, since the competitive calendar moves between countries almost every single week.",
    faq: [
      { question: "Do you work indoors?", answer: "sometimes" },
      { question: "Do you work outdoors?", answer: "sometimes" },
      { question: "Is it mostly desk work?", answer: "no" },
      { question: "Is it a hands-on job?", answer: "yes" },
      { question: "Do you need a university degree?", answer: "no" },
      { question: "Do you need a special license or certification?", answer: "no" },
      { question: "Is it a creative job?", answer: "not_really" },
      { question: "Is it a conventional job?", answer: "no" },
      { question: "Is it dangerous?", answer: "no" },
      { question: "Is it physically demanding?", answer: "yes" },
      { question: "Do you work with the public or clients?", answer: "not_really" },
      { question: "Do you usually work alone?", answer: "yes" },
      { question: "Do you work as part of a team?", answer: "not_really" },
      { question: "Is it well paid?", answer: "sometimes" },
      { question: "Do you wear a uniform?", answer: "sometimes" },
      { question: "Does the job involve travel?", answer: "yes" },
      { question: "Does it involve science?", answer: "no" },
      { question: "Does it involve technology?", answer: "no" },
      { question: "Do you work with animals?", answer: "no" },
      { question: "Do you work with children?", answer: "no" },
      { question: "Is it in the entertainment industry?", answer: "not_really" },
      { question: "Are you employed by someone else?", answer: "not_really" },
      { question: "Is it a job kids commonly dream of doing?", answer: "yes" },
      { question: "Do you work regular business hours?", answer: "no" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
      { question: "Does it involve a ball?", answer: "yes" },
      { question: "Is it a team sport?", answer: "no" },
      { question: "Is it popular in Australia?", answer: "yes" },
    ],
  },
  {
    title: "Actor",
    synonyms: ["actress", "performer"],
    difficulty: "easy",
    tags: ["entertainment", "performance", "creative", "media"],
    profile_prose: `An actor performs roles in film, television, theatre, or increasingly online
media, bringing scripts to life through rehearsal and performance. A huge and often underestimated
part of the job is auditioning — actors typically try out for far more roles than they ever book,
and periods of unemployment between jobs are a normal, expected part of the career rather than a
sign of failure. There's no required degree or licence, though many actors train at drama school
or study acting formally, and plenty of working actors have no formal training at all. Income is
extremely uneven across the profession: a small percentage of well-known actors earn very large
amounts, while the majority of working actors piece together inconsistent income and often hold
other jobs between roles, especially early in their careers. The job is genuinely creative and
involves close collaboration with directors, other actors, and production crews, so while
performance itself is deeply personal, very little of the process happens in isolation. Hours are
irregular by nature — filming schedules, evening theatre performances, and last-minute audition
calls don't follow a standard week. It's not physically dangerous under normal circumstances
(though stunt work is usually a separate specialisation), and doesn't require a uniform outside of
costumes for a role. Travel varies hugely depending on the job — a theatre actor might stay in one
city for months, while a film actor might travel to a shooting location for weeks at a time. It's
squarely part of the entertainment industry, is one of the most commonly cited "dream jobs" among
children, and overlaps with modelling, voice work, comedy, and increasingly online content
creation as career paths blend together.`,
    hint_1: "Auditioning for far more roles than you ever actually book is a normal, expected part of this career, not a sign that something's going wrong.",
    hint_2: "Income for this job is wildly uneven across the profession — a small number of names do very well, while most people doing it professionally piece together inconsistent work.",
    faq: [
      { question: "Do you work indoors?", answer: "sometimes" },
      { question: "Do you work outdoors?", answer: "sometimes" },
      { question: "Is it mostly desk work?", answer: "no" },
      { question: "Is it a hands-on job?", answer: "not_really" },
      { question: "Do you need a university degree?", answer: "no" },
      { question: "Do you need a special license or certification?", answer: "no" },
      { question: "Is it a creative job?", answer: "yes" },
      { question: "Is it a conventional job?", answer: "no" },
      { question: "Is it dangerous?", answer: "no" },
      { question: "Is it physically demanding?", answer: "not_really" },
      { question: "Do you work with the public or clients?", answer: "not_really" },
      { question: "Do you usually work alone?", answer: "not_really" },
      { question: "Do you work as part of a team?", answer: "yes" },
      { question: "Is it well paid?", answer: "sometimes" },
      { question: "Do you wear a uniform?", answer: "sometimes" },
      { question: "Does the job involve travel?", answer: "sometimes" },
      { question: "Does it involve science?", answer: "no" },
      { question: "Does it involve technology?", answer: "not_really" },
      { question: "Do you work with animals?", answer: "no" },
      { question: "Do you work with children?", answer: "no" },
      { question: "Is it in the entertainment industry?", answer: "yes" },
      { question: "Are you employed by someone else?", answer: "not_really" },
      { question: "Is it a job kids commonly dream of doing?", answer: "yes" },
      { question: "Do you work regular business hours?", answer: "no" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
    ],
  },
  {
    title: "YouTuber",
    synonyms: ["content creator", "influencer", "social media influencer", "vlogger", "streamer"],
    difficulty: "easy",
    tags: ["media", "entertainment", "technology", "creative", "self-employed"],
    profile_prose: `A content creator (commonly called a YouTuber, streamer, or social media
influencer depending on the platform) makes and publishes video or online content on platforms
like YouTube, Instagram, or TikTok, effectively running a one-person media business rather than
working for an employer. The actual work spans filming, scripting or planning content, editing
footage, engaging with audience comments, and negotiating brand sponsorship or advertising deals,
and understanding how each platform's algorithm affects visibility is a real, ongoing part of the
job. There is no degree, licence, or formal qualification required at all — literally anyone can
start, which is part of why the field is so crowded and unpredictable. Income comes from
advertising revenue, brand sponsorships, and sometimes merchandise or memberships rather than a
salary, and is famously extreme at both ends: a small number of creators earn very large amounts,
while the overwhelming majority who attempt it earn very little or nothing, closer in risk profile
to running a small business than to a typical job. Where the actual filming happens depends
entirely on the content niche — cooking, travel, gaming, comedy, and educational content all look
completely different day to day — but the editing and planning side is almost always solo
desk/computer work. There's no boss and no fixed schedule, which cuts both ways: total freedom,
but also total responsibility for consistency and income. It doesn't require a uniform, doesn't
typically involve travel unless the content niche demands it, and isn't dangerous under normal
circumstances. It overlaps heavily with traditional entertainment and media, marketing, and small
business ownership, since a successful creator is functionally running their own brand rather than
being cast or hired by someone else.`,
    hint_1: "There's no boss and no application process for this job — anyone can start, which is part of why it's so unpredictable.",
    hint_2: "Income here is extreme at both ends: enormous for a small number of well-known names, and close to nothing for the overwhelming majority who try it.",
    faq: [
      { question: "Do you work indoors?", answer: "sometimes" },
      { question: "Do you work outdoors?", answer: "sometimes" },
      { question: "Is it mostly desk work?", answer: "sometimes" },
      { question: "Is it a hands-on job?", answer: "not_really" },
      { question: "Do you need a university degree?", answer: "no" },
      { question: "Do you need a special license or certification?", answer: "no" },
      { question: "Is it a creative job?", answer: "yes" },
      { question: "Is it a conventional job?", answer: "no" },
      { question: "Is it dangerous?", answer: "no" },
      { question: "Is it physically demanding?", answer: "no" },
      { question: "Do you work with the public or clients?", answer: "not_really" },
      { question: "Do you usually work alone?", answer: "yes" },
      { question: "Do you work as part of a team?", answer: "not_really" },
      { question: "Is it well paid?", answer: "sometimes" },
      { question: "Do you wear a uniform?", answer: "no" },
      { question: "Does the job involve travel?", answer: "sometimes" },
      { question: "Does it involve science?", answer: "no" },
      { question: "Does it involve technology?", answer: "yes" },
      { question: "Do you work with animals?", answer: "no" },
      { question: "Do you work with children?", answer: "no" },
      { question: "Is it in the entertainment industry?", answer: "yes" },
      { question: "Are you employed by someone else?", answer: "no" },
      { question: "Is it a job kids commonly dream of doing?", answer: "yes" },
      { question: "Do you work regular business hours?", answer: "no" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
    ],
  },
  {
    title: "Teacher",
    synonyms: ["schoolteacher", "educator"],
    difficulty: "easy",
    tags: ["education", "public service"],
    profile_prose: `A teacher educates students, most commonly in a primary or secondary school
setting, planning lessons, delivering classes, marking and grading work, managing classroom
behaviour, and communicating with parents about student progress. It requires a specific teaching
qualification and, in most countries, formal registration or certification with an education
authority before someone can teach in a registered school, making it a licensed profession similar
in spirit to nursing or accounting. The job is mostly indoors and involves a real mix of hands-on
classroom delivery and desk-based work outside class hours — lesson planning and marking routinely
extend well beyond the actual school day, which is a common misconception people have about
teaching having short hours because of school holidays. It's defined by working closely with
children or teenagers, and while a lot of the day-to-day teaching happens somewhat solo in a
classroom, teachers are part of a wider school staff team and collaborate regularly with other
teachers and school leadership. Pay follows public-sector-style pay scales in most countries,
generally moderate rather than high relative to the qualification required. It's not physically
dangerous or demanding in a general sense, doesn't require travel, and doesn't typically involve
science or technology as a core focus (though some subject specialisations obviously do, like
science or computing teachers specifically). It overlaps with educational administration,
tutoring, and coaching, and is a widely respected, near-universally recognised profession, though
not typically among the highest-paid given the years of study and ongoing professional development
required.`,
    hint_1: "You need a specific teaching qualification and formal registration with an education authority before you can do this job in a registered school.",
    hint_2: "The actual working hours for this job extend well beyond the school day itself — lesson planning and marking routinely happen outside class time.",
    faq: [
      { question: "Do you work indoors?", answer: "yes" },
      { question: "Do you work outdoors?", answer: "no" },
      { question: "Is it mostly desk work?", answer: "sometimes" },
      { question: "Is it a hands-on job?", answer: "sometimes" },
      { question: "Do you need a university degree?", answer: "yes" },
      { question: "Do you need a special license or certification?", answer: "yes" },
      { question: "Is it a creative job?", answer: "sometimes" },
      { question: "Is it a conventional job?", answer: "yes" },
      { question: "Is it dangerous?", answer: "no" },
      { question: "Is it physically demanding?", answer: "no" },
      { question: "Do you work with the public or clients?", answer: "sometimes" },
      { question: "Do you usually work alone?", answer: "not_really" },
      { question: "Do you work as part of a team?", answer: "yes" },
      { question: "Is it well paid?", answer: "not_really" },
      { question: "Do you wear a uniform?", answer: "no" },
      { question: "Does the job involve travel?", answer: "no" },
      { question: "Does it involve science?", answer: "not_really" },
      { question: "Does it involve technology?", answer: "sometimes" },
      { question: "Do you work with animals?", answer: "no" },
      { question: "Do you work with children?", answer: "yes" },
      { question: "Is it in the entertainment industry?", answer: "no" },
      { question: "Are you employed by someone else?", answer: "yes" },
      { question: "Is it a job kids commonly dream of doing?", answer: "sometimes" },
      { question: "Do you work regular business hours?", answer: "sometimes" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
    ],
  },
  {
    title: "Café Owner",
    synonyms: ["small business owner", "cafe owner", "coffee shop owner", "shop owner", "entrepreneur", "business owner"],
    difficulty: "medium",
    tags: ["hospitality", "food and drink", "small business", "entrepreneurship"],
    profile_prose: `A café owner runs their own small café or coffee shop rather than being
employed by someone else, which is the defining trait of the job: there's no boss, no fixed
salary, and the business's success or failure is personally theirs to manage. In the early stages
especially, the role is intensely hands-on — making coffee, serving customers, and covering
shifts personally — while also handling everything that comes with running a small business:
ordering stock and supplies, rostering and managing staff, bookkeeping, marketing, and dealing
with the lease and council/health requirements that come with running a food premises. There's no
university degree required, though hospitality experience and basic business or food-safety
certifications are genuinely useful and sometimes legally required. Income is directly tied to how
well the business performs rather than being guaranteed, which makes it financially riskier than
most jobs in this game — many small food businesses operate on thin margins and a meaningful
number don't survive their first few years, a well-known trade-off of the path. Hours are long and
irregular by the nature of the work: many café owners open earlier than any of their staff and
handle admin and paperwork after closing, especially before the business is established enough to
hire a manager. It's a hands-on, physically demanding, constantly client-facing job, working
directly with customers all day, and typically involves a small team of employees once the
business is established, even though ultimate responsibility sits with the owner alone. It doesn't
involve travel, science, technology, animals, or children as core parts of the job, and isn't
part of the entertainment industry, sitting instead at the overlap of hospitality and small
business entrepreneurship.`,
    hint_1: "There's no boss in this job — it's run by the person doing it, which means the income depends entirely on how well the business does, not a guaranteed salary.",
    hint_2: "Long, irregular hours are part of the deal here — often opening earlier and finishing later than any employee working there would need to.",
    faq: [
      { question: "Do you work indoors?", answer: "yes" },
      { question: "Do you work outdoors?", answer: "no" },
      { question: "Is it mostly desk work?", answer: "sometimes" },
      { question: "Is it a hands-on job?", answer: "yes" },
      { question: "Do you need a university degree?", answer: "no" },
      { question: "Do you need a special license or certification?", answer: "sometimes" },
      { question: "Is it a creative job?", answer: "sometimes" },
      { question: "Is it a conventional job?", answer: "not_really" },
      { question: "Is it dangerous?", answer: "no" },
      { question: "Is it physically demanding?", answer: "yes" },
      { question: "Do you work with the public or clients?", answer: "yes" },
      { question: "Do you usually work alone?", answer: "not_really" },
      { question: "Do you work as part of a team?", answer: "sometimes" },
      { question: "Is it well paid?", answer: "sometimes" },
      { question: "Do you wear a uniform?", answer: "sometimes" },
      { question: "Does the job involve travel?", answer: "no" },
      { question: "Does it involve science?", answer: "no" },
      { question: "Does it involve technology?", answer: "no" },
      { question: "Do you work with animals?", answer: "no" },
      { question: "Do you work with children?", answer: "no" },
      { question: "Is it in the entertainment industry?", answer: "no" },
      { question: "Are you employed by someone else?", answer: "no" },
      { question: "Do you own your own business?", answer: "yes" },
      { question: "Do you have a boss?", answer: "no" },
      { question: "Is it a job kids commonly dream of doing?", answer: "not_really" },
      { question: "Do you work regular business hours?", answer: "no" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
      { question: "Do you work with food?", answer: "yes" },
    ],
  },
    {
    title: "Doctor",
    synonyms: ["GP", "physician", "general practitioner", "medical doctor"],
    difficulty: "easy",
    tags: ["medical", "science", "professional services"],
    profile_prose: `A doctor diagnoses and treats illness and injury, most commonly working in a
clinic, hospital, or general practice setting, seeing a steady stream of patients throughout the
day. Becoming a doctor requires a demanding medical degree (typically five to six years), followed
by several more years of supervised residency training before full independent registration —
among the longest and most competitive training paths of any job in this game, closer in scale to
becoming a lawyer or architect but longer still. The job is genuinely client-facing in the most
direct sense: most of the working day is spent one-on-one with patients, examining, questioning,
and explaining, which makes communication as important a skill as medical knowledge itself. Pay is
generally strong once fully qualified, though junior doctors during training years often work long
and gruelling hours for comparatively modest pay, which is a common point of public discussion
about the profession. Doctors work as part of a wider healthcare team — nurses, specialists,
administrative staff — even though a GP consultation itself is usually one-on-one. It's mostly
indoor and not physically demanding in a general sense, though certain specialties (surgery,
emergency medicine) are genuinely intense and can involve long, irregular shifts including nights
and on-call periods. A common misconception is picturing every doctor doing surgery — in reality,
general practitioners mostly diagnose, prescribe, refer patients to specialists, and manage
ongoing conditions rather than operating. It involves real science (anatomy, pharmacology,
diagnostics) and increasingly relies on technology for records and diagnostic tools. It doesn't
involve animals, and while some doctors do treat children specifically (paediatricians), it's not
a universal part of the job. It overlaps with nursing, pharmacy, and medical research.`,
    hint_1: "This job requires one of the longest and most competitive training paths of any job in this game — a demanding degree followed by several more years of supervised training.",
    hint_2: "Most people picture surgery when they think of this job, but a huge share of the people doing it spend their day diagnosing, prescribing, and referring patients rather than operating.",
    faq: [
      { question: "Do you work indoors?", answer: "yes" },
      { question: "Do you work outdoors?", answer: "no" },
      { question: "Is it mostly desk work?", answer: "not_really" },
      { question: "Is it a hands-on job?", answer: "sometimes" },
      { question: "Do you need a university degree?", answer: "yes" },
      { question: "Do you need a special license or certification?", answer: "yes" },
      { question: "Is it a creative job?", answer: "no" },
      { question: "Is it a conventional job?", answer: "yes" },
      { question: "Is it dangerous?", answer: "no" },
      { question: "Is it physically demanding?", answer: "not_really" },
      { question: "Do you work with the public or clients?", answer: "yes" },
      { question: "Do you usually work alone?", answer: "not_really" },
      { question: "Do you work as part of a team?", answer: "yes" },
      { question: "Is it well paid?", answer: "yes" },
      { question: "Do you wear a uniform?", answer: "sometimes" },
      { question: "Does the job involve travel?", answer: "no" },
      { question: "Does it involve science?", answer: "yes" },
      { question: "Does it involve technology?", answer: "yes" },
      { question: "Do you work with animals?", answer: "no" },
      { question: "Do you work with children?", answer: "sometimes" },
      { question: "Is it in the entertainment industry?", answer: "no" },
      { question: "Are you employed by someone else?", answer: "sometimes" },
      { question: "Do you diagnose illnesses?", answer: "yes" },
      { question: "Do you perform surgery?", answer: "not_really" },
      { question: "Do you work regular business hours?", answer: "not_really" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
    ],
  },
  {
    title: "Police Officer",
    synonyms: ["cop", "law enforcement officer", "policeman", "policewoman"],
    difficulty: "easy",
    tags: ["public safety", "emergency services", "law enforcement"],
    profile_prose: `A police officer enforces the law, responds to emergencies and reports of
crime, patrols an assigned area, and investigates incidents ranging from minor disturbances to
serious offences. Training happens through a police academy rather than a university degree —
physical fitness tests, practical scenario training, and legal knowledge are all part of becoming
an officer, and while a degree can help with promotion later in a career, it isn't required to
start. The job mixes real physical demands (patrol, sometimes foot pursuits, physically
restraining people) with a genuine amount of paperwork and report-writing that surprises people
who only picture the active, dramatic side of the role. It is a real, day-to-day dangerous job:
officers face genuine risk of physical confrontation, which is why extensive safety training,
protective equipment, and a firearm (in most countries) are standard parts of the uniform and
gear. Officers work as part of a wider force and usually patrol with a partner or as part of a
unit, rather than entirely alone, and shifts are irregular by necessity since policing is a
24-hour public service — nights, weekends, and holidays are all normal working times. Pay follows
public-sector scales and is generally moderate, reflecting steady government employment rather
than a high-earning profession. It's a highly public-facing job, dealing directly with members of
the community, victims, and suspects as a core part of the role. It doesn't involve science or
creative work in a central way, though modern policing does involve real use of technology
(databases, body cameras, forensics coordination). It overlaps with law, the courts, and emergency
services more broadly, and is one of the more universally recognised jobs there is.`,
    hint_1: "You train for this job at an academy rather than through a university degree — practical and physical training matter more than an academic qualification to get started.",
    hint_2: "This job involves a genuine amount of paperwork and report-writing, which surprises people who only picture the active, dramatic side of it.",
    faq: [
      { question: "Do you work indoors?", answer: "sometimes" },
      { question: "Do you work outdoors?", answer: "sometimes" },
      { question: "Is it mostly desk work?", answer: "not_really" },
      { question: "Is it a hands-on job?", answer: "yes" },
      { question: "Do you need a university degree?", answer: "no" },
      { question: "Do you need a special license or certification?", answer: "yes" },
      { question: "Is it a creative job?", answer: "no" },
      { question: "Is it a conventional job?", answer: "yes" },
      { question: "Is it dangerous?", answer: "yes" },
      { question: "Is it physically demanding?", answer: "yes" },
      { question: "Do you work with the public or clients?", answer: "yes" },
      { question: "Do you usually work alone?", answer: "not_really" },
      { question: "Do you work as part of a team?", answer: "yes" },
      { question: "Is it well paid?", answer: "sometimes" },
      { question: "Do you wear a uniform?", answer: "yes" },
      { question: "Does the job involve travel?", answer: "no" },
      { question: "Does it involve science?", answer: "not_really" },
      { question: "Does it involve technology?", answer: "sometimes" },
      { question: "Do you work with animals?", answer: "not_really" },
      { question: "Do you work with children?", answer: "not_really" },
      { question: "Is it in the entertainment industry?", answer: "no" },
      { question: "Are you employed by someone else?", answer: "yes" },
      { question: "Do you carry a weapon?", answer: "yes" },
      { question: "Is it a job kids commonly dream of doing?", answer: "yes" },
      { question: "Do you work regular business hours?", answer: "no" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
    ],
  },
  {
    title: "Nurse",
    synonyms: ["registered nurse", "RN"],
    difficulty: "medium",
    tags: ["medical", "healthcare", "professional services"],
    profile_prose: `A nurse provides direct, ongoing care to patients in hospitals, clinics, or
community settings — administering medication, monitoring vital signs, dressing wounds, and
supporting patients and families through treatment, all while working closely alongside doctors
rather than independently diagnosing conditions in most cases. It requires a nursing degree or
diploma plus formal registration with a nursing regulatory body before someone can legally
practise, similar in spirit to a doctor's licensing requirement, though the training path is
shorter. The job is intensely hands-on and physically demanding: long shifts on your feet, moving
and repositioning patients, and the physical and emotional toll of caring for people who are
unwell or in distress are all a real part of the role. Nurses almost always work as part of a
larger care team and are typically employed by a hospital or healthcare provider rather than
running an independent practice, which is one clear difference from how some doctors work. Shifts
are irregular by necessity, since hospitals operate around the clock — nights, weekends, and long
rotating shifts are standard rather than the exception. A common misconception is treating nursing
as simply "assisting" a doctor with less skill involved — in reality nursing requires its own deep
clinical knowledge and judgment, and experienced nurses often catch and flag issues doctors don't
have time to notice during brief consultations. It's a uniformed profession (scrubs are the norm),
genuinely client-facing in a very hands-on way, and pay is moderate — solid but not as high as a
fully qualified doctor's, reflecting the different scope of the two roles despite both working in
the same settings. It doesn't involve science in a lab-research sense so much as applied clinical
science day to day, and doesn't typically involve animals, travel, or the entertainment industry.`,
    hint_1: "This job usually means being employed by a hospital or healthcare provider, rather than running your own practice — a real difference from how some people in the medical field work.",
    hint_2: "This job is intensely hands-on: long shifts on your feet, and a lot of direct physical care for patients, rather than sitting behind a desk.",
    faq: [
      { question: "Do you work indoors?", answer: "yes" },
      { question: "Do you work outdoors?", answer: "no" },
      { question: "Is it mostly desk work?", answer: "no" },
      { question: "Is it a hands-on job?", answer: "yes" },
      { question: "Do you need a university degree?", answer: "sometimes" },
      { question: "Do you need a special license or certification?", answer: "yes" },
      { question: "Is it a creative job?", answer: "no" },
      { question: "Is it a conventional job?", answer: "yes" },
      { question: "Is it dangerous?", answer: "no" },
      { question: "Is it physically demanding?", answer: "yes" },
      { question: "Do you work with the public or clients?", answer: "yes" },
      { question: "Do you usually work alone?", answer: "no" },
      { question: "Do you work as part of a team?", answer: "yes" },
      { question: "Is it well paid?", answer: "sometimes" },
      { question: "Do you wear a uniform?", answer: "yes" },
      { question: "Does the job involve travel?", answer: "no" },
      { question: "Does it involve science?", answer: "sometimes" },
      { question: "Does it involve technology?", answer: "sometimes" },
      { question: "Do you work with animals?", answer: "no" },
      { question: "Do you work with children?", answer: "sometimes" },
      { question: "Is it in the entertainment industry?", answer: "no" },
      { question: "Are you employed by someone else?", answer: "yes" },
      { question: "Do you diagnose illnesses?", answer: "not_really" },
      { question: "Do you perform surgery?", answer: "no" },
      { question: "Do you work regular business hours?", answer: "not_really" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
    ],
  },
  {
    title: "Musician",
    synonyms: ["singer", "band member", "session musician", "recording artist"],
    difficulty: "medium",
    tags: ["entertainment", "creative", "performance", "media"],
    profile_prose: `A musician performs and/or records music professionally, which in practice
covers a huge range of very different working lives — a solo touring artist, a member of a band, a
session player hired for other people's recordings, or an orchestral musician all technically hold
this job, but their day-to-day looks quite different. No degree is required at all, though many
musicians do study formally at a music school or conservatoire, and plenty of working musicians are
entirely self-taught. Income is famously unpredictable and skewed: streaming pays very little per
play, so for most working musicians, live performance, teaching, session work, and merchandise
matter far more to actual income than recorded music alone — a common misconception is assuming
recorded success alone pays the bills. Hours are irregular by nature, built around evening gigs,
rehearsals, and touring rather than a standard week, and touring musicians travel extensively,
sometimes for extended stretches. It's genuinely creative, and while songwriting and practice can
be solitary, performing is almost always collaborative — a band, a backing group, or an ensemble —
even for artists billed as solo acts. It's not physically dangerous, doesn't require a university
degree or licence, and whether it's indoor or outdoor work depends entirely on the gig (a
outdoors gig, small venue, studio session). Most musicians are self-employed or work gig-to-gig
rather than being employed by one company, though orchestral or house-band musicians can have more
regular employment. It's squarely part of the entertainment industry, overlaps with music
production, composing for film or games, and teaching, and is a common childhood dream job,
though the financial reality of the profession is far more precarious than the public image
suggests.`,
    hint_1: "Recorded music alone barely pays the bills for most people doing this job — live performance, teaching, or session work usually matter more to actual income.",
    hint_2: "Whether this job happens indoors or outdoors, alone or with a group, really depends entirely on the specific gig — there's no single typical day for it.",
    faq: [
      { question: "Do you work indoors?", answer: "sometimes" },
      { question: "Do you work outdoors?", answer: "sometimes" },
      { question: "Is it mostly desk work?", answer: "no" },
      { question: "Is it a hands-on job?", answer: "yes" },
      { question: "Do you need a university degree?", answer: "no" },
      { question: "Do you need a special license or certification?", answer: "no" },
      { question: "Is it a creative job?", answer: "yes" },
      { question: "Is it a conventional job?", answer: "no" },
      { question: "Is it dangerous?", answer: "no" },
      { question: "Is it physically demanding?", answer: "not_really" },
      { question: "Do you work with the public or clients?", answer: "sometimes" },
      { question: "Do you usually work alone?", answer: "sometimes" },
      { question: "Do you work as part of a team?", answer: "sometimes" },
      { question: "Is it well paid?", answer: "sometimes" },
      { question: "Do you wear a uniform?", answer: "sometimes" },
      { question: "Does the job involve travel?", answer: "sometimes" },
      { question: "Does it involve science?", answer: "no" },
      { question: "Does it involve technology?", answer: "sometimes" },
      { question: "Do you work with animals?", answer: "no" },
      { question: "Do you work with children?", answer: "no" },
      { question: "Is it in the entertainment industry?", answer: "yes" },
      { question: "Are you employed by someone else?", answer: "sometimes" },
      { question: "Do you perform on stage?", answer: "sometimes" },
      { question: "Is it a job kids commonly dream of doing?", answer: "yes" },
      { question: "Do you work regular business hours?", answer: "no" },
      { question: "Is it a job most people have heard of?", answer: "yes" },
    ],
  },
];
