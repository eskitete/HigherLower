import json
import os

def generate_difficulty_files(sport):
    # Read the full dataset
    with open(f'json/{sport}.json', 'r') as f:
        data = json.load(f)
    
    players = data['players']
    
    # Easy mode: Players with high achievements in one category
    easy_players = []
    if sport == 'nba':
        easy_players = [p for p in players if p['MVP'] >= 2 or p['All Star'] >= 10]
    else:  # NFL
        easy_players = [p for p in players if p['MVP'] >= 2 or p['Super Bowl Wins'] >= 3]
    
    # Medium mode: Players with moderate achievements
    medium_players = []
    if sport == 'nba':
        medium_players = [p for p in players if (p['MVP'] >= 1 or p['All Star'] >= 5) and p not in easy_players]
    else:  # NFL
        medium_players = [p for p in players if (p['MVP'] >= 1 or p['Super Bowl Wins'] >= 1) and p not in easy_players]
    
    # Hard mode: Players with lower achievements
    hard_players = [p for p in players if p not in easy_players and p not in medium_players]
    
    # Write difficulty-specific files
    difficulties = {
        'easy': easy_players,
        'medium': medium_players,
        'hard': hard_players
    }
    
    for difficulty, players in difficulties.items():
        output_file = f'json/{sport}_{difficulty}.json'
        with open(output_file, 'w') as f:
            json.dump({'players': players}, f, indent=2)
        print(f"Generated {output_file} with {len(players)} players")

def main():
    # Ensure json directory exists
    os.makedirs('json', exist_ok=True)
    
    # Generate files for both sports
    for sport in ['nba', 'nfl']:
        generate_difficulty_files(sport)

if __name__ == '__main__':
    main() 