-- Insert default song types
INSERT INTO public.song_types (name, description) VALUES
  ('Adoración', 'Canciones de adoración y alabanza'),
  ('Congregacional', 'Canciones para cantar en congregación'),
  ('Especial', 'Canciones especiales o ministerios'),
  ('Ofrenda', 'Canciones durante la ofrenda'),
  ('Entrada', 'Canciones de bienvenida o entrada')
ON CONFLICT (name) DO NOTHING;
