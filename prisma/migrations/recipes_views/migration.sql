DROP VIEW IF EXISTS recipe_view;

CREATE VIEW recipe_view AS
SELECT
	id,
	title,
	description,
	category_name as "categoryName",
	COALESCE(avg_rating, 0) AS rating,
	COALESCE(number_of_ratings, 0) AS "numberOfRatings",
	preparation_time as "preparationTime",
	ingredients,
	preparation_steps as "preparationSteps",
	servings,
	image_key as "imageKey",
	visibility,
	created_at as "createdAt",
	author_id as "authorId",
	EXISTS (SELECT 1 from "SavedRecipe" sr WHERE sr.recipe_id = re.id) AS "isSaved"
FROM
	"Recipe" re
LEFT JOIN (
	SELECT
		recipe_id,
		AVG(value)::float AS avg_rating,
		COUNT(id)::int AS number_of_ratings
	FROM
		"Rating"
	GROUP BY 
		recipe_id
		) AS ra ON 
		re.id = ra.recipe_id;