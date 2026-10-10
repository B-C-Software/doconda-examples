// Turns structured JSON findings into a branded, editable Word report (DOCX) and its PDF with Doconda.
//
//   npm start                      # uses sample.json
//   npm start -- my-findings.json  # your own file, same shape
//
// The Markdown is built from the JSON in code (no LLM writes the content); Doconda only lays it out and
// applies the style description. Docs: https://docs.doconda.com/en/sdk/create

import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { Doconda, DocondaError, type Document } from "@doconda/sdk"

const OUT_DIR = "out"
const SEVERITIES = ["critical", "high", "medium", "low"] as const

type Severity = (typeof SEVERITIES)[number]

interface Finding {
  id: string
  title: string
  severity: Severity
  area: string
  description: string
  recommendation: string
}

interface FindingsReport {
  company: { name: string; brandColor: string }
  report: { title: string; client: string; preparedBy: string; date: string; scope: string }
  summary: string
  findings: Finding[]
}

class InputError extends Error {
  constructor(readonly problems: string[]) {
    super(`Invalid input:\n${problems.map((p) => `  - ${p}`).join("\n")}`)
  }
}

// 1. Validate the JSON and collect every problem, not just the first one.
function validate(input: unknown): FindingsReport {
  const problems: string[] = []

  const object = (value: unknown, path: string): Record<string, unknown> => {
    if (value !== null && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>
    problems.push(`${path} must be an object`)
    return {}
  }
  const text = (value: unknown, path: string): string => {
    if (typeof value === "string" && value.trim() !== "") return value.trim()
    problems.push(`${path} must be a non-empty string`)
    return ""
  }

  const root = object(input, "the file")
  const company = object(root.company, "company")
  const report = object(root.report, "report")

  const data: FindingsReport = {
    company: { name: text(company.name, "company.name"), brandColor: text(company.brandColor, "company.brandColor") },
    report: {
      title: text(report.title, "report.title"),
      client: text(report.client, "report.client"),
      preparedBy: text(report.preparedBy, "report.preparedBy"),
      date: text(report.date, "report.date"),
      scope: text(report.scope, "report.scope"),
    },
    summary: text(root.summary, "summary"),
    findings: [],
  }

  if (data.company.brandColor && !/^#[0-9a-f]{6}$/i.test(data.company.brandColor)) {
    problems.push(`company.brandColor must be a hex colour like #1F4E79 (got "${data.company.brandColor}")`)
  }
  const parsedDate = new Date(`${data.report.date}T00:00:00Z`)
  if (data.report.date && (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== data.report.date)) {
    problems.push(`report.date must be a date like 2026-10-01 (got "${data.report.date}")`)
  }

  if (!Array.isArray(root.findings) || root.findings.length === 0) {
    problems.push("findings must be a non-empty array")
  } else {
    const seen = new Set<string>()
    root.findings.forEach((raw, i) => {
      const path = `findings[${i}]`
      const f = object(raw, path)
      const severity = text(f.severity, `${path}.severity`).toLowerCase()
      const finding = {
        id: text(f.id, `${path}.id`),
        title: text(f.title, `${path}.title`),
        severity: severity as Severity,
        area: text(f.area, `${path}.area`),
        description: text(f.description, `${path}.description`),
        recommendation: text(f.recommendation, `${path}.recommendation`),
      }
      if (severity && !(SEVERITIES as readonly string[]).includes(severity)) {
        problems.push(`${path}.severity must be one of ${SEVERITIES.join(", ")} (got "${severity}")`)
      }
      if (finding.id && seen.has(finding.id)) problems.push(`${path}.id "${finding.id}" is used more than once`)
      seen.add(finding.id)
      data.findings.push(finding)
    })
  }

  if (problems.length > 0) throw new InputError(problems)
  return data
}

// 2. Build fixed Markdown from the data. Same JSON in, same Markdown out.
function toMarkdown({ report, summary, findings }: FindingsReport): string {
  const cell = (value: string) => value.replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ")
  const label = (severity: Severity) => severity[0]!.toUpperCase() + severity.slice(1)
  const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${report.date}T00:00:00Z`),
  )

  return [
    `# ${report.title}`,
    `**Client:** ${report.client}`,
    `**Prepared by:** ${report.preparedBy}`,
    `**Date:** ${date}`,
    "## Executive summary",
    summary,
    "| Severity | Findings |\n|---|---|\n" +
      SEVERITIES.map((s) => `| ${label(s)} | ${findings.filter((f) => f.severity === s).length} |`).join("\n"),
    "## Scope",
    report.scope,
    "## Findings overview",
    "| ID | Finding | Severity | Area |\n|---|---|---|---|\n" +
      findings.map((f) => `| ${cell(f.id)} | ${cell(f.title)} | ${label(f.severity)} | ${cell(f.area)} |`).join("\n"),
    "## Detailed findings",
    ...findings.map((f) =>
      [
        `### ${f.id}: ${f.title}`,
        `**Severity:** ${label(f.severity)} · **Area:** ${f.area}`,
        f.description,
        `**Recommendation:** ${f.recommendation}`,
      ].join("\n\n"),
    ),
  ].join("\n\n")
}

// 3. Branding is a plain-language style description, applied to the Word styles so the file stays editable.
// https://docs.doconda.com/en/guides/style
function styleFor({ company, report }: FindingsReport): string {
  return [
    "Inter 11 pt font",
    `title and headings in ${company.brandColor}`,
    `accent ${company.brandColor}`,
    "with a cover page and page numbers",
    `in the header: ${company.name}`,
    `in the footer: Confidential · Prepared for ${report.client}`,
  ].join(", ")
}

// 4. style_applied shows how the description was understood; compare it with what we asked for.
function styleWarnings(doc: Document, { company }: FindingsReport): string[] {
  const warnings = doc.style_unsupported.map((item) => `Style not applied: ${item}`)
  const applied = doc.style_applied
  if (!applied) return [...warnings, "The response has no style_applied, so the style could not be checked."]

  const hex = (color: string) => color.replace(/^#/, "").toUpperCase()
  if (hex(applied.colors.headings) !== hex(company.brandColor)) {
    warnings.push(`Headings colour is ${applied.colors.headings}, asked for ${company.brandColor}.`)
  }
  if (!applied.cover_page) warnings.push("No cover page was applied.")
  if (!applied.page_numbers) warnings.push("No page numbers were applied.")
  if (!applied.header?.includes(company.name)) warnings.push(`Header is "${applied.header ?? ""}", asked for "${company.name}".`)
  if (!applied.footer) warnings.push("No footer was applied.")
  return warnings
}

function printDocument(doc: Document): void {
  console.log(`Document ${doc.id}: status ${doc.status}, type ${doc.type ?? "?"}, ${doc.pages ?? "?"} pages`)
  const s = doc.style_applied
  if (s) {
    console.log(
      `Style applied: ${s.font} ${s.font_size} pt, headings ${s.colors.headings}, accent ${s.colors.accent}, ` +
        `cover page ${s.cover_page ? "yes" : "no"}, page numbers ${s.page_numbers ? "yes" : "no"}`,
    )
    console.log(`  header: ${s.header ?? "(none)"}`)
    console.log(`  footer: ${s.footer ?? "(none)"}`)
  }
}

const SIGNATURES = { docx: "PK", pdf: "%PDF" } as const

async function main(): Promise<number> {
  try {
    process.loadEnvFile()
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e
  }
  if (!process.env.DOCONDA_API_KEY) {
    console.error("DOCONDA_API_KEY is not set. Copy .env.example to .env and add your key, or export it in your shell.")
    return 1
  }

  const inputPath = process.argv[2] ?? "sample.json"
  let data: FindingsReport
  try {
    data = validate(JSON.parse(await readFile(inputPath, "utf8")))
  } catch (e) {
    console.error(e instanceof InputError ? `${inputPath}: ${e.message}` : `Could not read ${inputPath}: ${(e as Error).message}`)
    return 1
  }

  const markdown = toMarkdown(data)
  const style = styleFor(data)
  await mkdir(OUT_DIR, { recursive: true })
  await writeFile(join(OUT_DIR, "report.md"), markdown)
  console.log(`Read ${data.findings.length} findings from ${inputPath}. Markdown saved to ${OUT_DIR}/report.md`)
  console.log(`Style: ${style}`)
  console.log("Creating the document (create waits until it is finished)…")

  const doconda = new Doconda()
  try {
    const doc = await doconda.documents.create({ format: "docx", content: { markdown }, style })
    printDocument(doc)

    switch (doc.status) {
      case "ready":
      case "ready_with_warnings":
      case "needs_review":
        break
      case "failed":
        console.error(`Document failed (not charged): ${doc.error?.code ?? "unknown"}: ${doc.error?.message ?? ""}`)
        return 1
      case "canceled":
        console.error("Document was canceled.")
        return 1
      default:
        console.error(`Unexpected status "${doc.status}" after create; expected a finished document.`)
        return 1
    }

    const warnings = styleWarnings(doc, data)
    if (doc.status !== "ready") {
      const report = await doconda.documents.report(doc.id)
      for (const issue of report.issues) {
        const pages = issue.location.pages ?? []
        const where = pages.length > 0 ? ` (page${pages.length > 1 ? "s" : ""} ${pages.join(", ")})` : ""
        warnings.push(`[${issue.severity}] ${issue.message}${where}`)
      }
    }
    if (warnings.length > 0) {
      console.warn(`\n${warnings.length} warning(s):`)
      for (const w of warnings) console.warn(`  ! ${w}`)
      console.warn("")
    }

    for (const kind of ["docx", "pdf"] as const) {
      const bytes = await doconda.documents.download(doc.id, kind)
      if (!Buffer.from(bytes.subarray(0, 4)).toString("latin1").startsWith(SIGNATURES[kind])) {
        console.error(`The downloaded ${kind} is not a valid ${kind.toUpperCase()} file (${bytes.byteLength} bytes).`)
        return 1
      }
      const path = join(OUT_DIR, `report.${kind}`)
      await writeFile(path, bytes)
      console.log(`Saved ${path} (${(bytes.byteLength / 1024).toFixed(1)} KB)`)
    }

    if (doc.status === "needs_review") console.warn("Status is needs_review: check the warnings above before sending it.")
    return 0
  } catch (e) {
    if (!(e instanceof DocondaError)) throw e
    console.error(`Doconda API error ${e.status} ${e.code}: ${e.message}`)
    for (const err of e.errors) console.error(`  ${err.path}: ${err.message}`)
    if (e.code === "unauthorized") console.error("  Check DOCONDA_API_KEY: the key does not exist or was revoked.")
    if (e.code === "insufficient_balance") console.error("  Top up your balance in the Doconda dashboard.")
    if (e.requestId) console.error(`  request id (for support): ${e.requestId}`)
    return 1
  }
}

process.exitCode = await main()
