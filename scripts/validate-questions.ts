import {
  DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
  TOPIC_MAP,
  TOPICS,
} from "../src/lib/constants";
import {
  clearQuestionCache,
  loadQuestionsByTechnology,
} from "../src/lib/questions/registry";
import type {
  Difficulty,
  InterviewQuestion,
  QuestionType,
  Technology,
} from "../src/types/interview";

const VALID_DIFFICULTIES = new Set(Object.keys(DIFFICULTY_LABELS));
const VALID_TYPES = new Set(Object.keys(QUESTION_TYPE_LABELS));
const VALID_TECHNOLOGIES = new Set(Object.keys(TOPIC_MAP));

function normalizeQuestionText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function validateTechnology(tech: Technology, questions: InterviewQuestion[]) {
  const lines: string[] = [];
  const topic = TOPIC_MAP[tech];
  const name = topic.name;

  lines.push(name);

  const countOk =
    questions.length === 0 || questions.length === topic.targetCount;
  if (questions.length === 0) {
    lines.push(`○ ${questions.length} questions (empty bank — ok for now)`);
  } else if (countOk) {
    lines.push(`✓ ${questions.length} questions`);
  } else {
    lines.push(
      `✗ Expected ${topic.targetCount} questions, found ${questions.length}`,
    );
  }

  const ids = questions.map((q) => q.id);
  const idSet = new Set(ids);
  if (ids.length === idSet.size) {
    lines.push("✓ No duplicate IDs");
  } else {
    lines.push(`✗ Duplicate IDs found (${ids.length - idSet.size} extras)`);
  }

  const missingAnswers = questions.filter(
    (q) => !q.shortAnswer?.trim() || !q.detailedAnswer?.trim(),
  );
  if (missingAnswers.length === 0) {
    lines.push("✓ All answers complete");
  } else {
    lines.push(`✗ ${missingAnswers.length} question(s) missing answers`);
  }

  const invalidDifficulty = questions.filter(
    (q) => !VALID_DIFFICULTIES.has(q.difficulty as Difficulty),
  );
  if (invalidDifficulty.length === 0) {
    lines.push("✓ Valid difficulties");
  } else {
    lines.push(`✗ ${invalidDifficulty.length} invalid difficulty value(s)`);
  }

  const invalidTech = questions.filter(
    (q) => q.technology !== tech || !VALID_TECHNOLOGIES.has(q.technology),
  );
  if (invalidTech.length === 0) {
    lines.push("✓ Valid technology field");
  } else {
    lines.push(`✗ ${invalidTech.length} invalid technology value(s)`);
  }

  const invalidType = questions.filter(
    (q) => !VALID_TYPES.has(q.type as QuestionType),
  );
  if (invalidType.length === 0) {
    lines.push("✓ Valid question types");
  } else {
    lines.push(`✗ ${invalidType.length} invalid type value(s)`);
  }

  const missingCategory = questions.filter(
    (q) => !q.category?.trim() || !q.categorySlug?.trim(),
  );
  if (missingCategory.length === 0) {
    lines.push("✓ Categories present");
  } else {
    lines.push(`✗ ${missingCategory.length} missing category`);
  }

  const textMap = new Map<string, string[]>();
  for (const q of questions) {
    const key = normalizeQuestionText(q.question);
    const list = textMap.get(key) ?? [];
    list.push(q.id);
    textMap.set(key, list);
  }
  const duplicates = [...textMap.values()].filter((idsForText) => idsForText.length > 1);
  if (duplicates.length === 0) {
    lines.push("✓ No exact duplicate questions");
  } else {
    lines.push(`✗ ${duplicates.length} exact duplicate question text group(s)`);
  }

  const failed = lines.some((l) => l.startsWith("✗"));
  return { lines, failed, count: questions.length };
}

function main() {
  clearQuestionCache();
  let anyFailed = false;
  let total = 0;

  for (const topic of TOPICS) {
    const questions = loadQuestionsByTechnology(topic.id);
    const result = validateTechnology(topic.id, questions);
    total += result.count;
    console.log(result.lines.join("\n"));
    console.log("");
    if (result.failed) anyFailed = true;
  }

  // Cross-tech duplicate IDs
  const allIds: string[] = [];
  for (const topic of TOPICS) {
    for (const q of loadQuestionsByTechnology(topic.id)) {
      allIds.push(q.id);
    }
  }
  const globalSet = new Set(allIds);
  console.log("Global");
  if (allIds.length === globalSet.size) {
    console.log("✓ No duplicate IDs across technologies");
  } else {
    console.log(
      `✗ Duplicate IDs across technologies (${allIds.length - globalSet.size} extras)`,
    );
    anyFailed = true;
  }
  console.log(`✓ ${total} total questions loaded`);
  console.log("");

  if (anyFailed) {
    console.error("Validation failed.");
    process.exit(1);
  }
  console.log("Validation passed.");
}

main();
