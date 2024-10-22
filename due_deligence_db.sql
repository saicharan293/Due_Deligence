
SELECT * FROM public.categories;

INSERT INTO public.categories (name) VALUES
('Electrical System'),
('Mechanical System'),
('Water and Waste System'),
('Fire Protection System'),
('Building Services and Amenities'),
('Security System');

INSERT INTO subcategories (name, category_id) VALUES
('Electrical System', 1),
('Transformer', 1),
('Diesel Generator', 1),
('Panels', 1),
('Booster pumps', 2),
('Plumbing system', 2),
('Storm water system', 3),
('Sewage treatment plant', 3),
('Water Treatment plant', 3),
('Fire Protect System', 4),
('Chute system', 4),
('Swimming pool', 5),
('CCTV', 6),
('Intercom systems', 6);


SELECT * FROM public.subcategories;

SELECT * FROM public.Electrical_System_Electrical_System_104511;
SELECT * FROM public.Building_Services_and_Amenities_Swimming_pool_155831;

SELECT * FROM public.assets;

DROP TABLE public.Building_Services_and_Amenities_Swimming_pool_155831 cascade;
DROP TABLE public.Electrical_System_Electrical_System_104511 cascade;
DROP TABLE public.Security_System_CCTV cascade;
DROP TABLE public.Security_System_Intercom_systems cascade;

INSERT INTO Electrical_System_Electrical_System_185247 (Photo, Action)
    VALUES ('test', 'test');
	
INSERT INTO Electrical_System_Electrical_System_192338 (Location)
VALUES ('dfsfasd');

SELECT column_name
FROM information_schema.columns
WHERE table_name = 'subcategories';

SELECT column_name
FROM information_schema.columns
WHERE table_name = 'Electrical_System_Electrical_System_185247'
  AND table_schema = 'name';  


SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';  
-- or your specific schema


SELECT table_schema, column_name
FROM information_schema.columns
WHERE table_name = 'subcategories';

SELECT column_name
FROM information_schema.columns
WHERE table_name = '"Electrical_System_Electrical_System_185247"'
  AND table_schema = 'public';

