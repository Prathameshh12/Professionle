export interface CreatorLink {
  label: string;
  url: string; // leave "" to hide a link; it only shows once it has a value
}

export const CREATOR_INFO = {
  name: "Prathamesh Ahire",
  tagline: "Final-year Software Engineering student at the University of Technology Sydney (UTS).",
  // One short line, used on the home page strip.
  shortLine: "Software Engineering student at UTS, building full-stack and iOS apps.",
  summary:
    "Builds full-stack and iOS apps, and competes in CTFs and bug bounty programs on the side.",
  builtWith: "Professionle is his own project, built with Next.js, Postgres (pgvector) and an AI model.",
  education: "B.Eng (Honours), Software Engineering, UTS (2023–2026)",
  highlights: [
    "Software Engineering Intern at Tipaload: backend testing and data validation on an AI logistics platform",
    "Selected for Apple's Foundation Program: built an original SwiftUI app in 4 weeks",
    "Won the UTS Tech Fest 2025 iOS Hackathon with PetMate, a pet-care app",
    "Tutors Maths, Physics and Chemistry for high-school students",
    "General committee member, UTS Cybersecurity Society",
  ],
  topSkills: [
    "Python",
    "Java",
    "TypeScript / React",
    "Swift / SwiftUI",
    "Cloud (Azure / AWS / GCP)",
    "Pentesting (Burp Suite, Nmap, Metasploit)",
  ],
  // The first link is shown as the main (filled) button, so keep the one recruiters should use first on top.
  links: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/prathamesh-ahire-9b38a9298/" },
    { label: "Portfolio", url: "https://prathameshahire.netlify.app/" },
    { label: "GitHub", url: "https://github.com/Prathameshh12" },
    { label: "Email", url: "prathamesh.ahire1204@gmail.com" },
    { label: "Resume", url: "https://drive.google.com/file/d/10cQ9FbjGrtQ5TgciZvJA442grvXnvZUb/view?usp=sharing" }, 
  ] as CreatorLink[],
};