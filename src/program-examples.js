// Complete, editable programs. Each runs in the Python worker.
export const menuProgram=`def read_number(prompt):
    while True:
        try:
            return float(input(prompt))
        except ValueError:
            print("Enter a number, such as 2.5.")


def show_menu():
    print("1: Convert hours to minutes")
    print("2: Find an average")
    print("q: Quit")


def main():
    while True:
        show_menu()
        choice = input("Choose: ").strip().lower()
        if choice == "q":
            print("Goodbye")
            break
        elif choice == "1":
            hours = read_number("Hours: ")
            print("Minutes:", hours * 60)
        elif choice == "2":
            first = read_number("First number: ")
            second = read_number("Second number: ")
            print("Average:", (first + second) / 2)
        else:
            print("Choose 1, 2, or q.")


main()
`;
export const guessProgram=`import random


def compare_guess(guess, secret):
    if guess < secret:
        return "Too low"
    if guess > secret:
        return "Too high"
    return "Correct"


def play_round(secret, limit=5):
    attempts = 0
    print("Guess a whole number from 1 to 20. Type q to quit.")
    while attempts < limit:
        text = input("Your guess: ").strip().lower()
        if text == "q":
            return False
        try:
            guess = int(text)
        except ValueError:
            print("Use a whole number.")
            continue
        if not 1 <= guess <= 20:
            print("Stay between 1 and 20.")
            continue
        attempts += 1
        message = compare_guess(guess, secret)
        print(message)
        if message == "Correct":
            print("Guesses used:", attempts)
            return True
        print("Guesses left:", limit - attempts)
    print("The number was", secret)
    return False


def main():
    wins = 0
    while True:
        if play_round(random.randint(1, 20)):
            wins += 1
        print("Wins:", wins)
        if input("Play again? y/n: ").strip().lower() != "y":
            break


main()
`;
export const quizProgram=`def normalize(text):
    return text.strip().lower()


def ask_question(question):
    print(question["prompt"])
    for index, option in enumerate(question["options"], start=1):
        print(index, option)
    while True:
        answer = normalize(input("Option number, or q: "))
        if answer == "q":
            return None
        if answer in [str(n) for n in range(1, len(question["options"]) + 1)]:
            return int(answer) == question["answer"]
        print("Choose a listed number.")


def play(questions):
    score = 0
    answered = 0
    for question in questions:
        correct = ask_question(question)
        if correct is None:
            break
        answered += 1
        if correct:
            score += 1
            print("Correct")
        else:
            print("Answer:", question["options"][question["answer"] - 1])
    print("Score:", score, "out of", answered)


questions = [
    {"prompt": "Which type holds True?", "options": ["bool", "str"], "answer": 1},
    {"prompt": "What is 3 * 4?", "options": ["7", "12"], "answer": 2},
    {"prompt": "Which collection uses keys?", "options": ["list", "dict"], "answer": 2},
]
play(questions)
`;
export const adventureProgram=`rooms = {
    "hall": {"description": "A hall with a blue door.", "exits": {"east": "garden", "north": "tower"}},
    "garden": {"description": "A key lies beside a tree.", "exits": {"west": "hall"}},
    "tower": {"description": "You found the map. You win!", "exits": {}},
}


def move(room, direction, inventory):
    destination = rooms[room]["exits"].get(direction)
    if destination is None:
        return room, "There is no exit in that direction."
    if destination == "tower" and "key" not in inventory:
        return room, "The tower door needs a key."
    return destination, "You move to " + destination


def play():
    room = "hall"
    inventory = []
    print("Commands: east, west, north, take, bag, quit")
    while True:
        print(rooms[room]["description"])
        if room == "tower":
            break
        command = input("Action: ").strip().lower()
        if command == "quit":
            break
        elif command == "bag":
            print("Bag:", inventory)
        elif command == "take":
            if room == "garden" and "key" not in inventory:
                inventory.append("key")
                print("Key collected")
            else:
                print("Nothing new to collect.")
        else:
            room, message = move(room, command, inventory)
            print(message)


play()
`;
export const boardProgram=`WIN_LINES = [
    (0, 1, 2), (3, 4, 5), (6, 7, 8),
    (0, 3, 6), (1, 4, 7), (2, 5, 8),
    (0, 4, 8), (2, 4, 6),
]


def winner(board):
    for a, b, c in WIN_LINES:
        if board[a] != " " and board[a] == board[b] == board[c]:
            return board[a]
    return None


def show_board(board):
    for start in range(0, 9, 3):
        cells = [board[i] if board[i] != " " else str(i + 1)
                 for i in range(start, start + 3)]
        print(" | ".join(cells))
    print()


def play():
    board = [" "] * 9
    player = "X"
    while True:
        show_board(board)
        text = input(player + " — choose 1–9, or q: ").strip().lower()
        if text == "q":
            break
        if text not in [str(n) for n in range(1, 10)]:
            print("Choose a number from 1 to 9.")
            continue
        index = int(text) - 1
        if board[index] != " ":
            print("That square is taken.")
            continue
        board[index] = player
        won = winner(board)
        if won:
            show_board(board)
            print(won, "wins")
            break
        if " " not in board:
            show_board(board)
            print("Draw")
            break
        player = "O" if player == "X" else "X"


play()
`;
export const savesProgram=`import json
import os


def validate(state):
    if not isinstance(state, dict):
        raise ValueError("A save must contain a record.")
    if type(state.get("score")) is not int or state["score"] < 0:
        raise ValueError("Score must be a non-negative integer.")
    if not isinstance(state.get("name"), str) or not state["name"].strip():
        raise ValueError("A player needs a name.")
    return state


def load_game(path):
    with open(path, encoding="utf-8") as file:
        return validate(json.load(file))


def save_game(path, state):
    validate(state)
    with open(path, "w", encoding="utf-8") as file:
        json.dump(state, file, indent=2)


def main():
    state = {"name": "Nova", "score": 0}
    if os.path.exists("save.json"):
        try:
            state = load_game("save.json")
            print("Loaded your save")
        except (ValueError, OSError) as error:
            print("Could not load:", error)
    while True:
        print(state["name"], "Score:", state["score"])
        choice = input("earn, save, or quit: ").strip().lower()
        if choice == "quit":
            break
        elif choice == "earn":
            state["score"] += 10
        elif choice == "save":
            save_game("save.json", state)
            print("Saved. Download save.json after the program ends.")
        else:
            print("Choose earn, save, or quit.")


main()
`;
export const searchProgram=`# These are invented records for learning, not API results.
DOCUMENTS = [
    {"title": "Space Maps", "text": "A guide to stars and planets."},
    {"title": "River Life", "text": "Animals and plants near water."},
    {"title": "A Space Journey", "text": "A story about a journey to a planet."},
]


def score_document(document, words):
    title = document["title"].lower()
    text = document["text"].lower()
    return sum(3 * (word in title) + (word in text) for word in words)


def search(documents, query):
    words = set(query.lower().split())
    if not words:
        return []
    ranked = []
    for document in documents:
        score = score_document(document, words)
        if score > 0:
            ranked.append((score, document["title"]))
    # Higher score first; title breaks ties consistently.
    return sorted(ranked, key=lambda pair: (-pair[0], pair[1]))


def main():
    while True:
        query = input("Search words, or q: ").strip()
        if query.lower() == "q":
            break
        results = search(DOCUMENTS, query)
        if not results:
            print("No matches. Try another word.")
        for score, title in results[:5]:
            print(title, "— score", score)


main()
`;
export const apiFunctions=`import asyncio
from urllib.parse import urlencode
from pyodide.http import pyfetch


def make_url(query, page=1):
    params = {"q": query, "fields": "key,title,author_name,first_publish_year",
              "limit": 5, "page": page}
    return "https://openlibrary.org/search.json?" + urlencode(params)


def summarize(data):
    books = []
    for item in data.get("docs", []):
        books.append({"key": item.get("key", ""),
                      "title": item.get("title", "Untitled"),
                      "author": ", ".join(item.get("author_name") or ["Unknown author"])})
    return books


async def fetch_books(query, page=1):
    response = await asyncio.wait_for(pyfetch(make_url(query, page)), timeout=12)
    if not response.ok:
        raise RuntimeError("The service returned HTTP " + str(response.status))
    data = await asyncio.wait_for(response.json(), timeout=8)
    return summarize(data)
`;
export const apiProgram=apiFunctions+`

async def main():
    query = input("Book search: ").strip()
    if not query:
        print("Enter a topic or a book title.")
        return
    print("Searching Open Library...")
    try:
        books = await fetch_books(query)
    except Exception as error:
        print("Search unavailable:", error)
        print("Check your connection and try later.")
        return
    if not books:
        print("No books found. Try another search.")
    for index, book in enumerate(books, start=1):
        print(index, book["title"], "—", book["author"])
        print("https://openlibrary.org" + book["key"])


await main()
`;
export const libraryProgram=apiFunctions+`

import json


class ReadingList:
    def __init__(self):
        self.books = []

    def add(self, book):
        if book["key"] not in [saved["key"] for saved in self.books]:
            self.books.append(book.copy())

    def save(self):
        with open("reading-list.json", "w", encoding="utf-8") as file:
            json.dump(self.books, file, indent=2)


async def main():
    reading = ReadingList()
    cache = {}
    while True:
        query = input("Search, /list, /save, or /quit: ").strip()
        if query == "/quit":
            break
        if query == "/list":
            for book in reading.books:
                print(book["title"])
            continue
        if query == "/save":
            reading.save()
            print("Download reading-list.json after you quit.")
            continue
        if not query:
            continue
        try:
            cache_key = query.lower()
            if cache_key not in cache:
                cache[cache_key] = await fetch_books(query)
            results = cache[cache_key]
        except Exception as error:
            print("Search unavailable:", error)
            continue
        for index, book in enumerate(results, start=1):
            print(index, book["title"], "—", book["author"])
        if not results:
            print("No results.")
            continue
        choice = input("Save which number? Enter skips: ").strip()
        if choice in [str(n) for n in range(1, len(results) + 1)]:
            reading.add(results[int(choice) - 1])
        elif choice:
            print("That number was not listed.")


await main()
`;
export const releaseProgram=`import json


def add_item(items, title):
    title = title.strip()
    if not title:
        raise ValueError("Use a non-empty title.")
    return items + [{"title": title, "done": False}]


def finish_item(items, index):
    if not 0 <= index < len(items):
        raise ValueError("Choose an existing item.")
    result = [item.copy() for item in items]
    result[index]["done"] = True
    return result


def run_tests():
    assert add_item([], " Read ") == [{"title": "Read", "done": False}]
    original = [{"title": "Read", "done": False}]
    assert finish_item(original, 0)[0]["done"] is True
    assert original[0]["done"] is False
    try:
        add_item([], " ")
    except ValueError:
        pass
    else:
        raise AssertionError("Blank titles must be rejected")
    print("Tests passed")


def main():
    items = []
    while True:
        for index, item in enumerate(items, start=1):
            print(index, "done" if item["done"] else "open", item["title"])
        command = input("add, done, save, or quit: ").strip().lower()
        try:
            if command == "quit":
                break
            elif command == "add":
                items = add_item(items, input("Title: "))
            elif command == "done":
                items = finish_item(items, int(input("Item number: ")) - 1)
            elif command == "save":
                with open("tasks.json", "w", encoding="utf-8") as file:
                    json.dump(items, file, indent=2)
                print("Saved tasks.json")
            else:
                print("Choose a listed command.")
        except ValueError as error:
            print(error)


run_tests()
main()
`;
