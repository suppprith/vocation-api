import "dotenv/config";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { Job } from "../models/job.model.js";

const SEED_JOBS = [
  {
    title: "Senior Frontend Engineer",
    company: "Vercel",
    companyLogo: null,
    description:
      "We're looking for a Senior Frontend Engineer to help build the future of web development. You'll work on Next.js, our deployment platform, and developer tools used by millions.",
    location: "San Francisco, CA",
    latitude: 37.7749,
    longitude: -122.4194,
    workArrangement: "remote" as const,
    employmentType: "full-time" as const,
    companySize: "medium" as const,
    industry: "Technology",
    skills: ["React", "TypeScript", "Next.js", "CSS", "Node.js"],
    salaryRange: "$180k – $250k",
    salaryMin: 180000,
    salaryMax: 250000,
    applyUrl: "https://vercel.com/careers",
    postedDate: new Date("2026-03-01"),
    isActive: true,
  },
  {
    title: "Product Designer",
    company: "Figma",
    companyLogo: null,
    description:
      "Join Figma's design team to shape the future of collaborative design tools. You'll work on features used by designers worldwide, from prototyping to design systems.",
    location: "New York, NY",
    latitude: 40.7128,
    longitude: -74.006,
    workArrangement: "hybrid" as const,
    employmentType: "full-time" as const,
    companySize: "medium" as const,
    industry: "Technology",
    skills: [
      "UI/UX Design",
      "Figma",
      "Prototyping",
      "Design Systems",
      "User Research",
    ],
    salaryRange: "$160k – $220k",
    salaryMin: 160000,
    salaryMax: 220000,
    applyUrl: "https://figma.com/careers",
    postedDate: new Date("2026-02-28"),
    isActive: true,
  },
  {
    title: "Backend Engineer",
    company: "Stripe",
    companyLogo: null,
    description:
      "Build the financial infrastructure of the internet. You'll design and implement APIs that process billions of dollars in payments across the globe.",
    location: "Seattle, WA",
    latitude: 47.6062,
    longitude: -122.3321,
    workArrangement: "hybrid" as const,
    employmentType: "full-time" as const,
    companySize: "large" as const,
    industry: "Fintech",
    skills: ["Go", "Ruby", "PostgreSQL", "Distributed Systems", "API Design"],
    salaryRange: "$190k – $270k",
    salaryMin: 190000,
    salaryMax: 270000,
    applyUrl: "https://stripe.com/jobs",
    postedDate: new Date("2026-02-25"),
    isActive: true,
  },
  {
    title: "Machine Learning Engineer",
    company: "OpenAI",
    companyLogo: null,
    description:
      "Work on cutting-edge AI research and deploy models that are used by millions. Focus areas include language models, safety, and scalable infrastructure.",
    location: "San Francisco, CA",
    latitude: 37.7749,
    longitude: -122.4194,
    workArrangement: "onsite" as const,
    employmentType: "full-time" as const,
    companySize: "medium" as const,
    industry: "AI & Machine Learning",
    skills: [
      "Python",
      "PyTorch",
      "Machine Learning",
      "Distributed Computing",
      "NLP",
    ],
    salaryRange: "$250k – $400k",
    salaryMin: 250000,
    salaryMax: 400000,
    applyUrl: "https://openai.com/careers",
    postedDate: new Date("2026-03-02"),
    isActive: true,
  },
  {
    title: "DevOps Engineer",
    company: "HashiCorp",
    companyLogo: null,
    description:
      "Help organizations adopt cloud infrastructure best practices. You'll work on Terraform, Vault, and other tools that millions of developers rely on daily.",
    location: "Remote",
    latitude: null,
    longitude: null,
    workArrangement: "remote" as const,
    employmentType: "full-time" as const,
    companySize: "medium" as const,
    industry: "Technology",
    skills: ["Terraform", "Kubernetes", "AWS", "Docker", "CI/CD"],
    salaryRange: "$160k – $220k",
    salaryMin: 160000,
    salaryMax: 220000,
    applyUrl: "https://hashicorp.com/careers",
    postedDate: new Date("2026-02-20"),
    isActive: true,
  },
  {
    title: "Game Systems Designer",
    company: "Riot Games",
    companyLogo: null,
    description:
      "Design and balance game systems for one of the most played games in the world. Collaborate with engineers and artists to create compelling player experiences.",
    location: "Los Angeles, CA",
    latitude: 34.0522,
    longitude: -118.2437,
    workArrangement: "hybrid" as const,
    employmentType: "full-time" as const,
    companySize: "large" as const,
    industry: "Gaming",
    skills: [
      "Game Design",
      "Systems Thinking",
      "Prototyping",
      "Data Analysis",
      "Balancing",
    ],
    salaryRange: "$130k – $190k",
    salaryMin: 130000,
    salaryMax: 190000,
    applyUrl: "https://riotgames.com/careers",
    postedDate: new Date("2026-02-22"),
    isActive: true,
  },
  {
    title: "Cybersecurity Analyst",
    company: "CrowdStrike",
    companyLogo: null,
    description:
      "Protect organizations from sophisticated cyber threats. Analyze threat intelligence, respond to incidents, and develop security strategies for Fortune 500 clients.",
    location: "Austin, TX",
    latitude: 30.2672,
    longitude: -97.7431,
    workArrangement: "hybrid" as const,
    employmentType: "full-time" as const,
    companySize: "large" as const,
    industry: "Cybersecurity",
    skills: [
      "Threat Analysis",
      "SIEM",
      "Incident Response",
      "Python",
      "Network Security",
    ],
    salaryRange: "$140k – $200k",
    salaryMin: 140000,
    salaryMax: 200000,
    applyUrl: "https://crowdstrike.com/careers",
    postedDate: new Date("2026-02-18"),
    isActive: true,
  },
  {
    title: "Full Stack Developer",
    company: "Shopify",
    companyLogo: null,
    description:
      "Build commerce experiences that power millions of merchants. Work across the stack with React, Ruby on Rails, and GraphQL to ship features at scale.",
    location: "Ottawa, Canada",
    latitude: 45.4215,
    longitude: -75.6972,
    workArrangement: "remote" as const,
    employmentType: "full-time" as const,
    companySize: "enterprise" as const,
    industry: "E-commerce",
    skills: ["React", "Ruby on Rails", "GraphQL", "TypeScript", "PostgreSQL"],
    salaryRange: "$150k – $210k",
    salaryMin: 150000,
    salaryMax: 210000,
    applyUrl: "https://shopify.com/careers",
    postedDate: new Date("2026-03-03"),
    isActive: true,
  },
  {
    title: "Data Scientist",
    company: "Spotify",
    companyLogo: null,
    description:
      "Use data to shape the future of audio. Build recommendation models, analyze listener behavior, and drive product decisions for 500M+ users.",
    location: "Stockholm, Sweden",
    latitude: 59.3293,
    longitude: 18.0686,
    workArrangement: "hybrid" as const,
    employmentType: "full-time" as const,
    companySize: "large" as const,
    industry: "Entertainment",
    skills: ["Python", "SQL", "Machine Learning", "A/B Testing", "Spark"],
    salaryRange: "$140k – $200k",
    salaryMin: 140000,
    salaryMax: 200000,
    applyUrl: "https://spotify.com/jobs",
    postedDate: new Date("2026-02-15"),
    isActive: true,
  },
  {
    title: "Mobile Engineer (iOS)",
    company: "Airbnb",
    companyLogo: null,
    description:
      "Build beautiful, performant mobile experiences for millions of travelers and hosts. Work with SwiftUI and our custom design system.",
    location: "San Francisco, CA",
    latitude: 37.7749,
    longitude: -122.4194,
    workArrangement: "hybrid" as const,
    employmentType: "full-time" as const,
    companySize: "large" as const,
    industry: "Technology",
    skills: ["Swift", "SwiftUI", "iOS", "UIKit", "Core Data"],
    salaryRange: "$170k – $240k",
    salaryMin: 170000,
    salaryMax: 240000,
    applyUrl: "https://airbnb.com/careers",
    postedDate: new Date("2026-02-27"),
    isActive: true,
  },
  {
    title: "Climate Tech Engineer",
    company: "Watershed",
    companyLogo: null,
    description:
      "Help enterprises measure, reduce, and report their carbon emissions. Build the data platform powering corporate climate action at scale.",
    location: "San Francisco, CA",
    latitude: 37.7749,
    longitude: -122.4194,
    workArrangement: "onsite" as const,
    employmentType: "full-time" as const,
    companySize: "startup" as const,
    industry: "Climate Tech",
    skills: ["Python", "React", "PostgreSQL", "Data Engineering", "AWS"],
    salaryRange: "$150k – $200k",
    salaryMin: 150000,
    salaryMax: 200000,
    applyUrl: "https://watershed.com/careers",
    postedDate: new Date("2026-03-01"),
    isActive: true,
  },
  {
    title: "UX Research Intern",
    company: "Google",
    companyLogo: null,
    description:
      "Conduct user research to inform product decisions across Google's suite of products. Learn from world-class researchers and gain hands-on experience.",
    location: "Mountain View, CA",
    latitude: 37.3861,
    longitude: -122.0839,
    workArrangement: "onsite" as const,
    employmentType: "internship" as const,
    companySize: "enterprise" as const,
    industry: "Technology",
    skills: [
      "User Research",
      "Qualitative Analysis",
      "Surveys",
      "Usability Testing",
      "Figma",
    ],
    salaryRange: "$45/hr – $55/hr",
    salaryMin: 90000,
    salaryMax: 110000,
    applyUrl: "https://careers.google.com",
    postedDate: new Date("2026-03-04"),
    isActive: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing jobs
    const deleted = await Job.deleteMany({});
    console.log(`🗑️  Cleared ${deleted.deletedCount} existing jobs`);

    // Insert seed jobs
    const inserted = await Job.insertMany(SEED_JOBS);
    console.log(`🌱 Seeded ${inserted.length} jobs`);

    // List them
    for (const job of inserted) {
      console.log(
        `   • ${job.title} @ ${job.company} (${job.workArrangement})`,
      );
    }

    await mongoose.disconnect();
    console.log("✅ Done");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
