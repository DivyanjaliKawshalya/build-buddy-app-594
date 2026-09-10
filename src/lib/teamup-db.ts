import { supabase } from "@/integrations/supabase/client";
import { seedPosts, type TeamUpPost } from "@/lib/teamup";

type Row = {
  id: string;
  name: string;
  index_number: string;
  course_code: string;
  offers: string[];
  needs: string[];
  contact: string;
  status: string;
  created_at: string;
};

export function rowToPost(row: Row): TeamUpPost {
  return {
    id: row.id,
    name: row.name,
    indexNumber: row.index_number,
    courseCode: row.course_code,
    offers: row.offers ?? [],
    needs: row.needs ?? [],
    contact: row.contact,
    status: row.status === "FULFILLED" ? "FULFILLED" : "OPEN",
    createdAt: new Date(row.created_at).getTime(),
  };
}

function postToInsert(post: Omit<TeamUpPost, "id" | "createdAt">) {
  return {
    name: post.name,
    index_number: post.indexNumber,
    course_code: post.courseCode,
    offers: post.offers,
    needs: post.needs,
    contact: post.contact,
    status: post.status,
  };
}

export async function fetchPosts(): Promise<TeamUpPost[]> {
  const { data, error } = await supabase
    .from("teamup_posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(rowToPost);
}

export async function insertPost(
  post: Omit<TeamUpPost, "id" | "createdAt">,
): Promise<TeamUpPost> {
  const { data, error } = await supabase
    .from("teamup_posts")
    .insert(postToInsert(post))
    .select("*")
    .single();
  if (error) throw error;
  return rowToPost(data as Row);
}

export async function updatePostStatus(
  id: string,
  status: "OPEN" | "FULFILLED",
): Promise<void> {
  const { error } = await supabase
    .from("teamup_posts")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from("teamup_posts").delete().eq("id", id);
  if (error) throw error;
}

export async function importPosts(posts: TeamUpPost[]): Promise<void> {
  const rows = posts.map((p) =>
    postToInsert({
      name: p.name,
      indexNumber: p.indexNumber,
      courseCode: p.courseCode,
      offers: p.offers ?? [],
      needs: p.needs ?? [],
      contact: p.contact,
      status: p.status === "FULFILLED" ? "FULFILLED" : "OPEN",
    }),
  );
  if (rows.length === 0) return;
  const { error } = await supabase.from("teamup_posts").insert(rows);
  if (error) throw error;
}

export async function resetBoard(): Promise<void> {
  const { error } = await supabase
    .from("teamup_posts")
    .delete()
    .not("id", "is", null);
  if (error) throw error;
  await importPosts(seedPosts);
}
