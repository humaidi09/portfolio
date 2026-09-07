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

  // ---- Codeforces-style logic (basic → advanced) ----
  // Each snippet is one core CP/DSA idea: read it, trace it, guess the output.
  // Every output is hand-verified and unambiguous (no UB), exactly one answer.
  // `difficulty` is metadata (easy | medium | hard).

  // number / math
  {
    code: `int n = 1234, r = 0;
while (n) { r = r * 10 + n % 10; n /= 10; }
cout << r;`,
    options: ['1234', '4321', '12'],
    answer: 1,
    note: 'Peeling digits with %10 and rebuilding reverses 1234 → 4321.',
    difficulty: 'easy',
  },
  {
    code: `int n = 9875, s = 0;
while (n) { s += n % 10; n /= 10; }
cout << s;`,
    options: ['24', '29', '32'],
    answer: 1,
    note: 'Summing the digits of 9875: 9+8+7+5 = 29.',
    difficulty: 'easy',
  },
  {
    code: `int a = 48, b = 36;
while (b) { int t = b; b = a % b; a = t; }
cout << a;`,
    options: ['6', '12', '4'],
    answer: 1,
    note: "Euclid's algorithm: gcd(48, 36) = 12.",
    difficulty: 'easy',
  },
  {
    code: `int a = 0, b = 1;
for (int i = 0; i < 7; i++) { int c = a + b; a = b; b = c; }
cout << a;`,
    options: ['8', '13', '21'],
    answer: 1,
    note: 'The loop runs the Fibonacci recurrence 7 times → F(7) = 13.',
    difficulty: 'medium',
  },
  {
    code: `long long f = 1;
for (int i = 1; i <= 10; i++) f *= i;
cout << f;`,
    options: ['362880', '3628800', '40320'],
    answer: 1,
    note: '10! = 3628800 (needs long long; int overflows past 12!).',
    difficulty: 'easy',
  },
  {
    code: `int n = 100;
cout << n * (n + 1) / 2;`,
    options: ['5050', '5000', '10100'],
    answer: 0,
    note: '1..n sum in O(1): n(n+1)/2 = 5050.',
    difficulty: 'easy',
  },
  {
    code: `int n = 12345, cnt = 0;
while (n) { cnt++; n /= 10; }
cout << cnt;`,
    options: ['5', '4', '6'],
    answer: 0,
    note: 'Dividing by 10 until zero counts the 5 digits.',
    difficulty: 'easy',
  },
  {
    code: `int n = 7;
cout << (n * (n - 1) / 2) % 2;`,
    options: ['1', '0', '21'],
    answer: 0,
    note: 'C(7,2) = 21, which is odd → 1.',
    difficulty: 'medium',
  },
  {
    code: `int n = 36, cnt = 0;
for (int i = 1; i * i <= n; i++)
    if (n % i == 0) cnt += (i * i == n) ? 1 : 2;
cout << cnt;`,
    options: ['9', '8', '6'],
    answer: 0,
    note: 'Looping to √n and counting factors in pairs → 36 has 9 divisors.',
    difficulty: 'medium',
  },
  {
    code: `long long x = 1;
for (int i = 0; i < 10; i++) x = x * 2 % 7;
cout << x;`,
    options: ['2', '4', '1'],
    answer: 0,
    note: 'Taking mod each step avoids overflow: 2^10 mod 7 = 2.',
    difficulty: 'hard',
  },
  {
    code: `int n = 6, x = 0;
for (int i = 1; i <= n; i++) x ^= i;
cout << x;`,
    options: ['7', '0', '6'],
    answer: 0,
    note: '1^2^…^6 = 7 (prefix XOR of 1..n has a period-4 pattern).',
    difficulty: 'medium',
  },
  {
    code: `int n = 9875;
while (n >= 10) {
    int s = 0;
    while (n) { s += n % 10; n /= 10; }
    n = s;
}
cout << n;`,
    options: ['2', '29', '5'],
    answer: 0,
    note: 'Repeated digit sums (digital root): 9875 → 29 → 11 → 2.',
    difficulty: 'hard',
  },
  {
    code: `int n = 20, steps = 0;
while (n > 1) { n = (n % 2 == 0) ? n / 2 : n - 1; steps++; }
cout << steps;`,
    options: ['5', '4', '6'],
    answer: 0,
    note: 'Halve if even, else subtract 1: 20→10→5→4→2→1 = 5 steps.',
    difficulty: 'medium',
  },
  {
    code: `int n = 121, r = 0, t = n;
while (t) { r = r * 10 + t % 10; t /= 10; }
cout << (r == n ? "yes" : "no");`,
    options: ['yes', 'no', '121'],
    answer: 0,
    note: 'Reversed 121 equals the original → "yes" (palindrome number).',
    difficulty: 'medium',
  },
  {
    code: `int n = 25, z = 0;
for (int p = 5; p <= n; p *= 5) z += n / p;
cout << z;`,
    options: ['6', '5', '4'],
    answer: 0,
    note: 'Trailing zeros of n! = ⌊n/5⌋+⌊n/25⌋+… = 5+1 = 6.',
    difficulty: 'hard',
  },
  {
    code: `int n = 100, k = 7;
cout << n / k;`,
    options: ['14', '15', '7'],
    answer: 0,
    note: 'Multiples of 7 in 1..100 = ⌊100/7⌋ = 14.',
    difficulty: 'easy',
  },
  {
    code: `int n = 5, s = 0;
for (int i = 1; i <= n; i++) s += 2 * i;
cout << s;`,
    options: ['30', '25', '20'],
    answer: 0,
    note: 'Sum of the first 5 even numbers = n(n+1) = 30.',
    difficulty: 'medium',
  },
  {
    code: `int a = 5, b = 8;
cout << ((a + b) % 2 == 0 ? "same" : "diff");`,
    options: ['diff', 'same', '13'],
    answer: 0,
    note: 'Equal parity ⇔ sum is even; 5+8 = 13 is odd → "diff".',
    difficulty: 'easy',
  },
  {
    code: `int l = 3, r = 7;
cout << (l + r) * (r - l + 1) / 2;`,
    options: ['25', '28', '21'],
    answer: 0,
    note: 'Range sum = (first+last)·count/2 = (3+7)·5/2 = 25.',
    difficulty: 'medium',
  },
  {
    code: `int last = 1;
for (int i = 0; i < 20; i++) last = last * 3 % 10;
cout << last;`,
    options: ['1', '3', '9'],
    answer: 0,
    note: 'Only the last digit matters (keep %10): 3^20 ends in 1.',
    difficulty: 'medium',
  },
  {
    code: `int n = 50, x = 0;
while ((x + 1) * (x + 1) <= n) x++;
cout << x;`,
    options: ['7', '8', '25'],
    answer: 0,
    note: 'Grow x while x² ≤ n → ⌊√50⌋ = 7 (integer sqrt, no floats).',
    difficulty: 'medium',
  },
  {
    code: `int a[] = {12, 18, 24}, g = a[0];
for (int i = 1; i < 3; i++) g = __gcd(g, a[i]);
cout << g;`,
    options: ['6', '2', '12'],
    answer: 0,
    note: 'Folding __gcd across the array → gcd(12,18,24) = 6.',
    difficulty: 'medium',
  },

  // arrays / strings / data structures
  {
    code: `map<char,int> f;
for (char c : string("banana")) f[c]++;
cout << f['a'] << f['n'] << f['b'];`,
    options: ['312', '321', '231'],
    answer: 1,
    note: 'In "banana": a×3, n×2, b×1 → "321".',
    difficulty: 'medium',
  },
  {
    code: `int a[] = {2, 4, 6, 8}, p[5] = {0};
for (int i = 0; i < 4; i++) p[i + 1] = p[i] + a[i];
cout << p[3] - p[1];`,
    options: ['12', '10', '18'],
    answer: 1,
    note: 'Prefix sums give range sums in O(1): p[3]-p[1] = 10.',
    difficulty: 'medium',
  },
  {
    code: `vector<int> v = {3, 7, 2, 7};
cout << max_element(v.begin(), v.end()) - v.begin();`,
    options: ['1', '3', '7'],
    answer: 0,
    note: 'Subtracting begin() gives the index of the first max → 1.',
    difficulty: 'easy',
  },
  {
    code: `int a[] = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
int best = a[0], cur = a[0];
for (int i = 1; i < 9; i++) { cur = max(a[i], cur + a[i]); best = max(best, cur); }
cout << best;`,
    options: ['4', '6', '7'],
    answer: 1,
    note: "Kadane's maximum subarray sum = [4,-1,2,1] = 6.",
    difficulty: 'hard',
  },
  {
    code: `int a[] = {1, 3, 4, 6, 8, 9}, target = 10;
int i = 0, j = 5, cnt = 0;
while (i < j) {
    int s = a[i] + a[j];
    if (s == target) { cnt++; i++; j--; }
    else if (s < target) i++;
    else j--;
}
cout << cnt;`,
    options: ['2', '3', '1'],
    answer: 0,
    note: 'Two pointers from both ends count pairs summing to 10 → 2.',
    difficulty: 'medium',
  },
  {
    code: `int a[] = {2, 1, 5, 1, 3, 2};
int sum = 0;
for (int i = 0; i < 3; i++) sum += a[i];
int best = sum;
for (int i = 3; i < 6; i++) {
    sum += a[i] - a[i - 3];
    best = max(best, sum);
}
cout << best;`,
    options: ['9', '8', '11'],
    answer: 0,
    note: 'Slide the size-3 window (add new, drop old): max sum = 9.',
    difficulty: 'medium',
  },
  {
    code: `int a[] = {1, 3, 5, 7, 9, 11}, target = 7;
int lo = 0, hi = 5, ans = -1;
while (lo <= hi) {
    int mid = (lo + hi) / 2;
    if (a[mid] == target) { ans = mid; break; }
    else if (a[mid] < target) lo = mid + 1;
    else hi = mid - 1;
}
cout << ans;`,
    options: ['3', '4', '-1'],
    answer: 0,
    note: 'Binary search halves the range; 7 sits at index 3.',
    difficulty: 'medium',
  },
  {
    code: `int diff[6] = {0};
diff[1] += 5; diff[4] -= 5;
int a[6], run = 0;
for (int i = 0; i < 6; i++) { run += diff[i]; a[i] = run; }
cout << a[0] << a[2] << a[5];`,
    options: ['050', '555', '505'],
    answer: 0,
    note: 'Difference array + prefix sum applies a range +5 to [1,3] only.',
    difficulty: 'hard',
  },
  {
    code: `int a[] = {2, 1, 4, 3};
stack<int> st;
int ng[4];
for (int i = 3; i >= 0; i--) {
    while (!st.empty() && st.top() <= a[i]) st.pop();
    ng[i] = st.empty() ? -1 : st.top();
    st.push(a[i]);
}
cout << ng[0] << " " << ng[1] << " " << ng[2] << " " << ng[3];`,
    options: ['4 4 -1 -1', '4 4 3 -1', '-1 4 -1 -1'],
    answer: 0,
    note: 'A monotonic stack finds each next-greater element in O(n).',
    difficulty: 'hard',
  },
  {
    code: `long long res = 1, base = 3;
int exp = 5;
while (exp) {
    if (exp & 1) res *= base;
    base *= base;
    exp >>= 1;
}
cout << res;`,
    options: ['243', '125', '15'],
    answer: 0,
    note: 'Binary exponentiation: 3^5 = 243 in O(log n).',
    difficulty: 'hard',
  },
  {
    code: `int coins[] = {1, 2, 5}, target = 5;
int dp[6] = {0}; dp[0] = 1;
for (int c : coins)
    for (int x = c; x <= target; x++)
        dp[x] += dp[x - c];
cout << dp[target];`,
    options: ['4', '3', '5'],
    answer: 0,
    note: 'Coin-change DP counts combinations: 5 from {1,2,5} → 4 ways.',
    difficulty: 'hard',
  },
  {
    code: `int coins[] = {25, 10, 5, 1}, amount = 63, cnt = 0;
for (int c : coins) { cnt += amount / c; amount %= c; }
cout << cnt;`,
    options: ['6', '7', '5'],
    answer: 0,
    note: 'Greedy largest-first: 63¢ = 25·2 + 10 + 1·3 = 6 coins.',
    difficulty: 'medium',
  },
  {
    code: `string s = "abccba";
bool ok = true;
for (int i = 0; i < s.size() / 2; i++)
    if (s[i] != s[s.size() - 1 - i]) ok = false;
cout << ok;`,
    options: ['1', '0', '6'],
    answer: 0,
    note: 'Two-pointer palindrome check on "abccba" → true = 1.',
    difficulty: 'medium',
  },
  {
    code: `int a[] = {1, 2, 3, 4, 5}, med = a[2], moves = 0;
for (int i = 0; i < 5; i++) moves += abs(a[i] - med);
cout << moves;`,
    options: ['6', '10', '4'],
    answer: 0,
    note: 'Making all values equal costs least at the median: total = 6.',
    difficulty: 'hard',
  },
  {
    code: `int a[] = {1, 2, 1, 3, 4, 5}, len = 1, best = 1;
for (int i = 1; i < 6; i++) {
    if (a[i] > a[i - 1]) len++; else len = 1;
    best = max(best, len);
}
cout << best;`,
    options: ['4', '5', '3'],
    answer: 0,
    note: 'Longest increasing consecutive run [1,3,4,5] = 4.',
    difficulty: 'medium',
  },
  {
    code: `string s = "aaabbaa";
int cur = 1, best = 1;
for (int i = 1; i < s.size(); i++) {
    cur = (s[i] == s[i - 1]) ? cur + 1 : 1;
    best = max(best, cur);
}
cout << best;`,
    options: ['3', '2', '7'],
    answer: 0,
    note: 'Longest run of one character: "aaa" = 3.',
    difficulty: 'medium',
  },
  {
    code: `int a[3][3] = {{1,2,3},{4,5,6},{7,8,9}};
int s = 0;
for (int i = 0; i < 3; i++) s += a[i][i];
cout << s;`,
    options: ['15', '45', '12'],
    answer: 0,
    note: 'Main diagonal a[i][i] = 1+5+9 = 15.',
    difficulty: 'easy',
  },
  {
    code: `int a[] = {3, 7, 2, 9, 5}, mn = a[0], mx = a[0];
for (int i = 1; i < 5; i++) { mn = min(mn, a[i]); mx = max(mx, a[i]); }
cout << mx - mn;`,
    options: ['7', '9', '11'],
    answer: 0,
    note: 'Many problems reduce to the range: max−min = 9−2 = 7.',
    difficulty: 'easy',
  },
  {
    code: `int n = 7;
cout << (n % 2 ? "first" : "second");`,
    options: ['first', 'second', '7'],
    answer: 0,
    note: 'Outcome depends only on parity; 7 is odd → "first".',
    difficulty: 'easy',
  },
  {
    code: `int n = 10;
cout << ((n * (n + 1) / 2) % 2 == 0 ? "yes" : "no");`,
    options: ['no', 'yes', '55'],
    answer: 0,
    note: 'Splittable ⇔ 1..n sum is even; 55 is odd → "no".',
    difficulty: 'medium',
  },
  {
    code: `int a[] = {1, 2, 3, 4}, target = 5, cnt = 0;
for (int i = 0; i < 4; i++)
    for (int j = i + 1; j < 4; j++)
        if (a[i] + a[j] == target) cnt++;
cout << cnt;`,
    options: ['2', '1', '3'],
    answer: 0,
    note: 'Brute force over all pairs: two of them sum to 5.',
    difficulty: 'medium',
  },
  {
    code: `int a[] = {1, 2, 3}, cnt = 0;
for (int mask = 0; mask < 8; mask++) {
    int s = 0;
    for (int i = 0; i < 3; i++) if (mask & (1 << i)) s += a[i];
    if (s % 2 == 0) cnt++;
}
cout << cnt;`,
    options: ['4', '3', '8'],
    answer: 0,
    note: 'Enumerating all 2³ subsets, 4 have an even sum.',
    difficulty: 'medium',
  },
  {
    code: `int a[] = {2, 3, 5, 1}, best = 0;
for (int i = 0; i < 4; i++)
    for (int j = i + 1; j < 4; j++)
        best = max(best, a[i] * a[j]);
cout << best;`,
    options: ['15', '10', '6'],
    answer: 0,
    note: 'Largest pair product among {2,3,5,1} = 3·5 = 15.',
    difficulty: 'easy',
  },
  {
    code: `int a[] = {4, 1, 7, 3, 9}, k = 2, s = 0;
sort(a, a + 5, greater<int>());
for (int i = 0; i < k; i++) s += a[i];
cout << s;`,
    options: ['16', '13', '20'],
    answer: 0,
    note: 'Greedy: sort descending and take the top 2 → 9+7 = 16.',
    difficulty: 'easy',
  },
  {
    code: `int a[] = {2, 3, 1, 1, 4}, reach = 0, i = 0;
while (i <= reach && reach < 4) { reach = max(reach, i + a[i]); i++; }
cout << (reach >= 4 ? "yes" : "no");`,
    options: ['yes', 'no', '4'],
    answer: 0,
    note: 'Track the farthest reachable index; the end is reachable → "yes".',
    difficulty: 'medium',
  },
  {
    code: `int dp[6]; dp[0] = 1; dp[1] = 1;
for (int i = 2; i <= 5; i++) dp[i] = dp[i - 1] + dp[i - 2];
cout << dp[5];`,
    options: ['8', '5', '13'],
    answer: 0,
    note: 'Ways to climb (1 or 2 steps) = Fibonacci: 5 stairs → 8.',
    difficulty: 'medium',
  },
  {
    code: `int a[] = {3, 2, 5, 10, 7}, take = 0, skip = 0;
for (int x : a) { int nt = skip + x; skip = max(skip, take); take = nt; }
cout << max(take, skip);`,
    options: ['15', '18', '13'],
    answer: 0,
    note: 'Max non-adjacent sum (house robber) = 3+5+7 = 15.',
    difficulty: 'medium',
  },
  {
    code: `int a[] = {1, 3, 4}, reach = 1;
for (int x : a) reach |= reach << x;
cout << ((reach >> 7) & 1);`,
    options: ['1', '0', '7'],
    answer: 0,
    note: 'Bitset subset-sum: bit 7 is set, so 7 is reachable (3+4).',
    difficulty: 'hard',
  },
  {
    code: `int a[] = {1, 2, 3, 4, 5}, pre[6] = {0};
for (int i = 0; i < 5; i++) pre[i + 1] = pre[i] ^ a[i];
cout << (pre[4] ^ pre[1]);`,
    options: ['5', '1', '0'],
    answer: 0,
    note: 'Range XOR = pre[r+1]^pre[l]; a[1..3] = 2^3^4 = 5.',
    difficulty: 'medium',
  },

  // STL containers & bit tricks CP leans on
  {
    code: `multiset<int> s = {2, 2, 2, 5};
s.erase(s.find(2));
cout << s.count(2) << " ";
s.erase(2);
cout << s.count(2);`,
    options: ['2 0', '3 0', '2 1'],
    answer: 0,
    note: 'erase(iterator) removes one copy; erase(value) removes all copies.',
    difficulty: 'hard',
  },
  {
    code: `map<int,int> m;
m[5]++;
cout << m[3];
cout << m.size();`,
    options: ['02', '01', '00'],
    answer: 0,
    note: 'operator[] inserts a default 0 even on a read, so size becomes 2.',
    difficulty: 'hard',
  },
  {
    code: `vector<pair<int,int>> v = {{2, 1}, {1, 5}, {1, 2}};
sort(v.begin(), v.end());
cout << v[0].first << v[0].second;`,
    options: ['12', '15', '21'],
    answer: 0,
    note: 'Pairs sort by first, then second → the smallest is (1,2).',
    difficulty: 'medium',
  },
  {
    code: `stack<int> st;
st.push(1); st.push(2); st.push(3);
st.pop();
cout << st.top() << st.size();`,
    options: ['22', '32', '21'],
    answer: 0,
    note: 'Stack is LIFO: pop removes 3, so top is 2 and size is 2.',
    difficulty: 'easy',
  },
  {
    code: `queue<int> q;
q.push(1); q.push(2); q.push(3);
q.pop();
cout << q.front() << q.back();`,
    options: ['23', '13', '32'],
    answer: 0,
    note: 'Queue is FIFO: pop removes the front (1); front→2, back→3.',
    difficulty: 'easy',
  },
  {
    code: `deque<int> d;
d.push_back(1); d.push_front(2); d.push_back(3);
cout << d.front() << d.back() << d.size();`,
    options: ['233', '133', '213'],
    answer: 0,
    note: 'A deque grows at both ends: front 2, back 3, size 3.',
    difficulty: 'medium',
  },
  {
    code: `string s = "abcabc";
cout << s.find('c');
cout << s.find('c', 3);`,
    options: ['25', '22', '23'],
    answer: 0,
    note: 'find returns an index; the second arg is a start position → 2 then 5.',
    difficulty: 'medium',
  },
  {
    code: `cout << stoi("0042") << " " << stoi("12abc");`,
    options: ['42 12', '0042 12', '42 0'],
    answer: 0,
    note: 'stoi skips leading zeros and stops at the first non-digit → 42 and 12.',
    difficulty: 'medium',
  },
  {
    code: `int n = 12;
cout << (n & -n);`,
    options: ['4', '8', '2'],
    answer: 0,
    note: 'n & -n isolates the lowest set bit → 4 (the core of a Fenwick tree).',
    difficulty: 'hard',
  },
  {
    code: `int n = 16;
cout << (n & (n - 1));`,
    options: ['0', '16', '1'],
    answer: 0,
    note: 'n & (n-1) clears the lowest set bit; 0 means n is a power of two.',
    difficulty: 'medium',
  },
  {
    code: `cout << __builtin_clz(1);`,
    options: ['31', '32', '0'],
    answer: 0,
    note: '__builtin_clz counts leading zeros: 1 has 31 in a 32-bit int.',
    difficulty: 'hard',
  },
  {
    code: `cout << __lg(100);`,
    options: ['6', '7', '2'],
    answer: 0,
    note: '__lg(n) = ⌊log2 n⌋ = 6 for 100 (no cmath, no loop).',
    difficulty: 'medium',
  },
  {
    code: `cout << __builtin_ctz(48);`,
    options: ['4', '2', '5'],
    answer: 0,
    note: '__builtin_ctz counts trailing zeros: 48 = 110000 → 4.',
    difficulty: 'hard',
  },
  {
    code: `int a = 17, b = 5;
cout << (a + b - 1) / b;`,
    options: ['4', '3', '5'],
    answer: 0,
    note: 'Ceiling division without floats: (a+b-1)/b = ⌈17/5⌉ = 4.',
    difficulty: 'medium',
  },
  {
    code: `cout << __builtin_parity(7);`,
    options: ['1', '3', '0'],
    answer: 0,
    note: '__builtin_parity is 1 when the set-bit count is odd; 7 = 111 → 1.',
    difficulty: 'medium',
  },
  {
    code: `int mask = 13;
cout << ((mask >> 2) & 1) << ((mask >> 1) & 1);`,
    options: ['10', '01', '11'],
    answer: 0,
    note: '(mask>>i)&1 reads bit i; for 13 = 1101, bits 2 and 1 → "10".',
    difficulty: 'medium',
  },
  {
    code: `int a = 5, b = 9;
a ^= b; b ^= a; a ^= b;
cout << a << " " << b;`,
    options: ['9 5', '5 9', '0 0'],
    answer: 0,
    note: 'Three XORs swap two values without a temporary → 9 5.',
    difficulty: 'medium',
  },
  {
    code: `int a = 2000000000, b = 2000000002;
cout << a + (b - a) / 2;`,
    options: ['2000000001', '2000000000', '-147483647'],
    answer: 0,
    note: 'a+(b-a)/2 avoids the overflow of (a+b)/2 → 2000000001.',
    difficulty: 'medium',
  },
  {
    code: `int n = 5;
cout << (n << 3);`,
    options: ['40', '15', '8'],
    answer: 0,
    note: 'n << k multiplies by 2^k: 5 << 3 = 5·8 = 40.',
    difficulty: 'easy',
  },
  {
    code: `set<int> s = {5, 1, 3, 1, 4};
cout << *s.begin() << *s.rbegin() << s.size();`,
    options: ['154', '514', '155'],
    answer: 0,
    note: 'A set is sorted and deduped: min 1, max 5, size 4.',
    difficulty: 'medium',
  },
  {
    code: `char c = '7';
cout << c - '0';`,
    options: ['7', '55', '0'],
    answer: 0,
    note: "c - '0' converts a digit character to its value → 7.",
    difficulty: 'easy',
  },
  {
    code: `char c = 'a';
cout << (char)toupper(c);`,
    options: ['A', 'a', '65'],
    answer: 0,
    note: 'toupper returns an int, so cast to char to print "A".',
    difficulty: 'easy',
  },
  {
    code: `string s = "abc";
reverse(s.begin(), s.end());
cout << s;`,
    options: ['cba', 'abc', 'bca'],
    answer: 0,
    note: 'reverse() flips the string in place → "cba".',
    difficulty: 'easy',
  },
  {
    code: `string s = "dbca";
sort(s.begin(), s.end());
cout << s;`,
    options: ['abcd', 'dcba', 'dbca'],
    answer: 0,
    note: 'Sorting the characters normalizes it → "abcd" (handy for anagrams).',
    difficulty: 'medium',
  },
  {
    code: `string s = "hello";
s.erase(1, 2);
cout << s;`,
    options: ['hlo', 'heo', 'hll'],
    answer: 0,
    note: 'erase(pos, len) removes 2 chars from index 1 → "hlo".',
    difficulty: 'medium',
  },
  {
    code: `cout << (string("apple") < string("banana"));`,
    options: ['1', '0', 'a'],
    answer: 0,
    note: 'Strings compare lexicographically: "apple" < "banana" → 1.',
    difficulty: 'medium',
  },

  // ---- TLE CP-31 patterns (CF classics — the core observation of each) ----
  {
    code: `int w = 8;
cout << (w > 2 && w % 2 == 0 ? "YES" : "NO");`,
    options: ['YES', 'NO'],
    answer: 0,
    note: 'Splitting into two even parts needs an even number greater than 2 → 8 works. (TLE CP-31 · CF 4A Watermelon)',
    difficulty: 'easy',
  },
  {
    code: `long long n = 6, m = 6, a = 4;
cout << ((n + a - 1) / a) * ((m + a - 1) / a);`,
    options: ['1', '4', '9'],
    answer: 1,
    note: 'Tile with a×a squares: ceil(6/4) × ceil(6/4) = 2 × 2 = 4. (TLE CP-31 · CF 1A Theatre Square)',
    difficulty: 'medium',
  },
  {
    code: `int n = 5, m = 6;
cout << n * m / 2;`,
    options: ['30', '12', '15'],
    answer: 2,
    note: 'Each 1×2 domino covers 2 cells → floor(5×6/2) = 15. (TLE CP-31 · CF 50A Domino piling)',
    difficulty: 'easy',
  },
  {
    code: `int a[3][3] = {{1,1,0},{1,0,0},{1,1,1}}, cnt = 0;
for (int i = 0; i < 3; i++)
    if (a[i][0] + a[i][1] + a[i][2] >= 2) cnt++;
cout << cnt;`,
    options: ['2', '3', '1'],
    answer: 0,
    note: 'A problem is solved when at least 2 of 3 are sure → rows with sum ≥ 2 = 2. (TLE CP-31 · CF 231A Team)',
    difficulty: 'easy',
  },
  {
    code: `int a[] = {10,9,8,7,7,7,5,5}, k = 5, cnt = 0;
for (int x : a) if (x >= a[k - 1] && x > 0) cnt++;
cout << cnt;`,
    options: ['5', '6', '3'],
    answer: 1,
    note: 'Advance if score ≥ the k-th place and > 0 (ties count) → 6. (TLE CP-31 · CF 158A Next Round)',
    difficulty: 'medium',
  },
  {
    code: `int r = 2, c = 4;            // the lone 1 sits here (5×5, 1-indexed)
cout << abs(r - 3) + abs(c - 3);`,
    options: ['3', '1', '2'],
    answer: 2,
    note: 'Move the 1 to the center (3,3): |row-3| + |col-3| = 1 + 1 = 2. (TLE CP-31 · CF 263A Beautiful Matrix)',
    difficulty: 'easy',
  },
  {
    code: `string s = "RRGGBRRGG";
int c = 0;
for (int i = 1; i < s.size(); i++) if (s[i] == s[i - 1]) c++;
cout << c;`,
    options: ['4', '3', '5'],
    answer: 0,
    note: 'Minimum removals = number of adjacent equal stones = 4. (TLE CP-31 · CF 266A Stones on the Table)',
    difficulty: 'easy',
  },
  {
    code: `string s = "xxxyyy";
set<char> d(s.begin(), s.end());
cout << (d.size() % 2 == 0 ? "CHAT WITH HER!" : "IGNORE HIM!");`,
    options: ['IGNORE HIM!', 'CHAT WITH HER!'],
    answer: 1,
    note: 'Depends only on the count of distinct letters — even → her. Here 2 distinct → CHAT WITH HER!. (TLE CP-31 · CF 236A Boy or Girl)',
    difficulty: 'medium',
  },
  {
    code: `int x = 12;
cout << (x + 4) / 5;`,
    options: ['4', '2', '3'],
    answer: 2,
    note: 'The biggest step is 5, so minimum steps = ceil(x/5) = ceil(12/5) = 3. (TLE CP-31 · CF 617A Elephant)',
    difficulty: 'easy',
  },
  {
    code: `string s = "ahhellllo", t = "hello";
int j = 0;
for (char c : s) if (j < 5 && c == t[j]) j++;
cout << (j == 5 ? "YES" : "NO");`,
    options: ['YES', 'NO'],
    answer: 0,
    note: 'Greedy two-pointer: is "hello" a subsequence of the string? → YES. (TLE CP-31 · CF 58A Chat room)',
    difficulty: 'medium',
  },

  // ---- TLE CP-31 patterns, batch 2 (CF classics) ----
  {
    code: `int a[][2] = {{0,3},{2,5},{4,2},{4,0}};   // {exit, enter}
int cur = 0, mx = 0;
for (auto& s : a) { cur += s[1] - s[0]; mx = max(mx, cur); }
cout << mx;`,
    options: ['6', '3', '5'],
    answer: 0,
    note: 'Capacity = the maximum running occupancy (prefix-max over enter−exit) = 6. (TLE CP-31 · CF 116A Tram)',
    difficulty: 'medium',
  },
  {
    code: `string ops[] = {"++X", "X--", "X++"};
int x = 0;
for (string s : ops) x += (s[1] == '+' ? 1 : -1);
cout << x;`,
    options: ['0', '1', '2'],
    answer: 1,
    note: 'Each statement changes X by ±1; add them up → 1. (TLE CP-31 · CF 282A Bit++)',
    difficulty: 'easy',
  },
  {
    code: `string s = "hELLO";
int up = 0;
for (char c : s) if (isupper(c)) up++;
cout << (2 * up > (int)s.size() ? "HELLO" : "hello");`,
    options: ['HELLO', 'hello'],
    answer: 0,
    note: 'Uppercase letters are the majority (2·up > n), so print the word uppercase → HELLO. (TLE CP-31 · CF 59A Word)',
    difficulty: 'easy',
  },
  {
    code: `string s = "0010000000111";
cout << (s.find("0000000") != string::npos ||
         s.find("1111111") != string::npos ? "YES" : "NO");`,
    options: ['NO', 'YES'],
    answer: 1,
    note: 'Dangerous if a digit repeats 7+ times in a row → it contains "0000000" → YES. (TLE CP-31 · CF 96A Football)',
    difficulty: 'easy',
  },
  {
    code: `string a = "Hello", b = "hELLO";
for (char& c : a) c = tolower(c);
for (char& c : b) c = tolower(c);
cout << (a == b ? 0 : a < b ? -1 : 1);`,
    options: ['-1', '0', '1'],
    answer: 1,
    note: 'Compare case-insensitively: lowercase both → "hello" == "hello" → 0. (TLE CP-31 · CF 112A Petya and Strings)',
    difficulty: 'easy',
  },
  {
    code: `int n = 512, k = 4;
while (k--) n = (n % 10) ? n - 1 : n / 10;
cout << n;`,
    options: ['50', '51', '500'],
    answer: 0,
    note: 'Each step drops a trailing zero, else subtracts 1. After 4 steps 512 → 50. (TLE CP-31 · CF 977A Wrong Subtraction)',
    difficulty: 'easy',
  },
  {
    code: `string s = "ANDAAADA";
int a = count(s.begin(), s.end(), 'A');
cout << (a > (int)s.size() - a ? "Anton"
       : a < (int)s.size() - a ? "Danik" : "Friendship");`,
    options: ['Danik', 'Anton', 'Friendship'],
    answer: 1,
    note: 'Count each side; more A than D (5 vs 3) → Anton. (TLE CP-31 · CF 734A Anton and Danik)',
    difficulty: 'easy',
  },
  {
    code: `long long k = 4, w = 3, n = 17;
long long need = w * k * (k + 1) / 2;
cout << max(0LL, need - n);`,
    options: ['30', '13', '0'],
    answer: 1,
    note: 'The i-th banana costs w·i, so k of them cost w·k(k+1)/2 = 30; borrow the shortfall over n → 13. (TLE CP-31 · CF 546A Soldier and Bananas)',
    difficulty: 'easy',
  },
  {
    code: `string s = "3+2+1", d;
for (char ch : s) if (ch != '+') d += ch;
sort(d.begin(), d.end());
cout << d[0] << '+' << d[1] << '+' << d[2];`,
    options: ['++123', '3+2+1', '1+2+3'],
    answer: 2,
    note: 'Rearrange the sum non-decreasing: sort the digits, rejoin with + → 1+2+3. (TLE CP-31 · CF 339A Helpful Maths)',
    difficulty: 'medium',
  },
  {
    code: `int a[] = {2,1,2}, total = 5, s = 0, cnt = 0;
sort(a, a + 3, greater<int>());
for (int x : a) { s += x; cnt++; if (s * 2 > total) break; }
cout << cnt;`,
    options: ['3', '1', '2'],
    answer: 2,
    note: 'Grab the largest coins until your half beats the rest → 2 coins. (TLE CP-31 · CF 160A Twins)',
    difficulty: 'medium',
  },

  // ---- TLE CP-31 patterns, batch 3 (math · search · greedy, ~1000–1500) ----
  {
    code: `int a = 10, b = 4;
cout << (a % b == 0 ? 0 : b - a % b);`,
    options: ['0', '1', '2'],
    answer: 2,
    note: 'Add just enough to reach the next multiple of b: b − a%b = 2. (TLE CP-31 · CF 1328A Divisibility Problem)',
    difficulty: 'easy',
  },
  {
    code: `int n = 10;              // largest gcd(a, b) with 1 <= a < b <= n
cout << n / 2;           // best pair is (n/2, n)`,
    options: ['5', '10', '1'],
    answer: 0,
    note: 'The biggest gcd of a pair in [1,n] comes from (n/2, n) → n/2 = 5. (TLE CP-31 · CF 1370A Maximum GCD)',
    difficulty: 'medium',
  },
  {
    code: `int n = 20, r = 1;
for (int i = 0; i < n; i++) r = r * 5 % 100;
cout << r;`,
    options: ['5', '25', '0'],
    answer: 1,
    note: '5^n ends in 25 for every n >= 2 — keep only the last two digits each step and it locks at 25. (TLE CP-31 · CF 630A Again Twenty Five!)',
    difficulty: 'medium',
  },
  {
    code: `long long n = 10, k = 3;
long long odd = (n + 1) / 2;
cout << (k <= odd ? 2 * k - 1 : 2 * (k - odd));`,
    options: ['5', '6', '3'],
    answer: 0,
    note: 'First half are the odds, second half the evens — answer in O(1): k=3 → 5. (TLE CP-31 · CF 318A Even Odds)',
    difficulty: 'medium',
  },
  {
    code: `int a[] = {10, 6, 12, 20, 4}, k = 3, best = 1e9;
sort(a, a + 5);
for (int i = 0; i + k <= 5; i++) best = min(best, a[i + k - 1] - a[i]);
cout << best;`,
    options: ['10', '6', '8'],
    answer: 1,
    note: 'After sorting, the closest k values sit adjacent; smallest window range = 6. (TLE CP-31 · CF 337A Puzzles)',
    difficulty: 'medium',
  },
  {
    code: `int n = 5009, cnt = 0;
while (n) { if (n % 10) cnt++; n /= 10; }
cout << cnt;`,
    options: ['4', '2', '3'],
    answer: 1,
    note: 'Each nonzero digit is one round number (5000, 9), so the number of summands = count of nonzero digits = 2. (TLE CP-31 · CF 1352A Sum of Round Numbers)',
    difficulty: 'easy',
  },
  {
    code: `int a[] = {1, 3, 5, 7, 9};      // sorted
int x = 6;
cout << (upper_bound(a, a + 5, x) - a);`,
    options: ['2', '4', '3'],
    answer: 2,
    note: 'Count elements <= x on a sorted array in O(log n): upper_bound lands just past the last <= x → 3. (TLE CP-31 · CF 600B Queries about less or equal elements)',
    difficulty: 'medium',
  },
  {
    code: `long long x = 16;
long long r = (long long) sqrtl((long double) x);
bool prime = r > 1;
for (long long i = 2; i * i <= r; i++) if (r % i == 0) prime = false;
cout << (r * r == x && prime ? "YES" : "NO");`,
    options: ['YES', 'NO'],
    answer: 1,
    note: 'A T-prime has exactly 3 divisors <=> it is a prime squared; 16 = 4^2 but 4 is not prime → NO. (TLE CP-31 · CF 230B T-primes)',
    difficulty: 'medium',
  },
  {
    code: `int a[] = {4, 1, 2, 10}, l = 0, r = 3, s1 = 0, s2 = 0;
for (int t = 0; l <= r; t++) {
    int v = (a[l] >= a[r]) ? a[l++] : a[r--];
    if (t % 2 == 0) s1 += v; else s2 += v;
}
cout << s1;`,
    options: ['14', '10', '12'],
    answer: 2,
    note: 'Greedy: on your turn always take the larger end. The first player scores 12. (TLE CP-31 · CF 381A Sereja and Dima)',
    difficulty: 'medium',
  },
  {
    code: `int x[] = {1, 2, 5, 10, 13}, h[] = {2, 4, 5, 6, 1}, n = 5;
int last = -1000000, cnt = 0;
for (int i = 0; i < n; i++) {
    if (x[i] - h[i] > last) { cnt++; last = x[i]; }
    else if (i == n - 1 || x[i] + h[i] < x[i + 1]) { cnt++; last = x[i] + h[i]; }
    else last = x[i];
}
cout << cnt;`,
    options: ['4', '3', '2'],
    answer: 2,
    note: 'Fell each tree left if it clears the last stump, else right if it clears the next tree; the two ends always fall → 2 here. (TLE CP-31 · CF 545C Woodcutters)',
    difficulty: 'hard',
  },
]

// Option labels (a, b, c, … f). Puzzles allow 2–6 options.
export const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f']
