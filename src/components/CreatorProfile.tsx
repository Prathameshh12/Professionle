import { CREATOR_INFO } from "@/components/special-cases/creatorInfo";

/** The creator's profile: name, summary, links, highlights, education and skills. Used on /about and in the game. */
export function CreatorProfile() {
  const links = CREATOR_INFO.links.filter((l) => l.url);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-case text-2xl text-paper">{CREATOR_INFO.name}</p>
        <p className="text-paperDim text-sm mt-1">{CREATOR_INFO.tagline}</p>
      </div>

      <div className="space-y-2">
        <p className="text-paper/90 leading-relaxed">{CREATOR_INFO.summary}</p>
        <p className="text-paperDim text-sm leading-relaxed">{CREATOR_INFO.builtWith}</p>
      </div>

      {links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {links.map((l, i) => {
            const external = !l.url.startsWith("mailto:");
            return (
              <a
                key={l.label}
                href={l.url}
                {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                className={`inline-flex min-h-[40px] items-center font-case text-xs tracking-wide px-4 border border-manila transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-manila ${
                  i === 0 ? "bg-manila text-ink hover:bg-paper" : "text-manila hover:bg-panelLight"
                }`}
              >
                {l.label.toUpperCase()}
              </a>
            );
          })}
        </div>
      )}

      <div>
        <p className="font-case text-xs tracking-wide text-paperDim mb-2">HIGHLIGHTS</p>
        <ul className="space-y-2">
          {CREATOR_INFO.highlights.map((h) => (
            <li key={h} className="text-paper/80 text-sm flex gap-3">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-manila" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="font-case text-xs tracking-wide text-paperDim mb-1">EDUCATION</p>
        <p className="text-paper/80 text-sm">{CREATOR_INFO.education}</p>
      </div>

      <div>
        <p className="font-case text-xs tracking-wide text-paperDim mb-2">TOP SKILLS</p>
        <div className="flex flex-wrap gap-2">
          {CREATOR_INFO.topSkills.map((skill) => (
            <span key={skill} className="text-xs border border-wire rounded-full px-3 py-1 text-paperDim">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}