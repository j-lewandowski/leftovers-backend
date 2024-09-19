DROP VIEW IF EXISTS recipe_view;

CREATE VIEW recipe_view AS
SELECT
	id,
	title,
	description,
	category_name as "categoryName",
	avg_rating as rating,
	preparation_time as "preparationTime",
	ingredients,
	preparation_steps as "preparationSteps",
	servings,
	image_key as "imageKey",
	visibility,
	created_at as "createdAt",
	author_id as "authorId"
FROM
	"Recipe" re
LEFT JOIN (
	SELECT
		recipe_id,
		AVG(value) AS avg_rating
	FROM
		"Rating"
	GROUP BY 
		recipe_id
		) AS ra ON 
		re.id = ra.recipe_id;