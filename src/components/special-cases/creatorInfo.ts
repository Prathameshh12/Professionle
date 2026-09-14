export interface CreatorLink {
  label: string;
  url: string; // fill in your real links — left blank on purpose
}

export const CREATOR_INFO = {
  name: "Prathamesh Ahire",
  tagline: "Final-year Software Engineering student at Univeristy of Technology Sydney (UTS).",
  summary:
    "Builds full-stack and iOS apps, competes in CTFs and bug bounty programs on the side.",
  education: "B.Eng (Honours), Software Engineering, UTS (2023–2026)",
  highlights: [
    "Software Engineering Intern @ Tipaload — backend testing & data validation on an AI logistics platform",
    "Selected for Apple's Foundation Program — built an original SwiftUI app in 4 weeks",
    "Won the UTS Tech Fest 2025 iOS Hackathon with PetMate, a pet-care app",
    "Tutors Maths, Physics & Chemistry for high-school students",
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
  links: [
    { label: "Portfolio", url: "https://prathameshahire.netlify.app/" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/prathamesh-ahire-9b38a9298/" },
    { label: "GitHub", url: "https://github.com/Prathameshh12" },
  ] as CreatorLink[],
};