import json
import os

def generate_nba_json():
    # Sample NBA players data
    players = [
        {
            "Name": "LeBron James",
            "MVP": 4,
            "All Star": 19,
            "All NBA": 18,
            "All Defense": 6,
            "Championships": 4
        },
        {
            "Name": "Michael Jordan",
            "MVP": 6,
            "All Star": 14,
            "All NBA": 11,
            "All Defense": 9,
            "Championships": 6
        },
        {
            "Name": "Kareem Abdul-Jabbar",
            "MVP": 6,
            "All Star": 19,
            "All NBA": 15,
            "All Defense": 11,
            "Championships": 6
        },
        {
            "Name": "Magic Johnson",
            "MVP": 3,
            "All Star": 12,
            "All NBA": 10,
            "All Defense": 0,
            "Championships": 5
        },
        {
            "Name": "Larry Bird",
            "MVP": 3,
            "All Star": 12,
            "All NBA": 10,
            "All Defense": 3,
            "Championships": 3
        },
        {
            "Name": "Tim Duncan",
            "MVP": 2,
            "All Star": 15,
            "All NBA": 15,
            "All Defense": 15,
            "Championships": 5
        },
        {
            "Name": "Kobe Bryant",
            "MVP": 1,
            "All Star": 18,
            "All NBA": 15,
            "All Defense": 12,
            "Championships": 5
        },
        {
            "Name": "Shaquille O'Neal",
            "MVP": 1,
            "All Star": 15,
            "All NBA": 14,
            "All Defense": 3,
            "Championships": 4
        },
        {
            "Name": "Kevin Durant",
            "MVP": 1,
            "All Star": 13,
            "All NBA": 10,
            "All Defense": 0,
            "Championships": 2
        },
        {
            "Name": "Stephen Curry",
            "MVP": 2,
            "All Star": 9,
            "All NBA": 8,
            "All Defense": 0,
            "Championships": 4
        }
    ]
    
    # Create the JSON structure
    data = {
        "players": players
    }
    
    # Ensure json directory exists
    os.makedirs('json', exist_ok=True)
    
    # Write to JSON file
    with open('json/nba.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    print("Generated nba.json with 10 players")

if __name__ == '__main__':
    generate_nba_json() 