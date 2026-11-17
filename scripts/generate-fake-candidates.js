#!/usr/bin/env node
// Generates a JSON fixture of synthetic candidates for load testing.
const SKILLS = ["TypeScript", "Python", "Go", "React", "PostgreSQL", "Kubernetes", "Rust", "Terraform"];
const FIRST = ["Mina", "Jon", "Priya", "Luis", "Chen", "Sara", "Omar", "Elena"];
const LAST = ["Park", "Reyes", "Nair", "Fischer", "Wu", "Haddad", "Silva", "Ivanova"];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function candidate(i) {
  const n = 2 + Math.floor(Math.random() * 4);
  const skills = [...new Set(Array.from({ length: n }, () => pick(SKILLS)))];
  return {
    email: `candidate${i}@example.test`,
    fullName: `${pick(FIRST)} ${pick(LAST)}`,
    yearsExperience: Math.floor(Math.random() * 15),
    skills,
  };
}

const count = Number(process.argv[2] ?? 100);
process.stdout.write(JSON.stringify(Array.from({ length: count }, (_, i) => candidate(i)), null, 2));
