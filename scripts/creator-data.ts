import type { JobSeed } from "../src/types";
import { CREATOR_TAG } from "../src/lib/constants";

export const CREATOR_JOB: JobSeed = {
  title: "Software Engineering Student",
  synonyms: [
    "student",
    "software engineer",
    "engineer",
    "developer",
    "software developer",
    "programmer",
    "swe",
    "cs student",
    "computer science student",
    "full stack developer",
  ],
  difficulty: "hard",
  tags: ["technology", "software", "engineering", "education", "cybersecurity", CREATOR_TAG],
  profile_prose: `This case file is about the person who actually built Professionle. They're in the
final year of a Bachelor of Engineering (Software Engineering) with a Cybersecurity major at a
university in Sydney, Australia, so day to day looks more like lectures, assignments, and personal
coding projects than a traditional 9-to-5 job. Alongside their degree they've worked as a software
engineering intern at a small logistics-tech startup, testing backend logic and validating data for
an AI-driven freight platform, and they also tutor high-school students in maths, physics, and
chemistry a few hours a week. They spend almost all of their working time indoors at a computer,
writing code in languages like Python, Java, TypeScript, and Swift, and building things across web,
backend, and iOS. They were selected for Apple's competitive four-week Foundation Program and used
it to build an original SwiftUI app, and they've since won a university hackathon with a playful iOS
app for pet care. Cybersecurity is a strong personal interest as well as their degree major — they
practice on capture-the-flag challenges and bug bounty platforms, dabbling in tools like Burp Suite,
Nmap, and Metasploit — though this is closer to a serious hobby and study focus than a full-time
security job right now. They also volunteer on campus, leading orientation tours and helping run
events for the university's cybersecurity society. It is not a dangerous job, does not require a
uniform, does not involve heavy physical labour or extensive travel, and is not related to medicine,
law, or finance. Because they are still a student, questions about whether this is a "full-time job"
or whether they draw a normal salary should lean toward "not really" or "sometimes" rather than a
flat yes — the paid work (the internship, the tutoring) is real but part-time and secondary to their
studies.`,
  hint_1:
    "They're not clocking in anywhere full-time — most of their week is still built around university, not a workplace.",
  hint_2:
    "They're finishing a Cybersecurity-focused Software Engineering degree in Sydney, and already have a software engineering internship and a hackathon win under their belt.",
  faq: [
    { question: "Do you work indoors?", answer: "yes" },
    { question: "Is this a full-time job?", answer: "not_really" },
    { question: "Are you a student?", answer: "yes" },
    { question: "Do you get paid for this?", answer: "sometimes" },
    { question: "Would I need a degree for this?", answer: "yes" },
    { question: "Is this related to technology?", answer: "yes" },
    { question: "Does this involve coding?", answer: "yes" },
    { question: "Is this related to cybersecurity?", answer: "sometimes" },
    { question: "Do you work in a team?", answer: "yes" },
    { question: "Is this dangerous?", answer: "no" },
    { question: "Do you wear a uniform?", answer: "no" },
    { question: "Does this involve a lot of travel?", answer: "no" },
    { question: "Is this a medical job?", answer: "no" },
    { question: "Is this in finance?", answer: "no" },
    { question: "Do you build mobile apps?", answer: "yes" },
    { question: "Have you won any competitions?", answer: "yes" },
    { question: "Do you tutor or teach?", answer: "yes" },
    { question: "Do you volunteer?", answer: "yes" },
    { question: "Is this a creative role?", answer: "sometimes" },
    { question: "Do you use a computer for most of this?", answer: "yes" },
  ],
};