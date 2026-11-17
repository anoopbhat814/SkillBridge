import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "localhost",
  port: Number(process.env.SMTP_PORT ?? 1025),
});

const TEMPLATES = {
  interviewScheduled: ({ name, startsAt, url }) => ({
    subject: "Your SkillBridge interview is scheduled",
    text: `Hi ${name},\n\nYour interview starts at ${new Date(startsAt).toUTCString()}.\nJoin: ${url}\n`,
  }),
  applicationUpdate: ({ name, status }) => ({
    subject: "Update on your application",
    text: `Hi ${name},\n\nYour application status is now ${status}.\n`,
  }),
};

export async function handleEmail({ template, to, data }) {
  const build = TEMPLATES[template];
  if (!build) throw new Error(`Unknown email template: ${template}`);
  await transport.sendMail({ from: "SkillBridge <no-reply@skillbridge.example>", to, ...build(data) });
}
