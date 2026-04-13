interface Env {
  CF_PAGES_COMMIT_SHA: string;
  CF_PAGES_BRANCH: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return new Response(
    JSON.stringify({
      commit: context.env.CF_PAGES_COMMIT_SHA ?? "unknown",
      branch: context.env.CF_PAGES_BRANCH ?? "unknown",
    }),
    { headers: { "Content-Type": "application/json" } }
  );
};
