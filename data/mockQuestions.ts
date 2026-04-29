import { Question, QuestionType, QuestionCategory, QuestionDifficulty } from '../types';

export const FULL_QUESTION_BANK: Question[] = [
    // ============================
    // APTITUDE (30 Questions)
    // ============================
    {
        id: 'apt-1', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.EASY, points: 5,
        text: 'A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?',
        options: ['120 metres', '180 metres', '324 metres', '150 metres'], correctOptionIndex: 3
    },
    {
        id: 'apt-2', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.EASY, points: 5,
        text: 'A person crosses a 600 m long street in 5 minutes. What is his speed in km per hour?',
        options: ['3.6', '7.2', '8.4', '10'], correctOptionIndex: 1
    },
    {
        id: 'apt-3', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'If A and B together can complete a piece of work in 15 days and B alone in 20 days, in how many days can A alone complete the work?',
        options: ['60 days', '45 days', '40 days', '30 days'], correctOptionIndex: 0
    },
    {
        id: 'apt-4', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'A vendor bought toffees at 6 for a rupee. How many for a rupee must he sell to gain 20%?',
        options: ['3', '4', '5', '6'], correctOptionIndex: 2
    },
    {
        id: 'apt-5', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'The average of 20 numbers is zero. Of them, at the most, how many may be greater than zero?',
        options: ['0', '1', '10', '19'], correctOptionIndex: 3
    },
    {
        id: 'apt-6', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.EASY, points: 5,
        text: 'Find the greatest number that will divide 43, 91 and 183 so as to leave the same remainder in each case.',
        options: ['4', '7', '9', '13'], correctOptionIndex: 0
    },
    {
        id: 'apt-7', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.EASY, points: 5,
        text: 'Which of the following fractions is the smallest?',
        options: ['7/6', '7/9', '4/5', '5/7'], correctOptionIndex: 3
    },
    {
        id: 'apt-8', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'A sum of money at simple interest amounts to Rs. 815 in 3 years and to Rs. 854 in 4 years. The sum is:',
        options: ['Rs. 650', 'Rs. 690', 'Rs. 698', 'Rs. 700'], correctOptionIndex: 2
    },
    {
        id: 'apt-9', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'In how many different ways can the letters of the word "CORPORATION" be arranged so that the vowels always come together?',
        options: ['810', '1440', '2880', '50400'], correctOptionIndex: 3
    },
    {
        id: 'apt-10', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.HARD, points: 5,
        text: 'What is the probability of getting a sum 9 from two throws of a dice?',
        options: ['1/6', '1/8', '1/9', '1/12'], correctOptionIndex: 2
    },
    {
        id: 'apt-11', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'Three unbiased coins are tossed. What is the probability of getting at most two heads?',
        options: ['3/4', '1/4', '3/8', '7/8'], correctOptionIndex: 3
    },
    {
        id: 'apt-12', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.EASY, points: 5,
        text: 'Two ships are sailing in the sea on the two sides of a lighthouse. The angle of elevation of the top of the lighthouse is observed from the ships are 30° and 45° respectively. If the lighthouse is 100 m high, the distance between the two ships is:',
        options: ['173 m', '200 m', '273 m', '300 m'], correctOptionIndex: 2
    },
    {
        id: 'apt-13', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'A, B and C can do a piece of work in 20, 30 and 60 days respectively. In how many days can A do the work if he is assisted by B and C on every third day?',
        options: ['12 days', '15 days', '16 days', '18 days'], correctOptionIndex: 1
    },
    {
        id: 'apt-14', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'The cost price of 20 articles is the same as the selling price of x articles. If the profit is 25%, then the value of x is:',
        options: ['15', '16', '18', '25'], correctOptionIndex: 1
    },
    {
        id: 'apt-15', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.EASY, points: 5,
        text: 'A father said to his son, "I was as old as you are at the present at the time of your birth". If the father is 38 years old now, the son was five years back:',
        options: ['14 years', '19 years', '33 years', '38 years'], correctOptionIndex: 0
    },
    {
        id: 'apt-16', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.EASY, points: 5,
        text: 'Today is Monday. After 61 days, it will be:',
        options: ['Wednesday', 'Saturday', 'Tuesday', 'Thursday'], correctOptionIndex: 1
    },
    {
        id: 'apt-17', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'How many times in a day, are the hands of a clock in straight line but opposite in direction?',
        options: ['20', '22', '24', '48'], correctOptionIndex: 1
    },
    {
        id: 'apt-18', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'A boat can travel with a speed of 13 km/hr in still water. If the speed of the stream is 4 km/hr, find the time taken by the boat to go 68 km downstream.',
        options: ['2 hours', '3 hours', '4 hours', '5 hours'], correctOptionIndex: 2
    },
    {
        id: 'apt-19', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.HARD, points: 5,
        text: 'A sum of Rs. 12,500 amounts to Rs. 15,500 in 4 years at the rate of simple interest. What is the rate of interest?',
        options: ['3%', '4%', '5%', '6%'], correctOptionIndex: 3
    },
    {
        id: 'apt-20', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.EASY, points: 5,
        text: 'Which number does not belong in the series: 3, 5, 11, 14, 17, 21?',
        options: ['21', '17', '14', '3'], correctOptionIndex: 2
    },
    {
        id: 'apt-21', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: '66 cubic centimeters of silver is drawn into a wire 1 mm in diameter. The length of the wire in meters will be:',
        options: ['84', '90', '168', '336'], correctOptionIndex: 0
    },
    {
        id: 'apt-22', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'A rectangular park 60 m long and 40 m wide has two concrete crossroads running in the middle of the park and rest of the park has been used as a lawn. If the area of the lawn is 2109 sq. m, then what is the width of the road?',
        options: ['2.91 m', '3 m', '5.82 m', 'None of these'], correctOptionIndex: 1
    },
    {
        id: 'apt-23', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.HARD, points: 5,
        text: 'A clock is set right at 5 a.m. The clock loses 16 minutes in 24 hours. What will be the true time when the clock indicates 10 p.m. on 4th day?',
        options: ['11 p.m.', '12 p.m.', '11 a.m.', '10 a.m.'], correctOptionIndex: 0
    },
    {
        id: 'apt-24', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'The H.C.F. of two numbers is 23 and the other two factors of their L.C.M. are 13 and 14. The larger of the two numbers is:',
        options: ['276', '299', '322', '345'], correctOptionIndex: 2
    },
    {
        id: 'apt-25', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.EASY, points: 5,
        text: 'Evaluation of 8^3 × 8^2 × 8^-5 is:',
        options: ['1', '0', '8', 'None of these'], correctOptionIndex: 0
    },
    {
        id: 'apt-26', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'If log 27 = 1.431, then the value of log 9 is:',
        options: ['0.934', '0.945', '0.954', '0.958'], correctOptionIndex: 2
    },
    {
        id: 'apt-27', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.HARD, points: 5,
        text: 'Seats for Mathematics, Physics and Biology in a school are in the ratio 5 : 7 : 8. There is a proposal to increase these seats by 40%, 50% and 75% respectively. What will be the ratio of increased seats?',
        options: ['2 : 3 : 4', '6 : 7 : 8', '6 : 8 : 9', 'None of these'], correctOptionIndex: 0
    },
    {
        id: 'apt-28', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'If A = x% of y and B = y% of x, then which of the following is true?',
        options: ['A is smaller than B', 'A is greater than B', 'Relationship between A and B cannot be determined', 'None of these'], correctOptionIndex: 3
    },
    {
        id: 'apt-29', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.EASY, points: 5,
        text: '0.0024 / X = 2.4. Value of X is?',
        options: ['0.001', '0.0001', '0.01', '0.1'], correctOptionIndex: 0
    },
    {
        id: 'apt-30', type: QuestionType.MCQ, category: QuestionCategory.APTITUDE, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'What is the value of 1/(1+x^(a-b)) + 1/(1+x^(b-a))?',
        options: ['0', '1', '2', 'x^(a-b)'], correctOptionIndex: 1
    },

    // ============================
    // LOGICAL REASONING (15 Questions)
    // ============================
    {
        id: 'log-1', type: QuestionType.MCQ, category: QuestionCategory.LOGICAL, difficulty: QuestionDifficulty.EASY, points: 5,
        text: 'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?',
        options: ['(1/3)', '(1/8)', '(2/8)', '(1/16)'], correctOptionIndex: 1
    },
    {
        id: 'log-2', type: QuestionType.MCQ, category: QuestionCategory.LOGICAL, difficulty: QuestionDifficulty.EASY, points: 5,
        text: 'Look at this series: 7, 10, 8, 11, 9, 12, ... What number should come next?',
        options: ['7', '10', '12', '13'], correctOptionIndex: 1
    },
    {
        id: 'log-3', type: QuestionType.MCQ, category: QuestionCategory.LOGICAL, difficulty: QuestionDifficulty.EASY, points: 5,
        text: 'Look at this series: 36, 34, 30, 28, 24, ... What number should come next?',
        options: ['20', '22', '23', '26'], correctOptionIndex: 1
    },
    {
        id: 'log-4', type: QuestionType.MCQ, category: QuestionCategory.LOGICAL, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'SCD, TEF, UGH, ____, WKL',
        options: ['CMN', 'UJI', 'VIJ', 'IJT'], correctOptionIndex: 2
    },
    {
        id: 'log-5', type: QuestionType.MCQ, category: QuestionCategory.LOGICAL, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'B2CD, _____, BCD4, B5CD, BC6D',
        options: ['B2C2D', 'BC3D', 'B2C3D', 'BCD7'], correctOptionIndex: 1
    },
    {
        id: 'log-6', type: QuestionType.MCQ, category: QuestionCategory.LOGICAL, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'FAG, GAF, HAI, IAH, ____',
        options: ['JAK', 'HAL', 'HAK', 'JAI'], correctOptionIndex: 0
    },
    {
        id: 'log-7', type: QuestionType.MCQ, category: QuestionCategory.LOGICAL, difficulty: QuestionDifficulty.HARD, points: 5,
        text: 'Pointing to a photograph of a boy Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
        options: ['Brother', 'Uncle', 'Cousin', 'Father'], correctOptionIndex: 3
    },
    {
        id: 'log-8', type: QuestionType.MCQ, category: QuestionCategory.LOGICAL, difficulty: QuestionDifficulty.HARD, points: 5,
        text: 'If A + B means A is the mother of B; A - B means A is the brother B; A % B means A is the father of B and A x B means A is the sister of B, which of the following shows that P is the maternal uncle of Q?',
        options: ['Q - N + M x P', 'P + S x N - Q', 'P - M + N x Q', 'Q - S % P'], correctOptionIndex: 2
    },
    {
        id: 'log-9', type: QuestionType.MCQ, category: QuestionCategory.LOGICAL, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'Statements: Some actors are singers. All the singers are dancers. Conclusions: (1) Some actors are dancers. (2) No singer is actor.',
        options: ['Only (1) follows', 'Only (2) follows', 'Either (1) or (2) follows', 'Neither (1) nor (2) follows'], correctOptionIndex: 0
    },
    {
        id: 'log-10', type: QuestionType.MCQ, category: QuestionCategory.LOGICAL, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'Statements: All the harmoniums are instruments. All the instruments are flutes. Conclusions: (1) All the flutes are instruments. (2) All the harmoniums are flutes.',
        options: ['Only (1) follows', 'Only (2) follows', 'Either (1) or (2) follows', 'Both (1) and (2) follow'], correctOptionIndex: 1
    },
    {
        id: 'log-11', type: QuestionType.MCQ, category: QuestionCategory.LOGICAL, difficulty: QuestionDifficulty.EASY, points: 5,
        text: 'Pick the odd one out.',
        options: ['Just', 'Fair', 'Equitable', 'Biased'], correctOptionIndex: 3
    },
    {
        id: 'log-12', type: QuestionType.MCQ, category: QuestionCategory.LOGICAL, difficulty: QuestionDifficulty.EASY, points: 5,
        text: 'Cup is to Coffee as Bowl is to:',
        options: ['Dish', 'Soup', 'Spoon', 'Food'], correctOptionIndex: 1
    },
    {
        id: 'log-13', type: QuestionType.MCQ, category: QuestionCategory.LOGICAL, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'Odometer is to Mileage as Compass is to:',
        options: ['Speed', 'Hiking', 'Needle', 'Direction'], correctOptionIndex: 3
    },
    {
        id: 'log-14', type: QuestionType.MCQ, category: QuestionCategory.LOGICAL, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'Marathon is to Race as Hibernation is to:',
        options: ['Winter', 'Bear', 'Dream', 'Sleep'], correctOptionIndex: 3
    },
    {
        id: 'log-15', type: QuestionType.MCQ, category: QuestionCategory.LOGICAL, difficulty: QuestionDifficulty.HARD, points: 5,
        text: 'In a certian code "CLOUD" is written as "GTRKF". How is "SIGHT" written in that code?',
        options: ['UGHHT', 'UHJFW', 'WFJGV', 'None of these'], correctOptionIndex: 3
    },

    // ============================
    // VERBAL ABILITY (10 Questions)
    // ============================
    {
        id: 'verb-1', type: QuestionType.MCQ, category: QuestionCategory.VERBAL, difficulty: QuestionDifficulty.EASY, points: 5,
        text: 'Select the synonym of: CANDID',
        options: ['Ambiguous', 'Deceptive', 'Frank', 'Subtle'], correctOptionIndex: 2
    },
    {
        id: 'verb-2', type: QuestionType.MCQ, category: QuestionCategory.VERBAL, difficulty: QuestionDifficulty.EASY, points: 5,
        text: 'Select the antonym of: ENORMOUS',
        options: ['Soft', 'Average', 'Tiny', 'Weak'], correctOptionIndex: 2
    },
    {
        id: 'verb-3', type: QuestionType.MCQ, category: QuestionCategory.VERBAL, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'To keep one\'s temper (Idiom/Phrase meaning)',
        options: ['To become hungry', 'To be in good mood', 'To preserve ones energy', 'To remain calm'], correctOptionIndex: 3
    },
    {
        id: 'verb-4', type: QuestionType.MCQ, category: QuestionCategory.VERBAL, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'To catch a tartar (Idiom/Phrase meaning)',
        options: ['To trap wanted criminal with great difficulty', 'To catch a dangerous person', 'To meet with disaster', 'To deal with a person who is more than one\'s match'], correctOptionIndex: 1
    },
    {
        id: 'verb-5', type: QuestionType.MCQ, category: QuestionCategory.VERBAL, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'Find the correctly spelt word.',
        options: ['Adversity', 'Advercity', 'Advarcity', 'Adversety'], correctOptionIndex: 0
    },
    {
        id: 'verb-6', type: QuestionType.MCQ, category: QuestionCategory.VERBAL, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'A person who renounces the world and practices self-discipline in order to attain salvation:',
        options: ['Sceptic', 'Ascetic', 'Devotee', 'Antiquarian'], correctOptionIndex: 1
    },
    {
        id: 'verb-7', type: QuestionType.MCQ, category: QuestionCategory.VERBAL, difficulty: QuestionDifficulty.HARD, points: 5,
        text: 'Often my friend does not check his work, ________?',
        options: ['don\'t he', 'does he', 'didn\'t he', 'is he'], correctOptionIndex: 1
    },
    {
        id: 'verb-8', type: QuestionType.MCQ, category: QuestionCategory.VERBAL, difficulty: QuestionDifficulty.HARD, points: 5,
        text: 'He was accused _______ stealing.',
        options: ['for', 'on', 'with', 'of'], correctOptionIndex: 3
    },
    {
        id: 'verb-9', type: QuestionType.MCQ, category: QuestionCategory.VERBAL, difficulty: QuestionDifficulty.MEDIUM, points: 5,
        text: 'Extreme old age when a man behaves like a fool',
        options: ['Imbecility', 'Senility', 'Dotage', 'Superannuation'], correctOptionIndex: 2
    },
    {
        id: 'verb-10', type: QuestionType.MCQ, category: QuestionCategory.VERBAL, difficulty: QuestionDifficulty.EASY, points: 5,
        text: 'Select the synonym of: ALERT',
        options: ['Energetic', 'Observant', 'Intelligent', 'Watchful'], correctOptionIndex: 3
    },

    // ============================
    // TECHNICAL (30 Questions)
    // ============================
    {
        id: 'tech-1', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.EASY, points: 10,
        text: 'What does HTML stand for?',
        options: ['Hyper Text Markup Language', 'High Text Markup Language', 'Hyper Tabular Markup Language', 'None of these'], correctOptionIndex: 0
    },
    {
        id: 'tech-2', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.EASY, points: 10,
        text: 'Which HTML tag is used to define an internal style sheet?',
        options: ['<css>', '<script>', '<style>', '<link>'], correctOptionIndex: 2
    },
    {
        id: 'tech-3', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.EASY, points: 10,
        text: 'What is the correct syntax for referring to an external script called "app.js"?',
        options: ['<script name="app.js">', '<script href="app.js">', '<script src="app.js">', '<script file="app.js">'], correctOptionIndex: 2
    },
    {
        id: 'tech-4', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.MEDIUM, points: 10,
        text: 'How do you create a function in JavaScript?',
        options: ['function:myFunction()', 'function myFunction()', 'function = myFunction()', 'myFunction(): function'], correctOptionIndex: 1
    },
    {
        id: 'tech-5', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.MEDIUM, points: 10,
        text: 'Which built-in method adds one or more elements to the end of an array and returns the new length?',
        options: ['last()', 'put()', 'push()', 'pop()'], correctOptionIndex: 2
    },
    {
        id: 'tech-6', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.MEDIUM, points: 10,
        text: 'Which event occurs when the user clicks on an HTML element?',
        options: ['onchange', 'onmouseclick', 'onmouseover', 'onclick'], correctOptionIndex: 3
    },
    {
        id: 'tech-7', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.HARD, points: 10,
        text: 'What is the "closure" in JavaScript?',
        options: ['A function having access to the parent scope, even after the parent function has closed', 'A way to lock a variable', 'A database connection closer', 'None of these'], correctOptionIndex: 0
    },
    {
        id: 'tech-8', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.HARD, points: 10,
        text: 'What will be the output of: console.log(typeof NaN)?',
        options: ['"NaN"', '"number"', '"undefined"', '"object"'], correctOptionIndex: 1
    },
    {
        id: 'tech-9', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.MEDIUM, points: 10,
        text: 'Which CSS property controls the text size?',
        options: ['font-style', 'text-size', 'font-size', 'text-style'], correctOptionIndex: 2
    },
    {
        id: 'tech-10', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.EASY, points: 10,
        text: 'Which CSS property is used to change the background color?',
        options: ['background-color', 'color', 'bgcolor', 'bg-color'], correctOptionIndex: 0
    },
    {
        id: 'tech-11', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.MEDIUM, points: 10,
        text: 'In React, what is the use of useEffect hook?',
        options: ['To manage state', 'To perform side effects', 'To create context', 'To optimize rendering'], correctOptionIndex: 1
    },
    {
        id: 'tech-12', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.HARD, points: 10,
        text: 'Which of the following is NOT a React Hook?',
        options: ['useReducer', 'useState', 'useClass', 'useMemo'], correctOptionIndex: 2
    },
    {
        id: 'tech-13', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.MEDIUM, points: 10,
        text: 'What is the virtual DOM in React?',
        options: ['A direct copy of the real DOM', 'A lightweight copy of the DOM kept in memory', 'A database inside the browser', 'A Chrome extension'], correctOptionIndex: 1
    },
    {
        id: 'tech-14', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.EASY, points: 10,
        text: 'What command is used to install packages in Node.js?',
        options: ['node install', 'npm install', 'apt-get install', 'pip install'], correctOptionIndex: 1
    },
    {
        id: 'tech-15', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.MEDIUM, points: 10,
        text: 'Which SQL statement is used to extract data from a database?',
        options: ['EXTRACT', 'GET', 'OPEN', 'SELECT'], correctOptionIndex: 3
    },
    {
        id: 'tech-16', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.MEDIUM, points: 10,
        text: 'Which SQL statement is used to update data in a database?',
        options: ['SAVE', 'MODIFY', 'UPDATE', 'SAVE AS'], correctOptionIndex: 2
    },
    {
        id: 'tech-17', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.MEDIUM, points: 10,
        text: 'Which SQL statement is used to delete data from a database?',
        options: ['REMOVE', 'DELETE', 'COLLAPSE', 'DROP'], correctOptionIndex: 1
    },
    {
        id: 'tech-18', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.HARD, points: 10,
        text: 'Explain the concept of "Prop Drilling" in React.',
        options: ['Passing props from parent to child only', 'Passing data through too many layers of components', 'Drilling holes in harddrives', 'Creating new properties dynamically'], correctOptionIndex: 1
    },
    {
        id: 'tech-19', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.MEDIUM, points: 10,
        text: 'What is the difference between "==" and "===" in JavaScript?',
        options: ['No difference', '"==" checks value, "===" checks value and type', '"==" checks type, "===" checks value', '"===" is for assignment'], correctOptionIndex: 1
    },
    {
        id: 'tech-20', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.EASY, points: 10,
        text: 'What does JSON stand for?',
        options: ['JavaScript Object Notation', 'Java Standard Object Network', 'JavaScript On Network', 'None of these'], correctOptionIndex: 0
    },
    {
        id: 'tech-21', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.HARD, points: 10,
        text: 'In Node.js, which module is used for file operations?',
        options: ['http', 'fs', 'path', 'os'], correctOptionIndex: 1
    },
    {
        id: 'tech-22', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.MEDIUM, points: 10,
        text: 'Which HTTP method is idempotent?',
        options: ['POST', 'PUT', 'PATCH', 'CONNECT'], correctOptionIndex: 1
    },
    {
        id: 'tech-23', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.MEDIUM, points: 10,
        text: 'What status code indicates "Not Found"?',
        options: ['200', '403', '500', '404'], correctOptionIndex: 3
    },
    {
        id: 'tech-24', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.MEDIUM, points: 10,
        text: 'What is CORS?',
        options: ['Cross-Origin Resource Sharing', 'Computer Operating Resource System', 'Central Organization for Resource Security', 'None of these'], correctOptionIndex: 0
    },
    {
        id: 'tech-25', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.HARD, points: 10,
        text: 'Which data structure uses LIFO?',
        options: ['Queue', 'Array', 'Stack', 'Tree'], correctOptionIndex: 2
    },
    {
        id: 'tech-26', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.MEDIUM, points: 10,
        text: 'What is the time complexity of looking up a value in a Hash Map?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n^2)'], correctOptionIndex: 2
    },
    {
        id: 'tech-27', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.EASY, points: 10,
        text: 'What is git?',
        options: ['A programming language', 'A standard format for documents', 'A version control system', 'A database'], correctOptionIndex: 2
    },
    {
        id: 'tech-28', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.MEDIUM, points: 10,
        text: 'Which command creates a new branch in git?',
        options: ['git checkout -b', 'git branch -new', 'git create branch', 'git switch -c'], correctOptionIndex: 0
    },
    {
        id: 'tech-29', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.HARD, points: 10,
        text: 'In Python, which keyword is used to handle exceptions?',
        options: ['catch', 'except', 'try', 'error'], correctOptionIndex: 1
    },
    {
        id: 'tech-30', type: QuestionType.MCQ, category: QuestionCategory.TECHNICAL, difficulty: QuestionDifficulty.MEDIUM, points: 10,
        text: 'What is the default port for HTTP?',
        options: ['21', '80', '443', '8080'], correctOptionIndex: 1
    },

    // ============================
    // CODING (2 Questions)
    // ============================
    {
        id: 'code-1', type: QuestionType.CODING, category: QuestionCategory.CODING, difficulty: QuestionDifficulty.MEDIUM, points: 20,
        text: 'Write a function `isPalindrome(str)` that checks if a given string is a palindrome (reads the same forwards and backwards). Ignore case and non-alphanumeric characters.',
        codeTemplate: 'function isPalindrome(str) {\n  // Your code here\n  // Return true or false\n}',
    },
    {
        id: 'code-2', type: QuestionType.CODING, category: QuestionCategory.CODING, difficulty: QuestionDifficulty.HARD, points: 30,
        text: 'Write a function `fibonacci(n)` that returns the nth number in the Fibonacci sequence. The sequence starts with 0, 1. Example: n=0 -> 0, n=1 -> 1, n=2 -> 1, n=3 -> 2, n=4 -> 3.',
        codeTemplate: 'function fibonacci(n) {\n  // Your code here\n  // Return the nth number\n}',
    }
];
