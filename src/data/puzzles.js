/**
 * The "guess the output" puzzles for the hero terminal (guess.cpp). Kept here as
 * the single source of truth so both the widget (CodeTerminal) and the backend
 * seed script can read the same list. Each puzzle: `code` (the snippet, may span
 * lines), three `options`, the index of the right one (`answer`), and a short
 * `note`. Every output is verified and unambiguous (no UB) — exactly one answer.
 *
 * At runtime CodeTerminal loads puzzles from the API and falls back to this list
 * when the backend is unreachable, so the game always works.
 */
export const PUZZLES = [
  {
    code: 'cout << 7 / 2 << " " << 7 % 2;',
    options: ['3 1', '3.5 1', '3 0'],
    answer: 0,
    note: 'Integer division truncates: 7/2 = 3, 7%2 = 1.',
  },
  {
    code: "char c = 'A';\ncout << (int)c << char(c + 1);",
    options: ['AB', '65B', '66B'],
    answer: 1,
    note: "'A' is 65; c + 1 promotes then prints as 'B'.",
  },
  {
    code: 'vector<int> v = {3, 1, 2};\nsort(v.begin(), v.end());\ncout << v[0] << v[1] << v[2];',
    options: ['321', '132', '123'],
    answer: 2,
    note: 'sort() orders ascending → 1, 2, 3.',
  },
  {
    code: 'cout << (1 << 4);',
    options: ['8', '16', '14'],
    answer: 1,
    note: '1 shifted left 4 bits = 2⁴ = 16.',
  },
  {
    code: "map<char,int> m;\nm['a']++;\ncout << m['a'] << m['b'];",
    options: ['10', '11', '1'],
    answer: 0,
    note: "operator[] default-inserts 0, so m['b'] is 0.",
  },
  {
    code: 'int n = 10;\ncout << (n & 1 ? "odd" : "even");',
    options: ['odd', 'even', '0'],
    answer: 1,
    note: '10 & 1 = 0 → the "even" branch.',
  },
  {
    code: 'cout << 5 / 2.0;',
    options: ['2', '2.50000', '2.5'],
    answer: 2,
    note: 'One double operand → floating division; default prints 2.5.',
  },
  {
    code: 'cout << 2 + 3 * 4;',
    options: ['20', '14', '24'],
    answer: 1,
    note: 'Multiplication binds before addition: 3*4 = 12, +2 = 14.',
  },
  {
    code: 'int a = 5;\ncout << a++;\ncout << a;',
    options: ['56', '66', '55'],
    answer: 0,
    note: 'a++ yields the old value 5; the next line sees a = 6.',
  },
  {
    code: "cout << 'A' + 1;",
    options: ['66', 'B', '65'],
    answer: 0,
    note: "'A' (65) + 1 stays an int, so it prints 66.",
  },
  {
    code: "cout << char('Z' - 1);",
    options: ['89', 'Z', 'Y'],
    answer: 2,
    note: "'Z' is 90; char(90 - 1) is 'Y'.",
  },
  {
    code: 'string s = "hello";\ncout << s.size();',
    options: ['4', '5', '6'],
    answer: 1,
    note: 'size() counts the 5 letters in "hello".',
  },
  {
    code: 'cout << (3 > 2);',
    options: ['1', 'true', '0'],
    answer: 0,
    note: 'Without boolalpha a true bool prints as 1.',
  },
  {
    code: 'cout << boolalpha << (2 > 3);',
    options: ['false', '0', 'true'],
    answer: 0,
    note: 'boolalpha prints bools as words; 2 > 3 is false.',
  },
  {
    code: 'cout << 17 / 5;',
    options: ['3.4', '2', '3'],
    answer: 2,
    note: 'Integer division drops the remainder: 17/5 = 3.',
  },
  {
    code: 'int x = 8;\ncout << (x >> 1);',
    options: ['16', '4', '7'],
    answer: 1,
    note: '>> 1 halves the value: 8 becomes 4.',
  },
  {
    code: 'cout << (5 & 3);',
    options: ['1', '7', '8'],
    answer: 0,
    note: '5 & 3 = 101 & 011 = 001 = 1.',
  },
  {
    code: 'cout << (5 | 2);',
    options: ['5', '10', '7'],
    answer: 2,
    note: '5 | 2 = 101 | 010 = 111 = 7.',
  },
  {
    code: 'cout << (6 ^ 3);',
    options: ['9', '5', '2'],
    answer: 1,
    note: '6 ^ 3 = 110 ^ 011 = 101 = 5.',
  },
  {
    code: 'set<int> s = {3, 1, 2, 1};\ncout << s.size();',
    options: ['3', '4', '2'],
    answer: 0,
    note: 'A set drops duplicates, so {3,1,2,1} has size 3.',
  },
  {
    code: 'set<int> s = {5, 3, 1, 4};\ncout << *s.begin();',
    options: ['5', '1', '3'],
    answer: 1,
    note: 'A set stays sorted; *begin() is the smallest, 1.',
  },
  {
    code: 'cout << max(3, 7);',
    options: ['3', '10', '7'],
    answer: 2,
    note: 'max() returns the larger value, 7.',
  },
  {
    code: 'cout << min(9, 4);',
    options: ['9', '4', '5'],
    answer: 1,
    note: 'min() returns the smaller value, 4.',
  },
  {
    code: 'cout << abs(-8);',
    options: ['8', '-8', '0'],
    answer: 0,
    note: 'abs() gives the magnitude: |-8| = 8.',
  },
  {
    code: 'string s = "ab";\ns += "cd";\ncout << s;',
    options: ['ab', 'cd', 'abcd'],
    answer: 2,
    note: '+= appends "cd" to "ab", giving "abcd".',
  },
  {
    code: 'cout << (7 % 2 == 0 ? "yes" : "no");',
    options: ['no', 'yes', '1'],
    answer: 0,
    note: '7 % 2 is 1 (not 0), so the ternary picks "no".',
  },
  {
    code: 'int arr[] = {10, 20, 30};\ncout << arr[1];',
    options: ['10', '20', '30'],
    answer: 1,
    note: 'Arrays are 0-indexed: arr[1] is the second value, 20.',
  },
  {
    code: 'cout << 3 + 4 << "!";',
    options: ['34!', '7', '7!'],
    answer: 2,
    note: '+ binds tighter than <<, so 3 + 4 prints as 7.',
  },
  {
    code: 'cout << 10 / 4 * 4;',
    options: ['10', '8', '9'],
    answer: 1,
    note: 'All integer, left to right: 10/4 = 2, then 2*4 = 8.',
  },
  {
    code: 'cout << (1 == 1) + (2 == 3);',
    options: ['1', '2', '0'],
    answer: 0,
    note: '1==1 is 1, 2==3 is 0; their sum is 1.',
  },
  {
    code: 'int x = 15;\nx %= 4;\ncout << x;',
    options: ['2', '4', '3'],
    answer: 2,
    note: '%= stores the remainder: 15 % 4 = 3.',
  },
  {
    code: "cout << string(3, 'x');",
    options: ['x3', 'xxx', 'xxxx'],
    answer: 1,
    note: 'string(n, ch) repeats the char n times → "xxx".',
  },
  {
    code: 'vector<int> v = {1, 2, 3};\nv.push_back(4);\ncout << v.size();',
    options: ['3', '5', '4'],
    answer: 2,
    note: 'push_back adds one element, so size becomes 4.',
  },
  {
    code: 'cout << (true && false);',
    options: ['0', '1', 'false'],
    answer: 0,
    note: 'true && false is false, which prints as 0.',
  },
  {
    code: 'cout << (true || false);',
    options: ['1', '0', 'true'],
    answer: 0,
    note: 'true || false is true, which prints as 1.',
  },

  // ---- STL & competitive-programming toolkit ----
  // The "magic" functions CP relies on: builtins, binary search, heaps,
  // permutations, prefix sums. Every output verified and unambiguous.
  {
    code: 'cout << __builtin_popcount(11);',
    options: ['2', '3', '4'],
    answer: 1,
    note: '11 = 1011 in binary → 3 set bits.',
  },
  {
    code: 'cout << __gcd(12, 18);',
    options: ['6', '3', '36'],
    answer: 0,
    note: '__gcd returns the greatest common divisor: gcd(12,18) = 6.',
  },
  {
    code: 'cout << __builtin_popcount(1 << 5);',
    options: ['1', '5', '32'],
    answer: 0,
    note: '1 << 5 = 32 = 100000, which has exactly one set bit.',
  },
  {
    code: 'cout << __builtin_popcount(255);',
    options: ['8', '7', '255'],
    answer: 0,
    note: '255 = 11111111 → all 8 bits set.',
  },
  {
    code: 'vector<int> v = {1, 2, 3};\nnext_permutation(v.begin(), v.end());\ncout << v[0] << v[1] << v[2];',
    options: ['132', '123', '213'],
    answer: 0,
    note: 'The next lexicographic permutation after 123 is 132.',
  },
  {
    code: 'vector<int> v = {1, 3, 5, 7};\ncout << (lower_bound(v.begin(), v.end(), 5) - v.begin());',
    options: ['1', '2', '3'],
    answer: 1,
    note: 'lower_bound finds the first element ≥ 5 → index 2.',
  },
  {
    code: 'vector<int> v = {1, 3, 5, 5, 7};\ncout << (upper_bound(v.begin(), v.end(), 5) - v.begin());',
    options: ['2', '4', '3'],
    answer: 1,
    note: 'upper_bound finds the first element > 5 (the 7) → index 4.',
  },
  {
    code: 'vector<int> v = {1, 3, 5, 7};\ncout << binary_search(v.begin(), v.end(), 4);',
    options: ['1', '0', '4'],
    answer: 1,
    note: '4 is not in the sorted vector, so binary_search returns false → 0.',
  },
  {
    code: 'vector<int> v = {1, 2, 3, 4};\ncout << accumulate(v.begin(), v.end(), 0);',
    options: ['10', '24', '0'],
    answer: 0,
    note: 'accumulate sums from the seed 0: 0+1+2+3+4 = 10.',
  },
  {
    code: 'priority_queue<int> pq;\npq.push(3); pq.push(1); pq.push(4);\ncout << pq.top();',
    options: ['1', '4', '3'],
    answer: 1,
    note: 'A priority_queue is a max-heap by default, so top() is the largest, 4.',
  },
  {
    code: 'priority_queue<int, vector<int>, greater<int>> pq;\npq.push(3); pq.push(1); pq.push(4);\ncout << pq.top();',
    options: ['4', '1', '3'],
    answer: 1,
    note: 'greater<int> makes a min-heap, so top() is the smallest, 1.',
  },
  {
    code: 'vector<int> v = {2, 4, 1};\nsort(v.begin(), v.end(), greater<int>());\ncout << v[0] << v[1] << v[2];',
    options: ['124', '421', '142'],
    answer: 1,
    note: 'greater<int> sorts descending → 4, 2, 1.',
  },
  {
    code: 'vector<int> v = {1, 1, 2, 3, 3};\nv.erase(unique(v.begin(), v.end()), v.end());\ncout << v.size();',
    options: ['5', '3', '2'],
    answer: 1,
    note: 'unique collapses adjacent duplicates; erase drops the tail → {1,2,3}, size 3.',
  },
  {
    code: 'vector<int> v = {1, 2, 2, 3, 2};\ncout << count(v.begin(), v.end(), 2);',
    options: ['2', '3', '1'],
    answer: 1,
    note: 'count tallies every element equal to 2 → three of them.',
  },
  {
    code: 'vector<int> v = {4, 9, 2, 7};\ncout << *max_element(v.begin(), v.end());',
    options: ['9', '7', '2'],
    answer: 0,
    note: 'max_element returns an iterator to the largest value; dereferenced → 9.',
  },
  {
    code: 'cout << min({4, 2, 7, 1});',
    options: ['1', '2', '7'],
    answer: 0,
    note: 'min over an initializer list scans them all → 1.',
  },
  {
    code: 'int a = 4, b = 6;\ncout << a * b / __gcd(a, b);',
    options: ['12', '24', '2'],
    answer: 0,
    note: 'LCM = a·b / gcd: 24 / 2 = 12.',
  },
  {
    code: 'cout << bitset<4>(5);',
    options: ['0101', '101', '5'],
    answer: 0,
    note: 'bitset<4> prints 5 as a fixed 4-bit string → 0101.',
  },
  {
    code: 'map<int,int> m;\nm[3] = 1; m[1] = 1; m[2] = 1;\ncout << m.begin()->first;',
    options: ['3', '1', '2'],
    answer: 1,
    note: 'std::map keeps keys sorted, so begin() is the smallest key, 1.',
  },
  {
    code: 'string s = "competitive";\ncout << s.substr(0, 4);',
    options: ['comp', 'ompe', 'competi'],
    answer: 0,
    note: 'substr(0, 4) takes 4 characters from index 0 → "comp".',
  },
]

// Option labels (a, b, c, … f). Puzzles allow 2–6 options.
export const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f']
