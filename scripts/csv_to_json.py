import csv
import json
import os

def convert_csv_to_json(csv_file, json_file):
    try:
        players = []
        
        # Ensure the json directory exists
        os.makedirs(os.path.dirname(json_file), exist_ok=True)
        
        with open(csv_file, 'r', encoding='utf-8-sig') as file:
            csv_reader = csv.DictReader(file)
            # Print headers to debug
            print("CSV Headers:", csv_reader.fieldnames)
            
            for row in csv_reader:
                # Convert string values to integers
                player = {
                    "Name": row["Player"],
                    "MVP": int(row["MVP"]),
                    "Offensive Player": int(row["Offensive Player"]),
                    "Defensive Player": int(row["Defensive Player"]),
                    "Offensive Rookie": int(row["Offensive Rookie"]),
                    "Defensive Rookie": int(row["Defensive Rookie"]),
                    "Comeback Player": int(row["Comeback Player"]),
                    "Super Bowl MVP": int(row["Super Bowl MVP"]),
                    "Super Bowl Wins": int(row["Super Bowl Wins"])
                }
                players.append(player)
        
        # Create the final JSON structure
        json_data = {
            "players": players
        }
        
        # Write to JSON file
        with open(json_file, 'w', encoding='utf-8') as file:
            json.dump(json_data, file, indent=2)
            
        print(f"Successfully converted {csv_file} to {json_file}")
        print(f"Total players processed: {len(players)}")
        
    except FileNotFoundError as e:
        print(f"Error: Could not find file - {e}")
    except Exception as e:
        print(f"Error: An unexpected error occurred - {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Get the current script's directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Construct absolute paths
    csv_file = os.path.join(script_dir, "..", "final_nfl_awards_cleaned_combined.csv")
    json_file = os.path.join(script_dir, "..", "json", "nfl.json")
    
    convert_csv_to_json(csv_file, json_file) 