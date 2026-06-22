import { createClient } from "@/lib/supabase/client";

// Example: saving Chapter 1 (income + pay schedule) of the onboarding flow.
// Not wired into a page yet — this is the walkthrough version.

interface Chapter1Answers {
  income: number;
  pay_schedule: string; // e.g. "biweekly" | "monthly" | "weekly"
}

export async function saveChapter1(answers: Chapter1Answers) {
  const supabase = createClient();

  // 1. Who is currently logged in? Supabase reads this from the session
  //    stored in the browser (cookies/local storage) — you don't pass a
  //    user id yourself, the client already knows.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not logged in");
  }

  // 2. Write the row. `upsert` = insert if this user_id doesn't have a row
  //    yet, update if it does — safe to call every time a chapter is saved
  //    without worrying about duplicates, because of the UNIQUE constraint
  //    on user_id in the onboarding_responses table.
  const { data, error } = await supabase
    .from("onboarding_responses")
    .upsert({
      user_id: user.id,
      income: answers.income,
      pay_schedule: answers.pay_schedule,
    })
    .select()
    .single();

  // 3. RLS check happens here, invisibly. Postgres only lets this upsert
  //    succeed because the policy says `user_id = auth.uid()` — and
  //    user.id above IS auth.uid(), so it matches. If you tried to pass
  //    someone else's user_id, the database would reject the row, not
  //    just your app code.
  if (error) {
    throw error;
  }

  return data;
}
