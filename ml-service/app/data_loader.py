import pandas as pd
import json
import os


def load_and_process_data():
    print("Loading CSV files...")

    movies_path = os.path.join("data", "tmdb_5000_movies.csv")
    credits_path = os.path.join("data", "tmdb_5000_credits.csv")

    if not os.path.exists(movies_path) or not os.path.exists(credits_path):
        print("CSV files not found!")
        return None

    movies_df = pd.read_csv(movies_path)
    credits_df = pd.read_csv(credits_path)

    print(f"Loaded {len(movies_df)} movies and {len(credits_df)} credits")

    credits_df.columns = ["movie_id", "title", "cast", "crew"]
    movies_df = movies_df.merge(credits_df, on="title")

    print("Processing data...")

    def extract_names(json_str, limit=None):
        try:
            items = json.loads(json_str)
            if limit:
                items = items[:limit]
            return " ".join([item["name"].replace(" ", "") for item in items])
        except (json.JSONDecodeError, TypeError, KeyError):
            return ""

    def extract_director(json_str):
        try:
            crew = json.loads(json_str)
            for member in crew:
                if member.get("job") == "Director":
                    return member["name"].replace(" ", "")
            return ""
        except (json.JSONDecodeError, TypeError, KeyError):
            return ""

    movies_df["genres_clean"] = movies_df["genres"].apply(lambda x: extract_names(x))
    movies_df["keywords_clean"] = movies_df["keywords"].apply(lambda x: extract_names(x))
    movies_df["cast_clean"] = movies_df["cast"].apply(lambda x: extract_names(x, limit=5))
    movies_df["director"] = movies_df["crew"].apply(extract_director)
    movies_df["overview"] = movies_df["overview"].fillna("")

    final_df = pd.DataFrame({
        "id": movies_df["movie_id"],
        "title": movies_df["title"],
        "overview": movies_df["overview"],
        "genres": movies_df["genres_clean"],
        "cast": movies_df["cast_clean"],
        "director": movies_df["director"],
        "keywords": movies_df["keywords_clean"],
        "vote_average": movies_df["vote_average"],
        "vote_count": movies_df["vote_count"],
    })

    final_df = final_df.drop_duplicates(subset="title")
    final_df = final_df.fillna("")

    output_path = os.path.join("data", "movies_processed.csv")
    final_df.to_csv(output_path, index=False)

    print(f"Processed {len(final_df)} movies")
    print(f"Saved to {output_path}")

    return final_df


if __name__ == "__main__":
    load_and_process_data()
