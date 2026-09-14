export interface TwoTruthsJob {
  title: string;
  tags: string[];
  profileProse: string;
}

export interface TwoTruthsPair {
  id: string;
  jobA: TwoTruthsJob;
  jobB: TwoTruthsJob;
  sharedFactsSummary: string;
}

// Deliberately separate from the main game's `jobs` table — Two Truths never
// touches Postgres, the resolution pipeline, or any seed script. It's just
// this static dataset plus the routes under /api/two-truths that read it.
export const TWO_TRUTHS_PAIRS: TwoTruthsPair[] = [
  {
    id: "pilot-vs-atc",
    jobA: {
      title: "Pilot",
      tags: ["aviation", "transportation", "travel"],
      profileProse: `This person flies aircraft for a living, physically sitting in the cockpit
and operating the controls themselves. They hold a pilot's license and extensive flight training,
follow strict pre-flight checklists, and are in constant radio contact with air traffic control
throughout every flight. The job is safety-critical, requires quick decision-making under pressure,
involves irregular hours and real time away from home, and takes place inside the aircraft itself —
airborne rather than on the ground. They wear a uniform on the job. It is not a desk job, though a
lot of the actual flying on longer trips is monitoring automated systems rather than constant manual
control.`,
    },
    jobB: {
      title: "Air Traffic Controller",
      tags: ["aviation", "transportation"],
      profileProse: `This person directs aircraft movements from the ground, working inside a
control tower or a radar room rather than ever being on board a plane. They hold specialized
certification and extensive training, follow strict safety protocols, and are in constant radio
contact with pilots throughout every shift. The job is safety-critical, requires quick
decision-making under pressure, and often involves irregular or overnight shifts. It is
fundamentally a desk-and-screen job done indoors on the ground, tracking multiple aircraft at once
on radar and giving instructions rather than piloting anything themselves. They generally do not
wear a uniform in a control room.`,
    },
    sharedFactsSummary:
      "Both work in aviation, both need serious certification and training, both are safety-critical jobs in constant radio contact with each other, and both deal with irregular hours. The split: one is physically in the air, the other never leaves the ground.",
  },
  {
    id: "architect-vs-civil-engineer",
    jobA: {
      title: "Architect",
      tags: ["construction", "design", "engineering"],
      profileProse: `This person designs buildings and spaces, working closely with clients to
shape how a structure looks, feels, and functions for the people who use it. They need a
specialized university degree and produce detailed technical drawings and 3D models, often using
CAD software. Much of the job is desk-based design work, though site visits during construction are
common. The focus is primarily aesthetic and experiential — layout, light, flow, materials —
balanced against building codes and practical constraints, but detailed calculations of exactly how
much weight a beam can bear are generally handed off to someone else.`,
    },
    jobB: {
      title: "Civil Engineer",
      tags: ["construction", "engineering"],
      profileProse: `This person designs the structural and infrastructural systems that make
buildings and construction projects actually stand up and function — calculating load-bearing
capacity, material strength, drainage, and structural safety. They need a specialized engineering
degree and produce detailed technical drawings and calculations, often using CAD and structural
analysis software. Much of the job is desk-based, though site visits during construction are
common. The focus is primarily technical and safety-driven — will this beam hold, will this
foundation settle — rather than how a space looks or feels, though they work closely with people
who do care about that.`,
    },
    sharedFactsSummary:
      "Both work in construction and design, both need a specialized degree, both use CAD and technical drawings, and both visit job sites. The split: one designs how it looks and feels, the other calculates whether it will actually stand up.",
  },
  {
    id: "vet-vs-zookeeper",
    jobA: {
      title: "Veterinarian",
      tags: ["animals", "medicine", "healthcare"],
      profileProse: `This person works hands-on with animals every day and cares deeply about
their welfare, but the core of the job is medical: diagnosing illness and injury, performing
surgery, prescribing medication, and giving vaccinations. It requires an extensive specialized
degree (veterinary school) and licensing. Much of the work happens in a clinical setting — an exam
room or surgical suite — rather than outdoors, and a single day usually involves seeing many
different animals for short appointments rather than caring for the same ones all day.`,
    },
    jobB: {
      title: "Zookeeper",
      tags: ["animals"],
      profileProse: `This person works hands-on with animals every day and cares deeply about
their welfare, but the core of the job is husbandry, not medicine: feeding, cleaning and
maintaining enclosures, running enrichment activities, and monitoring behavior. It doesn't require
a medical degree, though relevant animal-science education helps. A lot of the work is outdoors,
physically active, and repetitive day to day, caring for the same specific animals on an ongoing
basis rather than seeing new patients. When an animal is actually sick or injured, this person
calls in a vet rather than treating it themselves.`,
    },
    sharedFactsSummary:
      "Both work hands-on with animals all day and genuinely care about animal welfare. The split: one treats illness and injury with a medical degree, the other handles daily care, feeding, and enclosures without one.",
  },
  {
    id: "realtor-vs-property-manager",
    jobA: {
      title: "Real Estate Agent",
      tags: ["real estate", "sales"],
      profileProse: `This person works in real estate, dealing with landlords, buyers, tenants,
and properties on a daily basis. Their core job is closing sales or lease deals — showing
properties, negotiating offers, and guiding a deal from listing to close. Income is typically
commission-based rather than a fixed salary, tied directly to deals closed. The relationship with
any one property or client is usually short-term and transactional: once the deal closes, their
direct involvement with that property generally ends.`,
    },
    jobB: {
      title: "Property Manager",
      tags: ["real estate"],
      profileProse: `This person works in real estate, dealing with landlords, tenants, and
properties on a daily basis. Their core job is the ongoing operation of a property after it's
already rented out — collecting rent, coordinating maintenance and repairs, handling tenant
complaints, and enforcing lease terms. Income is typically a fixed fee or salary rather than sales
commission. The relationship with any one property is long-term and continuous, often for years,
rather than ending once a deal is done.`,
    },
    sharedFactsSummary:
      "Both work in real estate and deal with landlords and tenants regularly. The split: one gets paid by commission to close a deal and then moves on, the other gets paid to keep the property running smoothly long after the deal is done.",
  },
];

export function getRandomPair(): TwoTruthsPair {
  return TWO_TRUTHS_PAIRS[Math.floor(Math.random() * TWO_TRUTHS_PAIRS.length)];
}

export function getPairById(id: string): TwoTruthsPair | undefined {
  return TWO_TRUTHS_PAIRS.find((p) => p.id === id);
}