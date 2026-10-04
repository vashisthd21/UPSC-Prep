export function About() {
  return (
    <div className="mx-auto max-w-prose px-5 py-16">
      <h1 className="font-serif text-3xl font-semibold text-ink dark:text-paper">About this platform</h1>
      <p className="mt-4 text-ink/70 dark:text-paper/70 leading-relaxed">
        This platform is a focused practice tool for UPSC Civil Services Examination
        Prelims aspirants, built around General Studies Paper I. It brings together
        topic-wise practice, full-length mocks, previous year questions, and detailed
        performance analytics in one clean interface.
      </p>
      <p className="mt-4 text-ink/70 dark:text-paper/70 leading-relaxed">
        Every question is tagged with its subject, topic, difficulty and question type,
        and practice questions are always clearly distinguished from actual previous
        year questions — nothing is mislabelled as a PYQ. The scoring engine follows
        UPSC's own convention of +2 for a correct answer and −0.67 for an incorrect one,
        and this is fully configurable per test.
      </p>
      <p className="mt-4 text-ink/70 dark:text-paper/70 leading-relaxed">
        This is an independent preparation tool and is not affiliated with, endorsed by,
        or connected to the Union Public Service Commission in any way.
      </p>
    </div>
  );
}
