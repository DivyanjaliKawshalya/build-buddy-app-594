CREATE TABLE public.teamup_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  index_number TEXT NOT NULL,
  course_code TEXT NOT NULL,
  offers TEXT[] NOT NULL DEFAULT '{}',
  needs TEXT[] NOT NULL DEFAULT '{}',
  contact TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','FULFILLED')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.teamup_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teamup_posts TO authenticated;
GRANT ALL ON public.teamup_posts TO service_role;

ALTER TABLE public.teamup_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view requests" ON public.teamup_posts FOR SELECT USING (true);
CREATE POLICY "Anyone can add requests" ON public.teamup_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update requests" ON public.teamup_posts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can remove requests" ON public.teamup_posts FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_teamup_posts_updated_at
BEFORE UPDATE ON public.teamup_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.teamup_posts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teamup_posts;

INSERT INTO public.teamup_posts (name, index_number, course_code, offers, needs, contact, status, created_at) VALUES
('Ada Okafor', '23014889', 'CS201', ARRAY['Data viz','Figma'], ARRAY['SQL','Python'], 'ada@campus.edu', 'OPEN', now() - interval '12 minutes'),
('Marco Lindqvist', '22077310', 'DES210', ARRAY['Illustration','Branding'], ARRAY['Motion / After Effects'], 'marco.l@campus.edu', 'OPEN', now() - interval '90 minutes'),
('Priya Nair', '23022145', 'MATH101', ARRAY['Statistics','R'], ARRAY['Linear algebra'], 'priya.n@campus.edu', 'OPEN', now() - interval '5 hours'),
('Theo Baptiste', '22091503', 'ENG150', ARRAY['Essay editing','Citation help'], ARRAY['Poetry workshop'], 'theo.b@campus.edu', 'OPEN', now() - interval '26 hours');