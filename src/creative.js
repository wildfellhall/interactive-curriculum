const exercise=(id,lesson,title,kind,instructions,starter,solution,checks,hint)=>({id,lesson,title,kind,instructions,starter,solution,checks:checks.map(([label,test])=>({label,test})),hint});
const blank='# Write your own solution below.\n';
export const challenges=[
 exercise('typed-profile','types','Compare Text and Numbers','write',['Create text from "3", whole from int(text), and decimal from float(text).','Set positive to the result of whole > 0. Print text + "2", whole + 2, decimal / 2, and positive on separate lines.'],blank,'text = "3"\nwhole = int(text)\ndecimal = float(text)\npositive = whole > 0\nprint(text + "2")\nprint(whole + 2)\nprint(decimal / 2)\nprint(positive)',[['All four types are correct','type(text) is str and type(whole) is int and type(decimal) is float and type(positive) is bool'],['The operations use the intended types','_output.strip().splitlines() == ["32","5","1.5","True"]']],'Convert the text before calculating. A comparison produces a Boolean.'),
 exercise('ticket','print','Print an Event Ticket','write',['Print Python Club on the first line.','Print Room 4 on the second line.','Print Friday on the third line.'],blank,'print("Python Club")\nprint("Room 4")\nprint("Friday")',[['The three lines appear in the right order','_output.strip().splitlines() == ["Python Club", "Room 4", "Friday"]']],'Use three print() instructions. Keep the words inside quotes.'),
 exercise('points','variables','Keep a Running Score','write',['Start with points = 10.','Add 5 points, then subtract 2 points.','Print the final value of points.'],blank,'points = 10\npoints = points + 5\npoints = points - 2\nprint(points)',[['points is 13','points == 13'],['The final score is printed','_output.strip() == "13"']],'Use the same variable name for each update.'),
 {...exercise('minutes','numbers','Convert Hours to Minutes','write',['Read a whole number from Input. Save it as hours.','Save hours multiplied by 60 in minutes.','Print minutes. Try 2, 0, and 5 as separate runs.'],blank,'hours = int(input())\nminutes = hours * 60\nprint(minutes)',[['The input is stored as a whole number','type(hours) is int and hours == int(_inputs[0])'],['Minutes match the given hours','minutes == hours * 60'],['The result is printed','_output.strip() == str(minutes)']],'Use int(input()) and multiplication.'),input:'2'},
 {...exercise('tickets','choices','Choose a Ticket Message','write',['Read a whole number from Input into age.','If age is below 12, print Junior ticket.','Otherwise, print Standard ticket. Check 11 and 12.'],blank,'age = int(input())\nif age < 12:\n    print("Junior ticket")\nelse:\n    print("Standard ticket")',[['The input is saved in age','age == int(_inputs[0])'],['The message matches the age','_output.strip() == ("Junior ticket" if age < 12 else "Standard ticket")']],'Use < 12. The value 12 belongs in the else branch.'),input:'11'},
 exercise('packing','lists','Pack a Bag','write',['Create bag with "book" and "pen", in that order.','Append "bottle".','Print the last item, then print the number of items on a new line.'],blank,'bag = ["book", "pen"]\nbag.append("bottle")\nprint(bag[2])\nprint(len(bag))',[['The bag has the three items','bag == ["book", "pen", "bottle"]'],['Last item and length are printed','_output.strip().splitlines() == ["bottle", "3"]']],'After appending, the last item is at index 2.'),
 exercise('squares','loops','Print Five Squares','write',['Use a loop over range(1, 6). This gives 1 through 5.','For each number, print number multiplied by itself.','Print one result on each line.'],blank,'for number in range(1, 6):\n    print(number * number)',[['The five squares appear in order','_output.strip().splitlines() == ["1", "4", "9", "16", "25"]']],'range(start, stop) starts at start and stops before stop. Use print(number * number) inside the loop.'),
 exercise('largest','functions','Return the Larger Number','write',['Write larger(a, b).','Return the larger value. If the values are equal, return that value.','Your function must work for different numbers.'],blank,'def larger(a, b):\n    if a >= b:\n        return a\n    return b',[['Works when the first value is larger','larger(8,3) == 8'],['Works when the second value is larger','larger(2,7) == 7'],['Works with equal and negative values','larger(4,4) == 4 and larger(-5,-2) == -2']],'Use a comparison inside the function. Both paths need to return a value.'),
 exercise('stock','dictionaries','Update a Stock List','write',['Create stock with "pens": 4 and "books": 2.','Add 3 to the value for "pens".','Print the new pen count. Keep the book count unchanged.'],blank,'stock = {"pens": 4, "books": 2}\nstock["pens"] = stock["pens"] + 3\nprint(stock["pens"])',[['Both counts are correct','stock == {"pens":7,"books":2}'],['The pen count is printed','_output.strip() == "7"']],'Look up the old value using stock["pens"], then save its new value.'),
 exercise('plant','classes','Give Each Plant a Name','write',['Create a Plant class. __init__ receives a name and saves self.name.','Add a label() method that returns "Plant: " followed by the name.','Each Plant object must keep its own name.'],blank,'class Plant:\n    def __init__(self, name):\n        self.name = name\n\n    def label(self):\n        return "Plant: " + self.name',[['An object stores its own name','Plant("Fern").name == "Fern"'],['The label uses each object’s name','Plant("Fern").label() == "Plant: Fern" and Plant("Rose").label() == "Plant: Rose"']],'Use self.name in both methods. label() needs self as its parameter.'),
 exercise('unfinished','project','Count Unfinished Tasks','write',['Write count_left(tasks). Each task has a Boolean "done" value.','Return how many tasks have "done" set to False.','An empty list must give 0.'],blank,'def count_left(tasks):\n    total = 0\n    for task in tasks:\n        if task["done"] == False:\n            total = total + 1\n    return total',[['An empty list gives 0','count_left([]) == 0'],['A mixed list gives the right count','count_left([{"done":True},{"done":False},{"done":False}]) == 2'],['All finished tasks give 0','count_left([{"done":True}]) == 0']],'Start total at 0. Increase it only when done is False.'),
 exercise('repair-loop','loops','Fix the Repeating Total','fix',['The total should include every number.','Keep the numbers list as it is.','Fix the indentation so only the final total, 10, is printed.'],'numbers = [2, 3, 5]\ntotal = 0\nfor number in numbers:\n    total = total + number\n    print(total)','numbers = [2, 3, 5]\ntotal = 0\nfor number in numbers:\n    total = total + number\nprint(total)',[['The list and total are correct','numbers == [2,3,5] and total == 10'],['Only one total is printed','_output.strip() == "10"']],'A line indented inside the loop runs each time. Move the final print outside the block.'),
 exercise('repair-return','functions','Fix the Missing Result','fix',['This function shows a number but does not return it.','Make triple(number) return three times number.','Keep print(triple(4)) at the end. It should print only 12.'],'def triple(number):\n    print(number * 3)\n\nprint(triple(4))','def triple(number):\n    return number * 3\n\nprint(triple(4))',[['The function returns results for different inputs','triple(4) == 12 and triple(0) == 0 and triple(-2) == -6'],['The program prints only 12','_output.strip() == "12"']],'Use return inside the function. Keep print() outside it.')
];
export const challengeById=Object.fromEntries(challenges.map(c=>[c.id,c]));
export const prompts={
 print:['Print a three-line poem.','Make a sign for a club you invent.','Draw a small picture with letters and symbols.'],
 variables:['Track points in a game you invent.','Save a character’s name, age, and favourite activity.','Show a value before and after changing it.'],
 numbers:['Convert days into hours.','Work out the cost of several items.','Ask for two numbers and print their sum.'],
 choices:['Choose a different story ending from an input answer.','Suggest an activity based on the weather.','Print a different message for a high or low score.'],
 lists:['Build a list of places for an imaginary journey.','Create a playlist with made-up song titles.','Add a new book to a reading list and print its title.'],
 loops:['Print a numbered list of your favourite activities.','Show the first five multiples of a number.','Add all the points in a list.'],
 functions:['Write a function that creates a greeting.','Convert minutes into seconds with a function.','Make a function that calculates a game score.'],
 dictionaries:['Describe a made-up game character.','Keep track of supplies for a school club.','Connect place names with facts you invent.'],
 classes:['Create two characters with different names.','Make a Pet class with a feed() method.','Make a Score class that can add points.'],
 project:['Make your study planner count unfinished tasks.','Create a reading tracker with books and page counts.','Build a small game using a function and a list.']
};
export const templates=[
 {id:'message',title:'A Message',description:'Start with text and print().',code:'message = "Hello!"\nprint(message)\n',input:''},
 {id:'input',title:'Ask a Question',description:'Read one answer from Input.',code:'name = input()\nprint("Hello, " + name)\n',input:'Asha'},
 {id:'repeat',title:'Use a List',description:'Visit each item with a loop.',code:'items = ["red", "blue", "green"]\nfor item in items:\n    print(item)\n',input:''},
 {id:'function',title:'A Small Function',description:'Pass in a number and return a result.',code:'def double(number):\n    return number * 2\n\nprint(double(5))\n',input:''}
];
export const projects=[
 {
 id:'poster',title:'A Club Poster',level:'Start here',lessons:['print'],description:'Design a text poster for a club you invent.',
 steps:['Choose a club name and print it on the first line.','Print two activities on separate lines.','Add a border using characters such as * or -.'],
 starter:'# Make a poster with print().\n# Put each line of text inside quotes.\n',input:'',
 tests:['Check that each activity has its own line.','Change the club name and run the program again.','Check that the border surrounds your text.'],
 extras:['Add a place and a meeting time.','Draw a small symbol using letters or punctuation.'],hint:'Each print() creates a new line. For example: print("* Art Club *").',plan:'What is your club called? What can people do there?'
 },
 {
 id:'character',title:'A Character Card',level:'Start here',lessons:['print','variables'],description:'Give a made-up character a name, a skill, and an energy value.',
 steps:['Save a name, a skill, and an energy number in variables.','Print the three values to show your character.','Change the energy value. Print it again to show what changed.'],
 starter:'# Choose your character’s details.\nname = ""\nskill = ""\nenergy = 5\n\n# Show the values, then change energy.\n',input:'',
 tests:['Check that all three values appear.','Change the name in one place and run again.','Check that you can see energy before and after the change.'],
 extras:['Add a variable for an item the character carries.','Show how energy changes after two different actions.'],hint:'Use print(name) to show a variable. Update energy with a new value before printing it again.',plan:'Who is your character? What makes their energy change?'
 },
 {
 id:'playlist',title:'A Music List',level:'Try next',lessons:['print','lists'],description:'Keep a list of made-up song titles and choose one to play.',
 steps:['Create songs with three titles you invent.','Append a fourth title and print the new number of songs.','Choose an index and print the title at that position.'],
 starter:'# Invent your own song titles.\nsongs = []\n\n# Add a title, count the songs, and choose one.\n',input:'',
 tests:['Choose index 0 and check the first title.','Choose the last valid index and check that title.','Add another title and check the new count.'],
 extras:['Print a title for your playlist.','Create a second list for a different mood.'],hint:'Use songs.append("your title"), len(songs), and songs[0]. An index must be smaller than the list length.',plan:'What mood does your playlist have? Invent a few song titles.'
 },
 {
 id:'scores',title:'A Score Report',level:'Try next',lessons:['variables','lists','loops'],description:'Show the points earned in each round of a game you invent.',
 steps:['Create a list of points from at least three rounds.','Use a loop to add each round’s points to a total. Print the running total inside the loop.','Print the final total after the loop.'],
 starter:'# Choose points for your game.\npoints = [3, 5, 2]\ntotal = 0\n\n# Add each round’s points and show the running total.\n',input:'',
 tests:['Check the final total by adding the points yourself.','Add a fourth round and run again.','Try a list containing 0 and check that the total stays correct.'],
 extras:['Print a message when the score reaches a target.','Try another game with different points.'],hint:'Inside for point in points:, update total = total + point. A print outside the loop runs once at the end.',plan:'How does a player earn points? What should your report show?'
 },
 {
 id:'story',title:'A Story Maker',level:'Start here',lessons:['print','variables','numbers'],description:'Ask for a few words. Use them in a story you write.',
 steps:['Choose a character, a place, and an object.','Read these three answers with input().','Print a short story that uses every answer.'],
 starter:'# Write a story using the answers.\ncharacter = input()\nplace = input()\nobject_name = input()\n\n# Add your story below.\n',input:'Meera\na library\na silver key',
 tests:['Run it with three different answers.','Use a place name that contains spaces.','Check that all three answers appear in your story.'],
 extras:['Add a fourth question.','Give the story a title.'],hint:'Join text with +. For example: print(character + " found " + object_name).',plan:'What happens in your story? Which words can the reader choose?'
 },
 {
 id:'adventure',title:'A Choice Adventure',level:'Try next',lessons:['numbers','choices'],description:'Let a reader choose what happens next in a text adventure.',
 steps:['Invent a place and describe two paths.','Read one answer from Input. Use if and else to choose a path.','Write different endings for the two choices.'],
 starter:'# The reader chooses a path.\nchoice = input()\n\n# Compare choice with a word such as "forest".\n# Write your own endings.\n',input:'forest',
 tests:['Try each of the two choices.','Try a word you did not expect. Decide what should happen.','Check that the endings are different.'],
 extras:['Add a second choice inside one path.','Keep a score or an item that changes the ending.'],hint:'Start with if choice == "forest":. Indent the lines for that ending.',plan:'What are the two choices? What happens after each one?'
 },
 {
 id:'quiz',title:'Your Own Quiz',level:'Try next',lessons:['choices','lists','loops','dictionaries'],description:'Write questions about a topic you enjoy and keep a score.',
 steps:['Choose a topic. Store three questions as dictionaries with question and answer keys.','Keep the dictionaries in a list. Loop through them, read an answer, and check it.','Add one point for each correct answer. Print the final score.'],
 starter:'# Choose your own quiz topic.\nscore = 0\n\n# Ask and check each question.\n# Put answers on separate lines in Input.\n\n# Show the final score.\n',input:'',
 tests:['Try a run with every answer correct.','Try a run with every answer wrong.','Try a mix. Check that the score is right.'],
 extras:['Add a hint key to each question dictionary.','Use a function to check an answer.'],hint:'A question can be {"question": "How many sides does a square have?", "answer": "4"}. In a loop, use item["question"] and item["answer"]. Increase score only when the answer matches.',plan:'What is your quiz about? Write your questions and their answers.'
 },
 {
 id:'budget',title:'A Trip Planner',level:'Try next',lessons:['numbers','lists','loops','functions'],description:'Plan an imaginary day out and work out its total cost.',
 steps:['Choose a budget and at least three activities or items.','Write total_cost(costs). Use a loop in the function and return the total.','Print the total and say whether it fits your budget. Use made-up amounts.'],
 starter:'# Plan an imaginary day out.\nbudget = 30\ncosts = []\n\n# Add the costs.\n# Compare the total with budget.\n',input:'',
 tests:['Try a plan that costs less than the budget.','Try one that costs exactly the budget.','Try one that costs more. Check all three messages.'],
 extras:['Read the budget from Input.','Use a dictionary to keep item names with their costs.'],hint:'Inside total_cost(costs), start total at 0 and add each cost. Return total after the loop. Call the function and compare its result with budget.',plan:'What will your day include? Choose a budget and some costs.'
 },
 {
 id:'library',title:'A Book Finder',level:'Build more',lessons:['lists','loops','functions','dictionaries'],description:'Create a small library and help someone find a book.',
 steps:['Invent at least three books. Give each a title and a genre.','Write a function that finds books in a chosen genre.','Print matching titles. Decide what to show when no book matches.'],
 starter:'# Build a small library.\nbooks = []\n\ndef find_books(genre):\n    # Return a list of matching titles.\n    return []\n\n# Call your function and show the results.\n',input:'',
 tests:['Try a genre with one match.','Try one with more than one match.','Try a genre that is not in your library.'],
 extras:['Let the reader enter a genre.','Add pages or a short description to each book.'],hint:'Visit each book in a loop. If book["genre"] matches, append book["title"] to a results list.',plan:'What books will you invent? How will your program find a match?'
 },
 {
 id:'pet',title:'A Virtual Pet',level:'Build more',lessons:['variables','functions','classes'],description:'Make a text-based pet with its own name, energy, and actions.',
 steps:['Create a Pet class with a name and an energy value.','Add methods for two actions, such as play() and rest(). Let each action change energy.','Create two pets. Show how their energy changes separately.'],
 starter:'class Pet:\n    def __init__(self, name):\n        self.name = name\n        self.energy = 5\n\n    # Add your own methods here.\n\n# Create and use two pets below.\n',input:'',
 tests:['Call an action and check the new energy value.','Use one pet. Check that the other pet stays the same.','Decide what should happen when energy reaches 0.'],
 extras:['Give each pet a favourite activity.','Add a method that returns a sentence about the pet.'],hint:'Inside a method, update self.energy. For example: self.energy = self.energy + 1.',plan:'What can your pet do? How does each action change its energy?'
 }
];
export const projectById=Object.fromEntries(projects.map(p=>[p.id,p]));
export function programFilename(name){return (name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'my-program')+'.py'}

// A project only uses concepts introduced by its place in the course.
export const lessonProjectIds={print:'poster',variables:'character',numbers:'story',choices:'adventure',lists:'playlist',loops:'scores',functions:'budget',dictionaries:'quiz',classes:'pet',project:'library'};
export const projectLessonIds=Object.fromEntries(Object.entries(lessonProjectIds).map(([lesson,project])=>[project,lesson]));
export const projectConnections={
 print:'Use print() to arrange text on separate lines.',
 variables:'Use named values to describe a character and show a change.',
 numbers:'Use input() to collect words from your reader.',
 choices:'Use if and else to choose what happens next.',
 lists:'Use indexes, append(), and len() to build and use a list.',
 loops:'Use a loop to update a total one item at a time.',
 functions:'Put a calculation in a function so you can use it with different lists.',
 dictionaries:'Use dictionary keys to connect each question with its answer.',
 classes:'Use a class to create two objects that keep separate values.',
 project:'Use the list-and-function pattern from your study planner to build a book finder.'
};
export function practiceForLesson(lesson){return [
 ...lesson.practice.map(task=>({...task,kind:'guided',storageKey:`${lesson.id}:${task.id}`})),
 ...challenges.filter(task=>task.lesson===lesson.id).map(task=>({...task,storageKey:`challenge:${task.id}`}))
]}
